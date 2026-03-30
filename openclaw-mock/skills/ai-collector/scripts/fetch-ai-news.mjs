#!/usr/bin/env node
/**
 * AI 新闻收集器（按热度排序）
 * 从多个来源收集 AI 领域最新动态，按热度/热度排序，生成中文简报
 */

import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';

const parser = new Parser({
  timeout: 60000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; AI-News-Collector/1.0)'
  }
});

// AI 新闻源配置（优先级：热度 > 时间）
// 2026-03-17: 替换为国内可达源（原海外源因网络限制全部失效）
// filterKeywords: 标题必须包含至少一个关键词才会收录
const AI_FILTER = ['AI', 'ai', '人工智能', '大模型', 'LLM', 'GPT', 'ChatGPT', 'OpenAI', 'DeepSeek', 'Claude',
  '机器学习', '深度学习', '神经网络', 'AGI', 'Agent', '智能体', 'Copilot',
  '芯片', '半导体', 'GPU', '英伟达', '台积电', '机器人', '自动驾驶',
  '字节跳动', '通义', '文心', '豆包', '混元', '星火', '千问', 'Kimi', '智谱',
  'Sora', 'Midjourney', 'Stable Diffusion', 'Transformer',
  'RAG', '向量数据库', '知识图谱', '多模态', '具身智能', '强化学习',
  '数字人', 'AIGC', '生成式', 'GenAI', 'AI眼镜', 'AI PC', 'AI手机',
  '特斯拉', '马斯克', '黄仁勋', 'Sam Altman',
  '模型训练', 'Token', '提示词', 'Prompt', '微调', 'LoRA', 'MoE',
  '开源模型', 'AI芯片', 'AI原生', 'AI应用', 'AI工具', 'AI编程',
  '算法', '推理', '算力', '云计算', 'SaaS', 'API'];

const AI_FEEDS = [
  // === 科技热榜 ===
  {
    name: '知乎热榜',
    url: 'http://localhost:1200/zhihu/hot',
    category: '科技热榜',
    weight: 2.0,
    filterKeywords: AI_FILTER
  },
  {
    name: '知乎日报',
    url: 'http://localhost:1200/zhihu/daily',
    category: '深度文章',
    weight: 1.6,
    filterKeywords: AI_FILTER
  },

  // === 科技媒体 ===
  {
    name: '36氪热榜',
    url: 'http://localhost:1200/36kr/hot-list',
    category: '科技创投',
    weight: 2.2,
    filterKeywords: AI_FILTER
  },
  {
    name: '36氪快讯',
    url: 'http://localhost:1200/36kr/newsflashes',
    category: '科技快讯',
    weight: 1.8,
    filterKeywords: AI_FILTER
  },
  {
    name: '虎嗅文章',
    url: 'http://localhost:1200/huxiu/article',
    category: '科技商业',
    weight: 1.7,
    filterKeywords: AI_FILTER
  },
  {
    name: '爱范儿',
    url: 'http://localhost:1200/ifanr/index',
    category: '科技生活',
    weight: 1.5,
    filterKeywords: AI_FILTER
  },
  {
    name: '少数派 Matrix',
    url: 'http://localhost:1200/sspai/matrix',
    category: '效率工具',
    weight: 1.3,
    filterKeywords: AI_FILTER
  },
  {
    name: 'IT之家排行榜',
    url: 'http://localhost:1200/ithome/ranking/24h',
    category: '数码科技',
    weight: 1.8,
    filterKeywords: AI_FILTER
  },

  // === 开发者社区 ===
  {
    name: '掘金趋势',
    url: 'http://localhost:1200/juejin/trending/ios/monthly',
    category: '开发者',
    weight: 1.4,
    filterKeywords: AI_FILTER
  },

  // === 视频平台 ===
  {
    name: 'B站热门',
    url: 'http://localhost:1200/bilibili/popular/all',
    category: '视频热门',
    weight: 1.3,
    filterKeywords: AI_FILTER
  }
];

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
  return path.join(DATA_DIR, `ai-news-${getTodayStr()}.json`);
}

// 计算热度分数
function calculateHeatScore(item, feed) {
  let score = feed.weight * 10; // 基础分数
  
  // 时间衰减（越新分数越高）
  const hoursSincePub = (Date.now() - new Date(item.pubDate || Date.now())) / (1000 * 60 * 60);
  const timeDecay = Math.max(0, 1 - hoursSincePub / 48); // 48小时内衰减
  score *= (0.5 + 0.5 * timeDecay);
  
  // 如果有评分/点赞数，加入计算
  if (item.score) {
    score += item.score * 0.1;
  }
  
  // 如果有评论数，加入计算
  if (item.comments) {
    score += item.comments * 0.05;
  }
  
  return score;
}

// 关键词过滤
function filterByKeywords(items, keywords) {
  if (!keywords || keywords.length === 0) {
    return items;
  }
  
  return items.filter(item => {
    const text = `${item.title} ${item.contentSnippet || ''}`.toLowerCase();
    return keywords.some(keyword => text.includes(keyword.toLowerCase()));
  });
}

