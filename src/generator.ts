import {
  EditActionType,
  Position,
  Range,
  calculateEditByLine,
  generate,
  generateHook,
  isEnum,
  isHook,
  isInput,
  isModel,
  isResolver,
  isResponse,
  parseTSFile,
  prettify,
  printTS,
} from 'gql-assist'
import * as vscode from 'vscode'
import { cache } from './common/cache'
import { config } from './config'
import { searchAndLoadSchema } from './gql/load-schema'

function toVSCodePosition(position: Position): vscode.Position {
  return new vscode.Position(position.line, position.character)
}

function toVSCodeRange(range: Range): vscode.Range {
  return new vscode.Range(toVSCodePosition(range.start), toVSCodePosition(range.end))
}

async function saveChanges(document: vscode.TextDocument, code: string) {
  const content = document.getText().toString()
  if (code === content) {
    return
  }
  const actions = calculateEditByLine(content, code)
  await vscode.window.activeTextEditor?.edit(builder => {
    const doc = vscode.window.activeTextEditor?.document
    if (!doc) {
      return
    }
    try {
      console.log(actions.map(action => `${action.type}:${action.token.text}`))
      for (const action of [...actions].reverse()) {
        switch (action.type) {
          case EditActionType.DELETE:
            builder.delete(toVSCodeRange(action.token.range))
            break
          case EditActionType.REPLACE:
            builder.replace(toVSCodeRange(action.token.range), action.token.text.split('\n')[0])
            break
          case EditActionType.INSERT:
            builder.insert(toVSCodePosition(action.token.range.start), action.token.text)
            break
          default:
            throw new Error('unknown action type')
        }
      }
    } catch (e) {
      console.warn(e)
      // replace all as a failsafe mechanism
      builder.replace(
        new vscode.Range(doc.lineAt(0).range.start, doc.lineAt(doc.lineCount - 1).range.end),
        code,
      )
    }
  })
  vscode.window.activeTextEditor?.document.save()
}

export async function processDocument(document: vscode.TextDocument) {
  const { fileName } = document
  const content = document.getText().toString()
  const sourceFile = parseTSFile(fileName, content)
  if (isHook(sourceFile, config)) {
    searchAndLoadSchema()
    if (!cache.schema) {
      throw new Error(
        'Failed to process the hook due to an issue with loading the required schema. Please ensure that the schema configuration is correct and accessible.',
      )
    }
    const code = await prettify(printTS(await generateHook(sourceFile, cache.schema, config)))
    await saveChanges(document, code)
  } else if (
    isModel(sourceFile, config) ||
    isResolver(sourceFile, config) ||
    isInput(sourceFile, config) ||
    isResponse(sourceFile, config) ||
    isEnum(sourceFile, config)
  ) {
    const code = await prettify(printTS(await generate(sourceFile, config)))
    await saveChanges(document, code)
  }
}
