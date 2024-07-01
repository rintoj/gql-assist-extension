import { GQLAssistConfig, NumericType, ServerLibrary } from 'gql-assist/dist/config'
import * as vscode from 'vscode'

// Define configuration interface
export interface GQLAssistExtensionConfig extends GQLAssistConfig {
  runOnSave: boolean
}

function readGqlAssistConfiguration(): GQLAssistExtensionConfig {
  const config = vscode.workspace.getConfiguration('gqlAssist')
  return {
    runOnSave: config.get<boolean>('behaviour.runOnSave', true),
    behaviour: {
      nullableByDefault: config.get<boolean>('behaviour.nullableByDefault', true),
      serverLibrary: config.get<ServerLibrary>('behaviour.serverLibrary', '@nestjs/graphql'),
      defaultNumberType: config.get<NumericType>('behaviour.defaultNumberType', 'Int'),
    },
    model: {
      enable: config.get<boolean>('model.enable', true),
      fileExtensions: config.get<string[]>('model.fileExtensions', ['.model.ts']),
    },
    resolver: {
      enable: config.get<boolean>('resolver.enable', true),
      fileExtensions: config.get<string[]>('resolver.fileExtensions', ['.resolver.ts']),
    },
    input: {
      enable: config.get<boolean>('input.enable', true),
      fileExtensions: config.get<string[]>('input.fileExtensions', ['.input.ts']),
    },
    response: {
      enable: config.get<boolean>('response.enable', true),
      fileExtensions: config.get<string[]>('response.fileExtensions', ['.response.ts']),
    },
    enum: {
      enable: config.get<boolean>('enum.enable', true),
      fileExtensions: config.get<string[]>('enum.fileExtensions', [
        '.enum.ts',
        '.model.ts',
        '.input.ts',
        '.response.ts',
      ]),
    },
    reactHook: {
      enable: config.get<boolean>('reactHook.enable', true),
      library: config.get<string>('reactHook.library', '@apollo/client'),
      schema: config.get<string[]>('reactHook.schema', ['./schema.gql', 'schema.graphql']),
      fileExtensions: config.get<string[]>('reactHook.fileExtensions', ['.gql.ts']),
    },
  }
}

export const config: GQLAssistExtensionConfig = {} as any

function keysOf<T extends Record<string, any>>(object: T): (keyof T)[] {
  return Object.keys(object)
}

function handleConfigurationChange() {
  const newConfig: GQLAssistConfig = readGqlAssistConfiguration()
  const keys = keysOf(newConfig)
  keys.map(key => ((config as any)[key] = newConfig[key]))
  console.log('Configuration changed:', config)
}

export function configureConfigWatcher(context: vscode.ExtensionContext) {
  handleConfigurationChange()
  context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(handleConfigurationChange))
}
