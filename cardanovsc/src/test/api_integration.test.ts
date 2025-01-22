import * as vscode from "vscode";
import * as sinon from "sinon";
import * as dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env

import {
  integrateCardanoAPI,
  validateApiKey,
} from "../config/cardanoApiIntegration";

import("chai").then((chai) => {
  const expect = chai.expect;

  suite("integrateCardanoAPI Test Suite", function () {
    this.timeout(30000); // Set suite timeout to 30 seconds

    let showQuickPickStub: sinon.SinonStub;
    let showInputBoxStub: sinon.SinonStub;
    let globalStateUpdateStub: sinon.SinonStub;
    const apiKey:string|undefined = process.env.CARDANO_API_KEY; // Fetch API key from .env

    setup(() => {
      // Stub user input methods
      showQuickPickStub = sinon.stub(vscode.window, "showQuickPick");
      showInputBoxStub = sinon.stub(vscode.window, "showInputBox");

      // Stub globalState update
      const mockGlobalState = {
        update: sinon.stub(),
      };
      globalStateUpdateStub = mockGlobalState.update as sinon.SinonStub;
    });

    teardown(() => {
      sinon.restore(); // Restore stubbed methods after each test
    });

    test("should return false if no network is selected", async () => {
      // Mock user inputs
      showQuickPickStub.resolves(undefined); // Simulate no selection

      // Test the function
      const result = await integrateCardanoAPI(
        vscode,
        {} as vscode.ExtensionContext
      );

      // Assertions
      expect(result).to.be.false;
    });

    test("should return false if no API key is entered", async () => {
      // Mock user inputs
      showQuickPickStub.resolves("preprod");
      showInputBoxStub.resolves(undefined); // Simulate no input

      // Test the function
      const result = await integrateCardanoAPI(
        vscode,
        {} as vscode.ExtensionContext
      );

      // Assertions
      expect(result).to.be.false;
    });
    test("should return true for valid API key", async () => {
      const result = await validateApiKey(
        apiKey,
        "preprod"
      );

      expect(result).to.be.true;
    });
    test("should return false for invalid API key", async () => {
      const result = await validateApiKey(
        "075b3c7ae74bf72046d609",
        "preprod"
      );

      expect(result).to.be.false;
    });

    test("should return false on API error", async () => {
      const result = await validateApiKey(
        "075b3c7a458f72046d609",
        "preprod"
      );

      expect(result).to.be.false;
      console.log("api_integration test completed successfully! ");

    });

  });
});
