# 2026-08-20 产品历史导入批次标签删除

## 本次目标

- 从全部相关产品中删除精确标签 `import_batch:poster-club-2026-08-13`。
- 保留 `source:posterandform`、`style:*`、`type:*` 及其他产品标签。

## 数据范围

- 商店：PosterAndForm（posterandform.com）
- 受影响产品：78 个
- 分页检查：全部结果已读取，无下一页遗漏。

## 数据流向

- 来源：Shopify Product tags
- 删除值：`import_batch:poster-club-2026-08-13`
- 保留值：`source:posterandform` 及所有其他标签

## 备份

- `backups/shopify-products/2026-08-20-import-batch-tag-removal.json`
- 备份包含产品 ID、标题、handle、状态、更新时间、删除前标签和预期删除后标签。

## 修改范围

- 只修改 Shopify 产品标签，不修改主题代码、产品标题、描述、图片、价格、库存、变体或产品状态。

## 自检

- 写入前：78 个产品各包含且仅包含 1 个目标批次标签。
- 写入前：78 个产品均包含正确来源标签 `source:posterandform`。
- 写入后结果待执行完成后补充。

## 遗留问题

- 无已知代码技术债。
