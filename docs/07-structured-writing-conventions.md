<document>
<format_guide>
本次文件扫描结果使用XML标签标识各个结构化区域。

标签说明：
- <summary_stats> : 项目统计信息，以Markdown表格呈现
- <directory_tree> : ASCII目录树结构，包裹在代码块中
- <file_contents> : 所有源文件的完整内容

文件内容格式说明：
每个文件使用 unified diff 格式头部作为边界和元信息标记：
--- NUL                   (表示新文件)
+++ b/<相对路径>           (文件路径)
@@ -0,0 +1,<行数> @@       (文件行数)
<实际内容>                 (文件内容，无+前缀)
文件之间通过新的 '--- NUL' 行分隔。
</format_guide>

<summary_stats>

| 项目 | 数量 |
|---|---|
| 总文件数 | 21 |
| 二进制文件 | 0 |
| 总大小 | 39.6 KB |
| 总行数 | 861 |

</summary_stats>

<directory_tree>

```
└── asciidoc-multi-book-workspace
    └── templates
        └── default-workspace
            └── books
                └── 07-structured-writing-conventions
                    ├── book.adoc (1.6 KB)
                    ├── backmatter
                    │   ├── appendix-decision-trees.adoc (9.7 KB)
                    │   ├── appendix-quick-reference.adoc (4.1 KB)
                    │   ├── bibliography.adoc (0.6 KB)
                    │   └── glossary.adoc (1.3 KB)
                    ├── frontmatter
                    │   ├── acknowledgments.adoc (0.1 KB)
                    │   ├── colophon.adoc (0.2 KB)
                    │   ├── dedication.adoc (0.1 KB)
                    │   └── preface.adoc (1.0 KB)
                    └── parts
                        ├── 010-source-surface
                        │   ├── 010-source-and-projection.adoc (3.8 KB)
                        │   ├── 020-heading-address-and-xref.adoc (3.6 KB)
                        │   ├── 030-source-order-notation.adoc (2.4 KB)
                        │   └── _partintro.adoc (0.1 KB)
                        ├── 020-names-roles-and-relations
                        │   ├── 010-names-and-addresses.adoc (1.5 KB)
                        │   ├── 020-heading-roles.adoc (0.8 KB)
                        │   ├── 030-relation-predicate.adoc (1.4 KB)
                        │   └── _partintro.adoc (0.1 KB)
                        └── 030-fields-and-terminology
                            ├── 010-surface-fields.adoc (2.9 KB)
                            ├── 020-consistent-terms.adoc (0.3 KB)
                            ├── 030-declaring-conventions.adoc (3.8 KB)
                            └── _partintro.adoc (0.2 KB)
```

</directory_tree>

<file_contents>

--- NUL
+++ b/templates/default-workspace/books/07-structured-writing-conventions/backmatter/appendix-decision-trees.adoc
@@ -0,0 +1,207 @@
= 结构化写法决策树

=== 标题生成与层级拓扑控制

触发场景:: 作者准备在源文档中创建新的标题节点。

[source,text]
----
1. 当前标题是否为文档大标题？
   ├─ 是：使用 `= 书名`，并放置于文档首行。流程结束。
   └─ 否：评估前置与后置结构。

2. 当前标题是否承载附录、术语表或参考文献等后置结构？
   ├─ 是：在标题上方声明对应 section style：
   │      `[appendix]`、`[glossary]` 或 `[bibliography]`。
   │      section style 改变紧随其后 section 的语义；标题层级仍由 `=` 数量决定。
   │      书没有分部：写成 `==`，与各章并列。
   │      书有分部：写成 `=`，与各部并列；写成 `==` 会成为前一部的子节。
   │      附录的第一层小节都写 `===`。写成 `=` 的附录在解析时被调到 1 级，
   │      它下面的 `==` 不跟着调，会跑出附录，成了排在附录后面的章。
   │      附录标题不写“附录 A”：字母由 Asciidoctor 生成，书头的 `:appendix-caption:` 定它前面的词。
   │      流程结束。
   └─ 否：评估前置结构。

3. 当前标题是否承载前言、致谢、献辞或版本说明等前置结构？
   ├─ 是：在标题上方声明 `[preface]`、`[acknowledgments]`、`[dedication]` 或 `[colophon]`，
   │      放在第一部之前，有没有分部都写成 `==`。流程结束。
   └─ 否：评估逻辑层级。

4. 当前标题与紧邻上级标题的层级关系是否连续？
   │  写成 `=` 的附录、术语表和参考文献按 1 级算：附录下写 `===` 是连续的。
   ├─ 否：补充中间层级标题，保持标题层级连续；回到节点 4 重新评估。
   └─ 是：评估区域划分。

5. 当前标题下有没有一段文本区域，后续需要被单独指向或提及？
   ├─ 是：用更小一级标题把这段区域划出来，后续用 xref 指向那个新标题；
   │      新标题另走一遍本流程。当前标题写入标准等号标题。流程结束。
   └─ 否：写入标准等号标题。流程结束。
----

=== 改名时的判断

触发场景:: 作者发现当前标题已经不是这个对象的规范名称。

[source,text]
----
1. 当前标题还是该对象的规范名称吗？
   ├─ 是：继续使用标题。
   └─ 否：判断变化类型。

2. 只是换成更准确的名称吗？
   ├─ 是：改标题，更新引用；旧称有价值时写入别名。
   └─ 否：检查概念边界。

3. 概念边界改变了吗？
   ├─ 是：检查描述、纳入条件、排除条件、相关标题和既有结论。
   └─ 否：完成名称更新。

4. 旧概念被拆分或废止了吗？
   ├─ 是：保留历史标题，写明后续标题。
   └─ 否：继续维护当前标题。

5. 引用它的地方都跟上新标题了吗？
   ├─ 否：检查逐处报出找不到目标的引用，把它们改成新标题。
   └─ 是：完成。
----

