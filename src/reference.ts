import * as gqlAssist from 'gql-assist'
import * as vscode from 'vscode'
import { getSchema, getSchemaLocation } from './schema'
import { documentToSourceFile } from './util/document-to-sourceFile'

function toVSCodeRange(range: gqlAssist.Range) {
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
  const range = gqlAssist.provideDefinitionForSource(
    sourceFile,
    new gqlAssist.Position(position.line, position.character),
    schema,
  )
  const location = getSchemaLocation()
  if (!location || !range) {
    return null
  }
  return new vscode.Location(vscode.Uri.parse(location), toVSCodeRange(range))
}

async function provideDefinitionForSchema(
  document: vscode.TextDocument,
  position: vscode.Position,
) {
  const range = gqlAssist.provideDefinitionForSchema(
    document.getText(),
    new gqlAssist.Position(position.line, position.character),
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
  const ranges = gqlAssist.provideReferenceForSchema(
    document.getText(),
    new gqlAssist.Position(position.line, position.character),
  )
  if (!ranges) {
    return []
  }
  return ranges.map(range => new vscode.Location(document.uri, toVSCodeRange(range)))
}

function toSymbolKind(type: gqlAssist.SymbolType) {
  switch (type) {
    case 'Scalar':
      return vscode.SymbolKind.Constant
    case 'Type':
      return vscode.SymbolKind.Class
    case 'Enum':
      return vscode.SymbolKind.Enum
    case 'Input':
      return vscode.SymbolKind.Object
    case 'Field':
      return vscode.SymbolKind.Field
    case 'Union':
      return vscode.SymbolKind.Struct
    case 'Interface':
      return vscode.SymbolKind.Interface
    case 'EnumMember':
      return vscode.SymbolKind.EnumMember
  }
}

function toDocumentSymbol(symbol: gqlAssist.SymbolInformation): vscode.DocumentSymbol {
  const parent = new vscode.DocumentSymbol(
    symbol.name,
    symbol.containerName,
    toSymbolKind(symbol.type),
    toVSCodeRange(symbol.range),
    toVSCodeRange(symbol.range),
  )
  parent.children = symbol.children.map(child => toDocumentSymbol(child))
  return parent
}

function provideDocumentSymbolsForSchema(document: vscode.TextDocument): vscode.DocumentSymbol[] {
  const source = document?.getText()
  if (!source) {
    return []
  }
  const symbols = gqlAssist.provideSymbolsForSchema(source)
  return symbols.map(symbol => toDocumentSymbol(symbol))
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
