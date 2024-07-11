import { sortSchema } from 'gql-assist'
import * as vscode from 'vscode'
import { updateDocument } from './common/update-document'

async function executeSortSchemaCommand() {
  const document = vscode.window.activeTextEditor?.document
  if (!document) {
    return
  }
  const schema = document.getText()
  if (!schema) {
    return
  }
  const sortedSchema = sortSchema(schema)
  await updateDocument(document, sortedSchema)
}

export function configureSortSchemaCommand(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('gql-assist.sort.schema', executeSortSchemaCommand),
  )
}