跨改名追踪记录和冻结内容版本，由工具层分别处理，不由 custom ID 承担。

=== role 的作用域与语境管理

触发场景:: 作者为标题标记认知作用。
前提:: 当前书稿已经约定 role 受控词表，例如 `.concept`、`.rule`、`.example`。

[source,text]
----
1. 当前标题是否为其父标题的下级标题？
   ├─ 否：从受控词表中选取匹配当前语境的 role，写入标题 attrlist。流程结束。
   └─ 是：评估语境连续性。

2. 当前子标题承载的认知角色是否与父标题声明的 role 相同？
   ├─ 是：写作时可以不重复声明 role，读者按语境理解为同一角色范围。
   │      工具只读标题自己写下的 role：想让检查核对它的字段、让查询列出它，就自己写上 role。流程结束。
   └─ 否：从受控词表中选取匹配新语境的 role，显式写入当前标题 attrlist。
          该声明完成语境切换。流程结束。
----

=== xref 与 rel 关系谓词建立

触发场景:: 作者在正文中提到别的部、章、节。

[source,text]
----
1. 正文要提到的是不是另一部、章、节（本书或别的书里的）？
   ├─ 是：写 xref，不写「上一章」「第二部讲过」这类位置词；评估目标位置。
   └─ 否：正常书写。流程结束。

2. 目标是否在另一本书里？
   ├─ 是：在书头用文档属性保存那本书的入口路径，例如 `:upper-book: ../05-upper-volume/book.adoc`；
   │      xref 写 `{upper-book}#目标标题[]`，`#` 后面写那本书里的标题；评估同名。
   └─ 否：同一本书里经 include 拼起来的文件之间，xref 直接写标题；评估同名。

3. 目标标题在它所在的书里是否与别的标题同名？
   ├─ 是：在要引用的那一节标题上方加 custom ID（上级标题加本节标题，如 `红烧肉的火候`），
   │      xref 写这个 ID，并写上显示文本；进入关系评估。
   └─ 否：xref 写标题原文；进入关系评估。

4. 引用目的是什么？
   ├─ 表达阅读顺序、先读建议或普通参见：
   │      写入普通 xref，例如 `xref:目标标题[显示文本]`。
   │      投影为默认谓词 `aat:references`。流程结束。
   └─ 声明明确的逻辑关系边：选取 `rel` 谓词。

5. 从本书声明过的关系谓词里选择 `rel`；要用的谓词还没声明，先写进本书的关系谓词声明。
   下面是常见的选择：
   ├─ 当前标题的判断、规则或操作以目标标题为依据：使用 `rel=depends-on`。
   ├─ 当前标题提供目标标题的示例：使用 `rel=illustrates`。
   ├─ 当前标题给出目标标题所代表对象的定义：使用 `rel=defines`。
   └─ 当前标题对目标标题的合法写法或范围施加约束：使用 `rel=constrains`。
----

=== surface field 落位策略

触发场景:: 作者为 heading 节点或 xref 边挂载键值信息。

[source,text]
----
1. 字段描述的主体是什么？
   ├─ xref 引用边：将字段写入 xref 的 named attributes 中。流程结束。
   └─ heading 标题节点：评估字段体积。

2. heading 字段数量和长度是否适合写入标题 attrlist？
   ├─ 字段较少，且字段值较短：写入标题前方 attrlist。
   │      例如 `[owner=writing-team, status=active]`。流程结束。
   └─ 字段较多，或包含多行字段值：
          写入紧随标题下方的第一个连续描述列表。
          例如 `key:: value`。进入块评估。

3. 字段值是否需要附带代码块、表格或另一段正文？
   ├─ 是：在字段文字之后写一行 `+`，再写块；块属于字段值。
   │      字段之间不插入不带 `+` 的块，否则字段列表在块前结束。流程结束。
   └─ 否：流程结束。
----

=== 约定的声明与维护

触发场景:: 作者为本书引入或修改 role、rel 谓词、字段取值或字段。

[source,text]
----
1. 本书是否已有对应的约定声明？
   ├─ 是：在该声明的描述列表中增加、修改或删除 term；进入类型评估。
   └─ 否：新建声明标题，放在读者最先读到约定的地方（例如前言里专设一节“本书的书写约定”），
          写 `[.convention, declares=...]`；进入类型评估。

2. 声明的是什么？
   ├─ role：`declares=roles`。
   ├─ rel 谓词：`declares=relations`。
   ├─ 某个 role 的附加字段取值：`declares=values, for=<role>, field=<字段名>`。
   └─ 某个 role 的标题下描述列表字段：`declares=fields, for=<role>`。

3. term 是否写成写作时使用的那个词？
   ├─ 否：去掉点号与反引号，例如 `.concept` 写成 `concept`；回到本步重新判断。
   └─ 是：在描述中写出这个词的含义。流程结束。
----

约定变化时只改声明。检查脚本和查询工具从声明读出词表，不另外维护一份。

=== 源文件物理编排与编号运算

触发场景:: 作者为 Part 目录或 Chapter 源文件生成文件编排号。
前提:: Part 目录和 Chapter 文件统一使用三位定宽的编排号，默认步长为 10，例如 `010`、`020`、`030`；编号始终写满三位。

[source,text]
----
1. 新文件在逻辑序列中的位置是什么？
   ├─ 位于当前既有序列的最后方：执行末尾追加。
   └─ 位于当前既有文件 A 与文件 B 之间：执行中间插入。

2. 末尾追加：
   提取当前同级列表中的最大编号，取比它大的下一个整十。例如 `090` 之后是 `100`，`015` 之后是 `020`。
   流程结束。

3. 中间插入：
   提取上文文件 A 和下文文件 B 的编号，计算两者的算术中间值。
   例如在 `010` 与 `020` 之间插入，使用 `015`。中间值不是整数时，取它两侧任一个整数，
   例如 `010` 与 `015` 之间用 `012` 或 `013`。
   流程结束。
----

=== 语法透传与 callouts

