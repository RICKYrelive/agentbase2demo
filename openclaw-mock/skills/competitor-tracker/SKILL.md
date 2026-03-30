---
name: competitor-tracker
description: |
  竞品动态追踪系统。监控竞争对手的产品发布、新闻动态、融资信息。
  当用户要求追踪竞品、监控竞争对手、竞品分析时触发。
  输出标准化格式，供 insight-brief 编排器调用。
---

# Competitor Tracker - 竞品追踪

监控竞争对手的动态。

## 快速使用

```bash
cd ~/.openclaw/skills/competitor-tracker/scripts
python3 track-realtime.py
```

**说明**：脚本内置 5 家国内竞品（阿里云、火山引擎、腾讯云、百度智能云、讯飞星辰），无需传参。

**自定义竞品**：
```bash
python3 track-realtime.py "OpenAI,Anthropic,DeepSeek"
```

## 输出格式

```json
{
  "source": "competitor-tracker",
  "timestamp": "2026-03-12T13:00:00Z",
  "competitors": ["OpenAI", "Anthropic"],
  "items": [
    {
      "title": "OpenAI 发布 GPT-5",
      "summary": "最新模型在推理能力上大幅提升...",
      "link": "https://...",
      "source_name": "OpenAI Blog",
      "category": "产品发布",
      "metadata": {
        "competitor": "OpenAI",
        "type": "product_launch",
        "publish_time": "2026-03-12T10:00:00Z",
        "importance": "high"
      }
    }
  ]
}
```

## 监控维度

| 类型 | 说明 | 优先级 |
|------|------|--------|
| **产品发布** | 新产品/功能上线 | 🔴 高 |
| **融资信息** | 融资、并购、投资 | 🔴 高 |
| **技术突破** | 重要技术进展 | 🟡 中 |
| **人事变动** | 核心人员变动 | 🟡 中 |
| **商业合作** | 合作、投资 | 🟢 低 |
| **负面新闻** | 争议、诉讼 | 🟡 中 |

## 配置

编辑 `references/competitors.json` 设置监控列表：

```json
{
  "competitors": [
    {
      "name": "OpenAI",
      "keywords": ["OpenAI", "GPT", "ChatGPT", "Sam Altman"],
      "domains": ["openai.com", "blog.openai.com"],
      "importance": "high"
    },
    {
      "name": "Anthropic",
      "keywords": ["Anthropic", "Claude", "Dario Amodei"],
      "domains": ["anthropic.com"],
      "importance": "high"
    }
  ],
  "update_frequency": "daily"
}
```

## 数据源

| 来源 | 类型 | 说明 |
|------|------|------|
| **官方博客** | 一手信息 | 通过 RSS/Scrapling 抓取 |
| **科技媒体** | 新闻报道 | 36Kr、TechCrunch 等 |
| **社交媒体** | 官方账号 | Twitter、微博 |
| **搜索结果** | 综合信息 | Bing/Google 搜索 |

## 特性

- ✅ **多源聚合** - 整合官方、媒体、搜索结果
- ✅ **智能分类** - 自动识别新闻类型
- ✅ **重要性评估** - 标注高/中/低优先级
- ✅ **去重过滤** - 避免重复信息

## 使用场景

1. **竞品监控** - 追踪竞争对手动态
2. **市场分析** - 了解行业趋势
3. **决策支持** - 辅助产品战略
4. **预警系统** - 及时发现重要动态

## 文件结构

```
competitor-tracker/
├── SKILL.md
├── scripts/
│   ├── track-realtime.py    # 主追踪脚本（实时抓取）
│   └── analyze.py          # 分析脚本（可选）
└── references/
    ├── competitors.json    # 竞品列表配置
    └── sources.md          # 数据源说明
```

## 与 insight-brief 集成

竞品追踪结果可作为独立章节添加到洞察简报：

```markdown
## 🎯 竞品动态
> 监控对象：OpenAI、Anthropic
> 共收集 12 条动态

| 公司 | 动态 | 类型 | 重要性 |
|------|------|------|--------|
| OpenAI | [发布 GPT-5](链接) | 产品发布 | 🔴 高 |
| Anthropic | [Claude 3.5 更新](链接) | 功能更新 | 🟡 中 |
```

## 注意事项

- 部分官方站点需要 Scrapling
- 建议每日运行一次（避免过于频繁）
- 重要性评估基于关键词匹配（可能不精确）
- 需定期更新竞品配置文件
