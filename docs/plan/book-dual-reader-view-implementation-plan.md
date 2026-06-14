# Book Dual Reader View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the default generated book output as a single HTML file with continuous and semantic paged reading views, without using the old reducer in the default build path.

**Architecture:** The runtime renders book HTML with Asciidoctor, derives page maps and source bundles from `asciidoc-abundant-tree`, and injects all reader CSS/JS/data inline into each `book.html`. Copy-source behavior reads the embedded source bundle; default build output remains under `build/html/`.

**Tech Stack:** TypeScript, Node.js, Asciidoctor.js 3.0.4, `asciidoc-abundant-tree` 0.1.14, `asciidoctor-kroki` 0.18.1, Node test runner, Playwright.

---

## File Map

`src/runtime/adoc-books.mts` owns build behavior, page-map generation, source-bundle generation, HTML injection, reader CSS, and reader JavaScript.

`templates/default-workspace/package.json.template` owns generated workspace dependency declarations.

`templates/default-workspace/README.md`, `README.md`, and `DESIGN.adoc` own user-facing and maintainer-facing contracts.

`test/init-workspace.test.mjs` owns generated workspace package assertions.

`test/runtime-build.test.mjs` owns runtime build, source bundle, page map, and browser behavior assertions.

`docs/design/book-dual-reader-view.adoc` owns the final object design.

`docs/plan/book-dual-reader-view-implementation-plan.md` records the implementation batches and verification surface.

## Task 1: Replace Reducer Dependency Contract

**Files:**

* Modify: `package.json`
* Modify: `pnpm-lock.yaml`
* Modify: `templates/default-workspace/package.json.template`
* Test: `test/init-workspace.test.mjs`

- [x] **Step 1: Add dependency assertions**

`test/init-workspace.test.mjs` asserts that generated workspaces do not depend on `@asciidoctor/reducer` and do depend on:

```js
assert.equal("@asciidoctor/reducer" in packageJson.devDependencies, false);
assert.equal(packageJson.devDependencies["asciidoc-abundant-tree"], "0.1.14");
assert.equal(packageJson.devDependencies.asciidoctor, "3.0.4");
assert.equal(packageJson.devDependencies["asciidoctor-kroki"], "0.18.1");
```

- [x] **Step 2: Update generated dependency surface**

`templates/default-workspace/package.json.template` lists:

```json
"asciidoc-abundant-tree": "0.1.14",
"asciidoctor": "3.0.4",
"asciidoctor-kroki": "0.18.1"
```

- [x] **Step 3: Update maintainer dependencies**

`package.json` lists the same runtime dependency versions and removes `@asciidoctor/reducer`.

- [x] **Step 4: Refresh lockfile**

`pnpm-lock.yaml` is refreshed by package manager resolution.

## Task 2: Remove Default Reduced ADOC Output

**Files:**

* Modify: `src/runtime/adoc-books.mts`
* Test: `test/runtime-build.test.mjs`

- [x] **Step 1: Assert default build does not write `build/adoc`**

`test/runtime-build.test.mjs` includes:

```js
assert.equal(await existsFile(path.join(target, "build", "adoc", "catalog.adoc")), false);
```

- [x] **Step 2: Remove default reducer call**

`buildWorkspace` builds HTML, copies assets, injects controls, writes root index, and validates contracts without calling a reduced-ADOC build step.

- [x] **Step 3: Keep existing HTML output paths**

The runtime still creates:

```text
build/html/catalog.html
build/html/index.html
build/html/books/<book-id>/book.html
```

## Task 3: Build Reader Page Map From Abundant Tree

**Files:**

* Modify: `src/runtime/adoc-books.mts`
* Test: `test/runtime-build.test.mjs`

- [x] **Step 1: Define page map types**

The runtime defines `ReaderPageMap`, `ReaderPage`, `ReaderTocItem`, and `ReaderSourceSpan`.

- [x] **Step 2: Parse each book entry**

The runtime calls:

```ts
parseAbundantTree({
  sourcePath: book.input,
  mode: "book-entry",
  documentRoot: rootDir
})
```

- [x] **Step 3: Map source-aware sections to pages**

The mapper creates `cover`, grouped `frontmatter`, `part`, `chapter`, `appendix`, `glossary`, `bibliography`, and `index` pages.

- [x] **Step 4: Assert the strict 07 page sequence**

`test/runtime-build.test.mjs` asserts the 16-page sequence for `07-structured-writing-conventions`, including `source.relativePath` for `源文本与投影`.

