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
  prettify,
  printTS,
} from 'gql-assist'
import * as vscode from 'vscode'
import { GQLAssistFileType, shouldProcess } from './change-tracker'
import { config } from './config'
import { runDiagnostics } from './diagnostics'
import { getSchema } from './schema'
import { documentToSourceFile } from './util/document-to-sourceFile'

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

async function processDocument(document: vscode.TextDocument) {
  const sourceFile = documentToSourceFile(document)
  if (isHook(sourceFile, config)) {
    const schema = await getSchema()
    if (!schema) {
      return console.warn('Unable to find schema. Skipping generator')
    }
    const code = await prettify(printTS(await generateHook(sourceFile, schema, config)))
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
    await runDiagnostics(document)
  }
}

export async function configureGenerator(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('gql-assist.generate', async () => {
      const document = vscode.window.activeTextEditor?.document
      if (!document || !shouldProcess(document, GQLAssistFileType.ALL, 'generate')) {
        return
      }
      await processDocument(document)
    }),
  )

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(async (document: vscode.TextDocument) => {
      if (!config.runOnSave || !shouldProcess(document, GQLAssistFileType.ALL, 'generate')) {
        return
      }
      await processDocument(document)
    }),
  )
}
