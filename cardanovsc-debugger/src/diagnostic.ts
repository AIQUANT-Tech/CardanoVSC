
import * as vscode from "vscode";
import * as path from "path";
 
export const diagnosticCollection = vscode.languages.createDiagnosticCollection("haskell");
 
 
 
export function parseCabalErrors(output: string, workspacePath: string) {
    diagnosticCollection.clear();
    const diagnosticsMap: Map<string, vscode.Diagnostic[]> = new Map();
    let firstErrorUri: vscode.Uri | null = null;
    let firstErrorRange: vscode.Range | null = null;
  
    const errorRegex = /^(?<file>.+):(?<line>\d+):(?<column>\d+):\s+(?<type>error|warning|info):\s+(?<message>[\s\S]+?)(?=\n\S|$)/gm;
  
    let match;
    let extractedContent;
    while ((match = errorRegex.exec(output)) !== null) {
      const { file, line, column, type } = match.groups!;
      let message = match.groups!.message.trim();
  
      const severity = getDiagnosticSeverity(type);
      const filePath = path.resolve(workspacePath, file);
      const fileUri = vscode.Uri.file(filePath);
  
      const lineNum = parseInt(line) - 1;
      const colNum = parseInt(column) - 1;
  
      // Fetch the actual line text from the source file
      const document= vscode.workspace.textDocuments.find(doc => doc.fileName === filePath);
      if (!document) {
          console.error(`Document not found for file: ${filePath}`);
          continue;
      }
 
      const lineText = document.lineAt(lineNum).text;
          // Extract and log content from message up to lineText
    const startIdx = output.indexOf(message);
    const endIdx = output.indexOf(lineText, startIdx);
    
    if (startIdx !== -1 && endIdx !== -1) {
         extractedContent = output.substring(startIdx, endIdx + lineText.length);
        console.log("Extracted Content:", extractedContent);
    } else {
      extractedContent="no suggestion";
        console.warn("Could not extract full range.");
    }
    message = extractedContent
    .split("\n")
    .filter(line => !/^\s*\d*\s*\|/.test(line)) // Remove lines with optional number + "|"
    .join("\n");
 
  
      // Find the next space after the column number
      const substringFromCol = lineText.substring(colNum);
      
      let nextSpaceIndex = substringFromCol.indexOf(' ');
      if (nextSpaceIndex === -1) {
          nextSpaceIndex = substringFromCol.length; // If no space is found, use the entire substring
      }
 
      // Calculate the error length
      let errorLength = nextSpaceIndex;
      if (substringFromCol.startsWith("import")) {
            errorLength=substringFromCol.length;
      }
      // Adjust the range to cover the entire error word
      const range = new vscode.Range(lineNum, colNum, lineNum, colNum + errorLength);
 
     
      const diagnostic = new vscode.Diagnostic(range, message, severity);
  
      if (!diagnosticsMap.has(fileUri.fsPath)) {
        diagnosticsMap.set(fileUri.fsPath, []);
      }
      diagnosticsMap.get(fileUri.fsPath)?.push(diagnostic);
  
      if (firstErrorUri === null && severity === vscode.DiagnosticSeverity.Error) {
        firstErrorUri = fileUri;
        firstErrorRange = range;
      }
    }
  
    for (const [file, diagnostics] of diagnosticsMap.entries()) {
      diagnosticCollection.set(vscode.Uri.file(file), diagnostics);
    }
  
    if (firstErrorUri && firstErrorRange) {
      vscode.workspace.openTextDocument(firstErrorUri).then((doc) => {
        vscode.window.showTextDocument(doc, { selection: firstErrorRange });
      });
    }
  }
 
function getDiagnosticSeverity(severity: string): vscode.DiagnosticSeverity {
    switch (severity) {
        case "error":
            return vscode.DiagnosticSeverity.Error;
        case "warning":
            return vscode.DiagnosticSeverity.Warning;
        case "info":
            return vscode.DiagnosticSeverity.Information;
        default:
            return vscode.DiagnosticSeverity.Error;
    }
}
 
  
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
 
