#!/usr/bin/env node
/**
 * Pipeline: Stage 1 → Stage 2 → Stage 3
 * Usage:
 *   node pipeline.mjs           # Run all stages
 *   node pipeline.mjs --push    # Run all stages + push to Feishu
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jsYaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, '..', 'config', 'sources.yaml');
const DATA_RAW = path.join(__dirname, '..', 'data', 'raw');

function getToday() { return new Date().toISOString().split('T')[0]; }

// ─── Collector Registry ───

const COLLECTOR_MAP = {
  rss: () => import('./collectors/rss-collector.mjs'),
  arxiv: () => import('./collectors/arxiv-collector.mjs'),
  'web-search': () => import('./collectors/web-search-collector.mjs'),
  weibo: () => import('./collectors/weibo-collector.mjs'),
  wechat: () => import('./collectors/wechat-collector.mjs'),
  '36kr-hotlist': () => import('./collectors/36kr-collector.mjs'),
};

// ─── Stage 1: COLLECT ───

async function runCollectors() {
  console.log('═'.repeat(50));
  console.log('📡 阶段一：COLLECT');
  console.log('═'.repeat(50));

  const config = jsYaml.load(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  const collectors = (config.collectors || []).filter(c => c.enabled);

  fs.mkdirSync(DATA_RAW, { recursive: true });

  let success = 0, fail = 0;
  const date = getToday();

  for (const collector of collectors) {
    const loader = COLLECTOR_MAP[collector.type];
    if (!loader) {
      console.log(`⚠️  未知类型: ${collector.type} (${collector.id})`);
      fail++;
      continue;
    }

    try {
      console.log(`\n🔹 [${collector.name}] (${collector.id})`);
      const mod = await loader();
      const items = await mod.collect(collector.config);

      const output = {
        collector_id: collector.id,
        collected_at: new Date().toISOString(),
        items,
      };

      const outPath = path.join(DATA_RAW, `${date}-${collector.id}.json`);
      fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
      console.log(`  💾 ${items.length} 条 → ${outPath}`);
      success++;
    } catch (err) {
      console.error(`  ❌ ${collector.id}: ${err.message}`);
      fail++;
    }
  }

  console.log(`\n✅ 阶段一完成: ${success} 成功, ${fail} 失败`);
}

// ─── Stage 2: CURATE ───

async function runCurate() {
  const { exec } = await import('child_process');
  const proc = await import('child_process');
  return new Promise((resolve, reject) => {
    const child = proc.execFile('node', [path.join(__dirname, 'curate.mjs')], { stdio: 'inherit' });
    child.on('close', code => code === 0 ? resolve() : reject(new Error(`curate exit ${code}`)));
  });
}

// ─── Stage 3: PRESENT ───

async function runPresent() {
  const proc = await import('child_process');
  return new Promise((resolve, reject) => {
    const child = proc.execFile('node', [path.join(__dirname, 'present.mjs')], { stdio: 'inherit' });
    child.on('close', code => code === 0 ? resolve() : reject(new Error(`present exit ${code}`)));
  });
}

// ─── Push ───

async function runPush() {
  console.log('\n📤 推送飞书文档...');
  const date = getToday();
  const v2ReportPath = path.join(__dirname, '..', 'data', `report-${date}.md`);

  if (!fs.existsSync(v2ReportPath)) {
    console.error(`❌ 未找到报告文件: ${v2ReportPath}`);
    return;
  }

  // 复制到 push-to-feishu-doc 期望的文件名格式
  const dataDir = path.join(__dirname, '..', 'data');
  const legacyPath = path.join(dataDir, `merged-summary-${date}.md`);
  fs.copyFileSync(v2ReportPath, legacyPath);
  console.log(`  📋 已复制报告到 ${legacyPath}`);

  const proc = await import('child_process');
  return new Promise((resolve, reject) => {
    const child = proc.execFile('node', [path.join(__dirname, 'push-to-feishu-doc.mjs')], { stdio: 'inherit' });
    child.on('close', code => code === 0 ? resolve() : reject(new Error(`push exit ${code}`)));
  });
}

// ─── Main ───

async function main() {
  const startTime = Date.now();
  console.log(`\n🚀 Insight Pipeline v2 启动`);
  console.log(`   ${new Date().toISOString()}\n`);

  await runCollectors();
  await runCurate();
  await runPresent();

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n🏁 全部完成！耗时 ${elapsed}s`);

  if (process.argv.includes('--push')) {
    await runPush();
  }
}

main().catch(err => {
  console.error('❌ Pipeline error:', err.message);
  process.exit(1);
});
