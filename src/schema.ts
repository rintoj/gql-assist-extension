import { SchemaManager, config } from 'gql-assist'
import { basename } from 'path'
import * as vscode from 'vscode'
import { GQLAssistFileType, getFilePatterns, isValidFileType } from './change-tracker'
import { runDiagnosticsOnAllFiles } from './diagnostics'
import { getRootFolders } from './root'

const schemaManager = new SchemaManager()
let schemaStatusBarItem: vscode.StatusBarItem

function findSchemaFiles() {
  const folders = getRootFolders()
  const files = schemaManager.findSchemaFiles(folders, config)
  updateStatusBarItem()
  return files
}

async function findAndLoadSchemaFile() {
  const folders = getRootFolders()
  const files = await schemaManager.findAndLoadSchemaFile(folders, config)
  updateStatusBarItem()
  return files
}

function updateStatusBarItem(): void {
  const document = vscode.window.activeTextEditor?.document
  if (
    !isValidFileType(document?.uri.fsPath, GQLAssistFileType.REACT_HOOK) &&
    !isValidFileType(document?.uri.fsPath, GQLAssistFileType.SCHEMA)
  ) {
    return schemaStatusBarItem.hide()
  }
  if (schemaManager.getSchemaFSPath()) {
    const path = schemaManager.getSchemaFSPath() ?? ''
    schemaStatusBarItem.text = `$(check) ${path.startsWith('http') ? path : basename(path)}`
  } else {
    schemaStatusBarItem.text = `$(warning) No schema`
  }
  schemaStatusBarItem.show()
}

function configureFileWatcher(context: vscode.ExtensionContext) {
  const pattern = getFilePatterns(GQLAssistFileType.SCHEMA)
  if (!pattern) {
    return
  }
  const fileWatcher = vscode.workspace.createFileSystemWatcher(pattern)
  fileWatcher.onDidChange(async uri => {
    if (uri.fsPath === schemaManager.getSchemaFSPath()) {
      await schemaManager.loadSchemaFromFile(uri.fsPath)
      runDiagnosticsOnAllFiles(getFilePatterns(GQLAssistFileType.REACT_HOOK))
    }
  })
  fileWatcher.onDidCreate(async () => {
    await findAndLoadSchemaFile()
  })
  fileWatcher.onDidDelete(async () => {
    findSchemaFiles()
  })
  context.subscriptions.push(fileWatcher)
}

async function chooseSchema() {
  const files = schemaManager.getSchemaFiles()
  if (!files.length) {
    vscode.window.showInformationMessage('No .txt files found in the workspace.')
    return
  }
  const selectedFile = await vscode.window.showQuickPick(
    [
      { file: undefined, label: 'Local File', kind: vscode.QuickPickItemKind.Separator },
      ...files.map(file => ({
        file,
        label: `${file === schemaManager.getSchemaFSPath() ? '$(check)' : '$(file)'}  ${basename(file)}`,
        detail: `       ${file}`,
      })),
      { file: undefined, label: 'Remote', kind: vscode.QuickPickItemKind.Separator },
      {
        file: 'remote',
        label: '$(cloud)  Remote Schema',
        detail: '       https://...',
        kind: vscode.QuickPickItemKind.Default,
      },
    ],
    {
      placeHolder: 'File name or URL',
    },
  )
  if (selectedFile?.file === 'remote') {
    const result = await vscode.window.showInputBox({
      prompt: 'Remote Schema',
      placeHolder: 'https://',
      validateInput: value => {
        return value.trim() === ''
          ? 'Value cannot be empty'
          : !value.trim().startsWith('http')
            ? 'Remote urls has to start with "http"'
            : null
      },
    })
    if (result !== undefined) {
      await schemaManager.loadSchemaFromUrl(result)
      updateStatusBarItem()
      runDiagnosticsOnAllFiles(getFilePatterns(GQLAssistFileType.REACT_HOOK))
    }
  } else {
    if (selectedFile?.file) {
      await schemaManager.loadSchemaFromFile(selectedFile.file as string)
      updateStatusBarItem()
      runDiagnosticsOnAllFiles(getFilePatterns(GQLAssistFileType.REACT_HOOK))
    }
  }
}

export async function configureSchemaStatus(context: vscode.ExtensionContext) {
  schemaStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)
  schemaStatusBarItem.command = 'gql-assist.choose.schema'
  context.subscriptions.push(schemaStatusBarItem)
  context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem))
  context.subscriptions.push(
    vscode.commands.registerCommand('gql-assist.choose.schema', chooseSchema),
  )

  await findAndLoadSchemaFile()
  configureFileWatcher(context)
  updateStatusBarItem()
}

export async function getSchema() {
  const schema = schemaManager.getSchema()
  if (schema) {
    return schema
  }
  await findAndLoadSchemaFile()
  return schemaManager.getSchema()
}
