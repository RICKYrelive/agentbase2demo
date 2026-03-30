import { truncate, createRawOutput } from './base-collector.mjs';

export async function collect(config) {
  const { targets, queries, max_per_target = 5, max_results = 10 } = config;
  const allItems = [];

  // targets mode
  if (targets) {
    for (const target of targets) {
      try {
        console.log(`  🔍 ${target.name}: ${target.keywords}`);
        const results = await searxngSearch(target.keywords, max_per_target);
        for (const r of results) {
          allItems.push({
            title: r.title || '',
            link: r.url || '',
            summary: truncate(r.content || ''),
            source_name: `搜索:${target.name}`,
            collected_at: new Date().toISOString()
          });
        }
        console.log(`     → ${results.length} 条`);
      } catch (err) {
        console.error(`     ✗ ${target.name}: ${err.message}`);
      }
    }
  }

  // queries mode
  if (queries) {
    for (const q of queries) {
      try {
        console.log(`  🔍 query: ${q}`);
        const results = await searxngSearch(q, max_results);
        for (const r of results) {
          allItems.push({
            title: r.title || '',
            link: r.url || '',
            summary: truncate(r.content || ''),
            source_name: `搜索:${q.substring(0, 10)}`,
            collected_at: new Date().toISOString()
          });
        }
        console.log(`     → ${results.length} 条`);
      } catch (err) {
        console.error(`     ✗ ${q}: ${err.message}`);
      }
    }
  }

  return allItems;
}

async function searxngSearch(query, limit) {
  const url = `http://localhost:8080/search?q=${encodeURIComponent(query)}&format=json`;
  const resp = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const data = await resp.json();
  return (data.results || []).slice(0, limit);
}
