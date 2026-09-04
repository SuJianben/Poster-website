# 海报站项目进度

更新时间：2026 年 8 月 12 日

## 一、项目总体状态

当前项目处于“前端主题基本完成、后台真实内容持续补齐”的阶段。

- 前端：✅ 已完成主要页面、核心样式和交互移植。
- Shopify 主题：✅ 已通过当前 Theme Check，并已发布到 `mytest-test-two.myshopify.com` 的 `Poster-website/main` 主题。
- 后台数据：🔄 已有真实产品、真实产品系列和部分导航基础，但首页分区、博客内容、素材和部分产品配置仍需在 Shopify 后台继续补齐。
- 上线准备：🔄 可以继续做后台内容录入和最终全站验收，暂不建议视为“所有运营数据已完成”的最终上线状态。

## 二、前端已完成内容

### 1. 首页

- Hero 海报轮播：支持桌面端和移动端布局、缩略图、切换交互和响应式显示。
- Category rail：支持分类卡片、图片、标题和链接配置。
- Tilted carousel：支持产品系列选择、产品卡切换、点击产品进入详情、`View poster` 跳转系列页。
- Editorial with products：支持生活方式图片、文案、产品卡和系列选择，并保留未配置时的源码 fallback。
- Footer：已完成 Newsletter、链接列、移动端布局和响应式样式。
- Header：已完成桌面导航、移动端菜单、搜索入口和购物袋入口。

### 2. 系列页与博客页

- 产品系列页使用统一的产品网格模板。
- 支持系列标题、描述、分类导航、Gallery/View 切换、筛选、排序、分页和产品卡 hover 第二张图。
- 产品系列 SEO 文案支持从 Shopify 系列数据读取，并提供 fallback。
- 博客系列页复用系列页产品网格视觉结构，并支持 Shopify 文章数据读取；没有真实文章时保留 fallback 内容。

### 3. 普通页、文章页和 Contact 页

- 普通页面使用统一内容模板。
- 面包屑、正文图片、正文宽度和图片居中样式已调整。
- Contact 页使用独立模板，包含 Shopify 原生 contact form 和自定义图片区域。
- 文章详情页支持文章首图在正文前渲染，并使用普通内容页布局。

### 4. 商品详情页

- 左侧商品图库、缩略图、左右箭头和可拖动切换已完成。
- 主图切换已修复“先闪空再切图”的问题：目标图片预加载完成后再替换，快速连续点击也不会被旧请求覆盖。
- 商品详情左侧包含图库区和 Product details / Shipping and returns 折叠区。
- 右侧商品信息已接入 Shopify 商品标题、品牌、价格、对比价、库存变体和商品媒体。
- Size 选项读取 `product.options_with_values`，并按 Shopify 真实变体选择更新。
- Frame 和 Passepartout 已改为参考源码式下拉选择器，支持名称、尺寸、价格、选中状态和点击外部关闭。
- Passepartout 选择后可以同步主图内框预览；Frame 选择后可以同步外框预览。
- 已保留“定制选项自动跳到最后一张纯净图”的交互逻辑。
- 数量选择器、Add to cart、Summer offer、支付保障区和商品详情折叠区已完成视觉和交互移植。

### 5. 购物车、搜索和移动端

- 购物车抽屉和购物车页面已按参考页面完成主要布局、数量更新、自动更新和推荐产品区。
- 搜索入口改为页面内搜索覆盖层，不再直接跳转到搜索页；支持点击屏幕外关闭。
- 搜索结果支持真实产品渲染和产品卡展示。
- 首页、系列页、商品详情页和购物车主要移动端布局已做适配，包括移动菜单和横向滑动区域。

## 三、Shopify 后台真实数据现状

### 已有真实数据

- 已导入并使用 Shopify 产品数据。
- 已创建按产品类型自动归类的系列：
  - Abstract Posters
  - Floral Posters
  - Landscape Posters
  - Figurative Posters
  - Still Life Posters
  - Urban Posters
  - Time Series Posters
- 以上 7 个系列当时合计覆盖 100 个产品，并已补充系列封面图、发布到 Online Store 渠道。
- 另有按标签创建的系列：Movie Posters、Music Posters、Anime Posters、Horror Posters、Space Posters、TV Series Posters。
- 商品详情页已经读取真实产品媒体、价格、供应商和 Shopify 变体。

### 仍需补齐的后台数据

1. 首页 Featured products 尚未在主题编辑器中选择实际产品系列，当前代码允许选择，但首页模板中默认设置为空。
2. 两个 Editorial with products 分区尚未全部绑定真实产品系列，未绑定时仍会显示 Figma fallback 海报。
3. Hero 和 Category rail 仍保留 Figma 资源名 fallback；需要确认最终是否全部改为 Shopify 后台图片与链接。
4. Customer gallery、推广卡等内容需要在主题编辑器中逐项上传真实图片、标题、头像和跳转链接。
5. 博客需要补充真实 Blog、文章、文章首图、作者和分类标签；当前无文章时仍会显示 fallback 文章卡。
6. Header、Footer 的菜单需要确认线上 Shopify 菜单是否已经绑定完整，并检查每个链接是否指向正式页面。
7. Frame、Passepartout、Material 等定制选项目前主要用于前端预览和展示；如果要影响真实价格、库存和订单，还需要继续映射到 Shopify 真实变体或产品选项。
8. 系列 SEO 标题、SEO 描述和 SEO 正文需要在 Shopify 系列数据或主题设置中补齐并最终审核。

## 四、当前线上与验证记录

- 商店：`mytest-test-two.myshopify.com`
- 主题：`Poster-website/main`
- 主题 ID：`157726048445`
- 最近已验证的商品：`isabelle-vandeplassche-chair-with-fruit`
- 最近一次 Theme Check：40 个文件检查，0 个问题。
- 商品页真实验证内容：箭头切图无透明闪烁；Frame 下拉可以打开并选择 Oak frame；Passepartout 下拉可以打开并选择 White passepartout；选择后菜单关闭、名称价格同步、主图内框状态更新。
- 当前版本备份：`D:\CODEX项目\海报站备份\2026-08-03-mat-dropdown-after`

## 五、下一阶段建议

1. 先在 Shopify 主题编辑器中为首页 Featured products 和两个 Editorial 分区选择真实系列，关闭不再需要的 fallback。
2. 补齐 Hero、Category、Customer gallery、推广卡、博客和 Footer/Header 菜单的真实素材与链接。
3. 为 Frame、Passepartout、Material 建立真实变体映射，确认价格、库存、加购提交与前端显示一致。
4. 完成一次桌面端和移动端全站验收：首页、系列页、博客、文章、普通页、Contact、商品详情、搜索、购物车和抽屉。

## 六、结论

目前不是“前端还没做完”，而是“前端主题主体已经完成，后台内容和真实商品配置还需要补齐”。页面视觉与交互已经具备继续填充真实运营数据的基础；下一步重点应从继续改样式，转向 Shopify 后台数据绑定、真实变体映射和全站发布前验收。
