
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import('chai').then(chai => {
  const expect = chai.expect;

  suite('extension test suite1', function () {
    this.timeout(30000); // Set suite timeout to 30 seconds
  
    let outputChannel: vscode.OutputChannel;
    let appendLineStub: sinon.SinonStub;
  
    setup(async () => {
      outputChannel = vscode.window.createOutputChannel('CardanoVSC');
      appendLineStub = sinon.stub(outputChannel, 'appendLine'); // Stub the appendLine method
  
      // Ensure the extension is activated
      const extension = vscode.extensions.getExtension('AIQUANT-TECHNOLOGIES.cardanovsc');
      if (extension) {
        await extension.activate();
      } else {
        throw new Error('Extension not found.');
      }
    });
  
    teardown(() => {
      sinon.restore(); // Restore stubbed methods after each test
    });
  
    test('should register and execute', async function () {
      this.timeout(30000); // Increased timeout for async operations (30 seconds)
  
      const commandId = 'cardano.apiIntegration';
      const commands = await vscode.commands.getCommands();
  
      // Ensure the command is registered
      expect(commands.includes(commandId), `"${commandId}" should be registered.`).to.be.true;
  
      try {
        await vscode.commands.executeCommand(commandId);
        console.log("Command executed successfully!");
  
        // Simulate pressing the ESC key (close quick open dialog, for example)
        await vscode.commands.executeCommand('workbench.action.closeQuickOpen');
        console.log("Simulated ESC key press (close quick open dialog).");
  
      } catch (error) {
        console.error("Command execution failed:", error);
        throw new Error(`Command execution failed: ${error}`);
      }
    });
  
  });
  
  // Sleep utility function (no longer necessary for timeout handling)
  function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  });