# RSS 源列表

## 本地 RSSHub 实例

**地址**: `http://localhost:1200`
**管理**: `pm2 status rsshub` / `pm2 restart rsshub`

---

## 已配置源（12个）

### 中文资讯
| 名称 | RSS 地址 | 状态 |
|------|----------|------|
| **36Kr 快讯** | `http://localhost:1200/36kr/newsflashes` | ✅ |
| **量子位** | `http://localhost:1200/qbitai/category/资讯` | ✅ |

### 英文技术博客 (HN 热门)
| 名称 | RSS 地址 | 分类 |
|------|----------|------|
| Dan Abramov | `https://overreacted.io/rss.xml` | React/前端 |
| Mitchell Hashimoto | `https://mitchellh.com/feed.xml` | 基础设施 |
| matklad | `https://matklad.github.io/feed.xml` | Rust/编译器 |
| Jeff Geerling | `https://www.jeffgeerling.com/blog.xml` | DevOps |
| Krebs on Security | `https://krebsonsecurity.com/feed/` | 安全 |
| Gary Marcus | `https://garymarcus.substack.com/feed` | AI 批判 |
| Daring Fireball | `https://daringfireball.net/feeds/main` | Apple |
| lcamtuf | `https://lcamtuf.substack.com/feed` | 安全深度 |

---

## HN Popular Blogs 2025 完整列表

来源: https://gist.github.com/emschwartz/e6d2bf860ccc367fe37ff953ba6de66b

### 顶级推荐
| 名称 | RSS | 简介 |
|------|-----|------|
| Simon Willison | `https://simonwillison.net/atom/everything/` | AI/数据/Python |
| Paul Graham | `http://www.aaronsw.com/2002/feeds/pgessays.rss` | 创业/思考 |
| Dan Abramov | `https://overreacted.io/rss.xml` | React/前端 |
| Mitchell Hashimoto | `https://mitchellh.com/feed.xml` | 基础设施/HashiCorp |
| Jeff Geerling | `https://www.jeffgeerling.com/blog.xml` | DevOps/Raspberry Pi |

### 安全/深度技术
| 名称 | RSS |
|------|-----|
| Krebs on Security | `https://krebsonsecurity.com/feed/` |
| lcamtuf | `https://lcamtuf.substack.com/feed` |
| micahflee.com | `https://micahflee.com/feed/` |

### AI/思考
| 名称 | RSS |
|------|-----|
| Gary Marcus | `https://garymarcus.substack.com/feed` |
| Pluralistic | `https://pluralistic.net/feed/` |

---

## 待添加源

| 名称 | 方案 | 备注 |
|------|------|------|
| 机器之心 | wechat2rss | 公众号 |
| 新智元 | wechat2rss | 公众号 |

---

## 添加新源

编辑 `~/.openclaw/skills/news-digest/scripts/fetch-news.mjs`:

```javascript
{
  name: '源名称',
  url: 'RSS 地址',
  category: '分类',
  enabled: true
}
```

然后运行：
```bash
cp ~/.openclaw/skills/news-digest/scripts/fetch-news.mjs ~/.openclaw/workspace/insight-system/
cd ~/.openclaw/workspace/insight-system && node fetch-news.mjs
```
