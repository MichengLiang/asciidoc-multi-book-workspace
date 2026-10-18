# My Books

An AsciiDoc multi-book workspace that starts with one book: `books/01-structured-writing-conventions`.

## Commands

```bash
pnpm install
pnpm run build   # writes build/html/index.html
pnpm run check   # checks the catalog, books, xrefs, anchors, and local HTML resources
pnpm run clean   # removes build/
```

To fetch diagram images into the local HTML output instead of linking Kroki URLs:

```bash
ADOC_BOOKS_FETCH_DIAGRAMS=1 pnpm run build
```

## Add A Book

Copy `books/01-structured-writing-conventions` to `books/<NN-book-id>`, edit its `book.adoc`, then add an
`xref:books/<NN-book-id>/book.adoc[...]` line to `catalog.adoc`.
`pnpm run check` fails until `catalog.adoc` and `books/` list the same books.
