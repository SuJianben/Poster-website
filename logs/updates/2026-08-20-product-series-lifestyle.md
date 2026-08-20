# 2026-08-20 产品详情页按系列渲染场景图

## 本次目标

- 产品详情页底部场景图根据当前产品所属的内容系列自动切换。
- 同一系列的产品统一渲染该 Shopify 产品系列的特色图片。
- 默认、自定义和 CSS 自定义三个产品模板共用同一套匹配逻辑。

## 修改范围

- 新增 `snippets/product-series-lifestyle.liquid`
- 修改 `sections/product-lifestyle.liquid`
- 修改 `sections/custom-product-lifestyle.liquid`
- 修改 `templates/product.json`
- 修改 `templates/product.custom.json`
- 修改 `templates/product.custom-css.json`
- 新增 `tests/product-series-lifestyle.test.ps1`

## 新增内容

- 三个产品模板预配置八个内容系列：抽象几何、人物时尚、植物花卉、动物、摄影风景、极简中性、食物厨房、文字语录。
- 按主题编辑器中的系列配置顺序匹配；产品同时属于多个系列时取第一个。
- 渲染节点增加图片来源和匹配系列标识，便于后续排查。

## 调整内容

- 原来重复的两个场景图分区改为复用同一个系列匹配 snippet。
- 没匹配到系列或系列尚未上传特色图片时，继续使用原有分区备用图或内置场景图。

## 影响范围

- 默认产品、自定义产品和 CSS 自定义产品详情模板的 lifestyle 分区。
- 不修改产品归属、产品图片、系列数据或其他详情页分区。

## 自检

- 状态：已完成，并已同步到正式主题。
- Shopify Theme Check：共检查 63 个主题文件，0 个问题。
- 自动化测试：系列图专项测试通过，三个产品模板均配置完整的 8 个系列且优先级一致；完整测试集中仅保留既有的 `custom-poster-seo-link.test.ps1` 首页链接断言差异，本次未扩大范围处理。
- 抽象系列验证：产品 `You` 自动匹配 `abstract-geometric-prints`，来源标记为 `series`，已渲染对应 Featured image。
- 植物系列验证：产品 `White Flowers in Striped Vase` 自动匹配 `botanical-floral-prints`，已渲染另一张对应 Featured image。
- 自定义产品验证：`Custom Poster` 未匹配内容系列时来源标记为 `bundled_fallback`，原备用图正常显示。
- 移动端：在 `390 × 844 px` 视口下，系列图宽度与分区同为 375px，无横向溢出。
- 浏览器控制台：0 条错误或警告。

## 遗留问题

- 无。后续如需调整产品同时属于多个系列时的取图优先级，可直接拖动主题编辑器中的系列配置顺序。
