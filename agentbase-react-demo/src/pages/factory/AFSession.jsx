import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout, { DataToolbar } from '../../components/PageLayout'
import {
  IconSearch, IconRefresh, IconX, IconRocket,
  IconFlask, IconBarChart, IconActivity, IconPlus,
  IconGlobe, IconShield, IconVault, IconCheck
} from '../../components/Icons'
import { useManagedAgents, SESSION_STATUS_COLORS } from '../../store/managedAgentStore'
import './AF.css'

const MOCK_AGENTS_LIBRARY = [
  { id: 'ha-001', name: 'Insight Agent', desc: 'Expert in GitHub PR analysis and security auditing.', icon: <IconSearch size={22} /> },
  { id: 'ha-002', name: 'Code Reviewer', desc: 'Performs deep web research and document synthesis.', icon: <IconFlask size={22} /> },
  { id: 'ha-004', name: 'Data Pipeline', desc: 'Parses complex CSV/Excel and generates insights.', icon: <IconBarChart size={22} /> },
]

const MOCK_ENVIRONMENTS = [
  { id: 'env-001', name: 'AI 智能分析集群', desc: 'Python 3.12 环境，支持数据分析与模型推理', icon: <IconBarChart size={22} /> },
  { id: 'env-002', name: '网页与接口连接中心', desc: 'Node 20 环境，支持 API 调用与网页抓取', icon: <IconGlobe size={22} /> },
  { id: 'env-003', name: '系统审计与扫描引擎', desc: 'Golang 沙箱，专为系统级任务设计', icon: <IconShield size={22} /> },
]

const MOCK_CLUSTERS = [
  { id: 'cls-001', name: '默认生产集群', region: '华东 1 (杭州)', type: '标准型' },
  { id: 'cls-002', name: '海外加速节点', region: '美国 (硅谷)', type: '高吞吐型' },
  { id: 'cls-003', name: '开发测试环境', region: '本地托管', type: '隔离型' },
]

const MOCK_VAULTS = [
  { id: 'vlt_aB3cD9eF', name: 'GitHub Production', status: 'active', credCount: 2 },
  { id: 'vlt_gH4iJ1kL', name: 'Slack Workspace', status: 'active', credCount: 1 },
  { id: 'vlt_mN5oP2qR', name: 'Notion Integration', status: 'inactive', credCount: 0 },
]