触发场景:: 作者书写代码、日志或工具语法文本。

[source,text]
----
1. 正文中是否要原样展示行内宏（如 xref）或属性引用？
   │  反引号只改字体，里面的行内宏和属性引用照样会被替换；
   │  `= 书名`、`[.concept]` 这类块写法在行内不会被当作结构，反引号就够了。
   ├─ 是：使用 `pass:[]` 宏包裹该内容。
   │      若需要代码字体样式，在外层叠加反引号包裹。流程结束。
   └─ 否：评估解释关联。

2. 当前是否为代码或日志结构，且配有单独的文字解释？
   ├─ 是：使用 AsciiDoc callouts 标注代码或日志与解释之间的关联。流程结束。
   └─ 否：正常书写。流程结束。
----

--- NUL
+++ b/templates/default-workspace/books/07-structured-writing-conventions/backmatter/appendix-quick-reference.adoc
@@ -0,0 +1,79 @@
= 结构化写法速查

[cols="1,2", options="header"]
|===
|写法 |含义

|`= 书名`
|文档大标题（Document Title）。作为整本书的根节点，只能位于文档首行。

|`= 卷/部`
|0级章节（Level 0）。位于大标题之后的正文中，代表书籍的“卷/部”（Part）。

|`== 章`
|1级章节（Level 1）。代表书籍的“章”（Chapter）。

|`=== 节`
|2级章节（Level 2）。代表章内部的“节”（Section）。

|`==== 小节`
|3级章节（Level 3）。代表“小节”（Subsection）。

|`===== 次小节`
|4级章节（Level 4）。代表“次小节”。

|`====== 最底层标题`
|5级章节（Level 5）。AsciiDoc 引擎支持的最深物理层级。

|`parts/010-topic/`
|Part 目录的源文件编排号。三位定宽，默认步长 10（`010`、`020`……），末位留作插入；位数固定，字典序与自然排序给出同一顺序。

|`010-opening.adoc`
|Chapter 文件的源文件编排号。规则与 Part 目录编排号一致。

|`== 标题`
|创建标题节点；标题给出当前规范名称，标题原文也是它的地址。

|`[.concept]`
|用 role 标记标题在书中的作用。

|`[#红烧肉的火候]`
|custom ID：给标题加第二个地址。只在一节需要被单独引用、又与别的标题同名时写。

|`[.example, owner=writing-team]`
|role 和 named attributes 保留标题的作用与附加字段。

|`[.convention, declares=roles]`
|约定声明。标题下的描述列表是本书的 role 词表；`declares` 还可以取 `relations`、`values`（配 `for` 与 `field`）和 `fields`（配 `for`）。

|`summary::` + 下一行说明文本
|标题下描述列表字段。用于较多字段或多行字段值。

|字段文字之后的 `+` + 块
|把代码块、表格等挂到字段上，块属于字段值。字段之间不插入不带 `+` 的块。

|`pass:[xref:标题[显示文本]]`
|显示为链接，投影为 references。

|`pass:[xref:标题[显示文本, rel=depends-on]]`
|显示为链接，同时声明 depends-on 关系。

|===

全书标题需要保持 `标题层级连续`。写成 `=` 的附录、术语表和参考文献按 1 级算，附录的第一层小节写 `===` 就是连续的。

role 描述标题在书中的作用。rel 描述 xref 边上的关系谓词。附加字段可以写在标题 attrlist、标题下描述列表或 xref named attributes 中。

标题改名时，更新引用；旧称有保留价值时写入别名。概念被拆分或废止时，保留历史标题并写明后续使用的标题。

`[appendix]`、`[glossary]` 和 `[bibliography]` 是 section style。它们改变紧随其后 section 的语义；标题层级仍由 `=` 数量决定。书没有分部时，它们标在 `==` 标题上，与各章并列；书有分部时，标在 `=` 标题上，与各部并列，写成 `==` 会成为前一部的子节。附录的第一层小节写 `===`。附录标题不写序号，字母由 Asciidoctor 生成，前面的词由书头的 `:appendix-caption:` 决定。前言、致谢等前置部分在第一部之前，有没有分部都写 `==`。

同一本书里经 include 拼起来的各个文件之间，引用直接写标题。引用另一本书时，在书头定义一个文档属性保存那本书的入口路径（比如 `:book-b: ../book-b/book.adoc`），引用写成 `pass:[xref:{book-b}#目标标题[]]`，`#` 后面写那本书里的标题。

如果你的建模中存在需要对一段区域精准指向、提及的情况，可以考虑使用 **更小一级/更小一节** 的标题把这段区域划分出来，之后就可以继续使用 `xref` 进行交叉引用。

反引号只改字体：反引号里的行内宏（如 xref）和属性引用照样会被替换。要原样展示它们，用 `\pass:[…]` 包住，外面再加反引号得到等宽字体。`= 书名`、`[.concept]` 这类块写法出现在行内时不会被当作结构，反引号就够了。

如果遇到“代码/日志”与其“文字解释”需要分离的场景，可以考虑使用 Asciidoc 的 Callouts。

结构化写法的选择由当前对象、引用需求、投影需求和维护成本共同决定。具体判定流程见 xref:结构化写法决策树[]。

--- NUL
+++ b/templates/default-workspace/books/07-structured-writing-conventions/backmatter/bibliography.adoc
@@ -0,0 +1,9 @@
= 参考坐标

以下资料提供 AsciiDoc 标题、交叉引用、元素属性和描述列表的参考坐标。

[bibliography]
* [[[asciidoctor-xref]]] Asciidoctor Docs, Cross References, https://docs.asciidoctor.org/asciidoc/latest/macros/xref/
* [[[asciidoctor-attributes]]] Asciidoctor Docs, Element Attributes, https://docs.asciidoctor.org/asciidoc/latest/attributes/element-attributes/
* [[[asciidoctor-description-lists]]] Asciidoctor Docs, Description Lists, https://docs.asciidoctor.org/asciidoc/latest/lists/description/
* [[[asciidoctor-sections]]] Asciidoctor Docs, Sections, https://docs.asciidoctor.org/asciidoc/latest/sections/

