import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { initWorkspace } from "../dist/init-workspace.js";
import { buildWorkspace, checkWorkspace, cleanWorkspace } from "../dist/runtime/adoc-books.mjs";

const repoRoot = path.resolve(import.meta.dirname, "..");
const expectedBooks = [
  "00-book-anatomy",
  "01-starter-book",
  "02-multipart-monograph",
  "03-technical-book-workflow",
  "04-reference-manual",
  "05-upper-volume",
  "06-lower-volume",
  "07-structured-writing-conventions"
];

async function existsFile(filePath) {
  try {
    const stats = await stat(filePath);
    return stats.isFile();
  } catch {
    return false;
  }
}

function removeSampleFromCatalog(catalog, bookId) {
  const lines = catalog.split(/\r?\n/);
  const updated = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const nextLine = lines[index + 1] ?? "";
    const nextNextLine = lines[index + 2] ?? "";
    const row = [line, nextLine, nextNextLine].join("\n");
    if (line.startsWith("|") && row.includes(`books/${bookId}/book.adoc`)) {
      index += 2;
      continue;
    }
    if (line.includes(`books/${bookId}/book.adoc`)) continue;
    updated.push(line);
  }
  return updated.join("\n");
}

test("runtime build creates ADOC, HTML, assets, home links, and root index", async () => {
  const target = path.join(repoRoot, "tmp", "test-fixtures", `runtime-build-${randomUUID()}`);
  await initWorkspace({ targetDir: target });

  await buildWorkspace(target);

  assert.equal(await existsFile(path.join(target, "build", "adoc", "catalog.adoc")), true);
  assert.equal(await existsFile(path.join(target, "build", "html", "catalog.html")), true);
  assert.equal(await existsFile(path.join(target, "build", "html", "index.html")), true);
  assert.equal(await existsFile(path.join(target, "build", "html", "shared", "images", "workspace-map.svg")), true);

  for (const bookId of expectedBooks) {
    assert.equal(await existsFile(path.join(target, "build", "adoc", "books", `${bookId}.adoc`)), true);
    assert.equal(await existsFile(path.join(target, "build", "html", "books", bookId, "book.html")), true);
  }

  const starter = await readFile(path.join(target, "build", "html", "books", "01-starter-book", "book.html"), "utf8");
  assert.match(starter, /data-multi-book-home/);
  assert.equal(await existsFile(path.join(target, "build", "html", "books", "01-starter-book", "assets", "images", "starter-map.svg")), true);

  const technicalDir = path.join(target, "build", "html", "books", "03-technical-book-workflow");
  const technical = await readFile(path.join(technicalDir, "book.html"), "utf8");
  assert.match(technical, /https:\/\/kroki\.io\/mermaid\/svg\//);
  const technicalFiles = await readdir(technicalDir);
  assert.equal(technicalFiles.some((file) => /^technical-resource-flow-.*\.svg$/.test(file)), false);

  const structuredWriting = await readFile(
    path.join(target, "build", "html", "books", "07-structured-writing-conventions", "book.html"),
    "utf8"
  );
  assert.match(structuredWriting, /<h1 id="从源文档看结构" class="sect0">Part I: 从源文档看结构<\/h1>/);
  assert.match(structuredWriting, /<h1 id="给标题和引用加意图" class="sect0">Part II: 给标题和引用加意图<\/h1>/);
  assert.match(structuredWriting, /<h1 id="字段索引与术语" class="sect0">Part III: 字段、索引与术语<\/h1>/);
  assert.match(structuredWriting, /<a href="#从源文档看结构">Part I: 从源文档看结构<\/a>/);
});

test("runtime build applies optional user workspace navigation config", async () => {
  const target = path.join(repoRoot, "tmp", "test-fixtures", `runtime-nav-config-${randomUUID()}`);
  await initWorkspace({ targetDir: target });
  await writeFile(
    path.join(target, "adoc-books.config.mjs"),
    `export default {
  rootIndex: {
    redirectTo: "books/01-starter-book/book.html",
    title: "Configured Books"
  },
  homeLink: {
    label: "返回目录",
    subtitle: "自定义书架"
  }
};
`,
    "utf8"
  );

  await buildWorkspace(target);

  const index = await readFile(path.join(target, "build", "html", "index.html"), "utf8");
  assert.match(index, /url=books\/01-starter-book\/book\.html/);
  assert.match(index, /<title>Configured Books<\/title>/);

  const starter = await readFile(path.join(target, "build", "html", "books", "01-starter-book", "book.html"), "utf8");
  assert.match(starter, /返回目录/);
  assert.match(starter, /自定义书架/);
});

test("runtime check passes after deleting any one sample and removing its catalog entries", async () => {
  for (const bookId of expectedBooks) {
    const target = path.join(repoRoot, "tmp", "test-fixtures", `runtime-delete-${bookId}-${randomUUID()}`);
    await initWorkspace({ targetDir: target });
    await rm(path.join(target, "books", bookId), { recursive: true });
    const catalogPath = path.join(target, "catalog.adoc");
    const catalog = await readFile(catalogPath, "utf8");
    await writeFile(catalogPath, removeSampleFromCatalog(catalog, bookId), "utf8");

    await checkWorkspace(target);

    assert.equal(await existsFile(path.join(target, "build", "html", "books", bookId, "book.html")), false);
  }
});

test("runtime check still fails for a user-authored real cross-book xref to a missing book", async () => {
  const target = path.join(repoRoot, "tmp", "test-fixtures", `runtime-real-missing-xref-${randomUUID()}`);
  await initWorkspace({ targetDir: target });
  const chapterPath = path.join(target, "books", "01-starter-book", "chapters", "02-main-flow.adoc");
  const chapter = await readFile(chapterPath, "utf8");
  await writeFile(
    chapterPath,
    `${chapter}\n\nSee xref:../missing-book/book.adoc[missing book].\n`,
    "utf8"
  );

  await assert.rejects(
    () => checkWorkspace(target),
    /HTML local resource check failed|workspace contract check failed/
  );
});

test("runtime check accepts typed explicit anchors in user-authored xrefs", async () => {
  const target = path.join(repoRoot, "tmp", "test-fixtures", `runtime-typed-anchor-${randomUUID()}`);
  await initWorkspace({ targetDir: target });
  const targetChapterPath = path.join(
    target,
    "books",
    "02-multipart-monograph",
    "parts",
    "01-domain",
    "01-problem-world.adoc"
  );
  const targetChapter = await readFile(targetChapterPath, "utf8");
  await writeFile(
    targetChapterPath,
    `[#typed-anchor.contract-object, owner=sample]\n${targetChapter}`,
    "utf8"
  );
  const sourceChapterPath = path.join(target, "books", "01-starter-book", "chapters", "02-main-flow.adoc");
  const sourceChapter = await readFile(sourceChapterPath, "utf8");
  await writeFile(
    sourceChapterPath,
    `${sourceChapter}\n\nSee xref:../02-multipart-monograph/book.adoc#typed-anchor[typed anchor].\n`,
    "utf8"
  );

  await checkWorkspace(target);
});

test("runtime removes stale HTML only for books that no longer exist", async () => {
  const target = path.join(repoRoot, "tmp", "test-fixtures", `runtime-stale-${randomUUID()}`);
  await initWorkspace({ targetDir: target });
  await mkdir(path.join(target, "build", "html", "books", "01-starter-book"), { recursive: true });
  await mkdir(path.join(target, "build", "html", "books", "stale-book"), { recursive: true });
  await writeFile(path.join(target, "build", "html", "books", "01-starter-book", "kept.svg"), "<svg />", "utf8");
  await writeFile(path.join(target, "build", "html", "books", "stale-book", "book.html"), "<html></html>", "utf8");

  await buildWorkspace(target);

  assert.equal(await existsFile(path.join(target, "build", "html", "books", "01-starter-book", "kept.svg")), true);
  assert.equal(await existsFile(path.join(target, "build", "html", "books", "stale-book", "book.html")), false);
});

test("runtime clean removes build output", async () => {
  const target = path.join(repoRoot, "tmp", "test-fixtures", `runtime-clean-${randomUUID()}`);
  await initWorkspace({ targetDir: target });
  await buildWorkspace(target);

  await cleanWorkspace(target);

  assert.equal(await existsFile(path.join(target, "build", "html", "index.html")), false);
});
