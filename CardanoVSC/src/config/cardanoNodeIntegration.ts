
import vscode from 'vscode';
import axios from 'axios';

export async function storeNetworkConfig(selectedNetwork: string, apiKey: string, extensionContext: vscode.ExtensionContext) {
  // Get the existing configurations from global state
  let existingConfigs = extensionContext.globalState.get<{ network: string, apiKey: string }[]>('cardano.node');

  // Ensure it's always an array
  if (!existingConfigs) {
    existingConfigs = []; // Initialize as an empty array if undefined
  } else if (!Array.isArray(existingConfigs)) {
    existingConfigs = [existingConfigs]; // Convert to an array if it's a single object
  }

  // Remove any existing config for the same network to avoid duplicates
  const filteredConfigs = existingConfigs.filter(config => config.network !== selectedNetwork);

  // Add the new config at the beginning and keep only the last three
  const updatedConfigs = [{ network: selectedNetwork, apiKey }, ...filteredConfigs].slice(0, 3);

  // Update the global state with the updated array
  await extensionContext.globalState.update('cardano.node', updatedConfigs);

}
export function getFirstNetworkConfig(extensionContext: vscode.ExtensionContext): { network: string, apiKey: string } | null {
  let storedConfigs = extensionContext.globalState.get<{ network: string, apiKey: string }[]>('cardano.node');

  // Normalize storedConfigs to ensure it's always an array
  if (!storedConfigs) {
    storedConfigs = [];
  } else if (!Array.isArray(storedConfigs)) {
    storedConfigs = [storedConfigs];
  }

  // Return the first config or null if no configs are available
  return storedConfigs.length > 0 ? storedConfigs[0] : null;
}

export async function getNetworkConfigs(extensionContext: vscode.ExtensionContext): Promise<{ network: string, apiKey: string }[]> {
    const configs = extensionContext.globalState.get<{ network: string, apiKey: string }[]>('cardano.node');
    return Array.isArray(configs) ? configs : []; // Ensure an array is always returned
}


export async function integrateCardanoNodeAPI(extensionContext: vscode.ExtensionContext): Promise<boolean> {
    vscode.window.showInformationMessage("Starting Cardano Node API integration...");

    try {
        // Prompt user to select a network
        const selectedNetwork = await vscode.window.showQuickPick(
            ["Mainnet", "Preprod", "Preview"],
            {
                placeHolder: "Select the network for Cardano Node",
                canPickMany: false
            }
        );

        if (!selectedNetwork) {
            vscode.window.showErrorMessage("No network selected.");
            return false;
        }

        // Prompt user to input Blockfrost API key
        const apiKey = await vscode.window.showInputBox({
            prompt: "Enter your Blockfrost API key",
            ignoreFocusOut: true,
            validateInput: (value) => (value ? "" : "API key is required!")
        });

        if (!apiKey) {
            vscode.window.showErrorMessage("API key is required.");
            return false;
        }

       const isValidApiKey = await valApiKey(apiKey,selectedNetwork);
       if (!isValidApiKey) {
        vscode.window.showErrorMessage(
          "Invalid API key! Please check and try again."
        );
        return false;
      }else{
        vscode.window.showInformationMessage(`Successfully connected cardano node on ${selectedNetwork} through blockfrost`);

      }

        // Store the selected network and API key in the global state
        await storeNetworkConfig(selectedNetwork, apiKey, extensionContext);       
        updateStatusBar(selectedNetwork); // Update status bar with selected network
        return true;
    } catch (error: any) {
        vscode.window.showErrorMessage(`Integration failed: ${error.message || error}`);
        return false;
    }
}

 export async function setNetwork(network: string, extensionContext: vscode.ExtensionContext,_extensionUri: vscode.Uri) {
    const networkConfigs = await getNetworkConfigs(extensionContext);
  
    const selectedConfig = networkConfigs.find(config => config.network === network);
    if (!selectedConfig) {
      vscode.window.showErrorMessage(`Configuration not found for ${network}`);
      return false;
    }
  

  
    try {
      // Test the connection
      const isValidApiKey = await valApiKey(selectedConfig.apiKey,selectedConfig.network);
      if (isValidApiKey) {
        vscode.window.showInformationMessage(`Connected to ${network} network`);
        const reorderedConfigs = networkConfigs.filter(config => config.network !== network);
        reorderedConfigs.unshift(selectedConfig);
        await extensionContext.globalState.update('cardano.node', reorderedConfigs);
        const firstConfig = getFirstNetworkConfig(extensionContext);
        updateStatusBar(firstConfig?.network || "No Network");
        return true;
      } else {
        vscode.window.showErrorMessage(`Failed to connect to ${network} network.`);
        return false;
      }
    } catch (error: any) {
      vscode.window.showErrorMessage(`Error connecting to ${network}: ${error.message || error}`);
      return false;
    }
  }
  
