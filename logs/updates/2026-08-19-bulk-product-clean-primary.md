# 普通产品无框原图设为首图

## 日期

2026-08-19

## 本次目标

除自定义产品与系统加框商品外，将普通海报产品的末张无框作品图移动到首位，并在确认排序生效后删除原带框首图，使产品系列卡片和默认产品详情页优先展示无框作品。

## 修改范围

- Shopify 普通产品媒体顺序与原首图媒体。
- `scripts/backup-shopify-product-media.ps1`：新增批量媒体备份、下载重试、SHA-256 校验与结果汇总工具。
- 默认产品详情页媒体识别修复另见 `2026-08-19-default-product-featured-media.md`。

## 新增内容

- 批量操作前完整备份 77 个待处理产品的产品字段、变体、系列、元字段、原媒体顺序及全部媒体文件。
- 每个媒体文件记录下载大小与 SHA-256，用于后续恢复和完整性核对。
- 批量操作结果记录：`backups/shopify-products/bulk-2026-08-19-clean-primary/operation-results.json`。

## 调整内容

- 77 个普通产品按“核对当前状态 → 末图移动到首位 → 确认排序 → 删除原首图 → 最终复核”执行，77 个全部成功。
- 先行试点产品 `You` 已按同一规则完成；因此本次结束后共有 78 个普通产品以无框作品图为首图。
- `Cat and Flora` 与 `Moka 01` 因原首图 alt 命名为 gallery 而非 primary，执行前已人工核对图片内容，确认首图为带框图、末图为无框图后纳入处理。
- 明确排除 `custom-poster`、`custom-poster-studio`、`system-frame-addon`、`system-passepartout-addon`，未修改这些产品。

## 影响范围

- 普通产品在产品系列、搜索结果及默认产品详情页的首图。
- 不影响自定义产品模板、系统加框商品、产品变体、价格、库存、SEO、产品系列归属和元字段。

## 自检

- 备份：77/77 个产品通过校验，436 张媒体文件完成下载，备份总量约 60.3 MB。
- 写入：77/77 成功，0 跳过，0 失败。
- 全店复核：78/78 个普通产品的首图 alt 均为 `clean artwork preview`；本批 77 个原首图媒体 ID 均已不存在。
- 产品系列页抽查：`You`、`White Flowers in Striped Vase`、`Waiting At Art Et Métiers` 均展示新的无框首图。
- 默认产品详情页抽查：`Deep Blue` 与 `Cat and Flora` 的主图、首个缩略图和选中缩略图均指向无框作品图。

## 恢复方式

Shopify 已删除的媒体 ID 不能直接恢复。若需要回退，使用 `backups/shopify-products/bulk-2026-08-19-clean-primary/products/<handle>/media/` 中的原文件重新上传，并依据同目录 `product-backup.json` 恢复原媒体顺序。先行试点产品 `You` 使用其独立备份目录恢复。

## 遗留问题

- 本次未建立独立 BUG 日志目录；默认详情页依赖末图的识别缺陷已记录在日期更新日志中。
