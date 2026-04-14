import PageLayout, { DataToolbar, DataTable } from '../components/PageLayout'
import { IconCheck, IconSearch, IconRotateCcw, IconPlus, IconGlobe, IconChevronDown } from '../components/Icons'

const columns = [
  { key: 'name', label: '路由名称' },
  { key: 'status', label: '状态', sortable: true },
  { key: 'strategy', label: '策略' },
  { key: 'apiType', label: 'API 类型' },
]

const data = [
  { name: 'yuyiluyou-xiawu', status: <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#52c41a' }}><IconCheck size={14} /> 已启用</span>, strategy: '权重', apiType: 'OpenAI' },
]

export default function AIModelService({ onAlert }) {
  return (
    <PageLayout
      title="AI 模型服务"
      rightAction={<button className="action-btn" onClick={onAlert} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconGlobe size={14} /> 网关配置</button>}
    >
      <DataToolbar
        buttons={
          <>
            <button className="action-btn primary" onClick={onAlert} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconPlus size={16} /> 添加</button>
            <button className="action-btn primary" onClick={onAlert} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconPlus size={16} /> 创建</button>
          </>
        }
        filters={
          <>
            <button className="filter-select" onClick={onAlert} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>策略 <IconChevronDown size={12} /></button>
            <button className="filter-select" onClick={onAlert} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>API 类型 <IconChevronDown size={12} /></button>
          </>
        }
      >
        <div className="search-input">
          <span className="search-icon"><IconSearch size={14} /></span>
          <input placeholder="名称" />
        </div>
        <button className="refresh-btn-sm" onClick={() => {}}><IconRotateCcw size={14} /></button>
      </DataToolbar>
      <DataTable columns={columns} data={data} />
    </PageLayout>
  )
}
