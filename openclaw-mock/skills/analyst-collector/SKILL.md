---
name: analyst-collector
description: |
  行业分析报告收集模块。爬取 Gartner、IDC、Forrester 等机构的公开研究报告。
  当用户要求收集行业报告、分析师报告、Gartner 报告、IDC 报告时触发。
  输出标准化格式，供 insight-brief 编排器调用。
---

# Analyst Collector - 行业分析报告收集

爬取主流分析机构的公开研究报告。

## 快速使用

```bash
cd ~/.openclaw/skills/analyst-collector/scripts
python3 fetch-gartner.py
```

**输出位置**：`~/.openclaw/workspace/insight-system/data/`

- `analyst-reports-YYYY-MM-DD.json` - 原始数据
- `analyst-summary-YYYY-MM-DD.md` - Markdown 简报

## 输出格式

```json
{
  "source": "analyst-collector",
  "timestamp": "2026-03-12T08:00:00Z",
  "items": [
    {
      "title": "2026 AI 成熟度曲线",
      "summary": "报告摘要...",
      "link": "https://gartner.com/...",
      "source_name": "Gartner",
      "category": "AI 趋势",
      "metadata": {
        "publish_date": "2026-03-10",
        "report_type": "Hype Cycle"
      }
    }
  ]
}
```

## 支持的来源

| 机构 | 说明 | 状态 |
|------|------|------|
| Gartner Insights | 技术趋势、AI 主题 | ✅ |
| Gartner AI Topics | AI 专项报告 | ✅ |
| Gartner GenAI | 生成式 AI 报告 | ✅ |
| IDC Research | 市场分析报告 | 🔜 |
| Forrester | 行业研究报告 | 🔜 |

## 技术栈

使用 **Scrapling** 爬取（绕过反爬）：

```bash
pip install scrapling curl_cffi playwright browserforge camoufox --user
```

## 特性

- ✅ 反爬能力 - 使用 Scrapling 模拟浏览器
- ✅ 多机构支持 - Gartner/IDC/Forrester
- ✅ 智能提取 - 自动提取标题、摘要、链接
- ✅ 容错处理 - 单页面失败不影响整体

## 自定义

### 添加新来源

编辑 `fetch-gartner.py` 中的 `SOURCES` 列表：

```python
{
    'name': '机构名称',
    'url': 'https://...',
    'parser': 'custom_parser_function'
}
```

### 调整爬取深度

修改 `max_pages` 参数控制每个源爬取的页面数。

## 前置条件

- Python 3.8+
- Scrapling 及依赖已安装
- 网络可访问目标站点

## 文件结构

```
analyst-collector/
├── SKILL.md
└── scripts/
    └── fetch-gartner.py
```

## 注意事项

- 部分报告需要付费订阅才能查看全文
- 本工具仅收集公开可访问的报告信息
- 请遵守目标站点的 robots.txt 和使用条款
