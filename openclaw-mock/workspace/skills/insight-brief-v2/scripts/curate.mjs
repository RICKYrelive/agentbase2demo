#!/usr/bin/env node
/**
 * Stage 2: CURATE
 * Merge → Dedup → Filter → LLM Classify → Translate → Select
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_RAW = path.join(__dirname, '..', 'data', 'raw');
const DATA_CURATED = path.join(__dirname, '..', 'data', 'curated');

const GLM_API = 'https://open.bigmodel.cn/api/coding/paas/v4/chat/completions';
const GLM_KEY = process.env.GLM_API_KEY || 'YOUR_GLM_API_KEY';
const GLM_MODEL = 'glm-5-turbo';

const CATEGORIES = {
  frontier_tech: { label: '前沿技术', emoji: '🔬' },
  competitor: { label: '竞品动态', emoji: '🎯' },
  industry_report: { label: '行业报告', emoji: '📊' },
  academic: { label: '学术论文', emoji: '📚' },
  customer_case: { label: '客户案例与实践', emoji: '💼' },
};

const INVALID_PATTERNS = [
  /^今日热榜/, /^更多内容/, /^点击查看/, /^热门排行/, /^排行榜$/,
  /^热词$/, /^Loading/, /^网页/, /^广告/, /^推广/,
];

// ─── Helpers ───

function getToday() { return new Date().toISOString().split('T')[0]; }

function normalizeTitle(title) {
  return title.replace(/[\s\p{P}]/gu, '').substring(0, 20).toLowerCase();
}

function isInvalid(title) {
  return INVALID_PATTERNS.some(p => p.test(title)) || title.length < 4;
}

// ─── Step 1: Merge ───

function mergeRaw() {
  const date = getToday();
  const files = fs.readdirSync(DATA_RAW).filter(f => f.startsWith(date) && f.endsWith('.json'));
  console.log(`\n📂 读取 ${files.length} 个 raw 文件`);

  const allItems = [];
  for (const f of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(DATA_RAW, f), 'utf-8'));
      const collectorId = data.collector_id || f.replace(/\.json$/, '');
      for (const item of (data.items || [])) {
        allItems.push({ ...item, original_collector: collectorId });
      }
    } catch (e) {
      console.error(`  ✗ ${f}: ${e.message}`);
    }
  }
  console.log(`  → 合计 ${allItems.length} 条`);
  return allItems;
}

// ─── Step 2: Dedup ───

function dedup(items) {
  const seen = new Set();
  const deduped = [];
  for (const item of items) {
    const key1 = normalizeTitle(item.title);
    const key2 = item.link || '';
    if (seen.has(key1) || (key2 && seen.has(key2))) continue;
    seen.add(key1);
    if (key2) seen.add(key2);
    deduped.push(item);
  }
  console.log(`  → 去重后 ${deduped.length} 条`);
  return deduped;
}

// ─── Step 3: Filter ───

const MAX_AGE_DAYS = 3;

function parseDate(str) {
  if (!str) return null;
  // Try ISO format first
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d;
  // Try yyyy-MM-dd HH:mm:ss
  const m = str.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(m[1], m[2] - 1, m[3]);
  return null;
}

function filterItems(items) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - MAX_AGE_DAYS);

  const filtered = items.filter(item => {
    if (isInvalid(item.title)) return false;
    // 3-day freshness filter
    const d = parseDate(item.published_at || item.date || item.pubDate);
    if (d && d < cutoff) return false;
    return true;
  });
  console.log(`  → 过滤后 ${filtered.length} 条（${MAX_AGE_DAYS} 天时效）`);
  return filtered;
}

// ─── Step 4: LLM Classify ───

async function callGLM(messages, timeout = 30000) {
  const resp = await fetch(GLM_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GLM_KEY}`,
    },
    body: JSON.stringify({ model: GLM_MODEL, messages, temperature: 0.1 }),
    signal: AbortSignal.timeout(timeout),
  });
  if (!resp.ok) throw new Error(`GLM HTTP ${resp.status}`);
  const data = await resp.json();
  return data.choices?.[0]?.message?.content || '';
}

async function classifyBatch(items) {
  if (items.length === 0) return [];

  const itemsText = items.map((item, i) => `${i + 1}. [${item.source_name}] ${item.title}${item.summary ? '\n   摘要: ' + item.summary.substring(0, 100) : ''}`).join('\n');
  const prompt = `你是AI产业情报分析师。请将以下新闻/文章严格分类到5个类别之一，不符合任何类别的标记为"discard"。

## 分类标准（严格执行）

1. **frontier_tech**（前沿技术）：新模型发布、新技术突破、新架构、开源项目、算法创新、技术评测（AI相关）
   ✅ 示例：GPT-5发布、新推理架构、DeepSeek新版本、开源大模型、多模态技术突破
   ❌ 非示例：股市行情、裁员新闻、明星八卦、生活类内容、非AI产品评测（如充电头、手机壳）

2. **competitor**（竞品动态）：阿里云/字节跳动/腾讯/百度/华为/OpenAI/Google/Meta/Anthropic 等AI相关公司的产品发布、功能更新、定价策略、战略调整
   ✅ 示例：豆包更新、通义千问新功能、OpenAI产品上线、企业AI产品发布
   ❌ 非示例：非AI公司的普通新闻、早报类聚合新闻（如「AI早报」「科技早报」等每日汇总）

3. **industry_report**（行业报告）：Gartner/IDC/Forrester等机构报告、行业投融资、市场分析、政策法规、行业趋势预测、上市公司财报AI相关分析
   ✅ 示例：Gartner魔力象限、AI市场规模预测、AI公司融资、监管政策
   ❌ 非示例：普通股市行情（非AI分析）、公司非AI业务新闻

4. **academic**（学术论文）：arXiv论文、学术会议论文（NeurIPS/ICML等）、学术研究成果
   ✅ 示例：arxiv论文、NeurIPS/ICML论文、学术研究突破
   ❌ 非示例：媒体对论文的报道（非论文本身）、科普文章、个人随笔（少数派/掘金上的个人体验文章）、技术教程

5. **customer_case**（客户案例与实践）：企业实际落地案例、AI应用实践、最佳实践分享、行业解决方案
   ✅ 示例：某企业用AI降本增效、RAG落地实践、AI Agent实际部署案例、AI+行业解决方案
   ❌ 非示例：个人使用AI的感受、AI恋爱故事、产品体验文章、情绪类文章（如「聊聊AI焦虑」）、非AI产品评测

## 全局排除规则（标记为 discard）
以下内容一律标记为 discard，不归入任何类别：
- 聚合类早报（如「AI早报」「科技早报」「每日AI资讯」等每日汇总）
- 非AI产品评测（如充电头、手机壳、键盘等）
- 个人随笔、体验文章、情绪分享（如「聊聊AI焦虑」「我的AI使用心得」）
- 明星八卦、娱乐新闻、股市行情（非AI分析）
- 重复的摘要/转载（非一手来源）

## 输出要求

对每条新闻输出JSON数组，格式：
[{"index":序号,"category":"类别","summary":"20-40字的专业中文摘要，概括核心内容"}]

只输出JSON数组，不要其他文字。

## 新闻列表
${itemsText}`;

  try {
    const result = await callGLM([{ role: 'user', content: prompt }], 60000);
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error(`    LLM classify error: ${e.message}`);
    return [];
  }
}

async function classifyAll(items) {
  console.log(`\n🤖 LLM 分类 (${items.length} 条, 每批20条)...`);
  const results = new Map();
  const BATCH = 20;

  for (let i = 0; i < items.length; i += BATCH) {
    const batch = items.slice(i, i + BATCH);
    console.log(`  批次 ${Math.floor(i / BATCH) + 1}/${Math.ceil(items.length / BATCH)}`);
    const classified = await classifyBatch(batch);
    for (const c of classified) {
      const idx = parseInt(c.index) - 1 + i;
      if (idx >= 0 && idx < items.length) {
        results.set(idx, c);
      }
    }
  }

  return items.map((item, idx) => {
    const r = results.get(idx);
    if (!r || r.category === 'discard') return null;
    return {
      ...item,
      category: r.category,
      summary: r.summary || item.summary,
    };
  }).filter(Boolean);
}

// ─── Step 5: Select best per category ───

function selectBest(items) {
  const grouped = {};
  for (const item of items) {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  }

  const result = {};
  for (const [cat, catItems] of Object.entries(grouped)) {
    const meta = CATEGORIES[cat];
    if (!meta) continue;
    // Take top items (already roughly sorted by recency from collection order)
    result[cat] = {
      ...meta,
      items: catItems.slice(0, 10).map(item => ({
        title: item.title,
        summary: item.summary,
        link: item.link,
        source: item.source_name,
        original_collector: item.original_collector,
      })),
    };
  }

  const totalItems = Object.values(result).reduce((s, c) => s + c.items.length, 0);
  console.log(`  → 精选 ${totalItems} 条，覆盖 ${Object.keys(result).length} 个类别`);
  return result;
}

// ─── Main ───

async function main() {
  console.log('═'.repeat(50));
  console.log('📋 阶段二：CURATE');
  console.log('═'.repeat(50));

  fs.mkdirSync(DATA_CURATED, { recursive: true });

  const merged = mergeRaw();
  const deduped = dedup(merged);
  const filtered = filterItems(deduped);
  const classified = await classifyAll(filtered);
  const selected = selectBest(classified);

  const output = {
    curated_at: new Date().toISOString(),
    categories: selected,
  };

  const date = getToday();
  const outPath = path.join(DATA_CURATED, `${date}.json`);
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\n✅ 精选结果保存到 ${outPath}`);
  return outPath;
}

main().catch(err => { console.error('❌', err); process.exit(1); });
