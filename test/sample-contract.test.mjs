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
      "include::parts/020-body-structure/020-inline-structure.adoc[]",
      "parts/<part-id>/",
      "目录约定服务维护边界",
      "连续 chapter 编号",
      "custom ID：给标题再加一个地址",
      "[.term]#inline role#",
      "[.path]`parts/020-body-structure/`",
      "xref:正文结构地图[]",
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
      "= 结构化书写约定标本",
      ":partnums:",
      ":part-signifier: Part",
      ":appendix-caption: 附录",
      "= 从源文档看结构",
      "== 标题、寻址与引用",
      "== 源文件编排号",
      "include::parts/010-source-surface/030-source-order-notation.adoc[]",
      "== 名称与地址",
      "== 标题的 role",
      "== 附加字段",
      "== 统一用词",
      "== 声明本书的约定",
      "include::parts/030-fields-and-terminology/030-declaring-conventions.adoc[]",
      "[.convention, declares=roles]",
      "[.convention, declares=relations]",
      "[.convention, declares=values, for=rule, field=verdict]",
      "[.convention, declares=fields, for=rule]",
      "[.concept]",
      "[.rule]",
      "[#红烧肉的火候]",
      "rel=depends-on",
      "aat:references",
      "rel:depends-on",
      "aat:containsDirectly",
      "xref:结构化写法决策树[]",
      "=== 标题生成与层级拓扑控制",
      "=== 改名时的判断",
      "=== role 的作用域与语境管理",
      "=== xref 与 rel 关系谓词建立",
      "=== surface field 落位策略",
      "=== 约定的声明与维护",
      "=== 源文件物理编排与编号运算",
      "=== 语法透传与 callouts"
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
    // 样本示范的是「标题就是地址」：不为了被引用而给标题打 ID（DESIGN.adoc 的 Sample Addressing）。07 号书在寻址一章
    // 里专门示范 custom ID 的用法，由它自己的断言守着。
    if (bookId !== "07-structured-writing-conventions") {
      assert.doesNotMatch(allSource, /^\[#[^\]]*\]$/m, `${bookId} declares a heading ID`);
    }
    // 书没有摘要：[abstract] 是 article 的样式，book 里会被编成一章（DESIGN.adoc 的 Sample Front Matter）。
    // 00 号书在前置内容地图里讲这件事，所以只禁止独占一行、真正作用在 section 上的写法。
    assert.doesNotMatch(allSource, /^\[abstract\]$/m, `${bookId} writes an [abstract] section`);
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
      assert.match(allSource, /xref \+ : \+ \.\.\/other-book\/book\.adoc#目标章节\[\]/);
      assert.doesNotMatch(allSource, /xref:\.\.\/0[0-9]-[^/\]]+\/book\.adoc/);
    }
    if (bookId === "05-upper-volume") {
      assert.match(allSource, /^== 上册核心模型$/m);
      assert.doesNotMatch(allSource, /\[#upper-core-model\]/);
    }
    if (bookId === "06-lower-volume") {
      assert.match(bookSource, /^:upper-book:\s+\.\.\/05-upper-volume\/book\.adoc$/m);
      assert.match(allSource, /xref \+ : \+ \{upper-book\}#上册核心模型\[\]/);
      assert.doesNotMatch(allSource, /xref:\{upper-book\}#/);
    }
    if (bookId === "07-structured-writing-conventions") {
      assert.doesNotMatch(
        allSource,
        /\bstable ID\b|stable-id|稳定 ID|稳定地址|regular-heading|basic-syntax|xref-rule|寻址标签|id-prefix|aliases::/
      );
      // 07 号书在「标题、寻址与引用」里示范 custom ID：同名的「火候」要单独引用时才加。除这一处示例外，
      // 书里的标题都按标题寻址（DESIGN.adoc 的 Sample Addressing）。
      assert.deepEqual(
        allSource.match(/^\[#[^\]]*\]$/gm),
        ["[#红烧肉的火候]"]
      );
      // 书教约定声明，自己也声明：前言里「本书的书写约定」写出它标题上真正用到的 role。示例代码块里的声明不算，
      // 所以先去掉 ---- 定界的块再找。
      const outsideListings = allSource.replace(/^(-{4,})$[\s\S]*?^\1$/gm, "");
      assert.match(outsideListings, /^\[\.convention, declares=roles\]$/m);
      assert.doesNotMatch(outsideListings, /^\[\.population\]$/m);
    }
  }
});
