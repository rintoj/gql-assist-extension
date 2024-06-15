import { loadSchema, resolveSchemaFile } from 'gql-assist'
import { toNonNullArray } from 'tsds-tools'
import * as vscode from 'vscode'
import { cache } from '../common/cache'
import { config } from '../config'

export function searchAndLoadSchema() {
  const currentWorkspaceFolder = vscode.window.activeTextEditor?.document.uri
    ? vscode.workspace.getWorkspaceFolder(vscode.window.activeTextEditor?.document?.uri)
    : null
  const folders = toNonNullArray(
    Array.from(new Set([currentWorkspaceFolder, vscode.workspace.workspaceFolders].flat())),
  ).map(folder => folder.uri.fsPath)
  const schemaFile = resolveSchemaFile(undefined, folders, config)
  if (!schemaFile) {
    throw new Error(`No schema file found in the folds: ${folders.join(',')}`)
  }
  const schema = loadSchema(schemaFile)
  return cache.setSchema(schema)
}
