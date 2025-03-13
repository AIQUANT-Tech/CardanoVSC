// // import vscode from "vscode";
// // import { integrateCardanoAPI } from "./config/cardanoApiIntegration";
// // import { WalletManager } from "./walletProvider";
// // var extensionContext: vscode.ExtensionContext;

// // export class MyWebviewViewProvider implements vscode.WebviewViewProvider {
// //   public static readonly viewType = "cardanovsc.webview";

// //   constructor(private context: vscode.ExtensionContext,private readonly _extensionUri: vscode.Uri) {}

// //   public async resolveWebviewView(
// //     webviewView: vscode.WebviewView,
// //     context1: vscode.WebviewViewResolveContext,
// //     _token: vscode.CancellationToken
// //   ): Promise<void> {
// //     webviewView.webview.options = {
// //       enableScripts: true,
// //       localResourceRoots: [this._extensionUri],
// //     };

// //     webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
// //     // Listen for messages from the webview

// //     webviewView.webview.onDidReceiveMessage(async (message) => {
// //       switch (message.command) {
// //         case "apiIntegration":
// //           const valid =await integrateCardanoAPI(vscode,this.context);

// //           break;
// //         case "openCardanoScan":
// //           vscode.env.openExternal(vscode.Uri.parse("https://cardanoscan.io/"));
// //           break;
// // 		case "walletManagement":
// // 			// Call the function for wallet management here

// // 			break;
// //         default:
// //           vscode.window.showErrorMessage(`Unknown command: ${message.command}`);
// //       }
// //     });
// //   }

// //   private _getHtmlForWebview(webview: vscode.Webview): string {
// //     return `<!DOCTYPE html>
// // 		<html lang="en">
// // 		<head>
// // 		  <meta charset="UTF-8">
// // 		  <meta name="viewport" content="width=device-width, initial-scale=1.0">
// // 		  <title>My Webview</title>
// // 		  <style>
// // 			/* General Styles */
// // 			// body {
// // 			//   font-family: Arial, sans-serif;
// // 			//   padding: 0;
// // 			//   margin: 0;
// // 			//   display: flex;
// // 			//   flex-direction: column;
// // 			//   align-items: center;
// // 			// }

// // 			// div {
// // 			//   color: white;
// // 			//   margin-bottom: 20px;
// // 			// }

// // 			// /* Button Styles */
// // 			// button {
// // 			//   margin: 10px 0;
// // 			//   padding: 10px;
// // 			//   font-size: 16px;
// // 			//   color: #fff;
// // 			//   background-color: #385FFF; /* Blue color */
// // 			//   border: none;
// // 			//   border-radius: 8px;
// // 			//   width: 80%; /* Width for responsiveness */
// // 			//   max-width: 250px;
// // 			//   cursor: pointer;
// // 			//   transition: background-color 0.3s ease;
// // 			// }

// // 			// button:hover {
// // 			//   background-color: #005b99; /* Darker blue on hover */
// // 			// }

// // 			// /* Responsive Design */
// // 			// @media (max-width: 600px) {
// // 			//   button {
// // 			// 	width: 90%; /* Full width on smaller screens */
// // 			//   }
// // 			// }
// // 			/* General Styles */
// //         body {
// //           font-family: Arial, sans-serif;
// //           padding: 0;
// //           margin: 0;
// //           display: flex;
// //           flex-direction: column;
// //           align-items: center;
// //         }

// //         div {
// //           color: white;
// //           margin-bottom: 20px;
// //         }

// //         /* Button Styles */
// //         button {
// //           margin: 10px 0;
// //           padding: 10px;
// //           font-size: 16px;
// //           color: #fff;
// //           background-color: #385FFF; /* Blue color */
// //           border: none;
// //           border-radius: 8px;
// //           width: 80%; /* Width for responsiveness */
// //           max-width: 250px;
// //           cursor: pointer;
// //           transition: background-color 0.3s ease;
// //         }

// //         button:hover {
// //           background-color: #005b99; /* Darker blue on hover */
// //         }

// //         /* Responsive Design */
// //         @media (max-width: 600px) {
// //           button {
// //             width: 90%; /* Full width on smaller screens */
// //           }
// // 		  </style>
// // 		</head>
// // 		<body>

// // 		  <button id="apiIntegrationButton">Cardano API Integration</button>
// // 		  		   <button id="openCardanoScan">Go to cardanoScan Website </button>
// // 		         <button id="walletManagementButton">Wallet Management</button>

// // 		  <script>
// // 			const vscode = acquireVsCodeApi();

