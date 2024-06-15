import { diagnoseReactHook } from 'gql-assist'
import path from 'path'
import * as vscode from 'vscode'
import { cache } from './common/cache'
import { config } from './config'
import { searchAndLoadSchema } from './gql/load-schema'
import { documentToSourceFile } from './util/document-to-sourceFile'
import { toDiagnostic } from './util/to-diagnostic'

export async function updateDiagnostics(
  document: vscode.TextDocument,
  collection: vscode.DiagnosticCollection,
): Promise<void> {
  if (!document || path.basename(document.uri.fsPath) !== 'use-me.gql.ts') {
    return collection.clear()
  }
  searchAndLoadSchema()
  if (!cache.schema) {
    throw new Error('No schema found so can not generate diagnostics')
  }
  const sourceFile = documentToSourceFile(document)
  const issues = diagnoseReactHook(sourceFile, cache.schema, config).map(toDiagnostic)
  console.log({ issues })
  collection.set(document.uri, issues)
}
