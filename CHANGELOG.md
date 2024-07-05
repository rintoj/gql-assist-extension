# Change Log

#### [v1.0.8] (2024-07-06)

- **Improve symbols with parent/child relations**: Enhanced symbol handling to include parent-child
  relationships for better code navigation and management. [GraphQL]
- **Add symbol provider**: Added a new symbol provider to improve symbol lookup and management.
  [GraphQL]
- **Add reference provider to extension**: Introduced a reference provider for enhanced code
  referencing capabilities. [TS, GraphQL]
- **Optimize `runDiagnosticsOnAllFiles`**: Improved performance and efficiency of diagnostic runs on
  all files.
- **Add syntax highlighting for GraphQL**: Implemented syntax highlighting for GraphQL files.
- **Provide reference mapping**: Added functionality for mapping references within the codebase.

#### v1.0.7 (2024-07-06)

- **Fix enum type generation**: Resolved issues with enum type generation in the extension.

#### v1.0.6 (2024-06-30)

- **Fix change tracker**: Addressed issues with the change tracking mechanism.

#### v1.0.5 (2024-06-22)

- **Fix: use relative schema file name**: Updated schema handling to use relative file names.
- **Fix publish script**: Added a script to handle publishing.

#### v1.0.4 (2024-06-15)

- **Update icon**: Changed the extension icon.
- **Update gql-assist**: Upgraded the `gql-assist` dependency.
- **Fix issue with config**: Corrected issues with configuration handling.
- **Improve schema management**: Enhanced management of schemas within the extension.
- **Improve change tracking using version of the document**: Enhanced change tracking by utilizing
  document versions.

#### v1.0.3 (2024-06-05)

- **Upgrade gql-assist version**: Updated `gql-assist` to a newer version.
- **Update icon**: Changed the extension icon.
- **Fix unused console.log**: Removed unnecessary logging.
- **Optimize auto complete**: Improved the autocomplete functionality.
- **Add hook snippets**: Included snippets for React hooks.
- **Improve auto complete**: Further enhancements to the auto-complete feature.
- **Add auto complete**: Added initial support for auto-completion.
- **Add diagnostics for React hook**: Implemented diagnostics specifically for React hooks.
- **Refactor ts parser usage**: Refactored TypeScript parser usage for better performance.
- **Introduce `runOnSave`**: Added functionality to run tasks on file save.
- **Refactor generator code**: Refactored the generator code for improved clarity and performance.
- **Rename process document to generator**: Renamed the `processDocument` function to `generator`.
- **Resolve schema as per configuration**: Fixed schema resolution to follow the specified
  configuration.

#### v1.0.1 (2024-05-25)

- **Improve documentation**: Enhanced the extension's documentation.
- **Fix: ensure name consistency**: Made sure names are consistent throughout the codebase.
- **Update version**: Updated the extension version.
- **Add icon**: Added a new icon for the extension.
- **Enable configurations**: Introduced configuration options for the extension.
- **Fix imports**: Corrected import statements.
- **Integrate GraphQL hook generation**: Added integration for generating GraphQL hooks.
- **Move to npm**: Migrated extension to use npm for package management.
- **Add README**: Added a README file with basic information about the extension.
- **Make write fail proof**: Improved error handling for writing operations.
- **Fix process document**: Fixed issues with document processing.

#### Initial Release

- **Initial setup**: Created the initial setup for the extension.

---

This changelog provides a clear and structured summary of the changes made in each version,
including features, fixes, and improvements. It omits the git hashes for a cleaner presentation.
