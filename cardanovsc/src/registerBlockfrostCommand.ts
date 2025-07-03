import * as vscode from "vscode";
import * as childprocess from "child_process";

export class blockfrostCommand {
  private extensionContext: vscode.ExtensionContext;
  private outputChannel: vscode.OutputChannel;
  preprod_baseUrl: string = "https://cardano-preprod.blockfrost.io/api/v0"; // Base URL for API requests

  preview_baseUrl: string = "https://cardano-preview.blockfrost.io/api/v0"; // Base URL for API requests
  
  constructor(context: vscode.ExtensionContext) {
    this.extensionContext = context;
    this.outputChannel = vscode.window.createOutputChannel(
      "Cardano API Response"
    );
    this.registerCommands();
  }

  // new 

  public getNetwork(): string | null {
    const network = this.extensionContext.globalState.get<string>("cardano.network");
    if (!network) {
      vscode.window.showErrorMessage("Network is not selected. Please set up API integration.");
      return null;
    }
    return network;
  }
  //

  private registerCommands(): void {

    const commands = [
      {
        command: "cardanovsc.getLatestBlockDetails",
        callback: this.getLatestBlockDetails.bind(this),
      },
      {
        command: "cardanovsc.getAddressDetails",
        callback: this.getAddressDetails.bind(this),
      },
      {
        command: "cardanovsc.getAddressBalances",
        callback: this.getAddressBalance.bind(this),
      },
      {
        command: "cardanovsc.getTransactionDetail",
        callback: this.getTransactionDetails.bind(this),
      },
      {
        command: "cardanovsc.getAssetsbyPolicyId",
        callback: this.getAssetsByPolicyId.bind(this),
      },
      {
        command: "cardanovsc.getSpecificAssetDetails",
        callback: this.getSpecificAssetDetails.bind(this),
      },
      {
        command: "cardanovsc.getAssetAddresses",
        callback: this.getAssetAddresses.bind(this),
      },
      {
        command: "cardanovsc.getSpecificStakepoolDetails",
        callback: this.getSpecificStakePoolDetails.bind(this),
      },
      {
        command: "cardanovsc.getStakePoolsList",
        callback: this.getListOfStakePools.bind(this),
      },
      {
        command: "cardanovsc.getRetiringStakePools",
        callback: this.getRetiringStakePools.bind(this),
      },
      {
        command: "cardanovsc.getRetiredStakePools",
        callback: this.getRetiredStakePools.bind(this),
      },
      {
        command: "cardanovsc.getStakePoolHistory",
        callback: this.getStakePoolHistory.bind(this),
      },
      {
        command: "cardanovsc.getScriptCbor",
        callback: this.getPlutusScriptCbor.bind(this),
      },
      {
        command: "cardanovsc.getScriptRedeemers",
        callback: this.getScriptRedeemers.bind(this),
      },
      {
        command: "cardanovsc.getDatumValue",
        callback: this.getDatumValue.bind(this),
      },
      {
        command: "cardanovsc.getDatumCborValue",
        callback: this.getDatumCborValue.bind(this),
      },
      {
        command: "cardanovsc.getTransactionUtxos",
        callback: this.getTransactionUtxos.bind(this),
      },
      {
        command: "cardanovsc.getTransactionDelegationCerts",
        callback: this.getTransactionDelegationCerts.bind(this),
      }
      
      
      
      
      
      
    
     
    ];

    commands.forEach(({ command, callback }) => {
      this.extensionContext.subscriptions.push(
        vscode.commands.registerCommand(command, callback)
      );
    });
  }
  
  public getApiKey(): string | null {
    const storedApiKey =
      this.extensionContext.globalState.get<string>("cardano.apiKey");

    if (!storedApiKey) {
      // Notify the user and execute the API integration command
      vscode.window.showErrorMessage(
        "API key not found! Starting API integration setup..."
      );

      // Execute the API integration command
      vscode.commands.executeCommand("cardano.apiIntegration");

      // Check again after the command completes
      const updatedApiKey =
        this.extensionContext.globalState.get<string>("cardano.apiKey");

      if (!updatedApiKey) {
        vscode.window.showErrorMessage(
          "API integration setup failed or was canceled."
        );
        return null;
      }

      return updatedApiKey;
    }

    return storedApiKey;
  }