--- NUL
+++ b/templates/default-workspace/books/07-structured-writing-conventions/backmatter/glossary.adoc
@@ -0,0 +1,19 @@
= 术语表

本术语表记录结构化书写约定中的核心术语。

[glossary]
heading:: 使用等号标题创建的书稿结构单位。
规范名称:: 当前书稿采用的标题名称。
custom ID:: 作者用 `[#id]` 给标题加的第二个地址。一节需要被单独引用、又与别的标题同名时才加；标题原文本身就是地址。
别名:: 标题以外仍有检索、历史或语境价值的名称。
不透明记录键:: 工具层用于跨改名追踪同一条记录的机器键。
内容哈希:: 标识某次冻结内容的校验值。
source-order notation:: 写在源文件路径表面的排序符号。
role:: 标题节点在书中承担的叙述作用，例如 `.concept`、`.rule` 或 `.example`。
ordinary reference:: 普通 xref。投影时使用默认谓词 `aat:references`。
relation predicate:: xref `rel` 字段选择的边谓词。
source heading:: xref 所在的标题。
target heading:: xref selector 指向的标题。
surface field:: 源文档表面的附加字段。标题字段可来自标题 attrlist 或标题下描述列表；xref 边字段来自 xref named attributes。
约定声明:: 带 `.convention` role 的标题。`declares` 字段说明它声明 role、rel 谓词、字段取值还是字段；标题下的描述列表是词表，term 是词，描述是含义。

--- NUL
+++ b/templates/default-workspace/books/07-structured-writing-conventions/frontmatter/acknowledgments.adoc
@@ -0,0 +1,3 @@
== 致谢

感谢 Asciidoctor 和 RDF 投影相关文档提供术语与结构坐标。

--- NUL
+++ b/templates/default-workspace/books/07-structured-writing-conventions/frontmatter/colophon.adoc
@@ -0,0 +1,5 @@
== 版本说明

本文档属于 `{series-name}`。colophon 位于书籍前置区域，记录本样本书的版本、来源或出版信息。

示例版本：v0.1。

--- NUL
+++ b/templates/default-workspace/books/07-structured-writing-conventions/frontmatter/dedication.adoc
@@ -0,0 +1,3 @@
== 献辞

献给每一位愿意为自己写下的标题、引用和标记负责的作者。

--- NUL
+++ b/templates/default-workspace/books/07-structured-writing-conventions/frontmatter/preface.adoc
@@ -0,0 +1,17 @@
== 前言

这本书把标题、引用、role、rel 和附加字段放在同一份 AsciiDoc 源文档中。标题给出当前规范名称；xref 找到标题；role 说明标题在书中的作用；rel 说明引用表达的关系。

标题就是地址；一节需要被单独引用、又与别的标题同名时，才给它加 custom ID。旧称、俗称和历史名称写入别名，不藏在 ID 里。字段较少且值较短时写在标题 attrlist；字段较多或需要多行值时写在标题下的连续描述列表。

同一份源文档因此同时保留阅读结构、维护所需的名称和关系，以及工具可以继续投影的字段。

=== 本书的书写约定

本书在标题上用两种 role，词表写在下面；约定怎样声明，见 xref:声明本书的约定[]。本书正文里的引用都不带 `rel`，所以不声明关系谓词。

[.convention, declares=roles]
==== 本书的 role

concept:: 概念：本书使用的一个词及其含义。
convention:: 约定：声明本书的 role、rel、字段取值或字段。

--- NUL
+++ b/templates/default-workspace/books/07-structured-writing-conventions/parts/010-source-surface/010-source-and-projection.adoc
@@ -0,0 +1,91 @@
== 源文本与投影

本章用一段示例展示结构化书写约定。Turtle 片段列出关键投影事实；完整投影还会保留 raw、路径、行号和边证据。
本章节的演示展示文字如何形成清晰的查询与导航结构。

[source,asciidoc]
----
= 结构化写作样例

[.concept]
== 常规标题

常规标题提供可引用的阅读单位。

[.example]
=== 基本语法

基本语法是常规标题下的直接子标题。

[.rule]
== 引用规则

引用规则参见 xref:常规标题[]。
引用规则依赖 xref:常规标题[常规标题, rel=depends-on, weight=strong]。
----

源文档把 `常规标题` 写成可引用的阅读单位，在其下写出 `基本语法` 子标题，把 `引用规则` 写成规则说明，并在正文里写出参见和依赖两种引用。

Turtle 示例中的 `<urn:aat:doc:...#heading-*>` 和 `<urn:aat:doc:...#xref-edge-*>` 表示投影生成的文档节点 IRI。本例没有写 custom ID：`aat:headline` 是标题原文，引用写的就是它；`aat:generatedAddressLabel` 是 Asciidoctor 从标题生成的 ID（这份样例没有设 `:idprefix:`，所以带前缀 `_`），投影也把它记下来，但它随标题和位置变，引用不写它。`pass:[xref:常规标题[]]` 的 `aat:targetSelector` 是 `常规标题`，按标题原文绑定到 `aat:targetHeading`。

[source,turtle]
----
<urn:aat:doc:...#heading-l3-o0> a aat:Heading ;
  aat:headline "常规标题" ;
  aat:generatedAddressLabel "_常规标题" ;
  aat:role "concept" ;
  aat:containsDirectly <urn:aat:doc:...#heading-l8-o0> .

<urn:aat:doc:...#heading-l8-o0> a aat:Heading ;
  aat:headline "基本语法" ;
  aat:generatedAddressLabel "_基本语法" ;
  aat:role "example" .

