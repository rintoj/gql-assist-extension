import { Diagnostic } from 'gql-assist'
import * as vscode from 'vscode'

export function toDiagnostic(diagnostic: Diagnostic): vscode.Diagnostic {
  const [url] = diagnostic.code?.split(':') ?? []
  return {
    code: diagnostic.code ? { value: diagnostic.code, target: vscode.Uri.parse(url) } : undefined,
    message: diagnostic.message,
    range: new vscode.Range(
      new vscode.Position(diagnostic.range.start.line, diagnostic.range.start.character),
      new vscode.Position(diagnostic.range.end.line, diagnostic.range.end.character),
    ),
    severity: diagnostic.severity ?? vscode.DiagnosticSeverity.Error,
    source: 'gql-assist',
  }
}
