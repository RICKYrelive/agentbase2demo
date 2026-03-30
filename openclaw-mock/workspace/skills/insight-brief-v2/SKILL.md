---
name: insight-brief-v2
description: >
  AI 领域每日洞察简报系统。三阶段流水线（COLLECT → CURATE → PRESENT），
  从多个数据源自动收集、LLM 分类、生成结构化简报并推送到飞书群。
  触发场景：用户提到"日报"、"简报"、"insight"、"每日新闻收集"、"AI 新闻"，
  或需要运行/修改/调试简报系统。
---

# Insight Brief v2 — AI 每日洞察简报系统

三阶段流水线架构：COLLECT（多源采集）→ CURATE（LLM 分类筛选）→ PRESENT（生成报告）。

## 代码位置

```
~/.openclaw/workspace/skills/insight-brief-v2/
├── scripts/
│   ├── pipeline.mjs               # 主入口（串联三阶段）
│   ├── curate.mjs                 # Stage 2: 合并/去重/LLM分类
│   ├── present.mjs                # Stage 3: 生成 Markdown 报告
│   ├── push-to-feishu-doc.mjs     # 飞书文档推送
│   └── collectors/
│       ├── rss-collector.mjs       # RSSHub + 直连 RSS
│       ├── arxiv-collector.mjs     # arXiv 论文
│       ├── web-search-collector.mjs # SearXNG 搜索
│       └── weibo-collector.mjs     # 微博热搜（备用）
├── config/sources.yaml            # 信息源配置
├── data/                          # 运行时数据目录
│   ├── raw/                       # 原始采集 JSON
│   ├── curated/                   # LLM 分类后 JSON
│   └── report-*.md                # 最终报告
└── package.json                   # 依赖声明（js-yaml, rss-parser）
```

依赖：`node_modules/` 在本目录下（`npm install` 已完成）。

## 快速命令

```bash
SKILL_DIR=~/.openclaw/workspace/skills/insight-brief-v2

# 完整运行（采集 + 分类 + 生成报告）
cd $SKILL_DIR && node scripts/pipeline.mjs

# 完整运行 + 推送飞书
cd $SKILL_DIR && node scripts/pipeline.mjs --push

# 单独跑某个阶段
cd $SKILL_DIR && node scripts/pipeline.mjs --stage collect
cd $SKILL_DIR && node scripts/pipeline.mjs --stage curate
cd $SKILL_DIR && node scripts/pipeline.mjs --stage present
```

## Crontab

每天 UTC 00:00（北京时间 08:00）自动执行含推送：
```
0 0 * * * cd ~/.openclaw/workspace/skills/insight-brief-v2 && node scripts/pipeline.mjs --push >> data/cron-$(date +\%Y-\%m-\%d).log 2>&1
```

## 架构概览

```
COLLECT → CURATE → PRESENT → [PUSH]
   │         │         │
   ├─ RSS    ├─ 合并    ├─ 按分类生成
   ├─ arXiv  ├─ 去重    │  Markdown 报告
   ├─ SearXNG├─ 过滤    └─ 包含标题、摘要、
   └─ 微博   ├─ LLM分类   来源链接
              └─ 翻译
```

### LLM 分类（5 类）

| 类别 | 标签 | Emoji |
|------|------|-------|
| frontier_tech | 前沿技术 | 🔬 |
| competitor | 竞品动态 | 🎯 |
| industry_report | 行业报告 | 📊 |
| academic | 学术论文 | 📚 |
| customer_case | 客户案例与实践 | 💼 |

不相关内容（聚合早报、非 AI 产品评测、个人随笔等）自动丢弃。

## 配置文件

信息源在 `config/sources.yaml` 中配置，每个条目包含：
- `name`: collector 名称
- `type`: rss / arxiv / web-search / weibo
- `enabled`: 是否启用
- 各类型特有参数（feeds、queries、max_results 等）

### 添加新 Collector

1. 在 `scripts/collectors/` 下创建 `xxx-collector.mjs`，导出 `async function collect(config)` 返回 `[{title, url, snippet, source, ...}]`
2. 在 `scripts/pipeline.mjs` 的 `COLLECTOR_MAP` 中注册
3. 在 `config/sources.yaml` 中添加对应配置条目

## 飞书推送

`--push` 参数触发，使用 `scripts/push-to-feishu-doc.mjs`，将报告推送为飞书文档并通知飞书群。
