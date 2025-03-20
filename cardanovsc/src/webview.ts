import * as vscode from 'vscode';

export function createWebviewPanel(context: vscode.ExtensionContext) {
    const panel = vscode.window.createWebviewPanel(
        'cardanoWallet',
        'Cardano Wallet Connection',
        vscode.ViewColumn.One,
        {
            enableScripts: true, // Allow JavaScript execution
        }
    );

    panel.webview.html = getWebviewContent(panel);

    panel.webview.onDidReceiveMessage(async (message) => {
        if (message.command === 'openInBrowser') {
            const url = message.url;
            vscode.env.openExternal(vscode.Uri.parse(url));
        }
    });

    return panel;
}

function getWebviewContent(panel: vscode.WebviewPanel) {
    const externalUrl = 'https://your-dapp.example.com'; // Replace with your hosted page

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cardano Wallet</title>
        </head>
        <body>
            <h2>Connect to Cardano Wallet</h2>
            <button id="connect">Connect</button>
            <button id="openBrowser">Open in Browser</button>
            <pre id="walletData"></pre>

            <script>
                const vscode = acquireVsCodeApi();

                document.getElementById('connect').addEventListener('click', async () => {
                    if (window.cardano && window.cardano.nami) {
                        try {
                            await window.cardano.nami.enable();
                            const address = await window.cardano.nami.getUsedAddresses();
                            document.getElementById('walletData').innerText = JSON.stringify(address, null, 2);
                        } catch (err) {
                            alert("Error connecting to wallet: " + err.message);
                        }
                    } else {
                        alert("Wallet not detected! Opening in browser...");
                        vscode.postMessage({ command: 'openInBrowser', url: '${externalUrl}' });
                    }
                });

                document.getElementById('openBrowser').addEventListener('click', () => {
                    vscode.postMessage({ command: 'openInBrowser', url: '${externalUrl}' });
                });
            </script>
        </body>
        </html>
    `;
}
