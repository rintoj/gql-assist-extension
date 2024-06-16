import { Position, autoCompleteHook, config, isHook } from 'gql-assist'
import * as vscode from 'vscode'
import { cache } from './common/cache'
import { searchAndLoadSchema } from './gql/load-schema'
import { documentToSourceFile } from './util/document-to-sourceFile'

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
  const selectedType = autoCompleteHook(
    sourceFile,
    new Position(position.line, position.character),
    cache.schema,
    config,
  )
  console.log({ selectedType, position })
  if (!selectedType) {
    return []
  }
  return Object.keys(selectedType ?? {}).map(fieldName => {
    const field = (selectedType as any)?.[fieldName]
    const fieldType = cache.schemaDef[field.type]
    const selectedField = fieldType
      ? Object.keys(fieldType).find(i => i === 'id') ?? Object.keys(field)[0]
      : undefined

    const completionItem = new vscode.CompletionItem(
      fieldName,
      !selectedField ? vscode.CompletionItemKind.Value : vscode.CompletionItemKind.Field,
    )
    completionItem.insertText = selectedField ? `${fieldName} { ${selectedField} }` : fieldName
    completionItem.detail = field.type
    return completionItem
  })
}

export function resolveCompletionItem(
  item: vscode.CompletionItem,
  token: vscode.CancellationToken,
) {
  const parentType = item.detail ? cache.schemaDef[item.detail] : undefined
  if (!parentType) {
    return item
  }
  return item
}
