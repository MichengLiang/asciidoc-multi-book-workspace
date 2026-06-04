import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

const repoRoot = path.resolve(import.meta.dirname, "..");
const templateRoot = path.join(repoRoot, "templates", "default-workspace");
const expectedBooks = [
  "00-book-anatomy",
  "01-starter-book",
  "02-multipart-monograph",
  "03-technical-book-workflow",
  "04-reference-manual",
  "05-upper-volume",
  "06-lower-volume"
];

const requiredResources = new Map([
  ["01-starter-book", ["books/01-starter-book/assets/images/starter-map.svg"]],
  [
    "03-technical-book-workflow",
    [
      "shared/images/workspace-map.svg",
      "books/03-technical-book-workflow/assets/images/technical-flow.svg",
      "books/03-technical-book-workflow/examples/minimal-tool.mjs"
    ]
  ]
]);

const requiredPatterns = new Map([
  [
    "00-book-anatomy",
    [
      "[abstract]",
      "[colophon]",
      "[dedication]",
      "[preface]",
      "[acknowledgments]",
      "[partintro]",
      "[appendix]",
      "[glossary]",
      "[bibliography]",
      "[index]"
    ]
  ],
  ["01-starter-book", ["[preface]", "[appendix]", "[bibliography]"]],
  ["04-reference-manual", ["[discrete]", "[glossary]"]]
]);

async function existsFile(filePath) {
  try {
    const stats = await stat(filePath);
    return stats.isFile();
  } catch {
    return false;
  }
}

async function collectAdocFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await collectAdocFiles(entryPath));
    if (entry.isFile() && entry.name.endsWith(".adoc")) files.push(entryPath);
  }
  return files.sort();
}

async function combinedBookSource(bookDir) {
  const files = await collectAdocFiles(bookDir);
  const sources = [];
  for (const file of files) sources.push(await readFile(file, "utf8"));
  return sources.join("\n");
}

function partCount(bookSource) {
  const lines = bookSource.split(/\r?\n/);
  let seenTitle = false;
  let count = 0;
  for (const line of lines) {
    if (!/^= /.test(line)) continue;
    if (!seenTitle) {
      seenTitle = true;
      continue;
    }
    count += 1;
  }
  return count;
}

test("default workspace template keeps the seven official sample books", async () => {
  const books = await readdir(path.join(templateRoot, "books"));
  assert.deepEqual(books.sort(), expectedBooks);
});

test("default workspace template satisfies the official sample contract", async () => {
  for (const bookId of expectedBooks) {
    const bookDir = path.join(templateRoot, "books", bookId);
    const bookSource = await readFile(path.join(bookDir, "book.adoc"), "utf8");
    const allSource = await combinedBookSource(bookDir);

    for (const required of requiredPatterns.get(bookId) ?? []) {
      assert.equal(allSource.includes(required), true, `${bookId} missing ${required}`);
    }

    for (const resource of requiredResources.get(bookId) ?? []) {
      assert.equal(await existsFile(path.join(templateRoot, resource)), true, `${bookId} missing ${resource}`);
    }

    if (bookId === "01-starter-book") assert.equal(partCount(bookSource), 0);
    if (bookId === "02-multipart-monograph") {
      assert.equal(partCount(bookSource) >= 2, true);
      assert.equal((allSource.match(/\[partintro\]/g) ?? []).length >= 2, true);
    }
    if (bookId === "03-technical-book-workflow") {
      assert.match(allSource, /\[(mermaid|plantuml),/m);
      assert.match(allSource, /include::\.\.\/examples\/minimal-tool\.mjs\[tag=main\]/);
    }
    if (bookId === "04-reference-manual") {
      assert.match(allSource, /\[cols=.*options="header"\]/);
      assert.match(allSource, /^[^:\n]+::\s+/m);
      assert.match(allSource, /xref \+ : \+ \.\.\/other-book\/book\.adoc#stable-anchor\[目标章节\]/);
      assert.doesNotMatch(allSource, /xref:\.\.\/0[0-9]-[^/\]]+\/book\.adoc/);
    }
    if (bookId === "05-upper-volume") assert.match(allSource, /^\[#upper-core-model\]$/m);
    if (bookId === "06-lower-volume") {
      assert.match(bookSource, /^:upper-book:\s+\.\.\/05-upper-volume\/book\.adoc$/m);
      assert.match(allSource, /xref \+ : \+ \{upper-book\}#upper-core-model\[上册核心模型\]/);
      assert.doesNotMatch(allSource, /xref:\{upper-book\}#upper-core-model\[/);
    }
  }
});
