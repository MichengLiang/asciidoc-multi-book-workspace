# AsciiDoc 书籍双阅读视图正式规约汇总

本文定义 `asciidoc-multi-book-workspace` 的书籍双阅读视图。本文面向接手实现的开发者。开发者按照本文实现该功能，不需要回看前两次弹窗讨论来推断对象边界。

## 1. 对象名称

对象名称：书籍双阅读视图。

英文内部名：`multi-book-reader`。

公共用户文案采用“连续”和“页面”两个视图名称。

“连续”表示 Asciidoctor book HTML 的原始长卷阅读投影。

“页面”表示基于 AsciiDoc book 语义生成的虚拟页面阅读投影。

## 2. 对象目标

书籍双阅读视图使同一份 AsciiDoc book 在同一个 `book.html` 中提供两种阅读投影。

连续视图保留整本书从上到下滚动阅读。

页面视图把整本书按书籍语义切成虚拟页面，并提供全书页面导航、当前页目录、上一页、下一页。

两种视图共享同一份源书、同一个生成 HTML、同一组内容 anchor、同一套静态资源。

## 3. 输入事实

当前项目是 `create-asciidoc-multi-book-workspace`。

当前运行时源码位于 `src/runtime/adoc-books.mts`。

生成工作区中每本书的入口为 `books/<book-id>/book.adoc`。

每本书输出为 `build/html/books/<book-id>/book.html`。

生成工作区根目录含有 `catalog.adoc`、`books/`、`shared/`、`tools/adoc-books.mjs`。

`books/<book-id>/book.adoc` 可以 include book 目录内文件，也可以 include workspace 级共享文件，例如 `../../shared/attributes.adoc`。

因此，解析书籍 include 图时的 `documentRoot` 是生成工作区根目录，不是单本书目录。

## 4. 必须引入的依赖

生成工作区必须直接依赖 `asciidoc-abundant-tree`。

依赖版本使用 npm 当前最新版本。已验证 `pnpm view asciidoc-abundant-tree version` 在当前时间返回 `0.1.14`。

生成工作区的 `package.json` devDependencies 必须包含：

```json
"asciidoc-abundant-tree": "0.1.14"
```

维护者仓库的开发依赖也必须包含同一版本，用于测试、预览构建和 TypeScript 编译。

该依赖不是浏览器运行时依赖。它只在 Node 构建阶段运行。

## 5. 依赖职责

`asciidoc-abundant-tree` 的职责是解析书籍入口和 include 图，生成源感知文档树。

运行时构建器使用它的 TypeScript object model，不使用 RDF 1.2 Turtle 或 JSON-LD 作为 page map 主路径。

原因是 page map 需要直接读取 section level、section style、children、ids、title、source path；这些字段已存在于 object model 中。

RDF 1.2 projection 不参与书籍双阅读视图的构建路径。

## 6. 构建期解析规则

对每本书执行：

```ts
parseAbundantTree({
  sourcePath: book.input,
  mode: "book-entry",
  documentRoot: rootDir,
})
```

`rootDir` 是生成工作区根目录。

`book.input` 是当前书的 `books/<book-id>/book.adoc` 绝对路径。

解析失败阻断构建。

include 越过 `documentRoot` 阻断构建。

`document.toolDiagnostics` 中 `level: "warning"` 的诊断不阻断构建。

`document.toolDiagnostics` 中 `level: "error"` 的诊断阻断构建。

构建器不把 warning 写进用户页面。构建器可以在控制台输出 warning，输出内容必须包含 book id、diagnostic code、diagnostic message。

## 7. Page Map 的身份

Page map 是构建期生成的 JSON 数据。

Page map 描述书籍语义页面序列。

Page map 不包含正文 HTML。

Page map 不复制 AsciiDoc 源正文。

Page map 不替代 Asciidoctor HTML。

Page map 被注入到对应 `book.html`：

```html
<script type="application/json" id="multi-book-page-map">...</script>
```

该 script 的内容必须经过 JSON 安全转义，禁止让 `<`、U+2028、U+2029 破坏 HTML script 上下文。

## 8. Page Map 顶层结构

