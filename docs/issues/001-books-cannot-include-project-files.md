# 书不能引用书架之外的项目文件

- 发现：2026-10-21，trestlework 写 8 号设计书时（trestlework 计划 #9 工作包 9.4）。
- 代码版本：asciidoc-multi-book-workspace `44db845`；trestlework 书架里生成的 `tools/adoc-books.mjs` 是同一段逻辑；asciidoc-abundant-tree 0.1.20。下文行号以此为准。
- 影响：书架放在一个项目仓库里时，书无法 include 项目自己的代码。include 以后 HTML 照常渲染，阅读页却退化为只有封面，只在控制台留一条警告。
- 涉及：`src/runtime/adoc-books.mts:460-461`、`src/runtime/adoc-books.mts:489-493`；`docs/design/双视图 UI 正式对象规约汇总.md:41`、`:77-87`。

## 需求

trestlework 把书架放在项目仓库的 `bookshelf/` 下，设计书是设计的唯一来源，代码在同一个仓库的 `packages/` 与 `examples/` 里。
书里的代码片段最好就是能通过类型检查的真实代码，用 include 从项目里取，书与代码只有一份文字。Asciidoctor 本身允许 include
`base_dir` 之内的任何文件；限制来自这里选的 `documentRoot`。

## 复现（实测）

在 8 号书一章里加一行：

```asciidoc
[source,ts]
----
include::../../../../../examples/gateway-board/commands/replay.ts[]
----
```

`pnpm run build` 的输出：

```text
08-trestlework-design: reader page map fell back to cover-only mode: include.outside-document-root: Resolved include path is outside documentRoot: /home/t103o/workbench/projects/trestlework/examples/gateway-board/commands/replay.ts.
```

构建没有失败，`book.html` 里代码块渲染正常，但阅读页只剩封面。

## 原因

构建器把工作区根目录作为 `documentRoot` 交给 asciidoc-abundant-tree（`adoc-books.mts:489`），规约写明这样选的理由是书要 include
`../../shared/attributes.adoc`（规约 `:41`）。在 asciidoc-abundant-tree 里，`documentRoot` 同时是 relativePath 的基准与路径边界
（它的 10 号书第 3 章“documentRoot”一节），所以工作区之外的文件进不了源集。

## 规约与实现不一致（实测）

规约 `:85-87` 写“include 越过 `documentRoot` 阻断构建”。实现在 `adoc-books.mts:493` 接住异常，交给 `fallbackReaderBookData`，后者
打一条 warn 后退回只有封面（`:460-461`）。上面的复现里构建成功退出。两者应当说同一件事：要么阻断，要么在规约里写明降级。

## 方向

验证过的：asciidoc-abundant-tree 不需要改。在 trestlework 书架里直接调用它，`documentRoot` 取项目根目录，带着上面那行 include 的
8 号书 `parseAbundantTree` 与 `rdf12` 都成功；relativePath 以项目根为基准，书的入口是
`bookshelf/books/08-trestlework-design/book.adoc`，被引用的文件是 `examples/gateway-board/commands/replay.ts`（实测）。
同样的调用把 `documentRoot` 换回书架根，报上面的 `include.outside-document-root`。

所以缺的只是让工作区声明更大的根：例如在工作区的配置里写 `documentRoot: ".."`，不写时仍是工作区根目录，构建器读它。
同一份声明也要给其他读这些书的工具用，例如 bookgraph（`.aktant/bookgraph_ipython`，它把 `documentRoot` 固定为书架根，另提了 issue）
与 trestlework 自己的结构检查：一处声明，几处读，免得各自猜。

推断、没有单独测过的：relativePath 的基准变了以后，阅读页的页面标识与“复制本书为纯文本”里的 `// file:` 标记会带上
`bookshelf/` 这一段前缀；附件按书目录复制，不受影响。实现时要逐项确认。

被否掉的：

- 把项目代码搬进书架。代码属于代码的工作区（pnpm 工作区、类型检查的项目引用），书架是独立的 pnpm 项目。
- 片段在书里写一份、用测试比对代码。trestlework 现在这样做（仓库根目录的 `book-code.test.ts` 检查每个带 `file=` 的代码块原样出现在
  那个文件里），能防止两处走样，但文字仍是两份，是在这个限制下的绕行。