<urn:aat:doc:...#heading-l13-o0> a aat:Heading ;
  aat:headline "引用规则" ;
  aat:generatedAddressLabel "_引用规则" ;
  aat:role "rule" ;
  aat:references <urn:aat:doc:...#heading-l3-o0> ;
  rel:depends-on <urn:aat:doc:...#heading-l3-o0> .

<urn:aat:doc:...#xref-edge-l17-c8-o0> a aat:XrefEdge ;
  aat:targetSelector "常规标题" ;
  aat:targetHeading <urn:aat:doc:...#heading-l3-o0> ;
  aat:rel "depends-on" ;
  aat:weight "strong" .
----

源文档中的 [.concept]#常规标题# 是被引用的阅读单位，`基本语法` 是它的下级标题， [.rule]#引用规则# 说明引用写法。投影读取同一份源文档，为标题生成 IRI，并在标题节点上保留 `aat:headline`、`aat:generatedAddressLabel` 和 `aat:role`；标题层级投影为 `aat:containsDirectly`，xref 投影为 `aat:references` 和 `rel:depends-on`，每条 xref 边记下它写的 `aat:targetSelector` 与绑定到的 `aat:targetHeading`。

[source,asciidoc]
----
[.concept]
== 林黛玉

林黛玉是……她与 xref:贾宝玉[rel=love] 有木石前盟。

[.convention, declares=relations]
== 本书的关系谓词

love:: 起点人物爱慕终点人物。
----

此处的 `pass:[xref:贾宝玉]` 直接使用标题文本作为寻址地址，
因为“贾宝玉”在当前书稿中作为唯一标题名称使用。
交叉引用宏语法是 `pass:[xref:目标标题[可选显示文本]]`，所以这里省略了显示文本，渲染引擎默认会展示标题文字。

`love` 是这本书自己的关系谓词，写在它的约定声明里：`rel` 用到的每个谓词都要在本书的关系谓词词表里（见 xref:声明本书的约定[]）。

