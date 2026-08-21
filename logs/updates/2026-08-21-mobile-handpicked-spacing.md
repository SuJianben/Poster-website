# 2026-08-21 手机端 Handpicked 间距

## 本次目标

将手机端 Handpicked 分区上下内边距从 64px 调整为 34px。

## 修改范围

- assets/featured-flow.css
- tests/mobile-handpicked-spacing.test.ps1

## 调整内容

- 767px 及以下视口的 `.tilted-carousel` 改为 `padding: 34px 0`。
- 桌面端继续使用 `padding: 72px 0`。

## 影响范围

- 仅影响首页 Handpicked drops. 轮播的手机端上下间距。
- 不修改轮播卡片尺寸、动画、图片比例或其他分区。

## 自检

- 专项测试与其余 22 项 PowerShell 回归测试全部通过。
- 4 项 Node.js 运行时测试全部通过。
- Shopify Theme Check 通过：检查 66 个文件，0 个问题。
- 线上 390px 手机宽度已验证：上下 padding 均为 34px，无横向溢出。
- 线上 1280px 桌面宽度已验证：上下 padding 仍为 72px。

## 遗留问题

- 无。
