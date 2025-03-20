// import { extensionCommand } from "./registerCommand";
// import vscode from "vscode";
// import { haskellProvider } from "./completion";
// import { integrateCardanoAPI } from "./config/cardanoApiIntegration";
// import { MyWebviewViewProvider } from "./webviewProvider";


// export function activate(context: vscode.ExtensionContext) {
//   context.subscriptions.push(vscode.commands.registerCommand('cardanovsc.runNode', async () => {
//     try {
//         // Check if cardano-cli and cardano-node are installed
//         const isCardanoInstalled = await checkCardanoInstallation();
//         if (!isCardanoInstalled) {
//             vscode.window.showErrorMessage(
//                 'Cardano CLI or Node is not installed. Please install them to proceed.'
//             );
//             return;
//         }

//         // Collect configuration parameters from the user
//         const { topologyPath, databasePath, socketPath, port, configPath } = await getConfigurationInput();

//         // Validate input
//         if (!topologyPath || !databasePath || !socketPath || !port || !configPath) {
//             vscode.window.showErrorMessage('All fields are required.');
//             return;
//         }

//         // Run the Cardano node
//         runCardanoNode(topologyPath, databasePath, socketPath, port, configPath);
//     } catch (error:any) {
//         vscode.window.showErrorMessage(`Error: ${error.message}`);
//     }
// }));

// const outputChannel = vscode.window.createOutputChannel("Plutus Address Builder");
    
    

//     context.subscriptions.push(vscode.commands.registerCommand('extension.buildPlutusAddress', async () => {
//       await buildPlutusAddress(outputChannel);
//   }));
//   let utxoDisposable = vscode.commands.registerCommand('extension.getUtxoInfo', async () => {
//     await getUtxoInfo(outputChannel);
// });

// context.subscriptions.push(utxoDisposable);
//   context.subscriptions.push(
//     vscode.window.registerWebviewViewProvider(
//       MyWebviewViewProvider.viewType,
//       new MyWebviewViewProvider(context,context.extensionUri)
//     )
//   );
//   context.subscriptions.push(
//     vscode.commands.registerCommand("cardanovsc.helloWorld", () => {
//       vscode.window.showInformationMessage("Hello World from CardanoVSC!");
//     })
//   );
//   context.subscriptions.push(haskellProvider);
//   context.subscriptions.push(
//     vscode.commands.registerCommand("cardano.apiIntegration", async () => {
//      const valid= await integrateCardanoAPI(vscode, context);
     
//     })
//   );

//   new extensionCommand(context);
// }
// export function deactivate() {}




// /**
//  * Checks if cardano-cli and cardano-node are installed.
//  */
// async function checkCardanoInstallation(): Promise<boolean> {
//     try {
//         // Check if cardano-cli is installed
//         await executeCommand('cardano-cli --version');
//         // Check if cardano-node is installed
//         await executeCommand('cardano-node --version');
//         return true;
//     } catch (error) {
//         return false;
//     }
// }

// /**
//  * Executes a shell command and returns the output.
//  */

// function executeCommand(command: string): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const exec = require('child_process').exec;
//       exec(command, (error: { message: any; }, stdout: string | PromiseLike<string>, stderr: any) => {
//           if (error) {
//               vscode.window.showErrorMessage(`Command failed: ${command}\nError: ${stderr || error.message}`);
//               reject(error);
//           } else {
//               resolve(stdout);
//           }
//       });
//   });
// }
// /**
//  * Prompts the user for configuration parameters.
//  */
// async function getConfigurationInput(): Promise<{
//     topologyPath: string | undefined;
//     databasePath: string | undefined;
//     socketPath: string | undefined;
//     port: string | undefined;
//     configPath: string | undefined;
// }> {
//     const topologyPath = await vscode.window.showInputBox({
//         prompt: 'Enter the topology file path',
//         placeHolder: '/path/to/topology.json',
//         ignoreFocusOut: true,

//     });

//     const databasePath = await vscode.window.showInputBox({
//         prompt: 'Enter the database path',
//         placeHolder: '/path/to/database',
//         ignoreFocusOut: true,

//     });

//     const socketPath = await vscode.window.showInputBox({
//         prompt: 'Enter the socket path',
//         placeHolder: '/path/to/socket',
//         ignoreFocusOut: true,

//     });

//     const port = await vscode.window.showInputBox({
//         prompt: 'Enter the port',
//         placeHolder: '3001',
//         value: '3001',
//         ignoreFocusOut: true,

