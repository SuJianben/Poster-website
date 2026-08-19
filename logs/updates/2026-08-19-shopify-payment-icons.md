# 2026-08-19 Shopify 后台支付图标接入

## 本次目标

将主题内现有的支付方式文字徽标全部替换为 Shopify 后台已启用支付方式对应的官方 SVG 图标，使前台展示自动跟随后台支付配置变化。

## 修改范围

- 默认产品详情页的支付图标区。
- 两种自定义产品详情模板共用的支付图标区。
- AJAX 购物车抽屉底部的支付图标区。
- 全站公共支付图标样式与资源缓存版本。

## 新增内容

- `snippets/shopify-payment-icons.liquid`：统一读取 `shop.enabled_payment_types`，并通过 `payment_type_svg_tag` 输出 Shopify 官方图标。
- `assets/shopify-payment-icons.css`：统一管理产品页和购物车抽屉的图标排列、尺寸及移动端适配。
- `tests/shopify-payment-icons.test.ps1`：防止后续重新写死支付方式或遗漏公共组件。

## 调整内容

- 默认产品和自定义产品改为调用公共支付图标片段。
- 购物车抽屉通过 Liquid `<template>` 接收后台支付图标，再由现有 JavaScript 注入动态抽屉页脚。
- 删除原先模拟 AMEX、Apple Pay、Mastercard、PayPal、VISA、Klarna 等品牌的硬编码文字和对应假徽标样式。
- 为支付图标公共 CSS、购物车 CSS 与购物车 JS 增加缓存版本标识。

## 数据来源与流向

- 来源：Shopify 后台当前启用的支付方式 `shop.enabled_payment_types`。
- 转换：Shopify Liquid 过滤器 `payment_type_svg_tag`。
- 展示：产品页支付区、两种自定义产品页支付区、购物车抽屉。
- 本次没有读取或修改客户、订单、结账或付款敏感数据。

## 影响范围

- 后台增减支持的支付方式后，前台图标会随 Shopify 渲染结果自动变化。
- Footer 当前没有支付图标模块，因此没有新增无关的页脚结构。
- 支付图标不可点击，本次不新增交互埋点；数据来源通过 `data-payment-source` 可追溯。

## 自检

- 待完成：自动化回归、Theme Check、桌面端与移动端真实店铺链路检查。

## 遗留问题

- 无已知功能性遗留；最终可见图标种类由 Shopify 后台实际启用的支付方式决定。
