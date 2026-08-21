# 2026-08-21 Footer 支付图标

## 本次目标

在 Footer 菜单区域与版权行之间展示 Shopify 原生支付图标。

## 修改范围

- sections/footer.liquid
- assets/shopify-payment-icons.css
- assets/poster-theme.css
- tests/shopify-payment-icons.test.ps1

## 调整内容

- Footer 复用现有 Shopify 支付图标公共组件。
- 图标数据继续来自 `shop.enabled_payment_types`，自动跟随店铺实际启用的支付方式。
- Footer 后台新增支付图标显示开关。
- 增加 Footer 专用居中、间距与手机换行样式。

## 影响范围

- 仅影响 Footer 菜单区域与版权行之间的位置。
- 不修改支付设置、订单、结账、Newsletter、菜单或品牌信息内容。

## 自检

- 专项测试与其余 19 项 PowerShell 回归测试全部通过。
- 4 项 Node.js 运行时测试全部通过。
- Shopify Theme Check 通过：检查 66 个文件，0 个问题。
- 线上桌面端已验证：从 Shopify 读取 11 个已启用支付方式，图标居中显示在菜单与版权行之间。
- 线上 390px 手机宽度已验证：图标自动换成两行，全部保持在视口内。

## 遗留问题

- 无。
