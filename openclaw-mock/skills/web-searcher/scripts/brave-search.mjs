#!/usr/bin/env node
/**
 * Brave Search API - 高质量搜索
 * 使用Brave Search API进行精确搜索
 */

const API_KEY = process.env.BRAVE_API_KEY || 'YOUR_BRAVE_API_KEY_HERE';

async function search(query, options = {}) {
  const {
    count = 10,
    offset = 0,
    searchLang = 'en',  // 默认英文，更准确
    country = 'us',
    freshness = null    // 'pd' (past day), 'pw' (past week), 'pm' (past month)
  } = options;

  const params = new URLSearchParams({
    q: query,
    count: count.toString(),
    offset: offset.toString(),
    search_lang: searchLang,
    country: country
  });

  if (freshness) {
    params.append('freshness', freshness);
  }

  const url = `https://api.search.brave.com/res/v1/web/search?${params}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
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

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
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
    console.error('用法: node brave-search.mjs <查询词> [--lang=zh-hans] [--country=cn] [--freshness=pw]');
    console.error('\n选项:');
    console.error('  --lang=LANG     搜索语言 (默认: en)');
    console.error('  --country=CC    国家代码 (默认: us)');
    console.error('  --freshness=F   时间限制 (pd=过去一天, pw=过去一周, pm=过去一月)');
    process.exit(1);
  }

  // 解析参数
  const options = {
    searchLang: 'en',
    country: 'us',
    count: 10,
    freshness: null
  };

  const queryParts = [];

  args.forEach(arg => {
    if (arg.startsWith('--lang=')) {
      options.searchLang = arg.split('=')[1];
    } else if (arg.startsWith('--country=')) {
      options.country = arg.split('=')[1];
    } else if (arg.startsWith('--freshness=')) {
      options.freshness = arg.split('=')[1];
    } else if (arg.startsWith('--count=')) {
      options.count = parseInt(arg.split('=')[1]);
    } else {
      queryParts.push(arg);
    }
  });

  const query = queryParts.join(' ');

  console.log(`🔍 Brave Search: "${query}"\n`);
  console.log(`   语言: ${options.searchLang}, 国家: ${options.country}, 数量: ${options.count}`);
  if (options.freshness) {
    console.log(`   时间限制: ${options.freshness}`);
  }
  console.log('');

  try {
    const results = await search(query, options);

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
      source: 'brave-search',
      timestamp: new Date().toISOString(),
      query,
      options,
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
