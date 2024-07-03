import * as vscode from 'vscode'
import { config } from './config'
import { getRootFolders } from './root'
import { generateHash } from 'gql-assist'

const tracker: Record<string, string> = {}

export enum GQLAssistFileType {
  ALL,
  MODEL,
  RESOLVER,
  INPUT,
  RESPONSE,
  ENUM,
  REACT_HOOK,
  SCHEMA,
}

export function getExtensions(type: GQLAssistFileType) {
  return [
    type === GQLAssistFileType.ALL || type === GQLAssistFileType.MODEL
      ? config.model.fileExtensions
      : [],
    type === GQLAssistFileType.ALL || type === GQLAssistFileType.RESOLVER
      ? config.resolver.fileExtensions
      : [],
    type === GQLAssistFileType.ALL || type === GQLAssistFileType.INPUT
      ? config.input.fileExtensions
      : [],
    type === GQLAssistFileType.ALL || type === GQLAssistFileType.RESPONSE
      ? config.response.fileExtensions
      : [],
    type === GQLAssistFileType.ALL || type === GQLAssistFileType.ENUM
      ? config.enum.fileExtensions
      : [],
    type === GQLAssistFileType.ALL || type === GQLAssistFileType.REACT_HOOK
      ? config.reactHook.fileExtensions
      : [],
    type === GQLAssistFileType.ALL || type === GQLAssistFileType.SCHEMA
      ? config.reactHook.schemaFileNames
      : [],
  ].flat()
}

export function isValidFileType(fileName: string | undefined, type: GQLAssistFileType) {
  const extensions = getExtensions(type)
  return extensions.some(extension => fileName?.endsWith(extension))
}

function toGlobPattern(pattern: string[]) {
  return pattern.length <= 1 ? pattern : `{${pattern.join(',')}}`
}

export function getFilePatterns(type: GQLAssistFileType) {
  const folders = toGlobPattern(getRootFolders())
  const pattern = toGlobPattern(getExtensions(type).map(type => `**/*${type}`))
  return [folders, pattern].join('/')
}

export function shouldProcess(
  document: vscode.TextDocument | undefined,
  type: GQLAssistFileType,
  event: string,
) {
  if (!document || !isValidFileType(document.fileName, type)) {
    return false
  }
  const key = [event, document.fileName].join(':')
  const hash = generateHash(document.getText() ?? '')
  if (tracker[key] === hash) {
    return false
  }
  tracker[key] = hash
  return true
}