Page map 顶层对象包含以下字段：

```ts
type ReaderPageMap = {
  version: 1;
  book: ReaderBookInfo;
  pages: ReaderPage[];
};
```

`version` 固定为 `1`。

`book` 描述当前书。

`pages` 是虚拟页面数组。数组顺序就是阅读顺序、左侧导航顺序、上一页/下一页顺序。

## 9. Book Info 结构

```ts
type ReaderBookInfo = {
  id: string;
  title: string;
  entry: string;
};
```

`id` 是 book id，即 `books/<book-id>` 的目录名。

`title` 来自 `AbundantDocument.title.text`。

`entry` 是入口文件相对生成工作区根目录的路径，例如：

```text
books/07-structured-writing-conventions/book.adoc
```

## 10. Page 结构

```ts
type ReaderPage = {
  id: string;
  kind: ReaderPageKind;
  title: string;
  anchors: string[];
  toc: ReaderTocItem[];
  source?: ReaderSourceSpan;
  parentPageId?: string;
  childPageIds?: string[];
};
```

`id` 是页面状态 ID。

`kind` 是页面语义种类。

`title` 是页面标题。

`anchors` 是该页面包含的 DOM anchor id 列表。

`toc` 是当前页目录。

`source` 是页面主语义单元的源坐标。合成页可以没有 source。

`parentPageId` 用于 chapter 指向所属 part。

`childPageIds` 用于 part 指向其 chapter pages。

## 11. Page Kind 枚举

```ts
type ReaderPageKind =
  | "cover"
  | "frontmatter"
  | "part"
  | "chapter"
  | "appendix"
  | "glossary"
  | "bibliography"
  | "index";
```

不得使用 `other`、`misc`、`unknown` 作为正常 page kind。

无法归类的顶层普通 section 归为 `chapter`。

## 12. Source Span 结构

```ts
type ReaderSourceSpan = {
  relativePath: string;
  startLine?: number;
  endLine?: number;
};
```

`relativePath` 使用相对生成工作区根目录的路径。

`startLine` 和 `endLine` 来自 abundant-tree section source span。

如果 line span 不存在，保留 `relativePath`，不编造行号。

## 13. Toc Item 结构

```ts
type ReaderTocItem = {
  title: string;
  anchor: string;
  depth: number;
};
```

`depth` 从 `0` 开始。

当前页面自身的顶部入口使用 `depth: 0`。

当前页面内部子标题按相对层级递增。

## 14. Cover Page 规则

每本书必须生成一个 cover page。

Cover page 是 `pages[0]`。

Cover page 的 `id` 固定为 `cover`。

Cover page 的 `kind` 固定为 `cover`。

Cover page 的 `title` 等于 `book.title`。

Cover page 的 `anchors` 固定为 `[]`。

Cover page 的 `toc` 固定为 `[]`。

Cover page 没有 `source`。

运行时在页面视图中为 cover page 渲染一个正文区域。该区域显示书名，并显示当前 HTML `#header .details` 中已有的作者、邮箱、版本、日期信息。

Cover page 不显示左侧 Asciidoctor TOC 的原始目录内容。

## 15. Frontmatter 识别规则

Frontmatter section 是 document 顶层 section，且满足：

```ts
section.level === 1
```

并且任一 metadata 节点存在：

```ts
metadata.attributes.style in [
  "abstract",
  "colophon",
  "dedication",
  "preface",
  "acknowledgments"
]
```

这些 section 按文档顺序合并为一个 frontmatter page。

如果没有 frontmatter section，不生成 frontmatter page。

Frontmatter page 的 `id` 固定为 `frontmatter`。

Frontmatter page 的 `kind` 固定为 `frontmatter`。

Frontmatter page 的 `title` 固定为 `前置`。

Frontmatter page 的 `anchors` 是所有 frontmatter section 的第一个 id 按顺序排列。

Frontmatter page 的 `toc` 包含每个 frontmatter section：

```ts
{ title: section.title, anchor: section.ids[0], depth: 0 }
```

Frontmatter page 没有 `source`，因为它是多个 section 的合成页面。

## 16. Part Page 识别规则

