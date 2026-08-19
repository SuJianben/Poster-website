# 2026-08-19 Custom Poster SEO 正式化

## 本次目标

将 CSS 自定义产品的对外 SEO、产品正文和 URL 调整为普通自定义海报定位，移除 `CSS`、`test` 等技术或测试字眼。

## 修改范围

- Shopify 产品 `gid://shopify/Product/8593868226594` 的 SEO、正文与 Handle。
- 首页 `Nordic Calm` 模块中指向该产品的内部链接。

## 调整内容

- SEO 标题：`Custom Poster | PosterAndForm`。
- Meta 描述：`Create a personalised poster from your own photo or artwork. Choose the size, crop your image, and add an optional passepartout or frame.`
- 产品正文改为顾客视角的上传、裁剪、尺寸、内框和外框介绍，不再描述 CSS 技术实现。
- 产品 Handle：`custom-poster-css-frame-test` → `custom-poster`。
- Shopify 已启用 `redirectNewHandle`，旧产品 URL 自动跳转到新 URL。
- 首页内部链接同步指向 `shopify://products/custom-poster`，避免先经过旧链接跳转。
- 新增首页内部链接回归测试，防止后续重新写回历史测试 Handle。

## 影响范围

- 搜索引擎标题、摘要、产品页正文和产品 URL 不再出现 CSS/Test 字样。
- 产品标题、模板、价格、SKU、库存策略和销售状态未修改。
- 本次未访问或修改客户、订单、付款或结账数据。

## 自检

- Shopify Admin GraphQL 更新返回 0 个 `userErrors`。
- 待完成：新 URL、旧 URL 跳转、页面 Meta 标签、购买状态与首页内部链接真实链路检查。

## 遗留问题

- 无已知代码或数据遗留；后续内容优化可继续围绕 `personalised poster` 搜索意图扩展。
