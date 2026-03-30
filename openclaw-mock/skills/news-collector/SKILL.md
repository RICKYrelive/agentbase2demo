---
name: news-collector
description: |
  综合新闻收集模块。从多个 RSS 源抓取科技、AI、商业等领域资讯，支持增量收集和去重。
  当用户要求收集综合新闻、科技资讯、最新动态时触发。
  输出统一的 JSON + Markdown 格式，供 insight-brief 编排器调用。
---

# News Collector - 综合新闻收集

从 RSS 源抓取多领域新闻，增量更新，输出标准化格式。

## 快速使用

```bash
cd ~/.openclaw/skills/news-collector/scripts
node fetch-news.mjs
```

**输出位置**：`~/.openclaw/workspace/insight-system/data/`

- `news-YYYY-MM-DD.json` - 原始数据
- `summary-YYYY-MM-DD.md` - Markdown 简报

## 输出格式

```json
{
  "source": "news-collector",
  "timestamp": "2026-03-12T08:00:00Z",
  "items": [
    {
      "title": "新闻标题",
      "summary": "一句话摘要（≤80字）",
      "link": "https://...",
      "source_name": "36Kr",
      "category": "科技资讯",
      "metadata": {
        "publish_time": "2026-03-12T06:00:00Z"
      }
    }
  ]
}
```

## RSS 源配置

当前源列表见 `references/rss-feeds.md`。

**核心源**：
- 36Kr 快讯（科技资讯）
- 量子位（AI/前沿科技）
- AIbase（AI 新闻）
- TechCrunch（国际科技）
- Simon Willison（AI/数据）

### 添加新源

编辑 `scripts/fetch-news.mjs` 中的 `RSS_FEEDS` 数组：

```javascript
{
  name: '源名称',
  url: 'http://localhost:1200/路由',
  category: '分类'
}
```

## 特性

- ✅ 增量收集 - 与历史数据合并去重
- ✅ 多源聚合 - 一次收集多个源
- ✅ 自动分类 - 按源自动标记分类
- ✅ 容错处理 - 单源失败不影响其他

## 前置条件

**RSSHub 运行中**：
```bash
pm2 status rsshub
pm2 restart rsshub  # 如果需要
```

**依赖安装**：
```bash
cd ~/.openclaw/workspace/insight-system && npm install
```

## 自定义

### 修改每个源的数量

编辑 `fetch-news.mjs` 中的 `slice(0, 10)` 参数。

### 修改输出格式

编辑 `fetch-news.mjs` 中的 `generateSummary()` 函数。

## 文件结构

```
news-collector/
├── SKILL.md
├── scripts/
│   └── fetch-news.mjs
└── references/
    └── rss-feeds.md
```
