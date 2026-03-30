# Insight Brief v2 — 架构说明

## 概述

AI 领域每日洞察简报系统，每天北京时间 08:00 自动运行，从多个数据源采集资讯，经 LLM 分类筛选后生成结构化简报，推送飞书。

## 三阶段流水线

### Stage 1: COLLECT（多源采集）

并行执行所有启用的 collector，每个输出 `data/raw/YYYY-MM-DD-{name}.json`。

| Collector | 类型 | 数据源 |
|-----------|------|--------|
| ai-rss | RSS | 知乎热榜/日报、36氪、虎嗅、爱范儿、少数派、IT之家、掘金、B站 |
| general-rss | RSS | IT之家资讯、TechCrunch、Wired |
| arxiv-papers | arXiv API | LLM/Agent 相关论文（关键词过滤） |
| competitors | SearXNG | 阿里云/字节/腾讯/百度/讯飞 |
| customer-cases | SearXNG | AI 落地案例 |
| social-hot | SearXNG | 微博 AI 热搜 |

### Stage 2: CURATE（分类筛选）

1. 合并所有 collector 输出
2. 按 URL 去重
3. 过滤无效条目（热榜导航、广告等）
4. 调用智谱 GLM API 逐条分类（5 类 + discard）
5. 输出 `data/curated/YYYY-MM-DD.json`

### Stage 3: PRESENT（生成报告）

读取 curated JSON，按分类分组，生成带 Emoji 标题的 Markdown 报告：
`data/report-YYYY-MM-DD.md`

## Collector 插件机制

每个 collector 是独立 ES Module，导出 `async function collect(config)`：
- 输入：sources.yaml 中的配置对象
- 输出：`Array<{title, url, snippet, source, collectedAt}>`

在 pipeline.mjs 的 `COLLECTOR_MAP` 中注册即可接入流水线。

## 依赖

- **Node.js** v22+（ESM）
- **js-yaml** — 解析 sources.yaml
- **rss-parser** — RSS 解析
- 本目录 `node_modules/`（`npm install` 已完成）

## 飞书推送

`--push` 参数通过 `scripts/push-to-feishu-doc.mjs` 创建飞书云文档并通知飞书群。
