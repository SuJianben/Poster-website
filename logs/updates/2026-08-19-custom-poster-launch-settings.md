# 2026-08-19 CSS 自定义产品上线设置

## 本次目标

将 CSS 自定义测试产品调整为正式对客名称，并允许所有尺寸在库存为 0 时继续销售。

## 修改范围

- Shopify 产品 `gid://shopify/Product/8593868226594`。
- 该产品下 5 个尺寸变体的库存销售策略。

## 调整内容

- 产品标题：`Custom Poster – CSS Frame Test` → `Custom Poster`。
- 产品状态保持 `ACTIVE`。
- 产品模板保持 `custom-css`。
- 产品 Handle 保持 `custom-poster-css-frame-test`，避免上线前改变现有链接。
- A4、30×40、50×70、70×100、100×140 五个变体的 `inventoryPolicy` 均由 `DENY` 改为 `CONTINUE`。
- 所有 SKU、价格和库存数量均未修改。

## 影响范围

- 前台产品标题与购买区域显示为 `Custom Poster`。
- 即使尺寸变体库存数量为 0，Shopify 仍允许顾客购买。
- 本次未修改其他产品、订单、客户、付款或结账数据。

## 自检

- Shopify Admin GraphQL 更新返回 0 个 `userErrors`。
- 更新返回值确认 5 个变体均为 `inventoryPolicy: CONTINUE`，库存数量仍为 0。
- 真实店铺页面已显示标题 `Custom Poster`。
- 真实店铺页面的 `Add to cart` 按钮处于可用状态。

## 遗留问题

- 产品 URL 仍包含历史测试 Handle；本次为降低上线风险没有改动。若后续需要品牌化 URL，应单独安排 URL、跳转与 SEO 检查。
