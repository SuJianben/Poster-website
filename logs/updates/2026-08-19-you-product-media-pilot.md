# You 产品媒体顺序试点

## 日期

2026-08-19

## 本次目标

仅对普通产品 `You` 进行单产品试点：先备份完整产品与媒体，再将修改前的最后一张无框作品图移至第一位，最后删除修改前的带框主图。

## 修改范围

- Shopify 产品：`You`（`gid://shopify/Product/8589882458146`）
- 本地备份：`D:\CODEX项目\海报站\backups\shopify-products\you\2026-08-19-before-media-reorder`

## 备份内容

- 产品基本字段、SEO、变体、SKU、价格、产品系列归属和元字段。
- 修改前 7 张媒体的 ID、顺序、URL、尺寸、本地文件名和 SHA-256 校验值。
- 7 张原始图片的本地副本。

## 目标媒体

- 待移至第一位：`gid://shopify/MediaImage/31840355352610`，`You - clean artwork preview`。
- 待删除的原主图：`gid://shopify/MediaImage/31840355156002`，`You - primary`。

## 影响范围

仅 `You` 产品的媒体顺序与原带框主图。不修改产品价格、库存、SKU、变体、元字段、描述、SEO、产品系列和自定义产品。

## 执行结果

- 将 `gid://shopify/MediaImage/31840355352610` 从第 7 位移至第 1 位。
- Shopify 媒体排序请求在连接层超时，但数据回读确认异步任务已成功，因此没有重复提交。
- 排序成功后，删除原带框主图 `gid://shopify/MediaImage/31840355156002`。
- Shopify 返回的已删除 ProductImage ID 为 `gid://shopify/ProductImage/41022156439586`，无 `mediaUserErrors`。
- 最终媒体数量从 7 张变为 6 张。

## 自检

- Shopify Admin 数据回读确认第一张为 `You - clean artwork preview`，原带框主图 ID 已不存在。
- 价格、SKU、5 个变体、销售状态、库存策略、标签和两个产品系列归属与备份一致。
- `/products/you.js` 返回 6 张图，`featured_image` 和第一张均为无框图。
- `All Art Prints` 系列页 Product 模式实际渲染无框图，Lifestyle 模式仍渲染 `gallery_02` 场景图。
- 产品详情页实际读到 6 张缩略图，第一张缩略图为无框图。

## 恢复方式

如需恢复，使用备份目录中的 `media/01-original-primary.jpg` 重新上传，并按 `product-backup.json` 中的 `mediaOrderBeforeChange` 恢复原顺序。

## 遗留问题

- 默认产品详情页仍把“最后一张图”作为初始主图和框架预览图。试点后第一张缩略图虽已选中，主图区初始却显示当前最后一张 `gallery_06`，存在缩略图与主图不一致。
- 在修改详情页的图片角色识别逻辑前，暂不将此操作扩大到其他产品。
