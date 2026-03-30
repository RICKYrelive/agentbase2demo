---
name: social-monitor
description: |
  社交媒体关键词监控系统。监控微博、Twitter 等平台的关键词动态。
  当用户要求监控微博、社交媒体关键词、舆情监控时触发。
  输出标准化格式，供 insight-brief 编排器调用。
---

# Social Monitor - 社交媒体监控

监控社交媒体平台的关键词动态。

## 快速使用

```bash
cd ~/.openclaw/skills/social-monitor/scripts
python3 weibo-monitor.py "关键词1,关键词2"
```

**示例**：
```bash
# 监控 AI 相关话题
python3 weibo-monitor.py "AI,人工智能,GPT"

# 监控竞品
python3 weibo-monitor.py "竞品名,公司名"
```

## 输出格式

```json
{
  "source": "social-monitor",
  "platform": "weibo",
  "timestamp": "2026-03-12T13:00:00Z",
  "keywords": ["AI", "GPT"],
  "items": [
    {
      "title": "微博内容摘要（前50字）",
      "summary": "完整微博内容",
      "link": "https://weibo.com/...",
      "source_name": "@用户名",
      "category": "微博热搜",
      "metadata": {
        "platform": "weibo",
        "author": "用户昵称",
        "publish_time": "2026-03-12T12:00:00Z",
        "likes": 1200,
        "reposts": 340,
        "comments": 89
      }
    }
  ]
}
```

## 支持的平台

| 平台 | 状态 | 说明 |
|------|------|------|
| 微博 | ✅ | 使用 Scrapling 爬取热搜和搜索结果 |
| Twitter/X | 🔜 | 需要 API Key |
| 小红书 | 🔜 | 反爬较严格 |

## 特性

- ✅ **关键词监控** - 支持多个关键词（逗号分隔）
- ✅ **热度排序** - 按点赞/转发数排序
- ✅ **去重** - 自动过滤重复内容
- ✅ **时间范围** - 可指定监控时间范围

## 配置

编辑 `references/keywords.json` 设置默认关键词：

```json
{
  "default_keywords": ["AI", "人工智能", "GPT"],
  "max_results_per_keyword": 20,
  "time_range_hours": 24
}
```

## 依赖

```bash
pip install scrapling --user
```

## 使用场景

1. **舆情监控** - 监控品牌/产品在社交媒体上的讨论
2. **热点追踪** - 追踪行业热点话题
3. **竞品监控** - 监控竞争对手在社交媒体的动态
4. **趋势分析** - 分析关键词热度和传播情况

## 文件结构

```
social-monitor/
├── SKILL.md
├── scripts/
│   ├── weibo-monitor.py    # 微博监控（主要）
│   └── twitter-monitor.py  # Twitter（实验性）
└── references/
    ├── keywords.json       # 默认关键词配置
    └── platforms.md        # 平台说明文档
```

## 注意事项

- 微博有反爬机制，使用 Scrapling 绕过
- 建议控制监控频率（避免频繁请求）
- 结果可能包含广告和无关内容
- 热度数据可能不准确（延迟更新）

## 与 insight-brief 集成

社交媒体监控结果可作为独立章节添加到每日洞察简报：

```markdown
## 📱 社交媒体热点
> 监控关键词：AI、GPT、人工智能
> 共收集 35 条相关讨论

| 话题 | 热度 | 来源 |
|------|------|------|
| [话题1](链接) | 🔥 1200 赞 | @用户名 |
```
