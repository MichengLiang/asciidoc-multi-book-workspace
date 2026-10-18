import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { initSoloWorkspace } from "../dist/init-workspace.js";
import { checkWorkspace } from "../dist/runtime/adoc-books.mjs";

const repoRoot = path.resolve(import.meta.dirname, "..");
const sampleBookDir = path.join(repoRoot, "templates", "default-workspace", "books", "07-structured-writing-conventions");
const soloBookId = "01-structured-writing-conventions";

function fixtureDir(name) {
  return path.join(repoRoot, "tmp", "test-fixtures", `${name}-${randomUUID()}`);
}

async function listFiles(dir) {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.relative(dir, path.join(entry.parentPath, entry.name)).split(path.sep).join("/"))
    .sort();
}

test("initSoloWorkspace creates a one-book workspace with sample book 07 shelved as 01", async () => {
  const target = fixtureDir("init-solo");

  const result = await initSoloWorkspace({ targetDir: target });

  assert.deepEqual(result, { targetDir: target, packageName: path.basename(target) });
  assert.deepEqual(await readdir(path.join(target, "books")), [soloBookId]);
  const workspaceFiles = (await listFiles(target)).filter((file) => !file.startsWith("books/"));
  assert.deepEqual(workspaceFiles, [
    ".gitignore",
    "README.md",
    "catalog.adoc",
    "package.json",
    "shared/attributes.adoc",
    "tools/adoc-books.mjs"
  ].sort());
});

test("solo workspace book is a byte-for-byte copy of sample book 07", async () => {
  const target = fixtureDir("init-solo-book");
  await initSoloWorkspace({ targetDir: target });
  const soloBookDir = path.join(target, "books", soloBookId);

  const sampleFiles = await listFiles(sampleBookDir);
  assert.deepEqual(await listFiles(soloBookDir), sampleFiles);
  for (const file of sampleFiles) {
    assert.deepEqual(
      await readFile(path.join(soloBookDir, file)),
      await readFile(path.join(sampleBookDir, file)),
      file
    );
  }
});

test("solo workspace passes the runtime check with its own catalog", async () => {
  const target = fixtureDir("init-solo-check");
  await initSoloWorkspace({ targetDir: target });

  await checkWorkspace(target);

  const catalogHtml = await readFile(path.join(target, "build", "html", "catalog.html"), "utf8");
  assert.match(catalogHtml, /01 结构化书写约定标本/);
  assert.deepEqual(await readdir(path.join(target, "build", "html", "books")), [soloBookId]);
});

test("package root exports the solo workspace initializer", async () => {
  const api = await import("create-asciidoc-multi-book-workspace");
  const target = fixtureDir("init-solo-public-api");

  await api.initSoloWorkspace({ targetDir: target });

  assert.deepEqual(await readdir(path.join(target, "books")), [soloBookId]);
});
