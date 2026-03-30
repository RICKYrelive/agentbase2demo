import PageLayout, { GuideCards, DataToolbar, DataTable } from '../components/PageLayout'

const guideCards = [
  { title: '创建 MCP 服务', desc: '根据业务需求创建 MCP 服务实例，配置访问方式和资源参数，自动生成连接信息供 Agent 应用集成使用。' },
  { title: '在Agent 应用中集成 MCP 服务', desc: '将 MCP 服务的连接信息集成至 Agent 应用中，在创建应用时关联服务实例，平台将自动配置环境变量。' },
  { title: '持续观测评估性能', desc: '实时监控 MCP 服务的性能指标，包括延迟、吞吐量和资源使用情况，深入分析调用过程定位问题。' },
]

const columns = [
  { key: 'name', label: '名称/ID' },
  { key: 'status', label: '状态', sortable: true },
  { key: 'address', label: '访问地址' },
  { key: 'method', label: '访问方式' },
]

export default function MCPService({ onAlert }) {
  return (
    <PageLayout
      title="MCP 服务"
      rightAction={<button className="action-btn" onClick={onAlert}>⊙ 功能指引</button>}
    >
      <GuideCards cards={guideCards} />
      <DataToolbar
        buttons={
          <button className="action-btn primary" onClick={onAlert}>+ 创建</button>
        }
      >
        <div className="search-input">
          <span className="search-icon">🔍</span>
          <input placeholder="名称" />
        </div>
        <button className="refresh-btn-sm">↻</button>
      </DataToolbar>
      <DataTable columns={columns} />
    </PageLayout>
  )
}
