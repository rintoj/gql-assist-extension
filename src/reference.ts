import {
  Range as GQLRange,
  Position,
  provideDefinitionFromSchema,
  provideDefinitionFromSource,
  provideReferenceFromSchema,
  provideSymbolsFromSchema,
  SymbolType,
} from 'gql-assist'
import * as vscode from 'vscode'
import { getSchema, getSchemaLocation } from './schema'
import { documentToSourceFile } from './util/document-to-sourceFile'

function toVSCodeRange(range: GQLRange) {
  return new vscode.Range(
    new vscode.Position(range.start.line, range.start.character),
    new vscode.Position(range.end.line, range.end.character),
  )
}

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
  return new vscode.Location(document.uri, toVSCodeRange(range))
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
  return ranges.map(range => new vscode.Location(document.uri, toVSCodeRange(range)))
}

function toSymbolKind(type: SymbolType) {
  switch (type) {
    case 'Scalar':
      return vscode.SymbolKind.Constant
    case 'Type':
      return vscode.SymbolKind.Interface
    case 'Enum':
      return vscode.SymbolKind.Enum
    case 'Input':
      return vscode.SymbolKind.Interface
    case 'Field':
      return vscode.SymbolKind.Property
    case 'Union':
      return vscode.SymbolKind.Struct
    case 'Interface':
      return vscode.SymbolKind.Interface
  }
}

function provideDocumentSymbolsForSchema(document: vscode.TextDocument): vscode.DocumentSymbol[] {
  const source = document?.getText()
  if (!source) {
    return []
  }
  const symbols = provideSymbolsFromSchema(source)
  console.log(symbols)
  return symbols.map(
    symbol =>
      new vscode.DocumentSymbol(
        symbol.name,
        symbol.containerName,
        toSymbolKind(symbol.type),
        toVSCodeRange(symbol.range),
        toVSCodeRange(symbol.range),
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
  context.subscriptions.push(
    vscode.languages.registerDocumentSymbolProvider('graphql', {
      provideDocumentSymbols: provideDocumentSymbolsForSchema,
    }),
  )
}
