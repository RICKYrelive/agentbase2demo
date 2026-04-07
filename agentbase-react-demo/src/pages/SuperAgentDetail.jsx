import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useSuperAgents, VERSIONS, IM_TYPES } from '../store/superAgentStore.jsx'
import TagSelectModal from '../components/TagSelectModal'
import SkillSelectionModal from '../components/SkillSelectionModal'
import './SuperAgentDetail.css'

const STATUS_COLORS = {
  '运行中': { bg: '#f6ffed', color: '#52c41a', border: '#b7eb8f' },
  '启动中': { bg: '#e6f7ff', color: '#1890ff', border: '#91d5ff' },
  '关闭中': { bg: '#fff2e8', color: '#fa8c16', border: '#ffd8bf' },
  '停止': { bg: '#f5f5f5', color: '#595959', border: '#d9d9d9' },
}

const TABS = [
  { key: 'overview', label: '概览' },
  { key: 'snapshots', label: '快照' },
  { key: 'config', label: '配置' },
  { key: 'runtime', label: '定时任务' },
]

const CONFIG_SUBTABS = [
  { key: 'basic', label: '基础信息' },
  { key: 'agent', label: 'Agent 配置' },
  { key: 'capabilities', label: '基础能力' },
  { key: 'channel', label: 'Channel' },
  { key: 'webui', label: 'WebUI 配置' },
  { key: 'markdown', label: 'Agent Markdown' },
]

function InlineEditable({ label, value, type = 'text', options = [], onChange, renderValue }) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempVal, setTempVal] = useState(value)

  const handleSave = () => {
    onChange(tempVal)
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <div className="had-kv inline-editable-kv" onClick={() => { setTempVal(value); setIsEditing(true) }}>
        <span>{label}</span>
        <div className="ie-val-box">
          {renderValue ? renderValue(value) : (value || '-')}
          <span className="ie-hint">✏️ 编辑</span>
        </div>
      </div>
    )
  }

  return (
    <div className="had-kv inline-editing-kv" style={{ alignItems: 'flex-start' }}>
      <span style={{ marginTop: 8 }}>{label}</span>
      <div className="ie-input-wrap">
        {type === 'textarea' ? (
          <textarea value={tempVal} onChange={e => setTempVal(e.target.value)} autoFocus style={{ width: '100%', minHeight: 60, padding: 8, border: '1px solid #d9d9d9', borderRadius: 4, resize: 'vertical' }} />
        ) : type === 'select' ? (
          <select value={tempVal} onChange={e => setTempVal(e.target.value)} autoFocus style={{ padding: '6px 12px', border: '1px solid #d9d9d9', borderRadius: 4 }}>
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : (
          <input type={type} value={tempVal} onChange={e => setTempVal(e.target.value)} autoFocus style={{ padding: '6px 12px', border: '1px solid #d9d9d9', borderRadius: 4, width: '100%' }} />
        )}
        <div className="ie-actions" style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          <button className="action-btn primary small" onClick={handleSave}>保存</button>
          <button className="action-btn small" onClick={() => setIsEditing(false)}>取消</button>
        </div>
      </div>
    </div>
  )
}

