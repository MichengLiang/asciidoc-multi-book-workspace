# Changelog

## 0.9.0 - 2026-11-01

### Changed

- Generated workspaces require Node.js 22 or later (`engines.node` is `>=22`). `asciidoctor-kroki` 2, the release line for Asciidoctor.js 4, requires it.
- The HTML is rendered by Asciidoctor.js 4 (`@asciidoctor/core` `^4.1.1`), the same Asciidoctor `asciidoc-abundant-tree` reads the books with, and diagrams by `asciidoctor-kroki` `^2.0.0`. The runtime rewrites links to the heading IDs the projection read, and the copied source bundle promises the lines the HTML shows; with the HTML rendered by Asciidoctor.js 3 neither was guaranteed, and the two versions already read some includes differently (`include::f[lines=1_0]` is line 1 in version 4, line 10 in version 3). Links, anchors, the page map, and the copied source bundle of the sample books are unchanged. Visible differences come from Asciidoctor.js 4 itself: the generator meta tag and its default stylesheet, the class names of the table of contents in books with front or back matter, table column widths written as `width` attributes, and role classes written once instead of twice.
- An include resolver may return a Promise; the HTML side waits for it as the reader data side does. A positional attribute left empty between others (`[a,,b]`) is `null` on both sides and no longer shifts the ones after it, so it is no longer forbidden.

### Upgrading an existing workspace

Make sure Node.js 22 or later runs the build. Create a temporary workspace with `pnpm create asciidoc-multi-book-workspace@0.9.0 tmp-books` and copy its `tools/adoc-books.mjs` over yours. In your `package.json`, set `"engines": { "node": ">=22" }`, `"@asciidoctor/core": "^4.1.1"`, and `"asciidoctor-kroki": "^2.0.0"`, then run `pnpm install`. Books need no change, and include resolvers that return their result directly keep working.

## 0.8.0 - 2026-10-31

### Changed

- A link with no link text shows the name of its address. When the xref's address is the heading's title or one of its qualified addresses, the link shows it as written, its titles joined with an interpunct: `xref:红烧肉::火候[]` shows 红烧肉·火候 and `xref:家常菜::红烧肉::火候[]` shows all three titles, inside a book and across books. It used to show the last title alone (火候), so a book that referred to one of several 火候 wrote its address twice, once as the target and once as link text. An xref whose address is an ID still shows the heading's title, as Asciidoctor does for a section it resolves by ID. Link text the author writes is shown as written.
- The structured writing conventions sample writes a qualified address once (《xref:红烧肉::火候[]》) and writes link text only where it says something other than the address's name. Its addressing chapter, print conventions, decision trees, and quick reference say so.

### Upgrading an existing workspace

Create a temporary workspace with `pnpm create asciidoc-multi-book-workspace@0.8.0 tmp-books` and copy its `tools/adoc-books.mjs` over yours. The `asciidoc-abundant-tree` range stays `^0.6.0`. Books need no change: link text written as the address's name, such as `xref:红烧肉::火候[红烧肉·火候]`, still shows the same, and can be removed.

## 0.7.0 - 2026-10-31

### Removed

- The generated workspace has no `check` command. `pnpm run build` is the only way to render, and `check` ran the same path only so the runtime's checks could be run on their own.
- The runtime no longer judges a workspace: `XREF_UNRESOLVED`, `XREF_AMBIGUOUS`, `HTML_RESOURCE_MISSING`, `HTML_ANCHOR_MISSING`, `CATALOG_TARGET_MISSING`, `BOOK_MISSING_FROM_CATALOG`, and `MISSING_DOCTYPE` are gone. Whether a reference reaches one heading is read from the `asciidoc-abundant-tree` projection by the tool that reads it; the build fails only where it cannot produce the pages: a missing `catalog.adoc` or book, any Asciidoctor message, an include graph that cannot be parsed within `documentRoot` or an error-level parse diagnostic, or a configuration or include resolver it cannot use.

### Changed

