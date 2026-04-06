import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useHarnessAgents, canTransition, VERSIONS, IM_TYPES, SKILL_OPTIONS } from '../store/harnessAgentStore.jsx'
import TagSelectModal from '../components/TagSelectModal'
import SkillSelectionModal from '../components/SkillSelectionModal'
import './HarnessAgentDetail.css'

const STATUS_COLORS = {
  Draft:   { bg: '#e6f4ff', color: '#1677ff', border: '#91caff' },
  Running: { bg: '#f6ffed', color: '#52c41a', border: '#b7eb8f' },
  Paused:  { bg: '#fffbe6', color: '#d48806', border: '#ffe58f' },
  Stopped: { bg: '#f5f5f5', color: '#8c8c8c', border: '#d9d9d9' },
  Error:   { bg: '#fff2f0', color: '#ff4d4f', border: '#ffccc7' },
}

const TABS = [
  { key: 'overview', label: '概览' },
  { key: 'lifecycle', label: '生命周期' },
  { key: 'config', label: '配置' },
  { key: 'runtime', label: '运行情况' },
  { key: 'webui', label: 'WebUI' },
]

const CONFIG_SUBTABS = [
  { key: 'basic', label: '基本信息' },
  { key: 'agent', label: 'Agent 配置' },
  { key: 'capabilities', label: '基础能力' },
  { key: 'resources', label: '资源与部署' },
]