export default function SuperAgentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { agents, dispatch } = useSuperAgents()
  const agent = agents.find(a => a.id === id)

  const searchParams = new URLSearchParams(location.search)
  const initialTab = searchParams.get('tab') || 'overview'
  const [tab, setTab] = useState(initialTab)
  const [configSubTab, setConfigSubTab] = useState('basic')
  const [toast, setToast] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    if (agent && editMode) {
      setEditForm({
        name: agent.name,
        tags: [...(agent.tags || [])],
        model: agent.model,
        skills: [...agent.skills],
        memoryEnabled: agent.memoryEnabled,
        memorySpace: agent.memorySpace,
        k8sCluster: agent.k8sCluster,
        resourceSpec: agent.resourceSpec || 'standard',
        cpu: agent.cpu,
        memory: agent.memory,
      })
    }
  }, [editMode])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  if (!agent) {
    return (
      <div className="had-not-found">
        <div className="had-not-found-icon">🔍</div>
        <div>Agent 不存在</div>
        <button className="action-btn primary" onClick={() => navigate('/super-agent')}>返回列表</button>
      </div>
    )
  }

  const sc = STATUS_COLORS[agent.status] || STATUS_COLORS['停止']

  const doStatusChange = (newStatus) => {
    if (newStatus === '启动中') {
      dispatch({ type: 'UPDATE', id: agent.id, payload: { status: '启动中' } })
      showToast('启动中...')
      setTimeout(() => {
        dispatch({ type: 'UPDATE', id: agent.id, payload: { status: '运行中' } })
      }, 1500)
    } else if (newStatus === '关闭中') {
      dispatch({ type: 'UPDATE', id: agent.id, payload: { status: '关闭中' } })
      showToast('关闭中...')
      setTimeout(() => {
        dispatch({ type: 'UPDATE', id: agent.id, payload: { status: '停止' } })
      }, 1500)
    } else {
      dispatch({ type: 'UPDATE', id: agent.id, payload: { status: newStatus } })
      showToast(newStatus === '运行中' ? '已启动' : '已停止')
    }
  }

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target
    setEditForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleResourceSpecChange = (id) => {
    if (id === 'custom') return
    const specs = {
      lite: { cpu: 2, memory: 2 },
      standard: { cpu: 4, memory: 4 },
      heavy: { cpu: 8, memory: 8 }
    }
    dispatch({ 
      type: 'UPDATE', 
      id: agent.id, 
      payload: { resourceSpec: id, cpu: specs[id].cpu, memory: specs[id].memory } 
    })
  }

  const handleInlineUpdate = (field, value) => {
    dispatch({ type: 'UPDATE', id: agent.id, payload: { [field]: value } })
    showToast('更新成功')
  }

  const handleMarkdownSave = (fileName, content) => {
    const newFiles = { ...agent.markdownFiles, [fileName]: content }
    dispatch({ type: 'UPDATE', id: agent.id, payload: { markdownFiles: newFiles } })
    showToast('Markdown 已保存')
  }

  const [activeMdFile, setActiveMdFile] = useState('AGENTS.md')
  const [showChannelModal, setShowChannelModal] = useState(false)
  const [channelType, setChannelType] = useState('企业微信')
  const [channelQR, setChannelQR] = useState(null)
  const [channelAuthMode, setChannelAuthMode] = useState('qr') // 'qr' or 'manual'

  const pad = n => String(n).padStart(2, '0');
  const getSnapshotName = () => {
    const d = new Date();
    return `snapshot_${d.getFullYear()}_${pad(d.getMonth() + 1)}_${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  };

  const [showSnapshotModal, setShowSnapshotModal] = useState(false)
  const [snapshotForm, setSnapshotForm] = useState({ name: '', desc: '' })

  const handleAddChannel = () => {
    setShowChannelModal(true)
  }

  const confirmAddChannel = (data) => {
    const newChannel = {
      id: `ch-${Date.now()}`,
      type: channelType,
      name: data.name || channelType,
      status: 'connected'
    }
    dispatch({ 
      type: 'UPDATE', 
      id: agent.id, 
      payload: { channels: [...(agent.channels || []), newChannel] } 
    })
    setShowChannelModal(false)
    showToast('Channel 已连接')
  }

  const [graphGrouping, setGraphGrouping] = useState('hour')

  const toggleEditSkill = (s) => {
    setEditForm(prev => ({
      ...prev,
      skills: prev.skills.includes(s) ? prev.skills.filter(x => x !== s) : [...prev.skills, s]
    }))
  }

  const handleCreateSnapshot = () => {
    setSnapshotForm({ name: getSnapshotName(), desc: '' })
    setShowSnapshotModal(true)
  }

  const confirmCreateSnapshot = () => {
    if (!snapshotForm.name) {
      showToast('快照名称不能为空');
      return;
    }
    const snap = {
      id: `snap-${new Date().getTime()}`,
      name: snapshotForm.name,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      size: (Math.random() * 5 + 1).toFixed(1) + ' MB',
      author: 'admin',
      desc: snapshotForm.desc || '手动创建的快照备份',
      trigger: '手动备份',
      version: agent.version
    }
    dispatch({ type: 'UPDATE', id: agent.id, payload: { snapshots: [snap, ...(agent.snapshots || [])] } })
    showToast('快照创建成功')
    setShowSnapshotModal(false)
  }

  const handleRestoreSnapshot = (snap) => {
    if (window.confirm(`确认要恢复到快照 "${snap.name}" 吗？这会覆盖当前的配置和状态。`)) {
      showToast(`已成功恢复至快照 ${snap.name}`)
    }
  }

  const handleDeleteSnapshot = (snap) => {
    if (window.confirm(`确认删除快照 "${snap.name}" 吗？`)) {
      dispatch({ 
        type: 'UPDATE', 
        id: agent.id, 
        payload: { snapshots: (agent.snapshots || []).filter(s => s.id !== snap.id) } 
      })
      showToast('快照已删除')
    }
  }

  const saveConfig = () => {
    dispatch({
      type: 'UPDATE',
      id: agent.id,
      payload: {
        name: editForm.name,
        description: editForm.description,
        version: editForm.version,
        tags: editForm.tags,
        model: editForm.model,
        skills: editForm.skills,
        memoryEnabled: editForm.memoryEnabled,
        memorySpace: editForm.memorySpace,
        k8sCluster: editForm.k8sCluster,
        resourceSpec: editForm.resourceSpec,
        cpu: Number(editForm.cpu),
        memory: Number(editForm.memory),
      }
    })
    dispatch({
      type: 'ADD_EVENT',
      id: agent.id,
      event: { time: new Date().toISOString().replace('T', ' ').slice(0, 19), action: '更新配置', detail: '用户修改了 Agent 配置并保存' }
    })
    setEditMode(false)
    showToast('配置保存成功')
  }


  const removeTag = (tag) => {
    dispatch({ type: 'UPDATE', id: agent.id, payload: { tags: (agent.tags || []).filter(t => t !== tag) } })
  }

  const handleTabClick = (key) => {
    if (key === 'webui') {
      navigate(`/super-agent/${agent.id}/webui`)
    } else {
      setTab(key)
    }
  }

  return (
    <div className="had-page">
      {/* Header */}
      <div className="create-app-header">
        <button className="back-btn" onClick={() => navigate('/super-agent')}>⬅</button>
        <div className="breadcrumb">
          <span className="bc-item" onClick={() => navigate('/super-agent')}>Super Agent</span>
          <span className="bc-separator"> &gt; </span>
          <span className="bc-current">{agent.name}</span>
        </div>
      </div>

      {/* Overview bar */}
      <div className="had-overview-bar">
        <div className="had-overview-left">
          <div className="had-agent-title">
            <h2>{agent.name}</h2>
            <span className="ha-status-tag" style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}>{agent.status}</span>
            <span className="ha-version-badge">{agent.version}</span>
          </div>
          <div className="had-meta-row">
            <span>ID: {agent.id}</span>
            <span>Owner: admin</span>
            <span>创建: {agent.createdAt}</span>
            {agent.lastRunAt && <span>最近运行: {agent.lastRunAt}</span>}
          </div>
          {/* Tags inline */}
          <div className="had-tags-row">
            <TagSelectModal value={agent.tags || []} onChange={tags => dispatch({ type: 'UPDATE', id: agent.id, payload: { tags } })} />
          </div>
        </div>
        <div className="had-overview-actions">
          {['停止', '启动中'].includes(agent.status) && (
            <button className="action-btn primary" disabled={agent.status === '启动中'} onClick={() => doStatusChange('启动中')}>▶ 启动</button>
          )}
          {['运行中', '关闭中'].includes(agent.status) && (
            <button className="action-btn" disabled={agent.status === '关闭中'} onClick={() => doStatusChange('关闭中')}>⏹ 停止</button>
          )}
          <button className="action-btn" onClick={() => navigate(`/super-agent/${agent.id}/webui`)}>🌐 WebUI</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="had-tabs">
        {TABS.map(t => (
          <div key={t.key} className={`page-tab ${tab === t.key ? 'active' : ''}`} onClick={() => handleTabClick(t.key)}>{t.label}</div>
        ))}
      </div>

      {/* Tab content */}
      <div className="had-tab-content">
        {/* ========== OVERVIEW ========== */}
        {tab === 'overview' && (
          <div className="had-overview-content">
            <div className="had-card-grid">
              <div className="had-card">
                <div className="had-card-label">当前状态</div>
                <div className="had-card-value">
                  <span className="ha-status-tag" style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}>{agent.status}</span>
                </div>
              </div>
              <div className="had-card">
                <div className="had-card-label">版本</div>
                <div className="had-card-value">{agent.version}</div>
              </div>
              <div className="had-card">
                <div className="had-card-label">模型</div>
                <div className="had-card-value">{agent.model || '-'}</div>
              </div>
              <div className="had-card">
                <div className="had-card-label">已选配置</div>
                <div className="had-card-value">{agent.k8sCluster || '-'} | {agent.resourceSpec || 'standard'} | {agent.cpu}C{agent.memory}G</div>
              </div>
              <div className="had-card">
                <div className="had-card-label">Skill</div>
                <div className="had-card-value">{agent.skills.join(', ') || '-'}</div>
              </div>
              <div className="had-card">
                <div className="had-card-label">Memory</div>
                <div className="had-card-value">{agent.memoryEnabled ? `已启用 (${agent.memorySpace})` : '未启用'}</div>
              </div>
            </div>
            {agent.description && (
              <div className="had-section">
                <h4>描述</h4>
                <p>{agent.description}</p>
              </div>
            )}
            
            {/* Observation metrics */}
            <div className="had-section">
              <h4>核心观测指标 (近 24 小时)</h4>
              <div className="had-ob-grid">
                <div className="had-ob-card">
                  <div className="had-ob-title">CPU 使用率</div>
                  <div className="had-ob-val">42% <span>平均</span></div>
                  <div className="had-ob-chart">
                    {[30, 45, 60, 40, 35, 52, 45, 42].map((v, i) => {
                      const hourOffset = (8 - i) * 3;
                      const date = new Date(Date.now() - hourOffset * 3600000);
                      const timeStr = date.toISOString().slice(0, 13).replace('T', ' ') + ':00';
                      return <div key={i} className="had-ob-bar-v" style={{ height: `${v}%` }} data-tooltip={`CPU: ${v}%\n${timeStr}`}></div>;
                    })}
                  </div>
                </div>
                <div className="had-ob-card">
                  <div className="had-ob-title">内存使用率</div>
                  <div className="had-ob-val">68% <span>(2.7G / 4.0G)</span></div>
                  <div className="had-ob-chart">
                    {[65, 66, 68, 68, 67, 68, 69, 68].map((v, i) => {
                      const hourOffset = (8 - i) * 3;
                      const date = new Date(Date.now() - hourOffset * 3600000);
                      const timeStr = date.toISOString().slice(0, 13).replace('T', ' ') + ':00';
                      return <div key={i} className="had-ob-bar-v warning" style={{ height: `${v}%` }} data-tooltip={`内存: ${v}%\n${timeStr}`}></div>;
                    })}
                  </div>
                </div>
                <div className="had-ob-card">
                  <div className="had-ob-title">调用量统计</div>
                  <div className="had-ob-val">12,458 <span>次</span></div>
                  <div className="had-ob-chart">
                    {[20, 60, 40, 80, 100, 75, 40, 30].map((v, i) => {
                      const hourOffset = (8 - i) * 3;
                      const date = new Date(Date.now() - hourOffset * 3600000);
                      const timeStr = date.toISOString().slice(0, 13).replace('T', ' ') + ':00';
                      const count = Math.floor(v * 124.58);
                      return <div key={i} className="had-ob-bar-v primary" style={{ height: `${v}%` }} data-tooltip={`调用: ${count} 次\n${timeStr}`}></div>;
                    })}
                  </div>
                </div>
                <div className="had-ob-card">
                  <div className="had-ob-title">Token 消耗统计</div>
                  <div className="had-ob-val">3.2M <span>Tokens</span></div>
                  <div className="had-ob-chart">
                    {[20, 45, 30, 60, 90, 80, 50, 40].map((v, i) => {
                      const hourOffset = (8 - i) * 3;
                      const date = new Date(Date.now() - hourOffset * 3600000);
                      const timeStr = date.toISOString().slice(0, 13).replace('T', ' ') + ':00';
                      const tokens = (v * 3.2 / 100).toFixed(1) + 'M';
                      return <div key={i} className="had-ob-bar-v purple" style={{ height: `${v}%` }} data-tooltip={`消耗: ${tokens}\n${timeStr}`}></div>;
                    })}
                  </div>
                </div>
              </div>
            </div>
            {agent.status === 'Error' && agent.events.length > 0 && (
              <div className="had-section had-error-summary">
                <h4>⚠️ 最近错误</h4>
                <p>{agent.events.filter(e => e.action === '错误').pop()?.detail || '无'}</p>
              </div>
            )}
          </div>
        )}

        {/* ========== SNAPSHOTS ========== */}
        {tab === 'snapshots' && (
          <div className="had-lifecycle">
            <div className="had-section">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button className="action-btn primary" onClick={handleCreateSnapshot}>+ 创建快照</button>
              </div>
              {!(agent.snapshots || []).length ? (
                <div className="had-empty-hint">暂无历史快照，您可以创建一个新的快照来保存当前状态。</div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '20%' }}>快照名称</th>
                      <th style={{ width: '15%' }}>创建时间</th>
                      <th style={{ width: '15%' }}>环境版本</th>
                      <th style={{ width: '10%' }}>体积</th>
                      <th style={{ width: '10%' }}>触发方式</th>
                      <th style={{ width: '15%' }}>描述</th>
                      <th style={{ width: '15%' }}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(agent.snapshots || []).map(snap => (
                      <tr key={snap.id}>
                        <td>{snap.name}</td>
                        <td style={{ color: '#8c8c8c' }}>{snap.createdAt}</td>
                        <td>{snap.version || agent.version}</td>
                        <td>{snap.size || '未知'}</td>
                        <td>{snap.trigger || '手动'}</td>
                        <td style={{ color: '#595959' }}>{snap.desc || '-'}</td>
                        <td>
                          <div className="ha-row-actions">
                            <button onClick={() => handleRestoreSnapshot(snap)}>恢复</button>
                            <button className="ha-delete-btn" onClick={() => handleDeleteSnapshot(snap)}>删除</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ========== CONFIG (sub-tabs) ========== */}
        {tab === 'config' && (
          <div className="had-config">
            {/* Config sub-tabs navigation */}
            <div className="had-config-subtabs">
              {CONFIG_SUBTABS.map(st => (
                <div key={st.key} className={`had-config-subtab ${configSubTab === st.key ? 'active' : ''}`} onClick={() => setConfigSubTab(st.key)}>
                  {st.label}
                </div>
              ))}
            </div>

            {/* Sub-tab content */}
            <div className="had-config-panel">
              {configSubTab === 'basic' && (
                <div className="had-section">
                  <InlineEditable label="名称" value={agent.name} onChange={v => handleInlineUpdate('name', v)} />
                  <InlineEditable label="描述" value={agent.description} type="textarea" onChange={v => handleInlineUpdate('description', v)} />
                  <InlineEditable label="版本" value={agent.version} type="select" options={VERSIONS.map(v => ({ label: v, value: v }))} onChange={v => handleInlineUpdate('version', v)} />
                  <div className="had-kv inline-editable-kv">
                    <span>标签</span>
                    <div className="ie-val-box">
                      <TagSelectModal value={agent.tags || []} onChange={tags => handleInlineUpdate('tags', tags)} />
                    </div>
                  </div>
                </div>
              )}
              {configSubTab === 'agent' && (
                <div className="had-section">
                  <InlineEditable label="模型" value={agent.model} onChange={v => handleInlineUpdate('model', v)} />
                </div>
              )}
              {configSubTab === 'capabilities' && (
                <div className="had-section">
                  <div className="had-kv">
                    <span>Skill</span>
                    <div style={{ flex: 1 }}>
                      <SkillSelectionModal 
                        value={agent.skills} 
                        onChange={skills => handleInlineUpdate('skills', skills)} 
                      />
                    </div>
                  </div>
                  <div className="had-kv">
                    <span>外置 Memory</span>
                    <div style={{ flex: 1, display: 'flex', gap: 12, alignItems: 'center' }}>
                      <select 
                        value={agent.memoryEnabled ? agent.memorySpace : 'disabled'} 
                        onChange={e => {
                          const v = e.target.value
                          handleInlineUpdate('memoryEnabled', v !== 'disabled')
                          if (v !== 'disabled') handleInlineUpdate('memorySpace', v)
                        }}
                        style={{ padding: '6px 12px', border: '1px solid #d9d9d9', borderRadius: 4 }}
                      >
                        <option value="disabled">未开启</option>
                        <option value="insight-mem-01">insight-mem-01 (Vector)</option>
                        <option value="support-mem-01">support-mem-01 (DGraph)</option>
                        <option value="pipeline-mem-01">pipeline-mem-01 (Elastic)</option>
                      </select>
                      {agent.memoryEnabled && <span className="ha-status-tag" style={{ background: '#f6ffed', color: '#52c41a', border: '1px solid #b7eb8f' }}>连接正常</span>}
                    </div>
                  </div>
                </div>
              )}

              {configSubTab === 'channel' && (
                <div className="had-section">
                  <div className="channel-list">
                    {(agent.channels || []).map(ch => (
                      <div key={ch.id} className="channel-item">
                        <div className="channel-info">
                          <div className="channel-icon">{ch.type === '企业微信' ? '🏢' : ch.type === '飞书' ? '🕊️' : ch.type === '钉钉' ? '📌' : '🔗'}</div>
                          <div>
                            <div style={{ fontWeight: 500 }}>{ch.name}</div>
                            <div style={{ fontSize: 12, color: '#999' }}>{ch.type}</div>
                          </div>
                        </div>
                        <button className="action-btn small" onClick={() => handleInlineUpdate('channels', agent.channels.filter(c => c.id !== ch.id))}>断开</button>
                      </div>
                    ))}
                    <button className="action-btn primary" onClick={handleAddChannel} style={{ marginTop: 8 }}>+ 新增 Channel</button>
                  </div>
                </div>
              )}

              {configSubTab === 'webui' && (
                <div className="had-section">
                  <div className="had-kv">
                    <span>WebUI 地址</span>
                    <div style={{ flex: 1, display: 'flex', gap: 12, alignItems: 'center' }}>
                      <code style={{ background: '#f5f5f5', padding: '4px 8px', borderRadius: 4 }}>{(agent.webuiConfig || {}).url}</code>
                      <button className="action-btn small" onClick={() => { navigator.clipboard.writeText(agent.webuiConfig.url); showToast('已复制到剪贴板') }}>复制</button>
                    </div>
                  </div>
                  <div className="had-kv">
                    <span>访问权限</span>
                    <div style={{ flex: 1 }}>
                      <select 
                        value={(agent.webuiConfig || {}).access} 
                        onChange={e => handleInlineUpdate('webuiConfig', { ...agent.webuiConfig, access: e.target.value })}
                        style={{ padding: '6px 12px', border: '1px solid #d9d9d9', borderRadius: 4 }}
                      >
                        <option value="Owner可见">Owner 可见 (私有)</option>
                        <option value="所有人可见">所有人可见 (公开)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {configSubTab === 'markdown' && (
                <div className="had-markdown-editor">
                  <div className="md-sidebar">
                    {Object.keys(agent.markdownFiles || {}).map(f => (
                      <div key={f} className={`md-file-item ${activeMdFile === f ? 'active' : ''}`} onClick={() => setActiveMdFile(f)}>
                        📄 {f}
                      </div>
                    ))}
                  </div>
                  <div className="md-content-area">
                    <textarea 
                      value={agent.markdownFiles[activeMdFile] || ''} 
                      onChange={e => handleMarkdownSave(activeMdFile, e.target.value)}
                    />
                  </div>
                </div>
              )}

              {configSubTab === 'resources' && (
                <div className="had-section">
                  <InlineEditable 
                    label="K8s 集群" 
                    value={agent.k8sCluster} 
                    type="select" 
                    options={[
                      { label: 'cls-prod-cluster-1', value: 'cls-prod-cluster-1' },
                      { label: 'cls-dev-cluster-2', value: 'cls-dev-cluster-2' }
                    ]} 
                    onChange={v => handleInlineUpdate('k8sCluster', v)} 
                  />
                  <div className="had-kv">
                    <span>资源规格</span>
                    <div className="resource-tier-group" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', flex: 1 }}>
                      {[
                        { id: 'lite', label: 'L', desc: '2C2G' },
                        { id: 'standard', label: 'M', desc: '4C4G' },
                        { id: 'heavy', label: 'H', desc: '8C8G' },
                        { id: 'custom', label: 'C', desc: '自定义' }
                      ].map(tier => (
                        <div 
                          key={tier.id} 
                          className={`resource-tier-card ${agent.resourceSpec === tier.id ? 'active' : ''}`}
                          onClick={() => handleResourceSpecChange(tier.id)}
                          style={{ padding: '8px 12px', minWidth: 60 }}
                        >
                          <div className="rt-label" style={{ fontSize: 14 }}>{tier.label}</div>
                          <div className="rt-desc" style={{ fontSize: 10, opacity: 0.7 }}>{tier.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {agent.resourceSpec === 'custom' && (
                    <>
                      <InlineEditable label="CPU (核)" value={agent.cpu} type="number" onChange={v => handleInlineUpdate('cpu', Number(v))} />
                      <InlineEditable label="内存 (Gi)" value={agent.memory} type="number" onChange={v => handleInlineUpdate('memory', Number(v))} />
                    </>
                  )}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========== CRON JOBS (SCATTER PLOT) ========== */}
        {tab === 'runtime' && (
          <div className="had-runtime">
            <div className="had-section">
              <div className="cron-graph-container">
                <div className="cron-graph-header">
                  <h4 style={{ margin: 0 }}>定时任务执行标点图</h4>
                  <div className="had-config-subtabs" style={{ marginBottom: 0 }}>
                    <div className={`had-config-subtab ${graphGrouping === 'hour' ? 'active' : ''}`} onClick={() => setGraphGrouping('hour')}>24h 分布</div>
                    <div className={`had-config-subtab ${graphGrouping === 'day' ? 'active' : ''}`} onClick={() => setGraphGrouping('day')}>7d 分布</div>
                  </div>
                </div>

                <div className="cron-plot-area">
                  {/* Y Axis Labels */}
                  <div className="cron-y-axis">
                    {['每日简报', '周报汇总', '系统清理'].map(t => <span key={t}>{t}</span>)}
                  </div>
                  
                  {/* X Axis Labels */}
                  <div className="cron-x-axis">
                    {graphGrouping === 'hour' ? (
                      ['00', '04', '08', '12', '16', '20', '23'].map(h => <span key={h}>{h}:00</span>)
                    ) : (
                      ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d}>{d}</span>)
                    )}
                  </div>

                  {/* Scatter Dots */}
                  {(agent.tasks || []).map(t => {
                    const date = new Date(t.timestamp);
                    let left = 0;
                    if (graphGrouping === 'hour') {
                      left = ((date.getHours() * 60 + date.getMinutes()) / (24 * 60)) * 100;
                    } else {
                      left = (date.getDay() / 7) * 100;
                    }
                    
                    const typeIndex = ['每日简报生成', '周报汇总', '系统清理'].indexOf(t.name);
                    const bottom = (typeIndex / 2) * 100; // 3 items, 0, 50, 100
                    
                    return (
                      <div 
                        key={t.id}
                        className="cron-dot"
                        style={{ 
                          left: `${left}%`, 
                          bottom: `${bottom}%`,
                          backgroundColor: t.color,
                          boxShadow: `0 0 4px ${t.color}`
                        }}
                        title={`${t.name} @ ${t.time}`}
                      />
                    );
                  })}
                </div>

                <div className="cron-legend">
                  <div className="legend-item"><div className="legend-color" style={{background: '#1890ff'}} /> 每日简报生成</div>
                  <div className="legend-item"><div className="legend-color" style={{background: '#52c41a'}} /> 周报汇总</div>
                  <div className="legend-item"><div className="legend-color" style={{background: '#faad14'}} /> 系统清理</div>
                </div>
              </div>
            </div>
            
            <div className="had-section">
              <h4>最近任务流水</h4>
              <table className="data-table">
                <thead><tr><th>任务</th><th>状态</th><th>时间</th><th>耗时</th></tr></thead>
                <tbody>
                  {agent.tasks.slice(0, 10).map(t => (
                    <tr key={t.id}>
                      <td>{t.name}</td>
                      <td>
                        <span className="ha-status-tag" style={t.status === 'Success' ? {background:'#f6ffed',color:'#52c41a',borderColor:'#b7eb8f'} : {background:'#fff2f0',color:'#ff4d4f',borderColor:'#ffccc7'}}>
                          {t.status}
                        </span>
                      </td>
                      <td>{t.time}</td>
                      <td>{t.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Channel Modal */}
      {showChannelModal && (
        <div className="ha-modal-overlay">
          <div className="ha-modal" style={{ maxWidth: 540 }}>
            <div className="ha-modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>连接新 Channel</h3>
              <button className="ha-modal-close" onClick={() => { setShowChannelModal(false); setChannelQR(null); setChannelAuthMode('qr'); }}>×</button>
            </div>
            <div className="ha-modal-body" style={{ padding: '24px' }}>
              <div className="ch-type-selector">
                {[
                  { id: '企业微信', icon: '🏢' },
                  { id: '飞书', icon: '🕊️' },
                  { id: '钉钉', icon: '📌' },
                  { id: '自定义', icon: '🔗' }
                ].map(type => (
                  <div 
                    key={type.id}
                    className={`ch-type-btn ${channelType === type.id ? 'active' : ''}`}
                    onClick={() => { setChannelType(type.id); setChannelQR(null); setChannelAuthMode('qr'); }}
                  >
                    <span className="ch-type-icon">{type.icon}</span>
                    <span className="ch-type-label">{type.id}</span>
                  </div>
                ))}
              </div>

              {channelType !== '自定义' ? (
                <div className="ch-auth-config">
                  <div className="ch-auth-tabs">
                    <div className={`ch-auth-tab ${channelAuthMode === 'qr' ? 'active' : ''}`} onClick={() => setChannelAuthMode('qr')}>扫码授权</div>
                    <div className={`ch-auth-tab ${channelAuthMode === 'manual' ? 'active' : ''}`} onClick={() => setChannelAuthMode('manual')}>手动配置</div>
                  </div>
                  
                  <div className="ch-auth-content">
                    {channelAuthMode === 'qr' ? (
                      <div className="ch-qr-mode">
                        {!channelQR ? (
                          <div className="ch-qr-placeholder">
                            <p style={{ color: '#666', marginBottom: 16 }}>请使用管理员账号扫描下方二维码完成 {channelType} 绑定</p>
                            <button className="action-btn primary" onClick={() => setChannelQR(true)}>生成授权二维码</button>
                          </div>
                        ) : (
                          <div className="ch-qr-success">
                            <div className="qr-mock-light">📱<br/>管理员扫码</div>
                            <p style={{ fontSize: 13, color: '#52c41a', margin: '16px 0' }}>扫描成功，正在获取企业信息...</p>
                            <button className="action-btn primary" onClick={() => confirmAddChannel({ name: `${channelType}连接` })}>完成绑定</button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="ch-manual-mode form-container">
                        <div className="form-row">
                          <label>名称 <span className="text-red">*</span></label>
                          <input type="text" id="ch-manual-name" placeholder="例如：外部客服群" />
                        </div>
                        <div className="form-row">
                          <label>App ID <span className="text-red">*</span></label>
                          <input type="text" id="ch-manual-appid" placeholder="输入应用的 App ID" />
                        </div>
                        <div className="form-row">
                          <label>App Secret <span className="text-red">*</span></label>
                          <input type="password" id="ch-manual-secret" placeholder="输入应用的 App Secret" />
                        </div>
                        <div style={{ marginTop: 24, textAlign: 'right' }}>
                          <button className="action-btn primary" onClick={() => confirmAddChannel({ name: document.getElementById('ch-manual-name')?.value || '手动连接' })}>确认连接</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="ch-custom-config form-container" style={{ marginTop: 20 }}>
                  <div className="form-row">
                    <label>连接名称 <span className="text-red">*</span></label>
                    <input type="text" id="ch-custom-name" placeholder="例如：系统监控 Webhook" />
                  </div>
                  <div className="form-row">
                    <label>Webhook URL <span className="text-red">*</span></label>
                    <input type="text" id="ch-custom-url" placeholder="https://api.example.com/webhook..." />
                  </div>
                  <div style={{ marginTop: 24, textAlign: 'right' }}>
                    <button className="action-btn primary" onClick={() => confirmAddChannel({ name: document.getElementById('ch-custom-name')?.value || '自定义Webhook' })}>保存连接</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Snapshot Modal */}
      {showSnapshotModal && (
        <div className="ha-modal-overlay">
          <div className="ha-modal" style={{ maxWidth: 420 }}>
            <div className="ha-modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>创建新快照</h3>
              <button className="ha-modal-close" onClick={() => setShowSnapshotModal(false)}>×</button>
            </div>
            <div className="ha-modal-body form-container" style={{ padding: '24px' }}>
              <div className="form-row">
                <label>快照名称 <span className="text-red">*</span></label>
                <input 
                  type="text" 
                  value={snapshotForm.name} 
                  onChange={e => setSnapshotForm({ ...snapshotForm, name: e.target.value })}
                />
              </div>
              <div className="form-row">
                <label>快照描述</label>
                <textarea 
                  rows={3}
                  value={snapshotForm.desc} 
                  onChange={e => setSnapshotForm({ ...snapshotForm, desc: e.target.value })}
                  placeholder="请输入对此次快照的补充说明..."
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d9d9d9', borderRadius: 6 }}
                />
              </div>
              <div style={{ marginTop: 24, textAlign: 'right' }}>
                <button className="action-btn" onClick={() => setShowSnapshotModal(false)} style={{ marginRight: 12 }}>取消</button>
                <button className="action-btn primary" onClick={confirmCreateSnapshot}>确认创建</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className={`ha-toast ha-toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}