export function registerNetworkCommand(context: vscode.ExtensionContext,_extensionUri:vscode.Uri) {
  context.subscriptions.push(vscode.commands.registerCommand('cardano.switchNetwork', async () => {
      const networks = await getNetworkConfigs(context);
      
      // If no networks are configured, prompt to add one
      if (networks.length === 0) {
          const action = await vscode.window.showInformationMessage(
              "No Cardano networks configured. Would you like to add one now?",
              "Yes", "No"
          );
          
          if (action === "Yes") {
            await integrateCardanoNodeAPI(context);
          }
          return;
      } else if(networks.length===1){
        const action = await vscode.window.showInformationMessage(
          "At least two networks are needed to switch. Would you like to add one now?",
          "Yes", "No"
      );
      if (action === "Yes") {
        await integrateCardanoNodeAPI(context);
      }
      return;
      
      }

      // Create quick pick items with additional information
      const networkItems = networks.map(n => ({
          label: n.network,
          description: `API Key: ${n.apiKey.substring(0, 4)}...${n.apiKey.substring(n.apiKey.length - 4)}`,
          network: n.network
      }));

      const selectedItem = await vscode.window.showQuickPick(networkItems, {
          placeHolder: "Select a network to switch to",
          title: "Cardano Networks",
          ignoreFocusOut: true
      });

      if (selectedItem) {
          const success = await setNetwork(selectedItem.network, context, vscode.Uri.parse(""));
          if (success) {
              vscode.window.showInformationMessage(`Switched to ${selectedItem.network} network`);
          }
      }
  }));
}
let statusBarItem: vscode.StatusBarItem;

export function updateStatusBar(network: string) {
  if (statusBarItem) {
      statusBarItem.text = `$(plug) Cardano: ${network}`;
  }
}
export function createStatusBarItem(extensionContext: vscode.ExtensionContext) {
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'cardano.switchNetwork';
  statusBarItem.tooltip = "Click to switch Cardano network";
  statusBarItem.show();
  const firstConfig = getFirstNetworkConfig(extensionContext);
  updateStatusBar(firstConfig?.network || "No Network");

  extensionContext.subscriptions.push(statusBarItem);
}
export async function deleteNetworkConfig(networkToDelete: string, extensionContext: vscode.ExtensionContext,_extensionUri:vscode.Uri): Promise<boolean> {
  try {
      // Get the current network configurations
      const currentConfigs = await getNetworkConfigs(extensionContext);
      
      // Filter out the network to be deleted
      const updatedConfigs = currentConfigs.filter(config => config.network !== networkToDelete);
      
      // Update the global state with the remaining configurations
      await extensionContext.globalState.update('cardano.node', updatedConfigs);
      
      const firstConfig = getFirstNetworkConfig(extensionContext);
      updateStatusBar(firstConfig?.network || "No Network");
      
 
      vscode.window.showInformationMessage(`Deleted ${networkToDelete} network configuration`);

      return true;
  } catch (error: any) {
      vscode.window.showErrorMessage(`Failed to delete network configuration: ${error.message || error}`);
      return false;
  }
}

export function registerDeleteNetworkCommand(context: vscode.ExtensionContext,_extensionUri:vscode.Uri) {
  context.subscriptions.push(vscode.commands.registerCommand('cardanovsc.deleteNetwork', async () => {
      const networks = await getNetworkConfigs(context);
      
      if (networks.length === 0) {
          vscode.window.showInformationMessage("No network configurations to delete");
          return;
      }
      
      const selectedNetwork = await vscode.window.showQuickPick(networks.map(n => n.network), {
          placeHolder: "Select a network to delete"
      });

      if (selectedNetwork) {
          await deleteNetworkConfig(selectedNetwork, context,_extensionUri);
      }
  }));
}


export async function valApiKey(apiKey: string, network: string): Promise<boolean> {
  try {
      const url = `https://cardano-${network}.blockfrost.io/api/v0/blocks/latest`;

      const response = await axios.get(url, {
          headers: { 'project_id': apiKey }
      });

      return response.status === 200;
  } catch (error: any) {
      return false;
  }
}

