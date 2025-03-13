export function getWebviewContent(): string {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Cardano CLI Terminal</title>
            <style>
                body { font-family: Arial; padding: 20px; }
                .output { background: #1e1e1e; color: #fff; padding: 10px; border-radius: 5px; height: 300px; overflow-y: auto; margin-bottom: 20px; }
                .input { width: 100%; padding: 10px; }
                .button { background: #007acc; color: #fff; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
                .button:hover { background: #005f99; }
            </style>
        </head>
        <body>
            <h1>Cardano CLI Terminal</h1>
            <div class="output" id="output"></div>
            <input class="input" id="input" placeholder="Enter command..." />
            <button class="button" onclick="executeCommand()">Execute</button>
            <button class="button" onclick="showTransactionForm()">Build Transaction</button>

            <script>
                const vscode = acquireVsCodeApi();
                const outputDiv = document.getElementById('output');
                const inputField = document.getElementById('input');

                window.addEventListener('message', (event) => {
                    const { command, data, type } = event.data;
                    if (command === 'output') {
                        const output = document.createElement('div');
                        output.textContent = data;
                        output.style.color = type === 'error' ? '#ff4444' : '#44ff44';
                        outputDiv.appendChild(output);
                        outputDiv.scrollTop = outputDiv.scrollHeight;
                    }
                });

                function executeCommand() {
                    const command = inputField.value;
                    vscode.postMessage({ command: 'executeCommand', command });
                    inputField.value = '';
                }

                function showTransactionForm() {
                    outputDiv.innerHTML = \`
                        <h2>Build Transaction</h2>
                        <label>Transaction Input:</label><input id="txIn" />
                        <label>Script File Path:</label><input id="txScript" />
                        <label>Change Address:</label><input id="changeAddr" />
                        <label>Signing Key File:</label><input id="signingKeyFile" />
                        <label>Collateral UTXO:</label><input id="collaterals" />
                        <label>Redeemer File:</label><input id="redeemer" />
                        <label>Network:</label><select id="networkType">
                            <option value="preview">Preview</option>
                            <option value="preprod">Preprod</option>
                            <option value="mainnet">Mainnet</option>
                        </select>
                        <label>Datum Type:</label><select id="datumType">
                            <option value="Inline">Inline</option>
                            <option value="DatumFilePath">Datum File Path</option>
                            <option value="DatumHash">Datum Hash</option>
                        </select>
                        <label>Datum Path:</label><input id="datumPath" />
                        <button class="button" onclick="buildTransaction()">Build</button>
                    \`;
                }

                function buildTransaction() {
                    vscode.postMessage({
                        command: 'buildTransaction',
                        txIn: document.getElementById('txIn').value,
                        txScript: document.getElementById('txScript').value,
                        changeAddr: document.getElementById('changeAddr').value,
                        signingKeyFile: document.getElementById('signingKeyFile').value,
                        collaterals: document.getElementById('collaterals').value,
                        redeemer: document.getElementById('redeemer').value,
                        networkType: document.getElementById('networkType').value,
                        datumType: document.getElementById('datumType').value,
                        datumPath: document.getElementById('datumPath').value
                    });
                }
            </script>
        </body>
        </html>
    `;
}
