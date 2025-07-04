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
    const network =
      this.extensionContext.globalState.get<string>("cardano.network");
    if (!network) {
      vscode.window.showErrorMessage(
        "Network is not selected. Please set up API integration."
      );
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
      },
      {
        command: "cardanovsc.getAddressUtxos",
        callback: this.getAddressUtxos.bind(this),
      },
      {
        command: "cardanovsc.getAddressAssetUtxos",
        callback: this.getAddressAssetUtxos.bind(this),
      },
      {
        command: "cardanovsc.getAddressTransactions",
        callback: this.getAddressTransactions.bind(this),
      },
      {
        command: "cardanovsc.getLatestBlockTxsWithCbor",
        callback: this.getLatestBlockTxsWithCbor.bind(this),
      },
      {
        command: "cardanovsc.getBlockBySlot",
        callback: this.getBlockBySlot.bind(this),
      },
      {
        command: "cardanovsc.getBlockTransactions",
        callback: this.getBlockTransactions.bind(this),
      },
      {
        command: "cardanovsc.getBlockTransactionsWithCbor",
        callback: this.getBlockTransactionsWithCbor.bind(this),
      },
      {
        command: "cardanovsc.getLatestEpoch",
        callback: this.getLatestEpoch.bind(this),
      },
      {
        command: "cardanovsc.getLatestEpochProtocolParameters",
        callback: this.getLatestEpochProtocolParameters.bind(this),
      },
      {
        command: "cardanovsc.getSpecificEpoch",
        callback: this.getSpecificEpoch.bind(this),
      },
      {
        command: "cardanovsc.getNextEpochs",
        callback: this.getNextEpochs.bind(this),
      },
      {
        command: "cardanovsc.getPreviousEpochs",
        callback: this.getPreviousEpochs.bind(this),
      },
      {
        command: "cardanovsc.getEpochStakeDistribution",
        callback: this.getEpochStakeDistribution.bind(this),
      },
      {
        command: "cardanovsc.getDReps",
        callback: this.getDReps.bind(this),
      },
      {
        command: "cardanovsc.getSpecificDRep",
        callback: this.getSpecificDRep.bind(this),
      },
      {
        command: "cardanovsc.getDRepDelegators",
        callback: this.getDRepDelegators.bind(this),
      },
      {
        command: "cardanovsc.getDRepMetadata",
        callback: this.getDRepMetadata.bind(this),
      },
      {
        command: "cardanovsc.getNetworkInformation",
        callback: this.getNetworkInformation.bind(this),
      },
      {
        command: "cardanovsc.getTransactionMetadata",
        callback: this.getTransactionMetadata.bind(this),
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
      if (error) {
        const network = this.getNetwork();
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
    const apiKey = this.getApiKey();

    const network = this.getNetwork();

    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }

    if (network === "preprod") {
      const apiUrl = `${this.preprod_baseUrl}/blocks/latest`;
      this.executeCurlCommand(apiUrl, apiKey, (response) => {
        this.displayOutput(response);
      });
    } else {
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
      vscode.window.showErrorMessage(
        "This feature is only available for preview/preprod networks."
      );
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
      vscode.window.showErrorMessage(
        "This command supports only preview and preprod networks."
      );
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
      placeHolder:
        "e.g., 6e5f825c42c1c6d6b77f2a14092f3b78c8f1b66db6f4cf8caec1555b6f967b3b",
      validateInput: (value) =>
        /^[0-9a-fA-F]{64}$/.test(value)
          ? null
          : "Invalid transaction hash format",
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
      vscode.window.showErrorMessage(
        "This command only supports preprod or preview networks."
      );
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
      placeHolder:
        "e.g., 476039a0949cf0b22f6a800f56780184c44533887ca6e821007840c3",
      validateInput: (value) =>
        /^[0-9a-f]{56}$/.test(value)
          ? null
          : "Invalid Policy ID format (56 hex chars)",
      ignoreFocusOut: true,
    });

    if (!policyId) {
      vscode.window.showErrorMessage("Policy ID is required.");
      return;
    }

    const baseUrl =
      network === "preprod"
        ? this.preprod_baseUrl
        : network === "preview"
          ? this.preview_baseUrl
          : null;

    if (!baseUrl) {
      vscode.window.showErrorMessage("Unsupported network.");
      return;
    }

    const apiUrl = `${baseUrl}/assets/policy/${policyId}`;

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

    vscode.window
      .showInputBox({
        prompt: "Enter the Asset ID (policy_id + hex asset name)",
        placeHolder:
          "e.g., b0d07d45fe9514f80213f4020e5a61241458be626841cde717cb38a76e7574636f696e",
      })
      .then((assetId) => {
        if (!assetId) {
          vscode.window.showErrorMessage("Asset ID is required.");
          return;
        }

        const baseUrl =
          network === "preprod" ? this.preprod_baseUrl : this.preview_baseUrl;

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
        placeHolder:
          "e.g., pool1pu5jlj4q9w9jlxeu370a3c9myx47md5j5m2str0naunn2q3lkdy",
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

    vscode.window
      .showInputBox({
        prompt: "Enter the Asset ID (policy_id + hex-encoded asset name)",
        placeHolder:
          "e.g., b0d07d45fe9514f80213f4020e5a61241458be626841cde717cb38a76e7574636f696e",
      })
      .then((assetId) => {
        if (!assetId) {
          vscode.window.showErrorMessage("Asset ID is required.");
          return;
        }

        const baseUrl =
          network === "preprod" ? this.preprod_baseUrl : this.preview_baseUrl;

        const apiUrl = `${baseUrl}/assets/${assetId}/addresses`;

        this.executeCurlCommand(apiUrl, apiKey, (response) => {
          this.displayOutput(response);
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
    let baseUrl = "";
    if (network === "preprod") {
      baseUrl = this.preprod_baseUrl;
    } else if (network === "preview") {
      baseUrl = this.preview_baseUrl;
    } else {
      vscode.window.showErrorMessage("Unsupported network.");
      return;
    }

    const apiUrl = `${baseUrl}/pools/retiring`;

    this.executeCurlCommand(apiUrl, apiKey, (response) => {
      this.displayOutput(response);
    });
  }

  private getRetiredStakePools(): void {
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

    const apiUrl = `${baseUrl}/pools/retired`;

    this.executeCurlCommand(apiUrl, apiKey, (response) => {
      this.displayOutput(response);
    });
  }

  private getStakePoolHistory(): void {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();

    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }

    vscode.window
      .showInputBox({
        prompt: "Enter the Pool ID (Bech32 or Hex)",
        placeHolder:
          "e.g., pool1pu5jlj4q9w9jlxeu370a3c9myx47md5j5m2str0naunn2q3lkdy",
      })
      .then((poolId) => {
        if (!poolId) {
          vscode.window.showErrorMessage("Pool ID is required.");
          return;
        }

        vscode.window
          .showInputBox({
            prompt: "Enter number of items per page (1–100)",
            placeHolder: "e.g., 10",
            validateInput: (val) =>
              isNaN(parseInt(val)) || parseInt(val) < 1 || parseInt(val) > 100
                ? "Enter a valid number between 1 and 100"
                : null,
          })
          .then((countInput) => {
            const count = parseInt(countInput || "100");

            vscode.window
              .showInputBox({
                prompt: "Enter page number",
                placeHolder: "e.g., 1",
                validateInput: (val) =>
                  isNaN(parseInt(val)) || parseInt(val) < 1
                    ? "Enter a valid page number"
                    : null,
              })
              .then((pageInput) => {
                const page = parseInt(pageInput || "1");

                vscode.window
                  .showQuickPick(["asc", "desc"], {
                    placeHolder: "Select order of history",
                  })
                  .then((order) => {
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
        placeHolder:
          "e.g., e1457a0c47dfb7a2f6b8fbb059bdceab163c05d34f195b87b9f2b30e",
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

    vscode.window
      .showInputBox({
        prompt: "Enter the Plutus script hash",
        placeHolder:
          "e.g., e1457a0c47dfb7a2f6b8fbb059bdceab163c05d34f195b87b9f2b30e",
      })
      .then((scriptHash) => {
        if (!scriptHash) {
          vscode.window.showErrorMessage("Script hash is required.");
          return;
        }

        vscode.window
          .showInputBox({
            prompt: "Enter the page number (default: 1)",
            value: "1",
          })
          .then((page) => {
            const pageNumber = page || "1";

            vscode.window
              .showQuickPick(["asc", "desc"], {
                placeHolder: "Select order of redeemers",
              })
              .then((order) => {
                const sortOrder = order || "asc";

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

    vscode.window
      .showInputBox({
        prompt: "Enter the datum hash",
        placeHolder:
          "e.g., db583ad85881a96c73fbb26ab9e24d1120bb38f45385664bb9c797a2ea8d9a2d",
      })
      .then((datumHash) => {
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

    vscode.window
      .showInputBox({
        prompt: "Enter the datum hash",
        placeHolder:
          "e.g., db583ad85881a96c73fbb26ab9e24d1120bb38f45385664bb9c797a2ea8d9a2d",
      })
      .then((datumHash) => {
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

    vscode.window
      .showInputBox({
        prompt: "Enter the transaction hash",
        placeHolder:
          "e.g., 6e5f825c82c1c6d6b77f2a14092f3b78c8f1b66db6f4cf8caec1555b6f967b3b",
      })
      .then((txHash) => {
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

  private getAddressUtxos(): void {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();

    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }

    vscode.window
      .showInputBox({
        prompt: "Enter the wallet address (Bech32 format)",
        placeHolder: "e.g., addr1qx...",
      })
      .then((address) => {
        if (!address) {
          vscode.window.showErrorMessage("Wallet address is required.");
          return;
        }

        const baseUrl =
          network === "preprod"
            ? this.preprod_baseUrl
            : network === "preview"
              ? this.preview_baseUrl
              : "https://cardano-mainnet.blockfrost.io/api/v0"; // Default to mainnet

        const apiUrl = `${baseUrl}/addresses/${address}/utxos`;

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

    vscode.window
      .showInputBox({
        prompt: "Enter the transaction hash",
        placeHolder:
          "e.g., 6e5f825c82c1c6d6b77f2a14092f3b78c8f1b66db6f4cf8caec1555b6f967b3b",
      })
      .then((txHash) => {
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

  private getAddressAssetUtxos(): void {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();

    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }

    vscode.window
      .showInputBox({
        prompt: "Enter the wallet address (Bech32 format)",
        placeHolder: "e.g., addr1qx...",
        ignoreFocusOut: true
      })
      .then((address) => {
        if (!address) {
          vscode.window.showErrorMessage("Wallet address is required.");
          return;
        }

        vscode.window
          .showInputBox({
            prompt: "Enter the Asset ID (policy_id + hex-encoded asset_name)",
            placeHolder: "e.g., b0d07d45fe9514f80213f4020e5a61241458be626841cde717cb38a76e7574636f696e",
            ignoreFocusOut: true
          })
          .then((assetId) => {
            if (!assetId) {
              vscode.window.showErrorMessage("Asset ID is required.");
              return;
            }

            const baseUrl =
              network === "preprod"
                ? this.preprod_baseUrl
                : network === "preview"
                  ? this.preview_baseUrl
                  : "https://cardano-mainnet.blockfrost.io/api/v0"; // Default to mainnet

            const apiUrl = `${baseUrl}/addresses/${address}/utxos/${assetId}`;

            this.executeCurlCommand(apiUrl, apiKey, (response) => {
              this.displayOutput(response);
            });
          });
      });
  }

  private getAddressTransactions(): void {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();

    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }

    vscode.window
      .showInputBox({
        prompt: "Enter the wallet address (Bech32 format)",
        placeHolder: "e.g., addr1qx...",
        ignoreFocusOut: true
      })
      .then((address) => {
        if (!address) {
          vscode.window.showErrorMessage("Wallet address is required.");
          return;
        }

        const baseUrl =
          network === "preprod"
            ? this.preprod_baseUrl
            : network === "preview"
              ? this.preview_baseUrl
              : "https://cardano-mainnet.blockfrost.io/api/v0"; // Default to mainnet

        const apiUrl = `${baseUrl}/addresses/${address}/transactions`;

        this.executeCurlCommand(apiUrl, apiKey, (response) => {
          this.displayOutput(response);
        });
      });
  }

  private getLatestBlockTxsWithCbor(): void {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();

    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }

    const baseUrl =
      network === "preprod"
        ? this.preprod_baseUrl
        : network === "preview"
          ? this.preview_baseUrl
          : "https://cardano-mainnet.blockfrost.io/api/v0"; // Default to mainnet

    const apiUrl = `${baseUrl}/blocks/latest/txs/cbor`;

    this.executeCurlCommand(apiUrl, apiKey, (response) => {
      this.displayOutput(response);
    });
  }

  private getBlockBySlot(): void {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();

    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }

    vscode.window.showInputBox({
      prompt: "Enter the slot number of the block",
      placeHolder: "e.g., 30895909",
      ignoreFocusOut: true,
      validateInput: (value) => {
        return isNaN(Number(value)) || Number(value) < 0
          ? "Please enter a valid non-negative slot number."
          : null;
      },
    }).then((slot) => {
      if (!slot) { return; }

      const baseUrl =
        network === "preprod"
          ? this.preprod_baseUrl
          : network === "preview"
            ? this.preview_baseUrl
            : "https://cardano-mainnet.blockfrost.io/api/v0"; // Default to mainnet

      const apiUrl = `${baseUrl}/blocks/slot/${slot}`;

      this.executeCurlCommand(apiUrl, apiKey, (response) => {
        this.displayOutput(response);
      });
    });
  }

  private getBlockTransactions(): void {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();

    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }

    vscode.window.showInputBox({
      prompt: "Enter the block hash or block number",
      placeHolder: "e.g., 4873401 or 4ea1ba291e8eef538635a53e59fddba7810d1679631cc3aed7c8e6c4091a516a",
      ignoreFocusOut: true,
      validateInput: (value) => {
        return value.trim() === "" ? "Block hash or number is required." : null;
      }
    }).then((input) => {
      if (!input) { return; }

      const baseUrl =
        network === "preprod"
          ? this.preprod_baseUrl
          : network === "preview"
            ? this.preview_baseUrl
            : "https://cardano-mainnet.blockfrost.io/api/v0";

      const apiUrl = `${baseUrl}/blocks/${input}/txs`;

      this.executeCurlCommand(apiUrl, apiKey, (response) => {
        this.displayOutput(response);
      });
    });
  }

  private getBlockTransactionsWithCbor(): void {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();

    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }

    vscode.window.showInputBox({
      prompt: "Enter the block hash or block number",
      placeHolder: "e.g., 4873401 or 4ea1ba291e8eef538635a53e59fddba7810d1679631cc3aed7c8e6c4091a516a",
      validateInput: (value) => {
        return value.trim() === "" ? "Block hash or number is required." : null;
      }
    }).then((input) => {
      if (!input) { return; }

      const baseUrl =
        network === "preprod"
          ? this.preprod_baseUrl
          : network === "preview"
            ? this.preview_baseUrl
            : "https://cardano-mainnet.blockfrost.io/api/v0";

      const apiUrl = `${baseUrl}/blocks/${input}/txs/cbor`;

      this.executeCurlCommand(apiUrl, apiKey, (response) => {
        this.displayOutput(response);
      });
    });
  }



  private getLatestEpoch(): void {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();

    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }

    const baseUrl =
      network === "preprod"
        ? this.preprod_baseUrl
        : network === "preview"
          ? this.preview_baseUrl
          : "https://cardano-mainnet.blockfrost.io/api/v0"; // default to mainnet

    const apiUrl = `${baseUrl}/epochs/latest`;

    this.executeCurlCommand(apiUrl, apiKey, (response) => {
      this.displayOutput(response);
    });
  }

  private getLatestEpochProtocolParameters(): void {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();

    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }

    const baseUrl =
      network === "preprod"
        ? this.preprod_baseUrl
        : network === "preview"
          ? this.preview_baseUrl
          : "https://cardano-mainnet.blockfrost.io/api/v0"; // default to mainnet

    const apiUrl = `${baseUrl}/epochs/latest/parameters`;

    this.executeCurlCommand(apiUrl, apiKey, (response) => {
      this.displayOutput(response);
    });
  }

  private getSpecificEpoch(): void {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();

    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }

    vscode.window.showInputBox({
      prompt: "Enter the epoch number (e.g., 225)",
      placeHolder: "Epoch number",
      validateInput: (value) => {
        const num = parseInt(value);
        return isNaN(num) || num < 0 ? "Please enter a valid epoch number." : null;
      }
    }).then((epochNumber) => {
      if (!epochNumber) { return; }

      const baseUrl =
        network === "preprod"
          ? this.preprod_baseUrl
          : network === "preview"
            ? this.preview_baseUrl
            : "https://cardano-mainnet.blockfrost.io/api/v0";

      const apiUrl = `${baseUrl}/epochs/${epochNumber}`;

      this.executeCurlCommand(apiUrl, apiKey, (response) => {
        this.displayOutput(response);
      });
    });
  }


  private getNextEpochs(): void {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();

    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }

    vscode.window.showInputBox({
      prompt: "Enter the epoch number to get next epochs from (e.g., 225)",
      placeHolder: "Epoch number",
      validateInput: (value) => {
        const num = parseInt(value);
        return isNaN(num) || num < 0 ? "Please enter a valid epoch number." : null;
      }
    }).then((epochNumber) => {
      if (!epochNumber) { return; }

      const baseUrl =
        network === "preprod"
          ? this.preprod_baseUrl
          : network === "preview"
            ? this.preview_baseUrl
            : "https://cardano-mainnet.blockfrost.io/api/v0";

      const apiUrl = `${baseUrl}/epochs/${epochNumber}/next`;

      this.executeCurlCommand(apiUrl, apiKey, (response) => {
        this.displayOutput(response);
      });
    });
  }

  private getPreviousEpochs(): void {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();

    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }

    vscode.window.showInputBox({
      prompt: "Enter the epoch number to fetch previous epochs (e.g., 225)",
      placeHolder: "Epoch number",
      validateInput: (value) => {
        const num = parseInt(value);
        return isNaN(num) || num <= 0 ? "Please enter a valid positive epoch number." : null;
      }
    }).then((epochNumber) => {
      if (!epochNumber) { return; }

      const baseUrl =
        network === "preprod"
          ? this.preprod_baseUrl
          : network === "preview"
            ? this.preview_baseUrl
            : "https://cardano-mainnet.blockfrost.io/api/v0";

      const apiUrl = `${baseUrl}/epochs/${epochNumber}/previous`;

      this.executeCurlCommand(apiUrl, apiKey, (response) => {
        this.displayOutput(response);
      });
    });
  }

  private getEpochStakeDistribution(): void {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();

    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }

    vscode.window.showInputBox({
      prompt: "Enter the epoch number (e.g., 225)",
      placeHolder: "Epoch number",
      validateInput: (value) => {
        const num = parseInt(value);
        return isNaN(num) || num < 0 ? "Please enter a valid epoch number." : null;
      }
    }).then((epochNumber) => {
      if (!epochNumber) { return; }

      const baseUrl =
        network === "preprod"
          ? this.preprod_baseUrl
          : network === "preview"
            ? this.preview_baseUrl
            : "https://cardano-mainnet.blockfrost.io/api/v0";

      const apiUrl = `${baseUrl}/epochs/${epochNumber}/stakes`;

      this.executeCurlCommand(apiUrl, apiKey, (response) => {
        this.displayOutput(response);
      });
    });
  }

  private getDReps(): void {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();

    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }

    vscode.window.showInputBox({
      prompt: "Enter number of DReps per page (1-100)",
      placeHolder: "e.g., 10",
      validateInput: (value) => {
        const num = parseInt(value);
        return isNaN(num) || num < 1 || num > 100 ? "Enter a number between 1 and 100." : null;
      }
    }).then((countInput) => {
      if (!countInput) { return; }
      const count = parseInt(countInput);

      vscode.window.showQuickPick(["asc", "desc"], {
        placeHolder: "Select order (asc = oldest first, desc = newest first)"
      }).then((order) => {
        if (!order) { return; }

        const baseUrl =
          network === "preprod"
            ? this.preprod_baseUrl
            : network === "preview"
              ? this.preview_baseUrl
              : "https://cardano-mainnet.blockfrost.io/api/v0";

        const apiUrl = `${baseUrl}/governance/dreps?count=${count}&order=${order}`;

        this.executeCurlCommand(apiUrl, apiKey, (response) => {
          this.displayOutput(response);
        });
      });
    });
  }

  private getSpecificDRep(): void {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();

    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }

    vscode.window.showInputBox({
      prompt: "Enter the DRep ID (Bech32 or hexadecimal)",
      placeHolder: "e.g., drep15cfxz9exyn5rx0807zvxfrvslrjqfchrd4d47kv9e0f46ued"
    }).then((drepId) => {
      if (!drepId) {
        vscode.window.showErrorMessage("DRep ID is required.");
        return;
      }

      const baseUrl =
        network === "preprod"
          ? this.preprod_baseUrl
          : network === "preview"
            ? this.preview_baseUrl
            : "https://cardano-mainnet.blockfrost.io/api/v0";

      const apiUrl = `${baseUrl}/governance/dreps/${drepId}`;

      this.executeCurlCommand(apiUrl, apiKey, (response) => {
        this.displayOutput(response);
      });
    });
  }


  private getDRepDelegators(): void {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();

    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }

    vscode.window.showInputBox({
      prompt: "Enter the DRep ID (Bech32 or hex)",
      placeHolder: "e.g., drep1mvdu8slennngja7w4un6knwezufra70887zuxpprd64jxfveahn"
    }).then((drepId) => {
      if (!drepId) {
        vscode.window.showErrorMessage("DRep ID is required.");
        return;
      }

      const baseUrl =
        network === "preprod"
          ? this.preprod_baseUrl
          : network === "preview"
            ? this.preview_baseUrl
            : "https://cardano-mainnet.blockfrost.io/api/v0";

      const apiUrl = `${baseUrl}/governance/dreps/${drepId}/delegators`;

      this.executeCurlCommand(apiUrl, apiKey, (response) => {
        this.displayOutput(response);
      });
    });
  }

  private getDRepMetadata(): void {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();

    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }

    vscode.window.showInputBox({
      prompt: "Enter the DRep ID (Bech32 or hex)",
      placeHolder: "e.g., drep15cfxz9exyn5rx0807zvxfrvslrjqfchrd4d47kv9e0f46uedqtc",
      ignoreFocusOut: true
    }).then((drepId) => {
      if (!drepId) {
        vscode.window.showErrorMessage("DRep ID is required.");
        return;
      }

      const baseUrl =
        network === "preprod"
          ? this.preprod_baseUrl
          : network === "preview"
            ? this.preview_baseUrl
            : "https://cardano-mainnet.blockfrost.io/api/v0";

      const apiUrl = `${baseUrl}/governance/dreps/${drepId}/metadata`;

      this.executeCurlCommand(apiUrl, apiKey, (response) => {
        this.displayOutput(response);
      });
    });
  }


  private getNetworkInformation(): void {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();

    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }

    const baseUrl =
      network === "preprod"
        ? this.preprod_baseUrl
        : network === "preview"
          ? this.preview_baseUrl
          : "https://cardano-mainnet.blockfrost.io/api/v0";

    const apiUrl = `${baseUrl}/network`;

    this.executeCurlCommand(apiUrl, apiKey, (response) => {
      this.displayOutput(response);
    });
  }

  private getTransactionMetadata(): void {
    const apiKey = this.getApiKey();
    const network = this.getNetwork();

    if (!apiKey || !network) {
      vscode.window.showErrorMessage("Missing API key or network.");
      return;
    }

    vscode.window
      .showInputBox({
        prompt: "Enter the transaction hash",
        placeHolder:
          "e.g., 6e5f825c82c1c6d6b77f2a14092f3b78c8f1b66db6f4cf8caec1555b6f967b3b",
        ignoreFocusOut: true
      })
      .then((txHash) => {
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

        const apiUrl = `${baseUrl}/txs/${txHash}/metadata`;

        this.executeCurlCommand(apiUrl, apiKey, (response) => {
          this.displayOutput(response);
        });
      });
  }



}