//     });

//     const configPath = await vscode.window.showInputBox({
//         prompt: 'Enter the config file path',
//         placeHolder: '/path/to/config.json',
//         ignoreFocusOut: true,

//     });

//     return { topologyPath, databasePath, socketPath, port, configPath };
// }

// /**
//  * Runs the Cardano node with the provided configuration.
//  */
// function runCardanoNode(
//     topologyPath: string,
//     databasePath: string,
//     socketPath: string,
//     port: string,
//     configPath: string
// ): void {
//     // Create a terminal for the Cardano node
//     const terminal = vscode.window.createTerminal('Cardano Node');
//     terminal.show();

//     // Build the command
//     const command = `cardano-node run \
//         --topology ${topologyPath} \
//         --database-path ${databasePath} \
//         --socket-path ${socketPath} \
//         --port ${port} \
//         --config ${configPath}`;

//     // Execute the command in the terminal
//     terminal.sendText(command);
// }



// async function determineEra(networkFlag: string, outputChannel: vscode.OutputChannel): Promise<string> {
//   return new Promise((resolve) => {
//       const queryCommand = `cardano-cli query tip ${networkFlag}`;
//       exec(queryCommand, (error, stdout, stderr) => {
//           if (error) {
//               vscode.window.showErrorMessage(`Failed to determine era: ${error.message}`);
//               outputChannel.appendLine(`Error: ${stderr}`);
//               resolve("conway");
//               return;
//           }
          
//           try {
//               const tipData = JSON.parse(stdout);
//               if (tipData.syncProgress && parseFloat(tipData.syncProgress) > 96) {
//                   resolve(tipData.era.toLowerCase());
//               } else {
//                   resolve("conway");
//               }
//           } catch (err) {
//               vscode.window.showErrorMessage("Error parsing era data, defaulting to Conway.");
//               resolve("conway");
//           }
//       });
//   });
// }

// function sendPredefinedCommand(command: string, outputChannel: vscode.OutputChannel) {
//   outputChannel.appendLine(`Executing: ${command}`);
//   exec(command, (error, stdout, stderr) => {
//       if (error) {
//           vscode.window.showErrorMessage(`Command failed: ${error.message}`);
//           outputChannel.appendLine(`Error: ${stderr}`);
//       } else {
//         outputChannel.clear();
//           outputChannel.appendLine(`Output: ${stdout}`);
//       }
//   });
// }
// import { exec } from 'child_process';

// async function buildPlutusAddress(outputChannel: vscode.OutputChannel) {
//   const plutusFileUris = await vscode.window.showOpenDialog({
//       canSelectMany: false,
//       openLabel: "Select .plutus file",
//       filters: {
//           'Plutus Files': ['plutus']
//       }
//   });
  
//   if (!plutusFileUris || plutusFileUris.length === 0) {
//       vscode.window.showErrorMessage("No .plutus file selected.");
//       return;
//   }
  
//   const plutusFilePath = plutusFileUris[0].fsPath;
  
//   const networkType = await vscode.window.showQuickPick(["preview", "preprod", "mainnet"], {
//       placeHolder: "Select Network"
//   });
  
//   if (!networkType) {
//       vscode.window.showErrorMessage("No network type selected.");
//       return;
//   }
  
//   const networkFlag = (() => {
//       switch (networkType) {
//           case "preview": return "--testnet-magic 2";
//           case "preprod": return "--testnet-magic 1";
//           case "mainnet": return "--mainnet-magic 764824073";
//           default: return "";
//       }
//   })();
  
//   if (!networkFlag) {
//       vscode.window.showErrorMessage("Unknown network type selected.");
//       return;
//   }
  
//   const era = await determineEra(networkFlag, outputChannel);
//   const predefinedCommand = `cardano-cli ${era} address build \
//   --payment-script-file ${plutusFilePath} \
//   --out-file ${plutusFilePath}.addr \
//   ${networkFlag}`;

  
//   sendPredefinedCommand(predefinedCommand, outputChannel);
// }


// async function getUtxoInfo(outputChannel: vscode.OutputChannel) {
//   const addressFileUris = await vscode.window.showOpenDialog({
//       canSelectMany: false,
//       openLabel: "Select address file",
//       filters: {
//           'Address Files': ['addr']
//       }
//   });

//   if (!addressFileUris || addressFileUris.length === 0) {
//       vscode.window.showErrorMessage("No address file selected.");
//       return;
//   }

