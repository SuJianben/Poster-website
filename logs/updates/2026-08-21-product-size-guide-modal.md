# 2026-08-21 产品尺寸指南弹窗

## 本次目标

让普通商品和自定义商品的 Size guide 按钮打开当前商品尺寸对比弹窗。

## 修改范围

- sections/main-product.liquid
- sections/custom-product-main.liquid
- snippets/product-size-guide.liquid
- assets/product-size-guide.css
- assets/product-size-guide.js
- tests/product-size-guide.test.ps1
- tests/product-size-guide.runtime.test.cjs

## 新增内容

- 根据当前商品 Size 选项动态列出可选尺寸。
- 使用 CSS 按真实宽高比例绘制尺寸示意图，并高亮当前已选尺寸。
- 支持遮罩、关闭按钮和 Escape 关闭，关闭后恢复按钮焦点。
- 手机端使用可滑动尺寸卡片，桌面端使用自适应网格。
- 打开弹窗时发送 `product_size_guide_open` 埋点事件。

## 影响范围

- 影响普通商品页和自定义商品页的 Size guide 按钮。
- 不修改尺寸选择、变体、价格、装裱、上传、加购或购物车逻辑。

## 自检

- 专项 PowerShell 与 Node 运行时测试：通过。
- 现有 23 个 PowerShell 测试与 4 个 Node 运行时测试：通过。
- Shopify Theme Check：67 个文件、0 个问题。
- 自定义商品真实点击：正确读取 5 个尺寸，按尺寸比例渲染，A4 当前尺寸高亮，关闭后焦点恢复。
- 普通商品真实点击：弹窗正常打开，正确读取当前商品尺寸并高亮选中项。
- 390 × 844 手机端：底部弹层与横向滑动尺寸卡片正常，页面无横向溢出。
- 浏览器控制台：0 个错误。

## 遗留问题

- 无。
