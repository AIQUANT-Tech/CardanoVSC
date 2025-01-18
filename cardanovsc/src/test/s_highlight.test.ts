import assert from 'assert';
import vscode from 'vscode';
import path from 'path';

suite('Syntax Highlighting Tests', () => {
  test('Check syntax highlighting for Haskell file', async () => {
    console.log('Starting "Check syntax highlighting for Haskell file" test...');

    // Path to your test file
    const testFilePath = path.join(__dirname, 'sample.hs');
    console.log('Resolved test file path:', testFilePath);

    const document = await vscode.workspace.openTextDocument(testFilePath);
    console.log('Document opened successfully.');

    const editor = await vscode.window.showTextDocument(document);
    console.log('Document displayed in the editor.');

    // Wait for syntax highlighting to load
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Waited for 1 second to ensure syntax highlighting is applied.');

    // Verify syntax highlighting by inspecting document tokens
    const range = new vscode.Range(0, 0, 0, 6); // Example: "module" in Haskell
    const tokenColorization = editor.document.getText(range);
    console.log('Highlighted Text:', tokenColorization);

    // Ensure the highlighted text matches the expected keyword
    assert.strictEqual(
      tokenColorization,
      'module',
      'Expected keyword "module" not found or not highlighted correctly.'
    );

    console.log('Test completed successfully! for highlighting');
  });
});

