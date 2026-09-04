# 2026-09-04：移除 custom.artist 元字段代码依赖

## 本次目标

为人工删除 Shopify 中的 `custom.artist` 产品元字段做代码清理，避免主题继续读取该字段。

## 修改范围

- `sections/editorial-with-products.liquid`：将编辑区商品卡片的艺术家来源改为 `product.vendor`，移除对 `product.metafields.custom.artist` 及其 `.value` 的读取。
- 产品详情页的 `Artist` 展示、`Artist Information` 内容块及其他元字段逻辑未修改；它们使用商品供应商或其他独立数据来源，不依赖 `custom.artist`。

## 版本备份

- 含原 `custom.artist` 读取的完整主题状态已提交到 Git 分支 `backup/with-custom-artist-metafield`。
- 当前 `main` 分支为移除该读取后的版本，供网站使用。

## 自检

- 已确认活动主题不再包含 `product.metafields.custom.artist` 读取。
- 已确认 `product.vendor` 艺术家展示仍保留。
- Shopify 元字段定义和值未由本次代码操作删除，需由运营在后台人工删除。

## 遗留事项

人工删除元字段后，请在主题预览中检查首页编辑区商品卡片；若仍看到旧内容，刷新主题预览或清理浏览器缓存即可。
