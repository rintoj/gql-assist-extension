import * as vscode from 'vscode'
import { provideCompletionItems } from './autocomplete'
import { config, handleConfigurationChange } from './config'
import { updateDiagnostics } from './diagnostics'
import { processDocument } from './generator'

let lastContent = ''
let lastContentOnSave = ''

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(handleConfigurationChange))

  context.subscriptions.push(
    vscode.commands.registerCommand('gql-assist.generate', async () => {
      const document = vscode.window.activeTextEditor?.document
      if (document) {
        await processDocument(document)
        updateDiagnostics(document, collection)
      }
      // vscode.window.showInformationMessage('Hello from GraphQL Assist!')
    }),
  )

  const collection = vscode.languages.createDiagnosticCollection('gql-assist')
  if (vscode.window.activeTextEditor) {
    updateDiagnostics(vscode.window.activeTextEditor.document, collection)
  }
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(editor => {
      if (editor.textEditor.document) {
        const text = editor.textEditor.document.getText()
        if (lastContent === text) {
          return
        }
        lastContent = text
        updateDiagnostics(editor.textEditor.document, collection)
      }
    }),
  )

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(async (document: vscode.TextDocument) => {
      if (config.runOnSave) {
        const text = document.getText()
        if (lastContentOnSave === text) {
          return
        }
        lastContentOnSave = text
        await processDocument(document)
        updateDiagnostics(document, collection)
      }
    }),
  )

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      'typescript',
      { provideCompletionItems },
      '\n',
      ' ',
    ),
  )
}
// This method is called when your extension is deactivated

export function deactivate() {}
