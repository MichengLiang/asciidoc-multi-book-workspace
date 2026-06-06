# Changelog

## 0.1.4 - 2026-06-06

### Added

- Add `07-structured-writing-conventions`, a default workspace sample book for structured writing conventions.
- Document how headings, stable IDs, role tokens, xrefs, rel predicates, and named attributes form a readable and projection-friendly source surface.
- Add sample contract coverage for the structured writing conventions book.

### Changed

- Update the default workspace catalog and README to include structured writing conventions without tying README wording to a fixed sample count.

## 0.1.3 - 2026-06-06

### Added

- Expand the book anatomy sample with part directory guidance, chapter numbering notes, and inline structure markers.
- Add sample contract checks for semantic inline roles, path roles, explicit anchors, xrefs, and index term macro usage.
- Guard the npm package boundary against generated HTML output entering the published template.

### Changed

- Clarify that the anatomy sample shows structure positions and combinations, not a required checklist for every book.
- Use explicit `indexterm2` and `indexterm` macro syntax in the anatomy sample.

## 0.1.2 - 2026-06-06

### Added

- Export the workspace initializer from the package root for host CLI integration.
- Publish TypeScript declaration files for the public initializer API.

### Changed

- Return the resolved target directory and generated package name from `initWorkspace`.
- Document the library entrypoint while keeping command parsing and user-facing output owned by host CLIs.

## 0.1.1 - 2026-06-06

### Added

- Add maintainer preview commands for rebuilding the default sample workspace locally.
- Keep routine template previews fast by using the maintainer AsciiDoc toolchain, while `preview:fresh` still verifies the generated workspace's own dependency installation.

### Changed

- Use `build/template-preview/workspace/build/html/index.html` as the single preview HTML output path.
- Keep preview source and tests out of the npm package boundary while publishing the compiled script referenced by maintainer commands.

## 0.1.0 - 2026-06-04

### Added

- Publish the project as `create-asciidoc-multi-book-workspace`, an npm initializer for complete AsciiDoc multi-book workspaces.
- Generate user-owned workspaces with seven sample books, `catalog.adoc`, shared assets, explicit AsciiDoc dependencies, and an editable local `tools/adoc-books.mjs` runtime.
- Keep maintainer-only files out of generated workspaces and the npm package, including tests, CI, TypeScript source, and `DESIGN.adoc`.
- Build and check generated workspaces through a single Node runtime using Asciidoctor.js, reducer support, local resource checks, Kroki diagram URL rendering, and optional fetched diagram output.
- Validate that each default sample book can be deleted after removing its catalog entries, while user-authored real broken xrefs still fail checks.
