import { Position, autoCompleteHook, config } from 'gql-assist'
import { toNonNullArray } from 'tsds-tools'
import * as vscode from 'vscode'
import { GQLAssistFileType, shouldProcess } from './change-tracker'
import { getSchema } from './schema'
import { documentToSourceFile } from './util/document-to-sourceFile'

const COMPLETION_CHARS = ['\n', ' ']

async function provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
  if (!shouldProcess(document, GQLAssistFileType.REACT_HOOK, 'auto-completion')) {
    return []
  }
  const schema = await getSchema()
  if (!schema) {
    console.warn('Unable to find schema. Skipping auto completions')
    return []
  }
  const sourceFile = documentToSourceFile(document)
  const fields = autoCompleteHook(
    sourceFile,
    new Position(position.line, position.character),
    schema,
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

export async function configureAutoComplete(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      'typescript',
      { provideCompletionItems },
      ...COMPLETION_CHARS,
    ),
  )
}
