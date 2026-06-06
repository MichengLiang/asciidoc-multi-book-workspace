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
  "06-lower-volume",
  "07-structured-writing-conventions"
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
      "[index]",
      "indexterm2:[section]",
      "indexterm:[section, hierarchy]",
      "indexterm:[heading, discrete]",
      "indexterm2:[<primary>]",
      "indexterm:[<primary>, <secondary>, <tertiary>]",
      "正文中已经出现该词时",
      "正文没有出现该词",
      "HTML5",
      "section style",
      "Document title",
      "Part（部）",
      "不创建 section",
      "观察结构位置",
      "结构清单由",
      "写作目标",
      "读者任务",
      "发布边界",
      "不作为必选清单",
      "include::parts/02-body-structure/02-inline-structure.adoc[]",
      "parts/<part-id>/",
      "目录约定服务维护边界",
      "连续 chapter 编号",
      "[#inline-structure-map]",
      "[.term]#inline role#",
      "[.path]`parts/02-body-structure/`",
      "xref:#body-map[正文结构地图]",
      "{series-name}",
      "语义身份",
      "具体视觉效果取决于输出样式"
    ]
  ],
  ["01-starter-book", ["[preface]", "[appendix]", "[bibliography]"]],
  ["04-reference-manual", ["[discrete]", "[glossary]"]],
  [
    "07-structured-writing-conventions",
    [
      "结构化书写约定标本",
      "按写作目的选择这些写法",
      "从源文档看结构",
      "长期引用的标题使用稳定 ID",
      "源文档把 `稳定标题` 写成可引用的阅读单位",
      "`#stable-heading` 给标题一个稳定地址",
      "源文件编排号",
      "source-order notation",
      "part 目录使用 `100-`、`200-`、`300-`",
      "chapter 文件在所属 part 内使用 `010-`、`020-`、`030-`",
      "标题文本保留语义名称",
      "长期引用的标题使用显式 ID",
      "include::parts/100-source-surface/030-source-order-notation.adoc[]",
      "role 标明标题身份",
      "投影时，这条引用使用默认谓词 `aat:references`",
      "references",
      "写入 `rel=depends-on`",
      "当前标题的判断、规则或操作以目标标题为依据",
      "named attributes",
      "附加字段",
      "`owner=writing-team` 写在标题 attrlist 中，投影时成为标题字段",
      "字段名和字段值来自本书自己的约定",
      "indexterm2:[role]",
      "indexterm:[relation predicate]",
      "xref:stable-heading[稳定标题]",
      "xref:stable-heading[稳定标题, rel=depends-on, weight=strong]",
      "aat:references",
      "rel:depends-on",
      "[.concept]",
      "[.rule]"
    ]
  ]
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

test("default workspace template keeps the official sample books", async () => {
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
    if (bookId === "00-book-anatomy") {
      assert.doesNotMatch(allSource, /\(\([^)]*\)\)/);
    }
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
