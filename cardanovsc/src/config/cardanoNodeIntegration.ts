
import vscode from 'vscode';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
let blockfrostInstance: BlockFrostAPI | null = null;

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

  console.log('Updated network configurations:', updatedConfigs); // Debug log
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

// Retrieve the stored network configurations from global state
export async function getNetworkConfigs(extensionContext: vscode.ExtensionContext): Promise<{ network: string, apiKey: string }[]> {
    const configs = extensionContext.globalState.get<{ network: string, apiKey: string }[]>('cardano.node');
    return Array.isArray(configs) ? configs : []; // Ensure an array is always returned
}


export async function integrateCardanoNodeAPI(extensionContext: vscode.ExtensionContext): Promise<boolean> {
    vscode.window.showInformationMessage("🚀 Starting Cardano Node API integration...");

    try {
        // Prompt user to select a network
        const selectedNetwork = await vscode.window.showQuickPick(
            ["Mainnet", "Preprod", "Preview"],
            {
                placeHolder: "🌐 Select the network for Cardano Node",
                canPickMany: false
            }
        );

        if (!selectedNetwork) {
            vscode.window.showErrorMessage("⚠️ No network selected!");
            return false;
        }

        // Prompt user to input Blockfrost API key
        const apiKey = await vscode.window.showInputBox({
            prompt: "🔑 Enter your Blockfrost API key",
            ignoreFocusOut: true,
            validateInput: (value) => (value ? "" : "API key is required!")
        });

        if (!apiKey) {
            vscode.window.showErrorMessage("⚠️ API key is required!");
            return false;
        }

        console.log(`✅ Received API key for ${selectedNetwork}, initializing Blockfrost instance...`);

        // Create Blockfrost instance
        blockfrostInstance = new BlockFrostAPI({
            projectId: apiKey
        });

        // Test the connection by checking Blockfrost health
        const health = await blockfrostInstance.health();
        if (health.is_healthy) {
            vscode.window.showInformationMessage(`🎉 Successfully connected to Blockfrost on ${selectedNetwork}!`);
        } else {
            vscode.window.showErrorMessage("😷 Blockfrost connection failed. The server might be down.");
            return false;
        }

        // Store the selected network and API key in the global state
        await storeNetworkConfig(selectedNetwork, apiKey, extensionContext);
        updateStatusBar(selectedNetwork); // Update status bar with selected network

        

        console.log("🔗 Blockfrost instance created and Cardano Node configured.");
        return true;
    } catch (error: any) {
        console.error("❌ Error in integration:", error);
        vscode.window.showErrorMessage(`Integration failed: ${error.message || error}`);
        return false;
    }
}

 export async function setNetwork(network: string, extensionContext: vscode.ExtensionContext,_extensionUri: vscode.Uri) {
  console.log("set_network");
    const networkConfigs = await getNetworkConfigs(extensionContext);
  
    const selectedConfig = networkConfigs.find(config => config.network === network);
    if (!selectedConfig) {
      vscode.window.showErrorMessage(`❌ Configuration not found for ${network}`);
      return false;
    }
  
    // Reinitialize Blockfrost instance with the selected network's API key
    blockfrostInstance = new BlockFrostAPI({
      projectId: selectedConfig.apiKey
    });
  
    try {
      // Test the connection
      const health = await blockfrostInstance.health();
      if (health.is_healthy) {
        vscode.window.showInformationMessage(`🎉 Successfully connected to ${network} network!`);
         
        // Reorder the selected network to be at the front and update global state
        const reorderedConfigs = networkConfigs.filter(config => config.network !== network);
        reorderedConfigs.unshift(selectedConfig);
        await extensionContext.globalState.update('cardano.node', reorderedConfigs);
        const firstConfig = getFirstNetworkConfig(extensionContext);

        updateStatusBar(firstConfig?.network || "No Network");
        console.log(`🔄 Connected to ${network} `);
        return true;
      } else {
        vscode.window.showErrorMessage(`😷 Failed to connect to ${network} network.`);
        return false;
      }
    } catch (error: any) {
      vscode.window.showErrorMessage(`❌ Error connecting to ${network}: ${error.message || error}`);
      console.error("Blockfrost connection error:", error);
      return false;
    }
  }
  
  export function registerNetworkCommand(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('cardano.switchNetwork', async () => {
      
        const networks = await getNetworkConfigs(context);
        const selectedNetwork = await vscode.window.showQuickPick(networks.map(n => n.network), {
            placeHolder: "Select a network to switch"
        });

        if (selectedNetwork) {
            await setNetwork(selectedNetwork, context, vscode.Uri.parse(""));
        }
    }));
}
let statusBarItem: vscode.StatusBarItem;

function updateStatusBar(network: string) {
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