  public executeCurlCommand(
    apiUrl: string,
    apiKey: string,
    onSuccess: (response: any) => void
  ): void {
    const curlCommand = `curl -X GET "${apiUrl}" --header "Project_id: ${apiKey}"`;

    childprocess.exec(curlCommand, (error, stdout, stderr) => {
      if (error) {const network = this.getNetwork();
        vscode.window.showErrorMessage(`Error: ${stderr || error.message}`);
        return;
      }

      try {
        const jsonResponse = JSON.parse(stdout);
        onSuccess(jsonResponse);
      } catch (parseError) {
        vscode.window.showErrorMessage("Failed to parse API response as JSON.");
      }
    });
  }

  public displayOutput(jsonResponse: any): void {
    const formattedJson = JSON.stringify(jsonResponse, null, 2);
    this.outputChannel.clear();
    this.outputChannel.appendLine(formattedJson);
    this.outputChannel.show();
  }

  private getLatestBlockDetails(): void {
    console.log("latest");
    
    const apiKey = this.getApiKey();
 
    const network = this.getNetwork();

  if (!apiKey || !network) {
    vscode.window.showErrorMessage("Missing API key or network.");
    return;
  }

if(network=="preprod"){
    const apiUrl = `${this.preprod_baseUrl}/blocks/latest`;
    this.executeCurlCommand(apiUrl, apiKey, (response) => {
        this.displayOutput(response);
      });
   
}else{
    const apiUrl = `${this.preview_baseUrl}/blocks/latest`;
    this.executeCurlCommand(apiUrl, apiKey, (response) => {
        this.displayOutput(response);
      });
}

 
  }

  private async getAddressDetails(): Promise<void> {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();
  
    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }

        
    const address = await vscode.window.showInputBox({
      prompt: "Enter Cardano address",
      placeHolder: "e.g., addr1q...",
      ignoreFocusOut: true,
      validateInput: (input) =>
        input.length > 200
          ? "Address exceeds the maximum length of 200."
          : null,
    });
  
    if (!address) {
      vscode.window.showErrorMessage("Address input cancelled.");
      return;
    }
  
    let baseUrl = "";
  
    if (network === "preprod") {
      baseUrl = this.preprod_baseUrl;
    } else if (network === "preview") {
      baseUrl = this.preview_baseUrl;
    } else {
      vscode.window.showErrorMessage("This feature is only available for preview/preprod networks.");
      return;
    }
  
    const apiUrl = `${baseUrl}/addresses/${address}`;
  
