#!/usr/bin/env node
/**
 * DuckDuckGo 搜索 - 轻量级无头搜索
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function parseResults(html) {
  const results = [];

  // DuckDuckGo HTML 版本的结果解析
  const resultRegex = /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]*class="[^"]*result__url[^"]*"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<p[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/p>/gi;

  let match;
  let count = 0;

  while ((match = resultRegex.exec(html)) !== null && count < 10) {
    const link = match[1];
    const title = match[2].replace(/<[^>]+>/g, '').trim();
    const displayUrl = match[3].replace(/<[^>]+>/g, '').trim();
    const desc = match[4].replace(/<[^>]+>/g, '').trim().substring(0, 150);

    if (title && link) {
      results.push({
        title,
        description: desc,
        link,
        display_url: displayUrl || extractDomain(link)
      });
      count++;
    }
  }

  return results;
}

async function search(query, limit = 10) {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://html.duckduckgo.com/html/?q=${encodedQuery}`;

  const { stdout } = await execAsync(
    `curl -s -L -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" "${url}"`,
    { timeout: 30000 }
  );

  return parseResults(stdout);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('用法: node duck-search.mjs <查询词>');
    process.exit(1);
  }

  const query = args.join(' ');
  console.log(`🔍 DuckDuckGo 搜索: "${query}"\n`);

  try {
    const results = await search(query);

    if (results.length === 0) {
      console.log('❌ 未找到相关结果');
      return;
    }

    console.log(`📊 找到 ${results.length} 条结果\n`);
    console.log('─'.repeat(60) + '\n');

    results.forEach((item, idx) => {
      console.log(`${idx + 1}. ${item.title}`);
      if (item.description) {
        console.log(`   ${item.description}...`);
      }
      console.log(`   🔗 ${item.link}`);
      console.log(`   📰 ${item.display_url}`);
      console.log();
    });

    // 输出 JSON
    const output = {
      source: 'duckduckgo-search',
      timestamp: new Date().toISOString(),
      query,
      items: results.map((item, idx) => ({
        title: item.title,
        summary: item.description,
        link: item.link,
        source_name: item.display_url,
        category: '搜索结果',
        metadata: {
          rank: idx + 1,
          display_url: item.display_url
        }
      }))
    };

    console.log('─'.repeat(60));
    console.log('\n📋 JSON 输出:');
    console.log(JSON.stringify(output, null, 2));

  } catch (error) {
    console.error('✗ 搜索失败:', error.message);
    process.exit(1);
  }
}

main();
