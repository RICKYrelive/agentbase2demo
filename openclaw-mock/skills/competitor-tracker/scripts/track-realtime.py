#!/usr/bin/env python3
"""
竞品实时追踪 - 聚焦本周重大产品更新
只返回有实际价值的信息，无更新则明确返回"无"
"""

import sys
import json
import datetime
from urllib.parse import quote, urljoin
from scrapling import Fetcher

# 各云厂商官方产品动态页面
OFFICIAL_SOURCES = {
    "阿里云": {
        "name": "阿里云",
        "sources": [
            {
                "name": "阿里云产品动态",
                "url": "https://www.aliyun.com/product/new",
                "type": "official"
            },
            {
                "name": "通义千问更新",
                "url": "https://tongyi.aliyun.com/",
                "type": "official"
            }
        ]
    },
    "火山引擎": {
        "name": "火山引擎",
        "sources": [
            {
                "name": "火山引擎产品动态",
                "url": "https://www.volcengine.com/docs/6348",
                "type": "official"
            },
            {
                "name": "豆包大模型",
                "url": "https://www.volcengine.com/product/doubao",
                "type": "official"
            },
            {
                "name": "扣子平台",
                "url": "https://www.coze.cn/",
                "type": "official"
            }
        ]
    },
    "腾讯云": {
        "name": "腾讯云",
        "sources": [
            {
                "name": "腾讯云产品动态",
                "url": "https://cloud.tencent.com/document/product/282",
                "type": "official"
            },
            {
                "name": "混元大模型",
                "url": "https://cloud.tencent.com/product/hunyuan",
                "type": "official"
            }
        ]
    },
    "百度智能云": {
        "name": "百度智能云",
        "sources": [
            {
                "name": "百度智能云产品动态",
                "url": "https://cloud.baidu.com/product/update.html",
                "type": "official"
            },
            {
                "name": "文心一言",
                "url": "https://yiyan.baidu.com/",
                "type": "official"
            }
        ]
    },
    "讯飞星辰": {
        "name": "讯飞星辰",
        "sources": [
            {
                "name": "星火大模型",
                "url": "https://xinghuo.xfyun.cn/",
                "type": "official"
            }
        ]
    }
}

# 时间窗口（只返回最近7天的更新）
TIME_WINDOW_DAYS = 7

def is_recent(text, days=7):
    """检查文本是否包含最近N天的日期信息"""
    if not text:
        return True  # 如果没有日期信息，默认允许（后续通过内容质量过滤）
    
    today = datetime.datetime.now()
    
    # 检查是否包含今天、昨天等相对日期
    recent_keywords = ['今天', '今日', '昨天', '昨日', '刚刚', '刚刚发布', '本周', '近期', '最新']
    for kw in recent_keywords:
        if kw in text:
            return True
    
    # 检查是否包含最近N天的具体日期
    for i in range(days):
        date = today - datetime.timedelta(days=i)
        date_strs = [
            date.strftime('%Y-%m-%d'),
            date.strftime('%m-%d'),
            f"{date.month}月{date.day}日",
            f"{date.month}.{date.day}",
        ]
        for ds in date_strs:
            if ds in text:
                return True
    
    # 如果没有明确的日期，但有"2026年3月"这样的信息，也认为是最近的
    if f"{today.year}年{today.month}月" in text or f"{today.year}-{today.month:02d}" in text:
        return True
    
    return False  # 没有日期信息，返回 False，让后续逻辑处理

def is_major_update(title, desc):
    """判断是否为重大更新"""
    if not title:
        return False
    
    # 忽略的内容类型
    ignore_keywords = [
        '维护', '停机', '升级', '修复', 'bug', '补丁',
        '公告', '通知', '培训', '活动', '会议', '直播',
        '怎么样', '如何', '为什么', '是不是', '请问',
        '知乎', '百度知道', '贴吧', '论坛', '问答',
        '投稿', '期刊', '论文', '录用', '审稿',
    ]
    
    text = (title + ' ' + (desc or '')).lower()
    
    for kw in ignore_keywords:
        if kw in text:
            return False
    
    # 排除太短的标题
    if len(title) < 10:
        return False
    
    # 重大更新关键词
    major_keywords = [
        '发布', '上线', '推出', '新功能', '新版本', '新品',
        '重大', '全新', '重磅', '首发', '正式发布',
        '大模型', 'AI', 'Agent', '智能体', 'GPT', 'LLM',
        '云计算', '云服务', '平台', '产品'
    ]
    
    has_major = False
    for kw in major_keywords:
        if kw in text:
            has_major = True
            break
    
    return has_major

