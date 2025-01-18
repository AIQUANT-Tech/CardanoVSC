import { extensionCommand } from './registerCommand';
import * as vscode from 'vscode';
import { haskellProvider } from './completion';

class MyWebviewViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'cardanovsc.webview';
  
	constructor(private readonly _extensionUri: vscode.Uri) { }
  
	public async resolveWebviewView(
	  webviewView: vscode.WebviewView,
	  context: vscode.WebviewViewResolveContext,
	  _token: vscode.CancellationToken
	): Promise<void> {
	  webviewView.webview.options = {
		enableScripts: true,
		localResourceRoots: [this._extensionUri]
	  };
  
	  webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
	  // Listen for messages from the webview
  
  
  
	  webviewView.webview.onDidReceiveMessage(async (message) => {
		switch (message.command) {
		   
		  case 'apiIntegration':
			
			
			  vscode.window.showInformationMessage('API integration');
			 // Show network selection
			 const selectedNetwork = await vscode.window.showQuickPick(
				['Mainnet', 'Preprod', 'Preview'],
				{
				  placeHolder: 'Select the network'
				}
			  );
	
			  if (selectedNetwork) {
				// Ask for API key once the network is selected
				const apiKey = await vscode.window.showInputBox({
				  prompt: 'Enter your CardanoScan API key',
				  ignoreFocusOut: true
				});
	
				if (apiKey) {
					 // Store the selected network and API key in globalState
					 
				extensionContext.globalState.update('cardano.network', selectedNetwork);
					extensionContext.globalState.update('cardano.apiKey', apiKey);
			   
					 // Confirmation message
					 vscode.window.showInformationMessage(
					   `API integration selected for ${selectedNetwork} with API key: ${apiKey}`
					 );
				} else {
				  vscode.window.showErrorMessage('API key is required!');
				}
			  } else {
				vscode.window.showErrorMessage('No network selected!');
			  }
  
			 
		
			break;
			case 'openCardanoScan':
			  vscode.env.openExternal(vscode.Uri.parse('https://cardanoscan.io/'));		  
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
  let extensionContext: vscode.ExtensionContext;

export function activate(context: vscode.ExtensionContext) {
	extensionContext = context; // Store the context globally

	context.subscriptions.push(vscode.window.registerWebviewViewProvider(MyWebviewViewProvider.viewType, new MyWebviewViewProvider(context.extensionUri)));
	context.subscriptions.push(vscode.commands.registerCommand('cardanovsc.helloWorld', () => {	
		vscode.window.showInformationMessage('Hello World from CardanoVSC!');
	}));
    context.subscriptions.push(haskellProvider);
	context.subscriptions.push(vscode.commands.registerCommand('cardano.apiIntegration', async () => {
		vscode.window.showInformationMessage('API Integration started');
	
		try {
		  // Show network selection
		  const selectedNetwork = await vscode.window.showQuickPick(
			['Mainnet', 'Preprod', 'Preview'],
			{
			  placeHolder: 'Select the network',
			}
		  );
	
		  if (!selectedNetwork) {
			vscode.window.showErrorMessage('No network selected!');
			return;
		  }
	
		  // Ask for API key once the network is selected
		  const apiKey = await vscode.window.showInputBox({
			prompt: 'Enter your CardanoScan API key',
			ignoreFocusOut: true,
			validateInput: (value) =>
			  value.trim().length === 0 ? 'API key cannot be empty' : null,
		  });
	
		  if (!apiKey) {
			vscode.window.showErrorMessage('API key is required!');
			return;
		  }
	
		  // Store the selected network and API key in globalState
		  await context.globalState.update('cardano.network', selectedNetwork);
		  await context.globalState.update('cardano.apiKey', apiKey);
	
		  // Confirmation message
		  vscode.window.showInformationMessage(
			`API integration successful! Network: ${selectedNetwork}, API Key saved.`
		  );
		} catch (error) {
		  vscode.window.showErrorMessage(`An error occurred: ${error}`);
		}
	  }));
	
	new extensionCommand(context);

}
export function deactivate() {}
