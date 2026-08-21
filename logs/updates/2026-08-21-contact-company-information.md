# 2026-08-21 Contact 公司信息

## 本次目标

在 Contact 页面加入可编辑的公司联系信息，并优化表单区域布局。

## 修改范围

- sections/main-contact.liquid
- assets/contact-page.css
- tests/contact-company-information.test.ps1

## 新增内容

- 展示公司名、公司地址、电话和邮箱。
- 电话与邮箱分别支持点击拨打和发送邮件。
- Shopify 主题编辑器可修改标题及四项公司信息，也可隐藏整个信息区。
- 桌面端使用公司信息与表单双栏布局，手机端按信息、表单顺序纵向排列。

## 影响范围

- 仅影响 Contact 页面。
- 不修改 Shopify 原生联系表单提交逻辑、其他页面或 Footer 信息。

## 自检

- 专项测试与其余 20 项 PowerShell 回归测试全部通过。
- 4 项 Node.js 运行时测试全部通过。
- Shopify Theme Check 通过：检查 66 个文件，0 个问题。
- 线上桌面端已验证：公司信息与联系表单左右排列，四项信息完整显示。
- 线上 390px 手机宽度已验证：公司信息在表单上方，无横向溢出。
- 电话与邮箱链接已验证：分别使用 `tel:+447529279167` 和 `mailto:support@posterandform.com`。

## 遗留问题

- 无。
