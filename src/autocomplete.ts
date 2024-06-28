import { Position, autoCompleteHook, config, isHook } from 'gql-assist'
import * as vscode from 'vscode'
import { cache } from './common/cache'
import { searchAndLoadSchema } from './gql/load-schema'
import { documentToSourceFile } from './util/document-to-sourceFile'
import { toNonNullArray } from 'tsds-tools'

export function provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
  if (!document || !document.uri.fsPath.endsWith('.ts')) {
    return
  }
  const sourceFile = documentToSourceFile(document)
  if (!isHook(sourceFile, config)) {
    return
  }
  searchAndLoadSchema()
  if (!cache.schema) {
    throw new Error('No schema found so can not generate diagnostics')
  }
  const fields = autoCompleteHook(
    sourceFile,
    new Position(position.line, position.character),
    cache.schema,
    config,
  )
  console.log(fields)
  if (!fields?.length) {
    return []
  }
  return toNonNullArray(
    fields.map(field => {
      const completionItem = new vscode.CompletionItem(
        field.name,
        field.isSelectable ? vscode.CompletionItemKind.Interface : vscode.CompletionItemKind.Field,
      )
      completionItem.preselect = true
      completionItem.insertText = new vscode.SnippetString(field.insertText)
      completionItem.detail = field.type
      completionItem.commitCharacters = [' ']
      completionItem.documentation = new vscode.MarkdownString(field.documentation)
      completionItem.command = {
        command: 'editor.action.triggerSuggest',
        title: 'Re-trigger completions...',
      }
      return completionItem
    }),
  )
}
