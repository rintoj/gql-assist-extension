import { SchemaManager } from 'gql-assist'
import { basename } from 'path'
import { toNonNullArray } from 'tsds-tools'
import * as vscode from 'vscode'
import { GQLAssistFileType, getFilePatterns, isValidFileType } from './change-tracker'
import { config, updateWorkspaceSchemaConfig } from './config'
import { runDiagnosticsOnAllFiles } from './diagnostics'
import { getRootFolders } from './root'

const schemaManager = new SchemaManager()
let schemaStatusBarItem: vscode.StatusBarItem

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

async function updateSchema(fileOrUrl: string | undefined) {
  if (!fileOrUrl) {
    schemaManager.removeSchema()
  } else {
    try {
      await schemaManager.loadSchema(fileOrUrl)
    } catch (e: any) {
      console.log(e)
      vscode.window.showErrorMessage(`Failed to load schema! ${e.message ?? ''}`)
    }
  }
  updateStatusBarItem()
  runDiagnosticsOnAllFiles()
}

async function configureSchemaFileWatcher(context: vscode.ExtensionContext) {
  const pattern = getFilePatterns(GQLAssistFileType.SCHEMA)
  if (!pattern) {
    return
  }

  const fileWatcher = vscode.workspace.createFileSystemWatcher(pattern)
  fileWatcher.onDidChange(async uri => {
    if (uri.fsPath === schemaManager.getSchemaFSPath()) {
      await schemaManager.loadSchemaFromFile(uri.fsPath)
    }
  })
  fileWatcher.onDidCreate(async () => {
    schemaManager.findSchemaFiles(getRootFolders(), config)
  })
  fileWatcher.onDidDelete(async () => {
    schemaManager.findSchemaFiles(getRootFolders(), config)
  })

  context.subscriptions.push(fileWatcher)
}

async function chooseRemoteSchema() {
  const result = await vscode.window.showInputBox({
    prompt: 'Remote Schema',
    placeHolder: 'File from outside working directory or https://',
    validateInput: value => {
      return value.trim() === '' ? 'Value cannot be empty' : null
    },
  })
  if (result !== undefined) {
    await updateWorkspaceSchemaConfig(result)
  }
}

async function chooseSchema() {
  const files = schemaManager.getSchemaFiles()
  const selectedSchema = schemaManager.getSchemaFSPath()
  if (!files.length && !selectedSchema) {
    return chooseRemoteSchema()
  }
  const selectedOption = await vscode.window.showQuickPick(
    toNonNullArray([
      { action: undefined, label: 'Local File', kind: vscode.QuickPickItemKind.Separator },
      ...files.map(file => ({
        action: 'loadSchema',
        file,
        label: `${file === selectedSchema ? '$(check)' : '$(file)'}  ${basename(file)}`,
        detail: `       ${file}`,
      })),
      { action: undefined, label: 'Remote', kind: vscode.QuickPickItemKind.Separator },
      {
        action: 'remote',
        label: '$(cloud)  Remote Schema',
        detail: '       https://...',
        kind: vscode.QuickPickItemKind.Default,
      },
      selectedSchema
        ? { action: undefined, label: 'Clear', kind: vscode.QuickPickItemKind.Separator }
        : undefined,
      selectedSchema
        ? {
            action: 'clear',
            label: '$(close)  Clear Selected Schema',
            detail: `       ${schemaManager.getSchemaFSPath()}`,
            kind: vscode.QuickPickItemKind.Default,
          }
        : undefined,
    ]),
    { placeHolder: 'Select an Option' },
  )
  if (selectedOption?.action === 'clear') {
    updateWorkspaceSchemaConfig(undefined)
  } else if (selectedOption?.action === 'remote') {
    chooseRemoteSchema()
  } else if (selectedOption?.action === 'loadSchema') {
    const { file } = selectedOption as { file: string }
    await updateWorkspaceSchemaConfig(file)
  }
}

function configureStatusBarItem(context: vscode.ExtensionContext) {
  schemaStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)
  schemaStatusBarItem.command = 'gql-assist.choose.schema'
  context.subscriptions.push(schemaStatusBarItem)
  context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem))
  context.subscriptions.push(
    vscode.commands.registerCommand('gql-assist.choose.schema', chooseSchema),
  )
}

async function configureSchema(context: vscode.ExtensionContext) {
  schemaManager.findSchemaFiles(getRootFolders(), config)
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(() => {
      updateSchema(config.reactHook.schema)
    }),
  )
  updateSchema(config.reactHook.schema)
}

export function getSchema() {
  return schemaManager.getSchema()
}

export async function configureSchemaStatus(context: vscode.ExtensionContext) {
  configureStatusBarItem(context)
  configureSchemaFileWatcher(context)
  configureSchema(context)
}
