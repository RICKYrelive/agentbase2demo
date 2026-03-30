# Feature Requests

Capabilities requested by user that don't currently exist.

## 2026-03-12 | 每个模块独立飞书文档 + 按钮导航
- 用户希望简报按模块拆分，每个模块独立文档
- ✅ 已实现：push-module-brief.cjs

## 2026-03-12 | 学术论文需要摘要，不要只要标题
- 用户反馈学术动态只有标题没摘要
- ✅ 已实现：arXiv collector 提取摘要

## 2026-03-13 | 竞品定义重置
- 用户要求重置竞品为国内云厂商为主
- ✅ 已实现：competitors.json 更新

## 2026-03-24 | 36kr 热榜加入洞察简报
- 用户希望 36kr 热榜作为独立数据源
- ✅ 已实现：36kr-collector.mjs 直连 API

## 2026-03-27 | 洞察简报时效性保证（3天内）
- 用户要求资讯必须是 3 天内的
- ✅ 已实现：curate.mjs 加 3 天 cutoff 过滤

## 未实现 | 微博热搜实时抓取
- 匿名抓取微博热搜（不需要登录）
- 有 weibo-hot-search-anonymous skill，但未集成到洞察简报

## 未实现 | RSSHub 自动恢复/告警
- RSSHub 挂掉时没有告警机制
- 需要：健康检查 + 自动重启 pm2 进程
