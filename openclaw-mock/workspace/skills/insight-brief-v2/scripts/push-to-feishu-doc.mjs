#!/usr/bin/env node
/**
 * 推送简报到飞书文档
 * 每天创建一个新文档，命名格式：AI 领域动态简报 - YYYY-MM-DD
 * 
 * 使用飞书 Descendant API 写入内容
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const APP_ID = process.env.FEISHU_APP_ID || 'YOUR_FEISHU_APP_ID';
const APP_SECRET = process.env.FEISHU_APP_SECRET || 'YOUR_FEISHU_APP_SECRET';
const DEFAULT_GROUP_ID = process.env.FEISHU_GROUP_ID || 'YOUR_GROUP_ID';
const WEBHOOK_URL = process.env.FEISHU_WEBHOOK_URL || 'YOUR_WEBHOOK_URL';

const DATA_DIR = path.join(__dirname, '..', 'data');

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

function request(method, hostname, path, data, headers) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    const req = https.request({
      hostname, port: 443, path, method,
      headers: { 'Content-Type': 'application/json', ...headers }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => { 
        try { resolve({ ...JSON.parse(body), statusCode: res.statusCode }); } 
        catch (e) { resolve({ raw: body, statusCode: res.statusCode }); } 
      });
    });
    req.on('error', reject);
    if (data) req.write(postData);
    req.end();
  });
}

// Markdown 转飞书块
function mdToBlocks(content) {
  const lines = content.split('\n').filter(l => l.trim());
  const descendants = [];
  const children_id = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const blockId = `doxcn_${Date.now()}_${i}`;
    let block = null;
    
    if (line.startsWith('# ')) {
      block = { block_id: blockId, block_type: 3, heading1: { elements: [{ text_run: { content: line.substring(2) } }] } };
    } else if (line.startsWith('## ')) {
      block = { block_id: blockId, block_type: 4, heading2: { elements: [{ text_run: { content: line.substring(3) } }] } };
    } else if (line.startsWith('### ')) {
      block = { block_id: blockId, block_type: 5, heading3: { elements: [{ text_run: { content: line.substring(4) } }] } };
    } else if (line.startsWith('> ')) {
      block = { block_id: blockId, block_type: 15, quote: { elements: [{ text_run: { content: line.substring(2) } }] } };
    } else if (line !== '---') {
      block = { block_id: blockId, block_type: 2, text: { elements: [{ text_run: { content: line.substring(0, 200) } }] } };
    }
    
    if (block) {
      descendants.push(block);
      children_id.push(blockId);
    }
  }
  
  return { descendants, children_id };
}

async function main() {
  const date = getTodayStr();
  
  // 1. 找简报
  const files = [
    { path: `merged-summary-${date}.md`, name: '合并简报' },
    { path: `report-${date}.md`, name: 'V2 简报' },
    { path: `ai-summary-${date}.md`, name: 'AI 简报' },
    { path: `analyst-summary-${date}.md`, name: '行业分析简报' },
    { path: `summary-${date}.md`, name: '综合简报' }
  ];
  
  let summaryPath = null;
  let summaryName = null;
  
  for (const f of files) {
    const fullPath = path.join(DATA_DIR, f.path);
    if (fs.existsSync(fullPath)) {
      summaryPath = fullPath;
      summaryName = f.name;
      break;
    }
  }
  
  // 如果有 AI 简报和行业分析简报，尝试合并
  const aiPath = path.join(DATA_DIR, `ai-summary-${date}.md`);
  const analystPath = path.join(DATA_DIR, `analyst-summary-${date}.md`);
  
  if (fs.existsSync(aiPath) && fs.existsSync(analystPath) && !fs.existsSync(path.join(DATA_DIR, `merged-summary-${date}.md`))) {
    console.log('📝 合并 AI 简报和行业分析简报...');
    const aiContent = fs.readFileSync(aiPath, 'utf-8');
    const analystContent = fs.readFileSync(analystPath, 'utf-8');
    const mergedContent = aiContent + '\n\n---\n\n' + analystContent;
    const mergedPath = path.join(DATA_DIR, `merged-summary-${date}.md`);
    fs.writeFileSync(mergedPath, mergedContent);
    summaryPath = mergedPath;
    summaryName = '合并简报';
    console.log('✅ 已创建合并简报');
  }
  
  if (!summaryPath) {
    console.error('❌ 没有找到简报文件');
    process.exit(1);
  }
  
  console.log(`📄 使用简报: ${summaryName}`);
  const content = fs.readFileSync(summaryPath, 'utf-8');
  
  // 2. 获取 token
  console.log('🔐 获取访问令牌...');
  const tokenResp = await request('POST', 'open.feishu.cn', '/open-apis/auth/v3/tenant_access_token/internal', {
    app_id: APP_ID, app_secret: APP_SECRET
  });
  
  if (tokenResp.code !== 0) {
    console.error('❌ 获取令牌失败:', tokenResp);
    process.exit(1);
  }
  const token = tokenResp.tenant_access_token;
  
  // 3. 创建文档
  console.log('📝 创建文档...');
  const createResp = await request('POST', 'open.feishu.cn', '/open-apis/docx/v1/documents', {
    title: `🤖 AI 领域动态简报 - ${date}`
  }, { 'Authorization': `Bearer ${token}` });
  
  if (createResp.code !== 0) {
    console.error('❌ 创建文档失败:', createResp);
    process.exit(1);
  }
  
  const docId = createResp.data.document.document_id;
  console.log('✅ 文档创建成功:', docId);
  
  // 4. 写入内容 - 使用 descendant API (注意是单数!)
  const { descendants, children_id } = mdToBlocks(content);
  console.log(`📝 写入 ${descendants.length} 个内容块...`);
  
  const batchResp = await request('POST', 'open.feishu.cn',
    `/open-apis/docx/v1/documents/${docId}/blocks/${docId}/descendant`,
    { children_id, descendants },
    { 'Authorization': `Bearer ${token}` }
  );
  
  if (batchResp.code !== 0) {
    console.error('❌ 写入内容失败:', batchResp);
    process.exit(1);
  }
  
  console.log(`✅ 内容写入成功`);
  
  // 5. 推送报告内容到群
  const groupId = process.env.GROUP_ID || DEFAULT_GROUP_ID;
  console.log(`📤 推送报告到群 ${groupId}...`);

  // 解析报告的分类段落
  const lines = content.split('\n');
  let currentCategory = null;
  let currentItems = [];
  const categories = [];

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (currentCategory) {
        categories.push({ title: currentCategory, items: currentItems });
      }
      currentCategory = line.replace('## ', '').trim();
      currentItems = [];
    } else if (line.startsWith('### ')) {
      const linkMatch = line.match(/\[查看详情\]\(([^)]+)\)/);
      const titleText = line.replace(/###\s*/, '').replace(/\s*\[查看详情\]\([^)]+\)/, '').replace(/>\s*$/, '').trim();
      currentItems.push({ title: titleText, link: linkMatch ? linkMatch[1] : null });
    }
  }
  if (currentCategory) categories.push({ title: currentCategory, items: currentItems });

  // 发送总览消息
  await request('POST', 'open.feishu.cn', '/open-apis/im/v1/messages?receive_id_type=chat_id', {
    receive_id: groupId,
    msg_type: 'post',
    content: JSON.stringify({
      zh_cn: {
        title: `📊 AI 每日洞察简报 - ${date}`,
        content: [
          [{ tag: 'text', text: `本期共 ${categories.reduce((s, c) => s + c.items.length, 0)} 条精选内容\n` }],
          ...categories.map(c => [{ tag: 'text', text: `${c.title}：${c.items.length} 条\n` }]),
          [{ tag: 'text', text: '' }],
          [{ tag: 'a', text: '📄 查看完整文档', href: `https://feishu.cn/docx/${docId}` }]
        ]
      }
    })
  }, { 'Authorization': `Bearer ${token}` });

  // 逐分类发送详细内容
  for (const cat of categories) {
    const postLines = [[{ tag: 'text', text: cat.title }], [{ tag: 'text', text: '' }]];
    for (const item of cat.items) {
      if (item.link) {
        postLines.push([{ tag: 'a', text: `🔹 ${item.title}`, href: item.link }]);
      } else {
        postLines.push([{ tag: 'text', text: `🔹 ${item.title}` }]);
      }
    }
    await request('POST', 'open.feishu.cn', '/open-apis/im/v1/messages?receive_id_type=chat_id', {
      receive_id: groupId,
      msg_type: 'post',
      content: JSON.stringify({ zh_cn: { title: '', content: postLines } })
    }, { 'Authorization': `Bearer ${token}` });
  }

  console.log(`✅ 已推送 ${categories.length + 1} 条消息到群`);
  
  // 6. 输出结果
  console.log('\n' + '='.repeat(50));
  console.log('🎉 完成！');
  console.log('='.repeat(50));
  console.log(`📄 文档链接: https://feishu.cn/docx/${docId}`);
  
  // 保存文档 ID
  fs.writeFileSync(path.join(DATA_DIR, '.last-doc-id'), docId);
  
  return docId;
}

main().catch(err => {
  console.error('❌ 出错:', err.message);
  process.exit(1);
});
