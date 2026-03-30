import PageLayout, { GuideCards, DataToolbar, DataTable } from '../components/PageLayout'

const guideCards = [
  { title: '创建网关实例', desc: '实例负责定义网关的规格大小和部署位置，是网关运行的基础条件。可以根据业务场景需要选择不同的实例规格。', link: '去创建' },
  { title: '创建 API 应用路由', desc: '为各类 API 应用提供统一的访问入口，通过预设规则实现请求的精准路由，结合集中化的权限管控与流量调度能力，简化对接流程，保障服务稳定。', link: '开始创建' },
]

const columns = [
  { key: 'routeName', label: '路由名称' },
  { key: 'domain', label: '域名' },
  { key: 'pathMatch', label: '路径匹配规则' },
  { key: 'targetApp', label: '目标 Agent 应用' },
  { key: 'strategy', label: '策略' },
  { key: 'gateway', label: '所属网关实例' },
  { key: 'actions', label: '操作' },
]

export default function APIRouting({ onAlert }) {
  return (
    <PageLayout
      title="API 应用路由"
      rightAction={<button className="action-btn" onClick={onAlert}>⊙ 功能指引</button>}
    >
      <GuideCards cards={guideCards.map(c => ({...c, onLinkClick: onAlert}))} />
      <DataToolbar
        buttons={
          <button className="action-btn primary" onClick={onAlert}>+ 创建</button>
        }
      >
        <div className="search-input">
          <span className="search-icon">🔍</span>
          <input placeholder="名称/域名" />
        </div>
        <button className="refresh-btn-sm">↻</button>
      </DataToolbar>
      <DataTable columns={columns} />
    </PageLayout>
  )
}
