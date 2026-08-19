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
- 排查发现主题此前未输出 `<title>` 与 Meta Description；已在 `layout/theme.liquid` 接入 Shopify 的 `page_title`、`page_description` 与 `canonical_url`，让后台 SEO 数据真正进入前台 HTML。
- 新增全站 SEO Head 回归测试，防止基础 SEO 标签再次缺失。

## 影响范围

- 搜索引擎标题、摘要、产品页正文和产品 URL 不再出现 CSS/Test 字样。
- 产品标题、模板、价格、SKU、库存策略和销售状态未修改。
- 本次未访问或修改客户、订单、付款或结账数据。

## 自检

- Shopify Admin GraphQL 更新返回 0 个 `userErrors`。
- 新 URL `/products/custom-poster` 返回 200。
- 旧 URL `/products/custom-poster-css-frame-test` 已自动跳转到新 URL。
- 无缓存 HTML 检查确认页面只有 1 个 `<title>`，内容为 `Custom Poster | PosterAndForm`。
- 页面只有 1 个 Meta Description，内容与 Shopify 后台 SEO 描述完全一致。
- 页面只有 1 个 Canonical，目标为 `https://posterandform.com/products/custom-poster`。
- 产品正文与页面主要内容不再包含 `CSS Frame Test` 或 `rendered with CSS`。
- 真实产品页的 `Add to cart` 按钮保持可用。
- 首页内部链接直接指向新 Handle，旧 Handle 出现次数为 0。
- 全量回归测试通过；Shopify Theme Check 检查 60 个文件，0 条问题。

## 遗留问题

- 无已知代码或数据遗留；后续内容优化可继续围绕 `personalised poster` 搜索意图扩展。
