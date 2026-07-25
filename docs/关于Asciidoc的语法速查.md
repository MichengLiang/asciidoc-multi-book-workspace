## Asciidoc 可用表达速查

### 维度一：文档元数据与全局结构控制

1. 文档标题 (Document Title)
2. 作者与联系方式声明 (Author & Contact Info)
3. 版本号与修订日期 (Revision & Date)
4. 全局文档属性 (Document Attributes)
5. 自动目录生成 (Table of Contents / TOC)
6. 章节标题层级 (Section Titles)
7. 独立标题/浮动标题 (Discrete Headings)
8. 文档前言 (Preface)
9. 文档摘要 (Abstract)
10. 附录声明 (Appendix)
11. 术语表声明 (Glossary)
12. 参考文献树 (Bibliography Section)
13. 索引生成区块 (Index Section)

### 维度二：文本排版与内联语义修饰

14. 粗体 (Bold)
15. 斜体 (Italic)
16. 等宽/代码字体 (Monospace)
17. 文本高亮 (Highlight)
18. 删除线 (Strikethrough / Line-through)
19. 上标 (Superscript)
20. 下标 (Subscript)
21. 智能单双引号转换 (Smart Quotes)
22. 破折号与省略号转义 (Dashes & Ellipses)
23. 强制换行符 (Hard Line Breaks)
24. 不换行空格 (Non-breaking Space)
25. 自定义内联角色/CSS类标签 (Inline Roles / Custom Classes)
26. 语法转义标记 (Escaping Characters)

### 维度三：列表与层级数据组织

27. 无序列表 (Unordered Lists)
28. 有序列表 (Ordered Lists)
29. 描述列表/术语列表 (Description Lists)
30. 问答列表 (Q&A Lists)
31. 任务清单/检查表 (Checklists)
32. 代码标注列表 (Callout Lists)
33. 列表项延续挂载点 (List Continuation / `+`)

### 维度四：专用区块与内容容器

34. 普通段落 (Paragraphs)
35. 引导段落 (Lead Paragraph)
36. 警告提示块 (Admonition Blocks: Note, Tip, Important, Caution, Warning)
37. 引用块 (Blockquotes)
38. 诗歌块 (Verse Blocks)
39. 示例演示块 (Example Blocks)
40. 补充说明/侧边栏 (Sidebars)
41. 源代码块 (Source Code Blocks)
42. 纯文本/字面量块 (Literal Blocks)
43. 列表清单块 (Listing Blocks)
44. 开放式通用块 (Open Blocks)
45. 原始透传块 (Passthrough Blocks)
46. 开发者注释块 (Comment Blocks)
47. 交互式折叠块 (Collapsible Blocks)

### 维度五：导航、引用与超链接连接

48. 内部锚点/自定义书签 (Internal Anchors)
49. 交叉引用链接 (Cross References)
50. 外部 URL 链接 (External URL Links)
51. 文档间跳转链接 (Inter-document Links)
52. 带有窗口/关系属性的链接 (Links with Target Attributes)
53. 页面底部脚注 (Footnotes)
54. 可重复引用的脚注 (Reusable Footnotes)
55. 参考文献条目引用 (Bibliography Entry References)
56. 索引关键词打点 (Index Terms)

### 维度六：多媒体与 UI 宏指令

57. 块级独立图片 (Block Images)
58. 内联文字内图片 (Inline Images)
59. 音频播放器 (Audio)
60. 视频播放器 (Video)
61. 键盘按键宏 (Keyboard Macros / `kbd`)
62. 菜单路径宏 (Menu Path Macros / `menu`)
63. UI 按钮宏 (Button Macros / `btn`)
64. 矢量图标宏 (Icon Macros)
65. 科学数学公式 (STEM / MathML / LaTeX)

### 维度七：表格与网格数据呈现

66. 标准网格表格 (Basic Tables)
67. 表头行声明 (Header Row)
68. 表尾行声明 (Footer Row)
69. 列宽比例分配 (Column Widths)
70. 列内容水平对齐 (Horizontal Alignment)
71. 列内容垂直对齐 (Vertical Alignment)
72. 单元格跨行合并 (Rowspan)
73. 单元格跨列合并 (Colspan)
74. 嵌套 AsciiDoc 元素的单元格 (AsciiDoc Block Cells / `a` cols)
75. 外部 CSV 数据转换表格 (CSV Data Tables)
76. 外部 DSV 数据转换表格 (DSV Data Tables)

### 维度八：高级组装与条件逻辑控制

77. 文件包含导入指令 (Include Directive)
78. 基于标签的文件片段包含 (Include by Tag)
79. 基于行号的文件片段包含 (Include by Lines)
80. 存在性条件判断指令 (`ifdef`)
81. 缺失性条件判断指令 (`ifndef`)
82. 表达式等值判断指令 (`ifeval`)
83. 自定义文本替换声明 (Text Substitutions)
84. 打印分页符强制截断 (Page Breaks / `<<<`)
85. 主题分割线/水平标尺 (Thematic Breaks / `'''`)


## 一个场景的 `adoc` 文档示例

