# GraphQL Assist

GraphQL Assist is your go-to tool for supercharging GraphQL development. It simplifies writing
GraphQL queries for Apollo Client by converting them into TypeScript code, making your development
process smoother and error-free. On the server side, GraphQL Assist streamlines API development in
NestJS by automatically converting TypeScript classes, resolvers, and enums into their GraphQL
counterparts, drastically reducing boilerplate code. With robust GraphQL syntax support, including
full highlighting and language support for JavaScript, TypeScript, and JSX/TSX, GraphQL Assist
enhances your coding experience.

## Features

Discover the power of GraphQL Assist with its suite of robust functionalities:

### React Hook

Transform your GraphQL queries into TypeScript code seamlessly compatible with
[`@apollo/client`](https://www.apollographql.com/docs/react/). With GraphQL Assist, writing GraphQL
queries for Apollo Client becomes a breeze, letting you concentrate on what matters most—building
your application.

### Server Side

Streamline your GraphQL API development in a [NestJS](https://docs.nestjs.com/graphql/quick-start)
environment with GraphQL Assist. Automatically convert TypeScript classes, resolvers, and enums into
their GraphQL definitions, slashing boilerplate code and boosting productivity.

- **Model Conversion**: Instantly convert TypeScript classes to NestJS GraphQL Object Types for
  generating models, inputs, and response types.
- **Resolver Conversion**: Effortlessly transform resolver methods into GraphQL resolvers with the
  correct decorators.
- **Field Resolver Conversion**: Easily convert methods to GraphQL field resolvers with the
  necessary decorators.
- **Enum Conversion**: Swiftly transform TypeScript enums to GraphQL enums and register them.

### GraphQL Syntax Support

Enhance your coding experience with full GraphQL syntax highlighting and language support, including
bracket matching.

- **Syntax Highlighting**: Supports .graphql, .gql, and .graphqls files.
- **Language Support**: JavaScript, TypeScript, and JSX/TSX (e.g., test.js & test.ts).

## Installation

Enhance your development experience with the GraphQL Assist extension available on the Visual Studio
Code Marketplace. This extension provides in-editor completions and suggestions, making it easier to
work with GraphQL and NestJS.

Use it in 5 simple steps:

1. **Open**: Open Visual Studio Code.
2. **Navigate**: Go to the Extensions view by clicking on the Extensions icon in the Activity Bar or
   by pressing `Ctrl+Shift+X`.
3. **Search**: Search for "GraphQL Assist".
4. **Install**: Click the Install button to install the extension.
5. **Enjoy**: Once installed, the extension will provide code completions and suggestions directly
   within your IDE.

For additional automation, you can also use the
[`gql-assist`](https://www.npmjs.com/package/gql-assist) command line tool to automate validations.

## Usage

### React Hook

GraphQL Assist can also help you with writing queries for graphql client by converting GraphQL
queries into TypeScript code compatible with `@apollo/client`. With GraphQL Assist, writing GraphQL
queries for Apollo Client becomes easier and less error-prone, allowing you to focus more on
building your application.

Use it with 3 simple steps:

1. Create a file with extension `.gql.ts`
2. Write the graphql query
3. Save the file

#### Example

Given the following GraphQL query:

```ts
import gql from 'graphql-tag'

const query = gql`
  query {
    user {
      name
    }
  }
```

GraphQL Assist will look at the schema and convert it to the following on save:

```ts
import { QueryHookOptions, useQuery } from '@apollo/client'
import gql from 'graphql-tag'

const query = gql`
  query fetchUser($id: ID!) {
    user(id: $id) {
      name
    }
  }
`

export interface RequestType {
  id: string | undefined
}

export interface QueryType {
  user?: UserType
}

export interface UserType {
  name?: string
  __typename?: 'User'
}

export function useUserQuery(
  request: RequestType,
  options?: QueryHookOptions<QueryType, RequestType>,
) {
  return useQuery<QueryType, RequestType>(query, {
    variables: request,
    skip: !request.id,
    ...options,
  })
}
```

This generated TypeScript code includes:

- The converted GraphQL query with typed variables.
- Interfaces for request variables and query response.
- A custom hook `useUserQuery` for executing the query with Apollo Client.

Now, you can use `useUserQuery` hook in your components to fetch user data from the GraphQL server
efficiently.

By default GraphQL assist will look for schema at the root of all your workspace folders and for the
name `schema.gql` or `schema.graphql`

### Models

For GraphQL Assist to recognize and convert a TypeScript class into a GraphQL ObjectType, it should
be placed in a file with the extension `.model.ts`.

Use this feature with 3 simple steps:

1. Create a file with extension `.model.ts`
2. Write the basic structure of the model
3. Save the file

#### Example

Given the following TypeScript class:

```ts
export class User {
  id!: string
  name?: string
  email?: string
  bio?: string
  role?: UserRole
}
```

GraphQL Assist will convert it to:

```ts
import { Field, ID, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class User {
  @Field(() => ID)
  id!: string

  @Field({ nullable: true })
  name?: string

  @Field({ nullable: true })
  email?: string

  @Field({ nullable: true })
  bio?: string

  @Field(() => UserRole, { nullable: true })
  role?: UserRole
}
```

### Resolvers

For GraphQL Assist to recognize and convert a resolver method, it should be placed in a file with
the extension `.resolver.ts`.

Use this feature with 3 simple steps:

1. Create a file with extension `.resolver.ts`
2. Write the basic structure of the resolver
3. Save the file

#### Example

Given the following TypeScript class:

```ts
export class UserResolver {
  user(id: string, context: GQLContext) {
    return null
  }
}
```

GraphQL Assist will convert it to:

```ts
import { Args, Context, ID, Query, Resolver } from '@nestjs/graphql'

@Resolver()
export class UserResolver {
  @Query()
  user(
    @Args({ name: 'id', type: () => ID })
    id: string,

    @Context()
    context: GQLContext,
  ) {
    return null
  }
}
```

### Field Resolvers

For GraphQL Assist to recognize and convert a field resolver method, it should be placed in a file
with the extension `.resolver.ts`.

Use this feature with 3 simple steps:

1. Create a file with extension `.resolver.ts`
2. Write the basic structure of the field resolver
3. Save the file

#### Example

Given the following TypeScript class:

```ts
@Resolver(() => User)
export class UserResolver {
  fullName(parent: UserType) {}
}
```

GraphQL Assist will convert it to:

```ts
import { Parent, ResolveField, Resolver } from '@nestjs/graphql'

@Resolver(() => User)
export class UserResolver implements FieldResolver<User, UserType> {
  @ResolveField()
  fullName(
    @Parent()
    parent: UserType,
  ) {}
}
```

### Enums

For GraphQL Assist to recognize and convert enums, they should be placed in a file with the
extension `.enum.ts`.

Use this feature with 3 simple steps:

1. Create a file with extension `.resolver.ts`
2. Write an enum
3. Save the file

#### Example

Given the following TypeScript enum:

```ts
export enum UserStatus {
  ACTIVE,
  INACTIVE,
}
```

GraphQL Assist will convert it to:

```ts
import { registerEnumType } from '@nestjs/graphql'

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

registerEnumType(UserStatus, { name: 'UserStatus' })
```

## Configuration

The configuration allows you to customize various aspects of the VS Code extension behavior for
GraphQL development. Here's a breakdown of what each configuration section entails:

- **Behaviour**: Configure how the extension treats GraphQL properties, default server library, and
  default number type.

- **Model Generation**: Control automatic generation of NestJS GraphQL Object Types from TypeScript
  classes on save, including file extension configurations.

- **Resolver Generation**: Control automatic transformation of resolver methods to GraphQL resolvers
  with decorators on save, including file extension configurations.

- **Input Generation**: Enable automatic generation of input types for GraphQL mutations on save,
  including file extension configurations.

- **Response Generation**: Enable automatic generation of response types for GraphQL queries and
  mutations on save, including file extension configurations.

- **Enum Generation**: Enable automatic conversion of TypeScript enums to GraphQL enums and
  registration, including file extension configurations.

- **React Hook Generation**: Enable automatic generation of React hooks for GraphQL queries and
  mutations on save, with options for GraphQL library, schema paths, and file extensions.

These configurations provide flexibility and automation to streamline your GraphQL development
workflow directly within VS Code. You can tailor the extension behavior to match your project
requirements and coding preferences seamlessly.

### Behaviour

- **Nullable By Default**

  - Treat every property without '!' as nullable.
  - **Default:** true

- **Server Library**

  - Server library to use.
  - **Default:** `@nestjs/graphql`
  - **Options:** `@nestjs/graphql`, `type-graphql`

- **Default Number Type**
  - How to treat every numeric property by default.
  - **Default:** `Int`
  - **Options:** `Int`, `Float`

### Model Generation

- **Enable Model Generation**

  - Enable model generation.
  - **Default:** true
  - _On Save, automatically convert TypeScript classes to NestJS GraphQL Object Types._

- **Model File Extensions**
  - Model file extensions.
  - **Default:** `[".model.ts"]`
  - _For the extension to process models on save, they should be placed in a file with the extension
    as per the file extension configuration._

### Resolver Generation

- **Enable Resolver Generation**

  - Enable resolver generation.
  - **Default:** true
  - _On Save, automatically transform resolver methods to GraphQL resolvers with appropriate
    decorators._

- **Resolver File Extensions**
  - Resolver file extensions.
  - **Default:** `[".resolver.ts"]`
  - _For the extension to process resolvers on save, they should be placed in a file with the
    extension as per the file extension configuration._

### Input Generation

- **Enable Input Generation**

  - Enable input generation.
  - **Default:** true
  - _On Save, automatically generate input types for GraphQL mutations._

- **Input File Extensions**
  - Input file extensions.
  - **Default:** `[".input.ts"]`
  - _For the extension to process inputs on save, they should be placed in a file with the extension
    as per the file extension configuration._

### Response Generation

- **Enable Response Generation**

  - Enable response generation.
  - **Default:** true
  - _On Save, automatically generate response types for GraphQL queries and mutations._

- **Response File Extensions**
  - Response file extensions.
  - **Default:** `[".response.ts"]`
  - _For the extension to process responses on save, they should be placed in a file with the
    extension as per the file extension configuration._

### Enum Generation

- **Enable Enum Generation**

  - Enable enum generation.
  - **Default:** true
  - _On Save, automatically convert TypeScript enums to GraphQL enums and registers them._

- **Enum File Extensions**
  - Enum file extensions.
  - **Default:** `[".enum.ts", ".model.ts", ".input.ts", ".response.ts"]`
  - _For the extension to process enums on save, they should be placed in a file with the extension
    as per the file extension configuration._

### React Hook Generation

- **Enable React Hook Generation**

  - Enable React hook generation.
  - **Default:** true
  - _On Save, automatically generate React hooks for performing GraphQL queries and mutations._

- **GraphQL Library**

  - GraphQL library to use.
  - **Default:** `@apollo/client`

- **GraphQL Schema Paths**

  - Paths to GraphQL schema files.
  - **Default:** `["./schema.gql", "./schema.graphql"]`

- **React Hook File Extensions**
  - React hook file extensions.
  - **Default:** `[".gql.ts"]`
  - _For the extension to process React hooks on save, they should be placed in a file with the
    extension as per the file extension configuration._

## Contributing

We welcome contributions to GraphQL Assist! If you have any ideas, suggestions, or bug reports,
please open an issue or submit a pull request on our GitHub repository.

## License

GraphQL Assist is licensed under the MIT License. See the LICENSE file for more information.
