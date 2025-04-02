import * as vscode from "vscode";

export async function initializeLucid(
  selectedNetwork: string,
  apiKey: string
): Promise<any | null> {
  const networkUrls: { [key: string]: string } = {
    Mainnet: "https://cardano-mainnet.blockfrost.io/api/v0",
    Preprod: "https://cardano-preprod.blockfrost.io/api/v0",
    Preview: "https://cardano-preview.blockfrost.io/api/v0",
  };

  const baseUrl = networkUrls[selectedNetwork];
  if (!baseUrl) {
    vscode.window.showErrorMessage(`Invalid network: ${selectedNetwork}`);
    return null;
  }

  try {
    // Dynamically import Lucid and Blockfrost
    const { Blockfrost, Lucid } = await import("lucid-cardano");

    console.log("Initializing Lucid...");
    console.log(`Selected Network: ${selectedNetwork}`); // Debugging: Log the selected network

    let lucid: any;
    if (selectedNetwork === "Mainnet") {
      lucid = await Lucid.new(new Blockfrost(baseUrl, apiKey), "Mainnet");
    } else if (selectedNetwork === "Preprod") {
      lucid = await Lucid.new(new Blockfrost(baseUrl, apiKey), "Preprod");
    } else if (selectedNetwork === "Preview") {
      lucid = await Lucid.new(new Blockfrost(baseUrl, apiKey), "Preview");
    } else {
      vscode.window.showErrorMessage("Network selection is invalid.");

      return null;
    }

    vscode.window.showInformationMessage(
      `Lucid initialized for ${selectedNetwork} network`
    );
    console.log(`Lucid initialized for ${selectedNetwork} network`);

    return lucid;
  } catch (error: any) {
    console.error("Lucid initialization error:", error.message);
    vscode.window.showErrorMessage(
      "Error initializing Lucid with the selected network."
    );

    return null;
  } finally {
    // Ensure the status bar item is shown even if there's an error
  }
}

