import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getWebviewContent } from './webview';
import { getDatumFlag, getNetworkFlag } from './utils';

const execAsync = promisify(exec);

export function startCardanoCli(context: vscode.ExtensionContext) {
    const panel = vscode.window.createWebviewPanel(
        'cardanoCli',
        'Cardano CLI Terminal',
        vscode.ViewColumn.One,
        { enableScripts: true, retainContextWhenHidden: true }
    );

    panel.webview.html = getWebviewContent();

    panel.webview.onDidReceiveMessage(async (message) => {
        switch (message.command) {
            case 'executeCommand':
                await executeCommand(message.command, panel);
                break;

            case 'buildTransaction':
                await buildTransaction(message, panel);
                break;
        }
    }, undefined, context.subscriptions);
}

async function executeCommand(command: string, panel: vscode.WebviewPanel) {
    try {
        const { stdout, stderr } = await execAsync(command);
        panel.webview.postMessage({ command: 'output', data: stderr || stdout, type: stderr ? 'error' : 'success' });
    } catch (error: any) {
        panel.webview.postMessage({ command: 'output', data: error.message, type: 'error' });
    }
}

async function buildTransaction(message: any, panel: vscode.WebviewPanel) {
    const { txIn, txScript, changeAddr, signingKeyFile, collaterals, redeemer, networkType, datumType, datumPath, othersCommand } = message;
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    const networkFlag = getNetworkFlag(networkType);
    const datumFlag = getDatumFlag(datumType, datumPath);

    if (!networkFlag || !datumFlag) {
        panel.webview.postMessage({ command: 'output', data: 'Invalid network or datum type.', type: 'error' });
        return;
    }

    const buildCmd = `cardano-cli conway transaction build \
        ${networkFlag} --tx-in ${txIn} --tx-in-script-file ${txScript} \
        ${datumFlag} --tx-in-redeemer-file ${redeemer} \
        --tx-in-collateral ${collaterals} --change-address $(< ${changeAddr}) \
        --out-file tx_${timestamp}.raw ${othersCommand}`;

    try {
        await execAsync(buildCmd);
        panel.webview.postMessage({ command: 'output', data: 'Transaction built successfully.', type: 'success' });

        const signCmd = `cardano-cli conway transaction sign --tx-body-file tx_${timestamp}.raw \
            --signing-key-file ${signingKeyFile} ${networkFlag} --out-file tx_${timestamp}.signed`;

        await execAsync(signCmd);
        panel.webview.postMessage({ command: 'output', data: 'Transaction signed successfully.', type: 'success' });

        const submitCmd = `cardano-cli conway transaction submit ${networkFlag} --tx-file tx_${timestamp}.signed`;
        await execAsync(submitCmd);

        panel.webview.postMessage({ command: 'output', data: 'Transaction submitted successfully.', type: 'success' });
    } catch (error: any) {
        panel.webview.postMessage({ command: 'output', data: error.message, type: 'error' });
    }
}
