# create-asciidoc-multi-book-workspace

`create-asciidoc-multi-book-workspace` is an npm initializer for a complete AsciiDoc multi-book workspace.

It creates a user-owned workspace with seven sample books, a catalog, shared assets, explicit AsciiDoc dependencies, and one local build script at `tools/adoc-books.mjs`.

## Usage

```bash
pnpm create asciidoc-multi-book-workspace my-books
cd my-books
pnpm install
pnpm run build
```

npm users can run:

```bash
npm create asciidoc-multi-book-workspace@latest my-books
```

```bash
npx create-asciidoc-multi-book-workspace@latest my-books
```

The generated workspace contains:

```text
README.md
catalog.adoc
package.json
.gitignore
tools/adoc-books.mjs
books/00-book-anatomy
books/01-starter-book
books/02-multipart-monograph
books/03-technical-book-workflow
books/04-reference-manual
books/05-upper-volume
books/06-lower-volume
shared/attributes.adoc
shared/images/workspace-map.svg
```

It does not include this repository's `test/`, `.github/`, `src/`, `dist/`, `DESIGN.adoc`, or maintainer release checks.

## Generated Workspace

The generated `package.json` directly lists the AsciiDoc toolchain:

- `asciidoctor`
- `@asciidoctor/reducer`
- `asciidoctor-kroki`

The generated scripts are:

```bash
pnpm run build
pnpm run check
pnpm run clean
```

`tools/adoc-books.mjs` belongs to the generated workspace. Users can open it, modify it, or delete it.

## Maintainer Layout

```text
src/                         # TypeScript initializer and user runtime source
templates/default-workspace/ # true source for the generated user workspace
test/                        # maintainer tests
DESIGN.adoc                  # maintainer design specification
.github/                     # maintainer CI
```

The seven sample books live only under `templates/default-workspace/books/`.

## Maintainer Commands

```bash
pnpm install
pnpm run build
pnpm run preview:build
pnpm run preview:fresh
pnpm run test
pnpm run check
pnpm pack --dry-run
```

`pnpm run check` builds TypeScript, runs maintainer tests, and checks the npm package boundary.

`pnpm run preview:build` updates a generated sample workspace under `build/template-preview/workspace`,
builds the sample books with the maintainer repository's installed AsciiDoc toolchain, and writes HTML to
`build/template-preview/workspace/build/html/index.html`.

`pnpm run preview:fresh` recompiles the maintainer runtime and recreates the preview workspace from scratch.
It installs the generated workspace's own dependencies, so use it after changing `src/`, dependency declarations,
or the initializer contract. Use `pnpm run preview:build` for normal template edits under `templates/default-workspace/`.

## Releases

Release Please manages release pull requests and `CHANGELOG.md`.

Publishing to npm happens from published GitHub releases. The publish workflow runs `pnpm run check` before `pnpm publish` and uses the repository `NPM_TOKEN` secret.

## License

Apache-2.0. See [LICENSE](./LICENSE).
