# 首页自定义分区移动端独立描述配置

## 日期

2026-08-21

## 本次目标

- 允许首页 Personalised Art 自定义分区分别配置电脑端和手机端描述。
- 保持已有配置向后兼容，手机字段未填写时不出现空白。

## 修改范围

- `sections/editorial-with-products.liquid`：新增手机描述配置，并增加回退映射。
- `tests/home-personalizer.test.ps1`：覆盖字段暴露、回退逻辑和手机端输出来源。

## 新增内容

- `Homepage personalizer` 配置组新增 `Mobile description` 多行文本框。
- 电脑端继续使用原 `Text` 字段。
- 手机端优先使用 `Mobile description`；留空时自动使用原 `Text` 内容。

## 影响范围

- 仅改变启用上传预览的首页自定义分区手机描述数据来源。
- 不改变现有蒙版样式、电脑端内容、普通 Editorial 分区或上传逻辑。

## 自检

- 首页自定义上传专项测试通过。
- 27 项 PowerShell 回归测试与 5 项 Node.js 运行时测试全部通过。
- Shopify Theme Check：69 个文件，0 个问题。
- 正式主题资产回读确认：`Mobile description` 字段与留空回退逻辑均已生效。
- 前台首页请求返回 200，未配置手机字段时蒙版继续显示原电脑端描述，向后兼容验证通过。

## 遗留问题

- 暂无。
