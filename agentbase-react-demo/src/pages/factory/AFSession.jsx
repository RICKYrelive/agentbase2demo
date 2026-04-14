import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout, { DataToolbar } from '../../components/PageLayout'
import './AF.css'

const STATUS = {
  running:      { label: '运行中', cls: 'afs-status-running' },
  idle:         { label: '空闲',   cls: 'afs-status-idle' },
  terminated:   { label: '已终止', cls: 'afs-status-terminated' },
  rescheduling: { label: '调度中', cls: 'afs-status-rescheduling' },
}

const MOCK_SESSIONS = [
  { id: 'ses_a1b2c3d4', title: 'PR 代码审查 #384', agentName: 'Insight Agent', agentId: 'ha-001', status: 'idle', activeSeconds: 142, inputTokens: 8210, outputTokens: 1043, createdAt: '2026-04-12 18:34', events: 27 },
  { id: 'ses_e5f6a7b8', title: '市场报告研究', agentName: 'Code Reviewer', agentId: 'ha-002', status: 'running', activeSeconds: 890, inputTokens: 32400, outputTokens: 6710, createdAt: '2026-04-12 21:02', events: 104 },
  { id: 'ses_c9d0e1f2', title: 'Q1 销售数据清洗', agentName: 'Data Pipeline', agentId: 'ha-004', status: 'terminated', activeSeconds: 430, inputTokens: 12100, outputTokens: 3240, createdAt: '2026-04-11 09:15', events: 61 },
]

const MOCK_AGENTS_LIBRARY = [
  { id: 'ha-001', name: 'Insight Agent', desc: 'Expert in GitHub PR analysis and security auditing.', icon: '🔍' },
  { id: 'ha-002', name: 'Code Reviewer', desc: 'Performs deep web research and document synthesis.', icon: '🧪' },
  { id: 'ha-004', name: 'Data Pipeline', desc: 'Parses complex CSV/Excel and generates insights.', icon: '📊' },
]

const MOCK_EVENTS = [
  { type: 'session.status_running', time: '21:02:01', note: '会话已启动' },
  { type: 'agent.thinking',          time: '21:02:03', note: '分析任务目标…' },
  { type: 'agent.tool_use',          time: '21:02:08', note: 'bash: find . -name "*.csv"' },
  { type: 'agent.tool_result',       time: '21:02:09', note: '返回 3 个文件路径' },
  { type: 'agent.message',           time: '21:02:45', note: '已找到数据文件，开始处理…' },
  { type: 'session.status_idle',     time: '21:02:50', note: 'stop_reason: end_turn' },
]

