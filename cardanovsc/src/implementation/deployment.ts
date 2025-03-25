
import * as vscode from "vscode";
import * as fs from "fs/promises";
import { getFirstNetworkConfig } from "../config/cardanoNodeIntegration";
import { initializeLucid } from "./implementation";

export function selectFile(context: vscode.ExtensionContext) {
  const command = vscode.commands.registerCommand("select_plutus_file", async () => {
    try {
      // 📌 Step 1: Select and Parse Plutus File
      const scriptJson = await selectPlutusFile();
      if (!scriptJson) {return;}

      // 📌 Step 2: Get Network Config & Initialize Lucid
      const firstConfig = getFirstNetworkConfig(context);
      if (!firstConfig) {throw new Error("Failed to get network configuration.");}

      const lucid = await initializeLucid(firstConfig.network, firstConfig.apiKey);
      if (!lucid) {throw new Error("Failed to initialize Lucid.");}

      // 📌 Step 3: Generate Script Address
      const scriptAddress = generateScriptAddress(lucid, scriptJson.cborHex);
      vscode.window.showInformationMessage(`Generated script address: ${scriptAddress}`);


    } catch (error: any) {
      vscode.window.showErrorMessage(`Error: ${error.message}`);
      console.error("Error Details:", error);
    }
  });

  context.subscriptions.push(command);
}

// 📌 Select and Parse Plutus File
async function selectPlutusFile(): Promise<any | null> {
  const scriptUri = await vscode.window.showOpenDialog({
    canSelectMany: false,
    openLabel: "Select Plutus Script (.plutus)",
    filters: { "Plutus Script": ["plutus"] },
  });

  if (!scriptUri || scriptUri.length === 0) {
    vscode.window.showErrorMessage("No script selected.");
    return null;
  }

  const scriptPath = scriptUri[0].fsPath;
  try {
    const scriptContent = await fs.readFile(scriptPath, "utf8");
    const scriptJson = JSON.parse(scriptContent);

    if (!scriptJson.cborHex) {throw new Error("Invalid Plutus script file: missing 'cborHex' field.");}
    return scriptJson;
  } catch (error) {
    vscode.window.showErrorMessage("Failed to parse Plutus script file.");
    return null;
  }
}

// 📌 Generate Script Address
function generateScriptAddress(lucid: any, cborHex: string): string {
  return lucid.utils.validatorToAddress({ type: "PlutusV2", script: cborHex });
}
