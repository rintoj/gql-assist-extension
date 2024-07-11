import { sortSchema } from 'gql-assist'
import * as vscode from 'vscode'

async function executeSortSchemaCommand() {
  const document = vscode.window.activeTextEditor?.document
  if (!document) {
    return
  }
  const schema = document.getText()
  if (!schema) {
    return
  }
  const code = sortSchema(schema)
  if (schema === code) {
    return
  }
  await vscode.window.activeTextEditor?.edit(builder => {
    const doc = vscode.window.activeTextEditor?.document
    if (!doc) {
      return
    }
    builder.replace(
      new vscode.Range(doc.lineAt(0).range.start, doc.lineAt(doc.lineCount - 1).range.end),
      code,
    )
  })
}

export function configureSortSchemaCommand(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('gql-assist.sort.schema', executeSortSchemaCommand),
  )
}
