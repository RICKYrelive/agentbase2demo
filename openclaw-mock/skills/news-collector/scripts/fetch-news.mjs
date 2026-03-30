#!/usr/bin/env node
/**
 * 新闻收集脚本（增量模式）
 * 从 RSS 源抓取最新资讯，与已有数据合并去重，生成简报
 */

import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';

const parser = new Parser({
  timeout: 60000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; InsightSystem/1.0)'
  }
});

// RSS 源配置 - 专注于 AI/Agent/AI Infra
const RSS_FEEDS = [
  // === 中文 AI 资讯 ===
  { name: 'AIbase', url: 'http://localhost:1200/aibase/news', category: 'AI 新闻/中文' },
  { name: '量子位', url: 'http://localhost:1200/qbitai/category/%E8%B5%84%E8%AE%AF', category: 'AI/前沿科技' },
  { name: '36Kr 快讯', url: 'http://localhost:1200/36kr/newsflashes', category: '科技资讯' },
  
  // === 国外 AI 新闻源 ===
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'AI/科技新闻' },
  { name: 'Wired AI', url: 'https://www.wired.com/feed/rss', category: 'AI/科技深度' },
  
  // === AI 技术/研究博客 ===
  { name: 'Simon Willison', url: 'https://simonwillison.net/atom/everything/', category: 'AI/数据/Python' },
  { name: 'minimaxir', url: 'https://minimaxir.com/index.xml', category: 'AI/数据科学' },
  { name: 'George Hotz', url: 'https://geohot.github.io/blog/feed.xml', category: 'AI/系统' },
  
  // === AI Infra/基础设施 ===
  { name: 'Mitchell Hashimoto', url: 'https://mitchellh.com/feed.xml', category: 'AI Infra' },
  { name: 'bernsteinbear', url: 'https://bernsteinbear.com/feed.xml', category: '编译器/ML系统' },
  
  // === AI 思考/访谈 ===
  { name: 'Experimental History', url: 'https://www.experimental-history.com/feed', category: '科学/AI 思考' }
];

// 数据存储路径
const DATA_DIR = path.join(process.env.HOME, '.openclaw/workspace/insight-system/data');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

function getJsonPath() {
  return path.join(DATA_DIR, `news-${getTodayStr()}.json`);
}

// 加载当天已有数据
function loadExistingData() {
  const jsonPath = getJsonPath();
  if (fs.existsSync(jsonPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      console.log(`📂 加载已有数据: ${jsonPath}`);
      return data;
    } catch (e) {
      console.log(`⚠️ 解析已有数据失败，将重新创建`);
      return null;
    }
  }
  return null;
}

// 合并数据（按 link 去重）
function mergeData(existingData, newData) {
  if (!existingData) {
    return newData;
  }
  
  // 建立 link -> item 的映射
  const itemMap = new Map();
  
  // 先添加已有数据
  for (const { feed, items } of existingData) {
    for (const item of items) {
      itemMap.set(item.link, item);
    }
  }
  
  // 统计新增
  let newCount = 0;
  
  // 添加新数据（覆盖重复）
  for (const { feed, items } of newData) {
    for (const item of items) {
      if (!itemMap.has(item.link)) {
        newCount++;
      }
      itemMap.set(item.link, item);
    }
  }
  
  console.log(`📊 去重后总计: ${itemMap.size} 条 (新增 ${newCount} 条)`);
  
  // 重建 feedsData 结构
  const mergedBySource = new Map();
  
  for (const [link, item] of itemMap) {
    const sourceName = item.source;
    if (!mergedBySource.has(sourceName)) {
      mergedBySource.set(sourceName, []);
    }
    mergedBySource.get(sourceName).push(item);
  }
  
  // 转换回 feedsData 格式
  const result = [];
  for (const feedConfig of RSS_FEEDS) {
    const items = mergedBySource.get(feedConfig.name) || [];
    // 按时间排序（最新的在前）
    items.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    result.push({
      feed: feedConfig,
      items: items,
      merged: true  // 标记为合并数据
    });
  }
  
  return result;
}

