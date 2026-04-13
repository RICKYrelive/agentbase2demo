import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useManagedAgents, AGENT_STATUS_COLORS, SESSION_STATUS_COLORS } from '../../store/managedAgentStore'
import './MAC.css'

export default function MACAgentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { agents, sessions, dispatch } = useManagedAgents()
  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [editingField, setEditingField] = useState(null)
  const [editValue, setEditValue] = useState('')

  const agent = agents.find(a => a.id === id)
  if (!agent) return <div className="mac-not-found">Agent 未找到</div>

  const sc = AGENT_STATUS_COLORS[agent.status] || AGENT_STATUS_COLORS.draft
  const agentSessions = sessions.filter(s => s.agentId === agent.id)

  // Compute stats
  const totalTokens = agentSessions.reduce((s, sess) => s + (sess.tokenUsage?.total || 0), 0)
  const totalCost = agentSessions.reduce((s, sess) => s + (sess.cost || 0), 0)
  const failedCount = agentSessions.filter(s => s.status === 'failed').length
  const successRate = agentSessions.length > 0 ? Math.round(((agentSessions.length - failedCount) / agentSessions.length) * 100) : 0

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const handleClone = () => {
    dispatch({ type: 'CREATE_AGENT', payload: { ...agent, name: agent.name + '-clone', description: agent.description + ' (克隆)' } })
    showToast('Agent 已克隆')
  }

  const handlePublish = () => {
    dispatch({ type: 'UPDATE_AGENT', id: agent.id, payload: { status: 'published' } })
    showToast('Agent 已发布')
  }

  const startEdit = (field, value) => {
    setEditingField(field)
    setEditValue(value || '')
  }

  const saveEdit = () => {
    if (editingField && editValue.trim()) {
      dispatch({ type: 'UPDATE_AGENT', id: agent.id, payload: { [editingField]: editValue } })
      showToast('已更新')
    }
    setEditingField(null)
  }

  const tabs = ['overview', 'versions', 'configuration', 'sessions']

  return (
    <div className="mac-detail-page">
      {/* Header */}
      <div className="mac-detail-header">
        <div className="mac-detail-top">
          <button className="back-btn" onClick={() => navigate('/managed-agent/agents')}>← 返回</button>
          <div className="breadcrumb">
            <span className="bc-item" onClick={() => navigate('/managed-agent')}>Agent Console</span>
            <span className="bc-sep">/</span>
            <span className="bc-item" onClick={() => navigate('/managed-agent/agents')}>Agents</span>
            <span className="bc-sep">/</span>
            <span className="bc-current">{agent.name}</span>
          </div>
        </div>
        <div className="mac-detail-info">
          <div className="mac-detail-name-row">
            <h2>{agent.name}</h2>
            <span className="ha-status-tag" style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}>{sc.label}</span>
            <span className="ha-version-badge">{agent.currentVersion}</span>
          </div>
          <div className="mac-detail-meta">
            <span>Owner: {agent.owner}</span>
            <span>Model: {agent.model?.modelId}</span>
            <span>Visibility: {agent.visibility}</span>
            <span>Created: {agent.createdAt?.slice(0, 10)}</span>
          </div>
          <div className="mac-detail-desc">
            {editingField === 'description' ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-input" value={editValue} onChange={e => setEditValue(e.target.value)} style={{ flex: 1 }} />
                <button className="action-btn primary" style={{ padding: '4px 12px' }} onClick={saveEdit}>保存</button>
                <button className="action-btn" style={{ padding: '4px 12px' }} onClick={() => setEditingField(null)}>取消</button>
              </div>
            ) : (
              <span onClick={() => startEdit('description', agent.description)} style={{ cursor: 'pointer' }}>
                {agent.description} <span style={{ color: '#ccc', fontSize: 12 }}>✏️</span>
              </span>
            )}
          </div>
          <div className="mac-detail-tags">
            {(agent.tags || []).map(t => <span key={t} className="ha-mini-tag">{t}</span>)}
          </div>
        </div>
        <div className="mac-detail-actions">
          <button className="action-btn primary" onClick={() => navigate('/managed-agent/sessions', { state: { agentId: agent.id } })}>⚡ 新建会话</button>
          {agent.status === 'draft' && <button className="action-btn" onClick={handlePublish}>📤 发布</button>}
          <button className="action-btn" onClick={handleClone}>📋 克隆</button>
          <button className="action-btn" onClick={() => navigate('/managed-agent/agents')}>← 返回列表</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mac-tabs">
        {tabs.map(tab => (
          <button key={tab} className={`mac-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {{ overview: '概览', versions: '版本', configuration: '配置', sessions: `会话 (${agentSessions.length})` }[tab]}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mac-tab-content">
        {activeTab === 'overview' && (
          <div className="mac-overview-tab">
            {/* Quick Stats */}
            <div className="mac-quick-stats">
              <div className="mac-qs-item"><span className="mac-qs-val">{agentSessions.length}</span><span className="mac-qs-lbl">Total Sessions</span></div>
              <div className="mac-qs-item"><span className="mac-qs-val">{totalTokens.toLocaleString()}</span><span className="mac-qs-lbl">Total Tokens</span></div>
              <div className="mac-qs-item"><span className="mac-qs-val">${totalCost.toFixed(2)}</span><span className="mac-qs-lbl">Total Cost</span></div>
              <div className="mac-qs-item"><span className="mac-qs-val" style={{ color: successRate === 100 ? '#52c41a' : '#fa8c16' }}>{successRate}%</span><span className="mac-qs-lbl">Success Rate</span></div>
              <div className="mac-qs-item"><span className="mac-qs-val">{agent.tools?.length || 0}</span><span className="mac-qs-lbl">Tools Bound</span></div>
              <div className="mac-qs-item"><span className="mac-qs-val">{agent.skills?.length || 0}</span><span className="mac-qs-lbl">Skills</span></div>
            </div>

            <div className="mac-config-grid">
              <div className="mac-config-section">
                <h4>基本信息</h4>
                <div className="mac-kv-list">
                  <div className="mac-kv-row"><span className="mac-kv-key">名称</span><span style={{ fontFamily: 'monospace' }}>{agent.name}</span></div>
                  <div className="mac-kv-row"><span className="mac-kv-key">版本</span><span>{agent.currentVersion}</span></div>
                  <div className="mac-kv-row"><span className="mac-kv-key">创建人</span><span>{agent.owner}</span></div>
                  <div className="mac-kv-row"><span className="mac-kv-key">创建时间</span><span>{agent.createdAt}</span></div>
                  <div className="mac-kv-row"><span className="mac-kv-key">最近运行</span><span>{agent.lastRunAt || '从未运行'}</span></div>
                </div>
              </div>
              <div className="mac-config-section">
                <h4>模型配置</h4>
                <div className="mac-kv-list">
                  <div className="mac-kv-row"><span className="mac-kv-key">模型</span><span style={{ fontFamily: 'monospace' }}>{agent.model?.modelId}</span></div>
                  <div className="mac-kv-row"><span className="mac-kv-key">Provider</span><span>{agent.model?.provider}</span></div>
                  <div className="mac-kv-row"><span className="mac-kv-key">Temperature</span><span>{agent.model?.temperature}</span></div>
                  <div className="mac-kv-row"><span className="mac-kv-key">Max Tokens</span><span>{agent.model?.maxTokens?.toLocaleString()}</span></div>
                </div>
              </div>
            </div>
            <div className="mac-config-section" style={{ marginTop: 16 }}>
              <h4>System Prompt</h4>
              {editingField === 'systemPrompt' ? (
                <div>
                  <textarea className="form-textarea" value={editValue} onChange={e => setEditValue(e.target.value)} rows={10} style={{ fontFamily: 'monospace', fontSize: 12 }} />
                  <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                    <button className="action-btn primary" style={{ padding: '4px 16px' }} onClick={saveEdit}>保存</button>
                    <button className="action-btn" style={{ padding: '4px 16px' }} onClick={() => setEditingField(null)}>取消</button>
                  </div>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <pre className="mac-prompt-preview">{agent.systemPrompt}</pre>
                  <button className="action-btn" style={{ position: 'absolute', top: 8, right: 8, padding: '2px 8px', fontSize: 11 }} onClick={() => startEdit('systemPrompt', agent.systemPrompt)}>✏️ 编辑</button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'versions' && (
          <div className="mac-versions-tab">
            <table className="data-table">
              <thead><tr><th>版本</th><th>变更说明</th><th>发布者</th><th>发布时间</th><th>状态</th></tr></thead>
              <tbody>
                {(agent.versions || []).map(v => (
                  <tr key={v.id}>
                    <td><span className="ha-version-badge">{v.version}</span></td>
                    <td>{v.changelog}</td>
                    <td>{v.publishedBy}</td>
                    <td>{v.publishedAt}</td>
                    <td>{v.isCurrent ? <span className="ha-status-tag" style={{ background: '#f6ffed', color: '#52c41a', borderColor: '#b7eb8f' }}>当前版本</span> : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'configuration' && (
          <div className="mac-config-tab">
            <div className="mac-config-grid">
              <div className="mac-config-section">
                <h4>绑定工具 ({agent.tools?.length || 0})</h4>
                <div className="mac-tag-list">
                  {(agent.tools || []).map(t => <span key={t} className="ha-mini-tag" style={{ background: '#e6f7ff', borderColor: '#91caff', color: '#1890ff' }}>{t.replace('bt-', '')}</span>)}
                </div>
              </div>
              <div className="mac-config-section">
                <h4>Skills</h4>
                <div className="mac-tag-list">
                  {(agent.skills || []).map(s => <span key={s} className="ha-mini-tag">{s}</span>)}
                </div>
              </div>
              <div className="mac-config-section">
                <h4>MCP Servers</h4>
                <div className="mac-tag-list">
                  {(agent.mcpServers || []).length === 0 ? <span style={{ color: '#999' }}>未绑定</span> :
                    agent.mcpServers.map(m => <span key={m} className="ha-mini-tag">{m}</span>)}
                </div>
              </div>
              <div className="mac-config-section">
                <h4>Metadata</h4>
                <div className="mac-kv-list">
                  {Object.entries(agent.metadata || {}).map(([k, v]) => (
                    <div key={k} className="mac-kv-row"><span className="mac-kv-key">{k}</span><span>{v}</span></div>
                  ))}
                  {Object.keys(agent.metadata || {}).length === 0 && <span style={{ color: '#999' }}>无</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="mac-sessions-tab">
            {agentSessions.length === 0 ? (
              <div className="mac-empty-inline">该 Agent 暂无会话记录</div>
            ) : (
              <table className="data-table">
                <thead><tr><th>ID</th><th>状态</th><th>Thread</th><th>Token</th><th>Cost</th><th>开始时间</th><th>操作</th></tr></thead>
                <tbody>
                  {agentSessions.map(s => {
                    const ssc = SESSION_STATUS_COLORS[s.status] || { bg: '#f5f5f5', color: '#999', border: '#d9d9d9' }
                    return (
                      <tr key={s.id}>
                        <td><span className="ha-name-link" onClick={() => navigate(`/managed-agent/sessions/${s.id}`)}>{s.id}</span></td>
                        <td><span className="ha-status-tag" style={{ background: ssc.bg, color: ssc.color, borderColor: ssc.border }}>{ssc.label}</span></td>
                        <td>{s.threads?.[0]?.title || '-'}</td>
                        <td>{s.tokenUsage?.total?.toLocaleString()}</td>
                        <td>${s.cost}</td>
                        <td>{s.startedAt?.slice(5, 16)}</td>
                        <td><div className="ha-row-actions"><button onClick={() => navigate(`/managed-agent/sessions/${s.id}`)}>查看</button></div></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {toast && <div className={`ha-toast ha-toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}
