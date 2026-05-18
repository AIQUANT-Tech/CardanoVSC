import * as vscode from "vscode";
import * as fs from "fs/promises";
import * as path from "path";
import { getFirstNetworkConfig, getNetworkConfigs, integrateCardanoNodeAPI } from "../config/cardanoNodeIntegration";
import { initializeLucid } from "./implementation";

export async function selectFile(context: vscode.ExtensionContext,_extensionUri:vscode.Uri) {
  try {
    const networks = await getNetworkConfigs(context);
    if (!networks || networks.length === 0) {
      const action = await vscode.window.showErrorMessage(
        "No Cardano network configured. Would you like to configure one now?",
        "Configure Network", "Cancel"
      );
      if (action === "Configure Network") {
        await integrateCardanoNodeAPI(context);
      }
      return;
    }

    const { scriptJson, scriptPath } = await selectPlutusFile();
    if (!scriptJson || !scriptPath) {return;}

    const firstConfig = getFirstNetworkConfig(context);
    if (!firstConfig) {throw new Error("Failed to get network configuration.");}

    const lucid = await initializeLucid(firstConfig.network, firstConfig.apiKey);
    if (!lucid) {throw new Error("Failed to initialize Lucid.");}

    const scriptAddress = generateScriptAddress(lucid, scriptJson.cborHex);
    const addrFilePath = getAddrFilePath(scriptPath);

    if (await fileExists(addrFilePath)) {
      const overwrite = await vscode.window.showWarningMessage(
        `Address file "${path.basename(addrFilePath)}" already exists. Overwrite?`,
        { modal: true },
        "Overwrite", "Cancel"
      );
      
      if (overwrite !== "Overwrite") {
        vscode.window.showInformationMessage("Operation cancelled.");
        return;
      }
    }

    await saveAddressFile(addrFilePath, scriptAddress);
    const fullPath = path.resolve(addrFilePath);
    vscode.window.showInformationMessage(
      `Script address generated. Location: ${fullPath}`,
      "Open Folder",
      "Copy Address"
    ).then((selection) => {
      if (selection === "Open Folder") {
        vscode.commands.executeCommand("revealFileInOS", vscode.Uri.file(fullPath));
      } else if (selection === "Copy Address") {
        vscode.env.clipboard.writeText(scriptAddress);
        vscode.window.showInformationMessage("Address copied successfully");
      }
    });
    

  } catch (error: any) {
    vscode.window.showErrorMessage(`Error: ${error.message}`);
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function getAddrFilePath(plutusPath: string): string {
  return plutusPath.replace(/\.plutus$/i, '.addr');
}

async function saveAddressFile(filePath: string, address: string) {
  try {
    await fs.writeFile(filePath, address);
  } catch (error) {
    throw new Error(`Failed to save address file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function selectPlutusFile(): Promise<{ scriptJson: any | null, scriptPath: string | null }> {
  const scriptUri = await vscode.window.showOpenDialog({
    canSelectMany: false,
    openLabel: "Select Plutus Script",
    filters: { "Plutus Files": ["plutus"] },
  });

  if (!scriptUri?.length) {
    vscode.window.showWarningMessage("No script selected.");
    return { scriptJson: null, scriptPath: null };
  }

  const scriptPath = scriptUri[0].fsPath;
  try {
    const scriptContent = await fs.readFile(scriptPath, "utf8");
    const scriptJson = JSON.parse(scriptContent);

    if (!scriptJson.cborHex) {
      throw new Error("Invalid Plutus script: The file must contain a 'cborHex' field");
    }
    if (typeof scriptJson.cborHex !== 'string') {
      throw new Error("Invalid Plutus script: 'cborHex' must be a string");
    }
    return { scriptJson, scriptPath };
  } catch (error:any) {
    let errorMessage = "Failed to process Plutus script file";
    
    if (error instanceof SyntaxError) {
      errorMessage = "Invalid JSON format in Plutus script file";
    } else if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
    } else {
      errorMessage += `: ${String(error)}`;
    }
    
    throw new Error(errorMessage);
  }
}

export function generateScriptAddress(lucid: any, cborHex: string): string {
  if (!cborHex || typeof cborHex !== 'string') {
    throw new Error("Invalid CBOR hex format");
  }
  return lucid.utils.validatorToAddress({ 
    type: "PlutusV2", 
    script: cborHex 
  });
}