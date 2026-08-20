# 2026-08-20 卡片直角与 Handpicked 媒体样式统一

## 本次目标

- 去除首页 Editorial 商品卡片圆角。
- 让 Handpicked drops 沿用产品系列页的媒体背景、图片留白与完整展示规则。

## 修改范围

- `assets/editorial-depth-cards.css`
- `assets/featured-flow.css`
- `tests/card-media-style.test.ps1`

## 调整内容

- Editorial 商品媒体卡片圆角调整为 `0`。
- Handpicked 卡片改为直角和 `#f4f5f6` 背景。
- Handpicked 桌面端图片占位为宽 `76%`、高 `78%`；移动端为宽 `82%`、高 `80%`。
- 图片改用 `object-fit: contain`，确保横向、竖向和方形作品完整展示。

## 影响范围

- 仅影响首页 Editorial 商品卡片和 Handpicked drops 商品媒体卡片。
- 不修改产品数据、价格、链接、轮播索引或交互脚本。

## 自检

- Shopify Theme Check：58 个文件，0 个错误。
- 样式契约测试通过。
- 桌面端 1920×911 与移动端 390×844 真实页面检查通过。
- Handpicked 下一张交互实测通过，浏览器控制台无 warning 或 error。

## 遗留问题

- 无计划内遗留问题。
