import { extensionCommand } from "./registerCommand";
import*as vscode from "vscode";
//import { haskellProvider } from "./completion";
import { integrateCardanoAPI } from "./config/cardanoApiIntegration";
import { MyWebviewViewProvider } from "./webviewProvider.js";
import {  createStatusBarItem, integrateCardanoNodeAPI, registerNetworkCommand} from "./config/cardanoNodeIntegration";
import { selectFile } from "./implementation/deployment";
import { startCardanoCli } from "./cardanoCli";
import { deactivate, runCardanoNode } from "./runCardanoNode";


export function activate(context: vscode.ExtensionContext,_extensionUri:vscode.Uri) {
   
  // Register commands
      context.subscriptions.push(
          vscode.commands.registerCommand('cardanovsc.integrateCardanoNode', async () => {
              await integrateCardanoNodeAPI(context);
          })
      );
  
    // status bar 
        createStatusBarItem(context);
        registerNetworkCommand(context);
    ///node 
    context.subscriptions.push( vscode.commands.registerCommand('cardanoCli.start', () => {
      startCardanoCli(context);
  }));
    
  context.subscriptions.push(vscode.commands.registerCommand('extension.runCardanoNode', runCardanoNode));

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      MyWebviewViewProvider.viewType,
      new MyWebviewViewProvider(context, context.extensionUri)
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("cardanovsc.helloWorld", () => {
      vscode.window.showInformationMessage("Hello World from CardanoVSC!");
    })
  );
  // context.subscriptions.push(haskellProvider);
  

  context.subscriptions.push(
    vscode.commands.registerCommand("cardano.apiIntegration", async () => {
      const valid = await integrateCardanoAPI(vscode, context);
    })
  );

  new extensionCommand(context);
 selectFile(context);
  
}
deactivate();
