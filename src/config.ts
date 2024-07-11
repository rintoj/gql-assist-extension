import { GQLAssistConfig, NumericType, ServerLibrary } from 'gql-assist/dist/config'
import * as vscode from 'vscode'

// Define configuration interface

export interface GQLAssistExtensionConfig extends GQLAssistConfig {
  runOnSave: boolean
}

const schemaConfigKey = 'reactHook.schema'

function getExtensionConfig() {
  return vscode.workspace.getConfiguration('gqlAssist')
}

function readGqlAssistConfiguration(): GQLAssistExtensionConfig {
  const extensionConfig = getExtensionConfig()
  return {
    runOnSave: extensionConfig.get<boolean>('behaviour.runOnSave', true),
    behaviour: {
      nullableByDefault: extensionConfig.get<boolean>('behaviour.nullableByDefault', true),
      serverLibrary: extensionConfig.get<ServerLibrary>(
        'behaviour.serverLibrary',
        '@nestjs/graphql',
      ),
      defaultNumberType: extensionConfig.get<NumericType>('behaviour.defaultNumberType', 'Int'),
    },
    model: {
      enable: extensionConfig.get<boolean>('model.enable', true),
      fileExtensions: extensionConfig.get<string[]>('model.fileExtensions', ['.model.ts']),
    },
    resolver: {
      enable: extensionConfig.get<boolean>('resolver.enable', true),
      fileExtensions: extensionConfig.get<string[]>('resolver.fileExtensions', ['.resolver.ts']),
    },
    input: {
      enable: extensionConfig.get<boolean>('input.enable', true),
      fileExtensions: extensionConfig.get<string[]>('input.fileExtensions', ['.input.ts']),
    },
    response: {
      enable: extensionConfig.get<boolean>('response.enable', true),
      fileExtensions: extensionConfig.get<string[]>('response.fileExtensions', ['.response.ts']),
    },
    scalar: {
      enable: extensionConfig.get<boolean>('scalar.enable', true),
      fileExtensions: extensionConfig.get<string[]>('scalar.fileExtensions', ['.scalar.ts']),
    },
    enum: {
      enable: extensionConfig.get<boolean>('enum.enable', true),
      fileExtensions: extensionConfig.get<string[]>('enum.fileExtensions', [
        '.enum.ts',
        '.model.ts',
        '.input.ts',
        '.response.ts',
      ]),
    },
    reactHook: {
      enable: extensionConfig.get<boolean>('reactHook.enable', true),
      library: extensionConfig.get<string>('reactHook.library', '@apollo/client'),
      schema: extensionConfig.get<string>(schemaConfigKey),
      schemaFileNames: extensionConfig.get<string[]>('reactHook.schemaFileNames', [
        './schema.gql',
        'schema.graphql',
      ]),
      fileExtensions: extensionConfig.get<string[]>('reactHook.fileExtensions', ['.gql.ts']),
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
  console.log('Configuration changed:', config.reactHook.schema)
  return config
}

export function configureConfigWatcher(context: vscode.ExtensionContext) {
  const config = handleConfigurationChange()
  context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(handleConfigurationChange))
  return config
}

export async function updateWorkspaceSchemaConfig(schema: string | undefined) {
  await getExtensionConfig().update(schemaConfigKey, schema, vscode.ConfigurationTarget.Workspace)
}
