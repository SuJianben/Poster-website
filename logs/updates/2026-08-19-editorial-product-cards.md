# 2026-08-19 首页 Editorial 商品卡布局与 Hover 修正

## 本次目标

- 将商品艺术家、标题和价格移到整个图片卡片边界之外。
- 保留原有立体倾斜、阴影和视差 Hover。
- 移除图片暗色蒙版，并在桌面端 Hover 时切换到商品第二张图。
- 恢复此前误改的倾斜轮播，避免影响无关首页模块。

## 修改范围

- `sections/editorial-with-products.liquid`
- `assets/editorial-depth-cards.css`
- `assets/editorial-depth-cards.js`
- `sections/featured-products.liquid`
- `assets/featured-flow.css`
- `assets/featured-flow.js`
- `tests/editorial-product-card-layout.test.ps1`

## 新增内容

- Editorial 商品卡增加独立的第二张商品图层。
- 商品信息改为图片卡片之后的兄弟节点，不再覆盖图片。
- 增加 `editorial_product_hover_image` 埋点，记录商品 handle 与卡片位置。
- 增加结构、蒙版、Hover 和误改回退的自动化回归测试。

## 调整内容

- 商品艺术家优先读取产品元字段 `custom.artist`，缺失时使用 vendor。
- 起售价使用产品最低价格；只有存在有效对比价时才显示划线价格。
- 无第二张图片的商品保持主图，不触发空白切换。
- Figma 静态备用卡片同步采用图片与文字分离结构。

## 影响范围

- 新布局仅影响首页两个 Editorial 分区下方的商品卡。
- 倾斜轮播已恢复到本次需求前版本。
- 不修改商品数据、产品详情页、产品系列页或首页自定义上传逻辑。

## 自检

- 状态：已通过并部署到正式主题。
- 自动化：本次新增的 Editorial 商品卡回归测试通过；其余相关主题测试通过；Shopify Theme Check 检查 62 个文件，0 个问题。
- 桌面端：1920 × 855 真实页面中，商品信息容器顶部等于图片卡片底部，确认处于卡片边界外；Hover 后主图透明度为 0、第二张图透明度为 1，且两个图片地址不同；暗色蒙版不存在。
- 移动端：390 × 844 真实页面保持两列，卡片宽度 163.5px，商品信息在图片下方，无横向溢出。
- 交互与日志：原立体倾斜和视差逻辑保留；`editorial_product_hover_image` 已触发；浏览器控制台 0 个错误、0 个警告。
- 既有检查项：`custom-poster-seo-link.test.ps1` 因首页自定义产品链接 handle 与旧预期不一致而失败，本次未改动该模块，未扩大修改范围。

## 遗留问题

- 无。
