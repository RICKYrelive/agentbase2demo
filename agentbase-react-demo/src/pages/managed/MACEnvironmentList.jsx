import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useManagedAgents } from '../../store/managedAgentStore'
import PageLayout, { DataToolbar } from '../../components/PageLayout'
import { 
  IconPlus, IconSearch, IconRotateCcw, IconList, IconGrid, 
  IconPackage, IconTool, IconClipboard, IconLock, IconZap, 
  IconAlertTriangle, IconTrash, IconX
} from '../../components/Icons'
import './MAC.css'




export default function MACEnvironmentList() {
  const navigate = useNavigate()
  const { environments, sessions, dispatch } = useManagedAgents()
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [viewMode, setViewMode] = useState('list')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', hostingType: 'cloud', description: '' })
  const [createErrors, setCreateErrors] = useState({})

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const handleOpenCreate = () => {
    setCreateForm({ name: '', description: '' })
    setCreateErrors({})
    setShowCreateModal(true)
  }

  const handleCreate = () => {
    const errs = {}
    if (!createForm.name.trim()) errs.name = '名称不能为空'
    if (createForm.name.length > 50) errs.name = '名称不超过 50 字符'
    if (Object.keys(errs).length) { setCreateErrors(errs); return }

    dispatch({
      type: 'CREATE_ENVIRONMENT',
      payload: {
        name: createForm.name.trim(),
        description: createForm.description,
        runtime: 'python', // Use default or remove if not needed
        baseImage: '',     // Remove or set to empty
        dependencies: [],
        networkPolicy: { mode: 'limited', allowDomains: [], allowIPs: [] },
        fileMounts: [],
        envVars: [],
        workDir: '/workspace',
      },
    })
    setShowCreateModal(false)
    showToast(`环境 "${createForm.name}" 创建成功`)
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
    <PageLayout title="沙箱环境" rightAction={<span style={{ fontSize: 12, color: '#999' }}>{environments.length} 个环境</span>}>
      <DataToolbar
        buttons={<button className="action-btn primary" onClick={handleOpenCreate} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconPlus size={16} /> 创建环境</button>}
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
              <th>状态</th>
              <th>Session 数</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="data-table-empty">
                <div className="empty-state ha-empty">
                  <div className="empty-icon"><IconPackage size={48} style={{ opacity: 0.2 }} /></div>
                  <div className="ha-empty-title">还没有环境</div>
                  <div className="ha-empty-desc">创建一个业务沙箱，为 Agent 提供安全且隔离的运行能力</div>
                </div>
              </td></tr>
            ) : filtered.map(env => {
              return (
                <tr key={env.id}>
                  <td>
                    <span className="ha-name-link" onClick={() => navigate(`/af-environment/${env.id}`)}>{env.name}</span>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{env.description}</div>
                  </td>
                  <td>
                    <span className="ha-status-tag" style={{ background: '#f6ffed', color: '#52c41a', border: '1px solid #b7eb8f', padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>可用</span>
                  </td>
                  <td>{env.sessionsCount || 0}</td>
                  <td>{env.createdAt?.slice(0, 10)}</td>
                  <td>
                    <div className="ha-row-actions">
                      <button onClick={() => navigate(`/af-environment/${env.id}`)}>详情</button>
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
            const envSessionCount = sessions.filter(s => s.environmentId === env.id).length
            return (
              <div key={env.id} className="mac-mcp-card" onClick={() => navigate(`/af-environment/${env.id}`)}>
                <div className="mac-mcp-card-header">
                  <span className="mac-mcp-card-name">{env.name}</span>
                  <span style={{ fontSize: 11, color: '#52c41a', fontWeight: 500 }}>● 可用</span>
                </div>
                <div className="mac-mcp-card-desc">{env.description}</div>
                <div className="mac-card-capabilities" style={{ marginTop: 6 }}>
                  <span className="mac-cap-pill"><IconClipboard size={12} style={{ marginRight: 4 }} /> {env.dependencies?.length || 0} deps</span>
                  <span className="mac-cap-pill"><IconZap size={12} style={{ marginRight: 4 }} /> {envSessionCount} sessions</span>
                </div>
                <div className="mac-mcp-card-meta" style={{ marginTop: 8 }}>
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

      {/* Create Environment Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="mac-create-env-modal" onClick={e => e.stopPropagation()}>
            <div className="mac-create-env-modal-header">
              <h2>Add environment</h2>
              <button className="mac-create-env-close" onClick={() => setShowCreateModal(false)}><IconX size={20} /></button>
            </div>

            <div className="mac-create-env-modal-body">
              <div className="mac-create-env-field">
                <label className="mac-env-label">Name</label>
                <input
                  className={`mac-env-text-input ${createErrors.name ? 'error' : ''}`}
                  placeholder="E.g. My Environment"
                  value={createForm.name}
                  maxLength={50}
                  onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                />
                {createErrors.name
                  ? <div className="mac-create-env-error">{createErrors.name}</div>
                  : <div className="mac-create-env-hint">50 characters or fewer.</div>
                }
              </div>

              <div className="mac-create-env-field">
                <label className="mac-env-label">Description</label>
                <textarea
                  className="mac-env-textarea"
                  rows={4}
                  placeholder="Optional description for this environment"
                  value={createForm.description}
                  onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>

            <div className="mac-create-env-modal-footer">
              <button
                className="mac-create-env-submit"
                disabled={!createForm.name.trim()}
                onClick={handleCreate}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}
