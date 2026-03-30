import { truncate, createRawOutput } from './base-collector.mjs';

export async function collect(config) {
  const { keywords = 'AI', max_items = 10 } = config;
  const kwList = keywords.split(',').map(k => k.trim());

  console.log(`  🔥 微博热搜 (keywords: ${keywords})`);
  const items = [];

  try {
    // Fetch Weibo hot search via RSSHub
    const resp = await fetch('http://localhost:1200/weibo/hot', {
      signal: AbortSignal.timeout(30000),
      headers: { 'User-Agent': 'InsightCollector/2.0' }
    });

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const text = await resp.text();

    // Parse RSS XML manually (avoid heavy deps)
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let m;
    let count = 0;
    while ((m = itemRegex.exec(text)) !== null && count < max_items) {
      const entry = m[1];
      const title = (entry.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
                     entry.match(/<title>(.*?)<\/title>/) || [])[1]?.trim() || '';

      // Filter by keywords
      if (kwList.some(kw => title.toLowerCase().includes(kw.toLowerCase()))) {
        const link = (entry.match(/<link>(.*?)<\/link>/) || [])[1]?.trim() || '';
        const desc = (entry.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) ||
                      entry.match(/<description>(.*?)<\/description>/) || [])[1]?.trim() || '';

        items.push({
          title,
          link,
          summary: truncate(desc),
          source_name: '微博热搜',
          collected_at: new Date().toISOString()
        });
        count++;
      }
    }

    console.log(`     → ${items.length} 条`);
  } catch (err) {
    console.error(`     ✗ 微博: ${err.message}`);
  }

  return items;
}
