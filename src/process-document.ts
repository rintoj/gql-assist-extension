import { EditActionType } from 'gql-assist/dist/diff/actions'
import { Position, Range } from 'gql-assist/dist/diff/token'
import { calculateEditByLine } from 'gql-assist/dist/diff/calculate-edit-by-line'
import { generate } from 'gql-assist/dist/generate/generate-command'
import { parseTSFile } from 'gql-assist/dist/ts/parse-ts'
import { prettify } from 'gql-assist/dist/ts/prettify'
import { loadSchema } from 'gql-assist/dist/generator/hook/graphql-util'
import { generateHook } from 'gql-assist/dist/generator/hook/hook-generator'
import { printTS } from 'gql-assist/dist/ts/print-ts'
import * as vscode from 'vscode'

const cache: any = {}

function toVSCodePosition(position: Position): vscode.Position {
  return new vscode.Position(position.line, position.character)
}

function toVSCodeRange(range: Range): vscode.Range {
  return new vscode.Range(toVSCodePosition(range.start), toVSCodePosition(range.end))
}

function loadSchemaIfExists(path: string) {
  try {
    cache.schema = loadSchema(path)
    console.info(`Loaded schema from ${path}`)
    return true
  } catch (e) {
    console.warn(`Schema not found at ${path}`)
    return false
  }
}

function searchAndLoadSchema() {
  const currentWorkspaceFolder = vscode.window.activeTextEditor?.document.uri
    ? vscode.workspace.getWorkspaceFolder(vscode.window.activeTextEditor?.document?.uri)
    : null
  if (
    currentWorkspaceFolder
      ? loadSchemaIfExists(`${currentWorkspaceFolder.uri.fsPath}/schema.gql`)
      : false
  ) {
    return true
  }
  return !!vscode.workspace.workspaceFolders
    ?.map(folder => folder.uri.path + '/schema.gql')
    .find(loadSchemaIfExists)
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
  if (fileName.endsWith('.gql.ts')) {
    searchAndLoadSchema()
    const sourceFile = parseTSFile(fileName, content)
    const code = await prettify(printTS(await generateHook(sourceFile, cache.schema)))
    await saveChanges(document, code)
  } else {
    const sourceFile = parseTSFile(fileName, content)
    const code = await prettify(printTS(await generate(sourceFile)))
    await saveChanges(document, code)
  }
}
