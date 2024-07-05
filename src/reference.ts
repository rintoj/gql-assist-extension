import {
  Position,
  provideDefinitionFromSchema,
  provideDefinitionFromSource,
  provideReferenceFromSchema,
} from 'gql-assist'
import * as vscode from 'vscode'
import { getSchema, getSchemaLocation } from './schema'
import { documentToSourceFile } from './util/document-to-sourceFile'

async function provideDefinitionForTs(document: vscode.TextDocument, position: vscode.Position) {
  const schema = getSchema()
  if (!schema) {
    return null
  }
  const sourceFile = documentToSourceFile(document)
  const range = provideDefinitionFromSource(
    sourceFile,
    new Position(position.line, position.character),
    schema,
  )
  const location = getSchemaLocation()
  if (!location || !range) {
    return null
  }
  return new vscode.Location(
    vscode.Uri.parse(location),
    new vscode.Range(
      new vscode.Position(range.start.line, range.start.character),
      new vscode.Position(range.end.line, range.end.character),
    ),
  )
}

async function provideDefinitionForSchema(
  document: vscode.TextDocument,
  position: vscode.Position,
) {
  const range = provideDefinitionFromSchema(
    document.getText(),
    new Position(position.line, position.character),
  )
  if (!range) {
    return null
  }
  return new vscode.Location(
    document.uri,
    new vscode.Range(
      new vscode.Position(range.start.line, range.start.character),
      new vscode.Position(range.end.line, range.end.character),
    ),
  )
}

async function provideReferencesForSchema(
  document: vscode.TextDocument,
  position: vscode.Position,
) {
  const ranges = provideReferenceFromSchema(
    document.getText(),
    new Position(position.line, position.character),
  )
  if (!ranges) {
    return []
  }
  return ranges.map(
    range =>
      new vscode.Location(
        document.uri,
        new vscode.Range(
          new vscode.Position(range.start.line, range.start.character),
          new vscode.Position(range.end.line, range.end.character),
        ),
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
  context.subscriptions.push(
    vscode.languages.registerReferenceProvider('graphql', {
      provideReferences: provideReferencesForSchema,
    }),
  )
}
