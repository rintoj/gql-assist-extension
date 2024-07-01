import * as vscode from 'vscode'
import { config } from './config'

const tracker: Record<string, number> = {}

export enum GQLAssistFileType {
  ALL,
  MODEL,
  RESOLVER,
  INPUT,
  RESPONSE,
  ENUM,
  REACT_HOOK,
}

export function isValidFileType(fileName: string | undefined, type: GQLAssistFileType) {
  const extensions = [
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
  ].flat()
  return extensions.some(extension => fileName?.endsWith(extension))
}

export function shouldProcess(document: vscode.TextDocument | undefined, type: GQLAssistFileType) {
  if (!document || !isValidFileType(document.fileName, type)) {
    return false
  }
  if (tracker[document.fileName] === document.version) {
    return false
  }
  tracker[document.fileName] = document.version
  return true
}
