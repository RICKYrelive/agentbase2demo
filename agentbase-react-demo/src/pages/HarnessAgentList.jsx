import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHarnessAgents, canTransition } from '../store/harnessAgentStore.jsx'
import PageLayout, { DataToolbar } from '../components/PageLayout'
import './HarnessAgentList.css'

const STATUS_COLORS = {
  Draft:   { bg: '#e6f4ff', color: '#1677ff', border: '#91caff' },
  Running: { bg: '#f6ffed', color: '#52c41a', border: '#b7eb8f' },
  Paused:  { bg: '#fffbe6', color: '#d48806', border: '#ffe58f' },
  Stopped: { bg: '#f5f5f5', color: '#8c8c8c', border: '#d9d9d9' },
  Error:   { bg: '#fff2f0', color: '#ff4d4f', border: '#ffccc7' },
}

const columns = [
  { key: 'name', label: '名称', sortable: true },
  { key: 'status', label: '状态', sortable: true },
  { key: 'harnessType', label: 'Harness 类型' },
  { key: 'description', label: '描述' },
  { key: 'workspace', label: '所属空间' },
  { key: 'createdAt', label: '创建时间', sortable: true },
  { key: 'owner', label: '创建人', sortable: true },
  { key: 'lastRunAt', label: '最近运行时间' },
  { key: 'actions', label: '操作' },
]

export default function HarnessAgentList() {
  const { agents, dispatch } = useHarnessAgents()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const filtered = agents.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleAction = (agent, action) => {
    switch (action) {
      case 'detail':
        navigate(`/harness-agent/${agent.id}`)
        break
      case 'start':
        if (canTransition(agent.status, 'Running')) {
          dispatch({ type: 'CHANGE_STATUS', id: agent.id, newStatus: 'Running' })
          showToast(`${agent.name} 已启动`)
        }
        break
      case 'pause':
        if (canTransition(agent.status, 'Paused')) {
          dispatch({ type: 'CHANGE_STATUS', id: agent.id, newStatus: 'Paused' })
          showToast(`${agent.name} 已暂停`)
        }
        break
      case 'stop':
        if (canTransition(agent.status, 'Stopped')) {
          dispatch({ type: 'CHANGE_STATUS', id: agent.id, newStatus: 'Stopped' })
          showToast(`${agent.name} 已停止`)
        }
        break
      case 'delete':
        setConfirmDelete(agent)
        break
      case 'experience':
        navigate(`/harness-agent/${agent.id}?tab=experience`)
        break
      default:
        break
    }
  }

  const doDelete = () => {
    if (confirmDelete) {
      dispatch({ type: 'DELETE', id: confirmDelete.id })
      showToast(`${confirmDelete.name} 已删除`)
      setConfirmDelete(null)
    }
  }

  return (
    <PageLayout title="Harness Agent">
      <DataToolbar
        buttons={
          <button className="action-btn primary" onClick={() => navigate('/harness-agent/create')}>+ 创建 Harness Agent</button>
        }
        filters={
          <button className="action-btn" onClick={() => showToast('筛选功能演示中', 'info')}>🔧 筛选</button>
        }
      >
        <div className="search-input">
          <span className="search-icon">🔍</span>
          <input placeholder="搜索名称" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="refresh-btn-sm" onClick={() => showToast('已刷新', 'info')}>↻</button>
      </DataToolbar>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i}>{col.label} {col.sortable && <span className="sort-icon">↕</span>}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="data-table-empty">
                  <div className="empty-state ha-empty">
                    <div className="empty-icon">🔗</div>
                    <div className="ha-empty-title">还没有 Harness Agent</div>
                    <div className="ha-empty-desc">创建一个 Harness Agent，用于统一承载并运行 OpenClaw / Deerflow2 等 Agent</div>
                    <button className="action-btn primary" style={{marginTop: 12}} onClick={() => navigate('/harness-agent/create')}>+ 创建 Harness Agent</button>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map(agent => {
                const sc = STATUS_COLORS[agent.status] || STATUS_COLORS.Draft
                return (
                  <tr key={agent.id}>
                    <td>
                      <span className="ha-name-link" onClick={() => navigate(`/harness-agent/${agent.id}`)}>{agent.name}</span>
                    </td>
                    <td>
                      <span className="ha-status-tag" style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}>
                        {agent.status}
                      </span>
                    </td>
                    <td><span className="ha-type-badge">{agent.harnessType}</span></td>
                    <td><span className="ha-desc-cell">{agent.description}</span></td>
                    <td>{agent.workspace}</td>
                    <td>{agent.createdAt}</td>
                    <td>{agent.owner}</td>
                    <td>{agent.lastRunAt || '-'}</td>
                    <td>
                      <div className="ha-row-actions">
                        <button onClick={() => handleAction(agent, 'detail')}>详情</button>
                        {canTransition(agent.status, 'Running') && <button onClick={() => handleAction(agent, 'start')}>启动</button>}
                        {canTransition(agent.status, 'Paused') && <button onClick={() => handleAction(agent, 'pause')}>暂停</button>}
                        {canTransition(agent.status, 'Stopped') && <button onClick={() => handleAction(agent, 'stop')}>停止</button>}
                        <button onClick={() => handleAction(agent, 'experience')}>体验</button>
                        <button className="ha-delete-btn" onClick={() => handleAction(agent, 'delete')}>删除</button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
        <div className="data-pagination">
          <span>共 {filtered.length} 条</span>
          <span>每页</span>
          <select className="pagination-select"><option>50</option></select>
          <span>条</span>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`ha-toast ha-toast-${toast.type}`}>{toast.msg}</div>
      )}

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">⚠️</div>
            <div className="modal-message">确定要删除 <strong>{confirmDelete.name}</strong> 吗？此操作不可恢复。</div>
            <div style={{display:'flex', gap: 12, justifyContent:'center'}}>
              <button className="action-btn primary" style={{background:'#ff4d4f', borderColor:'#ff4d4f'}} onClick={doDelete}>删除</button>
              <button className="action-btn" onClick={() => setConfirmDelete(null)}>取消</button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}
