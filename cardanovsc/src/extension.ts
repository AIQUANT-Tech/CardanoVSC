import { extensionCommand } from "./registerCommand";
import*as vscode from "vscode";
//import { haskellProvider } from "./completion";
import { integrateCardanoAPI } from "./config/cardanoApiIntegration";
import { MyWebviewViewProvider } from "./webviewProvider.js";
import {  integrateCardanoNodeAPI} from "./config/cardanoNodeIntegration";
import { selectFile } from "./implementation/deployment";


export function activate(context: vscode.ExtensionContext,_extensionUri:vscode.Uri) {
   
  // Register commands
      context.subscriptions.push(
          vscode.commands.registerCommand('cardanovsc.integrateCardanoNode', async () => {
              await integrateCardanoNodeAPI(context);
          })
      );
  
   
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
export function deactivate() {

}
