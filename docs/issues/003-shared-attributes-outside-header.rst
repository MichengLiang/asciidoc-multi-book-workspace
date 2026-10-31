# 003 样书在共享属性的 include 前空一行，共享属性里只在文档头生效的属性对样书不生效

:发现: 2026-11-01，小汤（p5 书架换上 07 号书时）
:代码版本: ``c663af2``
:性质: 愿望
:来自: mumian-workspace
:影响: 想用 shared/attributes.adoc 给整个书架统一排版的书架，只好逐本改样书

## 现象

样书的 ``book.adoc`` 在 ``include::../../shared/attributes.adoc[]`` 前面空了一行（07 号书在第 15 行，其余样书同样）。
空行结束文档头，所以写进 ``shared/attributes.adoc`` 的属性只作为正文里的属性生效；只在文档头才起作用的属性
（``toc-title``、``docinfo`` 与 ``docinfodir``、``webfonts``、各种 caption）对样书不生效。

一个书架想给全部的书统一排版（自己的 docinfo 样式、中文的目录标题与提示块标签），按模板的意思应写在
``shared/attributes.adoc`` 里；可照样书起的书都带着那个空行，书架只好逐本改书。

## 复现

Asciidoctor.js 4.1.1（工作区 0.9.0 的版本），``shared/attributes.adoc`` 只有两行 ``:toc-title: 目录`` 与
``:webfonts!:``；同一本最小的书，唯一的差别是 include 前有没有空行::

    = 书
    :doctype: book
    :toc: left
                                         <- with-blank 版本在这里有一个空行
    include::../../shared/attributes.adoc[]

    == 一章

    正文。

``convertFile(…, {standalone: true})`` 的结果::

    with-blank toctitle= Table of Contents
    no-blank   toctitle= 目录

## 我们怎样处理的

p5（木棉工作台）的书架把 07 号书放成 01 号书，逐字节复制，只删掉这一个空行，并在书架 README 里写明这一处偏离与
升级时要重做的事（提交见 p5 的 ``git log --grep "Work-Package: 7.3"``）。

## 要对方定的

样书去不去掉这个空行、或者模板用别的办法让共享属性能带文档头的属性，由工作区定。去掉时要守住的：共享属性
里只在文档头生效的属性对每本样书生效（上面的复现可以直接写成测试），而书自己文档头里写的属性仍可被共享属性
覆盖或覆盖它的顺序要写明——p5 正是靠“后写的覆盖先写的”在共享属性里用 ``:icons!:`` 关掉 07 号书的
``:icons: font``（它会从 CDN 拉 Font Awesome）。
