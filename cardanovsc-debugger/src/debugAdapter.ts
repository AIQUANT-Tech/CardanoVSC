
import {
    DebugSession,
    InitializedEvent,
    OutputEvent,
    TerminatedEvent,
  } from "vscode-debugadapter";
  import { DebugProtocol } from "vscode-debugprotocol";
  import * as child_process from "child_process";
  import * as vscode from "vscode";
  import * as fs from "fs/promises";
  import { diagnosticCollection, parseCabalErrors } from "./diagnostic";
  
  interface HaskellLaunchRequestArguments
    extends DebugProtocol.LaunchRequestArguments {
    program?: string;
    stopOnEntry?: boolean;
    showIO?: boolean;
    runMain?: boolean;
    runFunction?: string;
    activeFile?: string;
    cabalProjectRoot?: string;
    cwd?: string;
    loadDebounceDelay?: number;
  }
  
  export class HaskellDebugSession extends DebugSession {
    private ghciProcess: child_process.ChildProcess | undefined;
    private isFileLoaded = false;
    private loadDebounceTimer: NodeJS.Timeout | undefined;
    private lastLoadedFileContent: string | undefined;
    private launchArgs: HaskellLaunchRequestArguments | undefined;
    private isRestarting = false;
  
    public constructor() {
      super();
      this.setDebuggerLinesStartAt1(true);
      this.setDebuggerColumnsStartAt1(true);
    }
  
    protected initializeRequest(
      response: DebugProtocol.InitializeResponse,
      args: DebugProtocol.InitializeRequestArguments
    ): void {
      response.body = response.body || {};
      response.body.supportsConfigurationDoneRequest = true;
      response.body.supportsEvaluateForHovers = true;
      response.body.supportsFunctionBreakpoints = true;
      response.body.supportsRestartRequest = true;
      this.sendResponse(response);
      this.sendEvent(new InitializedEvent());
    }
  
    public async launchRequest(
      response: DebugProtocol.LaunchResponse,
      args: HaskellLaunchRequestArguments
    ): Promise<void> {
      try {
        let stdoutBuffer = "";
        let stderrBuffer = "";
        diagnosticCollection.clear();
        const editor = vscode.window.activeTextEditor;
        args.activeFile = editor?.document.fileName;
        this.launchArgs = args;
  
        const programCommand = args.program?.trim();
        const workspaceFolder =
          args.cwd || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  
        if (!programCommand || !programCommand.startsWith("cabal repl")) {
          this.sendEvent(
            new OutputEvent(
              'Please set "program": "cabal repl --repl-no-load" in launch.json\n',
              'console'
            )
          );
          this.sendResponse(response);
          return;
        }
  
        if (!workspaceFolder) {
          this.sendEvent(new OutputEvent("No workspace folder found\n", 'stderr'));
          this.sendResponse(response);
          return;
        }
  
        // Clean up existing process if any
        this.cleanupProcess();
  
        const [cmd, ...cmdArgs] = programCommand.split(" ");
  
        this.sendEvent(new OutputEvent("Launching GHCi...\n", 'console'));
  
        this.ghciProcess = child_process.spawn(cmd, cmdArgs, {
          cwd: workspaceFolder,
          shell: true,
        });
  
        if (!this.ghciProcess.stdout || !this.ghciProcess.stderr) {
          throw new Error("Failed to spawn GHCi process with proper stdio streams");
        }
  
        this.ghciProcess.stdout.on("data", (data: Buffer) => {
          const text = data.toString();
          stdoutBuffer += text;
          this.sendEvent(new OutputEvent(text, 'stdout'));
  
          if (
            (text.includes("Prelude>") ||
              text.includes("*Main>") ||
              text.includes("Ok,")) &&
            !this.isFileLoaded
          ) {
            if (args.activeFile) {
              this.loadHaskellFile(args.activeFile);
            }
          }
        });
  
        this.ghciProcess.stderr.on("data", (data: Buffer) => {
          const text = data.toString();
          stderrBuffer += text;
          parseCabalErrors(stdoutBuffer + stderrBuffer, workspaceFolder);
          this.sendEvent(new OutputEvent(text, 'stderr'));
        });
        
        this.ghciProcess.on("error", (err) => {
          this.sendEvent(new OutputEvent(`GHCi process error: ${err.message}\n`, 'stderr'));
          this.sendEvent(new TerminatedEvent());
        });
  
        this.ghciProcess.on("exit", (code) => {
          if (!this.isRestarting) {
            this.sendEvent(
              new OutputEvent(`GHCi exited with code ${code}\n`, 'console')
            );
            this.sendEvent(new TerminatedEvent());
          }
        });
        
        if (args.activeFile) {
          await this.loadHaskellFile(args.activeFile);
        }
  
        this.sendResponse(response);
      } catch (error) {
        this.sendErrorResponse(response, {
          id: 1001,
          format: `Failed to launch debug session: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }
  
    private cleanupProcess(): void {
      if (this.ghciProcess) {
        this.ghciProcess.removeAllListeners();
        this.ghciProcess.kill("SIGKILL");
        this.ghciProcess = undefined;
      }
    }
  
    protected async restartRequest(
      response: DebugProtocol.RestartResponse,
      args: DebugProtocol.RestartArguments
    ): Promise<void> {
      try {
        this.isRestarting = true;
        this.sendEvent(new OutputEvent("Restarting debug session...\n"));
  
        // Clean up existing process
        this.cleanupProcess();
  
        // Reset state
        this.isFileLoaded = false;
        this.lastLoadedFileContent = undefined;
  
        if (this.loadDebounceTimer) {
          clearTimeout(this.loadDebounceTimer);
          this.loadDebounceTimer = undefined;
        }
  
        // Start a new session
        if (this.launchArgs) {
          await this.launchRequest(response, this.launchArgs);
        } else {
          this.sendErrorResponse(response, {
            id: 1004,
            format: "Cannot restart: No previous launch configuration available",
          });
        }
      } finally {
        this.isRestarting = false;
      }
    }
  
    private async loadHaskellFile(filePath: string): Promise<void> {
      if (!this.ghciProcess) return;
  
      if (this.loadDebounceTimer) {
        clearTimeout(this.loadDebounceTimer);
        this.loadDebounceTimer = undefined;
      }
  
      try {
        const currentContent = await fs.readFile(filePath, "utf8");
        if (currentContent === this.lastLoadedFileContent && this.isFileLoaded) {
          this.sendEvent(
            new OutputEvent(`No changes in ${filePath}, skipping reload.\n`)
          );
          return;
        }
  
        this.lastLoadedFileContent = currentContent;
  
        if (!filePath.endsWith(".hs")) {
          this.sendEvent(
            new OutputEvent("File must be a Haskell source file (.hs)\n", 'stderr')
          );
          return;
        }
  
        const debounceDelay = this.launchArgs?.loadDebounceDelay ?? 300;
        this.loadDebounceTimer = setTimeout(() => {
          this.sendEvent(new OutputEvent(`Loading Haskell file: ${filePath}\n`));
          this.ghciProcess?.stdin?.write(`:l ${filePath}\n`);
          this.isFileLoaded = true;
          this.loadDebounceTimer = undefined;
        }, debounceDelay);
      } catch (error) {
        this.sendEvent(new OutputEvent(`Error loading file: ${error instanceof Error ? error.message : String(error)}\n`, 'stderr'));
      }
    }
  
    protected evaluateRequest(
      response: DebugProtocol.EvaluateResponse,
      args: DebugProtocol.EvaluateArguments
    ): void {
      try {
        if (!this.ghciProcess) {
          throw new Error("GHCi process not running");
        }
  
        const expression = args.expression;
        if (!expression.trim()) {
          throw new Error("Empty expression");
        }
  
        this.ghciProcess.stdin?.write(`${expression}\n`);
  
        response.body = {
          result: `Evaluating: ${expression}`,
          variablesReference: 0,
        };
        this.sendResponse(response);
      } catch (error) {
        this.sendErrorResponse(response, {
          id: 1003,
          format: `Evaluation failed: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }
  
    protected disconnectRequest(
      response: DebugProtocol.DisconnectResponse,
      args: DebugProtocol.DisconnectArguments
    ): void {
      if (this.loadDebounceTimer) {
        clearTimeout(this.loadDebounceTimer);
        this.loadDebounceTimer = undefined;
      }
      
      this.cleanupProcess();
      this.sendEvent(new TerminatedEvent());
      this.sendResponse(response);
    }
  }
  