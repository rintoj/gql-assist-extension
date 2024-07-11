import {
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
import { updateDocument } from './common/update-document'
import { config } from './config'
import { runDiagnostics } from './diagnostics'
import { getSchema } from './schema'
import { documentToSourceFile } from './util/document-to-sourceFile'

async function processDocument(document: vscode.TextDocument) {
  const sourceFile = documentToSourceFile(document)
  if (isHook(sourceFile, config)) {
    const schema = await getSchema()
    if (!schema) {
      return console.warn('Unable to find schema. Skipping generator')
    }
    const code = await prettify(printTS(await generateHook(sourceFile, schema, config)))
    await updateDocument(document, code)
  } else if (
    isModel(sourceFile, config) ||
    isResolver(sourceFile, config) ||
    isInput(sourceFile, config) ||
    isResponse(sourceFile, config) ||
    isEnum(sourceFile, config)
  ) {
    const code = await prettify(printTS(await generate(sourceFile, config)))
    await updateDocument(document, code)
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