// // 			document.getElementById('apiIntegrationButton').addEventListener('click', () => {
// // 			  vscode.postMessage({ command: 'apiIntegration' });
// // 			});
// // 			document.getElementById('openCardanoScan').addEventListener('click', () => {
// // 			  vscode.postMessage({ command: 'openCardanoScan' });
// // 			});
// // 			 document.getElementById('walletManagementButton').addEventListener('click', () => {
// //           vscode.postMessage({ command: 'walletManagement' });
// //         });
// // 		  </script>
// // 		</body>
// // 		</html>`;
// //   }

// // }
// //---------------------------------------

import *as vscode from "vscode";
import { integrateCardanoAPI } from "./config/cardanoApiIntegration";
import { OpenWalletManagementWebview } from "./webview_ui/wallet_webview";
import { integrateCardanoNodeAPI } from "./config/cardanoNodeIntegration";

export class MyWebviewViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "cardanovsc.webview";

  constructor(
    private context: vscode.ExtensionContext,
    private readonly _extensionUri: vscode.Uri
  ) { }

  public async resolveWebviewView(
    webviewView: vscode.WebviewView,
    context1: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): Promise<void> {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Listen for messages from the webview
    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case "apiIntegration":
          const valid = await integrateCardanoAPI(vscode, this.context);
          break;
          case "nodeIntegration":
            await integrateCardanoNodeAPI(this.context);

            break;
        case "openCardanoScan":
          vscode.env.openExternal(vscode.Uri.parse("https://cardanoscan.io/"));
          break;
        case "walletManagement":
          new OpenWalletManagementWebview(this.context, this._extensionUri);
          break;
        default:
          vscode.window.showErrorMessage(`Unknown command: ${message.command}`);
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    return /*HTML*/ `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cardano Webview</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          button {
            margin: 10px 0;
            padding: 10px;
            font-size: 16px;
            color: #fff;
            background-color: #385FFF;
            border: none;
            border-radius: 8px;
            width: 80%;
            max-width: 250px;
            cursor: pointer;
            transition: background-color 0.3s ease;
          }
          button:hover {
            background-color: #005b99;
          }
          @media (max-width: 600px) {
            button {
              width: 90%;
            }
          }
        </style>
      </head>
      <body>
        <button id="apiIntegrationButton">Cardano API Integration</button>
        <button id="openCardanoScan">Go to CardanoScan Website</button>
        <button id="walletManagementButton">Wallet Management</button>
        <button id="nodeIntegrationButton">Cardano Node Connection</button>
        <button id="deploySmartContract">Deploy Smart Contract</button>

        <script>
          const vscode = acquireVsCodeApi();
          document.getElementById('apiIntegrationButton').addEventListener('click', () => {
            vscode.postMessage({ command: 'apiIntegration' });
          });
          document.getElementById('openCardanoScan').addEventListener('click', () => {
            vscode.postMessage({ command: 'openCardanoScan' });
          });
          document.getElementById('walletManagementButton').addEventListener('click', () => {
            vscode.postMessage({ command: 'walletManagement' });
          });
          document.getElementById('nodeIntegrationButton').addEventListener('click', () => {
            vscode.postMessage({ command: 'nodeIntegration' });
          });
          document.getElementById('deploySmartContract').addEventListener('click',()=>{
            
          })
        </script>
      </body>
      </html>`;
  }
}

// class OpenWalletManagementWebview {
//   private panel: vscode.WebviewPanel;

//   constructor(
//     private context: vscode.ExtensionContext,
//     private readonly _extensionUri: vscode.Uri
//   ) {
//     this.panel = vscode.window.createWebviewPanel(
//       "cardanovsc.walletManagement",
//       "Wallet Management",
//       vscode.ViewColumn.One,
//       {
//         enableScripts: true,
//         localResourceRoots: [this._extensionUri],
//       }
//     );

//     this.panel.webview.html = this._getWalletManagementHtml();

//     // Handle messages from the wallet management webview
//     this.panel.webview.onDidReceiveMessage((message) => {
//       switch (message.command) {
//         case "createWallet":
//           this.createWallet();
//           break;
//         case "restoreWallet":
//           this.importWallet();
//           break;
//         case "send":
//         case "receive":
//           this.transaction();
//           break;
//         case "preview":
//         case "preprod":
//         case "mainnet":
//           this.setNetwork(message.command);
//           break;
//         default:
//           vscode.window.showErrorMessage(`Unknown command: ${message.command}`);
//       }
//     });
//   }

