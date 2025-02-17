import * as vscode from "vscode";
import { exec } from "child_process";

async function integrateCardanoAPI(
  vscode: any,
  extensionContext: vscode.ExtensionContext
): Promise<boolean|undefined> {
  vscode.window.showInformationMessage("API integration");

  try {
    // Ask the user to select a network
    const selectedNetwork = await vscode.window.showQuickPick(
      ["Mainnet", "Preprod", "Preview"],
      { placeHolder: "Select the network" }
    );

    if (!selectedNetwork) {
      vscode.window.showErrorMessage("No network selected!");
      return false;
    }

    // Ask the user to enter their API key
    const apiKey = await vscode.window.showInputBox({
      prompt: "Enter your CardanoScan API key",
      ignoreFocusOut: true,
    });

    if (!apiKey) {
      vscode.window.showErrorMessage("API key is required!");
      return false;
    }
    console.log("API key received");

    // Validate the API key by sending a test request via curl
    const isValidApiKey = await validateApiKey(apiKey, selectedNetwork);
    console.log("API key validation:", isValidApiKey);

    if (!isValidApiKey) {
      vscode.window.showErrorMessage(
        "Invalid API key! Please check and try again."
      );
      return true;
    }

    // Only update globalState after API key is valid

    if (extensionContext && extensionContext.globalState) {
      extensionContext.globalState.update("cardano.network", selectedNetwork);
      extensionContext.globalState.update("cardano.apiKey", apiKey);
      console.log("Global state updated");

      // Show confirmation message
      vscode.window.showInformationMessage(
        `API integration selected for ${selectedNetwork} with API key: ${apiKey}`
      );
    } else {
      console.error("GlobalState is not available in extensionContext");
      vscode.window.showErrorMessage("Failed to update global state.");
    }
  } catch (error: any) {
    console.error("An error occurred:", error.message || error);
    vscode.window.showErrorMessage(
      `An error occurred: ${error.message || error}`
    );
  }
}


function executeCurlCommand(apiUrl: string, apiKey: string|undefined): Promise<any> {
  return new Promise((resolve, reject) => {
    const curlCommand = `curl -X GET "${apiUrl}" \
  --header "apiKey: ${apiKey}" \
  --header "Accept: application/json" \
  --header "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"`;

    exec(curlCommand, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
      }

      try {
        const jsonResponse = JSON.parse(stdout);
        resolve(jsonResponse);
      } catch (parseError) {
        reject(new Error("Failed to parse API response as JSON."));
      }
    });
  });
}


async function validateApiKey(apiKey: string |undefined, network: string): Promise<boolean> {
  const baseUrl = "https://api.cardanoscan.io/api/v1"; // Corrected base URL for the API
  const endpoint = `${baseUrl}/block/latest`; // Replace with actual endpoint for validation

  try {
    const response = await executeCurlCommand(endpoint, apiKey);
    if (response.hash) {
      console.log("Valid API key!");
      return true;
    } else {
      console.error("Unexpected response format");
      return false;
    }
  } catch (error:any) {
    console.error(error.message);
    return false;
  }
}

export { integrateCardanoAPI ,validateApiKey};





