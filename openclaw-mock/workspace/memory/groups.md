# 群聊 ID 映射表

用于私聊时查询群聊上下文。

---

## 群聊列表

| 名称 | chat_id | sessionKey | 用途 |
|------|---------|------------|------|
| 默认群 | `oc_ede55fae2c573f709e2bf5093f465b92` | `agent:main:feishu:group:oc_ede55fae2c573f709e2bf5093f465b92` | 日常沟通、AI 辅助 |

---

## 飞书机器人信息

- **App ID**: `cli_a92504a18a395bdb`
- **Bot Open ID**: `ou_7cc56088b50daac63b1fb4802826ce06`
- **权限管理**: https://open.feishu.cn/app/cli_a92504a18a395bdb/auth

### 双机器人架构

**1. 飞书应用机器人（双向对话）**：
- 默认群 ID：`oc_ede55fae2c573f709e2bf5093f465b92`
- 配置文件：`~/.openclaw/openclaw.json`
- 管理方式：OpenClaw Gateway 自动管理
- 功能：双向对话、@唤醒、上下文记忆
- 推送脚本：`push-to-feishu-group.mjs`

**2. Webhook 机器人（单向推送）**：
- Webhook 地址：`https://open.feishu.cn/open-apis/bot/v2/hook/f493f62b-0b3b-429d-988d-455e324ceede`（2026-03-13 更新）
- 配置文件：`~/.openclaw/workspace/insight-system/.env`
- 管理方式：独立脚本 + cron 定时任务
- 功能：定时推送简报（单向）
- 推送脚本：`push-via-webhook.mjs`

**3. 定时推送配置**：
- 执行时间：每天 09:00 UTC
- 执行内容：收集 AI 新闻 + 推送到 Webhook 群
- Cron 任务：`0 9 * * * cd ~/.openclaw/workspace/insight-system && node daily-workflow.mjs`
- 日志文件：`/tmp/news-digest.log`

---

## 推送配置

- **默认推送目标**：默认群（`oc_ede55fae2c573f709e2bf5093f465b92`）
- **推送方式**：飞书应用 API（WebSocket 模式）
- **推送频率**：每次新闻收集后自动推送
- **推送内容**：AI 新闻简报（TOP 5 + 关键数据）

---

## 更新记录

- 2026-03-12 12:20: 修复 push-to-feishu-group.mjs 群 ID 配置，从 .env 读取，测试推送成功
- 2026-03-11 17:30: 配置 Webhook 推送，成功推送 AI 简报
- 2026-03-11 16:50: 成功推送首份 AI 新闻简报到默认群
- 2026-03-11: 创建映射表，记录默认群