const fmtSec = s => {
  if (!s) return '-'
  return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`
}
const columns = ['ID', '标题', 'Agent', '环境', '状态', '运行时长', '输入 Token', '输出 Token', '事件数', '创建时间', '操作']

export default function AFSession() {
  const navigate = useNavigate()
  const { sessions, dispatch } = useManagedAgents()
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [agentFilter, setAgentFilter] = useState('all')

  // Launcher State
  const [showLauncher, setShowLauncher] = useState(false)
  const [sessionForm, setSessionForm] = useState({
    agentId: '',
    environmentId: '',
    clusterId: 'cls-001',
    vaultIds: [],
  })

  const filtered = sessions.filter(s => {
    if (agentFilter !== 'all' && s.agentId !== agentFilter) return false
    const title = s.threads?.[0]?.title || s.agentName || ''
    if (search && !title.toLowerCase().includes(search.toLowerCase()) && !s.id.includes(search)) return false
    return true
  })

  const uniqueAgents = [...new Map(sessions.map(s => [s.agentId, { id: s.agentId, name: s.agentName }])).values()]

  const handleLaunch = () => {
    const agent = MOCK_AGENTS_LIBRARY.find(a => a.id === sessionForm.agentId)
    const env = MOCK_ENVIRONMENTS.find(e => e.id === sessionForm.environmentId)
    const cluster = MOCK_CLUSTERS.find(c => c.id === sessionForm.clusterId)

    dispatch({
      type: 'CREATE_SESSION',
      payload: {
        agentId: sessionForm.agentId,
        agentName: agent?.name || '',
        agentVersion: 'v1.0.0',
        environmentId: sessionForm.environmentId,
        environmentName: env?.name || '',
        clusterId: sessionForm.clusterId,
        clusterName: cluster?.name || '',
        createdBy: 'admin',
        tags: [],
      },
    })

    setShowLauncher(false)
    setSessionForm({ agentId: '', environmentId: '', clusterId: 'cls-001', vaultIds: [] })
  }

  return (
    <PageLayout title="会话">
      <DataToolbar
        buttons={<button className="action-btn primary" onClick={() => setShowLauncher(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconPlus size={16} /> 新建会话</button>}
        filters={
          <select className="filter-select" value={agentFilter} onChange={e => setAgentFilter(e.target.value)}>
            <option value="all">所有 Agent</option>
            {uniqueAgents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        }
      >
        <div className="search-input">
          <IconSearch className="search-icon" size={16} />
          <input placeholder="搜索会话 ID 或标题" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="refresh-btn-sm">
          <IconRefresh size={14} />
        </button>
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
                    <div className="empty-state">
                      <IconActivity size={40} style={{ color: 'var(--notion-gray-300)', marginBottom: 12 }} />
                      <span>暂无会话</span>
                    </div>
                  </td></tr>
                ) : filtered.map(s => {
                  const sc = SESSION_STATUS_COLORS[s.status] || SESSION_STATUS_COLORS.created
                  const title = s.threads?.[0]?.title || s.agentName || '-'
                  return (
                    <tr key={s.id} className={selected?.id === s.id ? 'afs-row-active' : ''} style={{ cursor: 'pointer' }} onClick={() => setSelected(s)}>
                      <td><span className="af-id-cell">{s.id}</span></td>
                      <td><span className="af-name-link notion-body-medium">{title}</span></td>
                      <td><span className="af-model-badge notion-badge-text">{s.agentName}</span></td>
                      <td><span className="notion-caption" style={{ fontSize: 12 }}>{s.environmentName || '-'}</span></td>
                      <td><span className="status-badge" style={{ background: sc.bg, color: sc.color, borderRadius: '9999px', padding: '2px 10px', fontWeight: 600 }}>{sc.label}</span></td>
                      <td className="af-muted notion-caption">{fmtSec(s.duration)}</td>
                      <td className="af-muted notion-caption">{(s.tokenUsage?.input || 0).toLocaleString()}</td>
                      <td className="af-muted notion-caption">{(s.tokenUsage?.output || 0).toLocaleString()}</td>
                      <td className="af-muted notion-caption">{s.events?.length || 0}</td>
                      <td className="af-muted notion-caption">{s.startedAt?.slice(0, 16) || '-'}</td>
                      <td>
                        <div className="ha-row-actions">
                          <button className="notion-body-medium" style={{ color: 'var(--notion-blue)' }} onClick={e => { 
                            e.stopPropagation(); 
                            const targetId = s.agentId.startsWith('ma-') ? s.agentId.replace('ma-', 'ha-') : s.agentId;
                            navigate(`/super-agent/${targetId}/webui?title=${encodeURIComponent(title)}`) 
                          }}>WebUI</button>
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
                <div className="afs-panel-title notion-body-medium">{selected.threads?.[0]?.title || selected.agentName}</div>
                <div className="afs-panel-id">{selected.id}</div>
              </div>
              <button className="afs-close-btn" onClick={() => setSelected(null)}>
                <IconX size={18} />
              </button>
            </div>
            <div className="afs-stats">
              <div className="afs-stat"><span className="afs-stat-label">输入 Token</span><span className="afs-stat-val">{(selected.tokenUsage?.input || 0).toLocaleString()}</span></div>
              <div className="afs-stat"><span className="afs-stat-label">输出 Token</span><span className="afs-stat-val">{(selected.tokenUsage?.output || 0).toLocaleString()}</span></div>
              <div className="afs-stat"><span className="afs-stat-label">运行时长</span><span className="afs-stat-val">{fmtSec(selected.duration)}</span></div>
            </div>
            <div className="afs-event-label notion-caption" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>事件流 (Event Stream)</div>
            <div className="afs-events">
              {(selected.events || []).length === 0 ? (
                <div style={{ color: 'var(--notion-gray-300)', fontSize: 13, padding: '16px 0', textAlign: 'center' }}>暂无事件</div>
              ) : selected.events.map((ev, i) => (
                <div key={i} className={`afs-event afs-ev-${ev.type?.split('.')[0] || ''}`}>
                  <span className="afs-ev-time">{ev.timestamp?.slice(11, 19) || ''}</span>
                  <span className="afs-ev-type">{ev.type}</span>
                  <span className="afs-ev-note">{ev.payload?.content || ev.payload?.tool || ''}</span>
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
                <IconRocket size={24} style={{ color: 'var(--notion-blue)' }} />
                <div className="af-drawer-title notion-h3">启动新会话</div>
              </div>
              <button className="af-drawer-close" onClick={() => setShowLauncher(false)}>
                <IconX size={20} />
              </button>
            </div>

            <div className="af-drawer-body" style={{ padding: '24px 32px' }}>
              {/* Cluster Selection */}
              <div className="af-field" style={{ marginBottom: 32 }}>
                <label className="af-field-label">选择集群 (Cluster)</label>
                <div className="af-field-hint">选择任务运行的基础物理集群。单选。</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                  {MOCK_CLUSTERS.map(cls => (
                    <div 
                      key={cls.id} 
                      className={`af-list-option ${sessionForm.clusterId === cls.id ? 'active' : ''}`}
                      onClick={() => setSessionForm({ ...sessionForm, clusterId: cls.id })}
                    >
                      <div className="af-list-radio">
                        <div className={sessionForm.clusterId === cls.id ? 'radio-inner active' : 'radio-inner'} />
                      </div>
                      <div className="af-list-info">
                        <div className="af-list-name">{cls.name} <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400, marginLeft: 8 }}>{cls.region} · {cls.type}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agent Selection */}
              <div className="af-field" style={{ marginBottom: 32 }}>
                <label className="af-field-label">选择 Agent</label>
                <div className="af-field-hint">会话将继承此 Agent 的模型配置、提示词和工具集。</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                  {MOCK_AGENTS_LIBRARY.map(agt => (
                    <div 
                      key={agt.id} 
                      className={`af-list-option ${sessionForm.agentId === agt.id ? 'active' : ''}`}
                      onClick={() => setSessionForm({ ...sessionForm, agentId: agt.id })}
                    >
                      <div className="af-list-radio">
                        <div className={sessionForm.agentId === agt.id ? 'radio-inner active' : 'radio-inner'} />
                      </div>
                      <div className="af-list-info">
                        <div className="af-list-name">{agt.name}</div>
                        <div className="af-list-desc">{agt.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Environment Selection */}
              <div className="af-field" style={{ marginBottom: 32 }}>
                <label className="af-field-label">运行环境 (Environment)</label>
                <div className="af-field-hint">选择会话的运行时沙箱环境。</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                  {MOCK_ENVIRONMENTS.map(env => (
                    <div 
                      key={env.id} 
                      className={`af-list-option ${sessionForm.environmentId === env.id ? 'active' : ''}`}
                      onClick={() => setSessionForm({ ...sessionForm, environmentId: env.id })}
                    >
                      <div className="af-list-radio">
                        <div className={sessionForm.environmentId === env.id ? 'radio-inner active' : 'radio-inner'} />
                      </div>
                      <div className="af-list-info">
                        <div className="af-list-name">{env.name}</div>
                        <div className="af-list-desc">{env.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vaults Selection (multi-select) */}
              <div className="af-field">
                <label className="af-field-label">注入凭证集</label>
                <div className="af-field-hint">选择需要注入的凭证集，可多选。</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                  {MOCK_VAULTS.map(vault => {
                    const isSelected = sessionForm.vaultIds.includes(vault.id)
                    return (
                      <div 
                        key={vault.id} 
                        className={`af-list-option ${isSelected ? 'active' : ''}`}
                        onClick={() => {
                          const newIds = isSelected
                            ? sessionForm.vaultIds.filter(id => id !== vault.id)
                            : [...sessionForm.vaultIds, vault.id]
                          setSessionForm({ ...sessionForm, vaultIds: newIds })
                        }}
                      >
                        <div className="af-list-checkbox">
                          {isSelected && <IconCheck size={14} style={{ color: '#fff' }} />}
                        </div>
                        <div className="af-list-info">
                          <div className="af-list-name">{vault.name}</div>
                          <div className="af-list-desc">{vault.credCount} 个凭证 · {vault.status === 'active' ? '活跃' : '未激活'}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="af-drawer-footer">
              <button className="action-btn" onClick={() => setShowLauncher(false)}>取消</button>
              <button
                className="action-btn primary"
                disabled={!sessionForm.agentId || !sessionForm.environmentId}
                onClick={handleLaunch}
              >
                启动运行
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}
