#!/usr/bin/env node
/**
 * Stage 3: PRESENT
 * Generate final Markdown report from curated JSON
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_CURATED = path.join(__dirname, '..', 'data', 'curated');
const DATA_DIR = path.join(__dirname, '..', 'data');

function getToday() { return new Date().toISOString().split('T')[0]; }

const SECTION_ORDER = ['frontier_tech', 'competitor', 'industry_report', 'academic', 'customer_case'];
const SECTION_TITLES = ['前沿技术', '竞品动态', '行业报告', '学术论文', '客户案例与实践'];

function main() {
  const date = getToday();
  const curatedPath = path.join(DATA_CURATED, `${date}.json`);

  if (!fs.existsSync(curatedPath)) {
    console.error(`❌ 未找到精选数据: ${curatedPath}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(curatedPath, 'utf-8'));
  const { categories = {} } = data;

  let totalItems = 0;
  const time = data.curated_at ? new Date(data.curated_at).toISOString().replace('T', ' ').substring(0, 16) + ' UTC' : new Date().toISOString();

  let md = `# 📊 AI Agent 每日洞察简报\n`;
  md += `> 生成时间：${time}\n`;
  md += `> 本期精选：`;

  let sections = '';
  for (let i = 0; i < SECTION_ORDER.length; i++) {
    const cat = SECTION_ORDER[i];
    const info = categories[cat];
    if (!info || info.items.length === 0) continue;

    totalItems += info.items.length;
    sections += `\n---\n\n`;
    sections += `## ${info.emoji} ${['一', '二', '三', '四', '五'][i]}、${info.label}\n\n`;

    info.items.forEach((item, idx) => {
      sections += `### ${idx + 1}. ${item.title}\n`;
      sections += `> ${item.summary || '暂无摘要'}\n`;
      sections += `> ${item.source || '未知来源'} · [查看详情](${item.link})\n\n`;
    });
  }

  md += `${totalItems} 条\n\n${sections}\n---\n\n*📊 由 Insight Brief v2 自动生成*\n`;

  // Save report
  const reportPath = path.join(DATA_DIR, `report-${date}.md`);
  fs.writeFileSync(reportPath, md);
  console.log(`✅ 报告生成: ${reportPath} (${totalItems} 条)`);
  return reportPath;
}

main();
