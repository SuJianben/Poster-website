# 2026-08-20 产品来源标签品牌替换

## 本次目标

- 将普通海报产品的精确来源标签从 `source:the_poster_club` 替换为 `source:posterandform`。
- 保留产品的分类、类型和历史导入批次等其他标签。

## 数据范围

- 商店：PosterAndForm（posterandform.com）
- 受影响产品：78 个
- 已有正确来源标签产品：1 个
- 分页检查：全部结果已读取，无下一页遗漏。

## 数据流向

- 来源：Shopify Product tags
- 旧值：`source:the_poster_club`
- 新值：`source:posterandform`
- 保留值：`import_batch:poster-club-2026-08-13` 及所有 `style:*`、`type:*` 标签

## 备份

- `backups/shopify-products/2026-08-20-source-tag-replacement.json`
- 备份包含产品 ID、标题、handle、状态、修改前标签和预期修改后标签。

## 修改范围

- Shopify 产品标签数据，不修改主题代码、产品标题、描述、图片、价格、库存、变体或产品状态。

## 自检

- 写入前：78 个产品各包含且仅包含 1 个旧来源标签。
- 写入前：全部产品的历史导入批次标签均在替换后保留。
- 写入后结果待执行完成后补充。

## 遗留问题

- 无已知代码技术债。
