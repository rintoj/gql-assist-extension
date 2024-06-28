import { FieldDef, extractTypeDefinitions } from 'gql-assist'
import gql from 'graphql'
import { ById } from 'tsds-tools'

export class Cache {
  private readonly storage: {
    schema?: gql.GraphQLSchema
    schemaDef: ById<ById<FieldDef>>
  } = {
    schemaDef: {},
  }

  get schema() {
    return this.storage.schema
  }

  setSchema(schema: gql.GraphQLSchema) {
    this.storage.schema = schema
    return schema
  }
}

export const cache = new Cache()
