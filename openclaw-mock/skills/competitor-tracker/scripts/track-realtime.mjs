#!/usr/bin/env node
/**
 * 竞品实时追踪 v2
 * 使用 SearXNG（本地）搜索竞品关键词，覆盖 Agent 产品线和传统云厂商
 * 替代原 track-realtime.py（scrapling+Bing 在当前网络下不可用）
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(process.env.HOME, '.openclaw/workspace/insight-system/data');
const SEARXNG_URL = 'http://localhost:8080/search';

// ========== 竞品定义 ==========
// 每个竞品有专属搜索关键词，覆盖其 Agent/AI 产品线
const COMPETITORS = {
  '阿里云': {
    label: '阿里云（HiClaw/CoPaw/JVS Claw）',
    queries: [
      'HiClaw 最新 更新 3月',
      'CoPaw 阿里云 新功能',
      'JVS Claw 阿里云 上线 更新',
      '阿里云 AI Agent 发布 新品',
      '阿里通义 智能体 战略合作',
    ],
    products: ['HiClaw', 'CoPaw', 'JVS Claw', '通义千问', '百炼']
  },
  'NVIDIA': {
    label: 'NVIDIA（NemoClaw）',
    queries: [
      'NemoClaw 更新 功能',
      'NemoClaw OpenClaw 版本发布',
      'NVIDIA AI Agent 平台 最新',
    ],
    products: ['NemoClaw', 'NeMo', 'Nemotron']
  },
  '字节跳动': {
    label: '字节跳动（扣子/Coze）',
    queries: [
      '扣子 Coze 更新 新功能 3月',
      '豆包 Agent 字节 发布',
      '火山引擎 AI Agent 新品',
      '秒哒 字节 上线 更新',
      'Coze 战略合作 上线',
    ],
    products: ['Coze', '扣子', '豆包', '火山引擎', '秒哒']
  },
  '腾讯': {
    label: '腾讯（混元/QClaw）',
    queries: [
      '腾讯混元 Agent 更新 发布',
      'QClaw 腾讯 上线',
      '腾讯 AI Agent 战略合作',
      '腾讯元宝 新功能',
    ],
    products: ['混元', '腾讯元宝', 'QClaw']
  },
  '百度': {
    label: '百度（文心/千帆）',
    queries: [
      '百度文心 Agent 更新 发布',
      '千帆 Agent 新功能',
      '百度 AI Agent 战略合作',
    ],
    products: ['文心一言', '千帆', '文心Agent']
  },
  '华为': {
    label: '华为（小艺 Claw/盘古）',
    queries: [
      '华为小艺 Claw 更新 上线',
      '华为盘古大模型 Agent 发布',
      '华为 AI Agent 战略合作',
    ],
    products: ['小艺Claw', '盘古']
  },
  '小米': {
    label: '小米（Xiaomi miclaw）',
    queries: [
      '小米 miclaw 更新 上线',
      'Xiaomi AI Agent 新功能',
      '小米 AI 战略合作',
    ],
    products: ['miclaw', '小米AI']
  },
  'OpenAI': {
    label: 'OpenAI（OpenClaw）',
    queries: [
      'OpenClaw 更新 新版本',
      'OpenAI Agent 发布 Operator',
      'OpenAI 产品 功能 更新',
    ],
    products: ['OpenClaw', 'ChatGPT', 'Operator']
  }
};

// 通用 Agent 生态关键词（额外搜索一轮）
const AGENT_ECOSYSTEM_QUERIES = [
  'AI Agent 平台 新品 发布 本周',
  '智能体 开源 更新 3月',
  '龙虾 AI Claw 竞品 发布',
  'AI Agent 战略合作 2026年3月',
];

// ========== SearXNG 搜索 ==========
async function searchSearXNG(query, maxResults = 8) {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    language: 'zh-CN',
  });

  try {
    const resp = await fetch(`${SEARXNG_URL}?${params}`, {
      signal: AbortSignal.timeout(15000),
    });

    if (!resp.ok) return [];

    const data = await resp.json();
    return (data.results || []).slice(0, maxResults).map(r => ({
      title: r.title || '',
      snippet: r.content || '',
      url: r.url || '',
      engine: r.engine || '',
    }));
  } catch (e) {
    console.warn(`   ⚠ SearXNG 搜索失败: ${e.message}`);
    return [];
  }
}

// ========== 判断相关性 ==========
function isRelevant(result, competitorKey) {
  const comp = COMPETITORS[competitorKey];
  if (!comp) return false;

  const text = `${result.title} ${result.snippet}`.toLowerCase();

  // 必须包含至少一个产品名或公司名
  const hasProduct = comp.products.some(p => text.toLowerCase().includes(p.toLowerCase()));
  const hasCompany = text.includes(competitorKey.toLowerCase());

  return hasProduct || hasCompany;
}

function isHighValue(result) {
  const text = `${result.title} ${result.snippet}`.toLowerCase();
  // 排除低价值内容
  const junk = ['怎么样', '如何', '为什么', '是不是', '请问', '教程', '安装教程',
    '下载地址', '注册', '知乎', '百度知道', '贴吧', 'csdn blog', 'CSDN',
    '招聘', '求职', '简历', '面试', '课程', '培训班'];
  if (junk.some(k => text.includes(k))) return false;
  if (result.title.length < 8) return false;

  // 偏好有价值的内容
  const good = ['发布', '上线', '推出', '开源', '更新', '升级', '新功能', '新品',
    '重磅', '首发', '正式', '架构', '技术', '安全', '评测', '对比', '分析',
    '收购', '融资', '战略合作', '开发者', '版本', '封测', '内测', '公测',
    '合作', '投资', '收购', '合并', '接入', '适配', '支持'];
  return good.some(k => text.includes(k));
}

// ========== 日期过滤 ==========
function isRecent(result, days = 7) {
  // 从 URL 或 snippet 中提取日期
  const text = `${result.url} ${result.snippet}`;

  // 相对时间词
  if (/今天|今日|昨天|昨日|刚刚|本周|近期|最新|3月/.test(text)) return true;

  // 具体日期 2026-03-X
  const dateMatch = text.match(/2026-0?3-(\d{1,2})/);
  if (dateMatch) {
    const day = parseInt(dateMatch[1]);
    const now = new Date();
    const currentDay = now.getUTCDate();
    if (day >= currentDay - days) return true;
  }

  // 中文日期 3月X日
  const cnDate = text.match(/3月(\d{1,2})[日号]/);
  if (cnDate) {
    const day = parseInt(cnDate[1]);
    const now = new Date();
    const currentDay = now.getUTCDate();
    if (day >= currentDay - days) return true;
  }

  return false;
}

// ========== 去重 ==========
function dedupe(items) {
  const seen = new Set();
  return items.filter(item => {
    const key = item.title.substring(0, 30).replace(/\s/g, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ========== 主流程 ==========
async function main() {
  const today = new Date().toISOString().split('T')[0];
  console.log(`\n🎯 竞品实时追踪 v2 | ${today}`);
  console.log(`📡 搜索引擎: ${SEARXNG_URL}\n`);

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const results = {};

  for (const [key, comp] of Object.entries(COMPETITORS)) {
    console.log(`\n🔎 ${comp.label}`);
    const allResults = [];

    for (const query of comp.queries) {
      console.log(`   搜索: "${query}"`);
      const items = await searchSearXNG(query, 8);
      allResults.push(...items);
      await new Promise(r => setTimeout(r, 500)); // 限流
    }

    // 过滤：相关性 + 价值 + 时间
    const filtered = allResults
      .filter(r => isRelevant(r, key))
      .filter(r => isHighValue(r))
      .filter(r => isRecent(r, 7));

    const unique = dedupe(filtered).slice(0, 5);

    results[key] = {
      has_updates: unique.length > 0,
      items: unique.map(r => ({
        title: r.title,
        summary: r.snippet.substring(0, 200),
        link: r.url,
        source_name: r.engine || 'SearXNG',
        category: classifyCategory(r.title, r.snippet),
        metadata: {
          competitor: key,
          importance: assessImportance(r.title),
          source: 'search'
        }
      })),
      count: unique.length
    };

    if (unique.length > 0) {
      console.log(`   ✅ 找到 ${unique.length} 条`);
      unique.forEach(r => console.log(`      • ${r.title.substring(0, 50)}`));
    } else {
      console.log(`   ❌ 无更新`);
    }
  }

  // 额外搜索：Agent 生态动态（不绑定具体竞品）
  console.log(`\n🌐 Agent 生态动态搜索`);
  let ecosystemItems = [];
  for (const query of AGENT_ECOSYSTEM_QUERIES) {
    console.log(`   搜索: "${query}"`);
    const items = await searchSearXNG(query, 8);
    ecosystemItems.push(...items);
    await new Promise(r => setTimeout(r, 500));
  }

  ecosystemItems = ecosystemItems
    .filter(r => isHighValue(r))
    .filter(r => isRecent(r, 7))
    .filter(r => !Object.values(COMPETITORS).some(c => c.products.some(p => r.title.toLowerCase().includes(p.toLowerCase()))));

  results['Agent 生态'] = {
    has_updates: ecosystemItems.length > 0,
    items: dedupe(ecosystemItems).slice(0, 5).map(r => ({
      title: r.title,
      summary: r.snippet.substring(0, 200),
      link: r.url,
      source_name: r.engine || 'SearXNG',
      category: '行业动态',
      metadata: { importance: 'medium', source: 'search' }
    })),
    count: dedupe(ecosystemItems).slice(0, 5).length
  };

  // 统计
  const totalUpdates = Object.values(results).reduce((s, r) => s + r.count, 0);
  console.log(`\n${'='.repeat(50)}`);
  console.log(`📊 总计 ${totalUpdates} 条竞品动态`);

  // 输出 JSON
  const output = {
    source: 'competitor-tracker-realtime',
    timestamp: new Date().toISOString(),
    time_window_days: 7,
    competitors: Object.keys(results),
    total_updates: totalUpdates,
    has_any_updates: totalUpdates > 0,
    results
  };

  const outputPath = path.join(DATA_DIR, `competitor-realtime-${today}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`💾 已保存: ${outputPath}`);
}

function classifyCategory(title, snippet) {
  const text = `${title} ${snippet}`;
  if (/发布|推出|上线|首发/.test(text)) return '产品发布';
  if (/开源/.test(text)) return '开源动态';
  if (/融资|收购|投资/.test(text)) return '资本动态';
  if (/评测|对比|测试|体验/.test(text)) return '产品评测';
  if (/架构|技术|算法|模型|突破/.test(text)) return '技术动态';
  return '一般动态';
}

function assessImportance(title) {
  const text = title.toLowerCase();
  if (/重大|首次|突破|重磅|收购|发布|正式|全新/.test(text)) return 'high';
  if (/更新|升级|新功能|开源|版本/.test(text)) return 'medium';
  return 'low';
}

main().catch(e => {
  console.error('追踪失败:', e);
  process.exit(1);
});