'''

再来看看这样的场景： 标题是编号型标识符，且被交叉引用

例如： `REQ-2024-0088`、`TC-AUTH-032`、`ADR-2024-015`，他们的标题本身就是编号，是人为设计的全局唯一标识符， 需要尊重他的原来的结构与语义。

[source,asciidoc]
----
[.requirement, category=性能]
== REQ-2024-0088
----

`REQ-2024-0088` 是本书采用的编号名称。编号制度负责分配和唯一性，引用直接使用该编号：`pass:[xref:REQ-2024-0088[REQ-2024-0088, rel=constrains]]`

--- NUL
+++ b/templates/default-workspace/books/07-structured-writing-conventions/parts/010-source-surface/020-heading-address-and-xref.adoc
@@ -0,0 +1,85 @@
== 标题、寻址与引用

等号行创建标题和层级。标题给出当前规范名称；标题前的 attrlist 可以承载 role 和字段。

[source,asciidoc]
----
[.concept]
== 常规标题
----

`.concept` 标明标题在书中的作用。`常规标题` 是当前规范名称。

[source,asciidoc]
----
引用规则参见 xref:常规标题[]。
----

该 xref 投影为 `aat:references`，即默认引用谓词。

[source,asciidoc]
----
引用规则依赖 xref:常规标题[常规标题, rel=depends-on]。
----

`rel=depends-on` 声明从当前标题到目标标题的依赖关系，投影为 `rel:depends-on`。

xref 的目标写标题原文。标题里的空格、顿号和冒号都照原文写：`pass:[xref:名称、角色与关系[]]` 与 `pass:[xref:常规标题[]]` 一样找到标题。标题原文和作者写下的 custom ID 是标题的地址。

Asciidoctor 还会从标题生成一个 ID：去掉标点，同名时按出现顺序加上 `-2`、`-3`。它跟着标题和标题的位置变，引用不写它。

工作区的构建（`pnpm run build` 与 `pnpm run check`）按地址核对每一处引用：找不到目标或目标不止一个时，报出引用所在的文件与行；找到了，就把 HTML 里的链接接到那个标题上。单独用 Asciidoctor 或编辑器预览时，没有空格、又带顿号或冒号的标题会被当作 ID 去找，预览里这样的链接是断的；这不是写错，以工作区的构建为准。

标题会重名。按类别组织的内容，各个大标题下常有名字相同的小节：

[source,asciidoc]
----
== 红烧肉

=== 火候

== 清蒸鲈鱼

=== 火候

== 糖醋排骨

=== 火候
----

三节「火候」各自说明一道菜，平时不必单独引用。某一处要指向红烧肉的「火候」时，`pass:[xref:火候[]]` 有三个候选，检查报出引用处和三节各自的位置。这时在要引用的那一节标题上方加 custom ID（`[#…]`），引用写这个 ID：

[source,asciidoc]
----
== 红烧肉

[#红烧肉的火候]
=== 火候
----

custom ID 写成在全书里能单独说清这一节的名字，例如上级标题加本节标题。引用写这个 ID，并写上显示文本：`pass:[xref:红烧肉的火候[红烧肉的火候]]`。不写显示文本时，链接显示的是这一节的标题「火候」，读者看不出是哪道菜的。

custom ID 是同一个标题的第二个地址，标题原文仍是它的地址。重名是在需要引用的那一刻才发现的，custom ID 也在那一刻才加。

不需要单独引用、也不重名的标题，不写 custom ID。标题改了名，引用它的地方就该一起接受检查：书都在本地，检查覆盖每一处引用，没有跟上的会被逐处报出来。为了让旧引用在改名后照常成功而预先写下的 ID，跳过了这次检查，ID 里还留着旧的说法。

[TIP]
====
1. custom ID 只在一节需要被单独引用、又与别的标题同名时出现，其余时候标题直接承担地址。写法速查见 xref:结构化写法速查[]；完整判断流程见 xref:结构化写法决策树[]。
2. 正文提到别的部、章、节时，写成 xref，不写「上一章」「第二部讲过」这样的位置词：位置会随编排改变，读者也没法从位置词跳过去。
====

标题声明角色后，其下级标题默认属于同一角色范围。下级标题可声明不同角色以切换语境。角色范围是阅读上的语境；投影、检查和查询工具只读标题自己写下的 role，下级标题不会因此被当作同一 role 的标题核对字段或列出。

例如:

[source,asciidoc]
----
[.rule]
== 引用规则

=== 基本语法

[.example]
=== 一个完整示例
----

--- NUL
+++ b/templates/default-workspace/books/07-structured-writing-conventions/parts/010-source-surface/030-source-order-notation.adoc
@@ -0,0 +1,39 @@
== 源文件编排号

源文件编排号写在 part 目录名和 chapter 文件名前部。它让编辑器文件树里的顺序就是书的阅读顺序；书的结构仍由 `book.adoc` 的 include 清单决定。

Part 目录和 Chapter 文件统一使用三位定宽的编排号，默认步长为 10：

* 依次写 `010`、`020`、`030`……，同一层最多到 `990`。
* 末位留作插入：相邻两个编号之间有 9 个空位。
* 编号始终写满三位，不足的补零。

[source,text]
----
parts/010-source-surface/
parts/015-new-topic/       <1>
parts/020-names-roles-and-relations/

010-opening.adoc
015-new-context.adoc       <2>
020-main-flow.adoc
----
<1> 使用 `015` 在 `010` 和 `020` 两个 Part 之间插入。
<2> 使用 `015` 在 `010` 和 `020` 两个 Chapter 之间插入。

**操作规则：**

作者需要两个原子操作：

. **末尾追加**：取比当前最大编号大的下一个整十。例如，`090` 之后是 `100`，仍是三位；最后一个是插进来的 `015` 时，下一个是 `020`。
. **中间插入**：在 A 与 B 之间插入时，新编号取 A 和 B 的**算术中间值**。例如，在 `010` 与 `020` 之间插入，使用 `015`，两侧各留 4 个空位，后续插入仍有余地。中间值不是整数时，取它两侧任一个整数：`010` 与 `015` 之间用 `012` 或 `013`。

编号定宽，是因为不同的工具按不同规则排列文件名。编辑器与文件管理器（如 VS Code、Windows 资源管理器）用自然排序，数字按数值比较；git、终端的 `ls` 和脚本按字典序逐字比较。位数相同的编号，两种比较的结果一样，侧栏里和命令行里看到的是同一个顺序。不补零时，自然排序仍把 `5-` 排在 `10-` 前面，字典序却把 `10-` 排到 `5-` 前面。

同一层超过 99 个单元时，编号会长到四位，字典序又会排错；到那时，重排这一层。

编号后面的短名写给文件树里的人看，不参与引用，也不必与标题一致；标题改了名，短名可以跟着改，`book.adoc` 的 include 同步。前置与后置文件（前言、附录、术语表等）不编号，按内容命名；附录的文件名不写字母，字母由 Asciidoctor 按 include 的顺序生成。

编排号只安排源文件顺序。标题保存当前规范名称，引用用标题找到它；同名而需要单独引用时，才用 custom ID。

编排号、标题和 custom ID 承担不同职责，不互相替代。

--- NUL
+++ b/templates/default-workspace/books/07-structured-writing-conventions/parts/010-source-surface/_partintro.adoc
@@ -0,0 +1,1 @@
标题、引用和文件路径同时构成书稿的阅读结构与可投影的源文档表面。

--- NUL
+++ b/templates/default-workspace/books/07-structured-writing-conventions/parts/020-names-roles-and-relations/010-names-and-addresses.adoc
@@ -0,0 +1,21 @@
== 名称与地址

标题不只是排版上的显示文字。它是当前书稿采用的名称，也是读者、项目和引用者正在使用的名称；引用写的就是它，标题就是这一节的地址。

[.concept]
=== 宿舍集中备考者

别名::

* 宿舍高强度备考者（旧称）
* 宿舍备考学生（常用称呼）

标题改成“宿舍集中备考者”以后，检查逐处报出还写着旧标题的引用，作者把它们改成新标题。“宿舍高强度备考者”仍有历史检索价值时，作为旧称保留在别名中。

名称变得更准确时，改标题并更新引用。概念边界改变时（例如「凉拌与腌制」改成「凉拌菜」，腌制不再在内），同时检查描述、纳入条件、排除条件、相关标题和既有结论；检查报出的每一处旧引用，都要判断它说的是留下的那部分，还是去掉的那部分。

不为旧标题留一节“指路”：旧引用会照常找到它，检查就报不出它们。旧名写进别名。旧概念被拆分或废止时保留的历史标题，写明它已不再使用、后续用哪个标题。

custom ID 是标题的第二个地址，只在一节需要被单独引用、又与别的标题同名时才加（见 xref:标题、寻址与引用[]）。它不替代标题，也不替旧称留位置：旧称写进别名。

工具若要跨改名追踪同一条记录，由工具层保存不透明记录键。某次冻结内容的校验，由内容哈希或快照承担。标题继续保存当前规范名称。

--- NUL
+++ b/templates/default-workspace/books/07-structured-writing-conventions/parts/020-names-roles-and-relations/020-heading-roles.adoc
@@ -0,0 +1,36 @@
== 标题的 role

role 写在标题 attrlist 的点号 token 位置。

[source,asciidoc]
----
[.concept]
== 常规标题

[.rule]
== 引用规则
----

`.concept` 和 `.rule` 是 role。它们说明标题在当前书中承担概念说明或规则说明的作用。

[cols="1,2", options="header"]
|===
|写法 |读者看到的作用

|`[.concept]`
|标记概念说明。

|`[.rule]`
|标记规则说明。

|`[.example]`
|标记示例。
|===

同一个 role 在全书中保持同一种叙述作用。

一本书使用的 role 种类和数量，取决于该领域的概念结构。每种 role 的语义在全书中保持唯一。

全书的 role 词表写成约定声明，见 xref:声明本书的约定[]。

读者和工具链可以依据 role 进行导航文本和提取结构。

--- NUL
+++ b/templates/default-workspace/books/07-structured-writing-conventions/parts/020-names-roles-and-relations/030-relation-predicate.adoc
@@ -0,0 +1,27 @@
== rel 关系谓词

`rel` 是 xref 边上的关系谓词。包含 xref 的标题是关系起点，xref 指向的标题是关系终点。本书把这两个位置称为 source heading 和 target heading。

[source,asciidoc]
----
引用规则参见 xref:常规标题[]。
引用规则依赖 xref:常规标题[常规标题, rel=depends-on]。
----

第一行投影为 `aat:references`，即默认引用谓词。第二行声明 `rel=depends-on`，投影为 `rel:depends-on`。

带 `rel` 的 xref 可以不写显示文本：`pass:[xref:常规标题[rel=depends-on]]` 的链接显示目标标题。

`rel` 可以被读者和工具当作关系谓词，所以在全书范围内，每种 `rel` 谓词的语义需要保持唯一且不变。

全书采用的 rel 谓词写成约定声明，见 xref:声明本书的约定[]。下面是常见的几种选择；用哪一个，先写进本书的关系谓词声明，再在 `rel` 里写它：

[horizontal]
depends-on:: 当前标题的判断、规则或操作以目标标题为依据。阅读顺序和先读建议使用普通 xref 表达。
illustrates:: 当前标题提供目标标题的示例。
defines:: 当前标题给出目标标题所代表对象的定义。
constrains:: 当前标题对目标标题的合法写法或范围施加约束。

关系谓词描述标题之间的边。标题在书中的作用由 role 表达。

标题之间的阅读顺序和先读建议，使用普通 xref（默认 `aat:references`）表达。

--- NUL
+++ b/templates/default-workspace/books/07-structured-writing-conventions/parts/020-names-roles-and-relations/_partintro.adoc
@@ -0,0 +1,1 @@
标题给出当前名称，也是引用它的地址；role 说明标题节点在书中的作用；rel 说明标题之间的关系。

--- NUL
+++ b/templates/default-workspace/books/07-structured-writing-conventions/parts/030-fields-and-terminology/010-surface-fields.adoc
@@ -0,0 +1,71 @@
== 附加字段

附加字段是写在源文档表面的键值信息。标题字段可以写在标题 attrlist 或标题下描述列表中；xref 边证据字段写在 xref named attributes 中。

[source,asciidoc]
----
[.example, owner=writing-team]
== 示例

示例说明 xref:常规标题[rel=illustrates, weight=strong]。
----

`.example` 是 role。`owner=writing-team` 是标题附加字段。`weight=strong` 是 xref 边证据上的附加字段。

`owner=writing-team` 写在标题 attrlist 中，投影时成为标题字段。`weight=strong` 写在 xref 中，投影时成为边证据字段。

标题字段较少且值较短时，写在标题 attrlist 中。标题字段较多，或字段值需要换行时，写在标题下的第一个连续描述列表中。

[source,asciidoc]
----
[.example, status=active]
== 示例规则

priority:: normal
summary::
示例规则说明标题字段的描述列表写法。
多行说明保留为同一个标题字段。

示例规则正文从这里开始。
----

`priority:: normal` 和 `summary::` 属于 `示例规则` 标题的附加字段。投影时它们成为标题字段，例如 `aat:priority` 和 `aat:summary`；`情况` 这样不是 ASCII 标识符的字段名投影为 `aat:field-` 加百分号编码。

字段值需要附带代码块、表格或另一段正文时，用 `+` 把块挂到字段上。挂上来的块属于这个字段的值。

[source,asciidoc]
------
[.rule, verdict=adapt]
== 关闭标签

情况:: 关闭当前标签。
规则:: 先结束输入法的组字，再关闭。
出处:: `editorCommands.ts:835-839`。
+
[source,ts]
----
closeActiveEditor()
----
判定:: 改写。
------

`出处` 的值是出处那一行文字和挂上来的代码块。字段值按作者写下的原文保存：反引号、xref 和 include 指令都保留原样。

没有 `+` 的块不属于字段。字段列表在那个块之前结束，块和它之后的内容都是标题的正文；块之后再写的描述列表也不再是字段。字段之间需要代码时，用 `+` 挂上，不要直接插入代码块。

另有三种写法让整串描述列表都不算字段，标题一个字段也得不到：标题与描述列表之间有别的块（段落、提示块、代码块、图片等）；描述列表带 style（如 `[horizontal]`）、ID、块标题或其他块属性；某个条目里嵌套了描述列表。这时描述列表是标题的正文。反过来，要让标题正下方的描述列表是正文而不是字段，就在它前面放一段导语，或给它加 `[horizontal]` 等 style。

字段名和字段值来自本书自己的约定。同一本书使用附加字段时，应保持字段写法和字段含义稳定。

[source,asciidoc]
----
[.concept]
== 宿舍集中备考者

别名::

* 宿舍高强度备考者（旧称）
* 宿舍备考学生（常用称呼）
----

`别名` 记录其他名称；它不取代标题，也不作为隐藏的第二个规范名称。

--- NUL
+++ b/templates/default-workspace/books/07-structured-writing-conventions/parts/030-fields-and-terminology/020-consistent-terms.adoc
@@ -0,0 +1,5 @@
== 统一用词

术语表记录本书采用的关键用词。规范名称、custom ID、别名、role、rel 和附加字段分别指向不同对象。

role 说明标题节点在书中的作用；rel 说明引用边表达的关系。术语的定义集中维护在书后的术语表中。

--- NUL
+++ b/templates/default-workspace/books/07-structured-writing-conventions/parts/030-fields-and-terminology/030-declaring-conventions.adoc
@@ -0,0 +1,68 @@
== 声明本书的约定

一本书采用的 role、rel、字段取值和字段构成它的约定。约定写在书里：读者从这里知道每个词的含义，检查脚本和查询工具从同一处读出受控词表。词表只写这一处，书和工具不会各说各的。

声明约定的标题带 `.convention` role 和 `declares` 字段。声明的内容写成标题下的第一个连续描述列表：每个 term 是一个词，描述是这个词的含义。

[source,asciidoc]
----
[.convention, declares=roles]
=== 标题的 role

concept:: 概念：本书使用的一个词及其含义。
rule:: 规则：一条可检查的写法规定。
example:: 示例：用一个具体场景说明抽象判断。
convention:: 约定：声明本书的 role、rel、字段取值或字段。

[.convention, declares=relations]
=== 关系谓词

depends-on:: 当前标题的判断、规则或操作以目标标题为依据。
illustrates:: 当前标题提供目标标题的示例。
----

`declares` 的取值说明描述列表里的 term 是什么：

[horizontal]
roles:: role 名称。写作时用在 `[.concept]` 的位置。
relations:: rel 谓词。写作时用在 `rel=depends-on` 的位置。
values:: 某个 role 的某个 attrlist 字段允许的取值。`for` 写这个 role，`field` 写字段名。带这个 role 的标题必须写这个字段，取值在列表中。
fields:: 某个 role 的标题下第一个描述列表里必须写出的字段。`for` 写这个 role。写在 attrlist 里的同名字段不算。

字段取值和字段用同样的写法声明：

[source,asciidoc]
----
[.convention, declares=values, for=rule, field=verdict]
==== 规则的判定

adopt:: 照搬：理由成立，形式也照搬。
adapt:: 改写：理由成立，形式换成本项目更顺手的写法。
skip:: 不搬：只服务于原来的处境。

[.convention, declares=fields, for=rule]
==== 规则的格式

情况:: 在什么情况下。
规则:: 发生什么。
出处:: 依据的源文件与行号。
----

`规则的判定` 说明：带 `.rule` 的标题写 `verdict` 字段，取值是 `adopt`、`adapt` 或 `skip`。`规则的格式` 说明：带 `.rule` 的标题，标题下的描述列表写出 `情况`、`规则` 和 `出处`。xref:附加字段[] 中的 `关闭标签` 就是一条符合这两项声明的规则；它多写的 `判定` 字段不在声明里，声明只规定必须写出的字段。

声明的写法：

* term 写词本身：写 `concept`，不写 `.concept`，也不加反引号。term 就是写作时使用的那个词。
* 声明的描述列表紧跟在声明标题之下，与标题之间没有别的块（段落、提示块、图片等）；它不带 `[horizontal]` 等 style，也不带 ID、块标题或其他块属性，条目里不嵌套描述列表。违反任何一条，整串描述列表都是正文，声明标题读不出任何词。导语写在上一级标题里。
* 一个声明标题只声明一种内容。同一个 role 的取值和字段分开声明。
* `convention` 本身也写进 role 词表，因为声明标题使用这个 role。

声明通常放在读者最先读到约定的地方，例如前言里的“本书的书写约定”一节；某个 role 的格式也可以放在最先使用这个 role 的部分。工具按 `.convention` role 找到声明，不依赖位置。

检查脚本读出声明以后，对每个带 role 的标题核对：

* role 在 role 词表中。
* `declares=values` 声明的字段写在标题 attrlist 里，取值在列表中。没有声明的附加字段（如 `owner`）不受约束；`.convention` 标题例外，它只带 `declares`、`for` 和 `field`。
* `declares=fields` 声明的字段全部写在标题下的第一个描述列表里。

正文中的每个 xref，若带 `rel`，谓词在关系谓词词表中。约定变化时只改声明，检查跟着变。

--- NUL
+++ b/templates/default-workspace/books/07-structured-writing-conventions/parts/030-fields-and-terminology/_partintro.adoc
@@ -0,0 +1,1 @@
字段补充标题与引用已经表达的内容；术语表统一全书采用的名称；约定声明把本书的 role、rel 和字段写成工具可读的词表。

--- NUL
+++ b/templates/default-workspace/books/07-structured-writing-conventions/book.adoc
@@ -0,0 +1,73 @@
= 结构化书写约定标本
作者 <author@example.com>
v0.1, 2026-05
:doctype: book
:toc: left
:toclevels: 3
:sectnums:
:partnums:
:part-signifier: Part
:appendix-caption: 附录
:icons: font
:experimental:
:idprefix:
:idseparator: -

include::../../shared/attributes.adoc[]

[colophon]
include::frontmatter/colophon.adoc[]

[dedication]
include::frontmatter/dedication.adoc[]

[preface]
include::frontmatter/preface.adoc[]

[acknowledgments]
include::frontmatter/acknowledgments.adoc[]

= 从源文档看结构

[partintro]
include::parts/010-source-surface/_partintro.adoc[]

include::parts/010-source-surface/010-source-and-projection.adoc[]

include::parts/010-source-surface/020-heading-address-and-xref.adoc[]

include::parts/010-source-surface/030-source-order-notation.adoc[]

= 名称、角色与关系

[partintro]
include::parts/020-names-roles-and-relations/_partintro.adoc[]

include::parts/020-names-roles-and-relations/010-names-and-addresses.adoc[]

include::parts/020-names-roles-and-relations/020-heading-roles.adoc[]

include::parts/020-names-roles-and-relations/030-relation-predicate.adoc[]

= 字段与术语

[partintro]
include::parts/030-fields-and-terminology/_partintro.adoc[]

include::parts/030-fields-and-terminology/010-surface-fields.adoc[]

include::parts/030-fields-and-terminology/020-consistent-terms.adoc[]

include::parts/030-fields-and-terminology/030-declaring-conventions.adoc[]

[appendix]
include::backmatter/appendix-quick-reference.adoc[]

[appendix]
include::backmatter/appendix-decision-trees.adoc[]

[glossary]
include::backmatter/glossary.adoc[]

[bibliography]
include::backmatter/bibliography.adoc[]

</file_contents>

</document>
