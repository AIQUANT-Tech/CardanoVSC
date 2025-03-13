import * as vscode from 'vscode';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';

let cardanoProcess: ChildProcessWithoutNullStreams | null = null;



 export async function runCardanoNode() {
    const topologyPath = await vscode.window.showInputBox({ prompt: "Enter Topology File Path" });
    const databasePath = await vscode.window.showInputBox({ prompt: "Enter Database Path" });
    const socketPath = await vscode.window.showInputBox({ prompt: "Enter Socket Path" });
    const port = await vscode.window.showInputBox({ prompt: "Enter Port", value: "3001" });
    const configPath = await vscode.window.showInputBox({ prompt: "Enter Config File Path" });

    if (!topologyPath || !databasePath || !socketPath || !port || !configPath) {
        vscode.window.showErrorMessage("All fields are required.");
        return;
    }

    // Open output channel for logs
    const outputChannel = vscode.window.createOutputChannel("Cardano Node");
    outputChannel.show(true);

    // Spawn Cardano Node Process
    cardanoProcess = spawn("cardano-node", [
        "run",
        "--topology", topologyPath,
        "--database-path", databasePath,
        "--socket-path", socketPath,
        "--port", port,
        "--config", configPath
    ], { cwd: vscode.workspace.rootPath });

    if (!cardanoProcess) {
        vscode.window.showErrorMessage("Failed to start Cardano Node.");
        return;
    }

    // Log process output
    cardanoProcess.stdout.on('data', (data) => outputChannel.append(data.toString()));
    cardanoProcess.stderr.on('data', (data) => outputChannel.append(data.toString()));

    // Handle process exit
    cardanoProcess.on('close', (code) => {
        outputChannel.appendLine(`Cardano Node process exited with code ${code}`);
        cardanoProcess = null;
    });
}

export function deactivate() {
    if (cardanoProcess) {
        cardanoProcess.kill();
    }
}
