#!/usr/bin/env node
/**
 * Web Searcher - Brave Search API 封装
 */

const API_KEY = process.env.BRAVE_API_KEY || 'YOUR_BRAVE_API_KEY_HERE';

async function search(query, count = 10) {
  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}&search_lang=zh-hans`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  const response = await fetch(url, {
    headers: {
      'X-Subscription-Token': API_KEY,
      'Accept': 'application/json'
    },
    signal: controller.signal
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('用法: node search.mjs <查询词>');
    process.exit(1);
  }

  const query = args.join(' ');
  console.log(`🔍 搜索: "${query}"\n`);

  try {
    const results = await search(query);

    if (!results.web?.results?.length) {
      console.log('❌ 未找到相关结果');
    return;
  }

    console.log(`📊 找到 ${results.web.results.length} 条结果\n`);
    console.log('─'.repeat(60) + '\n');

    results.web.results.forEach((item, idx) => {
      console.log(`${idx + 1}. ${item.title}`);
      console.log(`   ${item.description?.substring(0, 150) || '无描述'}`);
      console.log(`   🔗 ${item.url}`);
      console.log(`   📰 ${item.displayUrl || extractDomain(item.url)}`);
      console.log('');
    });

    console.log('─'.repeat(60));
    console.log('\n📋 JSON 输出:');
    const output = {
      source: 'web-searcher',
      timestamp: new Date().toISOString(),
      query,
      items: results.web.results.map((item, idx) => ({
        title: item.title,
        summary: item.description?.substring(0, 150) || '',
        link: item.url,
        source_name: item.displayUrl || extractDomain(item.url),
        category: '搜索结果',
        metadata: {
          rank: idx + 1,
          display_url: item.displayUrl || extractDomain(item.url)
        }
      }))
    };
    console.log(JSON.stringify(output, null, 2));

  } catch (error) {
    console.error('✗ 搜索失败:', error.message);
    process.exit(1);
  }
}

main();
