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
  loadSchema,
  parseTSFile,
  prettify,
  printTS,
  resolveSchemaFile,
} from 'gql-assist'
import { toNonNullArray } from 'tsds-tools'
import * as vscode from 'vscode'
import { config } from './config'

const cache: any = {}

function toVSCodePosition(position: Position): vscode.Position {
  return new vscode.Position(position.line, position.character)
}

function toVSCodeRange(range: Range): vscode.Range {
  return new vscode.Range(toVSCodePosition(range.start), toVSCodePosition(range.end))
}

function searchAndLoadSchema() {
  const currentWorkspaceFolder = vscode.window.activeTextEditor?.document.uri
    ? vscode.workspace.getWorkspaceFolder(vscode.window.activeTextEditor?.document?.uri)
    : null
  const folders = toNonNullArray(
    Array.from(new Set([currentWorkspaceFolder, vscode.workspace.workspaceFolders].flat())),
  ).map(folder => folder.uri.fsPath)
  const schemaFile = resolveSchemaFile(undefined, folders, config)
  if (!schemaFile) {
    throw new Error(`No schema file found in the folds: ${folders.join(',')}`)
  }
  cache.schema = loadSchema(schemaFile)
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
