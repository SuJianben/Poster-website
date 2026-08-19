# 产品系列卡片爱心移除

## 日期

2026-08-19

## 本次目标

彻底移除产品系列页产品卡片右上角的旧爱心按钮，与全站已取消收藏入口的产品决策保持一致。

## 修改范围

- `sections/main-collection.liquid`
- `assets/collection-gallery.css`
- `assets/collection-gallery.js`
- `tests/collection-heart-removal.test.ps1`

## 新增内容

- 新增产品系列爱心移除回归测试。
- 新增本次变更记录。

## 调整内容

- 移除产品卡片爱心按钮的 Liquid 结构。
- 移除爱心图形、定位和选中状态样式。
- 移除仅用于切换爱心状态的点击事件。

## 影响范围

所有使用 `main-collection` 的产品系列页。产品图片、生活方式视图、Bestseller 标签、产品信息、筛选和分页不受影响。

## 自检

- 产品系列爱心移除专项测试通过。
- 11 项全量主题测试全部通过。
- Shopify Theme Check 检查 60 个文件，0 个问题。
- 正式 `Abstract & Geometric Prints` 系列页返回 200，HTML 中 `data-cg-heart` 和 `cg-heart` 数量均为 0。
- 浏览器中实际检查 `Sketchbook` 产品卡片，爱心和右上角残留空位已消失。
- 点击产品卡片后正常进入 `/products/sketchbook`。
- 390px 移动端视口下爱心数量为 0，页面无横向溢出。

## 遗留问题

- 无。
