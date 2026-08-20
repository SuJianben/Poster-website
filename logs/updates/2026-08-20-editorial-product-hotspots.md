# 2026-08-20 Editorial 产品热点与产品卡片交互调整

## 本次目标

- 将首页第二个 Editorial 分区的场景图升级为可配置产品热点。
- 点击热点后显示产品图片、规格、价格、加入购物车及查看详情入口。
- 产品卡片折扣角标改为白色文字，鼠标离开 0.5 秒后再复位 hover 效果。

## 修改范围

- Editorial 分区热点数据结构与主题后台配置。
- 热点快速购买组件、定位样式、交互、购物车联动与埋点。
- Editorial 产品卡片角标和 hover 离开逻辑。
- 首页第二个 Editorial 分区的三个初始热点。
- 对应回归测试。

## 新增内容

- `snippets/editorial-product-hotspot.liquid`：单个热点和产品快速购买卡片。
- `assets/editorial-product-hotspots.css`：热点、产品卡片及移动端底部面板样式。
- `assets/editorial-product-hotspots.js`：热点开关、自动左右定位、规格更新、AJAX 加购和埋点。
- `tests/editorial-hotspots.test.ps1`：热点结构与配置回归测试。

## 调整内容

- 主题编辑器可为每个热点选择 Shopify 产品并配置横纵位置。
- 首页第二个 Editorial 分区预置 Pink Flowers、You、Composition 01 三个热点，后续可在后台更换。
- 热点打开、规格选择、加购成功和失败分别写入清晰的 `editorial_hotspot_*` 埋点。
- 快速购买使用全站现有 CartDrawer 公共接口，不重复维护购物车状态。

## 影响范围

- 只有添加了 Product hotspot block 的 Editorial 分区会加载热点资源。
- 首页自定义上传 Editorial 分区不添加热点，不受影响。
- 产品卡片调整仅影响 Editorial 分区下方产品卡片。

## 自检

- `tests/editorial-hotspots.test.ps1`：通过，覆盖热点配置、产品表单、购物车联动与埋点。
- `tests/editorial-product-card-layout.test.ps1`：通过，覆盖白色角标与指针状态样式。
- `tests/editorial-depth-hover-delay.test.cjs`：通过，模拟鼠标进入、移出、0.5 秒复位和快速重入取消复位。
- `tests/card-media-style.test.ps1`：通过。
- 两个相关 JavaScript 文件及运行时测试均通过 `node --check`。
- `shopify theme check`：64 个主题文件检查通过，无错误与警告。
- `git diff --check`：通过。
- 待部署后完成正式首页热点打开、规格切换、关闭、移动端以及产品卡片 hover 的真实链路检查。

## 遗留问题

- 三个预置热点产品根据当前场景图内容选择，运营可在主题编辑器中随时替换并微调位置。
