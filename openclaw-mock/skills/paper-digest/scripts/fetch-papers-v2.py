#!/usr/bin/env python3
"""
论文抓取包装器 - 使用 arxiv-osiris skill
输出统一格式供 insight-brief 使用
"""

import sys
import json
import datetime
import os

# 添加 arxiv-osiris 路径
ARXIV_OSIRIS_PATH = os.path.expanduser('~/.openclaw/skills/skills/arxiv-osiris')
sys.path.insert(0, ARXIV_OSIRIS_PATH)

try:
    from arxiv_search import search_papers
except ImportError:
    print("❌ 无法导入 arxiv_search，请先安装 arxiv: pip install arxiv")
    sys.exit(1)

def fetch_papers(queries, max_results=20):
    """使用 arxiv-osiris 抓取论文"""
    all_papers = []
    
    for query in queries:
        print(f"📚 查询: {query}")
        
        try:
            # 调用 arxiv-osiris 的搜索功能
            results = search_papers(query, max_results=max_results // len(queries))
            
            for paper in results:
                all_papers.append({
                    'title': paper['title'],
                    'summary': paper['summary'][:200] if paper.get('summary') else '',
                    'link': paper['pdf_url'],
                    'source_name': 'arXiv',
                    'category': ', '.join(paper.get('categories', []))[:30],
                    'metadata': {
                        'publish_time': paper.get('published', ''),
                        'authors': paper.get('authors', []),
                        'arxiv_id': paper.get('arxiv_id', ''),
                        'heat_score': 0  # arXiv 没有热度数据
                    }
                })
            
            print(f"   ✓ 找到 {len(results)} 篇论文")
        
        except Exception as e:
            print(f"   ✗ 失败: {e}")
    
    return all_papers

def main():
    if len(sys.argv) < 2:
        print("用法: python fetch-papers-v2.py 查询1,查询2 [--max N]")
        print("示例: python fetch-papers-v2.py 'LLM agent','machine learning' --max 20")
        sys.exit(1)
    
    args = sys.argv[1:]
    queries = [q.strip() for q in args[0].split(',')]
    
    max_results = 20
    if '--max' in args:
        idx = args.index('--max')
        if idx + 1 < len(args):
            max_results = int(args[idx + 1])
    
    print(f"🔍 开始抓取学术论文（arxiv-osiris）")
    print(f"📚 查询: {', '.join(queries)}")
    print(f"📊 最大结果: {max_results}\n")
    
    papers = fetch_papers(queries, max_results)
    
    if papers:
        print(f"\n📊 共收集 {len(papers)} 篇论文\n")
        print("─" * 60 + "\n")
        
        # 输出 TOP 5
        for idx, paper in enumerate(papers[:5], 1):
            print(f"{idx}. {paper['title']}")
            if paper['metadata'].get('authors'):
                print(f"   👤 {', '.join(paper['metadata']['authors'][:2])}")
            if paper['summary']:
                print(f"   📄 {paper['summary'][:100]}...")
            print(f"   🔗 {paper['link']}")
            print()
    
    # 输出 JSON
    output = {
        'source': 'paper-digest',
        'timestamp': datetime.datetime.now().isoformat(),
        'queries': queries,
        'items': papers
    }
    
    print("─" * 60)
    print(f"\n📋 返回 {len(papers)} 条结果")
    
    # 写入文件
    data_dir = os.path.expanduser('~/.openclaw/workspace/insight-system/data')
    os.makedirs(data_dir, exist_ok=True)
    today = datetime.datetime.now().strftime('%Y-%m-%d')
    output_file = os.path.join(data_dir, f'paper-digest-{today}.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"\n✓ 已保存到: {output_file}")

if __name__ == '__main__':
    main()
