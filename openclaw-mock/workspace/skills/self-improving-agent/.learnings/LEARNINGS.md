# Learnings Log

Captured learnings, corrections, and discoveries. Review before major tasks.

## 2026-03-11 | 飞书文档 API 路径陷阱
- 飞书 DocX API 写入端点是 `/descendant`（单数），不是 `/descendants`（复数）
- block_id 需要自己生成，格式如 `doxcn_${timestamp}_${index}`
- block_type: 2 是简单文本块，最稳定

## 2026-03-11 | 双机器人架构
- 飞书 Webhook 机器人（单向推送）和飞书应用机器人（双向对话）是两套独立体系
- Webhook 只能往绑定的群推送，不能指定群；应用 API 可以指定群
- Webhook 无需 token，但功能有限；应用 API 需要权限配置

## 2026-03-12 | 模块化优于单体
- 洞察简报从单文件拆成 6 个独立模块后，可测试性、可维护性大幅提升
- 每个模块独立运行、独立文档，改一个不影响其他
- 教训：一开始就应该模块化设计

## 2026-03-13 | 飞书文档权限
- 新创建的飞书文档默认只有创建者可见，必须调用 permissions API 共享给群聊
- `member_type: "openchat"` + 群 ID + `perm: "view"`

## 2026-03-23 | SearXNG 慢但不挂
- SearXNG 响应时间 ~15-20s，curl 默认超时太短会导致 HTTP 000
- 解决：增加 timeout 到 20s+；HTTP 000 不等于服务挂了

## 2026-03-24 | self-improvement skill 在 OpenClaw 上有效
- 之前误判为"不兼容"，实际是通过 bootstrap hook 注入 prompt 提醒
- 它是 prompt engineering skill，不是自动化监控工具
- 关键在于 LLM 是否养成主动记录的习惯

## 2026-03-24 | RSSHub 端口 1200 不稳定
- RSSHub 经常挂掉，直连 API 更可靠
- 36kr 热榜有开放 API：`https://openclaw.36krcdn.com/media/hotlist/{date}/24h_hot_list.json`
- 关键数据源应优先考虑直连 API，RSSHub 作为补充

## 2026-03-25 | OpenCLI 不适合云部署
- OpenCLI 依赖本地 Chrome 浏览器 + 扩展 + daemon 架构
- Chrome 扩展不支持 headless 模式，云服务器无法使用
- 核心价值是复用浏览器登录态，适合本地开发场景

## 2026-03-25 | mem0 对当前场景无价值
- OpenClaw 已有 LCM 语义检索 + MEMORY.md + memory/ 目录
- mem0 需要额外部署向量数据库，增加复杂度
- 单用户、低频记忆场景下，Markdown + LCM 是最优解

## 2026-03-27 | 时效过滤应在 curate 阶段做
- 新闻类采集最好在分类筛选阶段加时间过滤（如 3 天内）
- 过期数据进入 LLM 分类会浪费 token 且降低质量
- 实现：在 curate.mjs 的 filter 步骤加 cutoff 日期判断

## 2026-03-27 | Pipeline 耗时控制
- 完整 pipeline（collect+curate+present）可能超过 5 分钟
- exec 工具有默认超时，长任务需要设 yieldMs 或用后台模式
- LLM 分类是瓶颈：每批 20 条，每批 60s timeout
