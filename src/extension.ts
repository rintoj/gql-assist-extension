import * as vscode from 'vscode'
import { config, handleConfigurationChange } from './config'
import { processDocument } from './generator'

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(handleConfigurationChange))

  context.subscriptions.push(
    vscode.commands.registerCommand('gql-assist.generate', () => {
      const document = vscode.window.activeTextEditor?.document
      if (document) {
        processDocument(document)
      }
      // vscode.window.showInformationMessage('Hello from GraphQL Assist!')
    }),
  )

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
      if (config.runOnSave) {
        processDocument(document)
      }
    }),
  )
}

// This method is called when your extension is deactivated
export function deactivate() {}
