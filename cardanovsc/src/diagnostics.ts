
import * as vscode from "vscode";
import * as path from "path";

export let diagnosticCollection =
  vscode.languages.createDiagnosticCollection("haskell");

export function parseCabalErrors(
  output: string,
  workspacePath: string,
  vscodeModule: typeof vscode = vscode,
  _diagCollection: vscode.DiagnosticCollection = diagnosticCollection
): vscode.Diagnostic[] {
  _diagCollection.clear();
  const diagnosticsMap: Map<string, vscode.Diagnostic[]> = new Map();
  let firstErrorUri: vscode.Uri | null = null;
  let firstErrorRange: vscode.Range | null = null;

  const errorRegex =
    /^\s*(?<file>.+):(?<line>\d+):(?<column>\d+):\s+(?<type>error|warning|info):\s+(?<message>[\s\S]+?)(?=\n\S|$)/gm;

  let match;
  while ((match = errorRegex.exec(output)) !== null) {
    const { file, line, column, type } = match.groups!;
    let message = match.groups!.message.trim();
    const severity = getDiagnosticSeverity(type, vscodeModule);

    const filePath = path.resolve(workspacePath, file);
    const fileUri = vscodeModule.Uri.file(filePath);

    const lineNum = parseInt(line) - 1;
    const colNum = parseInt(column) - 1;

    const document = vscodeModule.workspace.textDocuments.find(
      (doc) => doc.fileName === filePath
    );
    if (!document) {
      continue;
    }

    const lineText = document.lineAt(lineNum).text;
    const substringFromCol = lineText.substring(colNum);
    let nextSpaceIndex = substringFromCol.indexOf(" ");
    if (nextSpaceIndex === -1) {
      nextSpaceIndex = substringFromCol.length;
    }

    let errorLength = nextSpaceIndex;
    if (substringFromCol.startsWith("import")) {
      errorLength = substringFromCol.length;
    }

    const range = new vscodeModule.Range(
      lineNum,
      colNum,
      lineNum,
      colNum + errorLength
    );
    const diagnostic = new vscodeModule.Diagnostic(range, message, severity);

    if (!diagnosticsMap.has(fileUri.fsPath)) {
      diagnosticsMap.set(fileUri.fsPath, []);
    }
    diagnosticsMap.get(fileUri.fsPath)?.push(diagnostic);

    if (
      firstErrorUri === null &&
      severity === vscodeModule.DiagnosticSeverity.Error
    ) {
      firstErrorUri = fileUri;
      firstErrorRange = range;
    }
  }

  for (const [file, diagnostics] of diagnosticsMap.entries()) {
    _diagCollection.set(vscodeModule.Uri.file(file), diagnostics);
  }

  if (firstErrorUri && firstErrorRange) {
    vscodeModule.workspace.openTextDocument(firstErrorUri).then((doc) => {
      vscodeModule.window.showTextDocument(doc, { selection: firstErrorRange });
    });
  }

  return Array.from(diagnosticsMap.values()).flat();
}

function getDiagnosticSeverity(
  severity: string,
  vscodeModule: typeof vscode
): vscode.DiagnosticSeverity {
  switch (severity) {
    case "error":
      return vscodeModule.DiagnosticSeverity.Error;
    case "warning":
      return vscodeModule.DiagnosticSeverity.Warning;
    case "info":
      return vscodeModule.DiagnosticSeverity.Information;
    default:
      return vscodeModule.DiagnosticSeverity.Error;
  }
}