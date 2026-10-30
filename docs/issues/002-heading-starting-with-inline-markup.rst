# 002 标题以行内标记开头时按原文引用不到

:发现: 2026-10-31，小汤，aat 计划 #15 审读悬置事项时复现
:代码版本: ``cf96099``
:影响: 07 号书教的“标题原文就是地址”在这类标题上不成立，作者照写会得到没有链接、也没有报错的引用
:涉及: ``templates/default-workspace/books/07-structured-writing-conventions/parts/010-source-surface/020-heading-address-and-xref.adoc:72``

## 现象与复现

标题以行内标记开头时（例如 ``== `book.adoc` 的职责``），按标题原文写的引用不是 xref，链接与绑定都没有::

   = 书

   == `book.adoc` 的职责

   == 引用

   见 xref:`book.adoc` 的职责[]，也见 <<`book.adoc` 的职责>>。

用 aat（计划 #15 之后的工作树 dist）解析：两处都没有 xref occurrence，图上没有引用边；
标题节点的 ``aat:headline`` 是 ```book.adoc` 的职责``，与引用写的原文一致，却连不上。

去掉反引号写成 ``xref:book.adoc 的职责[]``，官方把它读成指向另一个文档 ``book.adoc 的职责``。

## 原因

实测：Asciidoctor.js 4.1.1 的 ``InlineXrefMacroRx``（``@asciidoctor/core/src/rx.js``）要求目标的第一个字符属于
``[\p{Word}#/.:{]``，反引号（以及 ``*``、``_`` 等行内标记的起始字符）不在其中，所以这两种写法在官方那里都不是 xref。
aat 自 0.3.0 起由官方转换认定 xref，如实没有画边；这不是 aat 的缺陷，是 AsciiDoc 语法本身。

## 修复要守住的

07 号书《标题、寻址与引用》第 72 行列出“标题和限定地址都指不出唯一一节”的情形（带 ``#``、带 ``::``），
应补上这一类：标题以行内标记开头时，按原文引用不到，要给它加 custom ID。决策树附录若列了同样的情形，一并补上。
