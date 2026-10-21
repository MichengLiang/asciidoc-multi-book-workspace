# My Books

This is an AsciiDoc multi-book workspace. It starts with sample books that show common ways to organize independent books, multipart books, technical books, reference material, split volumes, and structured writing conventions.

## Install

```bash
pnpm install
```

## Build

```bash
pnpm run build
```

Outputs:

- `build/html/index.html`
- `build/html/catalog.html`
- `build/html/books/<book-id>/book.html`

Each book HTML includes continuous and paged reading views. The copy-source control copies an abundant-tree source bundle for the current book; default builds do not write expanded ADOC files under `build/adoc/`.

Diagram blocks render as Kroki image URLs by default, so normal builds do not depend on the Kroki service being available at build time.
To fetch diagram images into the local HTML output, run:

```bash
ADOC_BOOKS_FETCH_DIAGRAMS=1 pnpm run build
```

## Check

```bash
pnpm run check
```

This checks the current catalog, existing books, book doctypes, cross-book xrefs, anchors, and local HTML resources, and that every book's includes stay within `documentRoot` (see Configure).

## Configure

An optional `adoc-books.config.mjs` at the workspace root adjusts the build. Every key is optional:

```js
export default {
  // Where build/html/index.html redirects, and its page title.
  rootIndex: { redirectTo: "catalog.html", title: "My Books" },
  // The catalog link at the top of every book.
  homeLink: { label: "Back to catalog", subtitle: "My Books" },
  // How far books may include files, relative to this directory. Default: ".".
  documentRoot: "..",
};
```

`documentRoot` matters when this workspace lives inside a project repository. Set it to the project root (`".."` when the workspace is a direct subdirectory) and books can include the project's own code instead of a copy of it. Source paths in the reader and the `// file:` markers of copied source then start at that root. An include that leaves `documentRoot` fails `pnpm run check` and names the book.

`includeResolvers` lets books include lines chosen by your own code, for example one function out of a source file:

```js
export default {
  includeResolvers: [{
    prefix: "symbol:",
    // include::symbol:src/math.ts[add] arrives as { target: "src/math.ts", attributes: { 1: "add" }, sourcePath }
    resolve({ target, attributes, sourcePath }) {
      // ...find the lines of the function...
      return { text, origin: { path: target, startLine } };
    },
  }],
};
```

The same resolver serves the HTML build and the reader, so both show the same lines. It returns whole consecutive lines of one file, that file's path (relative to `documentRoot`), and the line the text starts at; build messages about those lines point into that file. `resolve` must return its result directly, not a Promise.

## Clean

```bash
pnpm run clean
```

This removes `build/`.

## Delete Sample Books

Delete `books/<book-id>/`, then remove the matching `xref:books/<book-id>/book.adoc[...]` entry from `catalog.adoc`. Each default sample is independent, so no other sample book needs to be edited.

Run:

```bash
pnpm run check
```

## Add A Book

Copy `books/01-starter-book` to `books/<your-book-id>`, edit `book.adoc` and chapter files, then add the new book to `catalog.adoc`.

To look at the original samples again, initialize a temporary workspace:

```bash
pnpm create asciidoc-multi-book-workspace sample-look
```