- Generated workspaces depend on `asciidoc-abundant-tree` `^0.6.0`. Its label space is four predicates on the heading nodes of the graph, and an xref whose address several headings own gets an edge to each of them. The runtime rewrites an HTML link only when its xref reaches exactly one section, inside a book and across books; any other xref is left as Asciidoctor wrote it. The document title owns labels but is not a section, so an xref to a title only the document title owns is left as written.
- The samples no longer say a check reports broken references. After renaming a heading, an author searches the book for the old name, which finds every reference written by it (qualified addresses included), its link text, and the prose. The structured writing conventions sample states where an unbound or ambiguous link lands on the page (an unbound one is broken; one that several headings share lands on the first of them), shows the projection as `asciidoc-abundant-tree` 0.6 writes it (heading nodes named by the projector, addresses as `aat:headline` and `aat:addressPath` values), and lists a title that starts with inline markup among those a reference cannot name by their text.

### Upgrading an existing workspace

Create a temporary workspace with `pnpm create asciidoc-multi-book-workspace@0.7.0 tmp-books` and copy its `tools/adoc-books.mjs` over yours. In your `package.json`, remove the `check` script, set `"asciidoc-abundant-tree": "^0.6.0"`, and run `pnpm install`. Books need no change. To find references that reach no heading or several, read the projection: an xref edge (`aat:XrefEdge`) carries one `aat:targetHeading` for each heading its address reaches.

## 0.6.0 - 2026-10-31

### Added

- `pnpm run check` binds a qualified address: when several headings share a title, a book refers to one of them by writing the titles above it, joined with `::`, as in `xref:红烧肉::火候[]` or, across books, `xref:{dish-book}#红烧肉::火候[]`. The HTML link reaches that heading.

### Changed