//   private _getWalletManagementHtml(): string {
//     return /*HTML*/ `
//       <!DOCTYPE html>
//       <html lang="en">
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Wallet Management</title>
//         <!-- Styles and script omitted for brevity -->
//         <style>
//         body {
//           font-family: Arial, sans-serif;
//           padding: 0;
//           margin: 0;
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           background-color:rgb(38, 41, 39);
//           color: #fff;
//         }
//         .dropdown {
//           position: relative;
//           display: inline-block;
//           margin-top: 40px;
//         }
//         .dropdown button {
//           padding: 10px;
//           font-size: 16px;
//           background-color: #385FFF;
//           color: #fff;
//           border: none;
//           border-radius: 8px;
//           cursor: pointer;
//           width: 200px; /* Fixed width for consistency */
//           text-align: center; /* Aligns text to the left */
 
          
//         }
//         .dropdown-content {
//           display: none;
//           position: absolute;
//           box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
//           z-index: 1;
//           border-radius: 8px;
//           overflow: hidden;
//           width: 200px;          
//         }
//         .dropdown-content button {
//           background-color:#385FFF ;
//           color: #fff;
//           padding: 10px;
//           text-align: center;
//           border: none;
//           width:100%;
//           cursor: pointer;
//         }
      
//         .dropdown-content button:hover {
//           background-color: #005b99;
//         }
//         .dropdown:hover .dropdown-content {
//           display: block;
//         }
//         button.action-button {
//           margin: 10px 0;
//           padding: 10px;
//           font-size: 16px;
//           background-color: #385FFF;
//           color: #fff;
//           border: none;
//           border-radius: 8px;
//           width: 200px;
//           cursor: pointer;
//           transition: background-color 0.3s ease;
//         }
//         button.action-button:hover {
//           background-color: #005b99;
//         }
//         .button-container {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           margin-top: 20px;
//           width:200px;
//         }
//         .action-buttons {
//           display: flex;
//           gap: 20px;
//           margin-top: 20px;
//           width:100px:
//         }
//         @media (max-width: 600px) {
//           button.action-button {
//             width: 90%;
//           }
//           .action-buttons {
//             flex-direction: column;
//           }
//         }
//       </style>
//       </head>
//       <body>
//         <!-- Wallet management UI -->
//              <div class="dropdown">
//                <button id="networkDropdown">Network &#x25BC;</button>
//                <div class="dropdown-content">
//                  <button id="previewNetwork">Preview</button>
//                  <button id="preprodNetwork">Preprod</button>
//                  <button id="mainnetNetwork">Mainnet</button>
//                </div>
//              </div>
        
//              <div class="button-container">
//                <button class="action-button" id="restoreWalletButton">Restore Wallet</button>
//                <button class="action-button" id="createWalletButton">Create Wallet</button>
//              </div>
        
//              <div class="action-buttons">
//                <button class="action-button" id="sendButton">Send</button>
//                <button class="action-button" id="receiveButton">Receive</button>
//             </div>
        
//              <script>
//                const vscode = acquireVsCodeApi();
                  
        
//                document.getElementById('previewNetwork').addEventListener('click', () => {
//                  vscode.postMessage({command:'preview'});
//                });
        
//                document.getElementById('preprodNetwork').addEventListener('click', () => {
//                  vscode.postMessage({command:'preprod'});
//                });
        
//                document.getElementById('mainnetNetwork').addEventListener('click', () => {
//                  vscode.postMessage({command:'mainnet'})
//                });
        
//                document.getElementById('restoreWalletButton').addEventListener('click', () => {
                
//                    vscode.postMessage({ command: 'restoreWallet' });
                
//                });
        
//               document.getElementById('createWalletButton').addEventListener('click', () => {
//                    vscode.postMessage({ command: 'createWallet' });
              
//              });
        
//              document.getElementById('sendButton').addEventListener('click', () => {
//                    vscode.postMessage({ command: 'send' });
//                });
        
//                document.getElementById('receiveButton').addEventListener('click', () => {
//                    vscode.postMessage({ command: 'receive' });
//                });
//              </script>
      
//       </body>
//       </html>`;
//   }

 /*private createWallet() {
    const network =
      this.context.workspaceState.get<string>("cardanovsc.network");
    if (network) {
      vscode.window.showInformationMessage("Creating a new wallet...");
    } else {
      vscode.window.showWarningMessage("Select a network first to proceed.");
    }
  }
*/
//   private importWallet() {
//     const network =
//       this.context.workspaceState.get<string>("cardanovsc.network");
//     if (network) {
//       vscode.window.showInformationMessage("Importing an existing wallet...");
//     } else {
//       vscode.window.showWarningMessage("Select a network first to proceed.");
//     }
//   }

//   private transaction() {
//     vscode.window.showInformationMessage("Viewing wallet balance...");
//   }

//   private setNetwork(network: string) {
//     this.context.workspaceState.update("cardanovsc.network", network);
//     vscode.window.showInformationMessage(`Network set to ${network}`);
//   }
// }
