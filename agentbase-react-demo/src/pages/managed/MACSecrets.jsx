import { useState } from 'react'
import { useManagedAgents } from '../../store/managedAgentStore'
import PageLayout, { DataToolbar } from '../../components/PageLayout'
import './MAC.css'

export default function MACSecrets() {
  const { secrets, dispatch } = useManagedAgents()
  const [search, setSearch] = useState('')
  const [scopeFilter, setScopeFilter] = useState('all')
  const [toast, setToast] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [rotateTarget, setRotateTarget] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newSecret, setNewSecret] = useState({ name: '', scope: 'workspace', type: 'api_key', description: '' })
  const [revealedIds, setRevealedIds] = useState(new Set())

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const filtered = secrets.filter(s => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
    if (scopeFilter !== 'all' && s.scope !== scopeFilter) return false
    return true
  })

  const toggleReveal = (id) => {
    setRevealedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleDelete = () => {
    if (confirmDelete) {
      dispatch({ type: 'DELETE_SECRET', id: confirmDelete.id })
      showToast(`${confirmDelete.name} 已删除`)
      setConfirmDelete(null)
    }
  }

  const handleAdd = () => {
    if (!newSecret.name) return showToast('请填写名称', 'error')
    dispatch({ type: 'CREATE_SECRET', payload: newSecret })
    setShowAdd(false)
    setNewSecret({ name: '', scope: 'workspace', type: 'api_key', description: '' })
    showToast('凭证已创建')
  }

  const typeLabels = { api_key: 'API Key', token: 'Token', password: 'Password', certificate: 'Certificate' }

  return (
    <PageLayout title="Secrets" rightAction={<span style={{ fontSize: 12, color: '#999' }}>凭证管理 — 永不显示明文</span>}>
      <DataToolbar
        buttons={<button className="action-btn primary" onClick={() => setShowAdd(true)}>+ 创建凭证</button>}
        filters={
          <select className="pagination-select" value={scopeFilter} onChange={e => setScopeFilter(e.target.value)}>
            <option value="all">全部范围</option>
            <option value="workspace">Workspace</option>
            <option value="user">User</option>
          </select>
        }
      >
        <div className="search-input">
          <span className="search-icon">🔍</span>
          <input placeholder="搜索凭证名称" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="refresh-btn-sm">↻</button>
      </DataToolbar>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>名称</th><th>范围</th><th>类型</th><th>值 (masked)</th><th>使用次数</th><th>最近轮换</th><th>创建时间</th><th>操作</th></tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="data-table-empty">
                <div className="empty-state ha-empty">
                  <div className="empty-icon">🔑</div>
                  <div className="ha-empty-title">没有凭证</div>
                  <div className="ha-empty-desc">安全地存储 API Key、Token 等敏感信息</div>
                </div>
              </td></tr>
            ) : filtered.map(s => (
              <tr key={s.id}>
                <td><strong>{s.name}</strong><div style={{ fontSize: 12, color: '#999' }}>{s.description}</div></td>
                <td><span className="ha-mini-tag">{s.scope}</span></td>
                <td><span className="ha-mini-tag">{typeLabels[s.type] || s.type}</span></td>
                <td style={{ fontFamily: 'monospace', color: '#999' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{revealedIds.has(s.id) ? 'sk-••••••••••••••••' : s.maskedValue}</span>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#999' }} onClick={() => toggleReveal(s.id)} title={revealedIds.has(s.id) ? '隐藏' : '显示'}>
                      {revealedIds.has(s.id) ? '🙈' : '👁'}
                    </button>
                  </div>
                </td>
                <td>{s.usageCount}</td>
                <td>{s.lastRotatedAt?.slice(0, 10)}</td>
                <td>{s.createdAt?.slice(0, 10)}</td>
                <td>
                  <div className="ha-row-actions">
                    <button onClick={() => setRotateTarget(s)}>轮换</button>
                    <button className="ha-delete-btn" onClick={() => setConfirmDelete(s)}>删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="data-pagination"><span>共 {filtered.length} 条</span></div>
      </div>

      {/* Security Notice */}
      <div className="mac-notice" style={{ marginTop: 16 }}>
        🔒 凭证以 AES-256 加密存储，仅在运行时通过环境变量注入，永远不会在 UI 中显示明文。工具调用使用引用而非明文传递。
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-card" style={{ width: 480 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16 }}>创建凭证</h3>
            <div className="form-row">
              <label className="form-label">名称 <span className="required">*</span></label>
              <input className="form-input" value={newSecret.name} onChange={e => setNewSecret({ ...newSecret, name: e.target.value })} placeholder="例如: OpenAI API Key" />
            </div>
            <div className="form-row">
              <label className="form-label">范围</label>
              <div className="radio-options">
                <label className="radio-label"><input type="radio" checked={newSecret.scope === 'workspace'} onChange={() => setNewSecret({ ...newSecret, scope: 'workspace' })} />Workspace</label>
                <label className="radio-label"><input type="radio" checked={newSecret.scope === 'user'} onChange={() => setNewSecret({ ...newSecret, scope: 'user' })} />User</label>
              </div>
            </div>
            <div className="form-row">
              <label className="form-label">类型</label>
              <select className="form-select" value={newSecret.type} onChange={e => setNewSecret({ ...newSecret, type: e.target.value })}>
                <option value="api_key">API Key</option>
                <option value="token">Token</option>
                <option value="password">Password</option>
                <option value="certificate">Certificate</option>
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">描述</label>
              <textarea className="form-textarea" value={newSecret.description} onChange={e => setNewSecret({ ...newSecret, description: e.target.value })} rows={2} />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="action-btn" onClick={() => setShowAdd(false)}>取消</button>
              <button className="action-btn primary" onClick={handleAdd}>创建</button>
            </div>
          </div>
        </div>
      )}

      {/* Rotate Confirm */}
      {rotateTarget && (
        <div className="modal-overlay" onClick={() => setRotateTarget(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">🔄</div>
            <div className="modal-message">确定要轮换凭证 <strong>{rotateTarget.name}</strong> 吗？旧值将立即失效。</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="action-btn primary" onClick={() => {
                dispatch({ type: 'UPDATE_SECRET', id: rotateTarget.id, payload: { lastRotatedAt: new Date().toISOString().slice(0, 19) } })
                showToast('凭证已轮换')
                setRotateTarget(null)
              }}>确认轮换</button>
              <button className="action-btn" onClick={() => setRotateTarget(null)}>取消</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">⚠️</div>
            <div className="modal-message">确定要删除凭证 <strong>{confirmDelete.name}</strong> 吗？正在使用的 Agent 将会运行失败。</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="action-btn primary" style={{ background: '#ff4d4f', borderColor: '#ff4d4f' }} onClick={handleDelete}>删除</button>
              <button className="action-btn" onClick={() => setConfirmDelete(null)}>取消</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`ha-toast ha-toast-${toast.type}`}>{toast.msg}</div>}
    </PageLayout>
  )
}