- Generated workspaces depend on `asciidoc-abundant-tree` `^0.3.0`. Which xrefs exist and what their targets say are now read by Asciidoctor inside it, and the runtime no longer works around its gaps: xrefs inside passthroughs (`pass:[…]`, `+++…+++`, `$$…$$`, `` `+…+` ``) or escaped with `\` are not checked; `xref:` targets with spaces are bound and checked; `xref:#id[]` names `id`; an attribute reference in a target takes its value at the xref's position, where it used to take the value the book held after conversion; `xref:other#x[]` without `.adoc` names the document `other`, as Asciidoctor links it. The projection itself changed in 0.3.0 (fields are `field:<name>`, heading nodes are named by their address); tools that read it follow that release's changelog.
- The structured writing conventions sample teaches qualified addresses for shared titles, written with link text that joins the titles with an interpunct (《红烧肉·火候》). Two headings that share a title under one parent are renamed so each title says what its section is (糖醋排骨's two 炸 become 初炸 and 复炸); a custom ID is the second address only for a title that cannot serve, with rules for naming it. After a rename, an author also searches the book for the old name in link text and prose, which the check does not report. The projection example shows heading nodes named by their address and the field predicate `field:难度`, and the fields chapter states that a field name in an attrlist uses only letters, digits, `_`, and `-`. `00-book-anatomy` and the `04-reference-manual` glossary say the same about custom IDs.

### Upgrading an existing workspace

A generated workspace owns its `tools/adoc-books.mjs`, and this release changes it. Create a temporary workspace with `pnpm create asciidoc-multi-book-workspace@0.6.0 tmp-books`, copy its `tools/adoc-books.mjs` over yours, set `"asciidoc-abundant-tree": "^0.3.0"` in your `package.json`, and run `pnpm install`. Books need no change; a heading that declares an ID only to tell it apart from others with the same title can drop the ID once its references use the qualified address.

## 0.5.1 - 2026-10-23

### Changed

- Generated workspaces depend on `asciidoc-abundant-tree` `^0.2.6`. Releases 0.2.2–0.2.6 correct facts the reader pages are built from: edges with no source heading in included files, bibliography references, the Asciidoctor binding (`href`, reftext) of xrefs in descriptions and list items, and the span of description lists. The type of the attributes an include resolver receives now admits `null` (a blank positional attribute), as the runtime already passed it.

### Upgrading an existing workspace

Set `"asciidoc-abundant-tree": "^0.2.6"` in your `package.json` and run `pnpm install`. `tools/adoc-books.mjs` is unchanged in behavior; there is no need to copy it.

## 0.5.0 - 2026-10-21

### Added

- `adoc-books.config.mjs` accepts `documentRoot`: how far books may include files, relative to the workspace root (default `.`). A workspace that lives inside a project repository declares the project root (`".."`) so books can include the project's own code. Reader source paths and the `// file:` markers of copied source are relative to it. It must be a path string that contains the workspace root.
- `adoc-books.config.mjs` accepts `includeResolvers`: `{ prefix, resolve }` objects in the shape `asciidoc-abundant-tree` 0.2.1 accepts. One resolver serves both the HTML build and the reader data, so `include::<prefix>…[]` shows the same lines in both. The runtime checks that a resolver returns real lines of a file inside `documentRoot`; the Configure section of the default workspace README lists the rules a resolver follows.

### Changed

- Generated workspaces depend on `asciidoc-abundant-tree` `^0.2.1` (Asciidoctor.js 4 inside, asynchronous parsing). HTML is still rendered by `@asciidoctor/core` 3.
- A book whose include graph `asciidoc-abundant-tree` cannot parse now fails `build` and `check`, and the error starts with the book id. Previously the runtime printed one warning and fell back to a cover-only reader page while the build succeeded. If a book includes files outside the workspace, declare `documentRoot`.
- Xref targets and anchors are checked only on the generated HTML. The source-level codes `XREF_TARGET_MISSING` and `MISSING_ANCHOR` are gone; a missing target or anchor is reported as `HTML_RESOURCE_MISSING` or `HTML_ANCHOR_MISSING`. An xref to a non-entry `.adoc` file of another book (for example `parts/…/x.adoc`) now fails, because no HTML page is generated for it; link `book.adoc#<id>` instead.

### Fixed

- Cross-book xrefs to IDs declared as `[.role#id]`, `[[id]]`, `[id=id]`, or generated from a title no longer fail `check` with `MISSING_ANCHOR`.

### Upgrading an existing workspace

A generated workspace owns its `tools/adoc-books.mjs`. To adopt this release, create a temporary workspace with `pnpm create asciidoc-multi-book-workspace@0.5.0 tmp-books`, copy its `tools/adoc-books.mjs` over yours, set `"asciidoc-abundant-tree": "^0.2.1"` in your `package.json`, and run `pnpm install`.

## 0.4.0 - 2026-10-21

### Added

- Add `--solo` to the `create` command and export `initSoloWorkspace` from the package root: generate a workspace that contains only the structured writing conventions book, shelved as book 01.
- Add the chapter "声明本书的约定" (declaring the book's conventions) to the structured writing conventions sample: `.convention` headings with `declares=roles|relations|values|fields` write a book's controlled vocabularies in the book itself, so readers, check scripts, and query tools read one source. A `fields` declaration can carry `id-prefix` for roles whose address labels are existing technical addresses.

### Changed

- Show in the structured writing conventions sample how a field value attaches a code block or table with `+`, and list every way a description list stops counting as fields: an unattached block, another block between the heading and the list, block attributes on the list, or a nested description list. It also shows how to keep a description list under a heading as body text.
- State that a heading's role scope is a reading context: projection, checks, and query tools read only the role written on each heading.
- Add a decision tree for declaring and maintaining conventions, and update the quick reference, glossary, and part introductions.

## 0.3.1 - 2026-10-15

### Changed

- Rework the structured writing conventions sample around names and addressing: headings now serve as the canonical name and default xref target, while `[#...]` is presented only as an explicit address label for existing technical or external addresses.
- Reorganize part two of the structured writing conventions sample from identity-and-relation into names-roles-and-relations, adding guidance on renames, aliases, concept-boundary changes, splits, and retirements.
- Update the quick reference, decision trees, glossary, part introductions, and catalog descriptions to drop the stable-ID teaching path.

## 0.3.0 - 2026-07-26

### Changed

- Restructure the structured writing conventions sample around fields and terminology, including a dedicated glossary chapter and escaped xref syntax examples.

### Removed

- Retire the index-term tutorial, index section, and the associated generated sample paths from the structured writing conventions workspace.

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
