

import * as vscode from "vscode";

export async function initializeLucid(selectedNetwork: string, apiKey: string): Promise<any | null> {
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

        vscode.window.showInformationMessage(`Lucid initialized for ${selectedNetwork} network`);
        console.log(`Lucid initialized for ${selectedNetwork} network`);

        
        return lucid;
    } catch (error: any) {
        console.error("Lucid initialization error:", error.message);
        vscode.window.showErrorMessage("Error initializing Lucid with the selected network.");

        return null;
    } finally {
        // Ensure the status bar item is shown even if there's an error
    }
}

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { BlockFrostAPI } from "@blockfrost/blockfrost-js";

export async function restoreWallet(seedPhrase: string,selectedNetwork: string, apiKey: string): Promise<void> {
    try {
        let mnemonic:any;
        let seedArray=seedPhrase.split(' ');
        if(seedPhrase&&seedArray.length>=24){
            mnemonic=seedPhrase;
      }else{
        vscode.window.showErrorMessage("please enter all seed words");
        return ;
      }
        const lucid = await initializeLucid(selectedNetwork, apiKey);
        

        const password = await vscode.window.showInputBox({
            prompt: "Enter a password for  your wallet",
            password: true,
            ignoreFocusOut: true,
            validateInput: (value) => (value ? undefined : "Password is required."),
        });

        if (!password) {
            vscode.window.showErrorMessage("Wallet creation canceled. Password is required.");
            return;
        }

        // Encrypt the mnemonic
        const encryptedMnemonic = encryptMnemonic(mnemonic, password);
    
        // Select the wallet from the generated mnemonic
        lucid.selectWalletFromSeed(mnemonic);
        const address = await lucid.wallet.address();
        // // Create the wallet_details folder if it doesn't exist
        // const walletFolderPath = path.join(vscode.workspace.workspaceFolders?.[0].uri.fsPath || '', 'wallet_details',selectedNetwork);
        // if (!fs.existsSync(walletFolderPath)) {
        //     fs.mkdirSync(walletFolderPath);
        // }
          
         // Ensure workspace exists
         if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
            vscode.window.showErrorMessage("No workspace folder is open. Please open a workspace before creating a wallet.");
            return;
        }

        // Define folder paths
        const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
        const walletBaseFolderPath = path.join(workspacePath, 'wallet_details');
        const walletNetworkFolderPath = path.join(walletBaseFolderPath, selectedNetwork);

        // Ensure 'wallet_details' folder exists
        if (!fs.existsSync(walletBaseFolderPath)) {
            fs.mkdirSync(walletBaseFolderPath);
        }

        // Ensure network-specific folder exists
        if (!fs.existsSync(walletNetworkFolderPath)) {
            fs.mkdirSync(walletNetworkFolderPath);
        }

        // Sanitize the address to use it as a filename
        const sanitizedAddress = address.replace(/[^a-zA-Z0-9]/g, "_");
        const walletFilePath = path.join(walletNetworkFolderPath, `${sanitizedAddress}.txt`);

        // Prepare wallet data including the network
        const walletData = `Address: ${address}\nNetwork: ${selectedNetwork}\nEncrypted Seed: ${encryptedMnemonic}`;
        fs.writeFileSync(walletFilePath, walletData, { encoding: 'utf-8' });

        vscode.window.showInformationMessage(`Wallet restore successfully on ${selectedNetwork}! Address: ${address}. Wallet file saved in: wallet_details/${sanitizedAddress}.txt`);
        
    } catch (error: any) {
        console.error("Error creating wallet:", error);
        vscode.window.showErrorMessage(`Error restoring wallet: ${error.message || error}`);
    }
}
/*
export async function createWallet(selectedNetwork: string, apiKey: string): Promise<any> {
    try {
        console.log("create by lucid");
        
        const lucid = await initializeLucid(selectedNetwork, apiKey);
        const mnemonic = lucid.utils.generateSeedPhrase();

        const password = await vscode.window.showInputBox({
            prompt: "Enter a password for  your wallet privacy",
            password: true,
            ignoreFocusOut: true,
            validateInput: (value) => (value ? undefined : "Password is required."),
        });

        if (!password) {
            vscode.window.showErrorMessage("Wallet creation canceled. Password is required.");
            return;
        }

        // Encrypt the mnemonic
        const encryptedMnemonic = encryptMnemonic(mnemonic, password);

        // Select the wallet from the generated mnemonic
        lucid.selectWalletFromSeed(mnemonic);
        const address = await lucid.wallet.address();

        // Create the wallet_details folder if it doesn't exist
        const walletFolderPath = path.join(vscode.workspace.workspaceFolders?.[0].uri.fsPath || '', 'wallet_details',selectedNetwork);
        if (!fs.existsSync(walletFolderPath)) {
            fs.mkdirSync(walletFolderPath);
        }
       
        // Sanitize the address to use it as a filename
        const sanitizedAddress = address.replace(/[^a-zA-Z0-9]/g, "_");
        const walletFilePath = path.join(walletFolderPath, `${sanitizedAddress}.txt`);

        // Prepare wallet data including the network
        const walletData = `Address: ${address}\nNetwork: ${selectedNetwork}\nEncrypted Seed: ${encryptedMnemonic}`;
        fs.writeFileSync(walletFilePath, walletData, { encoding: 'utf-8' });

        vscode.window.showInformationMessage(`Wallet created successfully on ${selectedNetwork}! Address: ${address}. Wallet file saved in: wallet_details/${sanitizedAddress}.txt`);
        console.log(`Wallet created successfully! Address: ${address}`);
        console.log(`Mnemonic (for development): ${mnemonic}`); // Remove this in production.
        return mnemonic;
    } catch (error: any) {
        console.error("Error creating wallet:", error);
        vscode.window.showErrorMessage(`Error creating wallet: ${error.message || error}`);
    }
}*/
export async function createWallet(selectedNetwork: string, apiKey: string): Promise<any> {
    try {
        console.log("create by lucid");

        const lucid = await initializeLucid(selectedNetwork, apiKey);
        const mnemonic = lucid.utils.generateSeedPhrase();

        const password = await vscode.window.showInputBox({
            prompt: "Enter a password for your wallet privacy",
            password: true,
            ignoreFocusOut: true,
            validateInput: (value) => (value ? undefined : "Password is required."),
        });

        if (!password) {
            vscode.window.showErrorMessage("Wallet creation canceled. Password is required.");
            return;
        }

        // Encrypt the mnemonic
        const encryptedMnemonic = encryptMnemonic(mnemonic, password);

        // Select the wallet from the generated mnemonic
        lucid.selectWalletFromSeed(mnemonic);
        const address = await lucid.wallet.address();

        // Ensure workspace exists
        if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
            vscode.window.showErrorMessage("No workspace folder is open. Please open a workspace before creating a wallet.");
            return;
        }

        // Define folder paths
        const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
        const walletBaseFolderPath = path.join(workspacePath, 'wallet_details');
        const walletNetworkFolderPath = path.join(walletBaseFolderPath, selectedNetwork);

        // Ensure 'wallet_details' folder exists
        if (!fs.existsSync(walletBaseFolderPath)) {
            fs.mkdirSync(walletBaseFolderPath);
        }

        // Ensure network-specific folder exists
        if (!fs.existsSync(walletNetworkFolderPath)) {
            fs.mkdirSync(walletNetworkFolderPath);
        }

        // Sanitize the address to use it as a filename
        const sanitizedAddress = address.replace(/[^a-zA-Z0-9]/g, "_");
        const walletFilePath = path.join(walletNetworkFolderPath, `${sanitizedAddress}.txt`);

        // Prepare wallet data including the network
        const walletData = `Address: ${address}\nNetwork: ${selectedNetwork}\nEncrypted Seed: ${encryptedMnemonic}`;
        fs.writeFileSync(walletFilePath, walletData, { encoding: 'utf-8' });

        vscode.window.showInformationMessage(`Wallet created successfully on ${selectedNetwork}! Address: ${address}. Wallet file saved in: wallet_details/${selectedNetwork}/${sanitizedAddress}.txt`);
       
        
        return mnemonic;
    } catch (error: any) {
        console.error("Error creating wallet:", error);
        vscode.window.showErrorMessage(`Error creating wallet: ${error.message || error}`);
    }
}



