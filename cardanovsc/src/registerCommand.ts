import * as vscode from 'vscode';
import * as childprocess from 'child_process';

export class extensionCommand {
  private extensionContext: vscode.ExtensionContext;
  private outputChannel: vscode.OutputChannel;
  private baseUrl: string = 'https://api.cardanoscan.io/api/v1'; // Base URL for API requests

  constructor(context: vscode.ExtensionContext) {
    this.extensionContext = context;
    this.outputChannel = vscode.window.createOutputChannel('Cardano API Response');
    this.registerCommands();
  }

  private registerCommands(): void {
    const commands = [
      { command: 'cardanovsc.get_block_details', callback: this.getBlockDetails.bind(this) },
      { command: 'cardanovsc.get_pool_details', callback: this.getPoolDetails.bind(this) },
      { command: 'cardanovsc.get_latest_block_details', callback: this.getLatestBlockDetails.bind(this) },
      { command: 'cardanovsc.get_address_balance', callback: this.getAddressBalance.bind(this) },
    ];

    commands.forEach(({ command, callback }) => {
      this.extensionContext.subscriptions.push(vscode.commands.registerCommand(command, callback));
    });
  }

  private getApiKey(): string | null {
    const storedApiKey = this.extensionContext.globalState.get<string>('cardano.apiKey');
    if (!storedApiKey) {
      vscode.window.showErrorMessage('API key not found! Please set up API integration first.');
      return null;
    }
    return storedApiKey;
  }

  private executeCurlCommand(apiUrl: string, apiKey: string, onSuccess: (response: any) => void): void {
    const curlCommand = `curl -X GET "${apiUrl}" --header "apiKey: ${apiKey}"`;

    childprocess.exec(curlCommand, (error, stdout, stderr) => {
      if (error) {
        vscode.window.showErrorMessage(`Error: ${stderr || error.message}`);
        return;
      }

      try {
        const jsonResponse = JSON.parse(stdout);
        onSuccess(jsonResponse);
      } catch (parseError) {
        vscode.window.showErrorMessage('Failed to parse API response as JSON.');
      }
    });
  }

  private displayOutput(jsonResponse: any): void {
    const formattedJson = JSON.stringify(jsonResponse, null, 2);
    this.outputChannel.clear();
    this.outputChannel.appendLine(formattedJson);
    this.outputChannel.show();
  }

  private getBlockDetails(): void {
    const apiKey = this.getApiKey();
    if (!apiKey) {return;}

    vscode.window
      .showQuickPick(
        ['blockHash', 'blockHeight', 'absoluteSlot', 'epoch and slot'],
        { placeHolder: 'Choose the parameter type to fetch block details.' }
      )
      .then(async (parameterType) => {
        if (!parameterType) {
          vscode.window.showErrorMessage('You must select a parameter type to fetch block details.');
          return;
        }

        let queryString = '';
        if (parameterType === 'blockHash') {
          const blockHash = await vscode.window.showInputBox({
            prompt: 'Enter the Block Hash',
            placeHolder: 'e.g., abc123...',
          });
          if (!blockHash) {
            vscode.window.showErrorMessage('Block Hash is required.');
            return;
          }
          queryString = `blockHash=${blockHash}`;
        } else if (parameterType === 'blockHeight') {
          const blockHeight = await vscode.window.showInputBox({
            prompt: 'Enter the Block Height',
            placeHolder: 'e.g., 12345',
          });
          if (!blockHeight) {
            vscode.window.showErrorMessage('Block Height is required.');
            return;
          }
          queryString = `blockHeight=${blockHeight}`;
        } else if (parameterType === 'absoluteSlot') {
          const absoluteSlot = await vscode.window.showInputBox({
            prompt: 'Enter the Absolute Slot',
            placeHolder: 'e.g., 12345678',
          });
          if (!absoluteSlot) {
            vscode.window.showErrorMessage('Absolute Slot is required.');
            return;
          }
          queryString = `absoluteSlot=${absoluteSlot}`;
        } else if (parameterType === 'epoch and slot') {
          const epoch = await vscode.window.showInputBox({
            prompt: 'Enter the Epoch',
            placeHolder: 'e.g., 123',
          });
          if (!epoch) {
            vscode.window.showErrorMessage('Epoch is required.');
            return;
          }

          const slot = await vscode.window.showInputBox({
            prompt: 'Enter the Slot',
            placeHolder: 'e.g., 456',
          });
          if (!slot) {
            vscode.window.showErrorMessage('Slot is required.');
            return;
          }
          queryString = `epoch=${epoch}&slot=${slot}`;
        }

        const apiUrl = `${this.baseUrl}/block?${queryString}`;
        this.executeCurlCommand(apiUrl, apiKey, (response) => {
          this.displayOutput(response);
        });
      });
  }

  private async getPoolDetails(): Promise<void> {
    const apiKey = this.getApiKey();
    if (!apiKey) {return;}

    const poolId = await vscode.window.showInputBox({
      prompt: 'Enter the Pool ID (Hex representation, exactly 56 characters)',
      placeHolder: 'e.g., abc123...',
      validateInput: (input) => {
        if (input.length !== 56) {
          return 'Pool ID must be exactly 56 characters long.';
        }
        return null;
      },
    });

    if (!poolId) {
      vscode.window.showErrorMessage('Pool ID is required to fetch pool details.');
      return;
    }

    const apiUrl = `${this.baseUrl}/pool?poolId=${poolId}`;
    this.executeCurlCommand(apiUrl, apiKey, (response) => {
      this.displayOutput(response);
    });
  }

  private getLatestBlockDetails(): void {
    const apiKey = this.getApiKey();
    if (!apiKey) {return;}

    const apiUrl = `${this.baseUrl}/block/latest`;
    this.executeCurlCommand(apiUrl, apiKey, (response) => {
      this.displayOutput(response);
    });
  }

  private async getAddressBalance(): Promise<void> {
    const apiKey = this.getApiKey();
    if (!apiKey) {return;}

    const address = await vscode.window.showInputBox({
      prompt: 'Enter the Address',
      placeHolder: 'e.g., addr1xyz...',
      validateInput: (input) => (input.length > 200 ? 'Address exceeds the maximum length of 200.' : null),
    });

    if (!address) {
      vscode.window.showErrorMessage('Address is required to fetch the balance.');
      return;
    }

    const apiUrl = `${this.baseUrl}/address/balance?address=${address}`;
    this.executeCurlCommand(apiUrl, apiKey, (response) => {
      this.displayOutput(response);
    });
  }
}
