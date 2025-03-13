// ///inline datum 
// /*
// import * as vscode from "vscode";
// import * as fs from "fs/promises";
// import { getFirstNetworkConfig } from "../config/cardanoNodeIntegration";
// import { initializeLucid } from "./implementation";

// export function selectFile(context: vscode.ExtensionContext) {
//   const command = vscode.commands.registerCommand("select_plutus_file", async () => {
//     try {
//       const { Data } = await import("lucid-cardano");

//       // Step 1: Select and parse Plutus script file
//       const scriptJson = await selectPlutusFile();
//       if (!scriptJson) {return;}
//       console.log("Script JSON:", scriptJson); // Debugging

//       // Step 2: Get network config and initialize Lucid
//       const firstConfig = getFirstNetworkConfig(context);
//       if (!firstConfig) {
//         vscode.window.showErrorMessage("Failed to get network configuration.");
//         return;
//       }
//       console.log("Network Config:", firstConfig); // Debugging

//       const lucid = await initializeLucid(firstConfig.network, firstConfig.apiKey);
//       if (!lucid) {
//         vscode.window.showErrorMessage("Failed to initialize Lucid.");
//         return;
//       }
//       console.log("Lucid Initialized:", lucid); // Debugging

//       // Step 3: Generate script address
//       const scriptAddress = generateScriptAddress(lucid, scriptJson.cborHex);
//       vscode.window.showInformationMessage(`Generated script address: ${scriptAddress}`);
//       console.log("Script Address:", scriptAddress); // Debugging

//       // Step 4: Use hardcoded seed phrase
//       const hardcodedSeed = [
//         "boring", "asthma", "range", "orange", "pistol", "bunker",
//         "gun", "scene", "advice", "frost", "damp", "idle",
//         "knife", "dash", "deputy", "tank", "north", "try",
//         "mimic", "awkward", "boy", "area", "loop", "poet"
//       ].join(" "); // Convert array to a single string with spaces
//       lucid.selectWalletFromSeed(hardcodedSeed);
//       console.log("Wallet Selected:", lucid.wallet); // Debugging

//       // Step 5: Get wallet address
//       const walletAddress = await lucid.wallet.address();
//       console.log("Wallet Address:", walletAddress);

//       // Step 6: Check wallet balance
//       const walletBalance = await lucid.wallet.getUtxos();
//       const totalBalance = walletBalance.reduce(
//         (sum: bigint, utxo: { assets: { lovelace: string | number | bigint } }) => sum + BigInt(utxo.assets.lovelace),
//         0n // Initial value is 0n (BigInt)
//       );
//       console.log("Wallet Balance:", totalBalance.toString()); // Debugging

//       if (totalBalance < 2_000_000n) { // Ensure enough for 1 ADA + fees
//         vscode.window.showErrorMessage("Insufficient funds in wallet. Please fund the wallet.");
//         return;
//       }

//       // Step 7: Ask the user to select a datum type
//       const datumType = await vscode.window.showQuickPick(
//         ["Inline Datum", "Datum Hash", "Custom Datum"],
//         { placeHolder: "Select datum type" }
//       );

//       if (!datumType) {
//         vscode.window.showErrorMessage("No datum type selected.");
//         return;
//       }

//       let datumPayload;
//       if (datumType === "Inline Datum") {
//         // Use an inline datum
//         const inlineDatum = Data.to(42n); // Example: A simple integer datum
//         datumPayload = { inline: inlineDatum };
//         console.log("Inline Datum:", inlineDatum);
//       } else if (datumType === "Datum Hash") {
//         // Use a datum hash
//         const datum = Data.to(42n); // Example: A simple integer datum
//         const datumHash = Data.to(datum); // Hash the datum
//         datumPayload = { hash: datumHash };
//         console.log("Datum Hash:", datumHash);
//       } else if (datumType === "Custom Datum") {
//         // Use a custom datum
//         const customDatum = {
//           fields: [
//             { int: 42 }, // Example: A simple integer
//             { bytes: "deadbeef" }, // Example: A byte string
//             { list: [{ int: 1 }, { int: 2 }, { int: 3 }] }, // Example: A list of integers
//           ],
//         };
//         const datum = Data.fromJson(customDatum);
//         datumPayload = { inline: datum };
//         console.log("Custom Datum:", datum);
//       }

//       // Step 8: Build and submit the transaction
//       const tx = await lucid
//         .newTx()
//         .payToContract(scriptAddress, datumPayload, { lovelace: BigInt(1_000_000) }) // Lock 1 ADA
//         .complete();

//       const signedTx = await tx.sign().complete();
//       const txHash = await signedTx.submit();

//       vscode.window.showInformationMessage(`Lock Transaction Submitted! TX Hash: ${txHash}`);
//       console.log("Lock Transaction Submitted"); // Debugging
//     } catch (error: any) {
//       vscode.window.showErrorMessage(`Error: ${error.message}`);
//       console.error("Error Details:", error); // Debugging
//     }
//   });

//   context.subscriptions.push(command);
// }

// async function selectPlutusFile(): Promise<any> {
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
//   const scriptContent = await fs.readFile(scriptPath, "utf8");

//   try {
//     const scriptJson = JSON.parse(scriptContent);
//     if (!scriptJson.cborHex) {
//       vscode.window.showErrorMessage("Invalid Plutus script file: missing 'cborHex' field.");
//       return null;
//     }
//     return scriptJson;
//   } catch (error) {
//     vscode.window.showErrorMessage("Failed to parse Plutus script file as JSON.");
//     return null;
//   }
// }

// function generateScriptAddress(lucid: any, cborHex: string): string {
//   const plutusScript = { type: "PlutusV2", script: cborHex };
//   return lucid.utils.validatorToAddress(plutusScript);
// }*/
// /*
// import * as vscode from "vscode";
// import * as fs from "fs/promises";
// import { getFirstNetworkConfig } from "../config/cardanoNodeIntegration";
// import { initializeLucid } from "./implementation";

// export function selectFile(context: vscode.ExtensionContext) {
//   const command = vscode.commands.registerCommand("select_plutus_file", async () => {
//     try {
//       const { Data ,Constr} = await import("lucid-cardano");

//       // Step 1: Select and parse Plutus script file
//       const scriptJson = await selectPlutusFile();
//       if (!scriptJson) return;
//       console.log("Script JSON:", scriptJson); // Debugging

//       // Step 2: Get network config and initialize Lucid
//       const firstConfig = getFirstNetworkConfig(context);
//       if (!firstConfig) {
//         vscode.window.showErrorMessage("Failed to get network configuration.");
//         return;
//       }
//       console.log("Network Config:", firstConfig); // Debugging

//       const lucid = await initializeLucid(firstConfig.network, firstConfig.apiKey);
//       if (!lucid) {
//         vscode.window.showErrorMessage("Failed to initialize Lucid.");
//         return;
//       }
//       console.log("Lucid Initialized:", lucid); // Debugging

//       // Step 3: Generate script address
//       const scriptAddress = generateScriptAddress(lucid, scriptJson.cborHex);
//       vscode.window.showInformationMessage(`Generated script address: ${scriptAddress}`);
//       console.log("Script Address:", scriptAddress); // Debugging

