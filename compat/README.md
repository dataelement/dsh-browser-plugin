# 宿主发送适配

0.4.4 同时支持带显式标记的开发版和没有标记的正式版。目标接口：`@deepseek-ai/dsh-client-ui-conversation@0.2.1-rc.2`。

- 优先读取原生主按钮的 `data-dsh-composer-primary="send" | "stop"`。
- 正式版没有标记时，使用宿主公开的 `locale.bind('conversation')`，读取 `input.send`、`input.send.queue`、`input.send.steer` 和 `input.stop`，匹配同一 `data-composer-card` 内的原生按钮 accessible name。排除插件自己的按钮，拒绝未知或重复入口。不依赖硬编码译文和 CSS 生成类名。
- 识别到 Send 时，临时给它加插件私有标记以覆盖原生发送位置；卸载或没有待发批注时撤销。Stop 从不被覆盖。原生编辑器不可编辑时不允许发送批注。
- Enter 与点击走同一发送链路，截图、元素证据、批注和已有输入／附件一起提交；收到接收回执后才清理对应草稿。未知宿主仍禁用批注发送。

**正式版不需要打补丁。** `composer-primary.patch` 仅保留给使用相应版本的开发宿主作为可选显式标记；不要直接修改正式安装包或运行中的 immutable generation。

适配集中在 `src/composer-compat.mjs`。上游提供原生提交扩展 API 后应迁移并移除 DOM 适配。当前仅承诺已验证的宿主契约，不承诺任意未来版本。
