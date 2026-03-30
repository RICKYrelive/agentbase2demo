---
name: sogou-search
description: >
  通过搜狗搜索微信公众号文章和知乎内容。触发场景：用户提到"搜微信"、"搜公众号"、"微信文章"、
  "搜知乎"、"sogou search"、"搜狗搜索"，或需要查找微信公众号/知乎上的特定内容。
  支持按文章内容和按公众号名搜索。
---

# 搜狗微信/知乎搜索

通过搜狗搜索引擎检索微信公众号文章和知乎内容，无需登录。

## 搜索类型

### 微信文章搜索

```bash
# 搜文章内容（最常用）
https://weixin.sogou.com/weixin?type=2&query={关键词}&ie=utf8
# 搜公众号账号（找某个公众号）
https://weixin.sogou.com/weixin?type=1&query={关键词}&ie=utf8
```

默认用 type=2（搜文章），只有明确要找公众号时才用 type=1。

### 知乎搜索

```bash
curl -s "https://zhihu.sogou.com/zhihu?ie=utf8&query={关键词}" | ...
```

用 `web_fetch` 获取：`https://zhihu.sogou.com/zhihu?ie=utf8&query={关键词}`

### 其他搜狗搜索

| 类型 | URL |
|------|-----|
| 网页 | `https://www.sogou.com/web?ie=utf8&query={关键词}` |
| 图片 | `https://pic.sogou.com/pics?ie=utf8&query={关键词}` |
| 视频 | `https://v.sogou.com/v?ie=utf8&query={关键词}` |

## 使用方法

用 `web_fetch` 工具直接访问上述 URL 即可，设置 `maxChars: 5000-10000`。

注意：web_fetch 用 readability 提取，返回的是纯文本。微信搜索结果中的链接是搜狗跳转链接，无法直接访问原文，但标题和摘要通常够用。

## 限制

- 搜狗微信搜索结果中的链接是跳转链，不能直接获取原文全文
- 知乎搜索同理，只返回摘要
- 如需全文，需通过跳转链访问（可能需要微信内置浏览器）
- 频繁请求可能触发验证码
