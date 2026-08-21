# 自定义商品购买区子级块改造

## 日期

2026-08-21

## 本次目标

- 补充上一轮范围遗漏，将自定义商品详情页右侧购买信息栏也改为可添加、删除和排序的 Shopify 子级块。
- 保留自定义图片上传、裁剪、预览、画框和原子化加购链路。
- 让优惠表格与服务说明沿用默认商品相同的可配置能力。

## 修改范围

- `sections/custom-product-main.liquid`：购买区改为遍历 `section.blocks`。
- `snippets/custom-product-purchase-block.liquid`：新增自定义商品子块适配层；上传块使用专属渲染，其余控件复用公共购买区模块。
- `snippets/custom-artwork-upload.liquid`：上传文案和必传设置迁移到 `Artwork upload` 子块。
- `snippets/custom-artwork-cropper.liquid`：裁剪弹窗文案迁移到同一子块配置。
- `templates/product.custom.json`、`templates/product.custom-css.json`：写入完整默认子块和原有排序。
- `assets/custom-product.js`：支持删除购买按钮等可选子块后的空节点状态，并增加优惠展开埋点。
- `assets/custom-product.css`：补充公共子块容器样式。
- `tests/custom-product-purchase-blocks.test.ps1`：覆盖自定义区块、两套模板、上传配置及公共模块复用。

## 新增内容

- 自定义商品支持促销角标、评论、标题、艺术家、价格、配送提示、图片上传、材质、尺寸、其他规格、卡纸、画框、悬挂套件、数量、购买按钮、数量优惠、服务说明和支付方式子块。
- `Artwork upload` 子块可配置上传区和裁剪弹窗的全部主要可见文案，以及是否必须上传图片。
- 数量优惠和服务说明复用默认商品公共模块，避免两套页面出现重复逻辑和后续配置不一致。

## 影响范围

- 影响 `product.custom` 与 `product.custom-css` 两套自定义商品模板。
- 默认商品继续使用上一轮已完成的公共购买区模块，视觉和配置不变。

## 自检

- 全部 PowerShell 与 Node 回归测试通过。
- Shopify Theme Check：69 个文件，0 个问题。
- 相关主题资产已成功上传到主题 `189377019938`。
- 上传完成后店铺自定义域名与 MyShopify 域名均出现 SSL/连接中断，浏览器和命令行均无法建立新连接，因此本轮无法完成真实图片上传与加购复测。
- 已停止重复刷新并恢复被临时复用的浏览器标签页，未向购物车写入测试商品。

## 遗留问题

- 待店铺连接恢复后补做一次真实链路：图片上传、裁剪确认、规格选择、自定义图片加购、购物车图片与备注检查、测试商品移除。
