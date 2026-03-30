import Parser from 'rss-parser';
import { truncate, createRawOutput } from './base-collector.mjs';

const parser = new Parser({
  timeout: 60000,
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; InsightCollector/2.0)' }
});

export async function collect(config) {
  const { feeds, keywords = [], max_items = 50 } = config;
  const kwSet = new Set(keywords.map(k => k.toLowerCase()));
  const allItems = [];

  for (const feed of feeds) {
    try {
      console.log(`  📡 ${feed.name}: ${feed.url}`);
      const result = await parser.parseURL(feed.url);
      let items = (result.items || []).map(item => ({
        title: (item.title || '').trim(),
        link: item.link || item.guid || '',
        summary: truncate(item.contentSnippet || item.content || item.summary || ''),
        source_name: feed.name,
        collected_at: new Date().toISOString()
      }));

      // keyword filter
      if (kwSet.size > 0) {
        items = items.filter(item => {
          const title = item.title.toLowerCase();
          return [...kwSet].some(kw => title.includes(kw));
        });
      }

      console.log(`     → ${items.length} 条`);
      allItems.push(...items);
    } catch (err) {
      console.error(`     ✗ ${feed.name}: ${err.message}`);
    }
  }

  return allItems.slice(0, max_items);
}
