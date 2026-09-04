# 2026-08-21 自定义产品加购加载卡死修复

## 本次目标

修复自定义产品上传图片并选择内框或外框后，加购抽屉长期停留在“Loading your cart…”的问题。

## 修改范围

- `assets/custom-product-cart.js`
- `assets/cart-drawer.js`
- `assets/custom-product.js`
- `tests/custom-product-cart.runtime.test.cjs`
- `tests/cart-drawer-state.runtime.test.cjs`

## 根因

上传图片的主商品需要先通过 multipart 请求加入购物车，内框和外框随后通过第二次请求加入。旧逻辑在第二次请求中继续使用只适用于“父子商品同一次新增”的 `parent_id`。Shopify 对该请求返回 422，提示不能用变体 ID 引用已经存在的父购物车行。失败分支又没有替换购物车抽屉的加载状态，因此页面看起来一直在加载。

## 调整内容

- 后续加入的内框和外框改为使用主商品返回的真实购物车行键 `parent_line_key`。
- 删除第二次请求中不再适用的 `parent_id` 字段。
- 购物车抽屉新增正式错误状态；请求失败时不再无限显示加载文案。
- 自定义产品加购失败时记录 `custom_product_cart_add_failed` 埋点，包含产品变体、是否上传图片和 HTTP 状态。

## 影响范围

- 仅影响自定义产品上传图片后的购物车父子商品关联与失败反馈。
- 不修改产品、库存、价格、订单、结账或支付数据。
- 不修改默认产品详情页的商品选择和预览逻辑。

## 自检

- 已完成 `custom-product-cart.runtime.test.cjs`：验证第二次附件请求只使用主商品真实 `parent_line_key`。
- 已完成 `cart-drawer-state.runtime.test.cjs`：验证失败状态会替换加载状态。
- 已完成全部 PowerShell 与 Node 回归测试。
- 已完成 `shopify theme check --path .`：66 个文件、0 个问题。
- 已用正式店铺真实 Ajax Cart 接口复现旧请求：主商品 200，旧附件请求 422。
- 已用正式店铺真实 Ajax Cart 接口验证新请求：主商品 200，两个附件均为 200，并正确返回同一父商品的 `parent_relationship.parent_key`。
- 已推送 GitHub 主分支，并确认正式主题同步了三个修复脚本。
- 已在正式产品页核对实际加载的 CDN 脚本版本；三个公开脚本均包含对应修复标记。
- 浏览器自动化环境未能接管系统文件选择器，因此没有重复执行页面内的人工选图动作；核心上传、父商品、附件加入和父子关联已通过同店铺真实 Ajax Cart 请求完成验证。

## 遗留问题

- 无。
