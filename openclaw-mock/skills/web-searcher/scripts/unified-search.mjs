#!/usr/bin/env node
/**
 * 统一搜索 - 多引擎fallback
 * 优先级: Brave API > DuckDuckGo HTML > Bing (Scrapling)
 */

const BRAVE_API_KEY = process.env.BRAVE_API_KEY || 'YOUR_BRAVE_API_KEY_HERE';

async function braveSearch(query, options = {}) {
  const {
    count = 10,
    searchLang = 'en',
    country = 'us'
  } = options;

  const params = new URLSearchParams({
    q: query,
    count: count.toString(),
    search_lang: searchLang,
    country: country
  });

  const url = `https://api.search.brave.com/res/v1/web/search?${params}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(url, {
      headers: {
        'X-Subscription-Token': BRAVE_API_KEY,
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Brave API failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      source: 'brave-api',
      results: data.web?.results || []
    };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function duckDuckGoSearch(query, count = 10) {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  const encodedQuery = encodeURIComponent(query);
  const url = `https://html.duckduckgo.com/html/?q=${encodedQuery}`;

  const { stdout } = await execAsync(
    `curl -s -L -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" "${url}"`,
    { timeout: 20000 }
  );

  // 简单的HTML解析
  const results = [];
  const titleRegex = /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  const descRegex = /<p[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/p>/gi;

  let match;
  let count2 = 0;

  while ((match = titleRegex.exec(stdout)) !== null && count2 < count) {
    const link = match[1];
    const title = match[2].replace(/<[^>]+>/g, '').trim();

    if (title && link && !link.includes('duckduckgo.com')) {
      results.push({
        title,
        url: link,
        description: ''
      });
      count2++;
    }
  }

  return {
    source: 'duckduckgo',
    results
  };
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
    console.error('用法: node unified-search.mjs <查询词> [--lang=zh-hans]');
    process.exit(1);
  }

  // 解析参数
  const options = {
    searchLang: 'en',
    country: 'us',
    count: 10
  };

  const queryParts = [];

  args.forEach(arg => {
    if (arg.startsWith('--lang=')) {
      options.searchLang = arg.split('=')[1];
    } else if (arg.startsWith('--country=')) {
      options.country = arg.split('=')[1];
    } else if (arg.startsWith('--count=')) {
      options.count = parseInt(arg.split('=')[1]);
    } else {
      queryParts.push(arg);
    }
  });

  const query = queryParts.join(' ');

  console.log(`🔍 统一搜索: "${query}"\n`);

  let searchResult;

  // 尝试Brave API
  try {
    console.log('  → 尝试 Brave Search API...');
    searchResult = await braveSearch(query, options);
    console.log(`  ✓ Brave API 成功 (${searchResult.results.length} 条结果)\n`);
  } catch (error) {
    console.log(`  ✗ Brave API 失败: ${error.message}`);

    // Fallback到DuckDuckGo
    try {
      console.log('  → 尝试 DuckDuckGo...');
      searchResult = await duckDuckGoSearch(query, options.count);
      console.log(`  ✓ DuckDuckGo 成功 (${searchResult.results.length} 条结果)\n`);
    } catch (error2) {
      console.log(`  ✗ DuckDuckGo 失败: ${error2.message}`);
      console.log('\n❌ 所有搜索引擎均失败');
      process.exit(1);
    }
  }

  // 显示结果
  if (searchResult.results.length === 0) {
    console.log('❌ 未找到相关结果');
    return;
  }

  console.log('─'.repeat(60) + '\n');

  searchResult.results.forEach((item, idx) => {
    console.log(`${idx + 1}. ${item.title}`);
    if (item.description) {
      console.log(`   ${item.description.substring(0, 150)}`);
    }
    console.log(`   🔗 ${item.url}`);
    console.log(`   📰 ${item.displayUrl || extractDomain(item.url)}`);
    console.log('');
  });

  console.log('─'.repeat(60));
  console.log('\n📋 JSON 输出:');
  const output = {
    source: searchResult.source,
    timestamp: new Date().toISOString(),
    query,
    options,
    items: searchResult.results.map((item, idx) => ({
      title: item.title,
      summary: (item.description || '').substring(0, 150),
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
}

main().catch(error => {
  console.error('✗ 搜索失败:', error.message);
  process.exit(1);
});