//       // Step 4: Use hardcoded seed phrase
//       const hardcodedSeed = [
//         "boring", "asthma", "range", "orange", "pistol", "bunker",
//         "gun", "scene", "advice", "frost", "damp", "idle",
//         "knife", "dash", "deputy", "tank", "north", "try",
//         "mimic", "awkward", "boy", "area", "loop", "poet"
//       ].join(" "); // Convert array to a single string with spaces
//       lucid.selectWalletFromSeed(hardcodedSeed);
//       console.log("Wallet Selected:", lucid.wallet); // Debugging

//       // Step 5: Get wallet address
//       const walletAddress = await lucid.wallet.address();
//       console.log("Wallet Address:", walletAddress);

//       // Step 6: Check wallet balance
//       const walletBalance = await lucid.wallet.getUtxos();
//       const totalBalance = walletBalance.reduce(
//         (sum: bigint, utxo: { assets: { lovelace: string | number | bigint } }) => sum + BigInt(utxo.assets.lovelace),
//         0n // Initial value is 0n (BigInt)
//       );
//       console.log("Wallet Balance:", totalBalance.toString()); // Debugging

//       if (totalBalance < 2_000_000n) { // Ensure enough for 1 ADA + fees
//         vscode.window.showErrorMessage("Insufficient funds in wallet. Please fund the wallet.");
//         return;
//       }

//       // Step 7: Ask the user to select a datum type
//       const datumType = await vscode.window.showQuickPick(
//         ["Inline Datum", "Datum Hash", "Custom Datum"],
//         { placeHolder: "Select datum type" }
//       );

//       if (!datumType) {
//         vscode.window.showErrorMessage("No datum type selected.");
//         return;
//       }

//       let datumPayload;
//       if (datumType === "Inline Datum") {
//         // Use an inline datum
//         const inlineDatum = Data.to(42n); // Example: A simple integer datum
//         datumPayload = { inline: inlineDatum };
//         console.log("Inline Datum:", inlineDatum);
//       } else if (datumType === "Datum Hash") {
//         // Use a datum hash

//         const datum = Data.to(42n); // Example: A simple integer datum
//         const datumHash = lucid.utils.datumToHash(datum); // Compute the hash of the datum
//         datumPayload = { hash: datumHash };
//         console.log("Datum Hash:", datumHash);
//       } else if (datumType === "Custom Datum") {
        

//         const userStateDatum = new Constr(0, [
//           Buffer.from("xyz").toString("hex"),
//           BigInt(Math.floor(456)),
//         ]);
//         datumPayload = { inline: Data.to(userStateDatum)};
//       }

//       // Step 8: Build and submit the transaction
//       const tx = await lucid
//         .newTx()
//         .payToContract(scriptAddress, datumPayload, { lovelace: BigInt(1_000_000) }) // Lock 1 ADA
//         .complete();

//       const signedTx = await tx.sign().complete();
//       const txHash = await signedTx.submit();

//       vscode.window.showInformationMessage(`Lock Transaction Submitted! TX Hash: ${txHash}`);
//       console.log("Lock Transaction Submitted"); // Debugging
//     } catch (error: any) {
//       vscode.window.showErrorMessage(`Error: ${error.message}`);
//       console.error("Error Details:", error); // Debugging
//     }
//   });

//   context.subscriptions.push(command);
// }

// async function selectPlutusFile(): Promise<any> {
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
//   const scriptContent = await fs.readFile(scriptPath, "utf8");

//   try {
//     const scriptJson = JSON.parse(scriptContent);
//     if (!scriptJson.cborHex) {
//       vscode.window.showErrorMessage("Invalid Plutus script file: missing 'cborHex' field.");
//       return null;
//     }
//     return scriptJson;
//   } catch (error) {
//     vscode.window.showErrorMessage("Failed to parse Plutus script file as JSON.");
//     return null;
//   }
// }

// function generateScriptAddress(lucid: any, cborHex: string): string {
//   const plutusScript = { type: "PlutusV2", script: cborHex };
//   return lucid.utils.validatorToAddress(plutusScript);
// }*/
// /*
// import * as vscode from "vscode";
// import * as fs from "fs/promises";
// import { getFirstNetworkConfig } from "../config/cardanoNodeIntegration";
// import { initializeLucid } from "./implementation";

// export function selectFile(context: vscode.ExtensionContext) {
//   const command = vscode.commands.registerCommand("select_plutus_file", async () => {
//     try {
//       const { Data, Constr } = await import("lucid-cardano");

//       // Step 1: Select and parse Plutus script file
//       const scriptJson = await selectPlutusFile();
//       if (!scriptJson) return;
//       console.log("Script JSON:", scriptJson);

//       // Step 2: Get network config and initialize Lucid
//       const firstConfig = getFirstNetworkConfig(context);
//       if (!firstConfig) {
//         vscode.window.showErrorMessage("Failed to get network configuration.");
//         return;
//       }
//       console.log("Network Config:", firstConfig);

//       const lucid = await initializeLucid(firstConfig.network, firstConfig.apiKey);
//       if (!lucid) {
//         vscode.window.showErrorMessage("Failed to initialize Lucid.");
//         return;
//       }
//       console.log("Lucid Initialized:", lucid);

//       // Step 3: Generate script address
//       const scriptAddress = generateScriptAddress(lucid, scriptJson.cborHex);
//       vscode.window.showInformationMessage(`Generated script address: ${scriptAddress}`);
//       console.log("Script Address:", scriptAddress);

//       // Step 4: Use hardcoded seed phrase
//       const hardcodedSeed = [
//         "boring", "asthma", "range", "orange", "pistol", "bunker",
//         "gun", "scene", "advice", "frost", "damp", "idle",
//         "knife", "dash", "deputy", "tank", "north", "try",
//         "mimic", "awkward", "boy", "area", "loop", "poet"
//       ].join(" ");
//       lucid.selectWalletFromSeed(hardcodedSeed);
//       console.log("Wallet Selected:", lucid.wallet);

//       // Step 5: Get wallet address
//       const walletAddress = await lucid.wallet.address();
//       console.log("Wallet Address:", walletAddress);

//       // Step 6: Check wallet balance
//       const walletBalance = await lucid.wallet.getUtxos();
//       const totalBalance = walletBalance.reduce(
//         (sum: bigint, utxo: { assets: { lovelace: string | number | bigint } }) => sum + BigInt(utxo.assets.lovelace),
//         0n
//       );
//       console.log("Wallet Balance:", totalBalance.toString());

//       if (totalBalance < 2_000_000n) {
//         vscode.window.showErrorMessage("Insufficient funds in wallet. Please fund the wallet.");
//         return;
//       }

//       // Step 7: Ask the user to select a datum type
//       const datumType = await vscode.window.showQuickPick(
//         ["Inline Datum", "Datum Hash", "Custom Datum File"],
//         { placeHolder: "Select datum type" }
//       );

//       if (!datumType) {
//         vscode.window.showErrorMessage("No datum type selected.");
//         return;
//       }

//       let datumPayload;
//       if (datumType === "Inline Datum") {
//         // Allow the user to input an inline datum
//         const inlineDatumInput = await vscode.window.showInputBox({
//           prompt: "Enter your inline datum (e.g., a JSON string or a number)",
//           placeHolder: 'Example: { "key": "value" } or 42'
//         });

//         if (!inlineDatumInput) {
//           vscode.window.showErrorMessage("No inline datum provided.");
//           return;
//         }

