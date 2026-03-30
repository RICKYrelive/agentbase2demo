#!/usr/bin/env python3
"""
搜索引擎 - 使用 Scrapling
"""

import sys
import json
import datetime
from urllib.parse import urlparse
from scrapling import Fetcher

def extract_domain(url):
    try:
        parsed = urlparse(url)
        return parsed.netloc.replace('www.', '')
    except:
        return url

def search_bing(query, limit=10):
    """必应搜索"""
    url = f"https://www.bing.com/search?q={query}&count={limit}"
    
    # 配置 Fetcher
    fetcher = Fetcher()
    
    # 获取页面
    page = fetcher.get(url)
    
    results = []
    
    if page.status != 200:
        print(f"❌ 请求失败: {page.status}")
        return results
    
    # 必应结果选择器
    items = page.css('li.b_algo')
    
    for item in items[:limit]:
        # 提取标题和链接
        title_els = item.css('h2 a')
        desc_els = item.css('.b_caption p')
        link_els = item.css('h2 a')
        
        if title_els and link_els:
            try:
                title = str(title_els[0].text).strip() if title_els[0].text else ''
                desc = str(desc_els[0].text).strip()[:150] if desc_els and desc_els[0].text else ''
                link = link_els[0].attrib.get('href', '')
                
                if title and link:
                    results.append({
                        'title': title,
                        'description': desc,
                        'link': link,
                        'display_url': extract_domain(link)
                    })
            except Exception as e:
                continue
    
    return results

def main():
    if len(sys.argv) < 2:
        print("用法: python search.py <查询词>")
        sys.exit(1)
    
    query = ' '.join(sys.argv[1:])
    
    print(f"🔍 Bing 搜索: \"{query}\"\n")
    
    try:
        results = search_bing(query)
        
        if not results:
            print("❌ 未找到相关结果")
            return
        
        print(f"📊 找到 {len(results)} 条结果\n")
        print("─" * 60 + "\n")
        
        for idx, item in enumerate(results, 1):
            print(f"{idx}. {item['title']}")
            if item['description']:
                print(f"   {item['description']}...")
            print(f"   🔗 {item['link']}")
            print(f"   📰 {item['display_url']}")
            print()
        
        # 输出 JSON
        output = {
            'source': 'bing-search',
            'timestamp': datetime.datetime.now().isoformat(),
            'query': query,
            'items': [
                {
                    'title': item['title'],
                    'summary': item['description'],
                    'link': item['link'],
                    'source_name': item['display_url'],
                    'category': '搜索结果',
                    'metadata': {
                        'rank': idx + 1,
                        'display_url': item['display_url']
                    }
                }
                for idx, item in enumerate(results)
            ]
        }
        
        print("─" * 60)
        print("\n📋 JSON 输出:")
        print(json.dumps(output, ensure_ascii=False, indent=2))
        
    except Exception as e:
        print(f"✗ 搜索失败: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