// 抓取单个 RSS 源（带重试）
async function fetchFeed(feed, retries = 2) {
  console.log(`📡 抓取: ${feed.name}`);
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const rssFeed = await parser.parseURL(feed.url);
      const items = rssFeed.items.slice(0, 10).map(item => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        contentSnippet: item.contentSnippet?.substring(0, 200),
        category: feed.category,
        source: feed.name
      }));
      console.log(`   ✅ 获取 ${items.length} 条`);
      return { feed, items };
    } catch (error) {
      const errorMsg = error.message || error.code || String(error);
      if (attempt < retries) {
        console.log(`   ⚠️ 重试 (${attempt + 1}/${retries}): ${errorMsg.substring(0, 50)}`);
        await new Promise(r => setTimeout(r, 2000));
      } else {
        console.log(`   ❌ 失败: ${errorMsg.substring(0, 80)}`);
        return { feed, items: [], error: errorMsg };
      }
    }
  }
}

// 生成简报
function generateSummary(feedsData) {
  const date = getTodayStr();
  const allItems = feedsData.flatMap(f => f.items);
  
  let summary = `# 📰 每日资讯简报\n`;
  summary += `**日期**: ${date}\n`;
  summary += `**总计**: ${allItems.length} 条新闻\n\n`;
  summary += `---\n\n`;

  for (const { feed, items, error } of feedsData) {
    summary += `## ${feed.name}\n`;
    summary += `*${feed.category}*\n\n`;
    
    if (error) {
      summary += `⚠️ 获取失败: ${error.substring(0, 50)}\n\n`;
      continue;
    }
    
    if (items.length === 0) {
      summary += `暂无更新\n\n`;
      continue;
    }
    
    // 只显示最新的 10 条
    const displayItems = items.slice(0, 10);
    
    for (const item of displayItems) {
      const time = item.pubDate ? new Date(item.pubDate).toLocaleString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Asia/Shanghai'
      }) : '';
      
      summary += `### ${item.title}\n`;
      if (time) summary += `⏰ ${time}\n`;
      if (item.contentSnippet) {
        summary += `> ${item.contentSnippet.trim().replace(/\n/g, ' ').substring(0, 150)}...\n`;
      }
      summary += `[阅读原文](${item.link})\n\n`;
    }
    
    if (items.length > 10) {
      summary += `*...还有 ${items.length - 10} 条*\n\n`;
    }
    summary += `---\n\n`;
  }

  return summary;
}

// 保存数据
function saveData(feedsData, summary) {
  const jsonPath = getJsonPath();
  fs.writeFileSync(jsonPath, JSON.stringify(feedsData, null, 2), 'utf-8');
  console.log(`\n💾 JSON 已保存: ${jsonPath}`);
  
  const mdPath = path.join(DATA_DIR, `summary-${getTodayStr()}.md`);
  fs.writeFileSync(mdPath, summary, 'utf-8');
  console.log(`📄 简报已保存: ${mdPath}`);
}

// 主函数
async function main() {
  console.log('🚀 开始新闻收集（增量模式）...\n');
  
  ensureDataDir();
  
  // 1. 加载已有数据
  const existingData = loadExistingData();
  
  // 2. 并行抓取所有源
  const newData = await Promise.all(RSS_FEEDS.map(f => fetchFeed(f, 2)));
  
  // 3. 合并去重
  console.log('\n📝 合并数据...');
  const mergedData = mergeData(existingData, newData);
  
  // 4. 生成简报
  console.log('\n📝 生成简报...');
  const summary = generateSummary(mergedData);
  
  // 5. 保存（覆盖）
  saveData(mergedData, summary);
  
  // 6. 打印简报
  console.log('\n' + '='.repeat(50));
  console.log(summary);
  
  // 统计
  const successCount = newData.filter(f => !f.error).length;
  const totalItems = mergedData.reduce((sum, f) => sum + f.items.length, 0);
  console.log(`\n✅ 完成: ${successCount}/${RSS_FEEDS.length} 个源, 累计 ${totalItems} 条新闻`);
}

main().catch(console.error);
