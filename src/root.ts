import { toNonNullArray } from 'tsds-tools'
import * as vscode from 'vscode'

export function getRootFolders() {
  const currentWorkspaceFolder = vscode.window.activeTextEditor?.document.uri
    ? vscode.workspace.getWorkspaceFolder(vscode.window.activeTextEditor?.document?.uri)
    : null
  return toNonNullArray(
    Array.from(new Set([currentWorkspaceFolder, vscode.workspace.workspaceFolders].flat())),
  ).map(folder => folder.uri.fsPath)
}
