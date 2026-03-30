import { truncate } from './base-collector.mjs';

/**
 * 微信公众号文章采集器（通过搜狗微信搜索）
 * 两种模式：
 * 1. accounts: 搜特定公众号的最新文章（用关键词 "{公众号名}" 搜索）
 * 2. keywords: 通过关键词检索公众号文章
 */

const SOGOU_WEIXIN = 'https://weixin.sogou.com/weixin';

export async function collect(config) {
  const { accounts, keywords, max_per_account = 5, max_per_keyword = 10 } = config;
  const allItems = [];

  // 模式1：搜特定公众号的最新文章
  if (accounts && accounts.length > 0) {
    for (const account of accounts) {
      try {
        console.log(`  📱 公众号: ${account}`);
        const results = await sogouWeixinSearch(account, max_per_account);
        for (const r of results) {
          allItems.push({
            title: r.title,
            link: r.link,
            summary: truncate(r.summary),
            source_name: `公众号:${account}`,
            collected_at: new Date().toISOString()
          });
        }
        console.log(`     → ${results.length} 条`);
      } catch (err) {
        console.error(`     ✗ 公众号 ${account}: ${err.message}`);
      }
    }
  }

  // 模式2：关键词搜索公众号文章
  if (keywords && keywords.length > 0) {
    for (const kw of keywords) {
      try {
        console.log(`  🔍 关键词: ${kw}`);
        const results = await sogouWeixinSearch(kw, max_per_keyword);
        for (const r of results) {
          allItems.push({
            title: r.title,
            link: r.link,
            summary: truncate(r.summary),
            source_name: `微信搜索:${kw.substring(0, 15)}`,
            collected_at: new Date().toISOString()
          });
        }
        console.log(`     → ${results.length} 条`);
      } catch (err) {
        console.error(`     ✗ 关键词 ${kw}: ${err.message}`);
      }
    }
  }

  return allItems;
}

async function sogouWeixinSearch(query, limit) {
  // 统一用 type=2 搜文章，type=1 搜公众号经常被反爬
  const url = `${SOGOU_WEIXIN}?type=2&query=${encodeURIComponent(query)}&ie=utf8`;

  const resp = await fetch(url, {
    signal: AbortSignal.timeout(30000),
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    }
  });

  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const html = await resp.text();

  const results = [];

  // 匹配每个 txt-box 块，提取标题、链接、摘要、公众号名
  // HTML 结构: <div class="txt-box"><h3><a href="..." ...>标题</a></h3><p class="txt-info">摘要</p><div class="s-p"><span class="all-time-y2">公众号名</span>...
  const blockRegex = /<div class="txt-box">\s*<h3>\s*<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>\s*<\/h3>\s*<p class="txt-info"[^>]*>([\s\S]*?)<\/p>\s*<div class="s-p">\s*<span class="all-time-y2">([^<]*)/g;

  let match;
  while ((match = blockRegex.exec(html)) !== null && results.length < limit) {
    const link = match[1].replace(/&amp;/g, '&');
    const title = stripHtml(match[2]).trim();
    const summary = stripHtml(match[3]).trim();
    const account = match[4].trim();

    if (title) {
      results.push({
        title,
        link: link.startsWith('http') ? link : `https://weixin.sogou.com${link}`,
        summary: account ? `${summary} — ${account}` : summary,
      });
    }
  }

  return results;
}

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&rarr;/g, '→')
    .trim();
}