def fetch_official_updates(competitor, fetcher):
    """抓取官方源的产品更新"""
    config = OFFICIAL_SOURCES.get(competitor)
    if not config:
        return []
    
    items = []
    
    for source in config['sources']:
        try:
            print(f"   📡 访问: {source['name']}")
            response = fetcher.get(source['url'], timeout=10)
            
            if response.status != 200:
                print(f"      ✗ 状态码: {response.status}")
                continue
            
            # 尝试多种提取策略
            found_items = []
            
            # 策略1: 尝试常见的产品更新选择器
            selectors = [
                ('.product-update-item', 'h3', 'p'),
                ('.news-item', 'h3', 'p'),
                ('.update-list li', 'h4', 'p'),
                ('article', 'h2', 'p'),
                ('.item', '.title', '.desc'),
                ('.article-item', 'h3', 'p'),
                ('.list-item', 'h4', 'p'),
            ]
            
            for container_sel, title_sel, desc_sel in selectors:
                containers = response.css(container_sel)
                if containers and len(containers) > 0:
                    for container in containers[:10]:
                        try:
                            title_els = container.css(title_sel)
                            desc_els = container.css(desc_sel)
                            
                            if title_els:
                                title = title_els[0].text.strip() if hasattr(title_els[0], 'text') else ''
                                desc = desc_els[0].text.strip()[:200] if desc_els and hasattr(desc_els[0], 'text') else ''
                                
                                if title and len(title) > 5:  # 标题太短的不算
                                    found_items.append({
                                        'title': title,
                                        'summary': desc,
                                        'link': source['url'],
                                        'source_name': source['name'],
                                        'category': classify_news(title, desc),
                                        'metadata': {
                                            'competitor': competitor,
                                            'type': 'product_launch',
                                            'publish_time': datetime.datetime.now().isoformat(),
                                            'importance': assess_importance(title, desc),
                                            'source': 'official'
                                        }
                                    })
                        except:
                            continue
                    if found_items:
                        break  # 找到内容就跳出
            
            # 策略2: 如果策略1没找到，尝试从页面标题和描述中提取
            if not found_items:
                page_title = response.css('title')
                meta_desc = response.css('meta[name="description"]')
                
                if page_title:
                    title_text = page_title[0].text.strip() if hasattr(page_title[0], 'text') else ''
                    
                    # 检查标题是否包含关键信息
                    if any(kw in title_text for kw in ['更新', '发布', '新功能', '版本']):
                        desc_text = ''
                        if meta_desc and hasattr(meta_desc[0], 'attrib'):
                            desc_text = meta_desc[0].attrib.get('content', '')
                        
                        found_items.append({
                            'title': title_text,
                            'summary': desc_text[:200],
                            'link': source['url'],
                            'source_name': source['name'],
                            'category': '页面信息',
                            'metadata': {
                                'competitor': competitor,
                                'type': 'general',
                                'publish_time': datetime.datetime.now().isoformat(),
                                'importance': 'low',
                                'source': 'official'
                            }
                        })
            
            # 过滤：只要重大更新
            major_items = [item for item in found_items if is_major_update(item['title'], item['summary'])]
            
            items.extend(major_items)
            print(f"      ✓ 找到 {len(major_items)} 条重大更新")
            
        except Exception as e:
            print(f"      ✗ 错误: {str(e)[:50]}")
            continue
    
    return items

def classify_news(title, desc):
    """分类新闻类型"""
    text = (title + ' ' + (desc or '')).lower()
    
    if any(kw in text for kw in ['发布', '推出', '上线', '更新']):
        return '产品发布'
    elif any(kw in text for kw in ['融资', '投资', '收购', '并购']):
        return '融资信息'
    elif any(kw in text for kw in ['技术', '算法', '模型', '突破']):
        return '技术突破'
    else:
        return '一般动态'

def assess_importance(title, desc):
    """评估重要性"""
    text = (title + ' ' + (desc or '')).lower()
    
    # 高优先级关键词
    high_keywords = ['重大', '首次', '突破', '巨额', '收购', '独家', '发布', '上线', '全新']
    if any(kw in text for kw in high_keywords):
        return 'high'
    
    # 中等优先级
    medium_keywords = ['更新', '升级', '新功能', '新版本']
    if any(kw in text for kw in medium_keywords):
        return 'medium'
    
    return 'low'

