#!/usr/bin/env node
/**
 * 36kr Hotlist Collector
 * 直接调用 36kr 开放 API 获取热榜数据，不依赖 RSSHub
 */

const API_BASE = 'https://openclaw.36krcdn.com/media/hotlist';
const MAX_DAYS = 3;

function getDateStr(d = new Date()) {
  return d.toISOString().split('T')[0];
}

export async function collect(config = {}) {
  const items = [];
  const maxDays = config.max_days || MAX_DAYS;
  const today = new Date();

  // 尝试最近 3 天的数据（当天可能还没生成）
  for (let i = 0; i < maxDays; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = getDateStr(date);

    try {
      const url = `${API_BASE}/${dateStr}/24h_hot_list.json`;
      const resp = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!resp.ok) continue;

      const data = await resp.json();
      if (!data.data || data.data.length === 0) continue;

      for (const article of data.data) {
        items.push({
          title: article.title,
          link: article.url || '',
          summary: (article.content && !/^\d+$/.test(article.content)) ? article.content : '',
          source_name: '36氪热榜',
          published_at: article.publishTime || dateStr,
          extra: { rank: article.rank, author: article.author, date: dateStr },
        });
      }
      console.log(`  📰 ${dateStr}: ${data.data.length} 条`);

      // 当天数据获取成功就不需要往前找了
      if (i === 0) break;
    } catch (err) {
      console.log(`  ⚠️ ${dateStr}: ${err.message}`);
    }
  }

  console.log(`  → 36kr 热榜共 ${items.length} 条`);
  return items;
}
