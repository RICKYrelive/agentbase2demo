import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useHarnessAgents, canTransition, HARNESS_TYPES, IM_TYPES, SKILL_OPTIONS } from '../store/harnessAgentStore.jsx'
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
  { key: 'experience', label: '体验入口' },
]

export default function HarnessAgentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { agents, dispatch } = useHarnessAgents()
  const agent = agents.find(a => a.id === id)

  // Parse tab from query
  const searchParams = new URLSearchParams(location.search)
  const initialTab = searchParams.get('tab') || 'overview'
  const [tab, setTab] = useState(initialTab)
  const [toast, setToast] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [testModal, setTestModal] = useState(false)
  const [testInput, setTestInput] = useState('')
  const [testResult, setTestResult] = useState(null)

  useEffect(() => {
    if (agent && editMode) {
      setEditForm({
        name: agent.name,
        description: agent.description,
        harnessType: agent.harnessType,
        model: agent.model,
        prompt: agent.prompt,
        endpoint: agent.endpoint,
        concurrency: agent.concurrency,
        timeout: agent.timeout,
        retry: agent.retry,
        skills: [...agent.skills],
        memoryEnabled: agent.memoryEnabled,
        memorySpace: agent.memorySpace,
        imType: agent.imType,
        imWebhookUrl: agent.imConfig?.webhookUrl || '',
        k8sCluster: agent.k8sCluster,
        replicasMode: agent.replicasMode,
        replicas: agent.replicas,
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
        harnessType: editForm.harnessType,
        model: editForm.model,
        prompt: editForm.prompt,
        endpoint: editForm.endpoint,
        concurrency: Number(editForm.concurrency),
        timeout: Number(editForm.timeout),
        retry: Number(editForm.retry),
        skills: editForm.skills,
        memoryEnabled: editForm.memoryEnabled,
        memorySpace: editForm.memorySpace,
        imType: editForm.imType,
        imConfig: { webhookUrl: editForm.imWebhookUrl },
        k8sCluster: editForm.k8sCluster,
        replicasMode: editForm.replicasMode,
        replicas: Number(editForm.replicas),
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

  const runTestTask = () => {
    if (!testInput.trim()) return
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
    const result = `[Mock 回复] 基于 ${agent.harnessType}/${agent.model} 的响应：\n\n针对您的请求 "${testInput}"，Agent 已完成处理。以下是生成的结果摘要：\n\n1. 已分析输入内容并提取关键信息\n2. 调用了 ${agent.skills.slice(0, 2).join('、')} 等 Skill\n3. 任务执行耗时约 ${Math.floor(Math.random() * 30 + 5)} 秒`
    setTestResult(result)
    dispatch({
      type: 'ADD_TASK',
      id: agent.id,
      task: { id: `t-${Date.now()}`, name: `测试任务: ${testInput.slice(0, 20)}`, status: 'Success', time: now, duration: `${Math.floor(Math.random() * 30 + 5)}s` }
    })
    showToast('测试任务已完成')
  }

  // ===================== RENDER =====================
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
            <span className="ha-type-badge">{agent.harnessType}</span>
          </div>
          <div className="had-meta-row">
            <span>ID: {agent.id}</span>
            <span>Owner: {agent.owner}</span>
            <span>空间: {agent.workspace}</span>
            <span>创建: {agent.createdAt}</span>
            {agent.lastRunAt && <span>最近运行: {agent.lastRunAt}</span>}
          </div>
        </div>
        <div className="had-overview-actions">
          {canTransition(agent.status, 'Running') && <button className="action-btn primary" onClick={() => doStatusChange('Running')}>▶ 启动</button>}
          {canTransition(agent.status, 'Paused') && <button className="action-btn" onClick={() => doStatusChange('Paused')}>⏸ 暂停</button>}
          {canTransition(agent.status, 'Stopped') && <button className="action-btn" onClick={() => doStatusChange('Stopped')}>⏹ 停止</button>}
          <button className="action-btn" onClick={() => setTab('experience')}>🚀 进入体验</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="had-tabs">
        {TABS.map(t => (
          <div key={t.key} className={`page-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</div>
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
                <div className="had-card-label">Harness 类型</div>
                <div className="had-card-value">{agent.harnessType}</div>
              </div>
              <div className="had-card">
                <div className="had-card-label">模型</div>
                <div className="had-card-value">{agent.model || '-'}</div>
              </div>
              <div className="had-card">
                <div className="had-card-label">并发 / 超时 / 重试</div>
                <div className="had-card-value">{agent.concurrency} / {agent.timeout}s / {agent.retry}</div>
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

        {/* ========== CONFIG ========== */}
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

            {!editMode ? (
              /* Read-only view */
              <div className="had-config-view">
                <div className="had-section">
                  <h4>基本信息</h4>
                  <div className="had-kv"><span>名称</span><span>{agent.name}</span></div>
                  <div className="had-kv"><span>描述</span><span>{agent.description || '-'}</span></div>
                  <div className="had-kv"><span>Harness 类型</span><span>{agent.harnessType}</span></div>
                  <div className="had-kv"><span>标签</span><span>{(agent.tags || []).join(', ') || '-'}</span></div>
                </div>
                <div className="had-section">
                  <h4>Harness 配置</h4>
                  <div className="had-kv"><span>运行入口</span><span>{agent.endpoint || '-'}</span></div>
                  <div className="had-kv"><span>模型</span><span>{agent.model || '-'}</span></div>
                  <div className="had-kv"><span>System Prompt</span><span className="had-kv-pre">{agent.prompt || '-'}</span></div>
                  <div className="had-kv"><span>并发 / 超时 / 重试</span><span>{agent.concurrency} / {agent.timeout}s / {agent.retry}次</span></div>
                </div>
                <div className="had-section">
                  <h4>基础能力</h4>
                  <div className="had-kv"><span>Skill</span><span>{agent.skills.join(', ') || '-'}</span></div>
                  <div className="had-kv"><span>Memory</span><span>{agent.memoryEnabled ? `${agent.memorySpace}` : '未启用'}</span></div>
                  <div className="had-kv"><span>IM</span><span>{agent.imType || '-'}</span></div>
                </div>
                <div className="had-section">
                  <h4>资源与部署</h4>
                  <div className="had-kv"><span>K8s 集群</span><span>{agent.k8sCluster || '-'}</span></div>
                  <div className="had-kv"><span>副本</span><span>{agent.replicasMode === 'fixed' ? '固定' : '弹性'} × {agent.replicas}</span></div>
                  <div className="had-kv"><span>CPU / 内存</span><span>{agent.cpu} 核 / {agent.memory} Gi</span></div>
                </div>
              </div>
            ) : (
              /* Edit form */
              <div className="had-config-edit">
                <div className="had-section">
                  <h4>基本信息</h4>
                  <div className="form-row"><label>名称：</label><input type="text" name="name" value={editForm.name} onChange={handleEditChange} /></div>
                  <div className="form-row align-start"><label>描述：</label><textarea name="description" value={editForm.description} onChange={handleEditChange} /></div>
                  <div className="form-row"><label>Harness 类型：</label>
                    <select name="harnessType" value={editForm.harnessType} onChange={handleEditChange}>
                      {HARNESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="had-section">
                  <h4>Harness 配置</h4>
                  <div className="form-row"><label>运行入口：</label><input type="text" name="endpoint" value={editForm.endpoint} onChange={handleEditChange} /></div>
                  <div className="form-row"><label>模型：</label><input type="text" name="model" value={editForm.model} onChange={handleEditChange} /></div>
                  <div className="form-row align-start"><label>System Prompt：</label><textarea name="prompt" value={editForm.prompt} onChange={handleEditChange} style={{height:100}} /></div>
                  <div className="form-row"><label>并发数：</label><div className="number-input-group"><input type="number" name="concurrency" value={editForm.concurrency} onChange={handleEditChange} /></div></div>
                  <div className="form-row"><label>超时时间：</label><div className="number-input-group"><input type="number" name="timeout" value={editForm.timeout} onChange={handleEditChange} /><span className="unit">秒</span></div></div>
                  <div className="form-row"><label>重试次数：</label><div className="number-input-group"><input type="number" name="retry" value={editForm.retry} onChange={handleEditChange} /><span className="unit">次</span></div></div>
                </div>
                <div className="had-section">
                  <h4>基础能力</h4>
                  <div className="form-row align-start"><label>Skill：</label>
                    <div className="cha-skill-tags">
                      {SKILL_OPTIONS.map(s => (
                        <span key={s} className={`cha-skill-tag ${editForm.skills.includes(s) ? 'selected' : ''}`} onClick={() => toggleEditSkill(s)}>{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="form-row"><label>Memory：</label><label className="checkbox-label"><input type="checkbox" name="memoryEnabled" checked={editForm.memoryEnabled} onChange={handleEditChange} /> 启用</label></div>
                  {editForm.memoryEnabled && <div className="form-row"><label>Memory 空间：</label><select name="memorySpace" value={editForm.memorySpace} onChange={handleEditChange}><option value="">请选择</option><option value="insight-mem-01">insight-mem-01</option><option value="support-mem-01">support-mem-01</option><option value="pipeline-mem-01">pipeline-mem-01</option></select></div>}
                  <div className="form-row"><label>IM 类型：</label><select name="imType" value={editForm.imType} onChange={handleEditChange}><option value="">请选择</option>{IM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                  {editForm.imType && <div className="form-row"><label>Webhook：</label><input type="text" name="imWebhookUrl" value={editForm.imWebhookUrl} onChange={handleEditChange} /></div>}
                </div>
                <div className="had-section">
                  <h4>资源与部署</h4>
                  <div className="form-row"><label>K8s 集群：</label><select name="k8sCluster" value={editForm.k8sCluster} onChange={handleEditChange}><option value="">请选择</option><option value="cls-prod-cluster-1">cls-prod-cluster-1</option><option value="cls-dev-cluster-2">cls-dev-cluster-2</option></select></div>
                  <div className="form-row"><label>副本数：</label><div className="number-input-group"><input type="number" name="replicas" value={editForm.replicas} onChange={handleEditChange} /><span className="unit">个</span></div></div>
                  <div className="form-row"><label>CPU：</label><div className="number-input-group"><input type="number" name="cpu" value={editForm.cpu} onChange={handleEditChange} /><span className="unit">核</span></div></div>
                  <div className="form-row"><label>内存：</label><div className="number-input-group"><input type="number" name="memory" value={editForm.memory} onChange={handleEditChange} /><span className="unit">Gi</span></div></div>
                </div>
              </div>
            )}
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

        {/* ========== EXPERIENCE ========== */}
        {tab === 'experience' && (
          <div className="had-experience">
            <div className="had-exp-cards">
              <div className="had-exp-card" onClick={() => {
                window.open(`about:blank#agent-webui-${agent.id}`, '_blank')
                showToast('已打开 Agent WebUI（Mock）', 'info')
              }}>
                <div className="had-exp-card-icon">🌐</div>
                <div className="had-exp-card-title">打开 Agent WebUI</div>
                <div className="had-exp-card-desc">在新窗口中打开 Agent 的 Web 交互界面</div>
              </div>

              <div className="had-exp-card" onClick={() => { setTestModal(true); setTestInput(''); setTestResult(null) }}>
                <div className="had-exp-card-icon">🧪</div>
                <div className="had-exp-card-title">发起测试任务</div>
                <div className="had-exp-card-desc">输入一段指令，立即测试 Agent 的响应能力</div>
              </div>

              <div className="had-exp-card" onClick={() => showToast('会话列表功能开发中', 'info')}>
                <div className="had-exp-card-icon">💬</div>
                <div className="had-exp-card-title">查看最近会话</div>
                <div className="had-exp-card-desc">浏览 Agent 的历史交互会话记录</div>
              </div>

              <div className="had-exp-card" onClick={() => {
                const url = agent.endpoint || `http://${agent.name}.${agent.workspace}.svc.cluster.local:8080`
                navigator.clipboard?.writeText(url)
                showToast(`已复制地址: ${url}`)
              }}>
                <div className="had-exp-card-icon">🔗</div>
                <div className="had-exp-card-title">复制访问地址</div>
                <div className="had-exp-card-desc">复制 Agent 的 Endpoint / API 地址</div>
              </div>
            </div>

            {/* Test result */}
            {testResult && (
              <div className="had-section had-test-result">
                <h4>最近一次测试任务结果</h4>
                <pre>{testResult}</pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Test task modal */}
      {testModal && (
        <div className="modal-overlay" onClick={() => setTestModal(false)}>
          <div className="had-test-modal" onClick={e => e.stopPropagation()}>
            <h3>发起测试任务</h3>
            <p className="had-hint">向 <strong>{agent.name}</strong> ({agent.harnessType}) 发送一条测试指令</p>
            <textarea
              className="had-test-input"
              value={testInput}
              onChange={e => setTestInput(e.target.value)}
              placeholder="请输入测试指令，例如：帮我总结今天的新闻"
            />
            <div className="had-test-modal-actions">
              <button className="action-btn primary" onClick={() => { runTestTask(); setTestModal(false) }} disabled={!testInput.trim()}>发送</button>
              <button className="action-btn" onClick={() => setTestModal(false)}>取消</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className={`ha-toast ha-toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}