//   const addressFilePath = addressFileUris[0].fsPath;

//   const networkType = await vscode.window.showQuickPick(["preview", "preprod", "mainnet"], {
//       placeHolder: "Select Network"
//   });

//   if (!networkType) {
//       vscode.window.showErrorMessage("No network type selected.");
//       return;
//   }

//   const networkFlag = (() => {
//       switch (networkType) {
//           case "preview": return "--testnet-magic 2";
//           case "preprod": return "--testnet-magic 1";
//           case "mainnet": return "--mainnet-magic 764824073";
//           default: return "";
//       }
//   })();

//   if (!networkFlag) {
//       vscode.window.showErrorMessage("Unknown network type selected.");
//       return;
//   }
 

//   const address = fs.readFileSync(addressFilePath, 'utf8').trim();  // Read address from file
//   const socketPath="/home/$USER/git/cardano-node/preprod/mainnet/db/node.socket";
//   const predefinedCommand = `cardano-cli query utxo --address ${address} ${networkFlag} --socket-path ${socketPath}`;
  
//   sendPredefinedCommand(predefinedCommand, outputChannel);
// }
// import * as fs from 'fs';

import { extensionCommand } from "./registerCommand";
import vscode from "vscode";
import { haskellProvider } from "./completion";
import { integrateCardanoAPI } from "./config/cardanoApiIntegration";
import { MyWebviewViewProvider } from "./webviewProvider";
import { exec } from 'child_process';
import * as fs from 'fs';
import { createWebviewPanel } from "./webview";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.openCardanoWallet', () => {
        createWebviewPanel(context);
    }));
  context.subscriptions.push(vscode.commands.registerCommand('extension.buildTransaction', () => {
    createRunAddressCommandButton(context);
}));
  context.subscriptions.push(vscode.commands.registerCommand('cardanovsc.runNode', async () => {
    try {
      const isCardanoInstalled = await checkCardanoInstallation();
      if (!isCardanoInstalled) {
        vscode.window.showErrorMessage('Cardano CLI or Node is not installed. Please install them to proceed.');
        return;
      }

      const storedConfig = context.globalState.get<{ topologyPath: string; databasePath: string; socketPath: string; port: string; configPath: string; }>('cardanoNodeConfig');
      const { topologyPath, databasePath, socketPath, port, configPath } = await getConfigurationInput(storedConfig);

      if (!topologyPath || !databasePath || !socketPath || !port || !configPath) {
        vscode.window.showErrorMessage('All fields are required.');
        return;
      }

      context.globalState.update('cardanoNodeConfig', { topologyPath, databasePath, socketPath, port, configPath });
      runCardanoNode(topologyPath, databasePath, socketPath, port, configPath);
    } catch (error: any) {
      vscode.window.showErrorMessage(`Error: ${error.message}`);
    }
  }));

  const outputChannel = vscode.window.createOutputChannel("cardanovsc:deployment smart contract ");

  context.subscriptions.push(vscode.commands.registerCommand('extension.buildPlutusAddress', async () => {
    await buildPlutusAddress(outputChannel);
  }));

  context.subscriptions.push(vscode.commands.registerCommand('extension.getUtxoInfo', async () => {
    await getUtxoInfo(outputChannel, context);
  }));

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      MyWebviewViewProvider.viewType,
      new MyWebviewViewProvider(context, context.extensionUri)
    )
  );

  context.subscriptions.push(vscode.commands.registerCommand("cardanovsc.helloWorld", () => {
    vscode.window.showInformationMessage("Hello World from CardanoVSC!");
  }));
  context.subscriptions.push(haskellProvider);
  context.subscriptions.push(
    vscode.commands.registerCommand("cardano.apiIntegration", async () => {
      await integrateCardanoAPI(vscode, context);
    })
  );

  new extensionCommand(context);
}

export function deactivate() {}

async function checkCardanoInstallation(): Promise<boolean> {
  try {
    await executeCommand('cardano-cli --version');
    await executeCommand('cardano-node --version');
    return true;
  } catch (error) {
    return false;
  }
}

function executeCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        vscode.window.showErrorMessage(`Command failed: ${command}\nError: ${stderr || error.message}`);
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

