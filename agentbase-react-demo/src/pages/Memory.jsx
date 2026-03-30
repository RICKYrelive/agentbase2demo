import PageLayout, { GuideCards, DataToolbar, DataTable } from '../components/PageLayout'

const guideCards = [
  { title: '创建记忆体', desc: '根据业务场景创建记忆体实例，选择适合的存储模式和配置参数，自动生成连接信息供应用集成使用。' },
  { title: '在Agent 应用中集成记忆体', desc: '将记忆体的连接信息集成至 Agent 应用代码中，在创建应用时关联记忆体实例，平台将自动配置环境变量。' },
  { title: '持续观测评估性能', desc: '实时监控记忆体的性能指标，包括延迟、吞吐量和资源使用情况，深入分析调用过程定位问题。' },
]

const columns = [
  { key: 'name', label: '名称' },
  { key: 'status', label: '状态', sortable: true },
  { key: 'id', label: 'ID' },
  { key: 'associatedApp', label: '关联 Agent 应用' },
  { key: 'k8s', label: '所在K8s集群' },
]

export default function Memory({ onAlert }) {
  return (
    <PageLayout
      title="记忆体"
      rightAction={<button className="action-btn" onClick={onAlert}>⊙ 收起教程</button>}
    >
      <GuideCards cards={guideCards} />
      <DataToolbar
        buttons={
          <button className="action-btn primary" onClick={onAlert}>+ 创建</button>
        }
        filters={
          <button className="filter-select" onClick={onAlert}>状态 ▾</button>
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