Part section 是 document 顶层 section，且满足：

```ts
section.level === 0
```

每个 part section 生成一个 part page。

Part page 的 `kind` 固定为 `part`。

Part page 的 `id` 为：

```ts
`part-${section.ids[0]}`
```

Part page 的 `title` 等于 section.title。

Part page 的 `anchors` 为 `[section.ids[0]]`。

Part page 的 `toc` 包含一个顶部入口：

```ts
{ title: "概述", anchor: section.ids[0], depth: 0 }
```

Part page 的 `source.relativePath` 来自 section.source.relativePath。

Part page 的 `source.startLine` 和 `source.endLine` 来自 section.source.span。

Part page 的 `childPageIds` 是该 part section 的直接 child sections 生成的 chapter page id 列表。

Part page 正文包含 part 标题和 part section 的非 section child 内容。当前样本书中该非 section child 是 partintro paragraph。

Part page 正文不包含其 child chapter 内容。

## 17. Chapter Page 识别规则

Chapter page 来源包括两种 section。

第一种：part section 的直接 child section。

第二种：document 顶层普通 section，该 section 不是 frontmatter style，不是 backmatter style，且不满足 `level === 0`。

每个 chapter section 生成一个 chapter page。

Chapter page 的 `kind` 固定为 `chapter`。

Chapter page 的 `id` 等于 section.ids[0]。

Chapter page 的 `title` 等于 section.title。

Chapter page 的 `anchors` 包含 section.ids[0] 和该 section subtree 中所有 child section 的第一个 id。

Chapter page 的 `toc` 包含顶部入口：

```ts
{ title: "概述", anchor: section.ids[0], depth: 0 }
```

然后包含该 section 的 child sections。直接 child section 的 `depth` 为 `1`。更深 child section 的 `depth` 按相对层级递增。

Chapter page 的 `source.relativePath` 来自 section.source.relativePath。

Chapter page 的 `source.startLine` 和 `source.endLine` 来自 section.source.span。

如果 chapter 属于某个 part，则 `parentPageId` 等于该 part page id。

## 18. Backmatter Page 识别规则

Backmatter section 是 document 顶层 section，且任一 metadata 节点存在：

```ts
metadata.attributes.style in [
  "appendix",
  "glossary",
  "bibliography",
  "index"
]
```

每个 backmatter section 独立生成一个 page。

Page kind 等于 metadata style。

Page id 等于 section.ids[0]。

Page title 等于 section.title。

Page anchors 包含 section.ids[0] 和 section subtree 中所有 child section 的第一个 id。

Page toc 生成规则与 chapter page 相同。

Page source 生成规则与 chapter page 相同。

## 19. 当前样本书的固定页面序列

对于 `07-structured-writing-conventions`，生成的 page title/kind 序列必须是：

1. `cover`：结构化书写约定标本
2. `frontmatter`：前置
3. `part`：从源文档看结构
4. `chapter`：源文本与投影
5. `chapter`：标题与引用
6. `chapter`：源文件编排号
7. `part`：给标题和引用加意图
8. `chapter`：role 身份
9. `chapter`：rel 关系谓词
10. `part`：字段、索引与术语
11. `chapter`：附加字段
12. `chapter`：索引词与术语表
13. `appendix`：附录 A：结构化写法速查
14. `glossary`：术语表
15. `bibliography`：参考坐标
16. `index`：索引

测试必须断言该序列。

## 20. HTML 注入位置

阅读视图 UI 注入到每个 book HTML。

注入发生在 HTML 转换和 asset copy 之后。

现有 `addBookControlsToBookHtml` 已向 `#toc.toc2` 内注入 home link 和复制纯文本按钮。该函数的职责需要拆分为组合函数，避免所有 CSS/JS 堆入一个模板字符串。

保持最终输出为单 HTML 文件。不生成外部 reader CSS 文件。不生成外部 reader JS 文件。

CSS 和 JS 可以在 TypeScript 源码中以函数返回字符串形式存在。

## 21. 左侧导航规则

左侧导航显示 page map 的 `pages`。

左侧导航位于现有 `#toc.toc2` 内。

