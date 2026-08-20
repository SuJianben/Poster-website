# 2026-08-20 首页自定义场景切换与 Handpicked 白底调整

## 本次目标

- 用户确认裁剪后，将首页自定义分区左图切换为空墙场景图。
- 在新场景图上显示裁剪后的用户图片，并继续使用固定黑色 CSS 外框。
- 将 Handpicked 分区卡片的媒体背景从灰色改为白色。

## 修改范围

- 首页自定义分区的场景图结构、场景切换控制、预览位置配置和埋点字段。
- Handpicked 分区卡片的媒体背景色。
- 对应的回归测试。

## 新增内容

- 新增独立场景控制模块 `assets/home-personalizer-scene.js`，仅负责初始图与上传后场景图的状态切换。
- 新增主题后台配置项“Scene image after upload”，方便后续替换场景图。
- 场景图已保存至 Shopify Files，文件名为 `home-personalizer-scene-after-upload.jpg`。

## 调整内容

- 首页默认仍显示原有自定义宣传图；用户完成上传和固定比例裁剪后才切换为空墙场景。
- 点击 Remove 后恢复原有宣传图，同时清空墙面预览。
- 新场景默认海报位置调整为横向 60%、纵向 31%、宽度 38%，以上参数均可在主题后台调整。
- `home_personalizer_preview_applied` 埋点增加 `scene_state`，用于区分是否成功进入新场景。
- Handpicked 卡片媒体背景改为纯白色，分区本身的背景和其他样式未改动。

## 影响范围

- 仅启用 Homepage personalizer 的 Editorial with products 分区会加载并使用场景切换逻辑。
- 未启用该功能的第二个 Editorial 分区不受影响。
- Handpicked 卡片仅改变媒体容器背景色。

## 自检

- `tests/home-personalizer.test.ps1`：通过，覆盖主题配置、场景切换调用和固定比例裁剪约束。
- `tests/card-media-style.test.ps1`：通过，确认 Handpicked 卡片使用白色媒体背景。
- `node --check`：两个首页自定义脚本均通过语法检查。
- `shopify theme check`：63 个主题文件通过检查，无错误与警告。
- `git diff --check`：通过。
- 正式首页桌面端真实链路：上传测试海报、选择固定纵向比例、确认裁剪后成功切换为空墙场景，并显示固定黑色 CSS 外框。
- 正式首页移除链路：点击 Remove 后成功隐藏用户预览并恢复原宣传图。
- 正式首页移动端 390×844：场景和上传区域宽度正常，无横向溢出。
- 正式页面 Handpicked 卡片的计算背景色为 `rgb(255, 255, 255)`。
- 正式页面浏览器控制台：无 warning / error。

## 遗留问题

- 当前海报在空墙场景中的默认位置来自本次图片估算；后续可直接在主题编辑器中微调，无需改代码。
