# 产品系列页卡片角标与悬停图片

## 日期

2026-08-21

## 本次目标

- 产品系列页卡片左上角增加与首页一致的绿色折扣角标。
- 桌面端悬停时让商品第二张图片铺满整个图片容器。

## 修改范围

- `sections/main-collection.liquid`：复用首页折扣角标数据逻辑并补充商品标识。
- `assets/collection-gallery.css`：统一角标视觉，修正第二张图的尺寸和裁切方式。
- `assets/collection-gallery.js`：新增第二张图片悬停埋点。
- `tests/collection-product-card.test.ps1`：覆盖角标、满铺图片和埋点规则。

## 新增与调整

- 非促销商品使用主题编辑器配置的默认角标文案，默认值为 `Discount`。
- 有 compare-at price 的商品自动显示真实的 `Discount N%`。
- 角标使用首页同款 `#8dc29c` 绿底、白字和大写样式。
- 首图继续保持完整展示；第二张图使用 `object-fit: cover` 覆盖完整容器。
- 新增 `collection_product_hover_image` 埋点，记录系列和商品 handle，每张卡片每次页面访问最多记录一次。

## 影响范围

- 仅影响产品系列页的商品卡片。
- 不修改首页产品卡片、产品详情页或筛选逻辑。

## 自检

- 产品系列页卡片专项测试通过。
- 28 项 PowerShell 回归测试与 5 项 Node.js 运行时测试全部通过。
- Shopify Theme Check：69 个文件，0 个问题。
- 1280×900 真实桌面视口验证通过：角标为 `rgb(141, 194, 156)` 绿底白字，悬停后第二张图透明度为 1。
- 桌面第一张卡片的第二张图与媒体容器尺寸同为 306×397.8px，`object-fit: cover` 生效。
- 390×844 真实手机视口验证通过：保持两列 177px 卡片，无横向溢出，角标字体为 9px。
- 浏览器控制台未发现本次修改引起的错误；仅有 Shopify `shop.app` 第三方 iframe 的既有 CSP/403 提示。
- 三个主题资产已同步至正式主题 `Poster-website/main`。

## 遗留问题

- 暂无。
