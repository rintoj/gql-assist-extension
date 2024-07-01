import { diagnoseReactHook } from 'gql-assist'
import * as vscode from 'vscode'
import { GQLAssistFileType, shouldProcess } from './change-tracker'
import { cache } from './common/cache'
import { config } from './config'
import { searchAndLoadSchema } from './gql/load-schema'
import { documentToSourceFile } from './util/document-to-sourceFile'
import { toDiagnostic } from './util/to-diagnostic'

export async function updateDiagnostics(
  document: vscode.TextDocument,
  collection: vscode.DiagnosticCollection,
): Promise<void> {
  if (!shouldProcess(document, GQLAssistFileType.REACT_HOOK)) {
    return
  }
  const sourceFile = documentToSourceFile(document)
  searchAndLoadSchema()
  if (!cache.schema) {
    throw new Error('No schema found so can not generate diagnostics')
  }
  const issues = diagnoseReactHook(sourceFile, cache.schema, config).map(toDiagnostic)
  collection.set(document.uri, issues)
}
