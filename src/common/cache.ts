import { DocumentNode } from 'graphql'

export class Cache {
  private readonly storage: {
    schema?: DocumentNode
  } = {}

  get schema() {
    return this.storage.schema
  }

  setSchema(schema: DocumentNode) {
    this.storage.schema = schema
    return schema
  }
}

export const cache = new Cache()
