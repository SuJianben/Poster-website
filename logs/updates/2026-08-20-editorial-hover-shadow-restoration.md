# 2026-08-20 Editorial 卡片 Hover 阴影恢复

## 本次目标

- 保持卡片默认状态无阴影。
- 恢复最初卡片自带的 hover/focus 淡外投影。
- 保持鼠标离开后等待 0.5 秒再复位的交互。

## 修改范围

- `assets/editorial-depth-cards.css`
- `tests/editorial-product-card-layout.test.ps1`

## 调整内容

- `.editorial-depth-card__surface` 默认规则继续不设置 `box-shadow`。
- hover/focus 状态恢复 `rgba(0, 0, 0, .14) 0 14px 28px 0` 外投影。
- 恢复阴影进入 `.4s ease-in` 和离开 `.55s ease-out` 过渡。
- 没有恢复此前移除的 `#ebebeb` inset 内框。

## 代码组织

- 默认态与交互态在同一独立卡片样式模块内明确分离。
- 没有新增公共模块、JavaScript 或第三方依赖。

## 自检

- 产品卡片布局测试：通过。
- 0.5 秒 hover 复位运行时测试：通过。
- 卡片媒体样式回归测试：通过。
- Shopify Theme Check：64 个文件，0 个问题。
- `git diff --check`：通过。
- 正式首页默认态实测：surface 计算样式为 `box-shadow: none`。
- 正式首页 hover 实测：外投影为 `rgba(0, 0, 0, 0.14) 0px 14px 28px`，第二张图正常显示。
- 正式首页离开实测：延时复位后阴影通过 `.55s ease-out` 完成淡出，最终恢复为 `none`。

## 影响范围

- 使用 `.editorial-depth-card__surface` 的首页产品卡片和 Handpicked 卡片。

## 遗留问题

- 无已知代码技术债。
- 已完成正式主题部署与真实页面验证。

