# DSH 浏览器插件

在 DSH 对话旁浏览网页、选中元素写批注，将 **截图＋元素信息＋批注** 一起发给模型。

- 右侧新标签页 **+ → 浏览器** 打开；同一入口也可选择文件或终端。
- 支持网址、关键词搜索、多标签页、前进后退。
- 点击元素或拖动区域，在元素旁的气泡中写修改要求，Enter 保存。
- 鼠标移回网页，按住空格可临时点击网页，松开继续批注。
- 输入框注释标签用浮窗展示截图和批注，一次发送，无额外确认。
- 聊天记录显示可读摘要，保留截图复查入口。

## 兼容要求

提取自 [DSH Desktop PR #796](https://github.com/dataelement/dsh-desktop/pull/796) 的 0.4.2 版本。已验证宿主为 Desktop 0.12.1 / Harness 0.2.1-rc.2。

**宿主须带有最小的 Send/Stop 状态标记。** 独立仓库不代表任意 DSH 版本都能直接发送批注。参见 [兼容补丁](compat/README.md)。缺少标记时禁用批注发送，保留普通聊天。上游 PR 状态以 GitHub 为准。

需要 Node.js 22+，以及本机 Chrome、Edge 或 Chromium。插件不下载浏览器。

## 安装：使用成品包

**请不要在插件安装框中填本仓库的 GitHub 首页地址。** 源码仓库含开发构建脚本，pnpm 11 会要求额外的 Git 构建授权并报 `ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED`。

1. 在 [Releases](https://github.com/dataelement/dsh-browser-plugin/releases) 下载 `dsh-page-review-0.4.3.tgz`。
2. 在 DSH 插件安装框中填该文件的本机绝对路径，例如 `/Users/你的用户名/Downloads/dsh-page-review-0.4.3.tgz`；Windows 使用实际的完整路径。宿主支持直接访问的公开 `.tgz` 下载链接时，也可填该链接。
3. 安装成功后启用插件，在右侧 **+ → 浏览器** 打开。宿主仍需满足上文的兼容要求。

仓库为私有时，请先通过已登录的 GitHub 浏览器下载文件，再使用本地路径；不要把需要登录的下载链接直接交给 DSH。成品包已包含后端、客户端及许可证，无运行时依赖，也无需在目标 Profile 放开 Git 构建脚本。

## 开发构建与验证

```sh
npm ci
npm run build
npm test
npm pack
```

在满足兼容要求的 DSH 中，用插件管理器安装生成的 `dsh-page-review-0.4.3.tgz` 并启用，重启后选择右侧 **+ → 浏览器**。插件是可选项，不默认启用。

开发时，可链接到明确指定的独立测试 Profile：

```sh
DSH_REVIEW_PROFILE=/path/to/test/harness/profiles/web node install-local.mjs
# 移除尚未迁移为 generation 的开发链接，保留批注数据
DSH_REVIEW_PROFILE=/path/to/test/harness/profiles/web node install-local.mjs --remove
```

宿主将插件迁移为 immutable generation 后，请通过插件管理器更新、禁用或移除；脚本会拒绝覆盖受管理的链接。

## 范围与数据

当前支持网页批注。PDF / Word / Markdown 文件预览批注、侧边聊天和会话通信不在本仓库范围内。

浏览器使用独立配置目录；批注和截图保存在 `$DSH_HOME/page-review/`。截图可能包含私人内容，请发送前通过浮窗检查。成功发送表示 DSH 接收了材料，图片理解取决于所选模型。

源码独立维护；不提交生成的 lib、node_modules、Profile、凭据、备份或用户会话。包名保留 `dsh-page-review`，兼容已有安装和数据目录。

## 文档

- [English documentation](README.en.md)
- [兼容补丁与说明](compat/README.md)
- [来源及拆仓决策](docs/provenance.md)
- [历史桌面验收与限制](docs/validation.md)
- [独立仓库验证](docs/standalone-validation.md)

遵循 [MIT License](LICENSE)，保留原版权声明。
