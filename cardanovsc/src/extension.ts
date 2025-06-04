import { extensionCommand } from "./registerCommand";
import vscode from "vscode";
import { haskellProvider } from "./completion";
import { integrateCardanoAPI } from "./config/cardanoApiIntegration";
import { MyWebviewViewProvider } from "./webviewProvider";
import {
  createStatusBarItem,
  registerDeleteNetworkCommand,
  registerNetworkCommand,
} from "./config/cardanoNodeIntegration";
import { data } from "./export_data/data";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
const FOLDER_NAME = "deploy"; 
const GIT_URL = "https://github.com/aiquant2/deploy.git"; 
export function activate(context: vscode.ExtensionContext) {
  console.log("ext");
  const activeDoc = vscode.window.activeTextEditor?.document;
  if (activeDoc?.languageId === "haskell") {
    tryCloneIfNeeded(activeDoc);
  }
  vscode.workspace.onDidOpenTextDocument(async (document) => {
    if (document.languageId !== "haskell") {
      return;
    }
    await tryCloneIfNeeded(document);
  });
  context.subscriptions.push(
    vscode.commands.registerCommand("cardanovsc.compile", async () => {
      await runMain();
    })
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      MyWebviewViewProvider.viewType,
      new MyWebviewViewProvider(context, context.extensionUri)
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("cardanovsc.helloWorld", () => {
      vscode.window.showInformationMessage("Hello World from CardanoVSC!");
    })
  );
  context.subscriptions.push(haskellProvider);
  context.subscriptions.push(
    vscode.commands.registerCommand("cardano.apiIntegration", async () => {
      const valid = await integrateCardanoAPI(vscode, context);
    })
  );
  new extensionCommand(context);
  //status bar
  createStatusBarItem(context);
  registerNetworkCommand(context, context.extensionUri);
  registerDeleteNetworkCommand(context, context.extensionUri);

  return data(context);
}
export function deactivate() {}

async function tryCloneIfNeeded(document: vscode.TextDocument) {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showWarningMessage(
      "Please open a workspace to enable cloning."
    );
    return;
  }

  const vscodeDir = path.join(workspaceFolder.uri.fsPath, ".vscode");
  const targetDir = path.join(vscodeDir, FOLDER_NAME);

  // If folder already exists, do nothing
  if (fs.existsSync(targetDir)) {
    console.log(`Folder already exists: ${targetDir}`);
    return;
  }

  try {
    // Make sure .vscode folder exists
    if (!fs.existsSync(vscodeDir)) {
      fs.mkdirSync(vscodeDir, { recursive: true });
    }

    vscode.window.showInformationMessage(`Cloning into ${targetDir}...`);

    exec(`git clone ${GIT_URL} "${targetDir}"`, (error, stdout, stderr) => {
      if (error) {
        vscode.window.showErrorMessage(
          `Failed to clone repo: ${stderr || error.message}`
        );
      } else {
        vscode.window.showInformationMessage(
          `Successfully cloned into ${targetDir}`
        );
      }
    });
  } catch (err: any) {
    vscode.window.showErrorMessage(
      `Error creating target folder: ${err.message}`
    );
  }
}

import { parseCabalErrors } from "./diagnostics"; // adjust import as needed

const diagnosticCollection =
  vscode.languages.createDiagnosticCollection("haskell");

const outputChannel = vscode.window.createOutputChannel("Haskell Compilation");

export async function runMain() {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showWarningMessage("No workspace folder found.");
    return;
  }

  const deployPath = path.join(workspaceFolder.uri.fsPath, ".vscode", "deploy");
  if (!fs.existsSync(deployPath)) {
    vscode.window.showErrorMessage(`Deploy folder not found: ${deployPath}`);
    return;
  }

  const command = `cabal run main`;

  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Compiling Haskell Contract...",
      cancellable: false,
    },
    async () => {
      outputChannel.clear();
      outputChannel.show(true);
      outputChannel.appendLine(`> Running in ${deployPath}`);
      outputChannel.appendLine(`> ${command}\n`);

      exec(command, { cwd: deployPath }, async (error, stdout, stderr) => {
        const output = stdout + "\n" + stderr;

        output.split("\n").forEach((line) => {
          if (/error:/i.test(line)) {
            outputChannel.appendLine(`[❌ ERROR] ${line}`);
          } else if (/warning:/i.test(line)) {
            outputChannel.appendLine(`[⚠️ WARNING] ${line}`);
          } else {
            outputChannel.appendLine(line);
          }
        });

        parseCabalErrors(
          output,
          workspaceFolder.uri.fsPath,
          vscode,
          diagnosticCollection
        );

        if (error) {
          vscode.window.showErrorMessage(
            "Compilation failed. See Problems tab and Output panel."
          );
          return;
        }

        vscode.window.showInformationMessage(
          "Contract compiled and ran successfully!"
        );

        const validatorPath = path.join(
          workspaceFolder.uri.fsPath,
          "output",
          "myValidator.plutus"
        );
        if (fs.existsSync(validatorPath)) {
          try {
            const scriptContent = fs.readFileSync(validatorPath, "utf8");
            outputChannel.appendLine("\n✅ The script of contract is:\n");
            outputChannel.appendLine(scriptContent);
          } catch (readErr: any) {
            outputChannel.appendLine(
              `❌ Failed to read validator script: ${readErr.message}`
            );
          }
        } else {
          outputChannel.appendLine(
            `❌ Validator script not found at: ${validatorPath}`
          );
        }
      });
    }
  );
}