function encryptMnemonic(mnemonic: string, password: string): string {
    const salt = crypto.randomBytes(16);
    const key = crypto.scryptSync(password, salt, 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let encrypted = cipher.update(mnemonic, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${salt.toString('hex')}:${iv.toString('hex')}:${encrypted}`;
}

function decryptMnemonic(encryptedMnemonic: string, password: string): string {
    const [saltHex, ivHex, encryptedHex] = encryptedMnemonic.split(':');
    
    if (!saltHex || !ivHex || !encryptedHex) {
        throw new Error('Invalid encrypted mnemonic format.');
    }

    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = encryptedHex; // Keep this as a string

    const key = crypto.scryptSync(password, salt, 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    // `encrypted` is a string, and 'hex' specifies its encoding
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

 
function getWorkingDirectory(): string | undefined {
    const folders = vscode.workspace.workspaceFolders;
    if (folders && folders.length > 0) {
        return folders[0].uri.fsPath;  // Returns the first workspace folder path
    }
    console.error('No workspace folder is open.');
    return undefined;
}

function getEncryptedSeedFromFile(fileName: string): string {
    try {
        const workingDir = getWorkingDirectory();
        if (!workingDir) {
            throw new Error('Working directory not found.');
        }

        const filePath = path.join(workingDir, 'wallet_details', fileName);

        if (!fs.existsSync(filePath)) {
            console.error(`File not found: ${filePath}`);
            throw new Error('File does not exist.');
        }

        const data = fs.readFileSync(filePath, 'utf8');
        const match = data.match(/^Encrypted Seed:\s*(.+)$/m);

        if (!match || match.length < 2) {
            throw new Error('Encrypted Seed not found in the file.');
        }

        console.log(`Encrypted seed extracted successfully from ${filePath}`);
        return match[1].trim();

    } catch (error: any) {
        console.error(`Failed to extract encrypted seed from ${fileName}:`, error.message);
        throw error;
    }
}
// Function to send a transaction
export async function sendTransaction(senderAddress:string,recipientAddress:string,amount:number,password:string,selectedNetwork: string, apiKey: string): Promise<void> {
    try {
        

        const fileName = `${senderAddress}`;
        const encryptedSeed = getEncryptedSeedFromFile(fileName);
        const mnemonic = decryptMnemonic(encryptedSeed, password);

        const lucid = await initializeLucid(selectedNetwork, apiKey);
        lucid.selectWalletFromSeed(mnemonic);
          
        const tx = await lucid.newTx()
            .payToAddress(recipientAddress, { lovelace: BigInt(Number(amount) * 1_000_000) })
            .complete();

        const signedTx = await tx.sign().complete();
        const txHash = await signedTx.submit();
        vscode.window.showInformationMessage("transaction successful"+txHash);
        console.log('Transaction successful! TxHash:', txHash);
    } catch (error:any) {
        console.error('Failed to send transaction:', error.message);
    }
}


async function promptUser(question: string, isPassword: boolean = false): Promise<string> {
    const answer = await vscode.window.showInputBox({
        prompt: question,
        password: isPassword,
        ignoreFocusOut: true,  // Keeps the input box open even if the user clicks outside
        validateInput: (value) => (value ? undefined : "Input is required."),
    });

    if (!answer) {
        throw new Error("Input is required.");
    }

    return answer;
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
    const balance = utxos.reduce((acc: bigint, utxo: { assets: { lovelace: any } }) => 
        acc + BigInt(utxo.assets.lovelace || 0n), 
        0n
    );
    console.log(balance);
    const adaBalance = Number(balance) / 1_000_000;
    vscode.window.showInformationMessage(`Available balance: ${adaBalance.toFixed(6)} ADA`);    
}