//         try {
//           // Try to parse the input as JSON
//           const parsedDatum = JSON.parse(inlineDatumInput);
//           console.log(parsedDatum);
//           // Use Data.fromJson() for JSON objects
//           datumPayload = { inline: Data.to(inlineDatumInput)};
//           console.log("Inline Datum (JSON):", datumPayload);
//         } catch (jsonError) {
//           // If it's not valid JSON, treat it as a raw value (e.g., a number or string)
//           if (
//             typeof inlineDatumInput === "string" ||
//             typeof inlineDatumInput === "number" ||
//             typeof inlineDatumInput === "boolean"
//           ) {
//             // Use Data.to() for primitive types
//             datumPayload = { inline: Data.to(inlineDatumInput) };
//             console.log("Inline Datum (Raw):", datumPayload);
//           } else {
//             vscode.window.showErrorMessage("Invalid datum input. Must be a JSON string, number, or string.");
//             return;
//           }
//         }
//       } else if (datumType === "Datum Hash") {
//         // Handle datum hash logic
//         // ...
//       } else if (datumType === "Custom Datum File") {
//         // Handle custom datum file logic
//         // ...
//       }

//       // Step 8: Build and submit the transaction
//       const tx = await lucid
//         .newTx()
//         .payToContract(scriptAddress, datumPayload, { lovelace: BigInt(1_000_000) })
//         .complete();

//       const signedTx = await tx.sign().complete();
//       const txHash = await signedTx.submit();

//       vscode.window.showInformationMessage(`Lock Transaction Submitted! TX Hash: ${txHash}`);
//       console.log("Lock Transaction Submitted");
//     } catch (error: any) {
//       vscode.window.showErrorMessage(`Error: ${error.message}`);
//       console.error("Error Details:", error);
//     }
//   });

//   context.subscriptions.push(command);
// }

// async function selectPlutusFile(): Promise<any> {
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
//   const scriptContent = await fs.readFile(scriptPath, "utf8");

//   try {
//     const scriptJson = JSON.parse(scriptContent);
//     if (!scriptJson.cborHex) {
//       vscode.window.showErrorMessage("Invalid Plutus script file: missing 'cborHex' field.");
//       return null;
//     }
//     return scriptJson;
//   } catch (error) {
//     vscode.window.showErrorMessage("Failed to parse Plutus script file as JSON.");
//     return null;
//   }
// }

// function generateScriptAddress(lucid: any, cborHex: string): string {
//   const plutusScript = { type: "PlutusV2", script: cborHex };
//   return lucid.utils.validatorToAddress(plutusScript);
// }*/

// // import * as vscode from "vscode";
// // import * as fs from "fs/promises";
// // import { getFirstNetworkConfig } from "../config/cardanoNodeIntegration";
// // import { initializeLucid } from "./implementation";

// // export function selectFile(context: vscode.ExtensionContext) {
// //   const command = vscode.commands.registerCommand("select_plutus_file", async () => {
// //     try {
      
// //       // Step 1: Select and parse Plutus script file
// //       const scriptJson = await selectPlutusFile();
// //       if (!scriptJson) return;
// //       console.log("Script JSON:", scriptJson);

// //       // Step 2: Get network config and initialize Lucid
// //       const firstConfig = getFirstNetworkConfig(context);
// //       if (!firstConfig) {
// //         vscode.window.showErrorMessage("Failed to get network configuration.");
// //         return;
// //       }
// //       console.log("Network Config:", firstConfig);

// //       const lucid = await initializeLucid(firstConfig.network, firstConfig.apiKey);
// //       if (!lucid) {
// //         vscode.window.showErrorMessage("Failed to initialize Lucid.");
// //         return;
// //       }
// //       console.log("Lucid Initialized:", lucid);

// //       // Step 3: Generate script address
// //       const scriptAddress = generateScriptAddress(lucid, scriptJson.cborHex);
// //       vscode.window.showInformationMessage(`Generated script address: ${scriptAddress}`);
// //       console.log("Script Address:", scriptAddress);

// //       // Step 4: Use hardcoded seed phrase
// //       const hardcodedSeed = [
// //         "boring", "asthma", "range", "orange", "pistol", "bunker",
// //         "gun", "scene", "advice", "frost", "damp", "idle",
// //         "knife", "dash", "deputy", "tank", "north", "try",
// //         "mimic", "awkward", "boy", "area", "loop", "poet"
// //       ].join(" ");
// //       lucid.selectWalletFromSeed(hardcodedSeed);
// //       console.log("Wallet Selected:", lucid.wallet);

// //       // Step 5: Get wallet address
// //       const walletAddress = await lucid.wallet.address();
// //       console.log("Wallet Address:", walletAddress);

// //       // Step 6: Check wallet balance
// //       const walletBalance = await lucid.wallet.getUtxos();
// //       const totalBalance = walletBalance.reduce(
// //         (sum: bigint, utxo: { assets: { lovelace: string | number | bigint } }) => sum + BigInt(utxo.assets.lovelace),
// //         0n
// //       );
// //       console.log("Wallet Balance:", totalBalance.toString());

// //       if (totalBalance < 2_000_000n) {
// //         vscode.window.showErrorMessage("Insufficient funds in wallet. Please fund the wallet.");
// //         return;
// //       }

// //       // Step 7: Ask the user to select a datum type
// //       const datumType = await vscode.window.showQuickPick(
// //         ["Inline Datum", "Datum Hash", "Custom Datum File"],
// //         { placeHolder: "Select datum type" }
// //       );

// //       if (!datumType) {
// //         vscode.window.showErrorMessage("No datum type selected.");
// //         return;
// //       }

// //       let datumPayload;
// //       if (datumType === "Inline Datum") {
// //         datumPayload = await getInlineDatum();
// //       } else if (datumType === "Datum Hash") {
// //         datumPayload = await getDatumHash();
// //       } else if (datumType === "Custom Datum File") {
// //         datumPayload = await getCustomDatumFile();
// //       }

// //       if (!datumPayload) return;

// //       // Step 8: Build and submit the transaction
// //       const tx = await lucid
// //         .newTx()
// //         .payToContract(scriptAddress, datumPayload, { lovelace: BigInt(1_000_000) })
// //         .complete();

// //       const signedTx = await tx.sign().complete();
// //       const txHash = await signedTx.submit();

// //       vscode.window.showInformationMessage(`Lock Transaction Submitted! TX Hash: ${txHash}`);
// //       console.log("Lock Transaction Submitted");
// //     } catch (error: any) {
// //       vscode.window.showErrorMessage(`Error: ${error.message}`);
// //       console.error("Error Details:", error);
// //     }
// //   });

// //   context.subscriptions.push(command);
// // }

// // // 📌 Select and Parse Plutus File
// // async function selectPlutusFile(): Promise<any> {
// //   const scriptUri = await vscode.window.showOpenDialog({
// //     canSelectMany: false,
// //     openLabel: "Select Plutus Script (.plutus)",
// //     filters: { "Plutus Script": ["plutus"] },
// //   });

// //   if (!scriptUri || scriptUri.length === 0) {
// //     vscode.window.showErrorMessage("No script selected.");
// //     return null;
// //   }

// //   const scriptPath = scriptUri[0].fsPath;
// //   const scriptContent = await fs.readFile(scriptPath, "utf8");

