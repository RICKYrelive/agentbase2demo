---
name: web-searcher
description: |
  统一网络搜索模块。支持多搜索引擎fallback（Brave API → DuckDuckGo → Bing）。
  当用户要求搜索网络、查找信息、网上搜索、search、查询时触发。
  输出标准化格式，供 insight-brief 编排器调用，也可独立使用。
  优先使用英文搜索以获得更准确结果。
---

# Web Searcher - 统一网络搜索

多搜索引擎fallback机制，确保搜索成功率。

## 快速使用

### 方法1：统一搜索（推荐）
```bash
cd ~/.openclaw/skills/web-searcher/scripts
node unified-search.mjs "查询词" [--lang=en] [--country=us] [--count=10]
```

**参数说明：**
- `--lang=LANG` - 搜索语言（默认：en，中文用zh-hans）
- `--country=CC` - 国家代码（默认：us，中国用cn）
- `--count=N` - 结果数量（默认：10）
- `--freshness=F` - 时间限制（pd=过去一天, pw=过去一周, pm=过去一月）

**示例：**
```bash
# 英文搜索（推荐，更准确）
node unified-search.mjs "Amazon Bedrock AgentCore"

# 中文搜索
node unified-search.mjs "AI 新闻" --lang=zh-hans --country=cn

# 最近一周的结果
node unified-search.mjs "LLM developments" --freshness=pw

# 更多结果
node unified-search.mjs "Kubernetes" --count=20
```

### 方法2：Brave Search API
```bash
node brave-search.mjs "查询词" --lang=en --country=us
```

### 方法3：DuckDuckGo
```bash
node duck-search.mjs "查询词"
```

### 方法4：Bing（Scrapling，慢但稳定）
```bash
python3 search.py "查询词"
```

## 搜索引擎优先级

1. **Brave Search API**（首选）
   - ✅ 质量高、速度快
   - ✅ 支持多语言、时间过滤
   - ⚠️ 需要API key

2. **DuckDuckGo HTML**（备选1）
   - ✅ 无需API key
   - ⚠️ 质量稍低

3. **Bing Scrapling**（备选2）
   - ✅ 稳定
   - ⚠️ 速度慢、中文结果可能不准

## 输出格式

```json
{
  "source": "brave-api|duckduckgo|bing",
  "timestamp": "2026-03-13T12:00:00Z",
  "query": "查询词",
  "options": {
    "searchLang": "en",
    "country": "us",
    "count": 10
  },
  "items": [
    {
      "title": "结果标题",
      "summary": "结果摘要（≤150字）",
      "link": "https://...",
      "source_name": "来源网站",
      "category": "搜索结果",
      "metadata": {
        "rank": 1,
        "display_url": "example.com"
      }
    }
  ]
}
```

## 搜索技巧

### 1. 使用英文关键词
对于技术产品、公司名，使用**英文搜索**通常更准确：
```bash
✅ "Amazon Bedrock AgentCore"
❌ "亚马逊 Bedrock AgentCore"
```

### 2. 精确匹配
使用引号进行精确匹配：
```bash
node unified-search.mjs '"Amazon Bedrock AgentCore"'
```

### 3. 组合关键词
增加上下文关键词：
```bash
node unified-search.mjs "AgentCore AWS enterprise platform"
```

### 4. 时间过滤
查找最新信息：
```bash
node unified-search.mjs "AI Agent framework" --freshness=pw
```

### 5. 站内搜索
限定特定网站（Brave API支持）：
```bash
node unified-search.mjs "site:aws.amazon.com Bedrock Agent"
```

## API配置

### Brave Search API
编辑 `TOOLS.md` 或设置环境变量：
```bash
export BRAVE_API_KEY="your-api-key"
```

或在脚本中修改：
```javascript
const BRAVE_API_KEY = 'your-api-key';
```

## 故障排除

### 搜索失败
1. 检查网络连接
2. 尝试切换搜索引擎
3. 简化查询词
4. 使用英文搜索

### 结果不准确
1. 使用英文关键词
2. 添加限定词（如 "official", "documentation"）
3. 使用引号精确匹配
4. 增加上下文关键词

### 速度慢
1. 使用Brave API（最快）
2. 减少结果数量（--count=5）
3. 避免使用Scrapling方法

## 与其他技能集成

### 与insight-brief集成
搜索结果可直接作为insight-brief的输入：
```bash
node unified-search.mjs "AI news" --freshness=pd > /tmp/search-results.json
# insight-brief 会自动读取这些结果
```

### 与web-fetch配合
搜索 → 选择链接 → 深度读取：
```bash
# 1. 搜索
node unified-search.mjs "AWS AgentCore"

# 2. 选择有价值的链接
# 3. 使用web_fetch工具深度读取
```

## 依赖

```bash
# Node.js (推荐 v18+)
node --version

# Python 3 (用于Bing Scrapling)
python3 --version
pip install scrapling --user

# curl (用于DuckDuckGo)
curl --version
```

## 文件结构

```
web-searcher/
├── SKILL.md                    # 本文档
└── scripts/
    ├── unified-search.mjs      # 统一搜索（推荐）
    ├── brave-search.mjs        # Brave Search API
    ├── duck-search.mjs         # DuckDuckGo HTML
    ├── baidu-search.mjs        # 百度搜索（实验性）
    └── search.py               # Bing Scrapling
```

## 注意事项

- ⚠️ 某些搜索可能受网络限制
- ⚠️ 中文查询可能返回较多无关结果
- ⚠️ Brave API有速率限制（免费套餐：2000次/月）
- ✅ 推荐优先使用英文搜索技术内容
- ✅ 统一搜索会自动fallback，提高成功率
