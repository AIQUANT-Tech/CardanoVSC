import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Haskell Completion Contributor Tests', () => {
  test('Module Import Completions', async () => {
    console.log('Starting "Module Import Completions" test...');

    const document = await vscode.workspace.openTextDocument({
      language: 'haskell',
      content: 'import ',
    });
    console.log('Test document created successfully.');

    await vscode.window.showTextDocument(document);
    console.log('Document displayed in the editor.');

    const completions = await getCompletions(document, new vscode.Position(0, 7));
    console.log('Available completions for "import":', completions);

    // Check if "import" exists in completions
    assert.ok(
      completions.some((item: string) => item === 'import'),
      'Completions should contain "import"'
    );

    console.log('Test completed successfully! for completion');
  });
});

/**
 * Helper function to get completion items at a specific position in the document.
 * @param document - The current text document.
 * @param position - The position to check for completions.
 * @returns An array of strings representing completion labels.
 */
async function getCompletions(document: vscode.TextDocument, position: vscode.Position): Promise<any> {
  console.log('Fetching completion items...');
  const completionList = await vscode.commands.executeCommand<vscode.CompletionList>(
    'vscode.executeCompletionItemProvider',
    document.uri,
    position
  );

  if (completionList && completionList.items) {
    console.log('Completion items retrieved:', completionList.items.map((item) => item.label));
    return completionList.items.map((item) => item.label);
  }

  console.log('No completion items found.');
  return [];
}
