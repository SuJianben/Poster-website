# 2026-08-21 手机端客户评价间距

## 本次目标

将手机端 What our customers say 分区上下内边距统一调整为 34px。

## 修改范围

- assets/home-customer-reviews.css
- tests/home-customer-reviews.test.ps1

## 调整内容

- 749px 及以下视口的 `.hrw-section` 改为 `padding: 34px 0`。
- 桌面端继续使用 `padding: 72px 0 80px`。

## 影响范围

- 仅影响首页客户评价分区的手机端上下间距。
- 不修改评价内容、卡片尺寸、横向滑动或桌面布局。

## 自检

- 专项测试与其余 22 项 PowerShell 回归测试全部通过。
- 4 项 Node.js 运行时测试全部通过。
- Shopify Theme Check 通过：检查 66 个文件，0 个问题。
- 线上 390px 手机宽度已验证：上下 padding 均为 34px，无横向溢出。
- 线上 1280px 桌面宽度已验证：上 padding 仍为 72px，下 padding 仍为 80px。

## 遗留问题

- 无。
