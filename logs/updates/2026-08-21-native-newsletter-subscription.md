# 2026-08-21 Shopify 原生邮件订阅

## 本次目标

将页脚 Newsletter 补全为可反馈提交结果的 Shopify 原生邮件订阅表单。

## 修改范围

- sections/footer.liquid
- locales/en.default.json
- assets/poster-theme.css
- tests/footer-native-newsletter.test.ps1

## 调整内容

- 使用 Shopify customer form 提交 `contact[email]`，并写入 `newsletter` 标签。
- 增加 Shopify 原生提交成功状态与表单错误显示。
- 增加邮箱自动填充、无障碍标签和错误关联。
- 增加英文成功提示和专项回归测试。

## 影响范围

- 仅影响全站页脚 Newsletter 表单。
- 不修改客户、订单、购物车、支付、结账或页脚导航内容。

## 自检

- 专项测试与其余 18 项 PowerShell 回归测试全部通过。
- 4 项 Node.js 运行时测试全部通过。
- Shopify Theme Check 通过：检查 66 个文件，0 个问题。
- 线上表单结构已验证：POST 到 Shopify `/contact`，使用 `contact[email]` 并写入 `newsletter` 标签。
- 线上桌面与 390 × 844 手机视口已验证：原有布局保持正常，手机端输入框与按钮纵向满宽显示。
- 未提交测试邮箱，避免向正式客户列表写入无意义数据。

## 遗留问题

- 无。
