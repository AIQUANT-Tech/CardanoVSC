
// import * as vscode from "vscode";
// import * as fs from "fs/promises";
// import { getFirstNetworkConfig, getNetworkConfigs, integrateCardanoNodeAPI } from "../config/cardanoNodeIntegration";
// import { initializeLucid } from "./implementation";

// export async function selectFile(context: vscode.ExtensionContext) {
//   try {
//     // 📌 Step 1: Check if network is available
//     const networks = await getNetworkConfigs(context);
//     if (!networks || networks.length === 0) {
//       const action = await vscode.window.showErrorMessage(
//         "No Cardano network configured. Would you like to configure one now?",
//         "Configure Network", "Cancel"
//       );
      
//       if (action === "Configure Network") {
//         await integrateCardanoNodeAPI(context);
//       }
//       return;
//     }
    
//     // 📌 Step 1: Select and Parse Plutus File
//     const scriptJson = await selectPlutusFile();
//     if (!scriptJson) {return;}

//     // 📌 Step 2: Get Network Config & Initialize Lucid
//     const firstConfig = getFirstNetworkConfig(context);
//     if (!firstConfig) {throw new Error("Failed to get network configuration.");}

//     const lucid = await initializeLucid(firstConfig.network, firstConfig.apiKey);
//     if (!lucid) {throw new Error("Failed to initialize Lucid.");}

//     // 📌 Step 3: Generate Script Address
//     const scriptAddress = generateScriptAddress(lucid, scriptJson.cborHex);
//     vscode.window.showInformationMessage(`Generated script address: ${scriptAddress}`);
//   } catch (error: any) {
//     vscode.window.showErrorMessage(`Error: ${error.message}`);
//     console.error("Error Details:", error);
//   }
// }

// // 📌 Select and Parse Plutus File
// async function selectPlutusFile(): Promise<any | null> {
//   const scriptUri = await vscode.window.showOpenDialog({
//     canSelectMany: false,
//     openLabel: "Select Plutus Script (.plutus)",
//     filters: { "Plutus Script": ["plutus"] },
//   });

//   if (!scriptUri || scriptUri.length === 0) {
//     vscode.window.showErrorMessage("No script selected.");
//     return null;
//   }

//   const scriptPath = scriptUri[0].fsPath;
//   try {
//     const scriptContent = await fs.readFile(scriptPath, "utf8");
//     const scriptJson = JSON.parse(scriptContent);

//     if (!scriptJson.cborHex) {throw new Error("Invalid Plutus script file: missing 'cborHex' field.");}
//     return scriptJson;
//   } catch (error) {
//     vscode.window.showErrorMessage("Failed to parse Plutus script file.");
//     return null;
//   }
// }

// // 📌 Generate Script Address
// function generateScriptAddress(lucid: any, cborHex: string): string {
//   return lucid.utils.validatorToAddress({ type: "PlutusV2", script: cborHex });
// }
import * as vscode from "vscode";
import * as fs from "fs/promises";
import * as path from "path";
import { getFirstNetworkConfig, getNetworkConfigs, integrateCardanoNodeAPI } from "../config/cardanoNodeIntegration";
import { initializeLucid } from "./implementation";

export async function selectFile(context: vscode.ExtensionContext) {
  try {
    // 1️⃣ Check network availability
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
    
    // 2️⃣ Select and parse Plutus file
    const { scriptJson, scriptPath } = await selectPlutusFile();
    if (!scriptJson || !scriptPath) {return;}

    // 3️⃣ Initialize Lucid with network config
    const firstConfig = getFirstNetworkConfig(context);
    if (!firstConfig) {throw new Error("Failed to get network configuration.");}

    const lucid = await initializeLucid(firstConfig.network, firstConfig.apiKey);
    if (!lucid) {throw new Error("Failed to initialize Lucid.");}

    // 4️⃣ Generate address
    const scriptAddress = generateScriptAddress(lucid, scriptJson.cborHex);
    const addrFilePath = getAddrFilePath(scriptPath);

    // 5️⃣ Check if file exists and confirm overwrite
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

    // 6️⃣ Save address file
    await saveAddressFile(addrFilePath, scriptAddress);
 // Show additional detailed information
const fullPath = path.resolve(addrFilePath);
const addressPreview = scriptAddress.length > 30 
    ? `${scriptAddress.substring(0, 15)}...${scriptAddress.slice(-15)}`
    : scriptAddress;

    vscode.window.showInformationMessage(
      `✅ Script address generated successfully.................................
        📁 Location: ${fullPath}          
        `,
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
    vscode.window.showErrorMessage(`❌ Error: ${error.message}`);
    console.error("Error Details:", error);
  }
}

// 🛠️ Helper function to check file existence
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// 🗺️ Get .addr file path
function getAddrFilePath(plutusPath: string): string {
  return plutusPath.replace(/\.plutus$/i, '.addr');
}

// 💾 Save address to file
async function saveAddressFile(filePath: string, address: string) {
  try {
    await fs.writeFile(filePath, address);
  } catch (error) {
    throw new Error(`Failed to save address file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// 📜 Select and parse Plutus file
async function selectPlutusFile(): Promise<{ scriptJson: any | null, scriptPath: string | null }> {
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
      throw new Error("Invalid Plutus script: missing 'cborHex' field");
    }
    return { scriptJson, scriptPath };
  } catch (error) {
    throw new Error(`Failed to parse Plutus file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// 🔑 Generate script address
function generateScriptAddress(lucid: any, cborHex: string): string {
  if (!cborHex || typeof cborHex !== 'string') {
    throw new Error("Invalid CBOR hex format");
  }
  return lucid.utils.validatorToAddress({ 
    type: "PlutusV2", 
    script: cborHex 
  });
}