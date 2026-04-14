import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useManagedAgents, AGENT_STATUS_COLORS } from '../../store/managedAgentStore'
import PageLayout, { DataToolbar } from '../../components/PageLayout'
import { 
  IconPlus, IconSearch, IconRotateCcw, IconList, IconGrid, 
  IconBot, IconTool, IconPuzzle, IconGlobe, IconBrain, 
  IconEye, IconCopy, IconZap, IconTrash, IconAlertTriangle 
} from '../../components/Icons'
import './MAC.css'

export default function MACAgentList() {
  const navigate = useNavigate()
  const { agents, dispatch } = useManagedAgents()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [toast, setToast] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [viewMode, setViewMode] = useState('list')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const filtered = useMemo(() => {
    return agents.filter(a => {
      if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.description?.toLowerCase().includes(search.toLowerCase())) return false
      if (statusFilter !== 'all' && a.status !== statusFilter) return false
      return true
    })
  }, [agents, search, statusFilter])

  const handleDelete = () => {
    if (confirmDelete) {
      dispatch({ type: 'DELETE_AGENT', id: confirmDelete.id })
      showToast(`${confirmDelete.name} 已删除`)
      setConfirmDelete(null)
    }
  }

  return (
    <PageLayout title="Agents" rightAction={<span style={{ fontSize: 12, color: '#999' }}>{agents.length} 个 Agent</span>}>
      <DataToolbar
        buttons={<button className="action-btn primary" onClick={() => navigate('/managed-agent/agents/create')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><IconPlus size={16} /> 创建 Agent</button>}
        filters={
          <div className="ha-filter-group">
            <select className="pagination-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ marginRight: 8 }}>
              <option value="all">全部状态</option>
              <option value="published">已发布</option>
              <option value="draft">草稿</option>
              <option value="deprecated">已弃用</option>
            </select>
            <div className="ha-view-toggle">
              <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><IconList size={16} /></button>
              <button className={`view-btn ${viewMode === 'card' ? 'active' : ''}`} onClick={() => setViewMode('card')}><IconGrid size={16} /></button>
            </div>
          </div>
        }
      >
        <div className="search-input">
          <span className="search-icon"><IconSearch size={14} /></span>
          <input placeholder="搜索 Agent 名称或描述" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="refresh-btn-sm" onClick={() => showToast('已刷新')}><IconRotateCcw size={14} /></button>
      </DataToolbar>

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>名称</th>
                <th>状态</th>
                <th>版本</th>
                <th>模型</th>
                <th>工具数</th>
                <th>可见范围</th>
                <th>创建人</th>
                <th>最近运行</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="data-table-empty">
                  <div className="empty-state ha-empty">
                    <div className="empty-icon"><IconBot size={48} style={{ opacity: 0.2 }} /></div>
                    <div className="ha-empty-title">还没有 Agent</div>
                    <div className="ha-empty-desc">创建一个 Agent，开始构建你的自动化工作流</div>
                    <button className="action-btn primary" style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => navigate('/managed-agent/agents/create')}><IconPlus size={16} /> 创建 Agent</button>
                  </div>
                </td></tr>
              ) : filtered.map(agent => {
                const sc = AGENT_STATUS_COLORS[agent.status] || AGENT_STATUS_COLORS.draft
                return (
                  <tr key={agent.id}>
                    <td>
                      <span className="ha-name-link" onClick={() => navigate(`/managed-agent/agents/${agent.id}`)}>{agent.name}</span>
                      <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{agent.description?.slice(0, 40)}{agent.description?.length > 40 ? '...' : ''}</div>
                    </td>
                    <td><span className="ha-status-tag" style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}>{sc.label}</span></td>
                    <td><span className="ha-version-badge">{agent.currentVersion}</span></td>
                    <td style={{ fontSize: 13 }}>{agent.model?.modelId || '-'}</td>
                    <td style={{ fontSize: 13 }}>{agent.tools?.length || 0}</td>
                    <td style={{ fontSize: 13 }}>{agent.visibility}</td>
                    <td>{agent.owner}</td>
                    <td style={{ fontSize: 13 }}>{agent.lastRunAt?.slice(5, 16) || '-'}</td>
                    <td>
                      <div className="ha-row-actions">
                        <button onClick={() => navigate(`/managed-agent/agents/${agent.id}`)}>详情</button>
                        <button onClick={() => navigate(`/managed-agent/sessions`, { state: { agentId: agent.id } })}>新建会话</button>
                        <button className="ha-delete-btn" onClick={() => setConfirmDelete(agent)}><IconTrash size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="data-pagination"><span>共 {filtered.length} 条</span></div>
        </div>
      )}

      {/* CARD VIEW */}
      {viewMode === 'card' && (
        <div className="ha-card-grid">
          {filtered.length === 0 ? (
            <div className="ha-empty-card-state">
              <div className="empty-icon"><IconBot size={48} style={{ opacity: 0.2 }} /></div>
              <div className="ha-empty-title">没有匹配的 Agent</div>
              <button className="action-btn primary" style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => navigate('/managed-agent/agents/create')}><IconPlus size={16} /> 创建</button>
            </div>
          ) : filtered.map(agent => {
            const sc = AGENT_STATUS_COLORS[agent.status] || AGENT_STATUS_COLORS.draft
            const toolCount = agent.tools?.length || 0
            const skillCount = agent.skills?.length || 0
            const hasMcp = (agent.mcpServers || []).length > 0
            return (
              <div key={agent.id} className="ha-agent-card mac-agent-card-enhanced" onClick={() => navigate(`/managed-agent/agents/${agent.id}`)}>
                <div className="ha-card-date-top">{agent.createdAt?.slice(0, 10)}</div>
                <div className="ha-card-header">
                  <div className="ha-card-avatar" style={{ background: `linear-gradient(135deg, ${sc.color}40, ${sc.color})` }}>
                    <span className="ha-card-avatar-text">{agent.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="ha-card-info">
                    <div className="ha-card-name">{agent.name}</div>
                    <div className="ha-card-meta">
                      <span className="ha-status-tag" style={{ background: sc.bg, color: sc.color, borderColor: sc.border, fontSize: 11, padding: '1px 6px' }}>{sc.label}</span>
                      <span className="ha-version-badge" style={{ fontSize: 11 }}>{agent.currentVersion}</span>
                    </div>
                  </div>
                </div>
                <div className="ha-card-desc">{agent.description}</div>
                <div className="ha-card-tags">
                  {(agent.tags || []).slice(0, 3).map(t => <span key={t} className="ha-mini-tag">{t}</span>)}
                  {(agent.tags || []).length > 3 && <span className="ha-mini-tag">+{agent.tags.length - 3}</span>}
                </div>
                <div className="mac-card-capabilities">
                  <span className="mac-cap-pill" title="工具数"><IconTool size={12} style={{ marginRight: 4 }} /> {toolCount}</span>
                  <span className="mac-cap-pill" title="Skills"><IconPuzzle size={12} style={{ marginRight: 4 }} /> {skillCount}</span>
                  {hasMcp && <span className="mac-cap-pill" title="MCP 已连接"><IconGlobe size={12} style={{ marginRight: 4 }} /> MCP</span>}
                  <span className="mac-cap-pill" title="模型"><IconBrain size={12} style={{ marginRight: 4 }} /> {agent.model?.modelId?.split('-')[0]}</span>
                </div>
                <div className="ha-card-footer">
                  <span>{agent.owner}</span>
                  <span>{agent.lastRunAt ? `最近: ${agent.lastRunAt.slice(5, 16)}` : '未运行'}</span>
                </div>
                <div className="ha-card-actions" onClick={e => e.stopPropagation()}>
                  <button onClick={() => navigate(`/managed-agent/agents/${agent.id}`)} title="详情"><IconEye size={14} /></button>
                  <button onClick={() => navigate('/managed-agent/sessions', { state: { agentId: agent.id } })} title="新建会话"><IconZap size={14} /></button>
                  <button onClick={() => { dispatch({ type: 'CREATE_AGENT', payload: { ...agent, name: agent.name + '-clone', description: agent.description + ' (克隆)' } }); showToast('已克隆') }} title="克隆"><IconCopy size={14} /></button>
                  <button className="ha-delete-btn" onClick={() => setConfirmDelete(agent)} title="删除"><IconTrash size={14} /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Toast */}
      {toast && <div className={`ha-toast ha-toast-${toast.type}`}>{toast.msg}</div>}

      {/* Delete Confirm */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-icon"><IconAlertTriangle size={32} style={{ color: '#faad14' }} /></div>
            <div className="modal-message">确定要删除 Agent <strong>{confirmDelete.name}</strong> 吗？此操作不可恢复。</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="action-btn primary" style={{ background: '#ff4d4f', borderColor: '#ff4d4f' }} onClick={handleDelete}>删除</button>
              <button className="action-btn" onClick={() => setConfirmDelete(null)}>取消</button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}
