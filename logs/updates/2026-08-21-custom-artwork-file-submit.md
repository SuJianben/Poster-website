# 2026-08-21 自定义裁剪图片加购修复

## 本次目标

修复自定义商品完成图片裁剪后，加购显示“无法加入购物车”的问题。

## 修改范围

- `assets/custom-product-cart.js`
- `assets/custom-product.js`
- `assets/cart-drawer.js`
- `tests/custom-product-cart.runtime.test.cjs`
- `tests/cart-drawer-state.runtime.test.cjs`

## 根因

本次真实页面排查确认存在两个连续问题：

1. 图片裁剪完成后，上传控件会清空原始文件输入框，裁剪后的文件由上传模块单独保存。购物车模块虽然能检测到该文件，但构造 Shopify multipart 请求时只读取了已经清空的产品表单，没有把裁剪后的文件重新写入 `properties[Custom artwork]`，导致主商品上传请求失败。
2. 文件补回后，主商品、内框和外框实际均已成功加入；紧接着用于刷新抽屉的 `/cart.js` 请求收到 Shopify `429` 限流。旧逻辑将这个只读刷新失败误报成整个加购失败，顾客重试后反而会重复加入商品。

## 调整内容

- 将上传模块保存的裁剪文件显式写入主商品 multipart 请求。
- 保留裁剪后的文件名和 Shopify 文件属性字段名。
- 保留上一轮已完成的内框、外框 `parent_line_key` 父子关联逻辑。
- 仅对 `/cart.js` 的 `429` 响应执行 400、800、1600 毫秒的有限退避重试；不会重复提交任何加购请求。
- 持续限流时，不再把已经成功的加购误报为失败；抽屉显示正式成功状态、购物车入口并更新可见商品数量。
- 失败分支增加不包含图片内容或用户数据的结构化控制台日志，便于读取 HTTP 状态并继续定位。
- 增加“原文件输入框为空，但裁剪文件仍被提交”的运行时回归断言。

## 影响范围

- 仅影响上传并裁剪图片后的自定义商品加购。
- 不修改普通商品加购、产品数据、价格、库存、订单、结账或支付数据。

## 自检

- `custom-product-cart.runtime.test.cjs`：通过，覆盖裁剪文件补回、附件父子关联、一次 429 后重试成功、持续 429 时不重复加购。
- `cart-drawer-state.runtime.test.cjs`：通过，覆盖加载、错误和已确认加购的成功兜底状态。
- JavaScript 语法检查：通过。
- Shopify Theme Check：66 个主题文件，0 个问题。
- 正式页面真实链路：完成图片上传、固定比例裁剪、A4、白色内框、白色木框和加购。
- 正式页面持续收到购物车刷新限流时，抽屉显示 `Added to cart`、`View cart` 和 `Continue shopping`，未再显示加购错误。
- 正式页面未产生新的 `Custom product cart add failed` 日志，可见购物车数量正常增加。
- 另有两个既有首页 PowerShell 测试无法解析 Shopify 自动生成的 `index.json` 说明注释；与本次购物车文件无关，本次未扩散修改。

## 遗留问题

- 无。
