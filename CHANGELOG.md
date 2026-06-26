# Changelog

## 0.2.1 - 2026-06-27

### Fixed

- Mark the structured writing conventions bibliography as an AsciiDoc bibliography list in both maintainer docs and generated workspaces.

## 0.2.0 - 2026-06-23

### Added

- Make generated workspace builds fail when Asciidoctor reports parser diagnostics, including missing `include::` targets that previously only appeared on stderr.
- Extend generated HTML validation to fail on missing same-page and cross-page fragment anchors, not just missing local files.

### Fixed

- Escape quick-reference `xref` syntax examples in the structured writing sample so example text does not render as broken links.

## 0.1.13 - 2026-06-21

### Changed

- Expand the structured writing conventions sample with a decision-tree appendix for heading topology, stable IDs, roles, xrefs, surface fields, source numbering, index terms, and syntax pass-through choices.
- Update the structured writing quick reference and default semantics guidance to point authors toward the new decision-tree workflow.

## 0.1.12 - 2026-06-19

### Changed

- Expand the structured writing conventions sample to document title fields written as description lists, including multi-line field values.
- Update the maintainer and generated workspace `asciidoc-abundant-tree` dependency range to `^0.1.18` so new workspaces use the matching projection toolchain.

## 0.1.11 - 2026-06-17

### Fixed

- Synchronize the generated workspace dependency template with the `asciidoc-abundant-tree` `^0.1.16` toolchain update.
- Correct the README usage example and generated workspace dependency list.

## 0.1.10 - 2026-06-17

### Changed

- Update the maintainer dependency range for `asciidoc-abundant-tree` to `^0.1.16` and refresh the lockfile.
- Allow compatible maintainer dependency revisions through caret ranges while preserving the current resolved toolchain versions.

## 0.1.9 - 2026-06-17

### Added

- Add design notes for the `0X0` source-order numbering scheme used by structured writing sample books.
- Add a reference note on book structure, front matter, body matter, and back matter for authors modeling AsciiDoc books.
- Expand the structured writing conventions sample with heading containment, generated projection IRI, stable address label, and xref edge examples.

### Changed

- Use the same three-digit `0X0` numbering format for structured writing sample Part directories and Chapter files.
- Clarify when authors should declare stable IDs versus relying on globally unique, stable title text as the xref target.
- Tighten the sample guidance for role vocabularies, rel predicates, heading level continuity, pass macros, callouts, and large-scope xrefs.

## 0.1.8 - 2026-06-14

### Fixed

- Stop preview builds from emitting the Opal duplicate-load warning by loading Asciidoctor through the ESM `@asciidoctor/core` entry instead of mixing it with the CommonJS `asciidoctor` wrapper.

### Changed

- Depend on `@asciidoctor/core` directly in generated workspaces and align `asciidoctor-kroki` with core 3.0.4 in the lockfile.
- Clarify the structured writing sample guidance for precisely referencing a source region with ordinary `xref` links.

## 0.1.7 - 2026-06-13

### Added

- Add a `复制本书为纯文本` control to each generated book page so readers can copy the book source bundle for saving, note-taking, or model analysis.
- Add a browser fallback that opens the book source bundle as a UTF-8 plain-text page when clipboard access is unavailable.

### Changed

- Keep the generated book page controls self-contained by embedding the source bundle in the HTML instead of adding another published source file.

## 0.1.6 - 2026-06-09

### Added

- Accept typed explicit anchors such as `[#id.role, key=value]` when validating user-authored xrefs.
- Add optional `adoc-books.config.mjs` support so generated workspaces can customize the root redirect and book home-link copy.
- Add a structured writing conventions reference document and expand the generated sample's appendix with cross-file xref path guidance.

### Changed

- Keep generated workspaces catalog-oriented by default while allowing user-owned navigation semantics through configuration.

## 0.1.5 - 2026-06-07

### Added

- Add a maintainer guide for Asciidoctor book part numbering, including the boundary between `sectnums`, `partnums`, and `part-signifier`.
- Add runtime and sample contract coverage for the structured writing conventions book's generated part labels.

### Changed

- Enable native `Part I` style part numbering in `07-structured-writing-conventions`.
- Expand the structured writing conventions sample text with additional reader-facing context.

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
- Build and check generated workspaces through a single Node runtime using Asciidoctor.js, local resource checks, Kroki diagram URL rendering, and optional fetched diagram output.
- Validate that each default sample book can be deleted after removing its catalog entries, while user-authored real broken xrefs still fail checks.