import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
export async function restoreWallet(
  seedPhrase: string,
  selectedNetwork: string,
  apiKey: string
): Promise<boolean> {
  try {
    // Validate seed phrase
    const seedArray = seedPhrase.trim().split(/\s+/);
    if (seedArray.length < 24) {
      vscode.window.showErrorMessage("Please enter all 24 seed words");
      return false;
    }

    // Validate workspace
    if (!vscode.workspace.workspaceFolders?.length) {
      vscode.window.showErrorMessage(
        "Please open a workspace folder before restoring a wallet"
      );
      return false;
    }

    // Initialize Lucid
    const lucid = await initializeLucid(selectedNetwork, apiKey);

    // Get password
    const password = await vscode.window.showInputBox({
      prompt: "Enter a password to encrypt your wallet",
      password: true,
      ignoreFocusOut: true,
      validateInput: (value) => (value ? undefined : "Password is required"),
    });

    if (!password) {
      vscode.window.showErrorMessage(
        "Wallet restoration canceled. Password is required."
      );
      return false;
    }

    // Process wallet
    const mnemonic = seedArray.join(" ");
    const encryptedMnemonic = encryptMnemonic(mnemonic, password);
    lucid.selectWalletFromSeed(mnemonic);
    const address = await lucid.wallet.address();

    // Prepare file paths
    const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const walletFolder = path.join(
      workspacePath,
      "wallet_details",
      selectedNetwork
    );

    // Create directories if they don't exist
    fs.mkdirSync(walletFolder, { recursive: true });

    // Save wallet file
    const sanitizedAddress = address.replace(/[^a-zA-Z0-9]/g, "_");
    const walletFile = path.join(walletFolder, `${sanitizedAddress}.json`);

    const walletData = {
      address,
      network: selectedNetwork,
      encryptedSeed: encryptedMnemonic,
      createdAt: new Date().toISOString(),
    };

    fs.writeFileSync(walletFile, JSON.stringify(walletData, null, 2));

    vscode.window.showInformationMessage(
      `Wallet restored successfully on ${selectedNetwork}!\n` +
        `Address: ${address}\n` +
        `Saved to: wallet_details/${selectedNetwork}/${sanitizedAddress}.json`
    );

    return true;
  } catch (error) {
    console.error("Wallet restoration error:", error);
    const message = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`Failed to restore wallet: ${message}`);
    return false;
  }
}
export async function createWallet(
  selectedNetwork: string,
  apiKey: string
): Promise<{
  success: boolean;
  message?: string;
  data?: {
    address: string;
    network: string;
    filePath: string;
    mnemonic?: string; // Only included if needed for immediate use
  };
  error?: string;
}> {
  try {
    
        // Ensure workspace exists
        if (!vscode.workspace.workspaceFolders?.length) {
          return {
            success: false,
            error:
              "No workspace folder is open. Please open a workspace before creating a wallet.",
          };
        }

    const lucid = await initializeLucid(selectedNetwork, apiKey);
    const mnemonic = lucid.utils.generateSeedPhrase();

    const password = await vscode.window.showInputBox({
      prompt: "Enter a password for your wallet privacy",
      password: true,
      ignoreFocusOut: true,
      validateInput: (value) => (value ? undefined : "Password is required."),
    });

    if (!password) {
      return {
        success: false,
        error: "Wallet creation canceled. Password is required.",
      };
    }

    // Encrypt the mnemonic
    const encryptedMnemonic = encryptMnemonic(mnemonic, password);

    // Select the wallet from the generated mnemonic
    lucid.selectWalletFromSeed(mnemonic);
    const address = await lucid.wallet.address();

    // Define folder paths
    const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const walletBaseFolderPath = path.join(workspacePath, "wallet_details");
    const walletNetworkFolderPath = path.join(
      walletBaseFolderPath,
      selectedNetwork
    );

    // Ensure directories exist
    fs.mkdirSync(walletBaseFolderPath, { recursive: true });
    fs.mkdirSync(walletNetworkFolderPath, { recursive: true });

    // Sanitize the address for filename
    const sanitizedAddress = address.replace(/[^a-zA-Z0-9]/g, "_");
    const walletFilePath = path.join(
      walletNetworkFolderPath,
      `${sanitizedAddress}.json`
    );

    // Prepare wallet data in JSON format
    const walletData = {
      address,
      network: selectedNetwork,
      encryptedSeed: encryptedMnemonic,
      createdAt: new Date().toISOString(),
    };

    fs.writeFileSync(walletFilePath, JSON.stringify(walletData, null, 2), {
      encoding: "utf-8",
    });

    return {
      success: true,
      message: `Wallet created successfully on ${selectedNetwork}`,
      data: {
        address,
        network: selectedNetwork,
        filePath: `wallet_details/${selectedNetwork}/${sanitizedAddress}.json`,
        mnemonic, // Only include if needed for immediate use (consider security implications)
      },
    };
  } catch (error: any) {
    console.error("Wallet creation error:", error);
    return {
      success: false,
      error: error.message || "Failed to create wallet",
    };
  }
}
function encryptMnemonic(mnemonic: string, password: string): string {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, salt, 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

  let encrypted = cipher.update(mnemonic, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${salt.toString("hex")}:${iv.toString("hex")}:${encrypted}`;
}

function decryptMnemonic(encryptedMnemonic: string, password: string): string {
  const [saltHex, ivHex, encryptedHex] = encryptedMnemonic.split(":");

  if (!saltHex || !ivHex || !encryptedHex) {
    throw new Error("Invalid encrypted mnemonic format.");
  }

  const salt = Buffer.from(saltHex, "hex");
  const iv = Buffer.from(ivHex, "hex");
  const encrypted = encryptedHex; // Keep this as a string

  const key = crypto.scryptSync(password, salt, 32);
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

  // `encrypted` is a string, and 'hex' specifies its encoding
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

function getWorkingDirectory(): string | undefined {
  const folders = vscode.workspace.workspaceFolders;
  if (folders && folders.length > 0) {
    return folders[0].uri.fsPath; // Returns the first workspace folder path
  }
  console.error("No workspace folder is open.");
  return undefined;
}

function getEncryptedSeedFromFile(fileName: string): string {
  try {
    const workingDir = getWorkingDirectory();
    if (!workingDir) {
      throw new Error("Working directory not found.");
    }

    const filePath = path.join(workingDir, "wallet_details", fileName);

    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      throw new Error("File does not exist.");
    }

    const data = fs.readFileSync(filePath, "utf8");
    const match = data.match(/^Encrypted Seed:\s*(.+)$/m);

    if (!match || match.length < 2) {
      throw new Error("Encrypted Seed not found in the file.");
    }

    console.log(`Encrypted seed extracted successfully from ${filePath}`);
    return match[1].trim();
  } catch (error: any) {
    console.error(
      `Failed to extract encrypted seed from ${fileName}:`,
      error.message
    );
    throw error;
  }
}
// Function to send a transaction
export async function sendTransaction(
  senderAddress: string,
  recipientAddress: string,
  amount: number,
  password: string,
  selectedNetwork: string,
  apiKey: string
): Promise<void> {
  try {
    const fileName = `${senderAddress}`;
    const encryptedSeed = getEncryptedSeedFromFile(fileName);
    const mnemonic = decryptMnemonic(encryptedSeed, password);

    const lucid = await initializeLucid(selectedNetwork, apiKey);
    lucid.selectWalletFromSeed(mnemonic);

    const tx = await lucid
      .newTx()
      .payToAddress(recipientAddress, {
        lovelace: BigInt(Number(amount) * 1_000_000),
      })
      .complete();

    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();
    vscode.window.showInformationMessage("transaction successful" + txHash);
    console.log("Transaction successful! TxHash:", txHash);
  } catch (error: any) {
    console.error("Failed to send transaction:", error.message);
  }
}


export async function checkBalance(selectedNetwork: string, apiKey: string) {
  const addr = await vscode.window.showInputBox({
    prompt: "Enter the address",
    ignoreFocusOut: true,
  });

  if (!addr) {
    vscode.window.showErrorMessage("Input is required.");
    return;
  }

  const lucid = await initializeLucid(selectedNetwork, apiKey);
  const utxos = await lucid.utxosAt(addr);
  const balance = utxos.reduce(
    (acc: bigint, utxo: { assets: { lovelace: any } }) =>
      acc + BigInt(utxo.assets.lovelace || 0n),
    0n
  );
  const adaBalance = Number(balance) / 1_000_000;
  vscode.window.showInformationMessage(
    `Available balance: ${adaBalance.toFixed(6)} ADA`
  );
}
