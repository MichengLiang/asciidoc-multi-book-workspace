import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { test } from "node:test";

import { initWorkspace } from "../dist/init-workspace.js";
import { buildWorkspace, cleanWorkspace } from "../dist/runtime/adoc-books.mjs";

const repoRoot = path.resolve(import.meta.dirname, "..");
const structuredWritingPageSequence = [
  ["cover", "cover", "结构化书写约定标本"],
  ["frontmatter", "frontmatter", "前置"],
  ["part", "part-从源文档看结构", "从源文档看结构"],
  ["chapter", "源文本与投影", "源文本与投影"],
  ["chapter", "标题寻址与引用", "标题、寻址与引用"],
  ["chapter", "源文件编排号", "源文件编排号"],
  ["part", "part-名称role-与关系", "名称、role 与关系"],
  ["chapter", "名称与地址", "名称与地址"],
  ["chapter", "标题的-role", "标题的 role"],
  ["chapter", "关系谓词", "关系谓词"],
  ["part", "part-字段与约定", "字段与约定"],
  ["chapter", "字段", "字段"],
  ["chapter", "声明本书的约定", "声明本书的约定"],
  ["part", "part-书的文字", "书的文字"],
  ["chapter", "一本书对谁说话", "一本书对谁说话"],
  ["chapter", "一句话做什么事", "一句话做什么事"],
  ["chapter", "名与例", "名与例"],
  ["chapter", "书面语的规范", "书面语的规范"],
  ["appendix", "结构化写法速查", "结构化写法速查"],
  ["appendix", "结构化写法决策树", "结构化写法决策树"],
  ["glossary", "术语表", "术语表"],
  ["bibliography", "参考文献", "参考文献"]
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

async function captureConsoleWarn(run) {
  const warnings = [];
  const originalWarn = console.warn;
  console.warn = (...args) => {
    warnings.push(args.map(String).join(" "));
  };
  try {
    await run();
  } finally {
    console.warn = originalWarn;
  }
  return warnings;
}

async function launchBrowser() {
  const { chromium } = await import("playwright");
  const browserChannel = process.env.PLAYWRIGHT_BROWSER_CHANNEL;
  // GitHub-hosted Ubuntu runners already ship Chrome; prefer it there so CI does not
  // spend time downloading Playwright-managed browser archives.
  return await chromium.launch(browserChannel ? { channel: browserChannel } : {});
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

function embeddedJson(html, id) {
  const match = html.match(new RegExp(`<script type="application/json" id="${id}">([\\s\\S]*?)</script>`));
  assert.notEqual(match, null, `${id} is embedded`);
  return JSON.parse(match[1]);
}

// 书架放在项目仓库里：项目根下有 examples/hello.ts，书架是 shelf/，01 号书的一章 include 项目代码。
async function initShelfInsideProject(name) {
  const project = path.join(repoRoot, "tmp", "test-fixtures", `${name}-${randomUUID()}`);
  const shelf = path.join(project, "shelf");
  await initWorkspace({ targetDir: shelf });
  await mkdir(path.join(project, "examples"), { recursive: true });
  await writeFile(path.join(project, "examples", "hello.ts"), "export const hello = \"project code\";\n", "utf8");
  const chapterPath = path.join(shelf, "books", "01-starter-book", "chapters", "020-main-flow.adoc");
  const chapter = await readFile(chapterPath, "utf8");
  await writeFile(
    chapterPath,
    `${chapter}\n\n[source,ts]\n----\ninclude::../../../../examples/hello.ts[]\n----\n`,
    "utf8"
  );
  return shelf;
}

// 一个按函数名选代码的解析器，交回 snippets/code.ts 里那一个声明的整行；收到的请求记在 globalThis 上，
// 配置文件在同一个进程里 import，测试读得到。交回的文本带着末尾换行：运行时要去掉它再与来源逐行核对。
const symbolResolverConfig = `import { readFileSync } from "node:fs";
import path from "node:path";

globalThis.includeResolverRequests = [];
export default {
  includeResolvers: [{
    prefix: "symbol:",
    resolve(request) {
      globalThis.includeResolverRequests.push(request);
      const lines = readFileSync(path.join(import.meta.dirname, request.target), "utf8").split("\\n");
      const start = lines.findIndex((line) => line.startsWith(\`export function \${request.attributes["1"]}(\`));
      const end = lines.indexOf("}", start);
      return { text: lines.slice(start, end + 1).join("\\n") + "\\n", origin: { path: request.target, startLine: start + 1 } };
    }
  }]
};
`;

// directiveLine 是 directive 在章节文件里的行号，失败消息里的位置以它为准。
async function initWorkspaceWithInclude(name, files, directive) {
  const target = path.join(repoRoot, "tmp", "test-fixtures", `${name}-${randomUUID()}`);
  await initWorkspace({ targetDir: target });
  for (const [relativePath, text] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(target, relativePath)), { recursive: true });
    await writeFile(path.join(target, relativePath), text, "utf8");
  }
  const chapterPath = path.join(target, "books", "01-starter-book", "chapters", "020-main-flow.adoc");
  const before = `${await readFile(chapterPath, "utf8")}\n\n`;
  await writeFile(chapterPath, `${before}${directive}\n`, "utf8");
  return { target, chapterPath, directiveLine: before.split("\n").length };
}

