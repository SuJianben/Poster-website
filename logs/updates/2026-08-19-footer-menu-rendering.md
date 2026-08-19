# Footer 菜单渲染修复

## 日期

2026-08-19

## 本次目标

修复 Shopify 主题编辑器中已为 Footer 区块选择菜单，但店铺前台仍显示旧的写死链接的问题。

## 修改范围

- `sections/footer.liquid`
- `tests/footer-menu-rendering.test.ps1`

## 新增内容

- 新增 Footer 菜单渲染回归测试。
- 新增本次变更记录。

## 调整内容

- Footer 改为遍历主题编辑器中的 Link column 区块。
- 每个区块改为读取已选 Shopify 菜单的标题、链接文字和 URL。
- 移除原有指向 `#categories` 和 `#top` 的占位导航。
- 让 Footer 已有的 `Bottom text` 配置正常渲染。

## 影响范围

所有使用全局 Footer group 的店铺页面。Footer 现有样式、Newsletter 表单和版权信息保持不变。

## 自检

- Footer 专项回归测试通过。
- 10 项全量主题测试全部通过。
- Shopify Theme Check 检查 60 个文件，0 个问题。
- 正式主题首页返回 200，已渲染 `About Us`、`FAQ` 和 `Contact`。
- 真实点击 `About Us` 后正常跳转到 `/pages/about-us`。
- 1440px 桌面端和 390px 移动端完成视觉检查，移动端页面宽度与视口一致，无横向溢出。

## 遗留问题

- 当前正式主题的 `Shop` 和 `About` 两个 Footer 区块都选择了同一个 `Footer menu`，因此两列会显示相同链接。这属于后台配置内容，不是渲染故障。
