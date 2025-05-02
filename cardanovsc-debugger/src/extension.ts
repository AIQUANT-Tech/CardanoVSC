
import * as vscode from 'vscode';
import { HaskellDebugSession } from './debugAdapter';
import { startGhcidIfNeeded, startGhcidOnHaskellOpen } from './diagnostic';

export function activate(context: vscode.ExtensionContext) {


	const disposable = vscode.commands.registerCommand('cardanovsc-debugger.helloWorld', () => {
		
		vscode.window.showInformationMessage('Hello World from cardanovsc_debugger!');
	});

	context.subscriptions.push(disposable);

    try {
        // Register configuration provider
        const configProvider = new HaskellConfigurationProvider();
        context.subscriptions.push(
            vscode.debug.registerDebugConfigurationProvider('haskell', configProvider)
        );
        
        // Register debug adapter descriptor factory
        const debugAdapterFactory = new InlineDebugAdapterFactory();
        context.subscriptions.push(
            vscode.debug.registerDebugAdapterDescriptorFactory('haskell', debugAdapterFactory)
        );
        
    } catch (error) {
        vscode.window.showErrorMessage('Failed to initialize Haskell debugger');
    }
    startGhcidOnHaskellOpen(context);

        // Start ghcid when a Haskell file is opened or changed
        context.subscriptions.push(
            vscode.workspace.onDidOpenTextDocument((document) => {
                if (document.languageId === 'haskell') {
                    startGhcidIfNeeded();
                }
            })
        );
     
        context.subscriptions.push(
            vscode.workspace.onDidChangeTextDocument((e) => {
                if (e.document.languageId === 'haskell') {
                    startGhcidIfNeeded();
                }
            })
        );
     

}

export function deactivate() {}

class InlineDebugAdapterFactory implements vscode.DebugAdapterDescriptorFactory {
    createDebugAdapterDescriptor(
        session: vscode.DebugSession
    ): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
        try {
            return new vscode.DebugAdapterInlineImplementation(new HaskellDebugSession());
        } catch (error) {
            throw error;
        }
    }
}
class HaskellConfigurationProvider implements vscode.DebugConfigurationProvider {
    resolveDebugConfiguration(
        folder: vscode.WorkspaceFolder | undefined,
        config: vscode.DebugConfiguration,
        token?: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.DebugConfiguration> {
        try {
            // If launch.json is missing or empty
            if (!config.type && !config.request && !config.name) {
                return this.createDefaultConfig();
            }

            // Validate and enhance the configuration
            return this.validateAndEnhanceConfig(config);
        } catch (error) {
            return undefined;
        }
    }

    private createDefaultConfig(): vscode.DebugConfiguration | undefined {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.languageId === 'haskell') {
            if (!this.isHaskellFile(editor.document.fileName)) {
                this.showFileTypeError();
                return undefined;
            }

            return {
                type: 'haskell',
                name: 'Debug Haskell',
                request: 'launch',
                program: 'cabal repl --repl-no-load',
                activeFile: editor.document.fileName,
                stopOnEntry: false,
                showIO: true,
                cwd: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
            };
        }

        this.showNoHaskellFileError();
        return undefined;
    }

    private validateAndEnhanceConfig(config: vscode.DebugConfiguration): vscode.DebugConfiguration | undefined {
        const editor = vscode.window.activeTextEditor;
        
        // Set active file from editor if not specified
        if (editor?.document.languageId === 'haskell' && !config.activeFile) {
            if (!this.isHaskellFile(editor.document.fileName)) {
                this.showFileTypeError();
                return undefined;
            }
            config.activeFile = editor.document.fileName;
        }

        // Validate we have either a program or active file
        if (!config.program && !config.activeFile) {
            this.showNoHaskellFileError();
            return undefined;
        }

        // Set default values
        config.program = config.program || 'cabal repl --repl-no-load';
        config.stopOnEntry = config.stopOnEntry || false;
        config.showIO = config.showIO !== false;
        config.cwd = config.cwd || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

        return config;
    }

    private isHaskellFile(filePath: string): boolean {
        return filePath.endsWith('.hs');
    }

    private async showFileTypeError(): Promise<void> {
        await vscode.window.showErrorMessage(
            "Active file must be a Haskell source file (.hs)"
        );
    }

    private async showNoHaskellFileError(): Promise<void> {
        await vscode.window.showErrorMessage(
            "Please open a Haskell file or specify 'program' in your launch configuration"
        );
    }
}
