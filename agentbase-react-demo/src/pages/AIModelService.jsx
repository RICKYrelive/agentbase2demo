import PageLayout, { DataToolbar, DataTable } from '../components/PageLayout'

const columns = [
  { key: 'name', label: '路由名称' },
  { key: 'status', label: '状态', sortable: true },
  { key: 'strategy', label: '策略' },
  { key: 'apiType', label: 'API 类型' },
]

const data = [
  { name: 'yuyiluyou-xiawu', status: '✅ 已启用', strategy: '权重', apiType: 'OpenAI' },
]

export default function AIModelService({ onAlert }) {
  return (
    <PageLayout
      title="AI 模型服务"
      rightAction={<button className="action-btn" onClick={onAlert}>⊙ 网关配置</button>}
    >
      <DataToolbar
        buttons={
          <>
            <button className="action-btn primary" onClick={onAlert}>+ 添加</button>
            <button className="action-btn primary" onClick={onAlert}>+ 创建</button>
          </>
        }
        filters={
          <>
            <button className="filter-select" onClick={onAlert}>策略 ▾</button>
            <button className="filter-select" onClick={onAlert}>API 类型 ▾</button>
          </>
        }
      >
        <div className="search-input">
          <span className="search-icon">🔍</span>
          <input placeholder="名称" />
        </div>
        <button className="refresh-btn-sm">↻</button>
      </DataToolbar>
      <DataTable columns={columns} data={data} />
    </PageLayout>
  )
}
