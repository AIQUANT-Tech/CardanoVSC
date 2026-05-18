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
    const { Blockfrost, Lucid } = await import("lucid-cardano");

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

    return lucid;
  } catch (error: any) {
    vscode.window.showErrorMessage(
      "Error initializing Lucid with the selected network."
    );
    return null;
  }
}