```asciidoc
= AsciiDoc 结构化表达示例集
作者姓名 <author@example.com>
:toc: left
:toclevels: 3
:sectnums:
:sectnumlevels: 4
:icons: font
:source-highlighter: rouge
:imagesdir: ./images
:experimental:

[abstract]
本文档是一份 AsciiDoc 语法与结构化表达示例集，涵盖基础排版到复杂容器嵌套的高频使用场景，所有语法均基于 Asciidoctor 当前推荐的标准宏 (Macro) 规范构建。

== 文本语义与内联修饰

*基础强调*：这是 *粗体*，这是 _斜体_，这是 *_粗斜体_*。
*代码与高亮*：请使用等宽字体表示行内代码，例如 `const a = 1;`。或者对重点内容进行 #高亮突出#。
*科学排版*：化学分子式 H~2~O，物理公式 E=mc^2^。
*状态变更*：如果某项规则已废弃，可以使用 [.line-through]#删除线标记#。

== 区块级容器与警告说明

=== 警告说明 (Admonitions)

NOTE: 这是一个普通的提示信息。通常用于附加的参考说明。

TIP: 这是一个实用技巧。

IMPORTANT: 核心重点，提醒读者必须注意。

CAUTION: 潜在风险提示，操作时需谨慎。

WARNING: 严重警告，例如可能导致数据丢失的操作。

=== 引用与诗歌 (Quotes & Verse)

[quote, 艾伦·图灵, 计算机机械与智力 (1950)]
____
机器能思考吗？
我相信，在 50 年的时间里，我们将有可能对存储量约为 10^9 的计算机进行编程...
____

[verse, 威廉·布莱克, 天真之歌]
____
一沙一世界，
一花一天堂。
____

=== 侧边栏与示例块 (Sidebars & Examples)

.扩展阅读：侧边栏标题
****
侧边栏用于提供与正文相关但可独立阅读的背景知识。
****

.请求体示例
====
示例块使用四个等号，通常用来包裹一段完整的操作演示或代码输出。
====

== 列表体系与层级挂载

=== 基础与嵌套列表

* 无序列表第一级
** 无序列表第二级
*** 无序列表第三级
* 回到第一级

. 有序列表第一级
.. 有序列表第二级

=== 任务清单 (Checklists)

* [*] 核心框架搭建
* [x] 样式兼容性测试
* [ ] 打印模式适配

=== 术语字典与 Q&A (Description & Q&A)

API 接口::
  应用程序编程接口。
  
[qanda]
AsciiDoc 相比 Markdown 的优势是什么？::
原生支持复杂的文档结构如脚注、交叉引用和包含指令。

=== 列表的复杂挂载 (List Continuation)

* 列表项 1：如何在其下方挂载一段代码，而不断开列表？
+
[source, bash]
----
echo "使用加号 (+) 作为挂载点"
----
+
挂载点甚至可以继续连接一个警告块：
+
WARNING: 不要忘记加号前后的换行！

* 列表项 2：继续列表。

[#code-and-callouts]
== 源代码与标注 (Code & Callouts)

.服务端入口代码
[source, javascript]
----
const express = require('express'); <1>
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World'); <2>
});

app.listen(3000); <3>
----
<1> 引入 Express 框架的核心模块。
<2> 定义根路由的响应内容。
<3> 启动服务并监听 3000 端口。

== 多媒体与 UI 宏表达

=== 图像 (Images)

.架构流程图 (带属性控制)
image::https://asciidoctor.org/images/asciidoctor-logo.svg[Asciidoctor Logo, 150, 150, float="right", align="center"]
当图片设置为右浮动时，这段说明文字将会环绕在图片的左侧。这段文字需要足够长才能清楚地看到环绕排版的最终视觉效果。

=== UI 交互元素 (UI Macros)

* 快捷键组合：请按下 kbd:[Ctrl+Shift+P] 唤出控制台。
* 菜单导航路径：前往 menu:File[Preferences > Settings] 修改配置。
* 界面按钮点击：点击 btn:[Save & Apply] 保存修改。

== 表格与网格数据

=== 基础数据表格

.用户权限对照表
[cols="1,2,1", options="header"]
|===
| 角色 | 权限描述 | 状态

| 管理员
| 拥有系统的最高控制权，可修改全局设定。
| 活跃

| 访客
| 仅具有只读权限。
| 限制
|===

=== 深度嵌套表格 (带有 `a` 列)

.带有区块嵌套和合并的高级表格
[cols="1,2a,1", options="header"]
|===
| 模块 | 详细说明与结构 | 进度

.2+| 鉴权中心
| 
这里可以写任意 AsciiDoc 语法：
* [ ] Token 校验
* [ ] 刷新机制

[TIP]
====
在 `a` 列中，表格不仅是网格，更是容器。
====
| 开发中

| Oauth 2.0 接入配置说明 | 计划中

| 底部声明 2+| 此模块需要在下个迭代优先完成。
|===

== 导航、引用与超链接

=== 锚点与交叉引用

[#core-concept]
这是一个名为“核心概念”的自定义锚点声明。
当你需要引用它时：请参考 xref:core-concept[这里的详细阐述]，或者直接跳转到 xref:code-and-callouts[源代码与标注章节]。

=== 超链接与脚注

这是外部链接： https://asciidoctor.org[Asciidoctor 官方网站, window="_blank"]。

在严肃文档中，术语通常需要脚注支持。footnote:[脚注会在页面底部或章节末尾自动汇总。] 
如果你需要多次引用同一个参考，可以使用带目标 ID 的脚注宏。footnote:rfc793[RFC 793 - 传输控制协议规范。]
在下文中再次引用它。footnote:rfc793[]

== 动态控制与折叠视图

=== 交互式折叠块 (Collapsible)

.长篇日志输出 (点击展开)
[%collapsible]
====
[source, log]
----
[INFO] Starting service...
[INFO] Loading configuration from /etc/config.yml
[DEBUG] Connect to database: Success
[INFO] Service is ready on port 8080.
----
====

=== 开放块与分割线 (Open Blocks & Rules)

--
这是一个开放块 (Open Block)。它是一个通用的容器，通常配合自定义的 Role (CSS class) 使用，在不破坏语义的前提下改变局部排版。
--

下面是一条水平分割线：

'''
```
