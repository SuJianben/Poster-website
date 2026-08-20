# 2026-08-20 首页热点层级、产品卡片阴影与评论标题调整

## 本次目标

- 修复热点商品卡片打开后，其他热点按钮仍覆盖在弹窗上方的问题。
- 去除首页产品卡片外投影，同时保留 `#ebebeb` 内框及现有图片切换交互。
- 让首页评论区标题与 Footer Newsletter 标题使用完全一致的字体样式。

## 修改范围

- `assets/editorial-product-hotspots.css`
- `assets/editorial-depth-cards.css`
- `assets/home-customer-reviews.css`
- `sections/home-customer-reviews.liquid`
- `tests/editorial-hotspots.test.ps1`
- `tests/editorial-product-card-layout.test.ps1`
- `tests/home-customer-reviews.test.ps1`

## 调整内容

### 热点商品弹窗

- 打开的热点容器提升到独立高层级，确保其完整弹窗盖住其他兄弟热点按钮。
- 未打开的热点仍然保留在场景图上，关闭弹窗后可继续正常交互。

### 产品卡片

- 移除 hover/focus 状态的外投影。
- 保留 `#ebebeb` 内框、卡片间距、第二张图切换及鼠标离开 0.5 秒后复位逻辑。

### 评论区标题

- 精确复用 Footer Newsletter 的 `font: 500 32px var(--display)`。
- 移除评论标题原有字距和移动端独立字号，避免不同断点下再次产生样式偏差。
- 更新评论区 CSS 缓存版本。

## 代码组织

- 三项调整继续落在各自已有的独立 CSS 模块中，没有向全局样式追加无关覆盖。
- 没有新增公共模块或第三方依赖。

## 自检

- 热点结构及层级回归测试：通过。
- 产品卡片布局测试：通过。
- 产品卡片 0.5 秒复位运行时测试：通过。
- 卡片媒体样式回归测试：通过。
- 评论区结构与标题样式测试：通过。
- JavaScript 语法检查：通过。
- Shopify Theme Check：64 个文件，0 个问题。
- `git diff --check`：通过。
- 正式首页桌面端热点实测：打开项层级为 `9`，其他热点层级为 `5`，弹窗未再被兄弟热点覆盖。
- 正式首页产品卡片 hover 实测：仅保留 `#ebebeb` 1px inset 内框，没有外投影。
- 正式首页卡片离开实测：220ms 时维持 hover，640ms 时完成复位，符合 0.5 秒延时要求。
- 正式首页评论标题实测：与 Footer Newsletter 的字体族、32px 字号、500 字重、行高和字距完全一致。
- 手机端实测：390×844 下标题字体仍一致，热点弹窗位于视口内且保留 14px 安全边距。

## 影响范围

- 首页第二个 Editorial 热点分区。
- 首页 Editorial 产品卡片及 Handpicked 产品卡片的外投影表现。
- 首页底部客户评论区标题。

## 遗留问题

- 无已知代码技术债。
- 已完成正式主题部署与真实页面验证。
