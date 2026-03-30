#!/usr/bin/env python3
"""
微博关键词监控 - 改用 s.weibo.com 搜索页面
更新于 2026-03-16：修复选择器失效问题
"""

import sys
import json
import datetime
import re
from urllib.parse import quote

def monitor_weibo(keywords):
    """监控微博关键词"""
    try:
        from scrapling import Fetcher
    except ImportError:
        print("❌ 缺少依赖: scrapling")
        print("安装: pip install scrapling --user")
        return []
    
    fetcher = Fetcher()
    all_items = []
    
    for keyword in keywords:
        print(f"📱 监控关键词: {keyword}")
        
        # 使用微博搜索页面
        url = f"https://s.weibo.com/weibo?q={quote(keyword)}"
        
        try:
            page = fetcher.get(url)
            
            if page.status != 200:
                print(f"   ⚠️ 请求失败: {page.status}")
                continue
            
            # 尝试多种选择器
            items = []
            
            # 方法1: 标准搜索结果
            try:
                cards = page.css('div.card-wrap[action-type="feed_list_item"]')
                if not cards or len(cards) == 0:
                    # 方法2: 备用选择器
                    cards = page.css('.card-feed')
                
                if not cards or len(cards) == 0:
                    # 方法3: 通用卡片
                    cards = page.css('.card-wrap')
                
                for card in cards[:20]:
                    try:
                        # 提取文本 - 多种尝试
                        text = ''
                        text_el = card.css('p[node-type="feed_list_content"]')
                        if text_el and len(text_el) > 0:
                            text = text_el[0].text.strip() if hasattr(text_el[0], 'text') else ''
                        
                        if not text:
                            text_el = card.css('.txt')
                            if text_el and len(text_el) > 0:
                                text = text_el[0].text.strip() if hasattr(text_el[0], 'text') else ''
                        
                        if not text or len(text) < 10:
                            continue
                        
                        # 提取作者
                        author = '未知用户'
                        author_el = card.css('a.name')
                        if author_el and len(author_el) > 0 and hasattr(author_el[0], 'text'):
                            author = author_el[0].text.strip()
                        
                        # 提取链接
                        link = ''
                        link_el = card.css('a[href*="/weibo?"]')
                        if link_el and len(link_el) > 0:
                            href = link_el[0].attrib.get('href', '')
                            if href:
                                link = href if href.startswith('http') else f'https://weibo.com{href}'
                        
                        # 提取互动数据
                        likes = 0
                        reposts = 0
                        comments = 0
                        
                        # 查找互动按钮
                        actions = card.css('a[action-type="feed_list_like"], a[action-type="feed_list_forward"], a[action-type="feed_list_comment"]')
                        for action in actions:
                            action_type = action.attrib.get('action-type', '')
                            text_data = action.text if hasattr(action, 'text') else ''
                            
                            # 提取数字
                            nums = re.findall(r'\d+', text_data)
                            num = int(nums[0]) if nums else 0
                            
                            if 'like' in action_type:
                                likes = num
                            elif 'forward' in action_type:
                                reposts = num
                            elif 'comment' in action_type:
                                comments = num
                        
                        # 如果没找到，尝试从文本提取
                        if likes == 0 and reposts == 0:
                            all_text = card.text if hasattr(card, 'text') else ''
                            like_match = re.search(r'赞\[(\d+)\]', all_text)
                            if like_match:
                                likes = int(like_match.group(1))
                            
                            repost_match = re.search(r'转发\[(\d+)\]', all_text)
                            if repost_match:
                                reposts = int(repost_match.group(1))
                        
                        items.append({
                            'title': text[:50] + ('...' if len(text) > 50 else ''),
                            'summary': text[:200],
                            'link': link or 'https://s.weibo.com/weibo?q=' + quote(keyword),
                            'source_name': f'@{author}',
                            'category': '微博',
                            'metadata': {
                                'platform': 'weibo',
                                'author': author,
                                'publish_time': datetime.datetime.now().isoformat(),
                                'likes': likes,
                                'reposts': reposts,
                                'comments': comments,
                                'heat_score': likes * 1.0 + reposts * 1.5 + comments * 0.8
                            }
                        })
                    
                    except Exception as e:
                        continue
            
            except Exception as e:
                print(f"   ⚠️ 提取失败: {e}")
            
            print(f"   ✓ 找到 {len(items)} 条相关微博")
            all_items.extend(items)
        
        except Exception as e:
            print(f"   ✗ 请求失败: {e}")
            continue
    
    # 按热度排序并去重
    all_items.sort(key=lambda x: x['metadata']['heat_score'], reverse=True)
    
    # 简单去重（基于标题）
    seen = set()
    unique_items = []
    for item in all_items:
        if item['title'] not in seen:
            seen.add(item['title'])
            unique_items.append(item)
    
    return unique_items

def main():
    if len(sys.argv) < 2:
        print("用法: python weibo-monitor.py 关键词1,关键词2")
        print("示例: python weibo-monitor.py AI,GPT,人工智能")
        sys.exit(1)
    
    keywords = [k.strip() for k in sys.argv[1].split(',')]
    
    print(f"🔍 开始监控微博关键词: {', '.join(keywords)}\n")
    
    try:
        items = monitor_weibo(keywords)
        
        if not items:
            print("⚠️ 未找到相关内容（可能是选择器需要更新或网络问题）")
            # 返回空结果而不是失败
            items = []
        else:
            print(f"\n📊 共收集 {len(items)} 条微博\n")
            print("─" * 60 + "\n")
            
            # 输出 TOP 10
            for idx, item in enumerate(items[:10], 1):
                print(f"{idx}. {item['title']}")
                print(f"   👤 {item['source_name']}")
                print(f"   🔥 {item['metadata']['likes']} 赞 | {item['metadata']['reposts']} 转发 | {item['metadata']['comments']} 评论")
                print()
        
        # 输出 JSON
        output = {
            'source': 'social-monitor',
            'platform': 'weibo',
            'timestamp': datetime.datetime.now().isoformat(),
            'keywords': keywords,
            'items': items
        }
        
        print("─" * 60)
        print(f"\n📋 返回 {len(items)} 条结果")
        
        # 写入文件
        import os
        data_dir = os.path.expanduser('~/.openclaw/workspace/insight-system/data')
        os.makedirs(data_dir, exist_ok=True)
        today = datetime.datetime.now().strftime('%Y-%m-%d')
        output_file = os.path.join(data_dir, f'social-monitor-{today}.json')
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
        print(f"\n✓ 已保存到: {output_file}")
        
    except Exception as e:
        print(f"✗ 监控失败: {e}")
        import traceback
        traceback.print_exc()
        
        # 即使失败也保存空结果
        output = {
            'source': 'social-monitor',
            'platform': 'weibo',
            'timestamp': datetime.datetime.now().isoformat(),
            'keywords': keywords,
            'items': []
        }
        
        import os
        data_dir = os.path.expanduser('~/.openclaw/workspace/insight-system/data')
        os.makedirs(data_dir, exist_ok=True)
        today = datetime.datetime.now().strftime('%Y-%m-%d')
        output_file = os.path.join(data_dir, f'social-monitor-{today}.json')
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
        print(f"\n⚠️ 已保存空结果到: {output_file}")

if __name__ == '__main__':
    main()