test("runtime build creates HTML, assets, home links, source bundles, and root index without default ADOC output", async () => {
  const target = path.join(repoRoot, "tmp", "test-fixtures", `runtime-build-${randomUUID()}`);
  await initWorkspace({ targetDir: target });

  const warnings = await captureConsoleWarn(() => buildWorkspace(target));
  assert.equal(warnings.some((warning) => warning.includes("Opal already loaded")), false);

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
  assert.match(starterEmbeddedSource, /include::chapters\/010-opening\.adoc\[\]/);
  assert.match(starterEmbeddedSource, /\/\/ file: shared\/attributes\.adoc/);
  assert.match(starterEmbeddedSource, /\/\/ file: books\/01-starter-book\/chapters\/020-main-flow\.adoc/);

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
  assert.match(structuredWriting, /<h1 id="名称role-与关系" class="sect0">Part II: 名称、role 与关系<\/h1>/);
  assert.match(structuredWriting, /<h1 id="字段与约定" class="sect0">Part III: 字段与约定<\/h1>/);
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
    ["版本说明", "献辞", "前言", "凡例", "致谢"]
  );
  assert.equal(
    pageMap.pages.find((page) => page.title === "源文本与投影")?.source?.relativePath,
    "books/07-structured-writing-conventions/parts/010-source-surface/010-source-and-projection.adoc"
  );
  assert.deepEqual(
    pageMap.pages.filter((page) => page.kind === "appendix").map((page) => page.title),
    ["结构化写法速查", "结构化写法决策树"]
  );
  assert.deepEqual(
    pageMap.pages.slice(-2).map((page) => page.kind),
    ["glossary", "bibliography"]
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
  const browser = await launchBrowser();
  try {
    const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await desktop.goto(bookUrl);
    await assertVisibleText(desktop, "#content", "源文本与投影");
    await assertVisibleText(desktop, "#content", "中西文混排照规范");
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
    await assertVisibleText(desktop, "#content", "版本说明");
    await desktop.getByRole("link", { name: /下一页\s+从源文档看结构/ }).click();
    await assertVisibleText(desktop, "#content", "从源文档看结构");
    assert.equal(await desktop.locator("[data-multi-book-page-nav] [aria-current='page']").textContent(), "从源文档看结构");

    await desktop.locator("[data-multi-book-page-nav]").getByRole("link", { name: "源文本与投影", exact: true }).click();
    await assertVisibleText(desktop, "#content", "源文本与投影");
    // 下一章的标题不显示；正文里指向它的链接文字照常显示，所以只看章标题。
    await assertHiddenText(desktop, "#content h2", "标题、寻址与引用");
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

    await desktop.locator("[data-multi-book-page-nav]").getByRole("link", { name: "标题、寻址与引用", exact: true }).click();
    await assertVisibleText(desktop, "#content", "标题、寻址与引用");
    assert.match(decodeURIComponent(desktop.url()), /[?&]page=标题寻址与引用/);

    await desktop.getByRole("button", { name: "连续" }).click();
    await assertVisibleText(desktop, "#content", "源文本与投影");
    await assertVisibleText(desktop, "#content", "中西文混排照规范");
    assert.equal(await desktop.locator("[data-multi-book-page-nav]").evaluate((node) => node.hidden), true);
    assert.equal(
      await desktop.locator("#toc > :not([data-multi-book-controls]):not([data-multi-book-page-nav])").evaluateAll((nodes) => {
        return nodes.some((node) => !node.hidden);
      }),
      true
    );

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mobile.goto(`${bookUrl}?view=paged&page=${encodeURIComponent("源文本与投影")}`);
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

test("runtime build fails when a book includes a file outside the default documentRoot", async () => {
  const shelf = await initShelfInsideProject("runtime-outside-root");

  await assert.rejects(
    () => buildWorkspace(shelf),
    /^Error: 01-starter-book: [\s\S]*include\.outside-document-root/
  );
});

test("runtime build reads a larger documentRoot from the workspace config", async () => {
  const shelf = await initShelfInsideProject("runtime-project-root");
  await writeFile(path.join(shelf, "adoc-books.config.mjs"), `export default { documentRoot: ".." };\n`, "utf8");

  await buildWorkspace(shelf);

  const starter = await readFile(path.join(shelf, "build", "html", "books", "01-starter-book", "book.html"), "utf8");
  assert.match(starter, /project code/);
  const pageMap = embeddedJson(starter, "multi-book-page-map");
  assert.equal(pageMap.book.entry, "shelf/books/01-starter-book/book.adoc");
  assert.ok(pageMap.pages.filter((page) => page.source).every((page) => page.source.relativePath.startsWith("shelf/books/01-starter-book/")));
  assert.ok(pageMap.pages.length > 1, "the reader is not reduced to a cover page");
  const source = embeddedJson(starter, "multi-book-source-data");
  assert.match(source, /^\/\/ file: shelf\/books\/01-starter-book\/book\.adoc$/m);
  assert.match(source, /^\/\/ file: shelf\/shared\/attributes\.adoc$/m);
  assert.match(source, /^\/\/ file: examples\/hello\.ts\nexport const hello = "project code";$/m);
});

test("runtime build gives one include resolver the same request for HTML and reader data", async () => {
  const { target, chapterPath } = await initWorkspaceWithInclude("runtime-include-resolver", {
    "adoc-books.config.mjs": symbolResolverConfig,
    // beta 后紧跟非空行：多出来的末尾空行会与它对不上。
    "snippets/code.ts": `// header\nexport function alpha() {\n  return "alpha";\n}\n\nexport function beta() {\n  return "beta";\n}\n// trailer\n`
  }, "[source,ts]\n----\ninclude::symbol:snippets/code.ts[beta,opts=optional]\n----");

  await buildWorkspace(target);

  const requests = globalThis.includeResolverRequests;
  assert.equal(requests.length, 2, "Asciidoctor renders the HTML and aat derives the reader data");
  assert.deepEqual(requests[0], requests[1]);
  assert.deepEqual(requests[0], {
    target: "snippets/code.ts",
    attributes: { 1: "beta", "optional-option": "" },
    sourcePath: chapterPath
  });
  const starter = await readFile(path.join(target, "build", "html", "books", "01-starter-book", "book.html"), "utf8");
  const listings = [...starter.matchAll(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/g)].map((match) => match[1]);
  assert.ok(listings.includes(`export function beta() {\n  return "beta";\n}`), "the listing holds exactly the selected declaration");
  // 复制纯文本收录参与构建的源文件全文，解析器取的那个文件也在其中。
  const source = embeddedJson(starter, "multi-book-source-data");
  assert.match(source, /^\/\/ file: snippets\/code\.ts$/m);
});

test("runtime build keeps an empty positional attribute as null on both sides", async () => {
  const { target } = await initWorkspaceWithInclude("runtime-resolver-empty-positional", {
    "adoc-books.config.mjs": `globalThis.emptyPositionalRequests = [];
export default { includeResolvers: [{ prefix: "rec:", resolve(request) {
  globalThis.emptyPositionalRequests.push(request.attributes);
  return { text: "", origin: { path: "catalog.adoc", startLine: 1 } };
} }] };\n`
  }, "include::rec:anything[,beta]\n\ninclude::rec:anything[alpha,,gamma]");

  await buildWorkspace(target);

  // 网页一侧先渲染，阅读数据一侧后解析；中间留空的位置也保留为 null，编号不移位。
  const first = { 1: null, 2: "beta" };
  const gap = { 1: "alpha", 2: null, 3: "gamma" };
  assert.deepEqual(globalThis.emptyPositionalRequests, [first, gap, first, gap]);
});

test("runtime build waits for an include resolver that returns a Promise, on both sides", async () => {
  const { target } = await initWorkspaceWithInclude("runtime-resolver-async", {
    "notes/later.txt": "异步交来的一行\n",
    "adoc-books.config.mjs": `globalThis.asyncResolverCalls = 0;
export default { includeResolvers: [{ prefix: "later:", async resolve() {
  globalThis.asyncResolverCalls += 1;
  await new Promise((done) => setTimeout(done, 5));
  return { text: "异步交来的一行\\n", origin: { path: "notes/later.txt", startLine: 1 } };
} }] };\n`
  }, "[source,text]\n----\ninclude::later:anything[]\n----");

  await buildWorkspace(target);

  assert.equal(globalThis.asyncResolverCalls, 2, "Asciidoctor renders the HTML and aat derives the reader data");
  const starter = await readFile(path.join(target, "build", "html", "books", "01-starter-book", "book.html"), "utf8");
  assert.match(starter, /<code[^>]*>异步交来的一行<\/code>/);
  assert.match(embeddedJson(starter, "multi-book-source-data"), /^\/\/ file: notes\/later\.txt$/m);
});

test("runtime build names the resolver and the directive when a resolver result cannot be used", async () => {
  const cases = [
    ["failed for", "() => { throw new Error(\"boom\"); }", ": boom$"],
    ["failed for", "async () => { throw new Error(\"async boom\"); }", ": async boom$"],
    ["returned an invalid result for", "() => ({ text: 42 })"],
    ["returned text that is not lines 2-2 of \\S*two\\.txt for", "() => ({ text: \"L2\", origin: { path: \"notes/two.txt\", startLine: 2 } })", ": line 2 is \"l2\", the resolver returned \"L2\"$"],
    // 来源末尾的换行之后没有第 3 行。
    ["returned text that is not lines 2-3 of \\S*two\\.txt for", "() => ({ text: \"l2\\n\\n\", origin: { path: \"notes/two.txt\", startLine: 2 } })", ": the file has only 2 lines$"],
    ["returned a source outside documentRoot .* for", "() => ({ text: \"x\", origin: { path: \"../elsewhere.txt\", startLine: 1 } })"],
    ["returned a source outside documentRoot .* for", "() => ({ text: \"\", origin: { path: \".\", startLine: 1 } })"]
  ];
  for (const [phrase, resolve, tail = ""] of cases) {
    const { target, directiveLine } = await initWorkspaceWithInclude("runtime-resolver-failure", {
      "notes/two.txt": "l1\nl2\n",
      "adoc-books.config.mjs": `export default { includeResolvers: [{ prefix: "x:", resolve: ${resolve} }] };\n`
    }, "include::x:anything[]");

    await assert.rejects(
      () => buildWorkspace(target),
      new RegExp(`include resolver 'x:' ${phrase} include::x:anything\\[\\] in \\S*020-main-flow\\.adoc: line ${directiveLine}${tail}`),
      resolve
    );
  }
});

test("runtime config rejects a documentRoot that is not a path containing the workspace", async () => {
  for (const [value, message] of [
    ["123", /documentRoot must be a path string relative to the workspace root/],
    ["\"../elsewhere\"", /documentRoot must contain the workspace root/]
  ]) {
    const target = path.join(repoRoot, "tmp", "test-fixtures", `runtime-bad-document-root-${randomUUID()}`);
    await initWorkspace({ targetDir: target });
    await writeFile(path.join(target, "adoc-books.config.mjs"), `export default { documentRoot: ${value} };\n`, "utf8");

    await assert.rejects(() => buildWorkspace(target), message);
  }
});

test("runtime reports Asciidoctor messages inside resolved text at the source file's lines", async () => {
  const draft = `${Array.from({ length: 39 }, (_, index) => `Line ${index + 1}.`).join("\n")}\nText.\n\n----\nnever closed\n`;
  const { target } = await initWorkspaceWithInclude("runtime-resolver-lines", {
    "notes/draft.adoc": draft,
    "adoc-books.config.mjs": `export default { includeResolvers: [{ prefix: "verbatim:", resolve: ({ target }) => ({
  text: "Text.\\n\\n----\\nnever closed",
  origin: { path: target, startLine: 40 }
}) }] };\n`
  }, "include::verbatim:notes/draft.adoc[]");

  // 显示路径照 Asciidoctor 自己 include 文件的写法，相对书目录（base_dir）。
  await assert.rejects(
    () => buildWorkspace(target),
    /WARN: \.\.\/\.\.\/notes\/draft\.adoc: line 42: unterminated listing block/
  );
});

test("runtime build passes after deleting any one sample and removing its catalog entries", async () => {
  for (const bookId of expectedBooks) {
    const target = path.join(repoRoot, "tmp", "test-fixtures", `runtime-delete-${bookId}-${randomUUID()}`);
    await initWorkspace({ targetDir: target });
    await rm(path.join(target, "books", bookId), { recursive: true });
    const catalogPath = path.join(target, "catalog.adoc");
    const catalog = await readFile(catalogPath, "utf8");
    await writeFile(catalogPath, removeSampleFromCatalog(catalog, bookId), "utf8");

    await buildWorkspace(target);

    assert.equal(await existsFile(path.join(target, "build", "html", "books", bookId, "book.html")), false);
  }
});

test("runtime build fails for missing include targets reported by Asciidoctor", async () => {
  const target = path.join(repoRoot, "tmp", "test-fixtures", `runtime-missing-include-${randomUUID()}`);
  await initWorkspace({ targetDir: target });
  const chapterPath = path.join(target, "books", "01-starter-book", "chapters", "020-main-flow.adoc");
  const chapter = await readFile(chapterPath, "utf8");
  await writeFile(
    chapterPath,
    `${chapter}\n\ninclude::missing-include.adoc[]\n`,
    "utf8"
  );

  await assert.rejects(
    () => buildWorkspace(target),
    /AsciiDoc strict check failed[\s\S]*include file not found/
  );
});

test("runtime build accepts cross-book xrefs to IDs declared in any AsciiDoc form", async () => {
  const target = path.join(repoRoot, "tmp", "test-fixtures", `runtime-id-forms-${randomUUID()}`);
  await initWorkspace({ targetDir: target });
  const headings = [
    ["[#id-shorthand]", "id-shorthand"],
    ["[#id-with-role.adapter-contract, owner=query-runtime]", "id-with-role"],
    ["[.adapter-contract#role-first]", "role-first"],
    ["[[double-bracket]]", "double-bracket"],
    ["[id=id-attribute]", "id-attribute"],
    ["", "generated-heading"]
  ];
  const chapterPath = path.join(target, "books", "02-multipart-monograph", "parts", "010-domain", "020-boundary.adoc");
  const sections = headings.map(([declaration, id]) => {
    const title = id === "generated-heading" ? "Generated Heading" : `Heading ${id}`;
    return `${declaration ? `${declaration}\n` : ""}=== ${title}\n\nText.\n`;
  });
  await writeFile(chapterPath, `${await readFile(chapterPath, "utf8")}\n\n${sections.join("\n")}`, "utf8");
  const sourceChapterPath = path.join(target, "books", "01-starter-book", "chapters", "020-main-flow.adoc");
  const xrefs = headings.map(([, id]) => `See xref:../02-multipart-monograph/book.adoc#${id}[${id}].`);
  await writeFile(sourceChapterPath, `${await readFile(sourceChapterPath, "utf8")}\n\n${xrefs.join("\n\n")}\n`, "utf8");

  await buildWorkspace(target);

  // 每条链接都落在那本书 HTML 里真有的元素上：片段本来就是 id 的照原样，生成 ID 的按标题改写到那一节。
  const sourceHtml = await readFile(path.join(target, "build", "html", "books", "01-starter-book", "book.html"), "utf8");
  const targetHtml = await readFile(path.join(target, "build", "html", "books", "02-multipart-monograph", "book.html"), "utf8");
  const anchors = new Set([...targetHtml.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  for (const [, id] of headings) {
    const link = sourceHtml.match(new RegExp(`<a href="\\.\\./02-multipart-monograph/book\\.html#([^"]+)">${id}</a>`));
    assert.ok(link, `a link for ${id}`);
    assert.ok(anchors.has(link[1]), `${id} reaches ${link[1]}, an element of the other book`);
  }
});

test("runtime binds cross-book xrefs to titles in the other book and points HTML links at them", async () => {
  const target = path.join(repoRoot, "tmp", "test-fixtures", `runtime-cross-book-titles-${randomUUID()}`);
  await initWorkspace({ targetDir: target });
  const targetChapterPath = path.join(target, "books", "02-multipart-monograph", "parts", "010-domain", "020-boundary.adoc");
  await writeFile(targetChapterPath, `${await readFile(targetChapterPath, "utf8")}

=== 名称、角色与关系

Text.
`, "utf8");
  const sourceChapterPath = path.join(target, "books", "01-starter-book", "chapters", "020-main-flow.adoc");
  await writeFile(sourceChapterPath, `${await readFile(sourceChapterPath, "utf8")}

:monograph: ../02-multipart-monograph/book.adoc

属性写法：xref:{monograph}#名称、角色与关系[]。

路径写法：xref:../02-multipart-monograph/book.adoc#名称、角色与关系[按路径]。
`, "utf8");

  await buildWorkspace(target);

  const html = await readFile(path.join(target, "build", "html", "books", "01-starter-book", "book.html"), "utf8");
  assert.match(html, /<a href="\.\.\/02-multipart-monograph\/book\.html#名称角色与关系">名称、角色与关系<\/a>/);
  assert.match(html, /<a href="\.\.\/02-multipart-monograph\/book\.html#名称角色与关系">按路径<\/a>/);
  assert.doesNotMatch(html, /book\.html#名称、角色与关系/);
});

test("runtime binds xrefs to headings through asciidoc-abundant-tree and points HTML links at them", async () => {
  const target = path.join(repoRoot, "tmp", "test-fixtures", `runtime-reference-binding-${randomUUID()}`);
  await initWorkspace({ targetDir: target });
  const chapterPath = path.join(target, "books", "01-starter-book", "chapters", "020-main-flow.adoc");
  await writeFile(chapterPath, `${await readFile(chapterPath, "utf8")}

=== 名称、角色与关系

Text.

[#src]
=== 源文本与投影

Text.

=== 引用处

按标题：xref:名称、角色与关系[] 与 xref:源文本与投影[]。

按 ID：xref:src[] 与 xref:#src[井号写法]。

:sec: 名称、角色与关系

按属性：xref:{sec}[属性写法]。

展示写法：\`pass:[xref:不存在的标题[显示文本]]\`。

转义与透传：\\xref:不存在的标题[] 与 +++xref:不存在的标题[]+++ 与 $$xref:不存在的标题[]$$。
`, "utf8");

  await buildWorkspace(target);

  const html = await readFile(path.join(target, "build", "html", "books", "01-starter-book", "book.html"), "utf8");
  assert.match(html, /<a href="#名称角色与关系">名称、角色与关系<\/a>/);
  assert.match(html, /<a href="#名称角色与关系">属性写法<\/a>/);
  assert.equal(html.match(/<a href="#src">源文本与投影<\/a>/g)?.length, 2);
  assert.match(html, /<a href="#src">井号写法<\/a>/);
  assert.doesNotMatch(html, /href="#名称、角色与关系"|href="#源文本与投影"/);
  assert.match(html, /xref:不存在的标题\[显示文本\]/);
});

test("runtime binds qualified addresses to one of several headings that share a title, inside a book and across books", async () => {
  const target = path.join(repoRoot, "tmp", "test-fixtures", `runtime-qualified-address-${randomUUID()}`);
  await initWorkspace({ targetDir: target });
  const shared = `

=== 红烧肉

==== 火候

Text.

=== 清蒸鲈鱼

==== 火候

Text.
`;
  const targetChapterPath = path.join(target, "books", "02-multipart-monograph", "parts", "010-domain", "020-boundary.adoc");
  await writeFile(targetChapterPath, `${await readFile(targetChapterPath, "utf8")}${shared}`, "utf8");
  const sourceChapterPath = path.join(target, "books", "01-starter-book", "chapters", "020-main-flow.adoc");
  await writeFile(sourceChapterPath, `${await readFile(sourceChapterPath, "utf8")}${shared}
=== 引用处

书内：xref:清蒸鲈鱼::火候[鲈鱼的火候]。

书内只写地址：xref:红烧肉::火候[]，三级 xref:章节顺序::红烧肉::火候[]，只写标题 xref:红烧肉[]。

跨书：xref:../02-multipart-monograph/book.adoc#清蒸鲈鱼::火候[那本书里鲈鱼的火候]。

跨书只写地址：xref:../02-multipart-monograph/book.adoc#清蒸鲈鱼::火候[]。
`, "utf8");

  await buildWorkspace(target);

  const idsOf = (html) => [...html.matchAll(/<h4 id="([^"]+)">(?:[\d.]+ )?火候<\/h4>/g)].map((match) => match[1]);
  const sourceHtml = await readFile(path.join(target, "build", "html", "books", "01-starter-book", "book.html"), "utf8");
  const targetHtml = await readFile(path.join(target, "build", "html", "books", "02-multipart-monograph", "book.html"), "utf8");
  const [sourcePork, sourceFish] = idsOf(sourceHtml);
  const [, targetFish] = idsOf(targetHtml);
  assert.ok(sourcePork && sourceFish && targetFish);
  assert.match(sourceHtml, new RegExp(`<a href="#${sourceFish}">鲈鱼的火候</a>`));
  assert.match(sourceHtml, new RegExp(`<a href="\\.\\./02-multipart-monograph/book\\.html#${targetFish}">那本书里鲈鱼的火候</a>`));
  // 链接没有显示文字时显示地址的名字：作者写下的各级标题，用间隔号连起；只写标题的显示标题。
  assert.match(sourceHtml, new RegExp(`<a href="#${sourcePork}">红烧肉·火候</a>`));
  assert.match(sourceHtml, new RegExp(`<a href="#${sourcePork}">章节顺序·红烧肉·火候</a>`));
  assert.match(sourceHtml, /">红烧肉<\/a>/);
  assert.match(sourceHtml, new RegExp(`<a href="\\.\\./02-multipart-monograph/book\\.html#${targetFish}">清蒸鲈鱼·火候</a>`));
  assert.doesNotMatch(sourceHtml, /清蒸鲈鱼::火候"/);
});

test("runtime shows a title that itself contains :: whole, not as a path", async () => {
  // 标题原文是 std::vector：它是一个标题（aat:headline），不是 std 下的 vector，链接文字原样显示，不拆成间隔号。
  const target = path.join(repoRoot, "tmp", "test-fixtures", `runtime-colon-title-${randomUUID()}`);
  await initWorkspace({ targetDir: target });
  const chapterPath = path.join(target, "books", "01-starter-book", "chapters", "020-main-flow.adoc");
  await writeFile(chapterPath, `${await readFile(chapterPath, "utf8")}

=== std::vector

Text.

=== 引用处

见 xref:std::vector[]。
`, "utf8");

  await buildWorkspace(target);

  const html = await readFile(path.join(target, "build", "html", "books", "01-starter-book", "book.html"), "utf8");
  const id = html.match(/<h3 id="([^"]+)">(?:[\d.]+ )?std::vector<\/h3>/)?.[1];
  assert.ok(id);
  assert.match(html, new RegExp(`<a href="#${id}">std::vector</a>`));
  assert.doesNotMatch(html, />std·vector</);
});

test("runtime build leaves xrefs that reach no section, several, or only the document title as Asciidoctor wrote them", async () => {
  // 引用对不对是投影的读者（bookgraph）的解释，不是渲染的事（DESIGN.adoc 的 Division of Labour）：链接只能跳到一处，
  // 恰好一节才改写，其余照 Asciidoctor 写下的样子留着，构建也不因它们失败。
  const target = path.join(repoRoot, "tmp", "test-fixtures", `runtime-reference-untouched-${randomUUID()}`);
  await initWorkspace({ targetDir: target });
  const targetChapterPath = path.join(target, "books", "02-multipart-monograph", "parts", "010-domain", "020-boundary.adoc");
  await writeFile(targetChapterPath, `${await readFile(targetChapterPath, "utf8")}

=== 重名

Text.

=== 重名

Text.
`, "utf8");
  const chapterPath = path.join(target, "books", "01-starter-book", "chapters", "020-main-flow.adoc");
  await writeFile(chapterPath, `${await readFile(chapterPath, "utf8")}

=== 同名

Text.

=== 同名

Text.

=== 引用处

见 xref:同名[]。

见 xref:不存在的标题[]。

见 xref:日常独立单书[]。

见 xref:../02-multipart-monograph/book.adoc#重名[]。

见 xref:../02-multipart-monograph/book.adoc#no-such-anchor[那本书里没有的]。

见 xref:../missing-book/book.adoc[不存在的书]。
`, "utf8");

  await buildWorkspace(target);

  const html = await readFile(path.join(target, "build", "html", "books", "01-starter-book", "book.html"), "utf8");
  // 同名的几节，Asciidoctor 自己按标题落到第一个、显示标题（DESIGN.adoc 的 Reference Binding），runtime 不改它。
  assert.match(html, /<a href="#同名">同名<\/a>/);
  assert.match(html, /<a href="#不存在的标题">\[不存在的标题\]<\/a>/);
  assert.match(html, /<a href="#日常独立单书">\[日常独立单书\]<\/a>/);
  assert.match(html, /<a href="\.\.\/02-multipart-monograph\/book\.html#重名">/);
  assert.match(html, /<a href="\.\.\/02-multipart-monograph\/book\.html#no-such-anchor">那本书里没有的<\/a>/);
  assert.match(html, /<a href="\.\.\/missing-book\/book\.html">不存在的书<\/a>/);
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
