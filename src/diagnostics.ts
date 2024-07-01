import { globSync } from 'fast-glob'
import { diagnoseReactHook, readTSFile } from 'gql-assist'
import * as vscode from 'vscode'
import { GQLAssistFileType, getFilePatterns, shouldProcess } from './change-tracker'
import { config } from './config'
import { getSchema } from './schema'
import { documentToSourceFile } from './util/document-to-sourceFile'
import { toDiagnostic } from './util/to-diagnostic'

export const collection = vscode.languages.createDiagnosticCollection('gql-assist')

export async function runDiagnostics(document: vscode.TextDocument): Promise<void> {
  if (!shouldProcess(document, GQLAssistFileType.REACT_HOOK, 'diagnostics')) {
    return
  }
  const schema = await getSchema()
  if (!schema) {
    return console.warn('Unable to find schema. Skipping diagnostics')
  }
  const sourceFile = documentToSourceFile(document)
  const issues = diagnoseReactHook(sourceFile, schema, config).map(toDiagnostic)
  collection.set(document.uri, issues)
}

async function runDiagnosticsOnFile(file: string): Promise<void> {
  const schema = await getSchema()
  if (!schema) {
    return console.warn('Unable to find schema. Skipping diagnostics')
  }
  const sourceFile = readTSFile(file)
  const issues = diagnoseReactHook(sourceFile, schema, config).map(toDiagnostic)
  collection.set(vscode.Uri.file(file), issues)
}

export function runDiagnosticsOnAllFiles(pattern: string) {
  globSync(pattern).map(file => runDiagnosticsOnFile(file))
}

function configureHookFileWatcher(context: vscode.ExtensionContext) {
  const pattern = getFilePatterns(GQLAssistFileType.REACT_HOOK)
  if (!pattern) {
    return
  }

  // process files onces
  runDiagnosticsOnAllFiles(pattern)

  // watch for file changes
  const fileWatcher = vscode.workspace.createFileSystemWatcher(pattern)
  fileWatcher.onDidChange(uri => runDiagnosticsOnFile(uri.fsPath))
  fileWatcher.onDidDelete(uri => collection.set(uri, []))
  context.subscriptions.push(fileWatcher)
}

function configureSchemaFileWatcher(context: vscode.ExtensionContext) {
  const pattern = getFilePatterns(GQLAssistFileType.SCHEMA)
  if (!pattern) {
    return
  }
  const fileWatcher = vscode.workspace.createFileSystemWatcher(pattern)
  fileWatcher.onDidChange(uri => {
    runDiagnosticsOnAllFiles(pattern)
  })
  fileWatcher.onDidDelete(uri => {
    runDiagnosticsOnAllFiles(pattern)
  })
  fileWatcher.onDidCreate(uri => {
    runDiagnosticsOnAllFiles(pattern)
  })
  context.subscriptions.push(fileWatcher)
}

export async function configureDiagnostics(context: vscode.ExtensionContext) {
  if (vscode.window.activeTextEditor) {
    runDiagnostics(vscode.window.activeTextEditor.document)
  }
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(editor => {
      runDiagnostics(editor.textEditor.document)
    }),
  )
  configureSchemaFileWatcher(context)
  configureHookFileWatcher(context)
}
