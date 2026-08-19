# 首页固定比例自定义预览

## 日期

2026-08-19

## 本次目标

在首页第一个 Personalised Art 分区加入独立图片上传和裁剪预览。用户只能选择横版、方形、竖版三个固定比例，裁剪完成后将作品以固定黑色 CSS 外框叠加到左侧现有图片上。

## 修改范围

- `sections/editorial-with-products.liquid`：按分区配置挂载首页预览功能。
- `snippets/home-personalizer-upload.liquid`：首页独立上传界面。
- `snippets/home-personalizer-cropper.liquid`：仅包含三个固定比例的裁剪弹窗。
- `assets/home-personalizer.css`：上传界面、墙面定位和纯黑 CSS 外框。
- `assets/home-personalizer.js`：文件校验、固定比例裁剪、预览和埋点。
- `templates/index.json`：仅为第一个 Personalised Art 分区开启功能。
- `tests/home-personalizer.test.ps1`：功能边界和防回归检查。

## 新增内容

- 支持 JPEG、PNG、WebP，最大 20 MB、20 megapixels。
- 支持拖拽和文件选择上传。
- 支持横版 `1.414:1`、方形 `1:1`、竖版 `1:1.414` 三个固定比例。
- 支持在固定比例下移动和缩放裁剪范围。
- 裁剪后在左图上叠加相同比例的纯黑 CSS 外框，不显示内框或卡纸。
- 新增上传开始、比例选择、裁剪应用、预览应用、删除图片和错误状态埋点。
- 主题后台可调整预览层在左图中的水平位置、垂直位置和宽度，便于后续更换正式场景图。

## 调整内容

- 保留现有 `CREATE YOUR POSTSTER` 按钮及其商品链接，不将按钮改为上传入口。
- 初始状态仍显示原左图；只有完成裁剪后才出现预览叠加层。
- 本阶段不切换新的场景图，后续场景图设计完成后再接入切换。

## 影响范围

- 仅首页第一个 Editorial 分区。
- 首页第二个 Editorial 分区、默认产品详情页和两个自定义产品模板不受影响。
- 本功能只做前端预览，不上传到服务器、不加入购物车、不向商品页传递文件。

## 自检

- 全套 PowerShell 回归测试通过，JavaScript 语法检查通过。
- Shopify Theme Check 检查 62 个文件，0 个问题。
- 桌面端真实上传完成，横版、方形、竖版分别生成约 `1.414:1`、`1:1`、`1:1.414` 的预览外框。
- 真实拖动裁剪区域后可正常输出，固定比例保持不变。
- 裁剪完成后仍使用原场景图，仅叠加 `blob:` 用户图片预览和黑色 CSS 外框。
- 删除图片后预览层、文件信息和临时图片地址全部清除。
- 手机端弹窗显示三个固定比例，无 Free crop，页面无横向溢出。
- `CREATE YOUR POSTSTER` 仍指向 `/products/custom-poster`。
- 浏览器控制台 0 错误、0 警告。

## 遗留问题

- 正式场景图尚未设计，当前预览暂时叠加在原左图上；横版和方形外框周围可能仍看到原图中的旧海报区域。