let ghcidProcess: ChildProcessWithoutNullStreams | undefined;
let statusBarItem: vscode.StatusBarItem;
let errorDecorationType: vscode.TextEditorDecorationType;
 
 
export function startGhcidOnHaskellOpen(context: vscode.ExtensionContext) {
 
    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = 'Haskell';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
 
    // Create error decoration type
    errorDecorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(255,0,0,0.1)',
        overviewRulerColor: 'rgba(255,0,0,0.5)',
        overviewRulerLane: vscode.OverviewRulerLane.Right,
        gutterIconSize: 'contain'
    });
    context.subscriptions.push(errorDecorationType);
 
    context.subscriptions.push(diagnosticCollection);
 
    // Check active document on startup
    if (vscode.window.activeTextEditor?.document.languageId === 'haskell') {
        startGhcidIfNeeded();
    }
 
    // Cleanup on deactivation
    context.subscriptions.push({
        dispose: () => {
            stopGhcid();
            diagnosticCollection.clear();
        },
    });
 
    // Update decorations when active editor changes
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(updateErrorDecorations)
    );
}
 
export function startGhcidIfNeeded() {
    if (!ghcidProcess) {
        runGhcid();
    }
}
 
function stopGhcid() {
    if (ghcidProcess) {
        ghcidProcess.kill();
        ghcidProcess = undefined;
    }
    statusBarItem.text = 'Haskell';
    statusBarItem.tooltip = undefined;
}
 
let buffer = '';
 