export default function HarnessAgentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { agents, dispatch } = useHarnessAgents()
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
        <button className="action-btn primary" onClick={() => navigate('/harness-agent')}>返回列表</button>
      </div>
    )
  }

  const sc = STATUS_COLORS[agent.status] || STATUS_COLORS.Draft

  const doStatusChange = (newStatus) => {
    if (canTransition(agent.status, newStatus)) {
      dispatch({ type: 'CHANGE_STATUS', id: agent.id, newStatus })
      const labels = { Running: '启动', Paused: '暂停', Stopped: '停止' }
      showToast(`Agent 已${labels[newStatus] || newStatus}`)
    }
  }

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target
    setEditForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleResourceSpecChange = (spec) => {
    const specs = {
      lite: { cpu: 2, memory: 2 },
      standard: { cpu: 4, memory: 4 },
      heavy: { cpu: 8, memory: 8 },
      custom: { cpu: editForm.cpu, memory: editForm.memory }
    }
    setEditForm(prev => ({ ...prev, resourceSpec: spec, cpu: specs[spec].cpu, memory: specs[spec].memory }))
  }

  const toggleEditSkill = (s) => {
    setEditForm(prev => ({
      ...prev,
      skills: prev.skills.includes(s) ? prev.skills.filter(x => x !== s) : [...prev.skills, s]
    }))
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
      navigate(`/harness-agent/${agent.id}/webui`)
    } else {
      setTab(key)
    }
  }

  return (
    <div className="had-page">
      {/* Header */}
      <div className="create-app-header">
        <button className="back-btn" onClick={() => navigate('/harness-agent')}>⬅</button>
        <div className="breadcrumb">
          <span className="bc-item" onClick={() => navigate('/harness-agent')}>Harness Agent</span>
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
          {canTransition(agent.status, 'Running') && <button className="action-btn primary" onClick={() => doStatusChange('Running')}>▶ 启动</button>}
          {canTransition(agent.status, 'Paused') && <button className="action-btn" onClick={() => doStatusChange('Paused')}>⏸ 暂停</button>}
          {canTransition(agent.status, 'Stopped') && <button className="action-btn" onClick={() => doStatusChange('Stopped')}>⏹ 停止</button>}
          <button className="action-btn" onClick={() => navigate(`/harness-agent/${agent.id}/webui`)}>🌐 WebUI</button>
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
            {agent.status === 'Error' && agent.events.length > 0 && (
              <div className="had-section had-error-summary">
                <h4>⚠️ 最近错误</h4>
                <p>{agent.events.filter(e => e.action === '错误').pop()?.detail || '无'}</p>
              </div>
            )}
          </div>
        )}

        {/* ========== LIFECYCLE ========== */}
        {tab === 'lifecycle' && (
          <div className="had-lifecycle">
            <div className="had-section">
              <h4>状态操作</h4>
              <p className="had-hint">当前状态：<span className="ha-status-tag" style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}>{agent.status}</span></p>
              <div className="had-lifecycle-btns">
                <button className="action-btn primary" disabled={!canTransition(agent.status, 'Running')} onClick={() => doStatusChange('Running')}>▶ 启动</button>
                <button className="action-btn" disabled={!canTransition(agent.status, 'Paused')} onClick={() => doStatusChange('Paused')}>⏸ 暂停</button>
                <button className="action-btn" disabled={!canTransition(agent.status, 'Stopped')} onClick={() => doStatusChange('Stopped')}>⏹ 停止</button>
              </div>
            </div>
            <div className="had-section">
              <h4>高级操作</h4>
              <div className="had-lifecycle-btns">
                <button className="action-btn" onClick={() => showToast('快照功能暂未开放', 'info')}>📸 快照</button>
                <button className="action-btn" onClick={() => showToast('克隆功能暂未开放', 'info')}>📋 克隆</button>
                <button className="action-btn" onClick={() => showToast('迁移功能暂未开放', 'info')}>🚚 迁移</button>
              </div>
            </div>
          </div>
        )}

        {/* ========== CONFIG (sub-tabs) ========== */}
        {tab === 'config' && (
          <div className="had-config">
            <div className="had-config-toolbar">
              {!editMode ? (
                <button className="action-btn primary" onClick={() => setEditMode(true)}>✏️ 编辑配置</button>
              ) : (
                <>
                  <button className="action-btn primary" onClick={saveConfig}>💾 保存</button>
                  <button className="action-btn" onClick={() => setEditMode(false)}>取消</button>
                </>
              )}
            </div>

            {/* Config sub-tabs */}
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
                !editMode ? (
                  <div className="had-section">
                    <div className="had-kv"><span>名称</span><span>{agent.name}</span></div>
                    <div className="had-kv"><span>描述</span><span>{agent.description || '-'}</span></div>
                    <div className="had-kv"><span>版本</span><span>{agent.version}</span></div>
                    <div className="had-kv"><span>标签</span><span>{(agent.tags || []).join(', ') || '-'}</span></div>
                  </div>
                ) : (
                  <div className="had-section">
                    <div className="form-row"><label>名称：</label><input type="text" name="name" value={editForm.name} onChange={handleEditChange} /></div>
                    <div className="form-row align-start"><label>描述：</label><textarea name="description" value={editForm.description} onChange={handleEditChange} /></div>
                    <div className="form-row"><label>版本：</label>
                      <select name="version" value={editForm.version} onChange={handleEditChange}>
                        {VERSIONS.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                  </div>
                )
              )}
              {configSubTab === 'agent' && (
                !editMode ? (
                  <div className="had-section">
                    <div className="had-kv"><span>模型</span><span>{agent.model || '-'}</span></div>
                  </div>
                ) : (
                  <div className="had-section">
                    <div className="form-row"><label>模型：</label><input type="text" name="model" value={editForm.model} onChange={handleEditChange} /></div>
                  </div>
                )
              )}
              {configSubTab === 'capabilities' && (
                !editMode ? (
                  <div className="had-section">
                    <div className="had-kv"><span>Skill</span><span>{agent.skills.join(', ') || '-'}</span></div>
                    <div className="had-kv"><span>Memory</span><span>{agent.memoryEnabled ? `${agent.memorySpace}` : '未启用'}</span></div>
                  </div>
                ) : (
                  <div className="had-section">
                    <div className="form-row align-start"><label>Skill：</label>
                      <div style={{flex: 1}}>
                        <SkillSelectionModal value={editForm.skills} onChange={skills => setEditForm(prev => ({...prev, skills}))} />
                      </div>
                    </div>
                    <div className="form-row"><label>Memory：</label><label className="checkbox-label"><input type="checkbox" name="memoryEnabled" checked={editForm.memoryEnabled} onChange={handleEditChange} /> 启用</label></div>
                    {editForm.memoryEnabled && <div className="form-row"><label>Memory 空间：</label><select name="memorySpace" value={editForm.memorySpace} onChange={handleEditChange}><option value="">请选择</option><option value="insight-mem-01">insight-mem-01</option><option value="support-mem-01">support-mem-01</option><option value="pipeline-mem-01">pipeline-mem-01</option></select></div>}
                  </div>
                )
              )}
              {configSubTab === 'resources' && (
                !editMode ? (
                  <div className="had-section">
                    <div className="had-kv"><span>K8s 集群</span><span>{agent.k8sCluster || '-'}</span></div>
                    <div className="had-kv"><span>资源规格</span><span>{agent.resourceSpec || 'standard'} ({agent.cpu} 核 / {agent.memory} Gi)</span></div>
                  </div>
                ) : (
                  <div className="had-section">
                    <div className="form-row"><label>K8s 集群：</label><select name="k8sCluster" value={editForm.k8sCluster} onChange={handleEditChange}><option value="">请选择</option><option value="cls-prod-cluster-1">cls-prod-cluster-1</option><option value="cls-dev-cluster-2">cls-dev-cluster-2</option></select></div>
                    
                    <div className="form-row align-start">
                      <label>资源规格：</label>
                      <div className="resource-tier-group" style={{display:'flex', gap:16, flexWrap:'wrap', flex: 1}}>
                        {[
                          {id: 'lite', label: '轻量级', desc: '2C2G'},
                          {id: 'standard', label: '标准级', desc: '4C4G'},
                          {id: 'heavy', label: '重量级', desc: '8C8G'},
                          {id: 'custom', label: '自定义', desc: '手动配置'}
                        ].map(tier => (
                          <div 
                            key={tier.id} 
                            className={`resource-tier-card ${editForm.resourceSpec === tier.id ? 'active' : ''}`}
                            onClick={() => handleResourceSpecChange(tier.id)}
                          >
                            <div className="rt-label">{tier.label}</div>
                            <div className="rt-desc">{tier.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {editForm.resourceSpec === 'custom' && (
                      <>
                        <div className="form-row"><label>CPU：</label><div className="number-input-group"><input type="number" name="cpu" value={editForm.cpu} onChange={handleEditChange} /><span className="unit">核</span></div></div>
                        <div className="form-row"><label>内存：</label><div className="number-input-group"><input type="number" name="memory" value={editForm.memory} onChange={handleEditChange} /><span className="unit">Gi</span></div></div>
                      </>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* ========== RUNTIME ========== */}
        {tab === 'runtime' && (
          <div className="had-runtime">
            <div className="had-section">
              <h4>最近任务</h4>
              {agent.tasks.length === 0 ? (
                <div className="had-empty-hint">暂无任务记录</div>
              ) : (
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
              )}
            </div>
            <div className="had-section">
              <h4>事件时间线</h4>
              <div className="had-timeline">
                {[...agent.events].reverse().map((evt, i) => (
                  <div key={i} className="had-timeline-item">
                    <div className="had-timeline-dot" />
                    <div className="had-timeline-content">
                      <div className="had-timeline-action">{evt.action}</div>
                      <div className="had-timeline-detail">{evt.detail}</div>
                      <div className="had-timeline-time">{evt.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && <div className={`ha-toast ha-toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}
