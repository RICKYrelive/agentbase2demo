import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useManagedAgents, RISK_LEVEL_COLORS } from '../../store/managedAgentStore'
import PageLayout, { DataToolbar } from '../../components/PageLayout'
import './MAC.css'

const BUILTIN_TOOLS = [
  { id: 'bt-bash', name: 'bash', description: '执行 shell 命令', riskLevel: 'high', approvalRequired: true, category: 'Execution', params: '{ command: string, timeout?: number, cwd?: string }' },
  { id: 'bt-read', name: 'read_file', description: '读取文件内容', riskLevel: 'low', approvalRequired: false, category: 'File', params: '{ path: string, offset?: number, limit?: number }' },
  { id: 'bt-write', name: 'write_file', description: '写入文件内容', riskLevel: 'high', approvalRequired: true, category: 'File', params: '{ path: string, content: string }' },
  { id: 'bt-edit', name: 'edit_file', description: '编辑文件（查找替换）', riskLevel: 'medium', approvalRequired: false, category: 'File', params: '{ path: string, old_string: string, new_string: string }' },
  { id: 'bt-glob', name: 'glob', description: '按模式匹配查找文件', riskLevel: 'low', approvalRequired: false, category: 'Search', params: '{ pattern: string, path?: string }' },
  { id: 'bt-grep', name: 'grep', description: '在文件中搜索内容', riskLevel: 'low', approvalRequired: false, category: 'Search', params: '{ pattern: string, path?: string, output_mode?: string }' },
  { id: 'bt-fetch', name: 'web_fetch', description: '获取 URL 内容', riskLevel: 'medium', approvalRequired: false, category: 'Network', params: '{ url: string, method?: string }' },
  { id: 'bt-search', name: 'web_search', description: '搜索互联网信息', riskLevel: 'low', approvalRequired: false, category: 'Network', params: '{ query: string, max_results?: number }' },
]

export default function MACToolCatalog() {
  const navigate = useNavigate()
  const { agents } = useManagedAgents()
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [expandedTool, setExpandedTool] = useState(null)

  const categories = ['all', ...new Set(BUILTIN_TOOLS.map(t => t.category))]
  const customTools = [
    { id: 'ct-001', name: 'sql_query', namespace: 'db', description: '执行 SQL 查询', riskLevel: 'high', category: 'Custom' },
    { id: 'ct-002', name: 'send_email', namespace: 'comms', description: '发送电子邮件', riskLevel: 'medium', category: 'Custom' },
    { id: 'ct-003', name: 'jira_create', namespace: 'pm', description: '创建 Jira 工单', riskLevel: 'low', category: 'Custom' },
  ]

  const allTools = [...BUILTIN_TOOLS, ...customTools]
  const filtered = allTools.filter(t => {
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Count agents using each tool
  const toolUsage = {}
  agents.forEach(a => {
    (a.tools || []).forEach(tid => {
      toolUsage[tid] = (toolUsage[tid] || 0) + 1
    })
  })

  return (
    <PageLayout title="Tool Catalog" rightAction={<span style={{ fontSize: 12, color: '#999' }}>{allTools.length} 个工具</span>}>
      <DataToolbar
        buttons={<button className="action-btn primary" onClick={() => navigate('/managed-agent/tools/create')}>+ 注册 Custom Tool</button>}
        filters={
          <div className="ha-filter-group">
            {categories.map(cat => (
              <button key={cat} className={`action-btn ${categoryFilter === cat ? 'primary' : ''}`} style={{ padding: '3px 10px', fontSize: 12 }} onClick={() => setCategoryFilter(cat)}>
                {cat === 'all' ? '全部' : cat}
              </button>
            ))}
          </div>
        }
      >
        <div className="search-input">
          <span className="search-icon">🔍</span>
          <input placeholder="搜索工具名称" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </DataToolbar>

      <div className="mac-tool-catalog">
        {filtered.map(tool => {
          const rc = RISK_LEVEL_COLORS[tool.riskLevel] || RISK_LEVEL_COLORS.low
          const isExpanded = expandedTool === tool.id
          const usage = toolUsage[tool.id] || 0
          return (
            <div key={tool.id} className="mac-catalog-item" onClick={() => setExpandedTool(isExpanded ? null : tool.id)}>
              <div className="mac-catalog-header">
                <span className="mac-catalog-icon">{tool.category === 'Custom' ? '⚙️' : '🔧'}</span>
                <span className="mac-catalog-name">{tool.name}</span>
                <span className="ha-status-tag" style={{ background: rc.bg, color: rc.color, borderColor: rc.border, fontSize: 11, padding: '1px 6px' }}>{rc.label}风险</span>
                {tool.approvalRequired && <span className="ha-mini-tag" style={{ background: '#fff2e8', borderColor: '#ffd8bf', color: '#fa8c16' }}>需审批</span>}
                <span className="mac-catalog-usage">{usage} 个 Agent 使用</span>
              </div>
              <div className="mac-catalog-desc">{tool.description}</div>
              {isExpanded && (
                <div className="mac-catalog-detail">
                  <div className="mac-kv-list">
                    <div className="mac-kv-row"><span className="mac-kv-key">ID</span><span>{tool.id}</span></div>
                    <div className="mac-kv-row"><span className="mac-kv-key">类别</span><span>{tool.category}</span></div>
                    <div className="mac-kv-row"><span className="mac-kv-key">风险等级</span><span>{tool.riskLevel}</span></div>
                    <div className="mac-kv-row"><span className="mac-kv-key">需要审批</span><span>{tool.approvalRequired ? '是' : '否'}</span></div>
                    {tool.params && (
                      <div className="mac-kv-row"><span className="mac-kv-key">参数</span><code style={{ fontSize: 12 }}>{tool.params}</code></div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </PageLayout>
  )
}