左侧导航保留现有 home link。

左侧导航保留现有复制纯文本按钮。

左侧导航新增视图切换控件。

左侧导航新增页面树。

页面树按 `pages` 数组顺序渲染。

Part page 显示为顶层项。

属于 part 的 chapter page 显示在该 part 后方，并在视觉上缩进一级。

Frontmatter、appendix、glossary、bibliography、index 显示为顶层项。

页面树不折叠。

页面树当前项必须高亮。

页面树项点击后切换到页面视图，并显示对应 page。

## 22. 视图切换控件规则

视图切换控件包含两个选项：

```text
连续
页面
```

控件使用 button，不使用 select。

控件必须可通过键盘聚焦。

当前选项使用 `aria-pressed="true"` 或等价可访问状态表达。

切换到连续视图时，所有原正文节点可见，Asciidoctor 原始 TOC 可见，页面树隐藏，右侧当前页目录隐藏，底部分页隐藏，Asciidoctor footer 可见。

切换到页面视图时，只显示当前 page 对应正文节点，Asciidoctor 原始 TOC 隐藏，页面树显示，右侧当前页目录显示，底部分页显示，Asciidoctor footer 隐藏。

页面视图不得重新居中正文列。正文列沿用 Asciidoctor 左侧 TOC 布局中的内容起点；运行时只允许收窄最大宽度以避免正文块与右侧当前页目录重叠。

用户选择写入 localStorage，key 固定为：

```text
multi-book-reader-view
```

值只允许：

```text
continuous
paged
```

URL query 中的 `view` 优先于 localStorage。

`view=continuous` 打开连续视图。

`view=paged` 打开页面视图。

## 23. 当前 Page 状态规则

当前 page id 写入 URL query 参数：

```text
page=<page-id>
```

`page` 只在页面视图中生效。

`page` 缺失时，页面视图显示 `cover`。

`page` 指向不存在的 page id 时，页面视图显示 `cover`。

页面树点击、上一页、下一页、跨页 anchor 跳转都必须更新 `page` query。

更新 query 使用 History API，不触发整页刷新。

## 24. 正文显示规则

连续视图：

- `#content` 中原始书籍内容全部可见。
- cover 页脚本生成内容不可见。
- 页面视图专用的底部分页不可见。

页面视图：

- 只显示当前 page 所属内容。
- cover page 显示脚本生成的 cover 内容。
- frontmatter page 显示其 anchors 对应的所有 `.sect1` 节点。
- part page 显示 `h1.sect0` 和紧随其后的非 section 内容，直到下一个 `.sect1` 或下一个 `h1.sect0` 前停止。
- chapter/backmatter page 显示对应 anchor 所在的 `.sect1` 节点。
- 非当前 page 的原始内容使用 `hidden` 属性或等价 CSS 隐藏。

隐藏节点不得从 DOM 中删除。

隐藏节点不得被移动到其他容器。

## 25. DOM 定位规则

运行时使用 page map anchors 定位 DOM。

Chapter/backmatter 定位：

1. 取 page 的第一个 anchor。
2. 执行 `document.getElementById(anchor)`。
3. 找到最近的 `.sect1` ancestor。
4. 该 `.sect1` 是 page 主节点。

Frontmatter 定位：

1. 遍历 page.anchors。
2. 每个 anchor 定位到 h2。
3. 每个 h2 找最近 `.sect1`。
4. 所有 `.sect1` 按 page.anchors 顺序组成 page 节点集合。

Part 定位：

1. 取 page 的第一个 anchor。
2. 定位到 `h1.sect0`。
3. 从该 h1 开始收集 sibling。
4. 收集 h1 本身。
5. 收集 h1 后方连续 sibling，直到遇到 `.sect1` 或 `h1.sect0`。
6. 收集结果是 part page 节点集合。

Cover 定位：

1. 创建 `#multi-book-reader-cover`。
2. 从 `#header > h1` 读取书名。
3. 从 `#header > .details` 克隆书籍详情。
4. 页面视图 cover 状态显示该容器。

## 26. 右侧当前页目录规则

右侧目录容器由运行时创建。

