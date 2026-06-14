import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { test } from "node:test";

import { initWorkspace } from "../dist/init-workspace.js";
import { buildWorkspace, checkWorkspace, cleanWorkspace } from "../dist/runtime/adoc-books.mjs";

const repoRoot = path.resolve(import.meta.dirname, "..");
const structuredWritingPageSequence = [
  ["cover", "cover", "结构化书写约定标本"],
  ["frontmatter", "frontmatter", "前置"],
  ["part", "part-从源文档看结构", "从源文档看结构"],
  ["chapter", "source-and-projection", "源文本与投影"],
  ["chapter", "heading-and-xref", "标题与引用"],
  ["chapter", "source-order-notation", "源文件编排号"],
  ["part", "part-给标题和引用加意图", "给标题和引用加意图"],
  ["chapter", "role-identity", "role 身份"],
  ["chapter", "relation-predicate", "rel 关系谓词"],
  ["part", "part-字段索引与术语", "字段、索引与术语"],
  ["chapter", "surface-fields", "附加字段"],
  ["chapter", "index-and-glossary", "索引词与术语表"],
  ["appendix", "附录-a结构化写法速查", "附录 A：结构化写法速查"],
  ["glossary", "术语表", "术语表"],
  ["bibliography", "参考坐标", "参考坐标"],
  ["index", "索引", "索引"]
];
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

async function assertVisibleText(page, selector, text) {
  await page.locator(selector).filter({ hasText: text }).first().waitFor({ state: "visible" });
}

