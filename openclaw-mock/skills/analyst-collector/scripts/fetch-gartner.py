#!/usr/bin/env python3
"""
使用 scrapling 爬取 Gartner/IDC 公开内容
集成到新闻收集工作流
"""

import json
import re
import sys
from datetime import datetime
from scrapling import Fetcher

TODAY = datetime.now().strftime("%Y-%m-%d")
DATA_DIR = "/home/sangfor_cloud_bg/.openclaw/workspace/insight-system/data"

# 配置 Fetcher
fetcher = Fetcher()

PAGES = [
    {
        "name": "Gartner Insights",
        "url": "https://www.gartner.com/en/insights",
        "category": "Research",
    },
    {
        "name": "Gartner AI",
        "url": "https://www.gartner.com/en/topics/artificial-intelligence",
        "category": "AI",
    },
    {
        "name": "Gartner GenAI",
        "url": "https://www.gartner.com/en/topics/generative-ai",
        "category": "AI",
    },
    {
        "name": "Gartner Agentic AI",
        "url": "https://www.gartner.com/en/topics/agentic-ai",
        "category": "AI Agent",
    },
    {
        "name": "IDC Research",
        "url": "https://www.idc.com/research/",
        "category": "Research",
    },
    {
        "name": "IDC Industry",
        "url": "https://www.idc.com/research/industry/",
        "category": "Industry",
    },
]

def scrape_page(config):
    """爬取单个页面"""
    print(f"📡 抓取: {config['name']}")
    
    results = []
    
    try:
        page = fetcher.get(config['url'])
        
        if page.status != 200:
            print(f"   ⚠️ 状态码: {page.status}")
            return results
        
        # 获取页面标题
        page_title = ""
        title_el = page.css('title')
        if title_el:
            page_title = str(title_el[0].text)[:100]
        
        # 获取所有链接
        links = page.css('a')
        
        for link in links[:150]:
            href = link.attrib.get('href', '')
            text = str(link.text).strip()
            
            if text and len(text) > 20 and href:
                # 处理相对链接
                if href.startswith('/'):
                    base_url = re.match(r'(https?://[^/]+)', config['url'])
                    if base_url:
                        href = base_url.group(1) + href
                
                # 过滤
                skip_keywords = [
                    'login', 'signin', 'signup', 'cookie', 'privacy', 
                    'javascript:', 'mailto:', '#', 'become-a-client',
                    '/account/', '/careers/', '/about/', '/contact',
                    '/legal/', '/terms', '/advertise'
                ]
                if any(x in href.lower() for x in skip_keywords):
                    continue
                
                # 识别有价值的链接
                is_valuable = False
                valuable_url_patterns = [
                    '/insights/', '/research/', '/topics/', '/articles/',
                    '/blogs/', '/news/', '/press/', '/report', '/doc',
                    '/artificial-intelligence', '/ai-', '/generative', '/agentic',
                    'magic-quadrant', 'cool-vendor', 'market-guide', 'hype-cycle',
                    'forecast', 'predictions', '/toolkit', '/white-paper'
                ]
                
                valuable_text_keywords = [
                    'ai', 'artificial intelligence', 'generative', 
                    'agent', 'llm', 'automation', 'machine learning',
                    '预测', '趋势', '报告', '研究', '魔力象限',
                    'hype cycle', 'magic quadrant', 'forecast',
                    'market share', 'growth', 'top strategic'
                ]
                
                if any(x in href.lower() for x in valuable_url_patterns):
                    is_valuable = True
                if any(kw in text.lower() for kw in valuable_text_keywords):
                    is_valuable = True
                
                if is_valuable:
                    results.append({
                        "title": text[:150],
                        "url": href,
                        "source": config['name'],
                        "category": config['category'],
                        "date": TODAY
                    })
        
        # 去重
        seen = set()
        unique = []
        for r in results:
            if r['url'] not in seen:
                seen.add(r['url'])
                unique.append(r)
        
        print(f"   ✅ 提取 {len(unique)} 条")
        return unique
        
    except Exception as e:
        print(f"   ❌ 失败: {e}")
        return results

def generate_summary(items):
    """生成 Markdown 简报"""
    md = f"""# 📊 行业分析机构报告简报
**日期**: {TODAY}
**总计**: {len(items)} 条报告

---

## 📌 按来源分类

"""
    
    # 按来源分组
    by_source = {}
    for item in items:
        source = item['source']
        if source not in by_source:
            by_source[source] = []
        by_source[source].append(item)
    
    for source, items_list in by_source.items():
        md += f"### {source}\n\n"
        for item in items_list[:15]:
            md += f"- **[{item['title']}]({item['url']})**\n"
        md += "\n"
    
    return md

def main():
    print("=" * 50)
    print("📊 行业分析机构报告收集")
    print("=" * 50)
    print()
    
    all_results = []
    
    for config in PAGES:
        results = scrape_page(config)
        all_results.extend(results)
    
    # 全局去重
    seen = set()
    unique_results = []
    for item in all_results:
        if item['url'] not in seen:
            seen.add(item['url'])
            unique_results.append(item)
    
    print()
    print("=" * 50)
    print(f"📊 总计: {len(unique_results)} 条报告")
    print("=" * 50)
    
    # 保存 JSON
    json_path = f"{DATA_DIR}/analyst-reports-{TODAY}.json"
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(unique_results, f, ensure_ascii=False, indent=2)
    print(f"💾 JSON: {json_path}")
    
    # 生成并保存 Markdown
    md_content = generate_summary(unique_results)
    md_path = f"{DATA_DIR}/analyst-summary-{TODAY}.md"
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write(md_content)
    print(f"📄 Markdown: {md_path}")
    
    # 输出预览
    if unique_results:
        print("\n📋 预览:")
        for i, item in enumerate(unique_results[:15], 1):
            print(f"  {i:2}. [{item['source'][:10]:10}] {item['title'][:50]}...")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