async function getConfigurationInput(storedConfig?: { topologyPath: string; databasePath: string; socketPath: string; port: string; configPath: string; }): Promise<{ topologyPath: string | undefined; databasePath: string | undefined; socketPath: string | undefined; port: string | undefined; configPath: string | undefined; }> {
  return {
    topologyPath: await vscode.window.showInputBox({ prompt: 'Enter the topology file path', placeHolder: '/path/to/topology.json', value: storedConfig?.topologyPath, ignoreFocusOut: true }),
    databasePath: await vscode.window.showInputBox({ prompt: 'Enter the database path', placeHolder: '/path/to/database', value: storedConfig?.databasePath, ignoreFocusOut: true }),
    socketPath: await vscode.window.showInputBox({ prompt: 'Enter the socket path', placeHolder: '/path/to/socket', value: storedConfig?.socketPath, ignoreFocusOut: true }),
    port: await vscode.window.showInputBox({ prompt: 'Enter the port', placeHolder: '3001', value: storedConfig?.port || '3001', ignoreFocusOut: true }),
    configPath: await vscode.window.showInputBox({ prompt: 'Enter the config file path', placeHolder: '/path/to/config.json', value: storedConfig?.configPath, ignoreFocusOut: true })
  };
}

async function buildPlutusAddress(outputChannel: vscode.OutputChannel) {
  const plutusFileUris = await vscode.window.showOpenDialog({
    canSelectMany: false,
    openLabel: "Select .plutus file",
    filters: { 'Plutus Files': ['plutus'] }
  });
  if (!plutusFileUris || plutusFileUris.length === 0) {
    vscode.window.showErrorMessage("No .plutus file selected.");
    return;
  }
  const plutusFilePath = plutusFileUris[0].fsPath;
  const networkType = await vscode.window.showQuickPick(["preview", "preprod", "mainnet"], { placeHolder: "Select Network" });
  if (!networkType) {
    vscode.window.showErrorMessage("No network type selected.");
    return;
  }
  const networkFlag = networkType === "preview" ? "--testnet-magic 2" : networkType === "preprod" ? "--testnet-magic 1" : "--mainnet-magic 764824073";
  const command = `cardano-cli address build --payment-script-file ${plutusFilePath} --out-file ${plutusFilePath}.addr ${networkFlag}`;
  outputChannel.appendLine(`Executing: ${command}`);
  exec(command, (error, stdout, stderr) => {
    if (error) {
      vscode.window.showErrorMessage(`Command failed: ${error.message}`);
      outputChannel.appendLine(`Error: ${stderr}`);
    } else {
      outputChannel.clear();
      outputChannel.appendLine(`Output: ${stdout}`);
    }
  });
}

async function getUtxoInfo(outputChannel: vscode.OutputChannel, context: vscode.ExtensionContext) {
  try {
    const storedConfig = context.globalState.get<{ socketPath: string }>('cardanoNodeConfig');

    if (!storedConfig?.socketPath) {
      vscode.window.showErrorMessage('Socket path is missing. Please configure the Cardano node settings.');
      return;
    }

    const address = await vscode.window.showInputBox({ 
      prompt: 'Enter the Cardano address',
      placeHolder: 'addr_test1...', 
      ignoreFocusOut: true 
    });

    if (!address) {
      vscode.window.showErrorMessage('Address is required.');
      return;
    }

    const command = `cardano-cli query utxo --socket-path ${storedConfig.socketPath} --address ${address} --testnet-magic 1`;
    outputChannel.clear();
    outputChannel.appendLine(`Executing: ${command}`);
    outputChannel.show();

    const utxoData = await executeCommand(command);
    outputChannel.appendLine(utxoData);
    vscode.window.showInformationMessage('UTxO data fetched successfully.');

  } catch (error: any) {
    vscode.window.showErrorMessage(`Error fetching UTxO: ${error.message}`);
  }
}


function runCardanoNode(
  topologyPath: string,
  databasePath: string,
  socketPath: string,
  port: string,
  configPath: string,
) {
  const terminal = vscode.window.createTerminal("Cardano Node");
  const command = `cardano-node run --topology ${topologyPath} --database-path ${databasePath} --socket-path ${socketPath} --port ${port} --config ${configPath}`;
  
  vscode.window.showInformationMessage("Starting Cardano Node in terminal...");
  terminal.show();
  terminal.sendText(command);
}

function createRunAddressCommandButton(context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
      'transactionBuilder',
      'Transaction Builder',
      vscode.ViewColumn.One,
      { enableScripts: true }
  );

  panel.webview.html = getWebviewContent();
  panel.webview.onDidReceiveMessage(message => {
      if (message.command === 'buildTransaction') {
          handleWithdrawTransaction(message.data);
      }
  }, undefined, context.subscriptions);
}


