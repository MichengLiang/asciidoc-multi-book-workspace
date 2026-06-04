# Changelog

## 0.1.0 - 2026-06-04

### Added

- Publish the project as `create-asciidoc-multi-book-workspace`, an npm initializer for complete AsciiDoc multi-book workspaces.
- Generate user-owned workspaces with seven sample books, `catalog.adoc`, shared assets, explicit AsciiDoc dependencies, and an editable local `tools/adoc-books.mjs` runtime.
- Keep maintainer-only files out of generated workspaces and the npm package, including tests, CI, TypeScript source, and `DESIGN.adoc`.
- Build and check generated workspaces through a single Node runtime using Asciidoctor.js, reducer support, local resource checks, Kroki diagram URL rendering, and optional fetched diagram output.
- Validate that each default sample book can be deleted after removing its catalog entries, while user-authored real broken xrefs still fail checks.