function runGhcid() {
    stopGhcid(); // Ensure any existing process is stopped
 
    const rootPath = vscode.workspace.rootPath;
    if (!rootPath) {
        vscode.window.showErrorMessage('No workspace folder open');
        return;
    }
 
    try {
        ghcidProcess = spawn('ghcid', ['--command', 'cabal repl'], {
            cwd: rootPath,
            shell: true // Helps with command lookup on Windows
        });
 
        statusBarItem.text = 'Haskell $(sync~spin)';
        statusBarItem.tooltip = 'Haskell GHCi is running';
 
        ghcidProcess.stdout.on('data', (data) => {
            buffer += data.toString();
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Save incomplete line for next chunk
 
            processGhcidOutput(lines);
        });
 
        ghcidProcess.stderr.on('data', (data) => {
            statusBarItem.text = 'Haskell $(error)';
            statusBarItem.tooltip = 'Haskell GHCi encountered an error';
        });
 
        ghcidProcess.on('error', (err) => {
            vscode.window.showErrorMessage(`Failed to start ghcid: ${err.message}`);
            statusBarItem.text = 'Haskell $(error)';
            statusBarItem.tooltip = 'Failed to start GHCi';
        });
 
        ghcidProcess.on('close', (code) => {
            ghcidProcess = undefined;
            statusBarItem.text = 'Haskell $(stop)';
            statusBarItem.tooltip = 'Haskell GHCi is not running';
        });
 
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to run ghcid: ${error}`);
        statusBarItem.text = 'Haskell $(error)';
        statusBarItem.tooltip = 'Failed to start GHCi';
    }
}
 
function processGhcidOutput(lines: string[]) {
    const diagnosticsMap: Map<string, vscode.Diagnostic[]> = new Map();
    let currentError: {
        file: string;
        line: number;
        col: number;
        severity: vscode.DiagnosticSeverity;
        message: string[];
    } | null = null;
 
    // const flushCurrentError = () => {
    //     if (!currentError) return;
 
    //     const filePath = path.resolve(vscode.workspace.rootPath || '', currentError.file);
    //     const fileUri = vscode.Uri.file(filePath);
    //     const lineNum = Math.max(0, currentError.line - 1);
    //     const colNum = Math.max(0, currentError.col - 1);
 
    //     // Create range - we'll try to get a better one if the document is open
    //     let range = new vscode.Range(lineNum, colNum, lineNum, colNum + 1);
 
    //     // Try to find the document to get more accurate range
    //     const document = vscode.workspace.textDocuments.find(doc =>
    //         doc.uri.fsPath === fileUri.fsPath
    //     );
        
    //     if (document) {
    //         try {
    //             const lineText = document.lineAt(lineNum).text;
    //             let endCol = colNum + 1;
    //             // Try to find the end of the identifier
    //             while (endCol < lineText.length && !/\s/.test(lineText[endCol])) {
    //                 endCol++;
    //             }
    //             range = new vscode.Range(lineNum, colNum, lineNum, endCol);
    //         } catch {
    //             // Line number might be out of bounds, use default range
    //         }
    //     }
 
    //     const cleanedMessage = currentError.message
    //         .filter(line => !/^\s*\d+\s*\|/.test(line)) // Remove code context lines
    //         .join('\n')
    //         .trim();
 
    //     const diagnostic = new vscode.Diagnostic(
    //         range,
    //         cleanedMessage,
    //         currentError.severity
    //     );
    //     diagnostic.source = 'ghcid';
    //     diagnostic.code = 'ghcid';
 
    //     const existing = diagnosticsMap.get(fileUri.fsPath) || [];
    //     existing.push(diagnostic);
    //     diagnosticsMap.set(fileUri.fsPath, existing);
 
    //     currentError = null;
    // };

  
      const flushCurrentError = () => {
          if (!currentError) return;
  
          const filePath = path.resolve(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '', currentError.file);
          const fileUri = vscode.Uri.file(filePath);
          const lineNum = Math.max(0, currentError.line - 1);
          const colNum = Math.max(0, currentError.col - 1);
  
          // Try to find the document to get the line text
          const document = vscode.workspace.textDocuments.find(doc => 
              doc.uri.fsPath === fileUri.fsPath
          );
  
          let range: vscode.Range;
          let cleanedMessage = currentError.message
              .filter(line => !/^\s*\d+\s*\|/.test(line)) // Remove code context lines
              .join('\n')
              .trim();
  
          if (document) {
              try {
                  const lineText = document.lineAt(lineNum).text;
                  
                  // Special handling for import statements
                  if (lineText.trim().startsWith("import")) {
                      // Highlight the entire import statement including "import" keyword
                      const importStart = lineText.indexOf("import");
                      range = new vscode.Range(
                          lineNum, 
                          importStart,
                          lineNum,
                          lineText.length
                      );
  
                      // Keep the original message but add "Import error" prefix
                      cleanedMessage = `Import error: ${cleanedMessage}`;
                  } else {
                      // Default behavior for non-import errors
                      let endCol = colNum + 1;
                      // Try to find the end of the identifier
                      while (endCol < lineText.length && !/\s/.test(lineText[endCol])) {
                          endCol++;
                      }
                      range = new vscode.Range(lineNum, colNum, lineNum, endCol);
                  }
              } catch {
                  // Fallback if line number is out of bounds
                  range = new vscode.Range(lineNum, colNum, lineNum, colNum + 1);
              }
          } else {
              // Fallback if document not found
              range = new vscode.Range(lineNum, colNum, lineNum, colNum + 1);
          }
  
          const diagnostic = new vscode.Diagnostic(
              range,
              cleanedMessage,
              currentError.severity
          );
          diagnostic.source = 'ghcid';
          diagnostic.code = 'ghcid';
  
          const existing = diagnosticsMap.get(fileUri.fsPath) || [];
          existing.push(diagnostic);
          diagnosticsMap.set(fileUri.fsPath, existing);
  
          currentError = null;
      };
  
  
  
    let hasErrors = false;
 
    for (const line of lines) {
        if (line.includes('All good')) {
            statusBarItem.text = 'Haskell $(check)';
            statusBarItem.tooltip = 'Haskell: No errors';
            diagnosticCollection.clear();
            updateErrorDecorations();
            return;
        }
 
        if (line.includes('Loading...') || line.includes('Ok, modules loaded:')) {
            continue;
        }
 
        // More comprehensive error pattern matching
        const errorMatch = line.match(/^(.+?):(\d+):(\d+)(?:-(\d+))?:\s*(error|warning|\[error\]|\[warning\]):?\s*(.*)/);
        if (errorMatch) {
            flushCurrentError();
            hasErrors = true;
 
            currentError = {
                file: errorMatch[1],
                line: parseInt(errorMatch[2]),
                col: parseInt(errorMatch[3]),
                severity: errorMatch[5].toLowerCase().includes('error')
                    ? vscode.DiagnosticSeverity.Error
                    : vscode.DiagnosticSeverity.Warning,
                message: [errorMatch[6].trim()]
            };
        } else if (currentError && line.trim()) {
            currentError.message.push(line.trim());
        }
    }
 
    flushCurrentError();
 
    if (hasErrors) {
        statusBarItem.text = 'Haskell $(error)';
        statusBarItem.tooltip = 'Haskell: Errors detected';
        
        // Update diagnostics
        diagnosticCollection.clear();
        diagnosticsMap.forEach((diags, file) => {
            diagnosticCollection.set(vscode.Uri.file(file), diags);
        });
    }
 
    updateErrorDecorations();
}
 
function updateErrorDecorations() {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor || activeEditor.document.languageId !== 'haskell') {
        return;
    }
 
    const diagnostics = diagnosticCollection.get(activeEditor.document.uri) || [];
    const errorRanges = diagnostics
        .filter(d => d.severity === vscode.DiagnosticSeverity.Error)
        .map(d => d.range);
 
    activeEditor.setDecorations(errorDecorationType, errorRanges);
}
 