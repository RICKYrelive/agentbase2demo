import { truncate, createRawOutput } from './base-collector.mjs';

export async function collect(config) {
  const { query, max_results = 20 } = config;
  const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${max_results}&sortBy=submittedDate&sortOrder=descending`;

  console.log(`  📚 arXiv query: "${query}"`);
  const resp = await fetch(url, { headers: { 'User-Agent': 'InsightCollector/2.0' } });
  const xml = await resp.text();

  // Simple XML parsing (no external dep needed for this)
  const items = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let m;
  while ((m = entryRegex.exec(xml)) !== null) {
    const entry = m[1];
    const title = (entry.match(/<title>([\s\S]*?)<\/title>/) || [])[1]?.replace(/\s+/g, ' ').trim() || '';
    const link = (entry.match(/<id>(.*?)<\/id>/) || [])[1]?.trim() || '';
    const summary = (entry.match(/<summary>([\s\S]*?)<\/summary>/) || [])[1]?.replace(/\s+/g, ' ').trim() || '';

    items.push({
      title: title.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'),
      link,
      summary: truncate(summary.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')),
      source_name: 'arXiv',
      collected_at: new Date().toISOString()
    });
  }

  console.log(`     → ${items.length} 篇论文`);
  return items;
}