桌面端右侧目录显示在正文右侧。

移动端右侧目录显示在正文顶部，使用 details/summary 折叠结构。

右侧目录标题固定为：

```text
本页内容
```

右侧目录项来自 current page 的 `toc`。

点击目录项时：

- 保持页面视图。
- 保持当前 page。
- 滚动到对应 anchor。
- 更新 URL hash 或 query 不强制要求；不得改变 `page` 值。

右侧目录不得显示整本书目录。

右侧目录不得显示其他 page 的 headings。

## 27. 底部分页规则

页面视图显示底部分页。

连续视图隐藏底部分页。

底部分页基于 `pages` 数组顺序。

第一个 page 没有上一页链接。

最后一个 page 没有下一页链接。

上一页链接显示：

```text
上一页
<previous page title>
```

下一页链接显示：

```text
下一页
<next page title>
```

点击上一页或下一页后：

- 切换 current page。
- 更新 `page` query。
- 滚动到正文顶部。
- 更新左侧当前项。
- 更新右侧目录。

## 28. Anchor 跳转规则

页面视图必须支持跨页 anchor。

运行时初始化时建立 `anchorToPageId` 映射。

映射来源是所有 pages 的 `anchors`。

点击 `a[href^="#"]` 时：

1. 读取目标 anchor。
2. 如果目标 anchor 不在 `anchorToPageId` 中，允许浏览器默认行为。
3. 如果目标 anchor 属于当前 page，滚动到目标元素。
4. 如果目标 anchor 属于其他 page，阻止默认行为，切换到目标 page，更新 `page` query，然后滚动到目标元素。

连续视图不拦截站内 anchor 跳转。

## 29. 样式规则

页面视图采用三栏信息架构：左侧全书页面树，中间正文，右侧当前页目录。

左侧使用现有 `#toc.toc2` 区域。

正文宽度在桌面端保持可读，最大正文行宽不得超过 `860px`。

代码块和表格允许横向滚动。

底部分页使用边框和文字层级表达，不使用大面积装饰卡片。

UI 色彩使用中性色和现有 teal hover 色系。当前已有 `#0f766e` 用于 home/copy hover，阅读视图沿用该强调色。

不得引入图片、装饰背景、渐变装饰、营销式 hero。

## 30. 响应式规则

宽度大于等于 `1024px` 时显示右侧目录栏。

宽度小于 `1024px` 时，右侧目录栏不占右侧列，改为正文顶部的折叠目录。

宽度小于 `768px` 时，左侧目录不得固定遮挡正文。

移动端页面视图必须满足：

- 视图切换按钮完整可见。
- 当前页面标题完整可读。
- 上一页/下一页按钮不横向溢出。
- 代码块横向滚动，不撑破 viewport。
- 正文不被 fixed sidebar 覆盖。

## 31. 构建输出规则

每个 book HTML 必须包含：

- 原 Asciidoctor 正文。
- 原 Asciidoctor TOC。
- home link。
- 复制纯文本按钮。
- `multi-book-page-map` JSON script。
- 阅读视图 CSS。
- 阅读视图 JS。

构建输出路径不变：

```text
build/html/books/<book-id>/book.html
```

不生成：

- `build/html/books/<book-id>/pages/*.html`
- reader 外部 JS 文件
- reader 外部 CSS 文件
- Astro/Starlight 项目文件

## 32. README 与设计文档更新规则

维护者 README 必须说明生成工作区包含 `asciidoc-abundant-tree`。

维护者 DESIGN.adoc 必须更新 Generated Workspace dependency contract。

模板工作区 README 必须说明 book HTML 有“连续”和“页面”两种阅读视图。

文档不得把页面视图描述为真实多页面站点。

文档不得把页面视图描述为 PDF/EPUB 式按屏幕分页。

## 33. 测试规则：依赖与模板

测试必须断言生成 workspace 的 package.json devDependencies 包含：

```json
"asciidoc-abundant-tree": "0.1.14"
```

测试必须断言 maintainer package boundary 包含运行时构建产物，且不要求额外 reader asset 文件进入包，因为 reader CSS/JS 内联在 runtime script 中。

