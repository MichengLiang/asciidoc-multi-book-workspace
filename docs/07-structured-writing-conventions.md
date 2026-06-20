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
| 总大小 | 26.5 KB |
| 总行数 | 690 |

</summary_stats>

<directory_tree>

```
└── 07-structured-writing-conventions
    ├── book.adoc (1.5 KB)
    ├── backmatter
    │   ├── appendix-a.adoc (3.6 KB)
    │   ├── appendix-b-decision-trees.adoc (6.9 KB)
    │   ├── bibliography.adoc (0.6 KB)
    │   ├── glossary.adoc (1.1 KB)
    │   └── index.adoc (1.2 KB)
    ├── frontmatter
    │   ├── abstract.adoc (0.2 KB)
    │   ├── acknowledgments.adoc (0.1 KB)
    │   ├── colophon.adoc (0.2 KB)
    │   ├── dedication.adoc (0.1 KB)
    │   └── preface.adoc (1.1 KB)
    └── parts
        ├── 010-source-surface
        │   ├── 010-source-and-projection.adoc (3.0 KB)
        │   ├── 020-default-semantics.adoc (1.3 KB)
        │   ├── 030-source-order-notation.adoc (1.4 KB)
        │   └── _partintro.adoc (0.1 KB)
        ├── 020-identity-and-relation
        │   ├── 010-role-identity.adoc (0.7 KB)
        │   ├── 020-relation-predicate.adoc (1.2 KB)
        │   └── _partintro.adoc (0.3 KB)
        └── 030-fields-and-lookup
            ├── 010-surface-fields.adoc (1.3 KB)
            ├── 020-index-and-glossary.adoc (0.5 KB)
            └── _partintro.adoc (0.1 KB)
```

</directory_tree>

<file_contents>

