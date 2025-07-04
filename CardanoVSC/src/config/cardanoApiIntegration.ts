
import * as vscode from "vscode";
import { exec } from "child_process";
import { extensionCommand } from "../command/registerCommand";

// === Entry Function ===
async function integrateCardanoAPI(
  vscodeModule: typeof vscode,
  extensionContext: vscode.ExtensionContext
): Promise<boolean | undefined> {
  try {
    const network = await vscodeModule.window.showQuickPick(
      ["preprod", "preview", "mainnet"],
      {
        placeHolder: "Select Cardano Network",
        ignoreFocusOut: true,
      }
    );

    if (!network) {
      vscodeModule.window.showWarningMessage("Network selection cancelled.");
      return false;
    }

    const apiKey = await vscodeModule.window.showInputBox({
      prompt: `Enter your ${network === "mainnet" ? "CardanoScan" : "Blockfrost"
        } API Key for ${network}`,
      ignoreFocusOut: true,
    });

    if (!apiKey) {
      vscodeModule.window.showErrorMessage("API key is required.");
      return false;
    }

    // === Validation ===
    const isValid = await validateApiKey(network, apiKey);
    if (!isValid) {
      vscodeModule.window.showErrorMessage("Invalid API Key!");
      return false;
    }


    // === Save to Global State ===
    vscode.commands.executeCommand("setContext", "cardanoNetwork", network);

    extensionContext.globalState.update("cardano.apiKey", apiKey);
    extensionContext.globalState.update("cardano.network", network);
    extensionContext.globalState.update("cardano.provider", network === "mainnet" ? "cardanoscan" : "blockfrost");


    vscodeModule.window.showInformationMessage(
      `Successfully connected to ${network} using ${network === "mainnet" ? "CardanoScan" : "Blockfrost"
      }`
    );
  } catch (err: any) {
    console.error(err.message || err);
    vscode.window.showErrorMessage(`Error: ${err.message || err}`);
  }
}

export async function validateApiKey(
  network: string,
  apiKey: string
): Promise<boolean> {
  let apiUrl: string;
  let headers: Record<string, string> = {};

  if (network === "mainnet") {
    // === CardanoScan mainnet ===
    apiUrl = "https://api.cardanoscan.io/api/v1/block/latest";
    headers = {
      apiKey: apiKey,
      Accept: "application/json",
    };
  } else {
    // === Blockfrost for testnets ===
    const projectId = apiKey;
    const blockfrostNetwork = network === "preprod" ? "preprod" : "preview";
    apiUrl = `https://cardano-${blockfrostNetwork}.blockfrost.io/api/v0/blocks/latest`;
    headers = {
      project_id: projectId,
      Accept: "application/json",
    };
  }

  try {
    const response = await executeCurlCommand(apiUrl, headers);
    return !!response.hash;
  } catch (err) {
    console.error("API Validation Error:", err);
    return false;
  }
}

export function executeCurlCommand(
  apiUrl: string,
  headers: Record<string, string>
): Promise<any> {
  return new Promise((resolve, reject) => {
    const headerStrings = Object.entries(headers)
      .map(([key, value]) => `--header "${key}: ${value}"`)
      .join(" ");

    const curlCommand = `curl -X GET "${apiUrl}" ${headerStrings}`;

    exec(curlCommand, (error, stdout, stderr) => {
      if (error) {
        reject(stderr || error.message);
        return;
      }

      try {
        const jsonResponse = JSON.parse(stdout);
        resolve(jsonResponse);
      } catch (parseError) {
        reject("Failed to parse JSON");
      }
    });
  });
}

export { integrateCardanoAPI };
