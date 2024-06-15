import { parseTSFile } from 'gql-assist'
import * as vscode from 'vscode'

export function documentToSourceFile(document: vscode.TextDocument) {
  const { fileName } = document
  const content = document.getText().toString()
  return parseTSFile(fileName, content)
}
