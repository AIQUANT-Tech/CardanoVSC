/*import * as vscode from "vscode";
import * as fs from "fs";
import { getFirstNetworkConfig } from "../config/cardanoNodeIntegration";
import { initializeLucid } from "./implementation";

export function selectFile(context: vscode.ExtensionContext) {
  const command = vscode.commands.registerCommand("select_plutus_file", async () => {
    try {
      // Step 1: Select Plutus script file
      const scriptUri = await vscode.window.showOpenDialog({
        canSelectMany: false,
        openLabel: "Select Plutus Script (.plutus)",
        filters: {
          "Plutus Script": ["plutus"],
        },
      });

      if (!scriptUri || scriptUri.length === 0) {
        vscode.window.showErrorMessage("No script selected.");
        return;
      }

      const scriptPath = scriptUri[0].fsPath;
      const scriptContent = fs.readFileSync(scriptPath, "utf8");

      // Step 2: Parse the .plutus file as JSON and extract cborHex
      let scriptJson;
      try {
        scriptJson = JSON.parse(scriptContent);
      } catch (error) {
        vscode.window.showErrorMessage("Failed to parse Plutus script file as JSON.");
        return;
      }

      if (!scriptJson.cborHex) {
        vscode.window.showErrorMessage("Invalid Plutus script file: missing 'cborHex' field.");
        return;
      }

      let firstConfig = getFirstNetworkConfig(context);
      if (firstConfig) {
        // Step 3: Initialize Lucid
        const lucid = await initializeLucid(firstConfig.network, firstConfig.apiKey);
     console.log(scriptJson.cborHex);
        // Step 4: Generate the script address using cborHex
        const plutusScript = {
          type: "PlutusV2",
          script: scriptJson.cborHex,  // Ensure it's a string
        };

        
const matchingNumberAddress = lucid.utils.validatorToAddress(
    plutusScript,
  );
  const api = await window.cardano;
lucid.selectWallet(api);
  
   
        vscode.window.showInformationMessage(`Generated script address: ${matchingNumberAddress}`);
      }
    } catch (error: any) {
      vscode.window.showErrorMessage(`Failed to process the script: ${error.message}`);
    }
  });

  context.subscriptions.push(command);
}
*/
import * as vscode from "vscode";
import * as fs from "fs";
import { getFirstNetworkConfig } from "../config/cardanoNodeIntegration";
import { initializeLucid } from "./implementation";

export function selectFile(context: vscode.ExtensionContext) {
  const command = vscode.commands.registerCommand("select_plutus_file", async () => {
    try {
      // Step 1: Select Plutus script file
      const scriptUri = await vscode.window.showOpenDialog({
        canSelectMany: false,
        openLabel: "Select Plutus Script (.plutus)",
        filters: {
          "Plutus Script": ["plutus"],
        },
      });

      if (!scriptUri || scriptUri.length === 0) {
        vscode.window.showErrorMessage("No script selected.");
        return;
      }

      const scriptPath = scriptUri[0].fsPath;
      const scriptContent = fs.readFileSync(scriptPath, "utf8");

      // Step 2: Parse the .plutus file as JSON and extract cborHex
      let scriptJson;
      try {
        scriptJson = JSON.parse(scriptContent);
      } catch (error) {
        vscode.window.showErrorMessage("Failed to parse Plutus script file as JSON.");
        return;
      }

      if (!scriptJson.cborHex) {
        vscode.window.showErrorMessage("Invalid Plutus script file: missing 'cborHex' field.");
        return;
      }

      let firstConfig = getFirstNetworkConfig(context);
      if (firstConfig) {
        // Step 3: Initialize Lucid
        const lucid = await initializeLucid(firstConfig.network, firstConfig.apiKey);

        // Step 4: Generate the script address using cborHex
        const plutusScript = {
          type: "PlutusV2",
          script: scriptJson.cborHex,  // Ensure it's a string
        };

        const scriptAddress = lucid.utils.validatorToAddress(plutusScript);
        vscode.window.showInformationMessage(`Generated script address: ${scriptAddress}`);
        try {
          await lucid.selectWalletFrom({ type: "nami" }); // or "eternl"

        } catch (error) {
          console.error("Failed to connect to wallet:", error);
          vscode.window.showErrorMessage("Failed to connect to wallet. Ensure you are in a browser environment.");
          return;
        }
        // Step 6: Send ADA to the script address
        const tx = await lucid
          .newTx()
          .payToAddress(scriptAddress, { lovelace: 5000000n }) // Sending 5 ADA
          .complete();

        const signedTx = await tx.sign().complete();
        const txHash = await signedTx.submit();

        vscode.window.showInformationMessage(`ADA sent to script address. Transaction Hash: ${txHash}`);
      }
    } catch (error: any) {
      vscode.window.showErrorMessage(`Failed to process the script: ${error.message}`);
    }
  });

  context.subscriptions.push(command);
}