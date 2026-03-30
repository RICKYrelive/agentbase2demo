# Errors Log

Command failures, exceptions, and unexpected behaviors.

## 2026-03-11 | 飞书文档 API 404
- 多个 API 路径返回 404：`/descendants/batch_create`、`/children/batch_create`、`/children/insert`
- 原因：使用了错误或已废弃的端点
- 正确路径：`/blocks/{docId}/descendant`

## 2026-03-11 | 飞书应用 App ID 无效
- 报错：`app id not exists`
- 原因：使用了错误的 App ID（`cli_a5e362b75a38500b`）
- 教训：凭据配置要从可信来源确认，不要猜测

## 2026-03-12 | Scrapling API 适配失败
- social-monitor 和 competitor-tracker 都依赖 Scrapling，但 API 调用方式不对
- 教训：新依赖先写最小 PoC 验证，再集成到系统中

## 2026-03-13 | 推送到错误群
- push-brief.cjs 硬编码了错误的群 ID
- 教训：配置项（群 ID、Webhook）统一从 .env 读取，不要硬编码

## 2026-03-24 | openclaw-weixin 插件加载失败
- 报错：`resolvePreferredOpenClawTmpDir is not a function`
- 原因：插件版本与 OpenClaw 版本不兼容
- 解决：等待插件更新或手动适配

## 2026-03-24 | SearXNG HTTP 000 误判
- curl 5s 超时导致返回 HTTP 000，误判为 SearXNG 挂了
- 实际是搜索请求需要 15-20s
- 教训：网络请求 timeout 要留够余量

## 2026-03-27 | Pipeline 被 SIGTERM
- 完整 pipeline 运行 314s，被 exec 工具的默认超时 kill
- 教训：长任务要用 yieldMs 或 background 模式，不要指望默认超时够用

## 2026-03-27 | RSSHub 全部 ECONNREFUSED
- 端口 1200 的 RSSHub 实例挂了，导致 10 个 RSS 源全部失败
- 教训：关键源应有降级方案（直连 API 备用）
