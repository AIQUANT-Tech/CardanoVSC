import vscode from "vscode";
import * as fs from 'fs';
import * as path from 'path';
import {
  getFirstNetworkConfig,
  setNetwork,
} from "../config/cardanoNodeIntegration";
import {
  checkBalance,
  createWallet,
  restoreWallet,
  sendTransaction,
} from "../implementation/implementation";
export class OpenWalletManagementWebview {
  private panel: vscode.WebviewPanel;

  constructor(
    private context: vscode.ExtensionContext,
    private readonly _extensionUri: vscode.Uri
  ) {
    this.panel = vscode.window.createWebviewPanel(
      "cardanovsc.walletManagement",
      "Wallet Management",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [this._extensionUri],
      }
    );

    // Initialize the webview asynchronously
    this.initialize();
  }

  private async initialize() {
    // Await the HTML content
    this.panel.webview.html = await this._getWalletManagementHtml();

    this.panel.webview.onDidReceiveMessage(
      async (message: {
        walletName: any;
        command: string;
        network?: string;
        seedPhrase?: string;
        senderAddress?:string;
        recipientAddress?:string;
        amount?:number;
        password?:string;
      }) => {
        let firstConfig;

        switch (message.command) {
          case "connectNetwork":
            console.log("connect_network");
            if (message.network) {
              setNetwork(message.network, this.context, this._extensionUri);
            }
            break;
      
          case "createWallet":
            console.log("create");
            
            firstConfig = getFirstNetworkConfig(this.context);
             
            if (!firstConfig) {
              vscode.window.showErrorMessage(
                "No network configuration found. Please configure your network first."
              );
              break;
            }

            const seed = await createWallet(
              firstConfig.network,
              firstConfig.apiKey
            );
            if (seed) {
              this.context.secrets.store("seed", seed);
              // Update webview to show seed phrase and a submit button
              this.panel.webview.html = this._getSeedPhraseHtml(seed);
            }
            break;
            case "checkBalance":
              firstConfig = getFirstNetworkConfig(this.context);

              if (!firstConfig) {
                vscode.window.showErrorMessage(
                  "No network configuration found. Please configure your network first."
                );
                break;
              }


            checkBalance(firstConfig.network,firstConfig.apiKey);
            break;
          case "restoreWallet":
            firstConfig = getFirstNetworkConfig(this.context);

            if (!firstConfig) {
              vscode.window.showErrorMessage(
                "No network configuration found. Please configure your network first."
              );
              break;
            }
            if (message.seedPhrase) {
              await restoreWallet(
                message.seedPhrase,
                firstConfig.network,
                firstConfig.apiKey
              );
            } else {
              vscode.window.showErrorMessage(
                "No seed found. Please tryb again."
              );
            }

            break;
          case "send":
            console.log("hi send");
            firstConfig = null;
            firstConfig = getFirstNetworkConfig(this.context);

            if (!firstConfig) {
              vscode.window.showErrorMessage(
                "No network configuration found. Please configure your network first."
              );
              break;
            }
            if(message.senderAddress&&message.recipientAddress&&message.amount&&message.password){
            await sendTransaction(message.senderAddress,message.recipientAddress,message.amount,message.password,firstConfig.network,firstConfig.apiKey);
            }else{
              vscode.window.showErrorMessage(
                "error in fetching transaction input"
              );
            }
            break;
          case "home":
            // Reload the original wallet management UI
            this.panel.webview.html = await this._getWalletManagementHtml();
            this.showCurrentNetworkStatus();
            break;
          case "getSeedphrase":
            firstConfig = getFirstNetworkConfig(this.context);

            if (!firstConfig) {
              vscode.window.showErrorMessage(
                "No network configuration found. Please configure your network first."
              );
              break;
            }
            this.panel.webview.html =this._getRestoreWalletHtml(
              firstConfig.network
            );
            break;
            case "getSendingInput":
              firstConfig = getFirstNetworkConfig(this.context);

            if (!firstConfig) {
              vscode.window.showErrorMessage(
                "No network configuration found. Please configure your network first."
              );
              break;
            }
              this.panel.webview.html=this._getSendTransactionHtml(firstConfig.network);
              break;
          default:
            vscode.window.showErrorMessage(
              `Unknown command: ${message.command}`
            );
        }
      }
    );

    this.showCurrentNetworkStatus();
  }
  public async showCurrentNetworkStatus() {
    try {
      const currentNetwork =
        this.context.globalState.get<{ network: string; apiKey: string }[]>(
          "cardano.node"
        ) || [];

      // Ensure the webview panel exists and is visible
      if (this.panel) {
        const network =
          currentNetwork.length > 0
            ? currentNetwork[0].network
            : "Not Connected";
        this.panel.webview.postMessage({ command: "networkStatus", network });
      } else {
        console.warn("Webview panel is not initialized.");
      }
    } catch (error) {
      console.error("Failed to show current network status:", error);
    }
  }

  private sanitizeNetworkName(network: string): string {
    return network.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  private async _getWalletManagementHtml(): Promise<string> {
    let previousNetworks =
      this.context.globalState.get<{ network: string; apiKey: string }[]>(
        "cardano.node"
      );

    // Ensure previousNetworks is always an array
    if (!Array.isArray(previousNetworks)) {
      console.warn("previousNetworks is not an array:", previousNetworks);
      previousNetworks = [];
    }

    const networkOptions =
      previousNetworks.length > 0
        ? previousNetworks
            .map(
              (p) =>
                `<button id="connect${this.sanitizeNetworkName(
                  p.network
                )}">${this.sanitizeNetworkName(p.network)}</button>`
            )
            .join("")
        : "<p>No networks available. Please connect a node through Brockfrost.</p>";

    return /*html*/`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Wallet Management</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #003366;
          color: #fff;
          text-align: center;
          padding: 20px;
          margin: 0;
        }
        h2 {
          font-size: 24px;
          font-weight: bold;
        }
        .dropdown {
          position: relative;
          display: inline-block;
          margin-top: 20px;
        }
        .dropdown button {
          padding: 12px;
          font-size: 16px;
          background-color: #385FFF;
          color: #fff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          width: 220px;
        }
        .container{
        margin-top:6%;
          display: flex;
          
          gap:20px;
          flex-direction: column;
          align-items:center;
      
        }
        .container button {
          padding: 12px;
          font-size: 16px;
          background-color: #385FFF;
          color: #fff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          width: 220px;
        }
        
        .dropdown-content {
          display: none;
          position: absolute;
          left: 0;
          top: 100%;
          box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          background-color: #385FFF;
          width: 220px;
        }
        .dropdown:hover .dropdown-content {
          display: block;

        }
        .dropdown-content button {
          background-color: #385FFF;
          color: #fff;
          padding: 12px;
          width: 100%;
          border: none;
          cursor: pointer;
          text-align: left;
        }
        .dropdown-content button:hover {
          background-color: #2c4bcc; /* Darker shade of blue */
          color: #ffffff;
          }

        #seedPhraseDisplay {
          margin-top: 20px;
          padding: 10px;
          background-color: #1a1a1a;
          border-radius: 8px;
          word-wrap: break-word;
        }
      </style>
    </head>
    <body>
      <h2>Wallet Management</h2>
      <h3>Network Status: <span id="networkStatus">Not Connected</span></h3>
      <div class="dropdown">
        <button>Select Network ▼</button>
        <div class="dropdown-content">
          ${networkOptions}
        </div>
      </div>

      <div class="container">
        <button id="createWalletButton">Create Wallet</button>
        <button id="restoreWalletButton">Restore Wallet</button>
        <!-- <button id="sendButton">Send</button> -->
        <button id="checkBalance">check balance</button>

      </div>


      <script>
        const vscode = acquireVsCodeApi();

        window.addEventListener('message', (event) => {
          const message = event.data;
          if (message.command === 'networkStatus') {
            document.getElementById('networkStatus').innerText = \` \${message.network}\`;
          }
        });

        ${previousNetworks
          .map(
            (p) => `
          document.getElementById('connect${p.network}').addEventListener('click', () => {
            vscode.postMessage({ command: 'connectNetwork', network: '${p.network}' });
          });
        `
          )
          .join("")}

        document.getElementById('createWalletButton').addEventListener('click', () => {
          vscode.postMessage({ command: 'createWallet' });
        });

        document.getElementById('restoreWalletButton').addEventListener('click', () => {
          vscode.postMessage({ command: 'getSeedphrase' });
        });
        document.getElementById('checkBalance').addEventListener('click', () => {
          vscode.postMessage({ command: 'checkBalance' });
        });
        document.getElementById('sendButton').addEventListener('click', () => {
          vscode.postMessage({ command: 'getSendingInput' });
        });
      </script>
    </body>
    </html>
  `;
  }
  private _getSeedPhraseHtml(seed: string): string {
    const seedArray = seed.split(" ");

    return /*html*/ `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Wallet Seed Phrase</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #003366; color: #fff; text-align: center; padding: 20px; }
        .seed-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 20px; }
        .seed-item { padding: 10px; background-color: #333; border-radius: 8px; text-align: center; }
        #submitButton { margin-top: 20px; padding: 12px; font-size: 16px; background-color: #385FFF; color: #fff; border: none; border-radius: 8px; cursor: pointer; }
      </style>
    </head>
    <body>
      <h2>Your Wallet Seed Phrase</h2>
      <div class="seed-grid">
        ${seedArray
          .map((word) => `<div class="seed-item">${word}</div>`)
          .join("")}
      </div>
      <p><strong>Please note down your seed phrase and store it securely.</strong></p>
      <button id="submitButton">Submit</button>

      <script>
        const vscode = acquireVsCodeApi();
        document.getElementById('submitButton').addEventListener('click', () => {
          vscode.postMessage({ command: 'home' });
        });
      </script>
    </body>
    </html>
  `;
  }
  private _getRestoreWalletHtml(selectedNetwork: string): string {
    return /*html*/`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Restore Wallet</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #1e1e1e; color: #ffffff; padding: 20px; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; required}
        .input-box { padding: 10px; border: 1px solid #ccc; border-radius: 5px; background: #333; color: #fff; }
        .button { margin-top: 20px; padding: 12px; font-size: 16px; background-color: #007acc; color: #fff; border: none; border-radius: 8px; cursor: pointer; }
        .network-label { margin-top: 20px; font-weight: bold; }
        .button.back { background-color: #555; margin-right: 10px; }
        .button:disabled { background-color: #555; cursor: not-allowed; }
      </style>
    </head>
    <body>
      <h2>Restore Wallet</h2>
      <p class="network-label">Network: ${selectedNetwork}</p>
      <p>Enter your 24-word seed phrase:</p>
      <div class="grid">
        ${Array.from(
          { length: 24 },
          (_, i) =>
            `<input type="text" class="input-box" id="word${
              i + 1
            }" placeholder="Word ${i + 1}" />`
        ).join("")}
      </div>
      <div>
      <button id="backButton" class="button back">Back</button>
      <button id="restoreButton" class="button" disabled>Restore Wallet</button>
     </div>
      <script>
        const vscode = acquireVsCodeApi();
         document.querySelectorAll('input').forEach(input => {
          input.addEventListener('input', () => {
            document.getElementById('restoreButton').disabled = !allFieldsFilled();
          });
        });
        document.getElementById('restoreButton').addEventListener('click', () => {
          const seedPhrase = Array.from({ length: 24 }, (_, i) => document.getElementById('word' + (i + 1)).value.trim()).join(' ');

          if (seedPhrase.split(' ').length !== 24) {
            alert('Please enter a valid 24-word seed phrase.');
            return;
          }

          vscode.postMessage({ command: 'restoreWallet', seedPhrase, network: "${selectedNetwork}" });
        });
            document.getElementById('backButton').addEventListener('click', () => {
          vscode.postMessage({ command: 'home' });
        });
      </script>
    </body>
    </html>
  `;
  }

private _getSendTransactionHtml(selectedNetwork: string): string {
  const walletFolderPath = path.join(vscode.workspace.workspaceFolders?.[0].uri.fsPath || '', 'wallet_details',selectedNetwork);
  let walletOptions = '';

  if (fs.existsSync(walletFolderPath)) {
    const walletFiles = fs.readdirSync(walletFolderPath).filter(file => file.endsWith('.txt'));
    walletOptions = walletFiles.map(file => {
      const address = file.replace('.txt', '').replace(/_/g, ' ');
      return `<option value="${file}">${address}</option>`;
    }).join('');
  }

  return /*html*/`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Send Transaction</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #1e1e1e; color: #ffffff; padding: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; font-weight: bold; margin-bottom: 5px; }
        input, select { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; background: #333; color: #fff; }
        .button { margin-top: 20px; padding: 12px; font-size: 16px; background-color: #007acc; color: #fff; border: none; border-radius: 8px; cursor: pointer; }
        .button:disabled { background-color: #555; cursor: not-allowed; }
        .button.back { background-color: #555; margin-right: 10px; }
        .network-label { margin-top: 20px; font-weight: bold; }

      </style>
    </head>
    <body>
      <h2>Send Transaction</h2>
      <p class="network-label">Network: ${selectedNetwork}</p>
      <div class="form-group">
        <label for="senderAddress">Select Sender Address</label>
        <select id="senderAddress">
          <option value="" disabled selected>Select an address</option>
          ${walletOptions || '<option value="" disabled>No addresses found</option>'}
        </select>
        </div>
      <div class="form-group">
        <label for="recipientAddress">Recipient Address</label>
        <input type="text" id="recipientAddress" placeholder="Enter recipient address" />
      </div>
      <div class="form-group">
        <label for="amount">Amount (in ADA)</label>
        <input type="number" id="amount" placeholder="Enter amount in ADA" min="1" />
      </div>
      <div class="form-group">
        <label for="password">Wallet Password</label>
        <input type="password" id="password" placeholder="Enter wallet password" />
      </div>

      <div>
        <button id="backButton" class="button back">Back</button>
        <button id="sendButton" class="button" disabled>Send Transaction</button>
      </div>

      <script>
        const vscode = acquireVsCodeApi();

        const allFieldsFilled = () => {
          const senderAddress = document.getElementById('senderAddress').value;
          const recipientAddress = document.getElementById('recipientAddress').value.trim();
          const amount = document.getElementById('amount').value.trim();
          const password = document.getElementById('password').value.trim();
          return senderAddress && recipientAddress && amount > 0 && password;
        };

        document.querySelectorAll('input, select').forEach(input => {
          input.addEventListener('input', () => {
            document.getElementById('sendButton').disabled = !allFieldsFilled();
          });
        });

        document.getElementById('sendButton').addEventListener('click', () => {
          const senderAddress = document.getElementById('senderAddress').value;
          const recipientAddress = document.getElementById('recipientAddress').value.trim();
          const amount = document.getElementById('amount').value.trim();
          const password = document.getElementById('password').value.trim();

          vscode.postMessage({ command: 'send', senderAddress, recipientAddress, amount,password});
        });

        document.getElementById('backButton').addEventListener('click', () => {
          vscode.postMessage({ command: 'home' });
        });
        
      </script>
    </body>
    </html>
  `;
}


}
