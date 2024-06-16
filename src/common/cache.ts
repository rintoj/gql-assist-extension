import { FieldDef, extractTypeDefinitions } from 'gql-assist'
import gql from 'graphql'
import { ById } from 'tsds-tools'

export class Cache {
  private readonly storage: {
    schema?: gql.DocumentNode
    schemaDef: ById<ById<FieldDef>>
  } = {
    schemaDef: {},
  }

  get schema() {
    return this.storage.schema
  }

  get schemaDef() {
    return this.storage.schemaDef
  }

  setSchema(schema: gql.DocumentNode) {
    this.storage.schema = schema
    this.storage.schemaDef = extractTypeDefinitions(schema)
    return schema
  }
}

export const cache = new Cache()
