# 独立仓库验证

日期：2026-11-02（America/Los_Angeles）。

- 已通过：独立目录 `npm ci`、`npm run build`、`npm pack`。打包不包含 Profile、node_modules、备份或用户数据。
- 运行时 src 与来源提交逐文件一致；最小宿主标记补丁在临时副本上通过 apply --check、实际应用内容比对和 reverse --check。
- 本机完整回归：82 项，80 通过、2 失败，无跳过或取消。两项失败为配置校验断开与真实 Chrome 重连，随后隔离重跑 2/2 通过。完整回归不据此宣称全绿。清理仅限该次测试遗留的 Chrome 子进程。
- 独立仓库首轮 GitHub Actions：macOS 全部步骤成功；Ubuntu 在真实 Chrome 启动/归档启动测试遇到 runner 的 No usable sandbox；Windows 被矩阵 fail-fast 取消。没有关闭沙箱或减弱断言以获取绿灯。
- 首轮 CI：https://github.com/agentone666-ship-it/dsh-browser-plugin/actions/runs/41596302822

## 组织归属待办

用户明确指定 DataElem 组织（GitHub 标识 `dataelement`）。当前连接账号 `z2993819254-ux` 在该组织建仓返回 HTTP 403；临时仓库所有者 `agentone666-ship-it` 转移私有仓库也返回 HTTP 422，原因是没有创建私有仓库权限。

源代码暂存于私有仓库，尚未进入组织。待管理员授权 `z2993819254-ux` 建仓，或创建 `dataelement/dsh-browser-plugin` 空仓库并授予该账号写权限后，更新仓库元数据、Git remote 及文档链接并推送。原 DSH checkout 和已有上游 PR 未改变。
