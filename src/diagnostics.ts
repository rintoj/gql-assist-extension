import { globSync } from 'fast-glob'
import { diagnoseReactHook, diagnoseSchema, readTSFile } from 'gql-assist'
import * as gql from 'graphql'
import ts from 'typescript'
import * as vscode from 'vscode'
import { GQLAssistFileType, getFilePatterns, shouldProcess } from './change-tracker'
import { config } from './config'
import { getSchema } from './schema'
import { documentToSourceFile } from './util/document-to-sourceFile'
import { toDiagnostic } from './util/to-diagnostic'

export const collection = vscode.languages.createDiagnosticCollection('gql-assist')

function runDiagnosticsOnContent(sourceFile: ts.SourceFile, schema: gql.GraphQLSchema | undefined) {
  const issues = !schema
    ? diagnoseSchema(sourceFile, schema).map(toDiagnostic)
    : diagnoseReactHook(sourceFile, schema, config).map(toDiagnostic)
  collection.set(vscode.Uri.file(sourceFile.fileName), issues)
}

export async function runDiagnostics(document: vscode.TextDocument): Promise<void> {
  if (!shouldProcess(document, GQLAssistFileType.REACT_HOOK, 'diagnostics')) {
    return
  }
  runDiagnosticsOnContent(documentToSourceFile(document), getSchema())
}

async function runDiagnosticsOnFile(file: string): Promise<void> {
  const sourceFile = readTSFile(file)
  runDiagnosticsOnContent(sourceFile, getSchema())
}

export function runDiagnosticsOnAllFiles() {
  const pattern = getFilePatterns(GQLAssistFileType.REACT_HOOK)
  if (!pattern) {
    return
  }
  globSync(pattern).map(file => runDiagnosticsOnFile(file))
}

function configureHookFileWatcher(context: vscode.ExtensionContext) {
  const pattern = getFilePatterns(GQLAssistFileType.REACT_HOOK)
  if (!pattern) {
    return
  }

  // watch for file changes
  const fileWatcher = vscode.workspace.createFileSystemWatcher(pattern)
  fileWatcher.onDidCreate(uri => runDiagnosticsOnFile(uri.fsPath))
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
  fileWatcher.onDidCreate(() => runDiagnosticsOnAllFiles())
  fileWatcher.onDidChange(() => runDiagnosticsOnAllFiles())
  fileWatcher.onDidDelete(() => runDiagnosticsOnAllFiles())
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