// //   try {
// //     const scriptJson = JSON.parse(scriptContent);
// //     if (!scriptJson.cborHex) {
// //       vscode.window.showErrorMessage("Invalid Plutus script file: missing 'cborHex' field.");
// //       return null;
// //     }
// //     return scriptJson;
// //   } catch (error) {
// //     vscode.window.showErrorMessage("Failed to parse Plutus script file as JSON.");
// //     return null;
// //   }
// // }

// // // 📌 Generate Script Address
// // function generateScriptAddress(lucid: any, cborHex: string): string {
// //   const plutusScript = { type: "PlutusV2", script: cborHex };
// //   return lucid.utils.validatorToAddress(plutusScript);
// // }

// // // 📌 Handle Inline Datum Input
// // async function getInlineDatum(): Promise<any | null> {
// //   const { Data } = await import("lucid-cardano");

// //   const inlineDatumInput = await vscode.window.showInputBox({
// //     prompt: "Enter your inline datum (JSON string or number)",
// //     placeHolder: 'Example: { "key": "value" } or 42'
// //   });

// //   if (!inlineDatumInput) {
// //     vscode.window.showErrorMessage("No inline datum provided.");
// //     return null;
// //   }

// //   try {
// //     const parsedDatum = JSON.parse(inlineDatumInput);
// //     return { inline: Data.to(parsedDatum) };
// //   } catch {
// //     return { inline: Data.to(inlineDatumInput) };
// //   }
// // }

// // // 📌 Handle Datum Hash Input
// // async function getDatumHash(): Promise<any | null> {
// //   const datumHashInput = await vscode.window.showInputBox({
// //     prompt: "Enter the datum hash",
// //     placeHolder: "e.g., abc123456789..."
// //   });

// //   if (!datumHashInput) {
// //     vscode.window.showErrorMessage("No datum hash provided.");
// //     return null;
// //   }

// //   return { datumHash: datumHashInput };
// // }



// // // 📌 Handle Custom Datum File
// // async function getCustomDatumFile(): Promise<any | null> {
// //   const fileUri = await vscode.window.showOpenDialog({
// //     canSelectMany: false,
// //     openLabel: "Select Datum File",
// //     filters: { "JSON Files": ["json"] },
// //   });

// //   if (!fileUri || fileUri.length === 0) {
// //     vscode.window.showErrorMessage("No datum file selected.");
// //     return null;
// //   }

// //   const filePath = fileUri[0].fsPath;
// //   try {
// //     const { Data } = await import("lucid-cardano");

// //     const content = await fs.readFile(filePath, "utf-8");
// //     const datumJson = JSON.parse(content);

// //     // Convert JSON to Plutus Data
// //     const plutusData = await convertToPlutusData(datumJson);

// //     console.log("Plutus Data:", plutusData);
// //     return { inline: Data.to(plutusData) };
// //   } catch (error: any) {
// //     vscode.window.showErrorMessage(`Failed to load datum file: ${error.message}`);
// //     console.error("Error Details:", error);
// //     return null;
// //   }
// // }

// // // 📌 Recursive function to handle unknown JSON structure
// // async function convertToPlutusData(data: any): Promise<any> {
// //   const { Data, Constr } = await import("lucid-cardano");

// //   // Handle numbers (convert to BigInt)
// //   if (typeof data === "number") {
// //     return BigInt(data);
// //   }

// //   // Handle strings
// //   if (typeof data === "string") {
// //     return data;
// //   }

// //   // Handle arrays (recursively convert each item)
// //   if (Array.isArray(data)) {
// //     return await Promise.all(data.map((item) => convertToPlutusData(item)));
// //   }

// //   // Handle Constr objects
// //   if (typeof data === "object" && data !== null && "constructor" in data && "fields" in data) {
// //     const fields = await Promise.all(data.fields.map((field) => convertToPlutusData(field)));
// //     return new Constr(data.constructor, fields);
// //   }

// //   // Handle plain objects (convert to Map<Data, Data>)
// //   if (typeof data === "object" && data !== null && !(data instanceof Map)) {
// //     const entries = await Promise.all(
// //       Object.entries(data).map(async ([key, value]) => {
// //         const convertedKey = await convertToPlutusData(key);
// //         const convertedValue = await convertToPlutusData(value);
// //         return [convertedKey, convertedValue];
// //       })
// //     );
// //     return new Map(entries);
// //   }

// //   // Handle Maps (already in the correct format)
// //   if (data instanceof Map) {
// //     return data;
// //   }

// //   // Throw an error for unsupported types
// //   throw new Error(`Unsupported data type: ${typeof data}`);
// // }
// /*
// import * as vscode from "vscode";
// import * as fs from "fs/promises";
// import { getFirstNetworkConfig } from "../config/cardanoNodeIntegration";
// import { initializeLucid } from "./implementation";
// import { hash } from "crypto";


// export function selectFile(context: vscode.ExtensionContext) {
//   const command = vscode.commands.registerCommand("select_plutus_file", async () => {
//     try {
//       // 📌 Step 1: Select and Parse Plutus File
//       const scriptJson = await selectPlutusFile();
//       if (!scriptJson) {return;}

//       // 📌 Step 2: Get Network Config & Initialize Lucid
//       const firstConfig = getFirstNetworkConfig(context);
//       if (!firstConfig) {throw new Error("Failed to get network configuration.");}

//       const lucid = await initializeLucid(firstConfig.network, firstConfig.apiKey);
//       if (!lucid) {throw new Error("Failed to initialize Lucid.");}

//       // 📌 Step 3: Generate Script Address
//       const scriptAddress = generateScriptAddress(lucid, scriptJson.cborHex);
//       vscode.window.showInformationMessage(`Generated script address: ${scriptAddress}`);
     
      
//       // 📌 Step 4: Use Hardcoded Seed Phrase
//       const hardcodedSeed = [
//         "boring", "asthma", "range", "orange", "pistol", "bunker",
//         "gun", "scene", "advice", "frost", "damp", "idle",
//         "knife", "dash", "deputy", "tank", "north", "try",
//         "mimic", "awkward", "boy", "area", "loop", "poet"
//       ].join(" ");
//       lucid.selectWalletFromSeed(hardcodedSeed);

//       // 📌 Step 5: Get Wallet Address & Balance
//       const walletAddress = await lucid.wallet.address();
//       const walletBalance = await lucid.wallet.getUtxos();
//       const totalBalance = walletBalance.reduce(
//         (sum: bigint, utxo: { assets: { lovelace: string | number | bigint } }) =>
//           sum + BigInt(utxo.assets.lovelace), 0n
//       );

//       console.log("Wallet Balance:", totalBalance.toString());
//       if (totalBalance < 2_000_000n) {throw new Error("Insufficient funds in wallet.");}

//       // 📌 Step 6: Select Datum Type
//       const datumType = await vscode.window.showQuickPick(
//         ["Inline Datum", "Datum Hash", "Custom Datum File"],
//         { placeHolder: "Select datum type" }
//       );
//       if (!datumType) {throw new Error("No datum type selected.");}

//       let datumPayload: any;
//       if (datumType === "Inline Datum") {datumPayload = await getInlineDatum();}
//       else if (datumType === "Datum Hash") {datumPayload = await getDatumHash();}
//       else if (datumType === "Custom Datum File") {datumPayload = await getCustomDatumFile();}

