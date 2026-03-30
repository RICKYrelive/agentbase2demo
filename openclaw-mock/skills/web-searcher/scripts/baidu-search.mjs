#!/usr/bin/env node
/**
 * 百度搜索 - 使用 curl 抓取
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

  // 提取搜索结果容器
  const containerMatch = html.match(/id="content_left"[\s\S]*?<\/div>\s*<\/div>/);
  if (!containerMatch) return results;

  const container = containerMatch[0];

  // 匹配每个结果块
  const resultRegex = /<h3[^>]*class="[^"]*t[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<div[^>]*class="[^"]*c-abstract[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;

  let match;
  let count = 0;

  while ((match = resultRegex.exec(html)) !== null && count < 10) {
    const link = match[1];
    const title = match[2].replace(/<[^>]+>/g, '').trim();
    const desc = match[3].replace(/<[^>]+>/g, '').trim().substring(0, 150);

    if (title && link && !link.includes('baidu.com/link')) {
      results.push({
        title,
        description: desc,
        link,
        display_url: extractDomain(link)
      });
      count++;
    }
  }

  return results;
}

async function search(query, limit = 10) {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://www.baidu.com/s?wd=${encodedQuery}&rn=${limit}`;

  const { stdout, stderr } = await execAsync(
    `curl -s -L -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" "${url}"`,
    { timeout: 30000 }
  );

  return parseResults(stdout);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('用法: node baidu-search.mjs <查询词>');
    process.exit(1);
  }

  const query = args.join(' ');
  console.log(`🔍 百度搜索: "${query}"\n`);

  try {
    const results = await search(query);

    if (results.length === 0) {
      console.log('❌ 未找到相关结果');
      console.log('\n💡 提示: 可能需要登录验证或被反爬虫拦截');
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
      source: 'baidu-search',
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
