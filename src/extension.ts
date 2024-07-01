import * as vscode from 'vscode'
import { configureAutoComplete } from './autocomplete'
import { configureConfigWatcher } from './config'
import { configureDiagnostics } from './diagnostics'
import { configureGenerator } from './generator'
import { configureSchemaStatus } from './schema'

export async function activate(context: vscode.ExtensionContext) {
  configureConfigWatcher(context)
  await configureSchemaStatus(context)
  await configureDiagnostics(context)
  await configureGenerator(context)
  await configureAutoComplete(context)
}

export function deactivate() {}