## 34. 测试规则：Page Map

新增或更新测试必须构建 `07-structured-writing-conventions` 的 page map，并断言：

- `version === 1`
- `book.id === "07-structured-writing-conventions"`
- `book.title === "结构化书写约定标本"`
- `pages.length === 16`
- `pages[0].kind === "cover"`
- `pages[0].id === "cover"`
- `pages[1].kind === "frontmatter"`
- `pages[1].toc` 标题为 `摘要`、`版本说明`、`献辞`、`前言`、`致谢`
- 三个 part page 的 kind 均为 `part`
- `源文本与投影` 的 page kind 为 `chapter`
- `源文本与投影` 的 source relativePath 是 `books/07-structured-writing-conventions/parts/100-source-surface/010-source-and-projection.adoc`
- backmatter kinds 依次为 `appendix`、`glossary`、`bibliography`、`index`

## 35. 测试规则：HTML 注入

生成 `book.html` 后，测试必须断言：

- 存在 `id="multi-book-page-map"`
- 存在视图切换控件文案 `连续` 和 `页面`
- 存在页面树容器标记，例如 `data-multi-book-page-nav`
- 存在右侧目录容器标记，例如 `data-multi-book-page-toc`
- 存在底部分页容器标记，例如 `data-multi-book-pagination`
- 原复制纯文本按钮仍存在
- 原 home link 仍存在

## 36. 测试规则：浏览器行为

Playwright 测试必须打开生成的 `book.html`。

测试视口包括：

- `1280x900`
- `390x844`

桌面测试必须验证：

1. 默认加载连续视图时，多个章节同时可见。
2. 点击“页面”后，只显示 cover page。
3. 点击下一页后，显示“前置”。
4. 再点击下一页后，显示“从源文档看结构”。
5. 左侧当前项随 page 变化。
6. 右侧目录显示当前 page 的 toc。
7. 点击左侧“源文本与投影”后，正文显示该 chapter。
8. 点击跨页 anchor 时，页面切换到目标 anchor 所属 page。
9. 点击“连续”后，整本书正文恢复可见。

移动测试必须验证：

1. 页面视图可打开。
2. 正文没有被左侧 fixed TOC 覆盖。
3. 上一页/下一页按钮在 viewport 内。
4. 代码块不撑破 viewport。

## 37. 验收命令

实现完成后必须运行：

```bash
pnpm run build
pnpm run test
pnpm run pack:check
```

如果项目配置中 `pnpm run check` 包含上述命令，则运行：

```bash
pnpm run check
```

前端行为测试使用本项目已有 Playwright 能力。若测试脚本新增 Playwright 调用，必须纳入 `pnpm run test` 或被 `pnpm run check` 调用。

## 38. 禁止改变的合同

`build/html/books/<book-id>/book.html` 路径不变。

`catalog.html` 路径不变。

`index.html` redirect 行为不变。

`clean` 仍只删除 `build/`。

`check` 仍执行完整构建和验证。

现有 local HTML resource check 仍必须通过。

现有 xref contract check 仍必须通过。

## 39. 现有功能保持规则

home link 继续指向 catalog。

复制纯文本按钮继续复制当前书籍的 source bundle。该 bundle 优先来自 abundant-tree `document.sourceFiles`，并以 `// file: <relativePath>` 标记保留各源文件边界。

Clipboard 不可用时，复制纯文本按钮继续使用打开纯文本页 fallback。

页面视图不得破坏复制纯文本的数据源。

页面视图不得改写 `multi-book-source-data` script。

## 40. 实现单元划分

运行时源码中建立以下函数边界：

```ts
type ReaderPageMap = ...

function buildReaderPageMap(rootDir: string, book: BookEntry): ReaderPageMap
function addReaderUiToBookHtml(html: string, pageMap: ReaderPageMap): string
function readerStyles(): string
function readerScript(): string
```

`buildReaderPageMap` 只处理 abundant-tree document 到 page map 的转换。

`addReaderUiToBookHtml` 只处理 HTML 注入。

`readerStyles` 只返回 CSS。

`readerScript` 只返回浏览器 JS。

