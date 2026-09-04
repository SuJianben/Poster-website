# 2026-08-24 78 个普通 Poster 商品 Handle 更新

## 本次目标

- 根据已经确认的新作品名，为 78 个普通 Poster 商品生成新的品牌化 Handle。
- 保留旧商品链接访问能力，并让旧 URL 自动跳转到对应的新 URL。
- 不改变刚完成的标题、SEO、描述、媒体 Alt 和商品交易数据。

## 修改范围

- 商店：PosterAndForm（posterandform.com）。
- 目标：78 个带 `source:posterandform` 标签且 `productType` 为 `Print` 的商品。
- 非目标商品：4 个，包括自定义商品和系统附加商品，均未修改。

## 新增文件

- `D:\CODEX项目\海报站\backups\shopify-products\2026-08-24-78-product-handle-manifest.json`
  - 保存 Product ID、标题、旧 Handle、新 Handle、新旧完整 URL 和执行前更新时间。
- `D:\CODEX项目\海报站\backups\shopify-products\2026-08-24-78-product-handle-results.json`
  - 保存 78 个写入结果、重定向 ID、后台回读结果和正式前台验证结果。

## 执行前检查

- 正式店商品总数：82。
- 目标普通 Print：78。
- 新 Handle：78 个，全部唯一。
- 与店内非目标商品 Handle 冲突：0。
- 扫描主题有效文件：270 个。
- 主题写死旧 Handle 引用：0，因此不需要修改主题代码。

## 调整内容

- 78 个商品 Handle 全部按新英文作品名生成。
- 每次 `productUpdate` 均设置 `redirectNewHandle: true`。
- Shopify 自动创建 78 条 `/products/旧Handle` 到 `/products/新Handle` 的 URL 重定向。
- Title、SEO Title、SEO Description、状态、产品类型和标签均保持不变。

## 自检

- Handle 写入：78/78 成功，Shopify userErrors 为 0。
- 后台全量回读：78/78 新 Handle 与映射清单一致。
- 新 Handle 唯一性：78/78。
- 标题保持：78/78。
- SEO 保持：78/78。
- URL Redirect 后台验证：78/78 路径和目标完全匹配。
- 正式前台抽查 3 组新旧 URL：新 URL 直接访问正常，旧 URL 最终跳转到新 URL。
- 抽查商品 Canonical 均指向新 URL。
- `All Art Prints` 系列页商品卡已输出新 URL，不再输出对应旧 URL。
- 正式前台无横向溢出，控制台 0 个 error / warning。

## 影响范围

- 搜索引擎和外部访问将逐步识别新商品 URL。
- 旧链接由 Shopify 重定向继续可用。
- 主题商品选择器和产品引用按 Product ID/Shopify 对象工作，无需代码联动。

## 遗留问题

- 无计划内遗留问题。
- 搜索引擎重新抓取和替换旧索引需要外部时间，不属于站点写入失败。

