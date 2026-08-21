# 2026-08-21 手机端 Section 间距

## 本次目标

将手机端通用 Section 上下内边距从 64px 调整为 34px。

## 修改范围

- assets/poster-theme.css
- tests/mobile-section-spacing.test.ps1

## 调整内容

- 750px 及以下视口的 `.section` 改为 `padding: 34px 0`。
- 桌面端 `.section` 继续使用 `padding: 64px 0`。

## 影响范围

- 仅影响使用通用 `.section` 类的手机端模块。
- 不修改 Footer、Contact、商品页等独立间距规则。

## 自检

- 专项测试与其余 21 项 PowerShell 回归测试全部通过。
- 4 项 Node.js 运行时测试全部通过。
- Shopify Theme Check 通过：检查 66 个文件，0 个问题。
- 线上 390px 手机宽度已验证：上下 padding 均为 34px，无横向溢出。
- 线上 1280px 桌面宽度已验证：上下 padding 仍为 64px。

## 遗留问题

- 无。