//       if (!datumPayload) {return;}

//       // 📌 Step 7: Build & Submit the Transaction
//       const tx = await lucid
//         .newTx()
//         .payToContract(scriptAddress, datumPayload, { lovelace: BigInt(1_000_000) })
//         .complete();

//       const signedTx = await tx.sign().complete();
//       const txHash = await signedTx.submit();

//       vscode.window.showInformationMessage(`Lock Transaction Submitted! TX Hash: ${txHash}`);
//     } catch (error: any) {
//       vscode.window.showErrorMessage(`Error: ${error.message}`);
//       console.error("Error Details:", error);
//     }
//   });

//   context.subscriptions.push(command);
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

// // 📌 Handle Inline Datum Input
// async function getInlineDatum(): Promise<any | null> {
//   const inlineDatumInput = await vscode.window.showInputBox({
//     prompt: "Enter your inline datum (String or number)",
//     placeHolder: 'Example:  "hello" or 42'
//   });

//   if (!inlineDatumInput) {
//     vscode.window.showErrorMessage("No inline datum provided.");
//     return null;
//   }

//   try {
//        const { Data } = await import("lucid-cardano");

//     const parsedDatum = JSON.parse(inlineDatumInput);
//     return { inline: Data.to(parsedDatum) };
//   } catch {
//        const { Data } = await import("lucid-cardano");

//     return { inline: Data.to(inlineDatumInput) };
//   }
// }

// // 📌 Handle Datum Hash Input
// async function getDatumHash(): Promise<any | null> {
//   const datumHashInput = await vscode.window.showInputBox({
//     prompt: "Enter the datum hash",
//     placeHolder: "e.g., abc123456789..."
//   });

//   if (!datumHashInput) {
//     vscode.window.showErrorMessage("No datum hash provided.");
//     return null;
//   }

//   return { hash: datumHashInput };
// }

// // 📌 Handle Custom Datum File
// // 📌 Handle Custom Datum File
// async function getCustomDatumFile(): Promise<any | null> {
//   const fileUri = await vscode.window.showOpenDialog({
//     canSelectMany: false,
//     openLabel: "Select Datum File",
//     filters: { "JSON Files": ["json"] },
//   });

//   if (!fileUri || fileUri.length === 0) {
//     vscode.window.showErrorMessage("No datum file selected.");
//     return null;
//   }

//   const filePath = fileUri[0].fsPath;
//   try {
//     const { Data } = await import("lucid-cardano");

//     const content = await fs.readFile(filePath, "utf-8");
//     const datumJson = JSON.parse(content);

//     // // Convert JSON to Plutus Data
//      const plutusData = await convertToPlutusData(datumJson);

//      console.log("Plutus Data:", plutusData);

//     return { inline: Data.to(plutusData)};
//   } catch (error: any) {
//     vscode.window.showErrorMessage(`Failed to load datum file: ${error.message}`);
//     console.error("Error Details:", error);
//     return null;
//   }
// }

// // 📌 Recursive function to handle unknown JSON structure
// async function convertToPlutusData(data: any): Promise<any> {
//   const { Data, Constr } = await import("lucid-cardano");

//   // Handle numbers (convert to BigInt)
//   if (typeof data === "number") {
//     return BigInt(data);
//   }

//   // Handle strings
//   if (typeof data === "string") {
//     return       Buffer.from(data.toString()).toString("hex");
//   }
// // handle boolean
// if (typeof data === "boolean") {
//   return data ? BigInt(1) : BigInt(0);
// }
//   // Handle arrays (recursively convert each item)
//   if (Array.isArray(data)) {
//     return await Promise.all(data.map((item) => convertToPlutusData(item)));
//   }

//   // Handle Constr objects
//   if (
//     typeof data === "object" &&
//     data !== null &&
//     "constructor" in data &&
//     "fields" in data
//   ) {
//     if (!Array.isArray(data.fields)) {
//       throw new Error("Invalid Constr object: 'fields' must be an array.");
//     }
//     const fields = await Promise.all(data.fields.map((field: any) => convertToPlutusData(field)));
//     return new Constr(data.constructor, fields);
//   }

//   // Handle plain objects (convert to Map<Data, Data>)
//   if (typeof data === "object" && data !== null && !(data instanceof Map)) {
//     const entries = await Promise.all(
//       Object.entries(data).map(async ([key, value]) => {
//         const convertedKey = await convertToPlutusData(key);
//         const convertedValue = await convertToPlutusData(value);
//         return [convertedKey, convertedValue] as [any, any]; // Explicitly type the tuple
//       })
//     );
//     return new Map(entries);
//   }

//   // Handle Maps (already in the correct format)
//   if (data instanceof Map) {
//     return data;
//   }

//   // Throw an error for unsupported types
//   throw new Error(`Unsupported data type: ${typeof data}`);
// }*/
// /*
// import * as vscode from "vscode";
// import * as fs from "fs/promises";
// import { getFirstNetworkConfig } from "../config/cardanoNodeIntegration";
// import { initializeLucid } from "./implementation";

// export function selectFile(context: vscode.ExtensionContext) {
//   const command = vscode.commands.registerCommand("select_plutus_file", async () => {
//     try {
//       // 📌 Step 1: Select and Parse Plutus File
//       const scriptJson = await selectPlutusFile();
//       if (!scriptJson) return;

//       // 📌 Step 2: Get Network Config & Initialize Lucid
//       const firstConfig = getFirstNetworkConfig(context);
//       if (!firstConfig) throw new Error("Failed to get network configuration.");

//       const lucid = await initializeLucid(firstConfig.network, firstConfig.apiKey);
//       if (!lucid) throw new Error("Failed to initialize Lucid.");

//       // 📌 Step 3: Generate Script Address
//       const scriptAddress = generateScriptAddress(lucid, scriptJson.cborHex);
//       vscode.window.showInformationMessage(`Generated script address: ${scriptAddress}`);

//       // 📌 Step 4: Use Hardcoded Seed Phrase
//       const hardcodedSeed = [
//         "boring", "asthma", "range", "orange", "pistol", "bunker",
//         "gun", "scene", "advice", "frost", "damp", "idle",
//         "knife", "dash", "deputy", "tank", "north", "try",
//         "mimic", "awkward", "boy", "area", "loop", "poet"
//       ].join(" ");
//       lucid.selectWalletFromSeed(hardcodedSeed);

//       // 📌 Step 5: Get Wallet Address & Balance
//       const walletAddress = await lucid.wallet.address();
//       const walletBalance = await lucid.wallet.getUtxos();
//       const totalBalance = walletBalance.reduce(
//         (sum: bigint, utxo: { assets: { lovelace: string | number | bigint } }) =>
//           sum + BigInt(utxo.assets.lovelace), 0n
//       );

//       console.log("Wallet Balance:", totalBalance.toString());
//       if (totalBalance < 2_000_000n) throw new Error("Insufficient funds in wallet.");

//       // 📌 Step 6: Select Datum Type
//       const datumType = await vscode.window.showQuickPick(
//         ["Inline Datum", "Datum Hash", "Custom Datum File"],
//         { placeHolder: "Select datum type" }
//       );
//       if (!datumType) throw new Error("No datum type selected.");

