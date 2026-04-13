import { useState } from 'react'
import { useManagedAgents } from '../../store/managedAgentStore'
import PageLayout, { DataToolbar } from '../../components/PageLayout'
import './MAC.css'

export default function MACIntegrations() {
  const { mcps, dispatch } = useManagedAgents()
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)
  const [expandedMcp, setExpandedMcp] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newMcp, setNewMcp] = useState({ name: '', endpoint: '', authType: 'api_key', description: '' })

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const filtered = mcps.filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase()))

  const handleAdd = () => {
    if (!newMcp.name || !newMcp.endpoint) return showToast('请填写必填项', 'error')
    dispatch({ type: 'CREATE_MCP', payload: newMcp })
    setShowAdd(false)
    setNewMcp({ name: '', endpoint: '', authType: 'api_key', description: '' })
    showToast('MCP Provider 已添加')
  }

  return (
    <PageLayout title="Integrations" rightAction={<span style={{ fontSize: 12, color: '#999' }}>MCP Providers</span>}>
      <DataToolbar
        buttons={<button className="action-btn primary" onClick={() => setShowAdd(true)}>+ 添加 Provider</button>}
        filters={<></>}
      >
        <div className="search-input">
          <span className="search-icon">🔍</span>
          <input placeholder="搜索 Provider" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </DataToolbar>

      <div className="mac-mcp-grid">
        {filtered.map(mcp => {
          const statusColor = mcp.status === 'connected' ? '#52c41a' : '#999'
          const isExpanded = expandedMcp === mcp.id
          return (
            <div key={mcp.id} className="mac-mcp-card" onClick={() => setExpandedMcp(isExpanded ? null : mcp.id)}>
              <div className="mac-mcp-card-header">
                <span className="mac-mcp-card-name">{mcp.name}</span>
                <span style={{ color: statusColor, fontSize: 12 }}>● {mcp.status}</span>
              </div>
              <div className="mac-mcp-card-desc">{mcp.description}</div>
              <div className="mac-mcp-card-meta">
                <span>{mcp.availableTools} 个工具</span>
                <span>{mcp.authType}</span>
                <span>Last sync: {mcp.lastSyncAt?.slice(5, 16) || 'never'}</span>
              </div>
              {isExpanded && (
                <div className="mac-mcp-card-detail">
                  <div className="mac-kv-list">
                    <div className="mac-kv-row"><span className="mac-kv-key">Endpoint</span><span style={{ fontFamily: 'monospace' }}>{mcp.endpoint}</span></div>
                    <div className="mac-kv-row"><span className="mac-kv-key">认证方式</span><span>{mcp.authType}</span></div>
                    <div className="mac-kv-row"><span className="mac-kv-key">连接状态</span><span style={{ color: statusColor }}>{mcp.status}</span></div>
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <button className="action-btn" style={{ fontSize: 12 }} onClick={e => { e.stopPropagation(); showToast('同步中...', 'info') }}>同步工具</button>
                    <button className="action-btn" style={{ fontSize: 12, color: '#ff4d4f' }} onClick={e => { e.stopPropagation(); dispatch({ type: 'DELETE_MCP', id: mcp.id }); showToast('已删除') }}>删除</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-card" style={{ width: 480 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16 }}>添加 MCP Provider</h3>
            <div className="form-row">
              <label className="form-label">名称 <span className="required">*</span></label>
              <input className="form-input" value={newMcp.name} onChange={e => setNewMcp({ ...newMcp, name: e.target.value })} placeholder="例如: GitHub MCP" />
            </div>
            <div className="form-row">
              <label className="form-label">Endpoint <span className="required">*</span></label>
              <input className="form-input" value={newMcp.endpoint} onChange={e => setNewMcp({ ...newMcp, endpoint: e.target.value })} placeholder="https://mcp.example.com" style={{ fontFamily: 'monospace' }} />
            </div>
            <div className="form-row">
              <label className="form-label">认证方式</label>
              <select className="form-select" value={newMcp.authType} onChange={e => setNewMcp({ ...newMcp, authType: e.target.value })}>
                <option value="none">无认证</option>
                <option value="api_key">API Key</option>
                <option value="oauth">OAuth</option>
                <option value="custom">自定义</option>
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">描述</label>
              <textarea className="form-textarea" value={newMcp.description} onChange={e => setNewMcp({ ...newMcp, description: e.target.value })} rows={2} />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="action-btn" onClick={() => setShowAdd(false)}>取消</button>
              <button className="action-btn primary" onClick={handleAdd}>添加</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`ha-toast ha-toast-${toast.type}`}>{toast.msg}</div>}
    </PageLayout>
  )
}
