# 独立仓库验证

日期：2026-11-02（America/Los_Angeles）。

- 已通过：独立目录 `npm ci`、`npm run build`、`npm pack`。打包不包含 Profile、node_modules、备份或用户数据。
- 运行时 src 与来源提交逐文件一致；最小宿主标记补丁在临时副本上通过 apply --check、实际应用内容比对和 reverse --check。
- 本机完整回归：82 项，80 通过、2 失败，无跳过或取消。两项失败为配置校验断开与真实 Chrome 重连，随后隔离重跑 2/2 通过。完整回归不据此宣称全绿。清理仅限该次测试遗留的 Chrome 子进程。
- 独立仓库首轮 GitHub Actions：macOS 全部步骤成功；Ubuntu 在真实 Chrome 启动/归档启动测试遇到 runner 的 No usable sandbox；Windows 被矩阵 fail-fast 取消。没有关闭沙箱或减弱断言以获取绿灯。
- 首轮 CI：https://github.com/dataelement/dsh-browser-plugin/actions/runs/41596302822

## 组织归属

2026-11-03 已确认使用账号 `agentone666-ship-it`，接受 `dataelement`（DataElem）的组织邀请后，将原临时私有仓库迁入组织：

https://github.com/dataelement/dsh-browser-plugin

已验证仓库归属、私有状态与该账号写权限，随后更新 package.json 仓库元数据及 Git remote。原提交历史保留，上游 Desktop PR 与已有插件安装不改变。原先按另一账号排查的权限阻塞已经解除；CI 的平台验证限制仍见上文。
