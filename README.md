# GQL Assist

GQL Assist is a powerful tool designed to streamline the development of GraphQL APIs in a
[NestJS](https://docs.nestjs.com/graphql/quick-start) environment. By automatically converting
TypeScript classes, resolvers, and enums into their corresponding GraphQL definitions, GQL Assist
significantly reduces the amount of boilerplate code you need to write.

### VSCode Extension

For an enhanced development experience, you can install the GQL Assist extension from the Visual
Studio Code Marketplace. This extension provides in-editor completions and suggestions, making it
even easier to work with GraphQL and NestJS.

1. Open Visual Studio Code.
2. Go to the Extensions view by clicking on the Extensions icon in the Activity Bar on the side of
   the window or by pressing `Ctrl+Shift+X`.
3. Search for "GQL Assist".
4. Click the Install button to install the extension.
5. Once installed, the extension will provide code completions and suggestions directly within your
   IDE.

## Features

GQL Assist provides several key functionalities:

- **Model Conversion**: Automatically converts TypeScript classes to NestJS GraphQL Object Types.
- **Resolver Conversion**: Automatically transforms resolver methods to GraphQL resolvers with
  appropriate decorators.
- **Field Resolver Conversion**: Converts methods to GraphQL field resolvers with the necessary
  decorators.
- **Enum Conversion**: Transforms TypeScript enums to GraphQL enums and registers them.

## Usage

### Models

For GQL Assist to recognize and convert a TypeScript class into a GraphQL ObjectType, it should be
placed in a file with the extension `.model.ts`.

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

GQL Assist will convert it to:

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

For GQL Assist to recognize and convert a resolver method, it should be placed in a file with the
extension `.resolver.ts`.

#### Example

Given the following TypeScript class:

```ts
export class UserResolver {
  user(id: string, context: GQLContext) {
    return null
  }
}
```

GQL Assist will convert it to:

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

For GQL Assist to recognize and convert a field resolver method, it should be placed in a file with
the extension `.resolver.ts`.

#### Example

Given the following TypeScript class:

```ts
@Resolver(() => User)
export class UserResolver {
  fullName(parent: UserType) {}
}
```

GQL Assist will convert it to:

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

For GQL Assist to recognize and convert enums, they should be placed in a file with the extension
`.enum.ts`.

#### Example

Given the following TypeScript enum:

```ts
export enum UserStatus {
  ACTIVE,
  INACTIVE,
}
```

GQL Assist will convert it to:

```ts
import { registerEnumType } from '@nestjs/graphql'

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

registerEnumType(UserStatus, { name: 'UserStatus' })
```

## Configuration

To configure GQL Assist, you can create a configuration file `gql-assist.config.js` in the root of
your project. This file can specify various options to customize the behavior of the tool.

## Contributing

We welcome contributions to GQL Assist! If you have any ideas, suggestions, or bug reports, please
open an issue or submit a pull request on our GitHub repository.

## License

GQL Assist is licensed under the MIT License. See the LICENSE file for more information.

---

GQL Assist aims to make your development experience smoother and more efficient by automating the
repetitive tasks involved in setting up a GraphQL server with NestJS. Enjoy coding with less
boilerplate and more focus on your application's core functionality!
