import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useManagedAgents, SESSION_STATUS_COLORS } from '../../store/managedAgentStore'
import PageLayout, { DataToolbar } from '../../components/PageLayout'
import './MAC.css'

export default function MACSessionList() {
  const navigate = useNavigate()
  const { sessions, agents, dispatch } = useManagedAgents()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [agentFilter, setAgentFilter] = useState('all')
  const [toast, setToast] = useState(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const filtered = useMemo(() => {
    return sessions.filter(s => {
      if (search && !s.agentName.toLowerCase().includes(search.toLowerCase()) && !(s.threads?.[0]?.title || '').toLowerCase().includes(search.toLowerCase())) return false
      if (statusFilter !== 'all' && s.status !== statusFilter) return false
      if (agentFilter !== 'all' && s.agentId !== agentFilter) return false
      return true
    })
  }, [sessions, search, statusFilter, agentFilter])

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)
  const totalPages = Math.ceil(filtered.length / pageSize)

  const handleStop = (session) => {
    dispatch({ type: 'UPDATE_SESSION', id: session.id, payload: { status: 'completed', endedAt: new Date().toISOString().slice(0, 19) } })
    showToast(`${session.id} 已终止`)
  }

  return (
    <PageLayout title="Sessions" rightAction={<span style={{ fontSize: 12, color: '#999' }}>{sessions.length} 个会话</span>}>
      <DataToolbar
        buttons={
          <button className="action-btn primary" onClick={() => navigate('/managed-agent/agents')}>
            + 新建会话
          </button>
        }
        filters={
          <div style={{ display: 'flex', gap: 8 }}>
            <select className="pagination-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
              <option value="all">全部状态</option>
              <option value="running">运行中</option>
              <option value="idle">空闲</option>
              <option value="waiting_approval">等待审批</option>
              <option value="completed">已完成</option>
              <option value="failed">失败</option>
            </select>
            <select className="pagination-select" value={agentFilter} onChange={e => { setAgentFilter(e.target.value); setPage(1) }}>
              <option value="all">全部 Agent</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
        }
      >
        <div className="search-input">
          <span className="search-icon">🔍</span>
          <input placeholder="搜索 Agent 或 Thread" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="refresh-btn-sm">↻</button>
      </DataToolbar>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Agent</th>
              <th>版本</th>
              <th>环境</th>
              <th>状态</th>
              <th>Thread</th>
              <th>Token</th>
              <th>Cost</th>
              <th>Duration</th>
              <th>开始时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={11} className="data-table-empty">
                <div className="empty-state ha-empty">
                  <div className="empty-icon">⚡</div>
                  <div className="ha-empty-title">没有匹配的会话</div>
                  <div className="ha-empty-desc">尝试调整筛选条件或创建新会话</div>
                </div>
              </td></tr>
            ) : paged.map(s => {
              const sc = SESSION_STATUS_COLORS[s.status] || SESSION_STATUS_COLORS.created
              return (
                <tr key={s.id}>
                  <td><span className="ha-name-link" onClick={() => navigate(`/managed-agent/sessions/${s.id}`)}>{s.id}</span></td>
                  <td><span className="ha-name-link" onClick={() => navigate(`/managed-agent/agents/${s.agentId}`)}>{s.agentName}</span></td>
                  <td><span className="ha-version-badge">{s.agentVersion}</span></td>
                  <td style={{ fontSize: 13 }}>{s.environmentName}</td>
                  <td><span className="ha-status-tag" style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}>{sc.label}</span></td>
                  <td style={{ fontSize: 13, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.threads?.[0]?.title || '-'}</td>
                  <td style={{ fontSize: 13 }}>{s.tokenUsage?.total?.toLocaleString()}</td>
                  <td style={{ fontSize: 13 }}>${s.cost}</td>
                  <td style={{ fontSize: 13 }}>{s.duration ? `${Math.floor(s.duration / 60)}m${s.duration % 60}s` : '-'}</td>
                  <td style={{ fontSize: 13 }}>{s.startedAt?.slice(5, 16)}</td>
                  <td>
                    <div className="ha-row-actions">
                      <button onClick={() => navigate(`/managed-agent/sessions/${s.id}`)}>控制台</button>
                      {['running', 'idle', 'waiting_approval'].includes(s.status) && (
                        <button className="ha-delete-btn" onClick={() => handleStop(s)}>终止</button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="data-pagination">
          <span>共 {filtered.length} 条</span>
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <button className="pagination-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`pagination-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="pagination-btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>›</button>
              <select className="pagination-select" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }} style={{ marginLeft: 8 }}>
                <option value={10}>10条/页</option>
                <option value={20}>20条/页</option>
                <option value={50}>50条/页</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {toast && <div className={`ha-toast ha-toast-${toast.type}`}>{toast.msg}</div>}
    </PageLayout>
  )
}