--- NUL
+++ b/backmatter/appendix-a.adoc
@@ -0,0 +1,80 @@
[#structured-writing-quick-reference]
= 附录 A：结构化写法速查

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
|Part 目录的源文件编排号。使用统一的三位数 `0X0` 格式。`X` 为顺序号，首个 `0` 为前导零，末尾 `0` 为插入预留。

|`010-opening.adoc`
|Chapter 文件的源文件编排号。规则与 Part 目录编排号一致。

|`[#stable-id]`
|为标题声明一个稳定的引用地址。稳定 ID 仅当以下两个条件同时满足时才需显式声明：
(1) 该标题被至少一个 `xref` 交叉引用；
(2) 标题文本本身可能变更或在全书范围内可能重复。
若标题本身已是领域内唯一且稳定的标识符（如专有名词、唯一实体名、标准化编号），即使被交叉引用，也无需额外声明稳定 ID——标题文本即地址。

|`[#stable-id.concept]`
|声明稳定 ID，并用 role 标明标题身份。
需要能够回答： “这个标题在整本书的知识体系中扮演什么认知功能”

|`[#example.example, owner=writing-team]`
|role 声明标题身份；named attributes 保留附加字段。

|`summary::` + 下一行说明文本
|标题下描述列表字段。用于较多字段或多行字段值。

|`xref:stable-id[显示文本]`
|显示为链接，投影为 references。

|`xref:stable-id[显示文本, rel=depends-on]`
|显示为链接，同时声明 depends-on 关系。

|`indexterm2:[role]`
|正文可见索引词。

|`indexterm:[relation predicate]`
|正文隐藏索引词。
|===

全书标题需要保持 `标题层级连续`。

role 描述标题身份。rel 描述 xref 边上的关系谓词。附加字段可以写在标题 attrlist、标题下描述列表或 xref named attributes 中。

`[appendix]`、`[glossary]`、`[bibliography]` 和 `[index]` 是 section style。它们改变紧随其后 section 的语义；标题层级仍由 `=` 数量决定。

对于跨文件的交叉引用，为了避免重复编写相对路径，你可以在文档的头部（Header）定义一个文档属性（Document Attribute）来存储这个基础路径。

你可以在主文档的开头定义一个变量（比如 `:book-b-dir:`），后续引用时通过 `{book-b-dir}` 来调用它。

如果你的建模中存在需要对一段区域精准指向、提及的情况，可以考虑使用 **更小一级/更小一节** 的标题把这段区域划分出来，之后就可以继续使用 `xref` 进行交叉引用。

如果文章中出现 Asciidoc 自己的语法，通过反引号包裹依然会被解析，必须使用 pass:[] 宏才可以表达透传，不会被解析，使用反引号包裹可以获得字体样式。

如果遇到“代码/日志”与其“文字解释”需要分离的场景，可以考虑使用 Asciidoc 的 Callouts。

结构化写法的选择由当前对象、引用需求、投影需求和维护成本共同决定。具体判定流程见 xref:structured-writing-decision-trees[附录 B：结构化写法决策树]。

--- NUL
+++ b/backmatter/appendix-b-decision-trees.adoc
@@ -0,0 +1,166 @@
[#structured-writing-decision-trees]
= 附录 B：结构化写法决策树

== 标题生成与层级拓扑控制

触发场景:: 作者准备在源文档中创建新的标题节点。

[source,text]
----
1. 当前标题是否为文档大标题？
   ├─ 是：使用 `= 书名`，并放置于文档首行。流程结束。
   └─ 否：评估逻辑层级。

2. 当前标题与紧邻上级标题的层级关系是否连续？
   ├─ 否：补充中间层级标题，保持标题层级连续；回到节点 2 重新评估。
   └─ 是：评估区域划分。

3. 当前标题下的文本区域后续是否需要被精准指向或提及？
   ├─ 是：使用更小一级标题将该区域独立划分，后续用 xref 指向该标题。流程结束。
   └─ 否：评估 section style。

4. 当前标题是否承载附录、术语表、参考文献或索引等后置结构？
   ├─ 是：在等号标题上方声明对应 section style：
   │      `[appendix]`、`[glossary]`、`[bibliography]` 或 `[index]`。
   │      section style 改变紧随其后 section 的语义；标题层级仍由 `=` 数量决定。
   │      流程结束。
   └─ 否：写入标准等号标题。流程结束。
----

== stable ID 的生命周期与寻址机制

触发场景:: 作者评估是否需要为当前标题显式声明寻址 ID。

[source,text]
----
1. 当前标题文本是否已是领域内唯一且稳定的标识符？
   ├─ 是：不声明 `[#stable-id]`；直接使用标题文本作为引用地址。流程结束。
   └─ 否：评估交叉引用状态。

2. 该标题在全书范围内是否被至少一个 `xref` 交叉引用？
   ├─ 否：不声明 `[#stable-id]`。流程结束。
   └─ 是：在等号标题上方的 attrlist 中显式声明 `[#stable-id]`。流程结束。
----

触发场景:: 项目全局构建或审查阶段检查 stable ID 消费状态。

[source,text]
----
1. 扫描源文件中所有手工显式声明的 `[#stable-id]`。
   ├─ 每个 ID 对应的 xref 引用次数 >= 1：保留声明，审查通过。
   └─ 某个 ID 对应的 xref 引用次数 == 0：移除该 `[#stable-id]` 声明。
----

== role 的作用域与语境管理

触发场景:: 作者为标题标记认知功能与身份语义。
前提:: 当前书稿已经约定 role 受控词表，例如 `.concept`、`.rule`、`.example`。

[source,text]
----
1. 当前标题是否为其父标题的下级标题？
   ├─ 否：从受控词表中选取匹配当前语境的 role，写入标题 attrlist。流程结束。
   └─ 是：评估语境连续性。

2. 当前子标题承载的认知角色是否与父标题声明的 role 相同？
   ├─ 是：不重复声明 role；下级标题默认属于同一角色范围。流程结束。
   └─ 否：从受控词表中选取匹配新语境的 role，显式写入当前标题 attrlist。
          该声明完成语境切换。流程结束。
----

== xref 与 rel 关系谓词建立

触发场景:: 作者在正文中写入指向其他标题节点的交叉引用。

[source,text]
----
1. 当前引用是否跨越 `= 书名`、`= 卷/部`、`== 章` 等大跨度指代？
   ├─ 是：手动写入 `xref`，平衡隐式上下文的阅读压力；进入关系评估。
   └─ 否：评估文件位置。

2. 目标标题是否位于不同的物理源文件中？
   ├─ 是：在文档头部定义文档属性存储基础路径；
   │      后续通过该属性调用基础路径进行跨文件引用；进入关系评估。
   └─ 否：进入关系评估。

3. 引用目的是什么？
   ├─ 表达阅读顺序、先读建议或普通参见：
   │      写入普通 xref，例如 `xref:target-id[显示文本]`。
   │      投影为默认谓词 `aat:references`。流程结束。
   └─ 声明明确的逻辑关系边：选取 `rel` 谓词。

4. 根据全书约定的关系谓词选择 `rel`。
   ├─ 当前标题的判断、规则或操作以目标标题为依据：使用 `rel=depends-on`。
   ├─ 当前标题提供目标标题的示例：使用 `rel=illustrates`。
   ├─ 当前标题给出目标标题所代表对象的定义：使用 `rel=defines`。
   └─ 当前标题对目标标题的合法写法或范围施加约束：使用 `rel=constrains`。
----

== surface field 落位策略

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
          例如 `key:: value`。流程结束。
----

== 源文件物理编排与编号运算

触发场景:: 作者为 Part 目录或 Chapter 源文件生成文件编排号。
前提:: Part 目录和 Chapter 文件统一使用三位数 `0X0` 格式；初始序列步长为 10，例如 `010`、`020`、`030`。

[source,text]
----
1. 新文件在逻辑序列中的位置是什么？
   ├─ 位于当前既有序列的最后方：执行末尾追加。
   └─ 位于当前既有文件 A 与文件 B 之间：执行中间插入。

2. 末尾追加：
   提取当前同级列表中的最大编号，将其十位数字加 1，个位保持 0。
   流程结束。

3. 中间插入：
   提取上文文件 A 和下文文件 B 的编号，计算两者的算术中间值。
   例如在 `010` 与 `020` 之间插入，使用 `015`。
   流程结束。
----

== index term 落位

触发场景:: 作者为读者检索和书后索引添加索引入口。

[source,text]
----
1. 索引目标词是否已经自然出现在当前正文句子中？
   ├─ 是：使用正文可见索引词宏 `indexterm2:[<primary>]` 包裹该词。
   │      正文保持可见，同时提取为一级索引项。流程结束。
   └─ 否：使用正文隐藏索引词宏 `indexterm:[<primary>]`。
          按需使用多级形式，例如 `indexterm:[<primary>, <secondary>]`。
          隐藏索引词贴近相关段落内容，放在相关句子末尾。流程结束。
----

== 语法透传与 callouts

触发场景:: 作者书写代码、日志或工具语法文本。

[source,text]
----
1. 正文中是否出现 AsciiDoc 原生语法字符，且需要阻止其被解析引擎渲染？
   ├─ 是：使用 `pass:[]` 宏包裹该内容。
   │      若需要代码字体样式，在外层叠加反引号包裹。流程结束。
   └─ 否：评估解释关联。

2. 当前是否为代码或日志结构，且配有单独的文字解释？
   ├─ 是：使用 AsciiDoc callouts 标注代码或日志与解释之间的关联。流程结束。
   └─ 否：正常书写。流程结束。
----

--- NUL
+++ b/backmatter/bibliography.adoc
@@ -0,0 +1,8 @@
= 参考坐标

以下资料提供 AsciiDoc 标题、交叉引用、元素属性和描述列表的参考坐标。

* [[[asciidoctor-xref]]] Asciidoctor Docs, Cross References, https://docs.asciidoctor.org/asciidoc/latest/macros/xref/
* [[[asciidoctor-attributes]]] Asciidoctor Docs, Element Attributes, https://docs.asciidoctor.org/asciidoc/latest/attributes/element-attributes/
* [[[asciidoctor-description-lists]]] Asciidoctor Docs, Description Lists, https://docs.asciidoctor.org/asciidoc/latest/lists/description/
* [[[asciidoctor-sections]]] Asciidoctor Docs, Sections, https://docs.asciidoctor.org/asciidoc/latest/sections/

--- NUL
+++ b/backmatter/glossary.adoc
@@ -0,0 +1,18 @@
= 术语表

本术语表记录结构化书写约定中的核心术语。

[glossary]
heading:: 使用等号标题创建的书稿结构单位。
stable ID:: 作者为标题显式声明的稳定引用地址，语法为 `[#id]`。
仅当标题被交叉引用、且标题文本自身不能保证全局唯一和不变时才需使用。
若标题文本已是领域内唯一的稳定标识符（如实体名称、标准化编号），
标题文本本身即承担 stable ID 的寻址功能，无需额外声明。
source-order notation:: 写在源文件路径表面的排序符号。
role:: 标题身份标记，例如 `.concept` 或 `.rule`。
ordinary reference:: 普通 xref。投影时使用默认谓词 `aat:references`。
relation predicate:: xref `rel` 字段选择的边谓词。
source heading:: xref 所在的标题。
target heading:: xref selector 指向的标题。
surface field:: 源文档表面的附加字段。标题字段可来自标题 attrlist 或标题下描述列表；xref 边字段来自 xref named attributes。
index term:: 服务书后索引和读者检索的索引入口。

--- NUL
+++ b/backmatter/index.adoc
@@ -0,0 +1,39 @@
= 索引

索引 section 位于书籍后置区域。正文中的索引词宏是索引词来源。

AsciiDoc 区分正文可见索引词和正文隐藏索引词：

[cols="1,2", options="header"]
|===
|写法 |含义

|`indexterm2:[<primary>]`
|正文可见，同时作为一级索引项。

|`indexterm:[<primary>]`
|正文不可见，作为一级索引项。

|`indexterm:[<primary>, <secondary>]`
|正文不可见，作为二级索引项。

|`indexterm:[<primary>, <secondary>, <tertiary>]`
|正文不可见，作为三级索引项。
|===

正文中已经出现该词时，优先使用正文可见索引词。需要补充未出现在正文里的索引入口时，使用正文隐藏索引词。

隐藏索引词应贴近它标记的段落内容。本书把隐藏索引词放在相关句子末尾。

Asciidoctor 的内置 HTML5 转换器不会自动生成索引目录。`[index]` section 是 PDF 和 DocBook 工具链自动填充索引目录的种子位置；在本 HTML 样本中，它展示后置索引章节的位置和索引词写法。

本书正文中的索引词示例：

[source,asciidoc]
----
indexterm2:[role]
indexterm:[relation predicate]
indexterm:[源文件编排号]
indexterm:[中间值插入]
indexterm:[描述列表]
----

--- NUL
+++ b/frontmatter/abstract.adoc
@@ -0,0 +1,3 @@
== 摘要

本书展示标题、稳定 ID、role、xref、rel 和附加字段形成可读、可维护、可投影的源文档的方式。作者可按写作目的选择其中写法。

--- NUL
+++ b/frontmatter/acknowledgments.adoc
@@ -0,0 +1,3 @@
== 致谢

感谢 Asciidoctor 和 RDF 投影相关文档提供稳定术语和结构坐标。

--- NUL
+++ b/frontmatter/colophon.adoc
@@ -0,0 +1,5 @@
== 版本说明

本文档属于 `{series-name}`。colophon 位于书籍前置区域，记录本样本书的版本、来源或出版信息。

示例版本：v0.1。

--- NUL
+++ b/frontmatter/dedication.adoc
@@ -0,0 +1,3 @@
== 献辞

献给每一位愿意为自己写下的标题、引用和标记负责的作者。

--- NUL
+++ b/frontmatter/preface.adoc
@@ -0,0 +1,14 @@
== 前言

这本书按源文档写法组织。阅读时先看源文档片段和投影片段，再对照后续章节理解每个标记承担的职责。

实际书稿按写作目的选择这些写法。
长期引用且标题文本可能变更的标题使用稳定 ID；
若标题本身已是唯一且稳定的实体名称，标题文本直接作为引用地址。
带有明确身份的标题使用 role；表达关系的引用使用 rel；
随源稿保留的短字段使用 named attributes；字段较多或需要多行值的标题字段使用标题下描述列表。

业务含义由书稿自己的约定承载。本书展示同一份 AsciiDoc 源文本如何同时服务阅读、维护和工具链投影。

通过展示标题、稳定 ID、role、xref、rel 和附加字段如何形成可读、可维护、可投影的源文档，让你能够理解，你可以拥有一种这样的表达方式，可以按照某种约定，就能够提升你书籍的质量，能够让下游的工具链继续消费你的书。 你可以参考本书里你所需要的结构。
合适的结构能够提升书籍的可阅读、可维护性。你可以按写作目的选择其中写法。

--- NUL
+++ b/parts/010-source-surface/010-source-and-projection.adoc
@@ -0,0 +1,83 @@
[#source-and-projection]
== 源文本与投影

本章用一段示例展示结构化书写约定。Turtle 片段列出关键投影事实；完整投影还会保留 raw、路径、行号和边证据。
希望你能通过本章节的演示来理解你写下的文字能够给未来的你提供稳定的查询与导航结构。

[source,asciidoc]
----
= 结构化写作样例

[#regular-heading.concept]
== 常规标题

常规标题提供可引用的阅读单位。

[#basic-syntax.example]
=== 基本语法

基本语法是常规标题下的直接子标题。

[#xref-rule.rule]
== 引用规则

引用规则参见 xref:regular-heading[常规标题]。
引用规则依赖 xref:regular-heading[常规标题, rel=depends-on, weight=strong]。
----

源文档把 `常规标题` 写成可引用的阅读单位，在其下写出 `基本语法` 子标题，把 `引用规则` 写成规则说明，并在正文里写出参见和依赖两种引用。

Turtle 示例中的 `<urn:aat:doc:...#heading-*>` 和 `<urn:aat:doc:...#xref-edge-*>` 表示投影生成的 IRI；`aat:addressLabel` 保留源文档中的寻址 label。

[source,turtle]
----
<urn:aat:doc:...#heading-l3-o0> a aat:Heading ;
  aat:headline "常规标题" ;
  aat:addressLabel "regular-heading" ;
  aat:role "concept" ;
  aat:containsDirectly <urn:aat:doc:...#heading-l8-o0> .

<urn:aat:doc:...#heading-l8-o0> a aat:Heading ;
  aat:headline "基本语法" ;
  aat:addressLabel "basic-syntax" ;
  aat:role "example" .

<urn:aat:doc:...#heading-l13-o0> a aat:Heading ;
  aat:headline "引用规则" ;
  aat:addressLabel "xref-rule" ;
  aat:role "rule" ;
  aat:references <urn:aat:doc:...#heading-l3-o0> ;
  rel:depends-on <urn:aat:doc:...#heading-l3-o0> .

<urn:aat:doc:...#xref-edge-l17-c8-o0> a aat:XrefEdge ;
  aat:rel "depends-on" ;
  aat:weight "strong" .
----

读者看源文档，能直接看到 [.concept]#常规标题# 是被引用的阅读单位，`基本语法` 是它的下级标题， [.rule]#引用规则# 说明引用写法。投影读取同一份源文档，为标题生成 IRI，并在标题节点上保留 `aat:headline`、`aat:addressLabel` 和 `aat:role`；标题层级投影为 `aat:containsDirectly`，xref 投影为 `aat:references` 和 `rel:depends-on`。

[source,asciidoc]
----
[.concept]
== 林黛玉

林黛玉是……她与 xref:贾宝玉[rel=love] 有木石前盟。
----

此处的 `pass:[xref:贾宝玉]` 直接使用标题文本作为寻址地址，
因为“贾宝玉”在本书范围内唯一且不会变更为其他名称。
交叉引用宏语法是 `pass:[xref:target-id[optional-display-text]]` ，所以这里省略了别名，渲染引擎默认会展示标题文字。

'''

再来看看这样的场景： 标题是编号型标识符，且被交叉引用

例如： `REQ-2024-0088`、`TC-AUTH-032`、`ADR-2024-015`，他们的标题本身就是编号，是人为设计的全局唯一标识符， 需要尊重他的原来的结构与语义。

[source,asciidoc]
----
[.requirement, category=性能]
== REQ-2024-0088
----

引用时可以这样： `pass:[xref:REQ-2024-0088[REQ-2024-0088, rel=constrains]]`

--- NUL
+++ b/parts/010-source-surface/020-default-semantics.adoc
@@ -0,0 +1,47 @@
[#heading-and-xref]
== 标题与引用

等号行声明标题和层级。标题前的 attrlist 承载地址、role 和字段。

[source,asciidoc]
----
[#regular-heading.concept]
== 常规标题
----

`[#regular-heading]` 声明一个稳定地址。 `.concept` 标明标题身份。 `常规标题` 是标题文本。

[source,asciidoc]
----
引用规则参见 xref:regular-heading[常规标题]。
----

该 xref 投影为 `aat:references`，即默认引用谓词。

[source,asciidoc]
----
引用规则依赖 xref:regular-heading[常规标题, rel=depends-on]。
----

`rel=depends-on` 声明从当前标题到目标标题的依赖关系，投影为 `rel:depends-on`。

[TIP]
====
1. 全书中手工声明的稳定地址至少需要一个 `xref` 消费。写法速查见 xref:structured-writing-quick-reference[附录 A：结构化写法速查]；完整判断流程见 xref:structured-writing-decision-trees[附录 B：结构化写法决策树]。
2. 按照书籍结构，跨越 `= 书名`、`= 卷/部`、`== 章` 这些大跨度的指代均需要使用 `xref` 手动标注，平衡隐式上下文的阅读压力。
====

标题声明角色后，其下级标题默认属于同一角色范围。下级标题可声明不同角色以切换语境。

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
+++ b/parts/010-source-surface/030-source-order-notation.adoc
@@ -0,0 +1,36 @@
[#source-order-notation]
== 源文件编排号

源文件编排号写在 part 目录名和 chapter 文件名前部。indexterm:[源文件编排号]

Part 目录和 Chapter 文件统一使用三位数 `0X0` 格式进行编排。

* 初始序列以 `10` 为步长：`010`、`020`、`030`……
* 十位数字（`X`）用于线性递增，以追加新内容。
* 个位数字（`0`）预留空间用于中间插入。

[source,text]
----
parts/010-source-surface/
parts/015-new-topic/       <1>
parts/020-identity-and-relation/

010-opening.adoc
015-new-context.adoc       <2>
020-main-flow.adoc
----
<1> 使用 `015` 在 `010` 和 `020` 两个 Part 之间插入。
<2> 使用 `015` 在 `010` 和 `020` 两个 Chapter 之间插入。

**操作规则：**

作者需要两个原子操作：

. **末尾追加**：取当前最大编号，将其十位数字加 `1`，个位保持 `0`。例如，`090` 之后是 `100`。
. **中间插入**：在 A 与 B 之间插入时，新编号取 A 和 B 的**算术中间值**。例如，在 `010` 与 `020` 之间插入，使用 `015`。此策略可确保插入后仍为后续插入保留最大空间。

使用三位数 `0X0` 格式，能够解决书籍动态维护过程中编号格式的稳定。

标题文本保留语义名称。长期引用的标题使用显式 ID。

编排号帮助维护者观察源文件顺序；显式 ID 帮助读者和工具链稳定引用标题。

--- NUL
+++ b/parts/010-source-surface/_partintro.adoc
@@ -0,0 +1,1 @@
本部从一段源文档出发，展示读者看到的写作意图和投影得到的结构事实。

--- NUL
+++ b/parts/020-identity-and-relation/010-role-identity.adoc
@@ -0,0 +1,35 @@
[#role-identity]
== role 身份

role 写在标题 attrlist 的点号 token 位置。

[source,asciidoc]
----
[#regular-heading.concept]
== 常规标题

[#xref-rule.rule]
== 引用规则
----

`#regular-heading` 和 `#xref-rule` 是稳定 ID， `.concept` 和 `.rule` 是 indexterm2:[role]， 标明标题身份。

[cols="1,2", options="header"]
|===
|写法 |读者看到的身份

|`[.concept]`
|标记概念说明。

|`[.rule]`
|标记规则说明。

|`[.example]`
|标记示例。
|===

role 的职责，是在全书范围内保持身份含义的稳定。

一本书使用的 role 种类和数量，取决于该领域的概念结构。每种 role 的语义在全书中保持唯一。

读者和工具链可以依据 role 进行导航文本和提取结构。

--- NUL
+++ b/parts/020-identity-and-relation/020-relation-predicate.adoc
@@ -0,0 +1,24 @@
[#relation-predicate]
== rel 关系谓词

indexterm:[relation predicate] `rel` 是 xref 边上的关系谓词。包含 xref 的标题是关系起点，xref 指向的标题是关系终点。本书把这两个位置称为 source heading 和 target heading。

[source,asciidoc]
----
引用规则参见 xref:regular-heading[常规标题]。
引用规则依赖 xref:regular-heading[常规标题, rel=depends-on]。
----

第一行投影为 `aat:references`，即默认引用谓词。第二行声明 `rel=depends-on`，投影为 `rel:depends-on`。

`rel` 可以被读者和工具当作关系谓词，所以在全书范围内，每种 `rel` 谓词的语义需要保持唯一且不变。

[horizontal]
depends-on:: 当前标题的判断、规则或操作以目标标题为依据。阅读顺序和先读建议使用普通 xref 表达。
illustrates:: 当前标题提供目标标题的示例。
defines:: 当前标题给出目标标题所代表对象的定义。
constrains:: 当前标题对目标标题的合法写法或范围施加约束。

关系谓词描述标题之间的边。标题自身的身份使用 role 表达。

标题之间的阅读顺序和先读建议，使用普通 xref（默认 `aat:references`）表达。

--- NUL
+++ b/parts/020-identity-and-relation/_partintro.adoc
@@ -0,0 +1,1 @@
本部展示标题身份和引用关系。role 标明标题身份；rel 标明引用关系。 在书籍中，你需要主动根据你当前所建模的概念结构对各类词表（`role`、`rel` 或者其他更多）进行建模与约定，需要专门的词表约定章节清晰的写出你需要使用的受控词表，方便后续的使用。

--- NUL
+++ b/parts/030-fields-and-lookup/010-surface-fields.adoc
@@ -0,0 +1,35 @@
[#surface-fields]
== 附加字段

附加字段是写在源文档表面的键值信息。标题字段可以写在标题 attrlist 或标题下描述列表中；xref 边证据字段写在 xref named attributes 中。

[source,asciidoc]
----
[#example.example, owner=writing-team]
== 示例

示例说明 xref:regular-heading[常规标题, rel=illustrates, weight=strong]。
----

`.example` 是 role。`owner=writing-team` 是标题附加字段。`weight=strong` 是 xref 边证据上的附加字段。

`owner=writing-team` 写在标题 attrlist 中，投影时成为标题字段。`weight=strong` 写在 xref 中，投影时成为边证据字段。

标题字段较少且值较短时，写在标题 attrlist 中。标题字段较多，或字段值需要换行时，写在标题下的第一个连续描述列表中。indexterm:[描述列表]

[source,asciidoc]
----
[#rule.example, status=active]
== 示例规则

priority:: normal
summary::
示例规则说明标题字段的描述列表写法。
多行说明保留为同一个标题字段。

示例规则正文从这里开始。
----

`priority:: normal` 和 `summary::` 属于 `示例规则` 标题的附加字段。投影时它们成为标题字段，例如 `aat:priority` 和 `aat:summary`。

字段名和字段值来自本书自己的约定。同一本书使用附加字段时，应保持字段写法和字段含义稳定。

--- NUL
+++ b/parts/030-fields-and-lookup/020-index-and-glossary.adoc
@@ -0,0 +1,14 @@
[#index-and-glossary]
== 索引词与术语表

索引词帮助读者在书后找到词。术语表解释本书采用的词。role 标明标题身份，rel 标明引用关系。

正文里已经自然出现该词时，使用可见索引词标记。需要补充未出现在正文里的索引入口时，使用隐藏索引词。

[source,asciidoc]
----
indexterm2:[role]
indexterm:[relation predicate]
----

稳定术语帮助作者、读者和维护者使用同一组词理解源文档。

--- NUL
+++ b/parts/030-fields-and-lookup/_partintro.adoc
@@ -0,0 +1,1 @@
本部展示字段、索引词和术语表。字段随源文档保留；索引词和术语表帮助读者找词、解词。

--- NUL
+++ b/book.adoc
@@ -0,0 +1,74 @@
= 结构化书写约定标本
作者 <author@example.com>
v0.1, 2026-05
:doctype: book
:toc: left
:toclevels: 3
:sectnums:
:partnums:
:part-signifier: Part
:icons: font
:experimental:
:idprefix:
:idseparator: -

include::../../shared/attributes.adoc[]

[abstract]
include::frontmatter/abstract.adoc[]

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

include::parts/010-source-surface/020-default-semantics.adoc[]

include::parts/010-source-surface/030-source-order-notation.adoc[]

= 给标题和引用加意图

[partintro]
include::parts/020-identity-and-relation/_partintro.adoc[]

include::parts/020-identity-and-relation/010-role-identity.adoc[]

include::parts/020-identity-and-relation/020-relation-predicate.adoc[]

= 字段、索引与术语

[partintro]
include::parts/030-fields-and-lookup/_partintro.adoc[]

include::parts/030-fields-and-lookup/010-surface-fields.adoc[]

include::parts/030-fields-and-lookup/020-index-and-glossary.adoc[]

[appendix]
include::backmatter/appendix-a.adoc[]

[appendix]
include::backmatter/appendix-b-decision-trees.adoc[]

[glossary]
include::backmatter/glossary.adoc[]

[bibliography]
include::backmatter/bibliography.adoc[]

[index]
include::backmatter/index.adoc[]

</file_contents>

</document>