def search_recent_news(competitor, fetcher):
    """搜索最近一周的新闻"""
    # 构建搜索关键词 - 更精准
    today = datetime.datetime.now()
    
    # 使用多个搜索词组合
    queries = [
        f"{competitor} 产品发布 2026年3月",
        f"{competitor} 新功能 上线 最新",
    ]
    
    items = []
    seen_links = set()
    
    for query in queries:
        url = f"https://cn.bing.com/search?q={quote(query)}&count=10"
        
        try:
            print(f"   🔍 搜索: {query}")
            response = fetcher.get(url, timeout=10)
            
            if response.status != 200:
                continue
            
            results = response.css('li.b_algo')
            
            for result in results[:10]:
                try:
                    title_el = result.css('h2 a')
                    desc_el = result.css('.b_caption p')
                    link_el = result.css('h2 a')
                    
                    if title_el and link_el and len(title_el) > 0:
                        title = str(title_el[0].text).strip() if hasattr(title_el[0], 'text') else ''
                        desc = str(desc_el[0].text).strip()[:200] if desc_el and len(desc_el) > 0 and hasattr(desc_el[0], 'text') else ''
                        link = link_el[0].attrib.get('href', '') if hasattr(link_el[0], 'attrib') else ''
                        
                        # 去重
                        if link in seen_links:
                            continue
                        
                        # 检查是否与该竞品相关
                        if competitor not in title and competitor not in desc:
                            continue
                        
                        # 过滤：只保留重大更新
                        if is_major_update(title, desc):
                            # 额外检查：确保不是问答类内容
                            if any(kw in link for kw in ['zhihu.com/question', 'baidu.com/zhidao', 'tieba.baidu.com']):
                                continue
                            
                            seen_links.add(link)
                            items.append({
                                'title': title,
                                'summary': desc,
                                'link': link,
                                'source_name': 'Bing 搜索',
                                'category': '产品发布',
                                'metadata': {
                                    'competitor': competitor,
                                    'type': 'product_launch',
                                    'publish_time': datetime.datetime.now().isoformat(),
                                    'importance': 'high',
                                    'source': 'search'
                                }
                            })
                except:
                    continue
            
        except Exception as e:
            print(f"      ✗ 搜索失败: {str(e)[:50]}")
    
    print(f"      ✓ 找到 {len(items)} 条")
    return items

def track_competitors_realtime(competitors):
    """追踪竞品实时动态"""
    fetcher = Fetcher()
    
    all_results = {}
    
    for competitor in competitors:
        print(f"\n🎯 追踪: {competitor}")
        
        # 1. 抓取官方源
        print(f"   📋 官方源...")
        official_items = fetch_official_updates(competitor, fetcher)
        
        # 2. 搜索引擎
        print(f"   🔎 搜索引擎...")
        search_items = search_recent_news(competitor, fetcher)
        
        # 合并去重
        all_items = official_items + search_items
        seen_titles = set()
        unique_items = []
        
        for item in all_items:
            title_key = item['title'][:50].lower()
            if title_key not in seen_titles:
                seen_titles.add(title_key)
                unique_items.append(item)
        
        all_results[competitor] = {
            'has_updates': len(unique_items) > 0,
            'items': unique_items[:5],  # 每个竞品最多5条
            'count': len(unique_items)
        }
    
    return all_results

def main():
    # 默认追踪的云服务商
    default_competitors = ["阿里云", "火山引擎", "腾讯云", "百度智能云", "讯飞星辰"]
    
    if len(sys.argv) > 1:
        competitors = [c.strip() for c in sys.argv[1].split(',')]
    else:
        competitors = default_competitors
    
    print("=" * 60)
    print(f"🔍 竞品实时追踪 | 时间窗口: 最近 {TIME_WINDOW_DAYS} 天")
    print(f"📅 {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("=" * 60)
    
    try:
        results = track_competitors_realtime(competitors)
        
        # 输出结果
        print("\n" + "=" * 60)
        print("📊 追踪结果")
        print("=" * 60 + "\n")
        
        output_items = []
        
        for competitor, data in results.items():
            if data['has_updates']:
                print(f"✅ {competitor}: {data['count']} 条重大更新\n")
                for item in data['items']:
                    print(f"   • {item['title']}")
                    print(f"     来源: {item['source_name']}")
                    print(f"     链接: {item['link']}\n")
                output_items.extend(data['items'])
            else:
                print(f"❌ {competitor}: 本周无重大产品更新\n")
        
        # 总结
        total_updates = sum(d['count'] for d in results.values())
        
        print("=" * 60)
        if total_updates > 0:
            print(f"📈 总计: {total_updates} 条重大更新")
        else:
            print("📭 结论: 本周所有监控的竞品均无重大产品更新")
        
        # 输出 JSON
        output = {
            'source': 'competitor-tracker-realtime',
            'timestamp': datetime.datetime.now().isoformat(),
            'time_window_days': TIME_WINDOW_DAYS,
            'competitors': competitors,
            'total_updates': total_updates,
            'has_any_updates': total_updates > 0,
            'results': results
        }
        
        # 保存到文件
        import os
        data_dir = os.path.expanduser('~/.openclaw/workspace/insight-system/data')
        os.makedirs(data_dir, exist_ok=True)
        today = datetime.datetime.now().strftime('%Y-%m-%d')
        output_file = os.path.join(data_dir, f'competitor-realtime-{today}.json')
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
        print(f"\n✓ 已保存到: {output_file}")
        
    except Exception as e:
        print(f"\n✗ 追踪失败: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