//       let datumPayload: any;
//       if (datumType === "Inline Datum") datumPayload = await getInlineDatum();
//       else if (datumType === "Datum Hash") datumPayload = await getDatumHash();
//       else if (datumType === "Custom Datum File") datumPayload = await getCustomDatumFile();

//       if (!datumPayload) return;

//       // 📌 Step 7: Build & Submit the Transaction
//       const tx = await lucid
//         .newTx()
//         .payToContract(scriptAddress, datumPayload, { lovelace: BigInt(1_000_000) })
//         .complete();

//       const signedTx = await tx.sign().complete();
//       const txHash = await signedTx.submit();

//       vscode.window.showInformationMessage(`Lock Transaction Submitted! TX Hash: ${txHash}`);
//     } catch (error: any) {
//       vscode.window.showErrorMessage(`Error: ${error.message}`);
//       console.error("Error Details:", error);
//     }
//   });

//   context.subscriptions.push(command);
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

//     if (!scriptJson.cborHex) throw new Error("Invalid Plutus script file: missing 'cborHex' field.");
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

// // 📌 Handle Inline Datum Input
// async function getInlineDatum(): Promise<any | null> {
//   const inlineDatumInput = await vscode.window.showInputBox({
//     prompt: "Enter your inline datum (String or number)",
//     placeHolder: 'Example: "hello" or 42'
//   });

//   if (!inlineDatumInput) {
//     vscode.window.showErrorMessage("No inline datum provided.");
//     return null;
//   }

//   try {
//     const { Data } = await import("lucid-cardano");
//     const parsedDatum = JSON.parse(inlineDatumInput);
//     return { inline: Data.to(parsedDatum) };
//   } catch {
//     const { Data } = await import("lucid-cardano");
//     return { inline: Data.to(inlineDatumInput) };
//   }
// }

// // 📌 Handle Datum Hash Input
// async function getDatumHash(): Promise<any | null> {
//   const datumHashInput = await vscode.window.showInputBox({
//     prompt: "Enter the datum hash",
//     placeHolder: "e.g., abc123456789..."
//   });

//   if (!datumHashInput) {
//     vscode.window.showErrorMessage("No datum hash provided.");
//     return null;
//   }

//   return { hash: datumHashInput };
// }

// // 📌 Handle Custom Datum File
// async function getCustomDatumFile(): Promise<any | null> {
//   const fileUri = await vscode.window.showOpenDialog({
//     canSelectMany: false,
//     openLabel: "Select Datum File",
//     filters: { "JSON Files": ["json"] },
//   });

//   if (!fileUri || fileUri.length === 0) {
//     vscode.window.showErrorMessage("No datum file selected.");
//     return null;
//   }

//   const filePath = fileUri[0].fsPath;
//   try {
//     const { Data } = await import("lucid-cardano");

//     const content = await fs.readFile(filePath, "utf-8");
//     const datumJson = JSON.parse(content);

//     // Convert JSON to Plutus Data
//     const plutusData = await convertToPlutusData(datumJson);

//     console.log("Plutus Data:", plutusData);
//     return { inline: Data.to(plutusData) };
//   } catch (error: any) {
//     vscode.window.showErrorMessage(`Failed to load datum file: ${error.message}`);
//     console.error("Error Details:", error);
//     return null;
//   }
// }

// // 📌 Recursive function to handle unknown JSON structure
// async function convertToPlutusData(data: any): Promise<any> {
//   const { Data, Constr } = await import("lucid-cardano");

//   // Handle numbers (convert to BigInt)
//   if (typeof data === "number") {
//     return BigInt(data);
//   }

//   // Handle strings
//   if (typeof data === "string") {
//     return Buffer.from(data, "utf8").toString("hex");
//   }

//   // Handle booleans
//   if (typeof data === "boolean") {
//     return data ? BigInt(1) : BigInt(0);
//   }

//   // Handle arrays (recursively convert each item)
//   if (Array.isArray(data)) {
//     return await Promise.all(data.map((item) => convertToPlutusData(item)));
//   }

//   // Handle Constr objects
//   if (
//     typeof data === "object" &&
//     data !== null &&
//     "constructor" in data &&
//     "fields" in data
//   ) {
//     if (!Array.isArray(data.fields)) {
//       throw new Error("Invalid Constr object: 'fields' must be an array.");
//     }
//     const fields = await Promise.all(data.fields.map((field: any) => convertToPlutusData(field)));
//     return new Constr(data.constructor, fields);
//   }

//   // Handle plain objects (convert to Map<Data, Data>)
//   if (typeof data === "object" && data !== null && !(data instanceof Map)) {
//     const entries = await Promise.all(
//       Object.entries(data).map(async ([key, value]) => {
//         const convertedKey = await convertToPlutusData(key);
//         const convertedValue = await convertToPlutusData(value);
//         return [convertedKey, convertedValue] as [any, any]; // Explicitly type the tuple
//       })
//     );
//     return new Map(entries);
//   }

//   // Handle Maps (already in the correct format)
//   if (data instanceof Map) {
//     return data;
//   }

//   // Throw an error for unsupported types
//   throw new Error(`Unsupported data type: ${typeof data}`);
// }*/

// import * as vscode from "vscode";
// import * as fs from "fs/promises";
// import { getFirstNetworkConfig } from "../config/cardanoNodeIntegration";
// import { initializeLucid } from "./implementation";

// export function selectFile(context: vscode.ExtensionContext) {
//   const command = vscode.commands.registerCommand("select_plutus_file", async () => {
//     try {
//       // 📌 Step 1: Select and Parse Plutus File
//       const scriptJson = await selectPlutusFile();
//       if (!scriptJson) return;

//       // 📌 Step 2: Get Network Config & Initialize Lucid
//       const firstConfig = getFirstNetworkConfig(context);
//       if (!firstConfig) throw new Error("Failed to get network configuration.");

//       const lucid = await initializeLucid(firstConfig.network, firstConfig.apiKey);
//       if (!lucid) throw new Error("Failed to initialize Lucid.");

//       // 📌 Step 3: Generate Script Address
//       const scriptAddress = generateScriptAddress(lucid, scriptJson.cborHex);
//       vscode.window.showInformationMessage(`Generated script address: ${scriptAddress}`);

//       // 📌 Step 4: Use Hardcoded Seed Phrase
//       const hardcodedSeed = [
//         "boring", "asthma", "range", "orange", "pistol", "bunker",
//         "gun", "scene", "advice", "frost", "damp", "idle",
//         "knife", "dash", "deputy", "tank", "north", "try",
//         "mimic", "awkward", "boy", "area", "loop", "poet"
//       ].join(" ");
//       lucid.selectWalletFromSeed(hardcodedSeed);

//       // 📌 Step 5: Get Wallet Address & Balance
//       const walletAddress = await lucid.wallet.address();
//       const walletBalance = await lucid.wallet.getUtxos();
//       const totalBalance = walletBalance.reduce(
//         (sum: bigint, utxo: { assets: { lovelace: string | number | bigint } }) =>
//           sum + BigInt(utxo.assets.lovelace), 0n
//       );

//       console.log("Wallet Balance:", totalBalance.toString());
//       if (totalBalance < 2_000_000n) throw new Error("Insufficient funds in wallet.");

//       // 📌 Step 6: Select Datum Type
//       const datumType = await vscode.window.showQuickPick(
//         ["Inline Datum", "Datum Hash", "Custom Datum File"],
//         { placeHolder: "Select datum type" }
//       );
//       if (!datumType) throw new Error("No datum type selected.");

