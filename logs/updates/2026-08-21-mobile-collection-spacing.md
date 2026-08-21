# 产品系列页手机端间距

## 日期

2026-08-21

## 本次目标

- 将产品系列页手机端 `.cg-collection` 上下内边距统一为 44px。

## 修改范围

- `assets/collection-gallery.css`：调整 750px 及以下视口的分区间距。
- `sections/main-collection.liquid`：更新系列页 CSS 版本参数，确保 Shopify 页面缓存立即刷新。
- `tests/collection-product-card.test.ps1`：锁定手机端和桌面端间距规则。

## 调整内容

- 手机端从 `padding: 92px 0 44px` 改为 `padding: 44px 0`。
- 桌面端继续使用 `padding: 104px 0 72px`。
- 系列页样式 URL 增加 `cg=20260821-spacing-1` 版本参数，避免页面继续引用旧 CSS 指纹。

## 影响范围

- 仅影响产品系列页手机端最外层上下间距。
- 不影响卡片、角标、图片悬停、筛选器和桌面布局。

## 自检

- 产品系列页卡片专项测试通过。
- 28 项 PowerShell 回归测试与 5 项 Node.js 运行时测试全部通过。
- Shopify Theme Check：69 个文件，0 个问题。
- 390×844 正式主题真实渲染验证通过：计算值为 `44px 0 44px 0`，无横向溢出。
- 1280×900 正式主题真实渲染验证通过：桌面计算值仍为 `104px 0 72px`。
- 实际加载的样式 URL 已包含 `cg=20260821-spacing-1` 版本参数。
- 正式主题全页缓存曾短暂引用旧 CSS 指纹；通过显式版本参数完成缓存失效，未增加额外 padding 覆盖。
- 相关主题资产已同步至正式主题 `Poster-website/main`。

## 遗留问题

- 暂无。