## Task 4: Preserve Copy-Source With Source Bundles

**Files:**

* Modify: `src/runtime/adoc-books.mts`
* Test: `test/runtime-build.test.mjs`

- [x] **Step 1: Build source bundle from abundant-tree facts**

When `document.sourceFiles` exists, the runtime emits each file as:

```text
// file: <workspace-relative-path>
<raw source>
```

- [x] **Step 2: Keep a fallback bundle**

When abundant-tree cannot parse a book entry, the runtime collects `.adoc` and `.mjs` files under the book directory and emits the same marker format.

- [x] **Step 3: Embed source bundle in book HTML**

The runtime writes:

```html
<script type="application/json" id="multi-book-source-data">...</script>
```

- [x] **Step 4: Assert source bundle content**

The runtime test parses `multi-book-source-data` and checks for `// file:` markers, included chapter source, shared attributes, and the technical sample `.mjs` content.

## Task 5: Inject Dual Reader UI

**Files:**

* Modify: `src/runtime/adoc-books.mts`
* Test: `test/runtime-build.test.mjs`

- [x] **Step 1: Inject controls into `#toc.toc2`**

The runtime preserves the catalog home link and copy-source button, then adds the continuous/page toggle and page tree.

- [x] **Step 2: Embed page map**

The runtime writes:

```html
<script type="application/json" id="multi-book-page-map">...</script>
```

- [x] **Step 3: Add browser behavior**

The inline script initializes on `DOMContentLoaded`, supports continuous and paged views, replaces the Asciidoctor TOC with the page tree in paged view, restores the Asciidoctor TOC in continuous view, renders the current-page TOC, renders previous/next links, persists state, and handles cross-page anchors.

- [x] **Step 4: Assert injected markers**

The runtime test checks `data-multi-book-view-toggle`, `data-multi-book-page-nav`, `data-multi-book-page-toc`, and `data-multi-book-pagination`.

## Task 6: Verify Browser Behavior

**Files:**

* Modify: `test/runtime-build.test.mjs`

- [x] **Step 1: Add Playwright desktop checks**

The test opens the generated 07 book, verifies continuous view shows multiple chapters, switches to paged view, verifies the original TOC is hidden and the page tree is visible, navigates through cover/frontmatter/part/chapter pages, checks current page nav, checks current-page TOC, verifies the right TOC does not overlap source blocks, verifies the generated footer is hidden in paged view, and returns to continuous view.

- [x] **Step 2: Add Playwright mobile checks**

The test opens a paged chapter at `390x844`, verifies content visibility, checks pagination bounds, and asserts the body does not horizontally overflow the viewport.

## Task 7: Update Documentation

**Files:**

* Modify: `README.md`
* Modify: `templates/default-workspace/README.md`
* Modify: `DESIGN.adoc`
* Create: `docs/design/book-dual-reader-view.adoc`
* Create: `docs/plan/book-dual-reader-view-implementation-plan.md`

- [x] **Step 1: Update maintainer README**

`README.md` describes generated dependencies as `asciidoctor`, `asciidoc-abundant-tree`, and `asciidoctor-kroki`.

- [x] **Step 2: Update generated workspace README**

`templates/default-workspace/README.md` states that each book HTML includes continuous and paged reading views and that copy-source uses an abundant-tree source bundle.

- [x] **Step 3: Update maintainer design**

`DESIGN.adoc` states that default build/check commands do not write expanded ADOC outputs under `build/adoc/` and that copy-source embeds an abundant-tree source bundle.

- [x] **Step 4: Add final design and plan documents**

`docs/design/book-dual-reader-view.adoc` defines the object contract.
`docs/plan/book-dual-reader-view-implementation-plan.md` records the implemented batches and verification surface.

## Verification Commands

Run from the project root:

```bash
pnpm run check
```

Search for removed default-reducer implementation surfaces:

```bash
rg 'build/adoc/catalog|build/adoc/books|buildReducedAdoc|reduceAdocSource' \
  --glob '!node_modules/**' \
  --glob '!dist/**' \
  --glob '!tmp/**'
```

Expected output:

```text
(no matches)
```

Search for the old reducer package name:

```bash
rg '@asciidoctor/reducer' \
  package.json \
  templates/default-workspace/package.json.template \
  src \
  test
```

Expected remaining implementation/test match:

```text
test/init-workspace.test.mjs:80:  assert.equal("@asciidoctor/reducer" in packageJson.devDependencies, false);
```

Review changed paths:

```bash
git status --short
git diff --stat
```
