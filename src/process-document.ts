import { generate } from 'gql-assist/dist/generate/generate-command'
import { parseTSFile, prettify, printTS } from 'gql-assist/dist/util/ts-util'
import * as vscode from 'vscode'

export async function processDocument(document: vscode.TextDocument) {
  const { fileName } = document
  const content = document.getText().toString()
  const sourceFile = parseTSFile(fileName, content)
  const output = await prettify(printTS(await generate(sourceFile)))
  if (output === content) {
    return
  }
  const lines = output.split('\n')
  const original = content.split('\n')
  const numberOfLines = Math.max(lines?.length, original?.length) ?? 0
  vscode.window.activeTextEditor?.edit(builder => {
    const doc = vscode.window.activeTextEditor?.document
    if (!doc) {
      return
    }
    try {
      for (let line = 0; line < numberOfLines; line++) {
        if (!lines[line] && line < original?.length) {
          console.log('delete', line)
          const { range } = doc.lineAt(line)
          builder.delete(range)
        } else if (line < original?.length && lines[line] !== original[line]) {
          console.log('replace', line)
          const { range } = doc.lineAt(line)
          builder.replace(range, lines[line])
        } else if (line >= original?.length) {
          console.log('insert', line)
          builder.insert(new vscode.Position(line, 0), lines[line] + '\r')
        }
      }
    } catch (e) {
      console.warn(e)
      builder.replace(
        new vscode.Range(doc.lineAt(0).range.start, doc.lineAt(doc.lineCount - 1).range.end),
        output,
      )
    }
  })
}