const fmtSec = s => s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`
const columns = ['ID', '标题', 'Agent', '状态', '运行时长', '输入 Token', '输出 Token', '事件数', '创建时间', '操作']

export default function AFSession() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [agentFilter, setAgentFilter] = useState('all')
  
  // Launcher State
  const [showLauncher, setShowLauncher] = useState(false)
  const [launcherStep, setLauncherStep] = useState(1)
  const [sessionForm, setSessionForm] = useState({
    agentId: '',
    title: '',
    filesystem: '',
    passport: ''
  })

  const filtered = MOCK_SESSIONS.filter(s => {
    if (agentFilter !== 'all' && s.agentId !== agentFilter) return false
    if (search && !s.title.toLowerCase().includes(search.toLowerCase()) && !s.id.includes(search)) return false
    return true
  })

  const handleLaunch = () => {
    alert('Session 已成功启动！正在分配算力资源…')
    setShowLauncher(false)
    setLauncherStep(1)
  }

  return (
    <PageLayout title="Session">
      <DataToolbar
        buttons={<button className="action-btn primary" onClick={() => setShowLauncher(true)}>+ New Session</button>}
        filters={
          <select className="filter-select" value={agentFilter} onChange={e => setAgentFilter(e.target.value)}>
            <option value="all">所有 Agent</option>
            {MOCK_SESSIONS.map(s => <option key={s.agentId} value={s.agentId}>{s.agentName}</option>)}
          </select>
        }
      >
        <div className="search-input">
          <span className="search-icon">🔍</span>
          <input placeholder="搜索 Session ID 或标题" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="refresh-btn-sm">↻</button>
      </DataToolbar>

      <div className="afs-layout">
        <div className="afs-list">
          <div className="data-table-wrap" style={{ marginBottom: 0 }}>
            <table className="data-table">
              <thead>
                <tr>{columns.map(c => <th key={c}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={columns.length} className="data-table-empty">
                    <div className="empty-state"><div className="empty-icon">▶️</div><span>暂无 Session</span></div>
                  </td></tr>
                ) : filtered.map(s => {
                  const st = STATUS[s.status]
                  return (
                    <tr key={s.id} className={selected?.id === s.id ? 'afs-row-active' : ''} style={{ cursor: 'pointer' }} onClick={() => setSelected(s)}>
                      <td><span className="af-id-cell">{s.id}</span></td>
                      <td><span className="af-name-link notion-body-medium">{s.title}</span></td>
                      <td><span className="af-model-badge notion-badge-text">{s.agentName}</span></td>
                      <td><span className="status-badge" style={{ background: 'var(--notion-blue-bg)', color: 'var(--notion-blue-text)', borderRadius: '9999px', padding: '2px 10px', fontWeight: 600 }}>{st.label}</span></td>
                      <td className="af-muted notion-caption">{fmtSec(s.activeSeconds)}</td>
                      <td className="af-muted notion-caption">{s.inputTokens.toLocaleString()}</td>
                      <td className="af-muted notion-caption">{s.outputTokens.toLocaleString()}</td>
                      <td className="af-muted notion-caption">{s.events}</td>
                      <td className="af-muted notion-caption">{s.createdAt}</td>
                      <td>
                        <div className="ha-row-actions">
                          <button className="notion-body-medium" style={{ color: 'var(--notion-blue)' }} onClick={() => navigate(`/super-agent/${s.agentId}/webui?title=${encodeURIComponent(s.title)}`)}>WebUI</button>
                          <button className="notion-body-medium">事件流</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className="data-pagination">
              <span>共 {filtered.length} 条</span>
              <span>每页</span>
              <select className="pagination-select"><option>50</option></select>
              <span>条</span>
            </div>
          </div>
        </div>

        {selected && (
          <div className="afs-panel">
            <div className="afs-panel-head">
              <div>
                <div className="afs-panel-title notion-body-medium">{selected.title}</div>
                <div className="afs-panel-id">{selected.id}</div>
              </div>
              <button className="afs-close-btn" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="afs-stats">
              <div className="afs-stat"><span className="afs-stat-label">输入 Token</span><span className="afs-stat-val">{selected.inputTokens.toLocaleString()}</span></div>
              <div className="afs-stat"><span className="afs-stat-label">输出 Token</span><span className="afs-stat-val">{selected.outputTokens.toLocaleString()}</span></div>
              <div className="afs-stat"><span className="afs-stat-label">运行时长</span><span className="afs-stat-val">{fmtSec(selected.activeSeconds)}</span></div>
            </div>
            <div className="afs-event-label notion-caption" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>事件流 (Event Stream)</div>
            <div className="afs-events">
              {MOCK_EVENTS.map((ev, i) => (
                <div key={i} className={`afs-event afs-ev-${ev.type.split('.')[0]}`}>
                  <span className="afs-ev-time">{ev.time}</span>
                  <span className="afs-ev-type">{ev.type}</span>
                  <span className="afs-ev-note">{ev.note}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Launcher Side Drawer */}
      {showLauncher && (
        <div className="af-drawer-overlay" onClick={() => setShowLauncher(false)}>
          <div className="af-drawer" onClick={e => e.stopPropagation()}>
            <div className="af-drawer-header">
              <div className="af-drawer-title-wrap">
                <div className="af-drawer-icon">🚀</div>
                <div className="af-drawer-title">启动新会话</div>
              </div>
              <button className="af-drawer-close" onClick={() => setShowLauncher(false)}>×</button>
            </div>

            <div className="af-drawer-body">
              <div className="af-wizard-progress">
                <div className={`af-wizard-step-bubble ${launcherStep === 1 ? 'active' : 'completed'}`}>1</div>
                <div className={`af-wizard-step-line ${launcherStep > 1 ? 'completed' : ''}`}></div>
                <div className={`af-wizard-step-bubble ${launcherStep === 2 ? 'active' : ''}`}>2</div>
              </div>

              {launcherStep === 1 && (
                <div className="af-wizard-content">
                  <div className="af-field">
                    <label className="af-field-label">选择 Agent 蓝图</label>
                    <div className="af-field-hint">会话将继承此 Agent 的模型配置、提示词和工具集。</div>
                    <div className="af-card-grid">
                      {MOCK_AGENTS_LIBRARY.map(agt => (
                        <div 
                          key={agt.id} 
                          className={`af-option-card ${sessionForm.agentId === agt.id ? 'selected' : ''}`}
                          onClick={() => setSessionForm({...sessionForm, agentId: agt.id, title: `${agt.name} Session`})}
                        >
                          <div className="af-option-icon">{agt.icon}</div>
                          <div className="af-option-name">{agt.name}</div>
                          <div className="af-option-desc">{agt.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {launcherStep === 2 && (
                <div className="af-wizard-content">
                  <div className="af-field">
                    <label className="af-field-label">会话标题</label>
                    <input 
                      className="af-input-text" 
                      value={sessionForm.title} 
                      onChange={e => setSessionForm({...sessionForm, title: e.target.value})}
                    />
                  </div>
                  <div className="af-field">
                    <label className="af-field-label">挂载文件系统 (Filesystem)</label>
                    <select className="af-input-select">
                      <option>不使用</option>
                      <option>fs_alpha001 (Code Review Workspace)</option>
                      <option>fs_beta002 (Data Pipeline)</option>
                    </select>
                  </div>
                  <div className="af-field">
                    <label className="af-field-label">注入凭证保险箱 (Vaults)</label>
                    <select className="af-input-select">
                      <option>不使用</option>
                      <option>vlt_aB3cD9eF (GitHub Production)</option>
                      <option>vlt_gH4iJ1kL (Slack Workspace)</option>
                    </select>
                  </div>
                  <div className="af-field">
                    <label className="af-field-label">运行时资源配额</label>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div className="af-form-help" style={{ marginBottom: 4 }}>CPU</div>
                        <select className="af-input-select"><option>0.5 Core</option><option>1.0 Core</option></select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="af-form-help" style={{ marginBottom: 4 }}>Memory</div>
                        <select className="af-input-select"><option>1 GiB</option><option>2 GiB</option></select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="af-drawer-footer">
              <button className="action-btn" onClick={() => setShowLauncher(false)}>取消</button>
              {launcherStep === 1 ? (
                <button className="action-btn primary" disabled={!sessionForm.agentId} onClick={() => setLauncherStep(2)}>下一步</button>
              ) : (
                <>
                  <button className="action-btn" onClick={() => setLauncherStep(1)}>上一步</button>
                  <button className="action-btn primary" onClick={handleLaunch}>启动运行</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}