async function assertHiddenText(page, selector, text) {
  const visible = await page.locator(`${selector} >> text=${text}`).first().isVisible().catch(() => false);
  assert.equal(visible, false, `${text} should be hidden inside ${selector}`);
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

test("runtime build creates HTML, assets, home links, source bundles, and root index without default ADOC output", async () => {
  const target = path.join(repoRoot, "tmp", "test-fixtures", `runtime-build-${randomUUID()}`);
  await initWorkspace({ targetDir: target });

  await buildWorkspace(target);

  assert.equal(await existsFile(path.join(target, "build", "adoc", "catalog.adoc")), false);
  assert.equal(await existsFile(path.join(target, "build", "html", "catalog.html")), true);
  assert.equal(await existsFile(path.join(target, "build", "html", "index.html")), true);
  assert.equal(await existsFile(path.join(target, "build", "html", "shared", "images", "workspace-map.svg")), true);

  for (const bookId of expectedBooks) {
    assert.equal(await existsFile(path.join(target, "build", "html", "books", bookId, "book.html")), true);
  }

  const starter = await readFile(path.join(target, "build", "html", "books", "01-starter-book", "book.html"), "utf8");
  assert.match(starter, /data-multi-book-home/);
  assert.equal(await existsFile(path.join(target, "build", "html", "books", "01-starter-book", "assets", "images", "starter-map.svg")), true);
  assert.match(starter, /data-multi-book-controls/);
  assert.match(starter, /data-multi-book-source-copy/);
  assert.match(starter, /复制本书为纯文本/);
  assert.match(starter, /已尝试打开纯文本页；如果没有出现，请允许弹出窗口后再试/);
  assert.match(starter, /navigator\.clipboard\.writeText/);
  assert.match(starter, /text\/plain;charset=utf-8/);

  const starterSourceMatch = starter.match(/<script type="application\/json" id="multi-book-source-data">([\s\S]*?)<\/script>/);
  assert.notEqual(starterSourceMatch, null);
  const starterEmbeddedSource = JSON.parse(starterSourceMatch[1]);
  assert.match(starterEmbeddedSource, /\/\/ file: books\/01-starter-book\/book\.adoc/);
  assert.match(starterEmbeddedSource, /include::chapters\/01-opening\.adoc\[\]/);
  assert.match(starterEmbeddedSource, /\/\/ file: shared\/attributes\.adoc/);
  assert.match(starterEmbeddedSource, /\/\/ file: books\/01-starter-book\/chapters\/02-main-flow\.adoc/);

  const technicalDir = path.join(target, "build", "html", "books", "03-technical-book-workflow");
  const technical = await readFile(path.join(technicalDir, "book.html"), "utf8");
  assert.match(technical, /https:\/\/kroki\.io\/mermaid\/svg\//);
  const technicalFiles = await readdir(technicalDir);
  assert.equal(technicalFiles.some((file) => /^technical-resource-flow-.*\.svg$/.test(file)), false);
  const technicalSourceMatch = technical.match(/<script type="application\/json" id="multi-book-source-data">([\s\S]*?)<\/script>/);
  assert.notEqual(technicalSourceMatch, null);
  const technicalEmbeddedSource = JSON.parse(technicalSourceMatch[1]);
  assert.match(technicalEmbeddedSource, /export function describeBook\(id\)/);

  const structuredWriting = await readFile(
    path.join(target, "build", "html", "books", "07-structured-writing-conventions", "book.html"),
    "utf8"
  );
  assert.match(structuredWriting, /<h1 id="从源文档看结构" class="sect0">Part I: 从源文档看结构<\/h1>/);
  assert.match(structuredWriting, /<h1 id="给标题和引用加意图" class="sect0">Part II: 给标题和引用加意图<\/h1>/);
  assert.match(structuredWriting, /<h1 id="字段索引与术语" class="sect0">Part III: 字段、索引与术语<\/h1>/);
  assert.match(structuredWriting, /<a href="#从源文档看结构">Part I: 从源文档看结构<\/a>/);

  const pageMapMatch = structuredWriting.match(/<script type="application\/json" id="multi-book-page-map">([\s\S]*?)<\/script>/);
  assert.notEqual(pageMapMatch, null);
  const pageMap = JSON.parse(pageMapMatch[1]);
  assert.equal(pageMap.version, 1);
  assert.deepEqual(pageMap.book, {
    id: "07-structured-writing-conventions",
    title: "结构化书写约定标本",
    entry: "books/07-structured-writing-conventions/book.adoc"
  });
  assert.deepEqual(
    pageMap.pages.map((page) => [page.kind, page.id, page.title]),
    structuredWritingPageSequence
  );
  assert.deepEqual(
    pageMap.pages[1].toc.map((entry) => entry.title),
    ["摘要", "版本说明", "献辞", "前言", "致谢"]
  );
  assert.equal(
    pageMap.pages.find((page) => page.title === "源文本与投影")?.source?.relativePath,
    "books/07-structured-writing-conventions/parts/100-source-surface/010-source-and-projection.adoc"
  );
  assert.deepEqual(
    pageMap.pages.slice(-4).map((page) => page.kind),
    ["appendix", "glossary", "bibliography", "index"]
  );
  assert.match(structuredWriting, /data-multi-book-view-toggle/);
  assert.match(structuredWriting, />连续<\/button>/);
  assert.match(structuredWriting, />页面<\/button>/);
  assert.match(structuredWriting, /data-multi-book-page-nav/);
  assert.match(structuredWriting, /data-multi-book-page-toc/);
  assert.match(structuredWriting, /data-multi-book-pagination/);
});

test("runtime reader UI supports desktop and mobile paged reading behavior", async () => {
  const target = path.join(repoRoot, "tmp", "test-fixtures", `runtime-reader-ui-${randomUUID()}`);
  await initWorkspace({ targetDir: target });
  await buildWorkspace(target);

  const bookUrl = pathToFileURL(path.join(target, "build", "html", "books", "07-structured-writing-conventions", "book.html")).href;
  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  try {
    const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await desktop.goto(bookUrl);
    await assertVisibleText(desktop, "#content", "源文本与投影");
    await assertVisibleText(desktop, "#content", "索引词与术语表");
    const continuousContentBox = await desktop.locator("#content").boundingBox();
    const continuousFirstBlockBox = await desktop.locator("#content > :visible").first().boundingBox();
    assert.notEqual(continuousContentBox, null);
    assert.notEqual(continuousFirstBlockBox, null);

    await desktop.getByRole("button", { name: "页面" }).click();
    await assertVisibleText(desktop, "#content", "结构化书写约定标本");
    await assertHiddenText(desktop, "#content", "源文本与投影");
    assert.equal(
      await desktop.locator("#toc > :not([data-multi-book-controls]):not([data-multi-book-page-nav])").evaluateAll((nodes) => {
        return nodes.filter((node) => !node.hidden).length;
      }),
      0
    );
    assert.equal(await desktop.locator("[data-multi-book-page-nav] a").count(), structuredWritingPageSequence.length);

    await desktop.getByRole("link", { name: /下一页\s+前置/ }).click();
    await assertVisibleText(desktop, "#content", "摘要");
    await desktop.getByRole("link", { name: /下一页\s+从源文档看结构/ }).click();
    await assertVisibleText(desktop, "#content", "从源文档看结构");
    assert.equal(await desktop.locator("[data-multi-book-page-nav] [aria-current='page']").textContent(), "从源文档看结构");

    await desktop.locator("[data-multi-book-page-nav]").getByRole("link", { name: "源文本与投影", exact: true }).click();
    await assertVisibleText(desktop, "#content", "源文本与投影");
    await assertHiddenText(desktop, "#content", "标题与引用");
    await assertVisibleText(desktop, "[data-multi-book-page-toc]", "概述");
    const desktopContentBox = await desktop.locator("#content").boundingBox();
    const codeBox = await desktop.locator("#content .listingblock").first().boundingBox();
    const pageTocBox = await desktop.locator("[data-multi-book-page-toc]").boundingBox();
    assert.notEqual(desktopContentBox, null);
    assert.notEqual(codeBox, null);
    assert.notEqual(pageTocBox, null);
    assert.equal(Math.abs(desktopContentBox.x - continuousContentBox.x) <= 1, true);
    assert.equal(Math.abs(codeBox.x - continuousFirstBlockBox.x) <= 1, true);
    assert.equal(desktopContentBox.x + desktopContentBox.width <= pageTocBox.x, true);
    assert.equal(codeBox.x + codeBox.width <= pageTocBox.x, true);
    assert.equal(await desktop.locator("#footer").isVisible(), false);

    await desktop.locator("[data-multi-book-page-nav]").getByRole("link", { name: "标题与引用", exact: true }).click();
    await assertVisibleText(desktop, "#content", "标题与引用");
    assert.match(desktop.url(), /[?&]page=heading-and-xref/);

    await desktop.getByRole("button", { name: "连续" }).click();
    await assertVisibleText(desktop, "#content", "源文本与投影");
    await assertVisibleText(desktop, "#content", "索引词与术语表");
    assert.equal(await desktop.locator("[data-multi-book-page-nav]").evaluate((node) => node.hidden), true);
    assert.equal(
      await desktop.locator("#toc > :not([data-multi-book-controls]):not([data-multi-book-page-nav])").evaluateAll((nodes) => {
        return nodes.some((node) => !node.hidden);
      }),
      true
    );

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mobile.goto(`${bookUrl}?view=paged&page=source-and-projection`);
    await assertVisibleText(mobile, "#content", "源文本与投影");
    assert.equal(
      await mobile.locator("#toc > :not([data-multi-book-controls]):not([data-multi-book-page-nav])").evaluateAll((nodes) => {
        return nodes.filter((node) => !node.hidden).length;
      }),
      0
    );
    const contentBox = await mobile.locator("#content").boundingBox();
    assert.notEqual(contentBox, null);
    assert.equal(contentBox.x >= 0, true);
    assert.equal(contentBox.width <= 390, true);
    const paginationBox = await mobile.locator("[data-multi-book-pagination]").boundingBox();
    assert.notEqual(paginationBox, null);
    assert.equal(paginationBox.x >= 0, true);
    assert.equal(paginationBox.x + paginationBox.width <= 390, true);
    assert.equal(await mobile.locator("body").evaluate((body) => body.scrollWidth <= window.innerWidth + 1), true);
  } finally {
    await browser.close();
  }
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
