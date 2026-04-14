import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useManagedAgents } from '../../store/managedAgentStore'
import PageLayout, { DataToolbar } from '../../components/PageLayout'
import { 
  IconPlus, IconSearch, IconRotateCcw, IconList, IconGrid, 
  IconPackage, IconTool, IconClipboard, IconLock, IconZap, 
  IconAlertTriangle, IconTrash 
} from '../../components/Icons'
import './MAC.css'

export default function MACEnvironmentList() {
  const navigate = useNavigate()
  const { environments, sessions, dispatch } = useManagedAgents()
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [viewMode, setViewMode] = useState('list')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const filtered = environments.filter(e => !search || e.name.toLowerCase().includes(search.toLowerCase()))

  const handleDelete = () => {
    if (confirmDelete) {
      dispatch({ type: 'DELETE_ENVIRONMENT', id: confirmDelete.id })
      showToast(`${confirmDelete.name} 已删除`)
      setConfirmDelete(null)
    }
  }

  return (
    <PageLayout title="Environments" rightAction={<span style={{ fontSize: 12, color: '#999' }}>{environments.length} 个环境</span>}>
      <DataToolbar
        buttons={<button className="action-btn primary" onClick={() => showToast('创建环境功能开发中', 'info')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconPlus size={16} /> 创建环境</button>}
        filters={
          <div className="ha-view-toggle">
            <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><IconList size={16} /></button>
            <button className={`view-btn ${viewMode === 'card' ? 'active' : ''}`} onClick={() => setViewMode('card')}><IconGrid size={16} /></button>
          </div>
        }
      >
        <div className="search-input">
          <span className="search-icon"><IconSearch size={14} /></span>
          <input placeholder="搜索环境名称" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="refresh-btn-sm" onClick={() => showToast('已刷新')}><IconRotateCcw size={14} /></button>
      </DataToolbar>

      {viewMode === 'list' && (
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>名称</th>
              <th>Runtime</th>
              <th>基础镜像</th>
              <th>网络策略</th>
              <th>健康状态</th>
              <th>Session 数</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="data-table-empty">
                <div className="empty-state ha-empty">
                  <div className="empty-icon"><IconPackage size={48} style={{ opacity: 0.2 }} /></div>
                  <div className="ha-empty-title">还没有环境</div>
                  <div className="ha-empty-desc">创建一个运行环境，为 Agent 提供容器化沙箱</div>
                </div>
              </td></tr>
            ) : filtered.map(env => {
              const healthColor = env.status === 'healthy' ? '#52c41a' : env.status === 'unhealthy' ? '#ff4d4f' : '#999'
              return (
                <tr key={env.id}>
                  <td>
                    <span className="ha-name-link" onClick={() => navigate(`/managed-agent/environments/${env.id}`)}>{env.name}</span>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{env.description}</div>
                  </td>
                  <td><span className="ha-mini-tag">{env.runtime}</span></td>
                  <td style={{ fontSize: 13, fontFamily: 'monospace' }}>{env.baseImage}</td>
                  <td><span className="ha-mini-tag">{env.networkPolicy.mode}</span></td>
                  <td>
                    <span style={{ color: healthColor }}>
                      ● {env.status === 'healthy' ? '健康' : env.status === 'unhealthy' ? '异常' : '未知'}
                    </span>
                  </td>
                  <td>{env.sessionsCount}</td>
                  <td>{env.createdAt?.slice(0, 10)}</td>
                  <td>
                    <div className="ha-row-actions">
                      <button onClick={() => navigate(`/managed-agent/environments/${env.id}`)}>详情</button>
                      <button className="ha-delete-btn" onClick={() => setConfirmDelete(env)}><IconTrash size={14} /></button>
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

      {viewMode === 'card' && (
        <div className="mac-mcp-grid">
          {filtered.map(env => {
            const healthColor = env.status === 'healthy' ? '#52c41a' : '#ff4d4f'
            const envSessionCount = sessions.filter(s => s.environmentId === env.id).length
            return (
              <div key={env.id} className="mac-mcp-card" onClick={() => navigate(`/managed-agent/environments/${env.id}`)}>
                <div className="mac-mcp-card-header">
                  <span className="mac-mcp-card-name">{env.name}</span>
                  <span style={{ color: healthColor, fontSize: 12 }}>● {env.status === 'healthy' ? '健康' : '异常'}</span>
                </div>
                <div className="mac-mcp-card-desc">{env.description}</div>
                <div className="mac-card-capabilities" style={{ marginTop: 6 }}>
                  <span className="mac-cap-pill"><IconTool size={12} style={{ marginRight: 4 }} /> {env.runtime}</span>
                  <span className="mac-cap-pill"><IconClipboard size={12} style={{ marginRight: 4 }} /> {env.dependencies.length} deps</span>
                  <span className="mac-cap-pill"><IconLock size={12} style={{ marginRight: 4 }} /> {env.networkPolicy.mode}</span>
                  <span className="mac-cap-pill"><IconZap size={12} style={{ marginRight: 4 }} /> {envSessionCount} sessions</span>
                </div>
                <div className="mac-mcp-card-meta" style={{ marginTop: 8 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{env.baseImage}</span>
                  <span>{env.createdAt?.slice(0, 10)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {toast && <div className={`ha-toast ha-toast-${toast.type}`}>{toast.msg}</div>}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-icon"><IconAlertTriangle size={32} style={{ color: '#faad14' }} /></div>
            <div className="modal-message">确定要删除环境 <strong>{confirmDelete.name}</strong> 吗？</div>
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