// 加载已有数据
function loadExistingData() {
  const jsonPath = getJsonPath();
  if (fs.existsSync(jsonPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      console.log(`📂 加载已有 AI 新闻数据: ${jsonPath}`);
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
  
  const itemMap = new Map();
  
  // 先添加已有数据
  for (const { feed, items } of existingData) {
    for (const item of items) {
      itemMap.set(item.link, item);
    }
  }
  
  // 统计新增
  let newCount = 0;
  
  // 添加新数据
  for (const { feed, items } of newData) {
    for (const item of items) {
      if (!itemMap.has(item.link)) {
        newCount++;
      }
      itemMap.set(item.link, item);
    }
  }
  
  console.log(`📊 AI 新闻去重后总计: ${itemMap.size} 条 (新增 ${newCount} 条)`);
  
  // 重建结构
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
  for (const feedConfig of AI_FEEDS) {
    const items = mergedBySource.get(feedConfig.name) || [];
    items.sort((a, b) => b.heatScore - a.heatScore); // 按热度排序
    result.push({
      feed: feedConfig,
      items: items,
      merged: true
    });
  }
  
  return result;
}

// 抓取单个源
async function fetchFeed(feed, retries = 2) {
  console.log(`📡 抓取 AI 新闻: ${feed.name}`);
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const rssFeed = await parser.parseURL(feed.url);
      
      let items = rssFeed.items.slice(0, 15).map(item => {
        const processedItem = {
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          contentSnippet: item.contentSnippet?.substring(0, 200),
          category: feed.category,
          source: feed.name,
          score: item.score || 0,
          comments: item.comments || 0
        };
        
        // 计算热度分数
        processedItem.heatScore = calculateHeatScore(processedItem, feed);
        
        return processedItem;
      });
      
      // 关键词过滤
      items = filterByKeywords(items, feed.filterKeywords);
      
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

// 生成 AI 新闻简报（按热度排序）
function generateSummary(feedsData) {
  const date = getTodayStr();
  const allItems = feedsData.flatMap(f => f.items);
  
  // 按热度排序
  allItems.sort((a, b) => b.heatScore - a.heatScore);
  
  let summary = `# 🤖 AI 领域动态简报\n`;
  summary += `**日期**: ${date}\n`;
  summary += `**总计**: ${allItems.length} 条新闻 (按热度排序)\n\n`;
  summary += `---\n\n`;
  
  // 热度榜单（Top 20）
  summary += `## 🔥 热度榜 TOP 20\n\n`;
  
  const top20 = allItems.slice(0, 20);
  
  for (let i = 0; i < top20.length; i++) {
    const item = top20[i];
    const rank = i + 1;
    const time = item.pubDate ? new Date(item.pubDate).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Shanghai'
    }) : '';
    
    const heatIcon = rank <= 5 ? '🔥' : (rank <= 10 ? '⚡' : '📌');
    
    summary += `### ${heatIcon} ${rank}. ${item.title}\n`;
    summary += `**来源**: ${item.source} | **热度**: ${item.heatScore.toFixed(1)}`;
    if (time) summary += ` | ⏰ ${time}`;
    summary += `\n\n`;
    
    if (item.contentSnippet) {
      summary += `> ${item.contentSnippet.trim().replace(/\n/g, ' ').substring(0, 150)}...\n\n`;
    }
    summary += `[查看详情](${item.link})\n\n`;
    summary += `---\n\n`;
  }
  
  // 按来源分类展示
  summary += `## 📂 按来源浏览\n\n`;
  
  for (const { feed, items, error } of feedsData) {
    if (error || items.length === 0) continue;
    
    summary += `### ${feed.name} (${feed.category})\n`;
    summary += `*热度权重: ${feed.weight}*\n\n`;
    
    const displayItems = items.slice(0, 5);
    
    for (const item of displayItems) {
      summary += `- **[${item.title}](${item.link})** (热度: ${item.heatScore.toFixed(1)})\n`;
    }
    
    if (items.length > 5) {
      summary += `\n*...还有 ${items.length - 5} 条*\n`;
    }
    summary += `\n`;
  }
  
  return summary;
}

// 保存数据
function saveData(feedsData, summary) {
  const jsonPath = getJsonPath();
  fs.writeFileSync(jsonPath, JSON.stringify(feedsData, null, 2), 'utf-8');
  console.log(`\n💾 AI 新闻 JSON 已保存: ${jsonPath}`);
  
  const mdPath = path.join(DATA_DIR, `ai-summary-${getTodayStr()}.md`);
  fs.writeFileSync(mdPath, summary, 'utf-8');
  console.log(`📄 AI 简报已保存: ${mdPath}`);
}

// 主函数
async function main() {
  console.log('🤖 开始 AI 新闻收集（热度排序模式）...\n');
  
  ensureDataDir();
  
  // 1. 加载已有数据
  const existingData = loadExistingData();
  
  // 2. 并行抓取所有 AI 源
  const newData = await Promise.all(AI_FEEDS.map(f => fetchFeed(f, 2)));
  
  // 3. 合并去重
  console.log('\n📝 合并数据...');
  const mergedData = mergeData(existingData, newData);
  
  // 4. 生成简报（按热度排序）
  console.log('\n📝 生成 AI 简报...');
  const summary = generateSummary(mergedData);
  
  // 5. 保存
  saveData(mergedData, summary);
  
  // 6. 打印简报
  console.log('\n' + '='.repeat(50));
  console.log(summary);
  
  // 统计
  const successCount = newData.filter(f => !f.error).length;
  const totalItems = mergedData.reduce((sum, f) => sum + f.items.length, 0);
  console.log(`\n✅ 完成: ${successCount}/${AI_FEEDS.length} 个 AI 源, 累计 ${totalItems} 条新闻`);
}

main().catch(console.error);
