---
name: ai-collector
description: |
  AI 领域新闻收集模块。从 Hacker News、Reddit、OpenAI Blog 等源收集 AI 动态，按社区热度和时间衰减计算热度分数并排序。
  当用户要求收集 AI 新闻、AI 动态、看看 AI 圈发生了什么时触发。
  输出包含热度分数的标准化数据，供 insight-brief 编排器调用。
---

# AI Collector - AI 新闻收集（热度排序）

专门收集 AI 领域新闻，按热度排序输出。

## 快速使用

```bash
cd ~/.openclaw/skills/ai-collector/scripts
node fetch-ai-news.mjs
```

**输出位置**：`~/.openclaw/workspace/insight-system/data/`

- `ai-news-YYYY-MM-DD.json` - 原始数据（含热度分数）
- `ai-summary-YYYY-MM-DD.md` - Markdown 简报（按热度排序）

## 输出格式

```json
{
  "source": "ai-collector",
  "timestamp": "2026-03-12T08:00:00Z",
  "items": [
    {
      "title": "OpenAI 发布 GPT-5",
      "summary": "最新模型性能大幅提升...",
      "link": "https://...",
      "source_name": "OpenAI Blog",
      "category": "AI 研究",
      "metadata": {
        "heat_score": 92,
        "publish_time": "2026-03-12T06:00:00Z",
        "upvotes": 1250,
        "comments": 340
      }
    }
  ]
}
```

## 热度算法

**热度分数 = 基础分数 × 时间系数 + 互动分数**

- **基础分数** = 源权重 × 10
- **时间系数** = 1.0 - (当前时间 - 发布时间) / 48h（48小时内衰减）
- **互动分数** = 点赞数 × 0.05 + 评论数 × 0.1

### 源权重配置

| 源 | 权重 | 说明 |
|---|------|------|
| OpenAI Blog | 2.5 | 官方发布 |
| DeepMind Blog | 2.3 | 研究突破 |
| Anthropic Blog | 2.2 | Claude 相关 |
| Hacker News AI | 2.0 | 社区精选 |
| Product Hunt AI | 1.8 | 新产品 |
| GitHub Trending | 1.8 | 开源项目 |
| Reddit r/MachineLearning | 1.5 | 学术讨论 |
| 量子位 | 1.5 | 中文资讯 |
| AIbase | 1.5 | 中文资讯 |
| 机器之心 | 1.4 | 深度报道 |

## RSS 源配置

完整源列表在 `scripts/fetch-ai-news.mjs` 中的 `AI_FEEDS` 数组。

### 添加新源

```javascript
{
  name: '源名称',
  url: 'http://localhost:1200/路由',
  category: '分类',
  weight: 1.5,  // 热度权重（1.0-3.0）
  filterKeywords: ['AI', 'ML']  // 过滤关键词（可选）
}
```

## 特性

- ✅ 热度排序 - 综合社区互动和时间因素
- ✅ 智能过滤 - 支持关键词过滤
- ✅ 多源聚合 - 国内外主流 AI 信息源
- ✅ TOP N 突出 - 报告中优先展示高分内容

## 前置条件

**RSSHub 运行中**：
```bash
pm2 status rsshub
```

**依赖安装**：
```bash
cd ~/.openclaw/workspace/insight-system && npm install
```

## 自定义

### 调整热度算法

编辑 `fetch-ai-news.mjs` 中的 `calculateHeatScore()` 函数：
- 修改时间衰减速度（默认 48 小时）
- 调整点赞/评论权重
- 添加其他热度因素

### 修改输出数量

编辑 `slice(0, 15)` 参数控制每个源的数量。

## 文件结构

```
ai-collector/
├── SKILL.md
└── scripts/
    └── fetch-ai-news.mjs
```
