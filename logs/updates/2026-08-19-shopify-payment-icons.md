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

- 自动化回归：6 组测试全部通过，其中新增的支付图标测试确认三个产品模板入口与购物车抽屉均调用公共片段，且旧的硬编码品牌文字与样式已清除。
- JavaScript 语法检查：`assets/cart-drawer.js` 通过 `node --check`。
- Shopify Theme Check：检查 59 个主题文件，0 条问题。
- 正式主题回读：主题 `189377019938` 已读取到公共 Liquid 片段、公共 CSS、默认产品页、自定义产品页、购物车模板及全局缓存版本。
- 桌面端真实链路：默认产品成功加入购物车，抽屉正常打开、商品与金额正常渲染，旧支付徽标数量为 0。
- 移动端真实链路：390 × 844 视口下购物车宽度为 390px，页面与抽屉页脚均无横向溢出。
- 后台数据状态：真实店铺当前的 `shop.enabled_payment_types` 返回空，因此 Shopify 没有向主题输出可展示的支付 SVG；主题没有伪造回退图标，待后台启用受支持的支付方式后会自动显示。

## 遗留问题

- 代码无已知功能性遗留。
- 运营配置待确认：如需立即看到图标，需要在 Shopify 后台启用会被 `shop.enabled_payment_types` 暴露给主题的支付方式；该项属于商店支付配置，不属于主题代码缺陷。
