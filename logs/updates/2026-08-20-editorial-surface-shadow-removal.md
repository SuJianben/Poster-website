# 2026-08-20 Editorial 卡片 Surface 阴影纠正

## 本次目标

- 按最新确认，移除 `.editorial-depth-card__surface` 基础规则中的 `box-shadow`。
- 保持卡片间距、背景、图片切换和 0.5 秒 hover 复位逻辑不变。

## 修改范围

- `assets/editorial-depth-cards.css`
- `tests/editorial-product-card-layout.test.ps1`

## 调整内容

- 删除 `.editorial-depth-card__surface` 中的 `box-shadow: inset #ebebeb 0 0 0 1px;`。
- 将回归测试改为直接检查 surface 规则，禁止重新加入 inset 或 outer `box-shadow`。

## 代码组织

- 修改继续保留在 Editorial 卡片独立样式模块中。
- 没有新增公共模块、JavaScript 或第三方依赖。

## 自检

- 产品卡片布局测试：通过。
- 0.5 秒 hover 复位运行时测试：通过。
- 卡片媒体样式回归测试：通过。
- Shopify Theme Check：64 个文件，0 个问题。
- `git diff --check`：通过。

## 影响范围

- 使用 `.editorial-depth-card__surface` 的首页产品卡片和 Handpicked 卡片。

## 遗留问题

- 无已知代码技术债。
- 正式页面计算样式将在部署后确认。