`addHomeLinks` 调用时生成 source bundle、生成 page map、注入 home/copy controls 和 reader UI。

函数命名可以按项目风格调整，但职责边界必须存在。

## 41. 运行时错误处理

如果 `book.html` 缺少 `#toc.toc2`，构建失败，错误消息包含 book id 和 `missing left TOC container`。

如果 abundant-tree 解析 book entry 时抛出异常，运行时输出 warning，使用 cover-only page map 和 fallback source bundle 继续构建。

如果 abundant-tree 已返回 document 但包含 error 级 diagnostic，构建失败，错误消息包含 book id、diagnostic code 和 diagnostic message。

如果运行时浏览器脚本找不到 `multi-book-page-map`，脚本停止执行，不影响连续视图。

如果 page map JSON 解析失败，脚本停止执行，不影响连续视图。

如果某个 page anchor 找不到 DOM 节点，页面树仍显示该 page；点击该 page 时正文显示错误提示：

```text
当前页面无法在生成 HTML 中定位。
```

该错误提示只出现在页面视图，不出现在连续视图。

## 42. 术语固定表

`source book`：用户维护的 `book.adoc` 及其 include 图。

`rendered HTML`：Asciidoctor 生成并经运行时注入后的 `book.html`。

`page map`：构建期生成的语义页面 JSON。

`page`：页面视图中的虚拟阅读单位。

`cover`：页面视图的书籍概览页。

`frontmatter`：由 abstract、colophon、dedication、preface、acknowledgments 合并成的前置页。

`part`：由 source `=` level 0 section 生成的部页面。

`chapter`：由正文 section 生成的章节页面。

`backmatter`：appendix、glossary、bibliography、index 独立页面集合。

`continuous view`：连续视图。

`paged view`：页面视图。

## 43. 当前实现的判定标准

实现满足以下全部条件时，该对象成立：

1. 生成工作区安装依赖后能构建书籍。
2. `07-structured-writing-conventions` 的 page map 生成 16 个页面，顺序符合本文第 19 节。
3. `book.html` 提供连续/页面切换。
4. 连续视图显示整本书。
5. 页面视图显示 cover/frontmatter/part/chapter/backmatter 的虚拟页面。
6. 左侧页面树按 page map 顺序导航。
7. 右侧目录只显示当前 page 的 toc。
8. 上一页/下一页按 page map 顺序切换。
9. 跨页 anchor 在页面视图中切换到目标 page。
10. 原 home link 和复制纯文本按钮保留。
11. 桌面和移动 Playwright 验证通过。
12. `pnpm run check` 通过。
13. 默认构建不生成 `build/adoc/` 合并源码输出。

## 44. 交付文档位置

正式设计文档写入当前项目的 `docs/design/` 目录。

文件名使用：

```text
docs/design/book-dual-reader-view.adoc
```

该文件内容以本文规约为基础，使用 AsciiDoc 编写。

实现计划写入 `docs/plan/` 目录。

文件名使用：

```text
docs/plan/book-dual-reader-view-implementation-plan.md
```

设计文档和实现计划必须由实现提交纳入版本控制。

## 45. 提交规则

提交只包含本功能相关文件。

在多人同仓场景中，提交使用：

```bash
git commit --only -m "..." -- <paths>
```

新增文件必须先被 `git add` 跟踪。

提交信息必须说明：

- 为什么引入 `asciidoc-abundant-tree`。
- page map 如何从 source-aware document tree 生成。
- 连续视图与页面视图如何共享同一 HTML。
- 哪些测试证明该行为成立。

## 46. 规约完整性声明

本文定义当前对象的输入、依赖、数据结构、切分规则、DOM 映射、交互行为、样式约束、测试要求、验收命令和提交边界。

开发者不得用未定义的页面种类替代本文枚举。

开发者不得用真实多 HTML 页面替代单 HTML 虚拟分页。

开发者不得用屏幕高度分页替代书籍语义分页。

开发者不得跳过 `asciidoc-abundant-tree` 而用标题文本猜测 frontmatter/backmatter。

开发者不得破坏连续视图、home link、复制纯文本、catalog 输出、check/build/clean 合同。
