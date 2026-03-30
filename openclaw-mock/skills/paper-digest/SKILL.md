---
name: paper-digest
description: |
  学术论文摘要系统。每日精选 arXiv、Papers with Code 等平台的最新论文。
  当用户要求论文摘要、最新论文、学术动态、arXiv 时触发。
  输出标准化格式，供 insight-brief 编排器调用。
---

# Paper Digest - 论文摘要

每日精选最新学术论文。

## 快速使用

```bash
cd ~/.openclaw/skills/paper-digest/scripts
python3 fetch-papers-v2.py
```

**说明**：默认抓取 AI Agent 相关论文（cs.AI, cs.CL, cs.MA 等），无需传参。

**自定义关键词**：
```bash
python3 fetch-papers-v2.py "transformer,LLM,GPT"
```

## 输出格式

```json
{
  "source": "paper-digest",
  "timestamp": "2026-03-12T13:00:00Z",
  "categories": ["cs.AI", "cs.CL"],
  "items": [
    {
      "title": "论文标题",
      "summary": "摘要内容（≤200字）",
      "link": "https://arxiv.org/abs/...",
      "source_name": "arXiv",
      "category": "cs.AI",
      "metadata": {
        "authors": ["作者1", "作者2"],
        "publish_time": "2026-03-11T10:00:00Z",
        "paper_id": "2403.12345",
        "categories": ["cs.AI", "cs.CL"],
        "github_url": "https://github.com/...",
        "pdf_url": "https://arxiv.org/pdf/..."
      }
    }
  ]
}
```

## 支持的来源

| 来源 | 类型 | 说明 |
|------|------|------|
| **arXiv** | ✅ | 主要数据源，RSS Feed |
| **Papers with Code** | 🔜 | 带代码实现 |
| **Hugging Face Papers** | 🔜 | 社区精选 |
| **Semantic Scholar** | 🔜 | 学术搜索 |

## arXiv 分类

| 类别 | 代码 | 说明 |
|------|------|------|
| 人工智能 | `cs.AI` | AI 相关 |
| 计算机视觉 | `cs.CV` | 图像、视频 |
| 自然语言处理 | `cs.CL` | NLP |
| 机器学习 | `cs.LG` | ML |
| 机器人 | `cs.RO` | 机器人 |
| 信息检索 | `cs.IR` | 搜索、推荐 |

## 配置

编辑 `references/categories.json` 设置默认监控分类：

```json
{
  "default_categories": [
    "cs.AI",
    "cs.CL",
    "cs.LG",
    "cs.CV"
  ],
  "max_results_per_category": 20,
  "keywords_filter": ["LLM", "transformer", "agent"]
}
```

## 特性

- ✅ **RSS 聚合** - 从 arXiv RSS 抓取最新论文
- ✅ **智能筛选** - 按关键词过滤
- ✅ **自动去重** - 避免重复论文
- ✅ **热度排序** - 按 GitHub star 数/引用数排序

## 使用场景

1. **学术追踪** - 追踪特定领域的最新研究
2. **技术趋势** - 了解前沿技术动态
3. **论文推荐** - 每日精选高质量论文
4. **引用分析** - 分析热门论文

## 文件结构

```
paper-digest/
├── SKILL.md
├── scripts/
│   ├── fetch-papers-v2.py  # arXiv 抓取（主要，支持 AI Agent 筛选）
│   └── analyze-trends.py   # 趋势分析（可选）
└── references/
    ├── categories.json     # 分类配置
    └── sources.md          # 数据源说明
```

## 依赖

```bash
pip install feedparser --user
```

## 与 insight-brief 集成

论文摘要可作为独立章节添加到洞察简报：

```markdown
## 📚 学术动态
> 监控分类：cs.AI、cs.CL
> 今日新增 45 篇论文

### TOP 5
| # | 标题 | 分类 | 热度 |
|---|------|------|------|
| 1 | [论文标题](链接) | cs.AI | ⭐ 245 |
| 2 | [论文标题](链接) | cs.CL | ⭐ 189 |
```

## 注意事项

- arXiv 有访问频率限制（3秒/次）
- 建议每日运行一次
- 摘要来自原文（自动生成）
- 热度数据可能延迟
