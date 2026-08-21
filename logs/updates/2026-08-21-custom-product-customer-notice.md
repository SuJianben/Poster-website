# 2026-08-21 自定义产品 Customer Notice

## 本次目标

仅将自定义产品详情页的 Product details 折叠项替换为英文 Customer Notice，默认产品详情页保持原样。

## 修改范围

- sections/custom-product-main.liquid
- templates/product.custom.json
- templates/product.custom-css.json
- tests/custom-product-customer-notice.test.ps1

## 调整内容

- 自定义产品折叠项不再读取商品描述，改为读取独立的 Customer Notice 富文本设置。
- 两个自定义产品模板明确配置相同的英文标题和六点用户须知。
- 内容覆盖图片版权或授权、禁止内容、拒绝涉嫌侵权订单、文件保存与删除程序、生产所需有限许可，以及投诉下架流程。
- 保留主题编辑器配置能力，后续可单独调整标题或内容。

## 影响范围

- 仅影响 product.custom 与 product.custom-css 两个自定义产品模板。
- 不修改默认产品 section、默认产品模板、商品描述、上传、裁剪、装裱、购物车、价格或结账逻辑。

## 自检

- 专项测试通过；其余 17 项 PowerShell 回归测试全部通过。
- Shopify Theme Check 通过：检查 66 个文件，0 个问题。
- 线上自定义产品页已验证：Customer Notice 可正常展开，六条英文须知完整显示。
- 线上默认产品页已验证：仍显示 Product details，未出现 Customer Notice。

## 遗留问题

- 无。
