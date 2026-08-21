# 2026-08-21 Footer 品牌信息块

## 本次目标

在 Footer 菜单区域增加可由 Shopify 主题编辑器配置的品牌信息块。

## 修改范围

- sections/footer.liquid
- assets/poster-theme.css
- tests/footer-brand-info.test.ps1

## 新增内容

- Footer 后台新增品牌信息显示开关、Logo 上传、Logo 宽度、标题和富文本内容设置。
- 桌面端在四个菜单列前展示品牌信息列。
- 中等屏幕与手机端将品牌信息独立成整行，菜单保持易读的响应式排列。

## 影响范围

- 仅影响 Footer 菜单区域的结构和布局。
- 不修改 Newsletter、菜单来源、版权信息或其他页面模块。

## 自检

- 专项测试与其余 19 项 PowerShell 回归测试全部通过。
- 4 项 Node.js 运行时测试全部通过。
- Shopify Theme Check 通过：检查 66 个文件，0 个问题。
- 线上 1920px 桌面宽度已验证：品牌信息与四个菜单列同排显示。
- 线上 900px 平板宽度已验证：品牌信息独占第一行，菜单显示在下方。
- 线上 390px 手机宽度已验证：品牌信息满行，菜单保持两列排列。

## 遗留问题

- 无。
