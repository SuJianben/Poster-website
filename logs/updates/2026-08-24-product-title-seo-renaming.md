# 2026-08-24 78 个普通 Poster 商品名称与 SEO 重命名

## 本次目标

- 将 78 个普通 Poster 商品全部改为 PosterAndForm 独立英文作品名，与参考站原名称形成明显区分。
- 同步更新 SEO Title、SEO Description、商品描述中的旧作品名和媒体 Alt。
- 保留现有 Handle 和商品 URL，不影响价格、SKU、库存、变体和系列关系。

## 数据范围

- 商店：PosterAndForm（posterandform.com）。
- 精确筛选：`tag:source:posterandform AND product_type:Print`。
- 正式写入前回读：78 个商品，无下一页遗漏，78 个 Handle 唯一。
- 排除范围：自定义商品、系统卡纸/外框商品、Canvas 商品和其他非 Print 商品。

## 新增文件

- `D:\CODEX项目\海报站\backups\shopify-products\2026-08-24-before-78-product-renaming.json`
  - 保存正式写入前的 Title、Handle、状态、标签、更新时间、Description、SEO 和全部媒体 Alt。
- `D:\CODEX项目\海报站\backups\shopify-products\2026-08-24-78-product-renaming-manifest.json`
  - 保存 78 个商品的修改前后映射和 365 个媒体 Alt 变更载荷。
- `D:\CODEX项目\海报站\backups\shopify-products\2026-08-24-78-product-renaming-results.json`
  - 保存写入数量、错误数量、全量回读结果和正式前台验证结果。

## 调整内容

- 78 个 Product Title 全部替换为审核通过的新英文作品名。
- 78 个 SEO Title 统一使用 `[New Artwork Name] Art Print | PosterAndForm`。
- 78 个 SEO Description 改为独立 PosterAndForm 文案，长度为 132–156 个字符。
- 62 个商品描述完成旧作品名或参考站品牌的精确替换。
- 365 个商品媒体 Alt 更新为新作品名，并区分 `clean artwork preview` 与 `styled gallery view`。
- 78 个现有 Handle 全部保留，没有建立或修改 URL 重定向。

## 执行方式

- 先试改 `composition-01`、`meet-me-at-jaures` 和 `red-chair`，覆盖编号型名称、重音符号名称和普通名称。
- 试点逐字段回读通过后，剩余 75 个商品按每批最多 10 个执行 Product 更新。
- 媒体 Alt 使用 Shopify `fileUpdate` 分批更新。
- 任一批次出现 Shopify `userErrors` 即停止；本次全部批次 userErrors 为 0。

## 影响范围

- 修改 Shopify 商品内容数据，不修改主题代码。
- 商品页、Collection、Search、首页热点、商品卡和购物车会自动读取新的 Product Title。
- 价格、Compare-at price、SKU、库存、选项、变体、产品系列、标签、供应商、产品状态和商品图片文件均未修改。
- 历史订单数据不做改写。

## 自检

- Shopify 全量回读：78/78 商品通过，0 失败。
- 新商品名称：78 个，全部唯一；0 个与执行前原名完全相同。
- SEO Title：78/78 与清单一致。
- SEO Description：78/78 与清单一致。
- 商品描述：78/78 与清单一致。
- 媒体 Alt：365/365 与清单一致。
- Handle：78/78 保持不变。
- 目标商品 Description 与 SEO 中参考站品牌残留：0。
- 正式前台桌面端抽查 3 个商品页：H1、HTML Title、Meta Description 和 Canonical 全部正确。
- 正式 `All Art Prints` 系列页已显示新名称，未显示抽查商品旧名称。
- 手机端按 390×844 视口检查；浏览器实际内容宽度 375px，无横向溢出。
- 正式前台验证期间控制台：0 个 error / warning。

## 遗留问题

- 当前商品 URL 继续使用旧 Handle，这是为保持链接稳定而有意保留，不属于漏改。
- 如后续决定同步品牌化 URL，需要另建 Handle 与 301 重定向批次，不能与本次结果混在一起补改。

