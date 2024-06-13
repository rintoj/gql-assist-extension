import * as vscode from 'vscode'
import { processFile } from './process-file'

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('gql-assist.generate', () => {
    const document = vscode.window.activeTextEditor?.document
    if (document) {
      processFile(document.fileName, document.getText().toString())
    }
    // vscode.window.showInformationMessage('Hello from GraphQL Assist!')
  })

  vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
    processFile(document.fileName, document.getText().toString())
  })

  context.subscriptions.push(disposable)
}

// This method is called when your extension is deactivated
export function deactivate() {}
