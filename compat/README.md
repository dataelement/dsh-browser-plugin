# 宿主兼容接缝

目标：`@deepseek-ai/dsh-client-ui-conversation@0.2.1-rc.2`。原生主按钮需增加：

```js
"data-dsh-composer-primary": primaryStops ? "stop" : "send",
```

仅增加状态标记，不移动公共 slot、不改变原生处理器和权限。插件据此区分发送和停止；无标记时禁用批注发送。

在相应 DSH Desktop 开发仓库完成依赖安装和已有补丁重放后：

```sh
git apply --check /path/to/dsh-browser-plugin/compat/composer-primary.patch
git apply /path/to/dsh-browser-plugin/compat/composer-primary.patch
npx patch-package @deepseek-ai/dsh-client-ui-conversation
# 按宿主规范重建、验证并启动 Desktop
```

检查失败时先核对版本或标记是否已存在，不强制覆盖。不直接修改正式安装包和运行中的 immutable generation。已含 PR #796 接缝的宿主不必重复应用。

此处只带最小补丁；其他 Desktop 补丁仍由宿主维护。适配器集中在 `src/composer-compat.mjs`。上游提供等价公开提交 API 后，迁移适配器并移除该标记补丁。
