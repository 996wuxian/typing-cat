# 打字猫

用 Tauri 2、React、Vite 和 Three.js 构建的 Windows 桌面应用。3D 场景和 GLB 位于上级目录，桌面版与离线 HTML 预览版共用场景逻辑。

## 使用

- 在打字猫窗口内按键，或点击屏幕键帽。
- 窗口平时只显示猫咪、键盘和鼠标。按 `Esc` 显示或隐藏浮动菜单。
- 菜单里的「方案」可在 3D 灰猫套装与 2D 夜猫套装之间切换。下次打开会恢复上次选择。
- 打开菜单里的「后台打字」开关后，其他窗口里的物理按键会实时触发对应的键帽和浮字。应用只处理模型上有的键位，不转换或保存输入文本。
- 按住键时，猫爪持续按住键帽，松手后再抬起。
- 闲置约 10 秒后，猫咪会闭眼打盹，头旁会飘起 Zzz。打字、移动鼠标、点击或抚摸会唤醒它。
- 按住猫咪头部拖动可以抚摸。长按会触发脸红、冒爱心和喵叫。快速敲键时，猫咪会眯眼，头旁会浮出生气符号。
- 夜猫生气时，身后还会冒出火焰和火星。
- 一只爪握住鼠标时，另一只爪负责键盘。
- 连按三次句号会让猫咪无语，连按三次退格或删除会让猫咪露出委屈的表情。
- Windows 桌面版在失焦后也会跟随各显示器上的光标，并响应左右键的点击和长按。
- 在菜单里可以将窗口大小设为 50% 到 120%。默认 65%，设置会在下次启动时恢复。
- 按住 `Alt` 并用鼠标左键拖动可以移动窗口。

## 开发与打包

从 `desktop` 目录执行以下命令。Windows 构建需要 MSVC C++ Build Tools 和 WebView2。

```powershell
npm ci
npm run tauri:dev
npm run release
```

`npm run release` 把免安装程序放到 `releases/v<版本>/typing-cat.exe`。例如当前版本是
`releases/v1.1.0/typing-cat.exe`。`src-tauri/target` 是构建目录。
`npm run release:installer` 还会把 Windows 安装包放进同一个版本目录。

把 `desktop/package.json` 的版本变更推送到 `main` 后，GitHub Actions 的 Release 工作流会构建并发布 Windows 免安装版和 NSIS 安装包。

应用图标原图在 `src-tauri/icons/icon-source.png`。更新原图后，用带 Pillow 的 Python 运行
`python scripts/build-icon.py` 生成 Windows 多尺寸 ICO 和 PNG。