//       let datumPayload: any;
//       if (datumType === "Inline Datum") datumPayload = await getInlineDatum();
//       else if (datumType === "Datum Hash") datumPayload = await getDatumHash();
//       else if (datumType === "Custom Datum File") datumPayload = await getCustomDatumFile();

//       if (!datumPayload) return;

//       // 📌 Step 7: Build & Submit the Transaction
//       const tx = await lucid
//         .newTx()
//         .payToContract(scriptAddress, datumPayload, { lovelace: BigInt(1_000_000) })
//         .complete();

//       const signedTx = await tx.sign().complete();
//       const txHash = await signedTx.submit();

//       vscode.window.showInformationMessage(`Lock Transaction Submitted! TX Hash: ${txHash}`);
//     } catch (error: any) {
//       vscode.window.showErrorMessage(`Error: ${error.message}`);
//       console.error("Error Details:", error);
//     }
//   });

//   context.subscriptions.push(command);
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

//     if (!scriptJson.cborHex) throw new Error("Invalid Plutus script file: missing 'cborHex' field.");
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

// // 📌 Handle Inline Datum Input
// async function getInlineDatum(): Promise<any | null> {
//   var inlineDatumInput = await vscode.window.showInputBox({
//     prompt: "Enter your inline datum (String or number)",
//     placeHolder: 'Example: "hello" or 42'
//   });

//   if (!inlineDatumInput) {
//     vscode.window.showErrorMessage("No inline datum provided.");
//     return null;
//   }
// let data:any;
//   // Handle numbers (convert to BigInt)
//   if (typeof inlineDatumInput === "number") {
//     data=BigInt(inlineDatumInput);
//   }

//   // Handle strings
//   if (typeof inlineDatumInput === "string") {
//     data= Buffer.from(inlineDatumInput, "utf8").toString("hex");
//   }
//     const { Data } = await import("lucid-cardano");
//     return { inline: Data.to(data) };
  
// }

// // 📌 Handle Datum Hash Input
// async function getDatumHash(): Promise<any | null> {
//   const datumHashInput = await vscode.window.showInputBox({
//     prompt: "Enter the datum hash",
//     placeHolder: "e.g., abc123456789..."
//   });

//   if (!datumHashInput) {
//     vscode.window.showErrorMessage("No datum hash provided.");
//     return null;
//   }

//   return { hash: datumHashInput };
// }

// // 📌 Handle Custom Datum File
// async function getCustomDatumFile(): Promise<any | null> {
//   const fileUri = await vscode.window.showOpenDialog({
//     canSelectMany: false,
//     openLabel: "Select Datum File",
//     filters: { "JSON Files": ["json"] },
//   });

//   if (!fileUri || fileUri.length === 0) {
//     vscode.window.showErrorMessage("No datum file selected.");
//     return null;
//   }

//   const filePath = fileUri[0].fsPath;
//   try {
//     const { Data } = await import("lucid-cardano");

//     const content = await fs.readFile(filePath, "utf-8");
//     const datumJson = JSON.parse(content);

//     // Convert JSON to Plutus Data
//     const plutusData = await convertToPlutusData(datumJson);

//     console.log("Plutus Data:", plutusData);
//     return { inline: Data.to(plutusData) };
//   } catch (error: any) {
//     vscode.window.showErrorMessage(`Failed to load datum file: ${error.message}`);
//     console.error("Error Details:", error);
//     return null;
//   }
// }

// // 📌 Recursive function to handle unknown JSON structure
// async function convertToPlutusData(data: any): Promise<any> {
//   const { Data, Constr } = await import("lucid-cardano");

//   // Handle numbers (convert to BigInt)
//   if (typeof data === "number") {
//     return BigInt(data);
//   }

//   // Handle strings
//   if (typeof data === "string") {
//     return Buffer.from(data, "utf8").toString("hex");
//   }

//   // Handle booleans
//   if (typeof data === "boolean") {
//     return data ? BigInt(1) : BigInt(0);
//   }

//   // Handle arrays (recursively convert each item)
//   if (Array.isArray(data)) {
//     return await Promise.all(data.map((item) => convertToPlutusData(item)));
//   }

//   // Handle Constr objects
//   if (
//     typeof data === "object" &&
//     data !== null &&
//     "constructor" in data &&
//     "fields" in data
//   ) {
//     if (!Array.isArray(data.fields)) {
//       throw new Error("Invalid Constr object: 'fields' must be an array.");
//     }
//     const fields = await Promise.all(data.fields.map((field: any) => convertToPlutusData(field)));
//     return new Constr(data.constructor, fields);
//   }

//   // Handle plain objects (convert to Map<Data, Data>)
//   if (typeof data === "object" && data !== null && !(data instanceof Map)) {
//     const entries = await Promise.all(
//       Object.entries(data).map(async ([key, value]) => {
//         const convertedKey=await convertToPlutusData(key);
//         const convertedValue = await convertToPlutusData(value);
//         return [convertedKey, convertedValue] as [any, any]; // Explicitly type the tuple
//       })
//     );
//     return new Map(entries);
//   }

//   // Handle Maps (already in the correct format)
//   if (data instanceof Map) {
//     return data;
//   }

//   // Throw an error for unsupported types
//   throw new Error(`Unsupported data type: ${typeof data}`);
// }
// /*
// async function convertToPlutusData(data: any): Promise<any> {
//   const { Data, Constr } = await import("lucid-cardano");

//   // Handle numbers (convert to BigInt)
//   if (typeof data === "number") {
//     return BigInt(data);
//   }

//   // Handle strings (convert to hex)
//   if (typeof data === "string") {
//     return { bytes: Buffer.from(data, "utf8").toString("hex") };
//   }

//   // Handle booleans (Plutus uses Constr(0, []) for false, Constr(1, []) for true)
//   if (typeof data === "boolean") {
//     return new Constr(data ? 1 : 0, []);
//   }

//   // Handle arrays (recursively convert each item)
//   if (Array.isArray(data)) {
//     const convertedArray = await Promise.all(data.map((item) => convertToPlutusData(item)));
//     return new Constr(0, [convertedArray]); // Wrap in a Constr to maintain Plutus structure
//   }

//   // Handle Constr objects
//   if (
//     typeof data === "object" &&
//     data !== null &&
//     "constructor" in data &&
//     "fields" in data
//   ) {
//     if (!Array.isArray(data.fields)) {
//       throw new Error("Invalid Constr object: 'fields' must be an array.");
//     }
//     const fields = await Promise.all(data.fields.map((field: any) => convertToPlutusData(field)));
//     return new Constr(data.constructor, fields);
//   }

//   // Handle plain objects (convert to Map<Data, Data>)
//   if (typeof data === "object" && data !== null && !(data instanceof Map)) {
//     const entries = await Promise.all(
//       Object.entries(data).map(async ([key, value]) => {
//         const convertedKey = { bytes: Buffer.from(key, "utf8").toString("hex") }; // Convert keys to hex
//         const convertedValue = await convertToPlutusData(value);
//         return [convertedKey, convertedValue] as [any, any]; // Explicitly type the tuple
//       })
//     );
//     return new Map(entries);
//   }

//   // Handle Maps (already in the correct format)
//   if (data instanceof Map) {
//     return data;
//   }