    this.executeCurlCommand(apiUrl, apiKey, (response) => {
      this.displayOutput(response);
    });
  }

  private async getAddressBalance(): Promise<void> {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();
  
    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }
  
    const address = await vscode.window.showInputBox({
      prompt: "Enter your address",
      placeHolder: "e.g., addr_test1...",
      ignoreFocusOut: true,
      validateInput: (value) =>
        value.startsWith("addr1") || value.startsWith("addr_test1")
          ? null
          : "Enter a valid address.",
    });
  
    if (!address) {
      vscode.window.showErrorMessage("Address input cancelled.");
      return;
    }
  
    let baseUrl = "";
  
    if (network === "preprod") {
      baseUrl = this.preprod_baseUrl;
    } else if (network === "preview") {
      baseUrl = this.preview_baseUrl;
    } else {
      vscode.window.showErrorMessage("This command supports only preview and preprod networks.");
      return;
    }
  
    const apiUrl = `${baseUrl}/addresses/${address}`;
  
    this.executeCurlCommand(apiUrl, apiKey, (response) => {
      const lovelaceEntry = response.amount?.find(
        (entry: any) => entry.unit === "lovelace"
      );
  
      if (lovelaceEntry) {
        const ada = parseInt(lovelaceEntry.quantity) / 1_000_000;
        this.outputChannel.clear();
        this.outputChannel.appendLine(`💰 ADA Balance for ${address}:\n`);
        this.outputChannel.appendLine(`→ ${ada.toLocaleString()} ADA`);
        this.outputChannel.show();
      } else {
        vscode.window.showInformationMessage("No ADA balance found.");
      }
    });
  }

  private async getTransactionDetails(): Promise<void> {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();
  
    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }
  
    const txHash = await vscode.window.showInputBox({
      prompt: "Enter the 64-character transaction hash",
      placeHolder: "e.g., 6e5f825c42c1c6d6b77f2a14092f3b78c8f1b66db6f4cf8caec1555b6f967b3b",
      validateInput: (value) =>
        /^[0-9a-fA-F]{64}$/.test(value) ? null : "Invalid transaction hash format",
      ignoreFocusOut: true,
    });
  
    if (!txHash) {
      vscode.window.showErrorMessage("Transaction hash is required.");
      return;
    }
  
    let baseUrl = "";
    if (network === "preprod") {
      baseUrl = this.preprod_baseUrl;
    } else if (network === "preview") {
      baseUrl = this.preview_baseUrl;
    } else {
      vscode.window.showErrorMessage("This command only supports preprod or preview networks.");
      return;
    }
  
    const apiUrl = `${baseUrl}/txs/${txHash}`;
  console.log(apiUrl);
  
    this.executeCurlCommand(apiUrl, apiKey, (response) => {
      this.outputChannel.clear();
      this.outputChannel.appendLine(`🔍 Transaction Details for: ${txHash}\n`);
      this.outputChannel.appendLine(JSON.stringify(response, null, 2));
      this.outputChannel.show();
    });
  }
  
  

  private async getAssetsByPolicyId(): Promise<void> {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();
  
    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }
  
    const policyId = await vscode.window.showInputBox({
      prompt: "Enter the Policy ID",
      placeHolder: "e.g., 476039a0949cf0b22f6a800f56780184c44533887ca6e821007840c3",
      validateInput: (value) =>
        /^[0-9a-f]{56}$/.test(value) ? null : "Invalid Policy ID format (56 hex chars)",
      ignoreFocusOut: true,
    });
  
    if (!policyId) {
      vscode.window.showErrorMessage("Policy ID is required.");
      return;
    }
  
    const count = await vscode.window.showInputBox({
      prompt: "Enter count per page (1–100)",
      placeHolder: "Default: 100",
      validateInput: (val) => val === "" || (/^\d+$/.test(val) && +val >= 1 && +val <= 100)
        ? null : "Enter a number between 1 and 100",
    });
  
    const page = await vscode.window.showInputBox({
      prompt: "Enter page number",
      placeHolder: "Default: 1",
      validateInput: (val) => val === "" || (/^\d+$/.test(val) && +val >= 1)
        ? null : "Page must be 1 or greater",
    });
  
    const order = await vscode.window.showQuickPick(["asc", "desc"], {
      placeHolder: "Select order of results (optional)",
      canPickMany: false,
    });
  
    const baseUrl = network === "preprod"
      ? this.preprod_baseUrl
      : network === "preview"
        ? this.preview_baseUrl
        : null;
  
    if (!baseUrl) {
      vscode.window.showErrorMessage("Unsupported network.");
      return;
    }
  
    // Build URL with optional query params
    const queryParams: string[] = [];
    if (count) queryParams.push(`count=${count}`);
    if (page) queryParams.push(`page=${page}`);
    if (order) queryParams.push(`order=${order}`);
  
    const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
    const apiUrl = `${baseUrl}/assets/policy/${policyId}${queryString}`;
  
    this.executeCurlCommand(apiUrl, apiKey, (response) => {
      this.outputChannel.clear();
      this.outputChannel.appendLine(`📜 Assets under policy ID: ${policyId}`);
      this.outputChannel.appendLine(JSON.stringify(response, null, 2));
      this.outputChannel.show();
    });
  }


  private getSpecificAssetDetails(): void {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();
  
    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }
  
    vscode.window.showInputBox({
      prompt: "Enter the Asset ID (policy_id + hex asset name)",
      placeHolder: "e.g., b0d07d45fe9514f80213f4020e5a61241458be626841cde717cb38a76e7574636f696e"
    }).then((assetId) => {
      if (!assetId) {
        vscode.window.showErrorMessage("Asset ID is required.");
        return;
      }
  
      const baseUrl =
        network === "preprod"
          ? this.preprod_baseUrl
          : this.preview_baseUrl;
  
      const apiUrl = `${baseUrl}/assets/${assetId}`;
  
      this.executeCurlCommand(apiUrl, apiKey, (response) => {
        this.displayOutput(response);
      });
    });
  }
  

  private getSpecificStakePoolDetails(): void {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();
  
    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }
  
    vscode.window
      .showInputBox({
        prompt: "Enter the Stake Pool ID (Bech32 or hex)",
        placeHolder: "e.g., pool1pu5jlj4q9w9jlxeu370a3c9myx47md5j5m2str0naunn2q3lkdy",
      })
      .then((poolId) => {
        if (!poolId) {
          vscode.window.showErrorMessage("Stake Pool ID is required.");
          return;
        }
  
        let baseUrl = "";
        if (network === "preprod") {
          baseUrl = this.preprod_baseUrl;
        } else if (network === "preview") {
          baseUrl = this.preview_baseUrl;
        } else {
          vscode.window.showErrorMessage("Unsupported network.");
          return;
        }
  
        const apiUrl = `${baseUrl}/pools/${poolId}`;
        this.executeCurlCommand(apiUrl, apiKey, (response) => {
          this.displayOutput(response);
        });
      });
  }
  

  private getListOfStakePools(): void {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();
  
    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }
  
          let baseUrl = "";
          if (network === "preprod") {
            baseUrl = this.preprod_baseUrl;
          } else if (network === "preview") {
            baseUrl = this.preview_baseUrl;
          } else {
            vscode.window.showErrorMessage("Unsupported network.");
            return;
          }
  
          const apiUrl = `${baseUrl}/pools`;
  
          this.executeCurlCommand(apiUrl, apiKey, (response) => {
            this.displayOutput(response);
          });
  }
  
  
  private getAssetAddresses(): void {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();
  
    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }
  
    vscode.window.showInputBox({
      prompt: "Enter the Asset ID (policy_id + hex-encoded asset name)",
      placeHolder: "e.g., b0d07d45fe9514f80213f4020e5a61241458be626841cde717cb38a76e7574636f696e"
    }).then((assetId) => {
      if (!assetId) {
        vscode.window.showErrorMessage("Asset ID is required.");
        return;
      }
  
      // Optional: Page, Count, Order
      vscode.window.showInputBox({
        prompt: "Enter page number (default is 1)",
        placeHolder: "1"
      }).then((pageInput) => {
        const page = pageInput?.trim() || "1";
  
        vscode.window.showInputBox({
          prompt: "Enter count per page (default is 100)",
          placeHolder: "100"
        }).then((countInput) => {
          const count = countInput?.trim() || "100";
  
          vscode.window.showQuickPick(["asc", "desc"], {
            placeHolder: "Select order (asc or desc)",
          }).then((order) => {
            const sortOrder = order || "asc";
  
            const baseUrl =
              network === "preprod"
                ? this.preprod_baseUrl
                : this.preview_baseUrl;
  
            const apiUrl = `${baseUrl}/assets/${assetId}/addresses?page=${page}&count=${count}&order=${sortOrder}`;
  
            this.executeCurlCommand(apiUrl, apiKey, (response) => {
              this.displayOutput(response);
            });
          });
        });
      });
    });
  }
  

  private getRetiringStakePools(): void {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();
  
    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }
  
    vscode.window.showInputBox({
      prompt: "Enter number of pools per page (1-100)",
      placeHolder: "e.g., 10",
      validateInput: (value) => {
        const num = parseInt(value);
        return isNaN(num) || num < 1 || num > 100 ? "Please enter a number between 1 and 100." : null;
      }
    }).then((countInput) => {
      if (!countInput) return;
      const count = parseInt(countInput);
  
      vscode.window.showInputBox({
        prompt: "Enter page number (1 or more)",
        placeHolder: "e.g., 1",
        validateInput: (value) => {
          const num = parseInt(value);
          return isNaN(num) || num < 1 ? "Please enter a valid page number." : null;
        }
      }).then((pageInput) => {
        if (!pageInput) return;
        const page = parseInt(pageInput);
  
        vscode.window.showQuickPick(["asc", "desc"], {
          placeHolder: "Select order (asc = oldest first, desc = newest first)"
        }).then((order) => {
          if (!order) return;
  
          let baseUrl = "";
          if (network === "preprod") {
            baseUrl = this.preprod_baseUrl;
          } else if (network === "preview") {
            baseUrl = this.preview_baseUrl;
          } else {
            vscode.window.showErrorMessage("Unsupported network.");
            return;
          }
  
          const apiUrl = `${baseUrl}/pools/retiring?count=${count}&page=${page}&order=${order}`;
  
          this.executeCurlCommand(apiUrl, apiKey, (response) => {
            this.displayOutput(response);
          });
        });
      });
    });
  }
  

  private getRetiredStakePools(): void {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();
  
    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }
  
    vscode.window.showInputBox({
      prompt: "Enter number of pools per page (1–100)",
      placeHolder: "e.g., 10",
      validateInput: (value) => {
        const num = parseInt(value);
        return isNaN(num) || num < 1 || num > 100
          ? "Please enter a number between 1 and 100."
          : null;
      },
    }).then((countInput) => {
      if (!countInput) return;
      const count = parseInt(countInput);
  
      vscode.window.showInputBox({
        prompt: "Enter page number (starting from 1)",
        placeHolder: "e.g., 1",
        validateInput: (value) => {
          const num = parseInt(value);
          return isNaN(num) || num < 1 ? "Please enter a valid page number." : null;
        },
      }).then((pageInput) => {
        if (!pageInput) return;
        const page = parseInt(pageInput);
  
        vscode.window.showQuickPick(["asc", "desc"], {
          placeHolder: "Select order (asc = oldest first, desc = newest first)",
        }).then((order) => {
          if (!order) return;
  
          let baseUrl = "";
          if (network === "preprod") {
            baseUrl = this.preprod_baseUrl;
          } else if (network === "preview") {
            baseUrl = this.preview_baseUrl;
          } else {
            vscode.window.showErrorMessage("Unsupported network.");
            return;
          }
  
          const apiUrl = `${baseUrl}/pools/retired?count=${count}&page=${page}&order=${order}`;
  
          this.executeCurlCommand(apiUrl, apiKey, (response) => {
            this.displayOutput(response);
          });
        });
      });
    });
  }


  private getStakePoolHistory(): void {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();
  
    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }
  
    vscode.window.showInputBox({
      prompt: "Enter the Pool ID (Bech32 or Hex)",
      placeHolder: "e.g., pool1pu5jlj4q9w9jlxeu370a3c9myx47md5j5m2str0naunn2q3lkdy",
    }).then((poolId) => {
      if (!poolId) {
        vscode.window.showErrorMessage("Pool ID is required.");
        return;
      }
  
      vscode.window.showInputBox({
        prompt: "Enter number of items per page (1–100)",
        placeHolder: "e.g., 10",
        validateInput: (val) =>
          isNaN(parseInt(val)) || parseInt(val) < 1 || parseInt(val) > 100
            ? "Enter a valid number between 1 and 100"
            : null,
      }).then((countInput) => {
        const count = parseInt(countInput || "100");
  
        vscode.window.showInputBox({
          prompt: "Enter page number",
          placeHolder: "e.g., 1",
          validateInput: (val) =>
            isNaN(parseInt(val)) || parseInt(val) < 1
              ? "Enter a valid page number"
              : null,
        }).then((pageInput) => {
          const page = parseInt(pageInput || "1");
  
          vscode.window.showQuickPick(["asc", "desc"], {
            placeHolder: "Select order of history",
          }).then((order) => {
            if (!order) {
              vscode.window.showErrorMessage("Order is required.");
              return;
            }
  
            let baseUrl = "";
            if (network === "preprod") {
              baseUrl = this.preprod_baseUrl;
            } else if (network === "preview") {
              baseUrl = this.preview_baseUrl;
            } else {
              vscode.window.showErrorMessage("Unsupported network.");
              return;
            }
  
            const apiUrl = `${baseUrl}/pools/${poolId}/history?count=${count}&page=${page}&order=${order}`;
  
            this.executeCurlCommand(apiUrl, apiKey, (response) => {
              this.displayOutput(response);
            });
          });
        });
      });
    });
  }
  

  private getPlutusScriptCbor(): void {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();
  
    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }
  
    vscode.window
      .showInputBox({
        prompt: "Enter the script hash",
        placeHolder: "e.g., e1457a0c47dfb7a2f6b8fbb059bdceab163c05d34f195b87b9f2b30e",
      })
      .then((scriptHash) => {
        if (!scriptHash) {
          vscode.window.showErrorMessage("Script hash is required.");
          return;
        }
  
        let baseUrl = "";
        if (network === "preprod") {
          baseUrl = this.preprod_baseUrl;
        } else if (network === "preview") {
          baseUrl = this.preview_baseUrl;
        } else {
          vscode.window.showErrorMessage("Unsupported network.");
          return;
        }
  
        const apiUrl = `${baseUrl}/scripts/${scriptHash}/cbor`;
  
        this.executeCurlCommand(apiUrl, apiKey, (response) => {
          this.displayOutput(response);
        });
      });
  }
  

  private getScriptRedeemers(): void {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();
  
    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }
  
    vscode.window.showInputBox({
      prompt: "Enter the Plutus script hash",
      placeHolder: "e.g., e1457a0c47dfb7a2f6b8fbb059bdceab163c05d34f195b87b9f2b30e"
    }).then((scriptHash) => {
      if (!scriptHash) {
        vscode.window.showErrorMessage("Script hash is required.");
        return;
      }
  
      vscode.window.showInputBox({
        prompt: "Enter the page number (default: 1)",
        value: "1"
      }).then((page) => {
        const pageNumber = page || "1";
  
        vscode.window.showQuickPick(["asc", "desc"], {
          placeHolder: "Select order of redeemers"
        }).then((order) => {
          const sortOrder = order || "asc";
  
          const baseUrl = network === "preprod"
            ? this.preprod_baseUrl
            : network === "preview"
            ? this.preview_baseUrl
            : "";
  
          if (!baseUrl) {
            vscode.window.showErrorMessage("Unsupported network.");
            return;
          }
  
          const apiUrl = `${baseUrl}/scripts/${scriptHash}/redeemers?page=${pageNumber}&order=${sortOrder}`;
          this.executeCurlCommand(apiUrl, apiKey, (response) => {
            this.displayOutput(response);
          });
        });
      });
    });
  }
  
  private getDatumValue(): void {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();
  
    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }
  
    vscode.window.showInputBox({
      prompt: "Enter the datum hash",
      placeHolder: "e.g., db583ad85881a96c73fbb26ab9e24d1120bb38f45385664bb9c797a2ea8d9a2d"
    }).then((datumHash) => {
      if (!datumHash) {
        vscode.window.showErrorMessage("Datum hash is required.");
        return;
      }
  
      const baseUrl =
        network === "preprod"
          ? this.preprod_baseUrl
          : network === "preview"
          ? this.preview_baseUrl
          : "";
  
      if (!baseUrl) {
        vscode.window.showErrorMessage("Unsupported network.");
        return;
      }
  
      const apiUrl = `${baseUrl}/scripts/datum/${datumHash}`;
      this.executeCurlCommand(apiUrl, apiKey, (response) => {
        this.displayOutput(response);
      });
    });
  }


  private getDatumCborValue(): void {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();
  
    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }
  
    vscode.window.showInputBox({
      prompt: "Enter the datum hash",
      placeHolder: "e.g., db583ad85881a96c73fbb26ab9e24d1120bb38f45385664bb9c797a2ea8d9a2d"
    }).then((datumHash) => {
      if (!datumHash) {
        vscode.window.showErrorMessage("Datum hash is required.");
        return;
      }
  
      const baseUrl =
        network === "preprod"
          ? this.preprod_baseUrl
          : network === "preview"
          ? this.preview_baseUrl
          : "";
  
      if (!baseUrl) {
        vscode.window.showErrorMessage("Unsupported network.");
        return;
      }
  
      const apiUrl = `${baseUrl}/scripts/datum/${datumHash}/cbor`;
  
      this.executeCurlCommand(apiUrl, apiKey, (response) => {
        this.displayOutput(response);
      });
    });
  }
  
  private getTransactionUtxos(): void {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();
  
    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }
  
    vscode.window.showInputBox({
      prompt: "Enter the transaction hash",
      placeHolder: "e.g., 6e5f825c82c1c6d6b77f2a14092f3b78c8f1b66db6f4cf8caec1555b6f967b3b"
    }).then((txHash) => {
      if (!txHash) {
        vscode.window.showErrorMessage("Transaction hash is required.");
        return;
      }
  
      const baseUrl =
        network === "preprod"
          ? this.preprod_baseUrl
          : network === "preview"
          ? this.preview_baseUrl
          : "https://cardano-mainnet.blockfrost.io/api/v0"; // Default to mainnet
  
      const apiUrl = `${baseUrl}/txs/${txHash}/utxos`;
  
      this.executeCurlCommand(apiUrl, apiKey, (response) => {
        this.displayOutput(response);
      });
    });
  }
  
  private getTransactionDelegationCerts(): void {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();
  
    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }
  
    vscode.window.showInputBox({
      prompt: "Enter the transaction hash",
      placeHolder: "e.g., 6e5f825c82c1c6d6b77f2a14092f3b78c8f1b66db6f4cf8caec1555b6f967b3b"
    }).then((txHash) => {
      if (!txHash) {
        vscode.window.showErrorMessage("Transaction hash is required.");
        return;
      }
  
      const baseUrl =
        network === "preprod"
          ? this.preprod_baseUrl
          : network === "preview"
          ? this.preview_baseUrl
          : "https://cardano-mainnet.blockfrost.io/api/v0";
  
      const apiUrl = `${baseUrl}/txs/${txHash}/delegations`;
  
      this.executeCurlCommand(apiUrl, apiKey, (response) => {
        this.displayOutput(response);
      });
    });
  }
  



}
 