<h1 align="center">打字猫 · Typing Cat</h1>

<p align="center">一只住在 Windows 桌面上的猫。它会跟着你敲键盘、用鼠标，闲下来就打盹。</p>

<p align="center">
  <strong><a href="https://github.com/996wuxian/typing-cat/releases">下载 Windows 版</a></strong>
  &nbsp;·&nbsp; <a href="#快速上手">快速上手</a>
  &nbsp;·&nbsp; <a href="#本地开发">本地开发</a>
</p>

<table align="center">
  <tr>
    <td align="center">
      <img src="assets/readme/midnight-typing.png" height="240" alt="夜猫按住键盘，胸前飘起 Ctrl 键帽" />
      <br /><strong>夜猫打字</strong>
    </td>
    <td align="center">
      <img src="assets/readme/midnight-napping.png" height="240" alt="夜猫闭眼打盹，头旁飘起 Zzz 字母" />
      <br /><strong>夜猫打盹</strong>
    </td>
  </tr>
</table>

## 快速上手

1. 打开 [GitHub Releases](https://github.com/996wuxian/typing-cat/releases)。下载 `typing-cat.exe` 可直接运行，也可以选择名称以 `-setup.exe` 结尾的安装包。
2. 在猫咪窗口内打字，或直接点击画面中的键帽。按 `Esc` 打开菜单，可在 **3D 灰猫 · 深灰键盘** 和 **2D 夜猫 · 奶白键盘** 之间切换，也可以调整窗口大小。
3. 想让猫咪跟着其他窗口里的键盘输入动起来，可以开启「后台打字」。应用只响应支持的键位，不转换或保存输入文本。

按住 `Alt` 并用鼠标左键拖动，可以把猫咪挪到桌面的其他位置。

关闭窗口或按 `Alt+F4` 会最小化到任务栏。点击任务栏图标或再次启动打字猫即可恢复窗口。要结束应用，可右键通知区域的猫咪图标，选择「退出打字猫」。

## 试试这些互动

| 操作 | 猫咪的反应 |
| --- | --- |
| 按住键盘上的键 | 猫爪会按住对应的键帽，松手后再抬起。按下的键会变成飘字。 |
| 移动或点击鼠标 | 猫咪会跟随光标，用一只前爪操作鼠标。 |
| 按住猫咪的头轻轻拖动 | 抚摸一会儿，它会脸红、冒爱心，还会喵叫。 |
| 快速敲键 | 猫咪会眯眼生气，夜猫身后还会冒出火焰和火星。 |
| 连按三次 `.`、`Backspace` 或 `Delete` | 句号会让它无语，退格和删除会让它露出委屈的表情。 |
| 闲置约 10 秒 | 猫咪会闭眼打盹，头旁飘起 `Zzz`。打字、移动鼠标、点击或抚摸都能唤醒它。 |

## 本地开发

桌面应用使用 Tauri、React、Vite 和 Three.js。Windows 构建需要 Node.js、Rust、MSVC C++ Build Tools 和 WebView2。

```powershell
cd desktop
npm ci
npm run tauri:dev
```

构建免安装版、NSIS 安装包和 GitHub Releases 的相关说明见 [桌面版开发与打包](desktop/README.md#开发与打包)。