async function handleWithdrawTransaction(data: any) {
  const { txIn, txScript, changeAddr, signingKeyFile, collaterals, redeemer, datumType, datumPath, networkType, othersCommand } = data;

  if (!txIn || !txScript || !changeAddr || !signingKeyFile || !collaterals || !redeemer) {
      vscode.window.showErrorMessage("All fields must be filled out.");
      return;
  }

  const networkFlag = getNetworkFlag(networkType);
  if (!networkFlag) {
      vscode.window.showErrorMessage("Invalid network type selected.");
      return;
  }

  const datumFlag = getDatumFlag(datumType, datumPath);
  if (!datumFlag) {
      vscode.window.showErrorMessage("Invalid datum type selected.");
      return;
  }

  const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
  
  const buildTransactionCommand = `cardano-cli conway transaction build ${networkFlag} --tx-in ${txIn} --tx-in-script-file ${txScript} ${datumFlag} --tx-in-redeemer-file ${redeemer} --tx-in-collateral ${collaterals} --change-address $(< ${changeAddr}) --out-file tx_${timestamp}.raw ${othersCommand}`;

  if (await executeCommand(buildTransactionCommand)) {return;}

  const signTransactionCommand = `cardano-cli conway transaction sign --tx-body-file tx_${timestamp}.raw --signing-key-file ${signingKeyFile} ${networkFlag} --out-file tx_${timestamp}.signed`;

  if (await executeCommand(signTransactionCommand)) {return;}

  const submitTransactionCommand = `cardano-cli conway transaction submit ${networkFlag} --tx-file tx_${timestamp}.signed`;

  await executeCommand(submitTransactionCommand);
}

function getNetworkFlag(networkType: string): string | null {
  switch (networkType) {
      case "preview": return "--testnet-magic 2";
      case "preprod": return "--testnet-magic 1";
      case "mainnet": return "--mainnet-magic 764824073";
      default: return null;
  }
}

function getDatumFlag(datumType: string, datumPath: string): string | null {
  switch (datumType) {
      case "Inline": return "--tx-in-inline-datum-present";
      case "DatumFilePath": return `--tx-in-datum-file ${datumPath}`;
      case "DatumHash": return `--tx-in-datum-hash ${datumPath}`;
      default: return null;
  }
}


function getWebviewContent(): string {
  return `
  <html>
  <body>
      <h2>Enter Transaction Details</h2>
      <label>Transaction Input UTXO:</label>
      <input id="txIn" type="text"><br>
      <label>Plutus File Path:</label>
      <input id="txScript" type="text"><br>
      <label>Change Address File Path:</label>
      <input id="changeAddr" type="text"><br>
      <label>Signing Key File Path:</label>
      <input id="signingKeyFile" type="text"><br>
      <label>Collateral UTXO:</label>
      <input id="collaterals" type="text"><br>
      <label>Redeemer File Path:</label>
      <input id="redeemer" type="text"><br>
      <label>Network:</label>
      <select id="network">
          <option value="preview">Preview</option>
          <option value="preprod">Preprod</option>
          <option value="mainnet">Mainnet</option>
      </select><br>
      <label>Datum Type:</label>
      <select id="datumType">
          <option value="Inline">Inline</option>
          <option value="DatumFilePath">Datum File Path</option>
          <option value="DatumHash">Datum Hash</option>
      </select><br>
      <label>Datum Path:</label>
      <input id="datumPath" type="text"><br>
      <label>Additional Commands:</label>
      <input id="othersCommand" type="text"><br>
      <button onclick="submitForm()">Submit</button>
      <script>
          function submitForm() {
              const data = {
                  txIn: document.getElementById('txIn').value,
                  txScript: document.getElementById('txScript').value,
                  changeAddr: document.getElementById('changeAddr').value,
                  signingKeyFile: document.getElementById('signingKeyFile').value,
                  collaterals: document.getElementById('collaterals').value,
                  redeemer: document.getElementById('redeemer').value,
                  networkType: document.getElementById('network').value,
                  datumType: document.getElementById('datumType').value,
                  datumPath: document.getElementById('datumPath').value,
                  othersCommand: document.getElementById('othersCommand').value
              };
              vscode.postMessage({ command: 'buildTransaction', data });
          }
      </script>
  </body>
  </html>
  `;
}