//   // Throw an error for unsupported types
//   throw new Error(`Unsupported data type: ${typeof data}`);
// }
// */

import * as vscode from "vscode";
import * as fs from "fs/promises";
import { getFirstNetworkConfig } from "../config/cardanoNodeIntegration";
import { initializeLucid } from "./implementation";

export function selectFile(context: vscode.ExtensionContext) {
  const command = vscode.commands.registerCommand("select_plutus_file", async () => {
    try {
      // 📌 Step 1: Select and Parse Plutus File
      const scriptJson = await selectPlutusFile();
      if (!scriptJson) return;

      // 📌 Step 2: Get Network Config & Initialize Lucid
      const firstConfig = getFirstNetworkConfig(context);
      if (!firstConfig) throw new Error("Failed to get network configuration.");

      const lucid = await initializeLucid(firstConfig.network, firstConfig.apiKey);
      if (!lucid) throw new Error("Failed to initialize Lucid.");

      // 📌 Step 3: Generate Script Address
      const scriptAddress = generateScriptAddress(lucid, scriptJson.cborHex);
      vscode.window.showInformationMessage(`Generated script address: ${scriptAddress}`);

      // 📌 Step 4: Use Hardcoded Seed Phrase
      const hardcodedSeed = [
        "boring", "asthma", "range", "orange", "pistol", "bunker",
        "gun", "scene", "advice", "frost", "damp", "idle",
        "knife", "dash", "deputy", "tank", "north", "try",
        "mimic", "awkward", "boy", "area", "loop", "poet"
      ].join(" ");
      lucid.selectWalletFromSeed(hardcodedSeed);

      // 📌 Step 5: Get Wallet Address & Balance
      const walletAddress = await lucid.wallet.address();
      const walletBalance = await lucid.wallet.getUtxos();
      const totalBalance = walletBalance.reduce(
        (sum: bigint, utxo: { assets: { lovelace: string | number | bigint } }) =>
          sum + BigInt(utxo.assets.lovelace), 0n
      );

      console.log("Wallet Balance:", totalBalance.toString());
      if (totalBalance < 2_000_000n) throw new Error("Insufficient funds in wallet.");

      // 📌 Step 6: Select Datum Type
      const datumType = await vscode.window.showQuickPick(
        ["Inline Datum", "Datum Hash", "Custom Datum File"],
        { placeHolder: "Select datum type" }
      );
      if (!datumType) throw new Error("No datum type selected.");

      let datumPayload: any;
      if (datumType === "Inline Datum") datumPayload = await getInlineDatum();
      else if (datumType === "Datum Hash") datumPayload = await getDatumHash();
      else if (datumType === "Custom Datum File") datumPayload = await getCustomDatumFile();

      if (!datumPayload) return;

      // 📌 Step 7: Build & Submit the Transaction
      const tx = await lucid
        .newTx()
        .payToContract(scriptAddress, datumPayload, { lovelace: BigInt(1_000_000) })
        .complete();

      const signedTx = await tx.sign().complete();
      const txHash = await signedTx.submit();

      vscode.window.showInformationMessage(`Lock Transaction Submitted! TX Hash: ${txHash}`);
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

    if (!scriptJson.cborHex) throw new Error("Invalid Plutus script file: missing 'cborHex' field.");
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

// 📌 Handle Inline Datum Input
async function getInlineDatum(): Promise<any | null> {
  const inlineDatumInput = await vscode.window.showInputBox({
    prompt: "Enter your inline datum (String or number)",
    placeHolder: 'Example: "hello" or 42'
  });

  if (!inlineDatumInput) {
    vscode.window.showErrorMessage("No inline datum provided.");
    return null;
  }

  const { Data } = await import("lucid-cardano");
  const numberValue = Number(inlineDatumInput);

  if (!isNaN(numberValue) && Number.isInteger(numberValue)) {
    return { inline: Data.to(BigInt(numberValue)) };
  };
  const datum = {
  myInteger: 42,
  myString: "hello",
  myList: [1, 2, 3],
};
  return {inline: Data.to({
    constructor: 0, 
    fields: [
      { int: BigInt(42) }, 
      { bytes: Buffer.from("hello").toString("hex") }
    ],
  }) };
  
}

// 📌 Handle Datum Hash Input
async function getDatumHash(): Promise<any | null> {
  const datumHashInput = await vscode.window.showInputBox({
    prompt: "Enter the datum hash",
    placeHolder: "e.g., abc123456789..."
  });

  if (!datumHashInput) {
    vscode.window.showErrorMessage("No datum hash provided.");
    return null;
  }

  return { hash: datumHashInput };
}

// 📌 Handle Custom Datum File
async function getCustomDatumFile(): Promise<any | null> {
  const fileUri = await vscode.window.showOpenDialog({
    canSelectMany: false,
    openLabel: "Select Datum File",
    filters: { "JSON Files": ["json"] },
  });

  if (!fileUri || fileUri.length === 0) {
    vscode.window.showErrorMessage("No datum file selected.");
    return null;
  }

  const filePath = fileUri[0].fsPath;
  try {
    const { Data } = await import("lucid-cardano");

    const content = await fs.readFile(filePath, "utf-8");
    const datumJson = JSON.parse(content);

    // Convert JSON to Plutus Data
    const plutusData = await convertToPlutusData(datumJson);

    console.log("Plutus Data:", plutusData);
    return { inline: Data.to(plutusData) };
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to load datum file: ${error.message}`);
    console.error("Error Details:", error);
    return null;
  }
}

// 📌 Recursive function to handle unknown JSON structure
function convertToPlutusData(value: any): any {
  // Handle integers
  if (typeof value === "number" && Number.isInteger(value)) {
    return { constructor: 0, fields: [{ int: BigInt(value) }] }; // Integer format
  }

  // Handle strings
  if (typeof value === "string") {
    return { constructor: 0, fields: [{ bytes: Buffer.from(value, "utf8").toString("hex") }] }; // String (hex bytes)
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return {
      constructor: 0,
      fields: [{ list: value.map((item) => convertToPlutusData(item).fields[0]) }] // List format
    };
  }

  // Handle objects
  if (typeof value === "object" && value !== null && !(value instanceof Map)) {
    return {
      constructor: 0,
      fields: [{
        map: Object.entries(value).map(([key, val]) => ({
          k: { bytes: Buffer.from(key, "utf8").toString("hex") }, // Convert key to hex
          v: convertToPlutusData(val).fields[0] // Convert value recursively
        }))
      }]
    };
  }

  // Handle Maps (if needed)
  if (value instanceof Map) {
    return {
      constructor: 0,
      fields: [{
        map: Array.from(value.entries()).map(([key, val]) => ({
          k: { bytes: Buffer.from(key, "utf8").toString("hex") }, // Convert key to hex
          v: convertToPlutusData(val).fields[0] // Convert value recursively
        }))
      }]
    };
  }

  // Handle booleans
  if (typeof value === "boolean") {
    return { constructor: 0, fields: [{ int: value ? BigInt(1) : BigInt(0) }] }; // Boolean as integer
  }

  // Handle null or undefined
  if (value === null || value === undefined) {
    throw new Error("Null or undefined values are not supported in Plutus data.");
  }

  // Throw an error for unsupported types
  throw new Error(`Unsupported data type: ${typeof value}`);
}