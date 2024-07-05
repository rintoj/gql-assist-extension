import { Position, provideDefinitionFromSchema, provideDefinitionFromSource } from 'gql-assist'
import * as vscode from 'vscode'
import { getSchema, getSchemaLocation } from './schema'
import { documentToSourceFile } from './util/document-to-sourceFile'

async function provideDefinitionForTs(
  document: vscode.TextDocument,
  position: vscode.Position,
  token: vscode.CancellationToken,
) {
  const schema = getSchema()
  if (!schema) {
    return null
  }
  const sourceFile = documentToSourceFile(document)
  const refPosition = provideDefinitionFromSource(
    sourceFile,
    new Position(position.line, position.character),
    schema,
  )
  const location = getSchemaLocation()
  if (!location || !refPosition) {
    return null
  }
  return new vscode.Location(
    vscode.Uri.parse(location),
    new vscode.Range(
      new vscode.Position(refPosition.start.line, refPosition.start.character),
      new vscode.Position(refPosition.end.line, refPosition.end.character),
    ),
  )
}

async function provideDefinitionForSchema(
  document: vscode.TextDocument,
  position: vscode.Position,
) {
  const refPosition = provideDefinitionFromSchema(
    document.getText(),
    new Position(position.line, position.character),
  )
  if (!refPosition) {
    return null
  }
  return new vscode.Location(
    document.uri,
    new vscode.Range(
      new vscode.Position(refPosition.start.line, refPosition.start.character),
      new vscode.Position(refPosition.end.line, refPosition.end.character),
    ),
  )
}

export async function configureReferenceProvider(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider('typescript', {
      provideDefinition: provideDefinitionForTs,
    }),
  )
  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider('graphql', {
      provideDefinition: provideDefinitionForSchema,
    }),
  )
}
