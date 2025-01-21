import vscode from "vscode";
import { integrateCardanoAPI } from "./config/cardanoApiIntegration";
var extensionContext: vscode.ExtensionContext;

export class MyWebviewViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "cardanovsc.webview";

 

  constructor(private context: vscode.ExtensionContext,private readonly _extensionUri: vscode.Uri) {}

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
          const valid =await integrateCardanoAPI(vscode,this.context);

          break;
        case "openCardanoScan":
          vscode.env.openExternal(vscode.Uri.parse("https://cardanoscan.io/"));
          break;

        default:
          vscode.window.showErrorMessage(`Unknown command: ${message.command}`);
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    return `<!DOCTYPE html>
		<html lang="en">
		<head>
		  <meta charset="UTF-8">
		  <meta name="viewport" content="width=device-width, initial-scale=1.0">
		  <title>My Webview</title>
		  <style>
			/* General Styles */
			body {
			  font-family: Arial, sans-serif;
			  padding: 0;
			  margin: 0;
			  display: flex;
			  flex-direction: column;
			  align-items: center;
			}
	
			div {
			  color: white;
			  margin-bottom: 20px;
			}
	
			/* Button Styles */
			button {
			  margin: 10px 0;
			  padding: 10px;
			  font-size: 16px;
			  color: #fff;
			  background-color: #385FFF; /* Blue color */
			  border: none;
			  border-radius: 8px;
			  width: 80%; /* Width for responsiveness */
			  max-width: 250px;
			  cursor: pointer;
			  transition: background-color 0.3s ease;
			}
	
			button:hover {
			  background-color: #005b99; /* Darker blue on hover */
			}
	
			/* Responsive Design */
			@media (max-width: 600px) {
			  button {
				width: 90%; /* Full width on smaller screens */
			  }
			}
		  </style>
		</head>
		<body>
		  
		
		  <button id="apiIntegrationButton">Cardano API Integration</button>
		  
		   <button id="openCardanoScan">Go to cardanoScan
        Website </button>
		  <script>
			const vscode = acquireVsCodeApi();
	
			
			document.getElementById('apiIntegrationButton').addEventListener('click', () => {
			  vscode.postMessage({ command: 'apiIntegration' });
			});
			document.getElementById('openCardanoScan').addEventListener('click', () => {
			  vscode.postMessage({ command: 'openCardanoScan' });
			});
		  </script>
		</body>
		</html>`;
  }
}
