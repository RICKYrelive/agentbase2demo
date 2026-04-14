import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useSuperAgents, VERSIONS, IM_TYPES } from '../store/superAgentStore.jsx'
import TagSelectModal from '../components/TagSelectModal'
import SkillSelectionModal from '../components/SkillSelectionModal'
import { 
  IconEdit, IconSearch, IconArrowLeft, IconPlay, 
  IconSquare, IconGlobe, IconAlertTriangle, IconCheck,
  IconTrash, IconDownload, IconClock, IconCalendar,
  IconPlus, IconX, IconTerminal, IconSettings,
  IconPackage, IconChevronRight, IconMoreHorizontal,
  IconLink, IconSparkles, IconInfo, IconMonitor
} from '../components/Icons'
import './SuperAgentDetail.css'

const STATUS_COLORS = {
  '运行中': { bg: '#f6ffed', color: '#52c41a', border: '#b7eb8f' },
  '启动中': { bg: '#e6f7ff', color: '#1890ff', border: '#91d5ff' },
  '关闭中': { bg: '#fff2e8', color: '#fa8c16', border: '#ffd8bf' },
  '停止': { bg: '#f5f5f5', color: '#595959', border: '#d9d9d9' },
}

const MOCK_MODEL_ROUTES = [
  { id: 'mr-1', name: 'AgentBase-HighCode-GPT-4o', strategy: '聚合路由-优先级调度', type: '文本生成' },
  { id: 'mr-2', name: 'smart-route-dev', strategy: '语义路由-成本优先', type: '文本生成' },
  { id: 'mr-3', name: '生产专用-Qwen高级模型', strategy: '聚合路由-轮询调度', type: '文本生成' },
  { id: 'mr-4', name: 'AgentBase-HighCode-Embed', strategy: '聚合路由-优先级调度', type: 'Embedding' },
  { id: 'mr-5', name: 'pinchbench测试裁判模型', strategy: '聚合路由-轮询调度', type: '文本生成' },
]

const TABS = [
  { key: 'overview', label: '概览' },
  { key: 'snapshots', label: '快照' },
  { key: 'config', label: '配置' },
  { key: 'runtime', label: '定时任务' },
  { key: 'system', label: '系统' },
]

const CONFIG_SUBTABS = [
  { key: 'basic', label: '基础信息' },
  { key: 'agent', label: '模型配置' },
  { key: 'capabilities', label: '基础能力' },
  { key: 'channel', label: '连接管理' },
  { key: 'webui', label: 'WebUI 配置' },
  { key: 'markdown', label: 'Agent Markdown' },
]

function InlineEditable({ label, value, type = 'text', options = [], onChange, renderValue, noButtons = false, refreshTrigger, onEditStart }) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempVal, setTempVal] = useState(value)

  // Exit edit mode ONLY if refreshTrigger changes
  useEffect(() => {
    setIsEditing(false)
    setTempVal(value)
  }, [refreshTrigger])

  const handleSave = () => {
    onChange(tempVal)
    setIsEditing(false)
  }

  const handleChange = (val) => {
    setTempVal(val)
    if (noButtons) {
      onChange(val)
    }
  }

  const startEditing = () => {
    setTempVal(value)
    setIsEditing(true)
    if (onEditStart) onEditStart()
  }

  if (!isEditing) {
    return (
      <div className="had-kv inline-editable-kv" onClick={startEditing}>
        <span>{label}</span>
        <div className="ie-val-box">
          {renderValue ? renderValue(value) : (value || '-')}
          <span className="ie-hint" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconEdit size={12} /> 编辑</span>
        </div>
      </div>
    )
  }

  return (
    <div className="had-kv inline-editing-kv" style={{ alignItems: 'flex-start' }}>
      <span style={{ marginTop: 8 }}>{label}</span>
      <div className="ie-input-wrap">
        {type === 'textarea' ? (
          <textarea 
            value={tempVal} 
            onChange={e => handleChange(e.target.value)} 
            autoFocus 
            style={{ width: '100%', minHeight: 60, padding: 8, border: '1px solid #d9d9d9', borderRadius: 4, resize: 'vertical' }} 
          />
        ) : type === 'select' ? (
          <select 
            value={tempVal} 
            onChange={e => handleChange(e.target.value)} 
            autoFocus 
            style={{ padding: '6px 12px', border: '1px solid #d9d9d9', borderRadius: 4 }}
          >
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : (
          <input 
            type={type} 
            value={tempVal} 
            onChange={e => handleChange(e.target.value)} 
            autoFocus
            style={{ padding: '6px 12px', border: '1px solid #d9d9d9', borderRadius: 4, width: '100%' }} 
          />
        )}
        {!noButtons && (
          <div className="ie-actions" style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <button className="action-btn primary small" onClick={handleSave}>保存</button>
            <button className="action-btn small" onClick={() => setIsEditing(false)}>取消</button>
          </div>
        )}
      </div>
    </div>
  )
}

function SuperAgentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { agents, dispatch } = useSuperAgents()
  const agent = agents.find(a => a.id === id)

  const searchParams = new URLSearchParams(location.search)
  const initialTab = searchParams.get('tab') || 'overview'
  const initialSubTab = searchParams.get('sub') || 'basic'
  const [tab, setTab] = useState(initialTab)
  const [configSubTab, setConfigSubTab] = useState(initialSubTab)
  const [toast, setToast] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [backupDraft, setBackupDraft] = useState(null)
  const [modelDraft, setModelDraft] = useState(null)
  const [showModelRouteModal, setShowModelRouteModal] = useState(false)
  const [showProviderModal, setShowProviderModal] = useState(false)
  const [showModelsModal, setShowModelsModal] = useState(false)
  const [selectedRouteId, setSelectedRouteId] = useState(null)
  const [tempProvider, setTempProvider] = useState(null)
  const [tempModels, setTempModels] = useState(null)
  const [basicDraft, setBasicDraft] = useState(null)
  const [basicEditNonce, setBasicEditNonce] = useState(0)
  const [isBasicEditing, setIsBasicEditing] = useState(false)
  const [systemOnline, setSystemOnline] = useState(true)
  const [showTerminal, setShowTerminal] = useState(false)
  const [terminalLogs, setTerminalLogs] = useState([])
  // Legacy modal state removed

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

  useEffect(() => {
    if (agent && tab === 'snapshots') {
      setBackupDraft({
        enabled: agent.autoBackupEnabled,
        interval: agent.autoBackupInterval,
        unit: agent.autoBackupUnit,
        retention: agent.autoBackupRetention
      })
    }
  }, [tab, agent.autoBackupEnabled, agent.autoBackupInterval, agent.autoBackupUnit, agent.autoBackupRetention])

  useEffect(() => {
    if (agent && configSubTab === 'agent') {
      setModelDraft({
        source: agent.modelSource || 'platform',
        routes: agent.modelRoutes || [],
        customProviders: agent.customProviders || [],
        defaultModelConfig: agent.defaultModelConfig ? JSON.parse(JSON.stringify(agent.defaultModelConfig)) : {
          chat: { mainId: '', fallbacks: [] },
          vision: { mainId: '', fallbacks: [] },
          imageGen: { mainId: '', fallbacks: [] }
        }
      })
    }
  }, [configSubTab, agent.modelSource, agent.modelRoutes, agent.customProviders, agent.defaultModelConfig])

  useEffect(() => {
    if (agent && configSubTab === 'basic') {
      setBasicDraft({
        name: agent.name,
        description: agent.description,
        tags: [...(agent.tags || [])]
      })
    }
  }, [configSubTab, agent.name, agent.description, agent.tags])

  const updateAgentModel = (fields) => {
    dispatch({
      type: 'UPDATE',
      id: agent.id,
      payload: fields
    })
  }

  const isBasicDirty = basicDraft && (
    basicDraft.name !== agent.name ||
    basicDraft.description !== agent.description ||
    JSON.stringify(basicDraft.tags) !== JSON.stringify(agent.tags || [])
  )

  const showBasicActions = isBasicDirty || isBasicEditing

  const handleBasicSave = () => {
    dispatch({
      type: 'UPDATE',
      id: agent.id,
      payload: {
        name: basicDraft.name,
        description: basicDraft.description,
        tags: basicDraft.tags
      }
    })
    showToast('基础信息已更新')
    setBasicEditNonce(n => n + 1)
    setIsBasicEditing(false)
  }

  const handleBasicCancel = () => {
    setBasicDraft({
      name: agent.name,
      description: agent.description,
      tags: [...(agent.tags || [])]
    })
    setBasicEditNonce(n => n + 1)
    setIsBasicEditing(false)
  }

  const handleOpenProviderModal = (provider = null) => {
    if (provider) {
      setTempProvider({ ...provider, models: [...provider.models] })
    } else {
      setTempProvider({
        id: `cp-${Date.now()}`,
        name: '新模型服务商',
        baseUrl: '',
        apiKey: '',
        models: []
      })
    }
    setShowProviderModal(true)
  }

  const handleSaveProviderModal = () => {
    const nextProviders = modelDraft.customProviders.find(p => p.id === tempProvider.id)
      ? modelDraft.customProviders.map(p => p.id === tempProvider.id ? tempProvider : p)
      : [...modelDraft.customProviders, tempProvider]
    
    updateAgentModel({ customProviders: nextProviders })
    setShowProviderModal(false)
    setTempProvider(null)
  }

  const getAllAvailableModels = () => {
    if (!modelDraft) return []
    const pool = []
    
    // Platform Routes
    modelDraft.routes.forEach(r => {
      pool.push({
        id: `platform:${r.name}`,
        name: r.name,
        source: '平台路由',
        type: r.type,
        strategy: r.strategy
      })
    })
    
    // Custom Providers
    modelDraft.customProviders.forEach(p => {
      (p.models || []).forEach(m => {
        pool.push({
          id: `custom:${p.id}:${m.id}`,
          name: m.name,
          modelId: m.id,
          source: `自定义 (${p.name})`,
          providerName: p.name,
          input: m.input,
          output: m.output
        })
      })
    })
    
    return pool
  }

  const handleUpdateDefaultModel = (category, config) => {
    const newDraft = {
      ...modelDraft,
      defaultModelConfig: {
        ...modelDraft.defaultModelConfig,
        [category]: config
      }
    }
    setModelDraft(newDraft)
    
    // Atomic update to store
    dispatch({
      type: 'UPDATE',
      id: agent.id,
      payload: { defaultModelConfig: newDraft.defaultModelConfig }
    })
    
    showToast('默认模型状态已更新')
  }

  const handleOpenModelsModal = () => {
    setTempModels([...tempProvider.models])
    setShowModelsModal(true)
  }

  const handleSaveModelsModal = () => {
    setTempProvider(prev => ({ ...prev, models: tempModels }))
    setShowModelsModal(false)
    setTempModels(null)
  }

  const handleAddTempModel = () => {
    const newModel = { 
      id: `model-${Date.now()}`, 
      name: '新模型', 
      input: ['text'], 
      output: ['text'], 
      contextWindow: 128000, 
      maxTokens: 8192 
    }
    setTempModels(prev => [...prev, newModel])
  }

  const handleUpdateTempModel = (modelId, fields) => {
    setTempModels(prev => prev.map(m => m.id === modelId ? { ...m, ...fields } : m))
  }

  const handleDeleteTempModel = (modelId) => {
    if (window.confirm('确定要删除该模型配置吗？')) {
      setTempModels(prev => prev.filter(m => m.id !== modelId))
    }
  }

  const handleDeleteCustomProvider = (e, id) => {
    e.stopPropagation();
    if (window.confirm('确定要删除该服务商配置吗？')) {
      updateAgentModel({ customProviders: modelDraft.customProviders.filter(p => p.id !== id) })
    }
  }

  const confirmSelectModelRoute = (selectedIds) => {
    const selectedRoutes = MOCK_MODEL_ROUTES.filter(r => selectedIds.includes(r.id))
      .map(r => ({ name: r.name, strategy: r.strategy, type: r.type }))
    updateAgentModel({ modelRoutes: selectedRoutes })
    setShowModelRouteModal(false)
  }

  const isBackupDirty = backupDraft && (
    backupDraft.enabled !== agent.autoBackupEnabled ||
    backupDraft.interval !== agent.autoBackupInterval ||
    backupDraft.unit !== agent.autoBackupUnit ||
    backupDraft.retention !== agent.autoBackupRetention
  )

  const handleBackupSave = () => {
    dispatch({ 
      type: 'UPDATE', 
      id: agent.id, 
      payload: { 
        autoBackupEnabled: backupDraft.enabled,
        autoBackupInterval: backupDraft.interval,
        autoBackupUnit: backupDraft.unit,
        autoBackupRetention: backupDraft.retention
      } 
    })
    showToast('备份策略已更新')
  }

  const handleBackupCancel = () => {
    setBackupDraft({
      enabled: agent.autoBackupEnabled,
      interval: agent.autoBackupInterval,
      unit: agent.autoBackupUnit,
      retention: agent.autoBackupRetention
    })
  }

  const toggleKeepSnapshot = (snapId) => {
    dispatch({ type: 'TOGGLE_SNAPSHOT_KEEP', agentId: agent.id, snapId })
    showToast('快照保留状态已更新')
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const openTerminal = () => {
    setShowTerminal(true)
    setTerminalLogs(['Connecting to agent-runtime-01...', 'Authenticating...', 'Channel established.'])
    setTimeout(() => {
      setTerminalLogs(prev => [...prev, 'bash-5.1# systemctl status agentbase-service', '● agentbase-service.service - Agent runtime service', '   Loaded: loaded (/lib/systemd/system/agentbase-service.service; enabled; vendor preset: enabled)', '   Active: active (running) since Wed 2026-04-08 14:15:33 UTC; 1h 30min ago'])
    }, 1000)
  }

  if (!agent) {
    return (
      <div className="had-not-found">
        <IconSearch size={48} style={{ color: 'var(--notion-gray-300)', marginBottom: 16 }} />
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
      if (window.confirm('确定要停止该 Agent 吗？')) {
        dispatch({ type: 'UPDATE', id: agent.id, payload: { status: '关闭中' } })
        showToast('关闭中...')
        setTimeout(() => {
          dispatch({ type: 'UPDATE', id: agent.id, payload: { status: '停止' } })
        }, 1500)
      }
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
        <button className="back-btn" onClick={() => navigate('/super-agent')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconArrowLeft size={16} /></button>
        <div className="breadcrumb">
          <span className="bc-item" onClick={() => navigate('/super-agent')}>Super Agent</span>
          <span className="bc-separator"> <IconChevronRight size={12} /> </span>
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
            {(agent.tags || []).map(tag => (
              <span key={tag} className="ha-mini-tag">{tag}</span>
            ))}
          </div>
        </div>
        <div className="had-overview-actions">
          {['停止', '启动中'].includes(agent.status) && (
            <button className="action-btn primary" disabled={agent.status === '启动中'} onClick={() => doStatusChange('启动中')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconPlay size={14} /> 启动
            </button>
          )}
          {['运行中', '关闭中'].includes(agent.status) && (
            <button className="action-btn" disabled={agent.status === '关闭中'} onClick={() => doStatusChange('关闭中')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconSquare size={12} /> 停止
            </button>
          )}
          <button className="action-btn" onClick={() => navigate(`/super-agent/${agent.id}/webui`)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconGlobe size={14} /> WebUI
          </button>
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
                <h4><IconAlertTriangle size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8, color: '#ff4d4f' }} /> 最近错误</h4>
                <p>{agent.events.filter(e => e.action === '错误').pop()?.detail || '无'}</p>
              </div>
            )}
          </div>
        )}

        {/* ========== SNAPSHOTS ========== */}
        {tab === 'snapshots' && backupDraft && (
          <div className="had-lifecycle">
            <div className="had-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                <h4 style={{ margin: 0 }}>定时备份设置</h4>
                <button 
                  className={`ha-toggle-btn ${backupDraft.enabled ? 'active' : ''}`}
                  onClick={() => setBackupDraft({ ...backupDraft, enabled: !backupDraft.enabled })}
                >
                  <div className="toggle-dot" />
                </button>
              </div>
              
              {backupDraft.enabled && (
                <div className="auto-backup-config-row">
                  <div className="config-item">
                    <label>备份频率：每隔</label>
                    <input 
                      type="number" 
                      className="auto-backup-input"
                      value={backupDraft.interval} 
                      onChange={e => setBackupDraft({ ...backupDraft, interval: Number(e.target.value) })}
                    />
                    <select 
                      className="auto-backup-select"
                      value={backupDraft.unit} 
                      onChange={e => setBackupDraft({ ...backupDraft, unit: e.target.value })}
                    >
                      <option value="hour">小时</option>
                      <option value="day">天</option>
                    </select>
                    <span style={{ marginLeft: 4 }}>执行一次</span>
                  </div>
                  <div className="config-item">
                    <label>版本控制：保留最近</label>
                    <input 
                      type="number" 
                      className="auto-backup-input"
                      value={backupDraft.retention} 
                      onChange={e => setBackupDraft({ ...backupDraft, retention: Number(e.target.value) })}
                    />
                    <span>份快照 (滚动覆盖)</span>
                  </div>
                </div>
              )}

              {isBackupDirty && (
                <div style={{ marginTop: 16, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button className="action-btn" onClick={handleBackupCancel}>取消</button>
                  <button className="action-btn primary" onClick={handleBackupSave}>保存设置</button>
                </div>
              )}
            </div>

            <div className="had-section">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button className="action-btn primary" onClick={handleCreateSnapshot}>+ 创建新快照</button>
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
                        <td>{snap.isKept && <IconPin size={12} style={{ marginRight: 6, color: '#1890ff', verticalAlign: 'middle' }} title="已保留（不计入滚动，不可删除）" />}{snap.name}</td>
                        <td style={{ color: '#8c8c8c' }}>{snap.createdAt}</td>
                        <td>{snap.version || agent.version}</td>
                        <td>{snap.size || '未知'}</td>
                        <td>{snap.trigger || '手动'}</td>
                        <td style={{ color: '#595959' }}>{snap.desc || '-'}</td>
                        <td>
                          <div className="ha-row-actions">
                            <button onClick={() => toggleKeepSnapshot(snap.id)} style={{ color: snap.isKept ? '#1890ff' : '#666' }}>{snap.isKept ? '取消保留' : '保留'}</button>
                            <button onClick={() => handleRestoreSnapshot(snap)}>恢复</button>
                            <button 
                              className="ha-delete-btn" 
                              onClick={() => !snap.isKept && handleDeleteSnapshot(snap)}
                              disabled={snap.isKept}
                              title={snap.isKept ? '已开启保留，不可删除' : ''}
                              style={snap.isKept ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                            >
                              删除
                            </button>
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
              {configSubTab === 'basic' && basicDraft && (
                <div className="had-section" style={{ paddingBottom: 16 }}>
                  <InlineEditable 
                    label="名称" 
                    value={basicDraft.name} 
                    onChange={v => setBasicDraft(p => ({ ...p, name: v }))} 
                    noButtons={true}
                    refreshTrigger={basicEditNonce}
                    onEditStart={() => setIsBasicEditing(true)}
                  />
                  <InlineEditable 
                    label="描述" 
                    value={basicDraft.description} 
                    type="textarea" 
                    onChange={v => setBasicDraft(p => ({ ...p, description: v }))} 
                    noButtons={true}
                    refreshTrigger={basicEditNonce}
                    onEditStart={() => setIsBasicEditing(true)}
                  />
                  <div className="had-kv">
                    <span>版本</span>
                    <div className="had-val-static">{agent.version}</div>
                  </div>
                  <div className="had-kv inline-editable-kv">
                    <span>标签</span>
                    <div className="ie-val-box">
                      <TagSelectModal 
                        value={basicDraft.tags || []} 
                        onChange={tags => setBasicDraft(p => ({ ...p, tags }))} 
                      />
                    </div>
                  </div>

                  {showBasicActions && (
                    <div style={{ marginTop: 24, padding: '16px 0', borderTop: '1px dashed #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                      <button className="action-btn" onClick={handleBasicCancel}>取消</button>
                      <button className="action-btn primary" onClick={handleBasicSave}>保存设置</button>
                    </div>
                  )}
                </div>
              )}
              {configSubTab === 'agent' && modelDraft && (
                <div className="had-model-config-panel">
                  {/* Source Selector */}
                  <div className="had-section no-border-bottom" style={{ marginBottom: 0 }}>
                    <div className="form-row">
                      <label>服务类型</label>
                      <div className="mc-source-tabs">
                        <div className={`mc-source-tab ${modelDraft.source === 'platform' ? 'active' : ''}`} onClick={() => { setModelDraft({ ...modelDraft, source: 'platform' }); updateAgentModel({ modelSource: 'platform' }); }}>平台模型路由</div>
                        <div className={`mc-source-tab ${modelDraft.source === 'custom' ? 'active' : ''}`} onClick={() => { setModelDraft({ ...modelDraft, source: 'custom' }); updateAgentModel({ modelSource: 'custom' }); }}>自定义模型服务</div>
                      </div>
                    </div>
                  </div>

                  {modelDraft.source === 'platform' ? (
                    <div className="had-section" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h4 style={{ margin: 0, fontSize: 14, color: '#262626' }}>已绑定的平台模型路由 ({modelDraft.routes.length})</h4>
                        <button className="action-btn small primary" onClick={() => { 
                          // Initialize selectedRouteIds if needed
                          setShowModelRouteModal(true); 
                        }}>选择路由</button>
                      </div>
                      
                      <div className="mc-route-list" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {modelDraft.routes.map((route, idx) => (
                          <div key={idx} className="mc-route-card" style={{ width: '100%' }}>
                            <div className="mcr-name">{route.name}</div>
                            <div className="mcr-tags">
                              <span className="mcr-tag">{route.strategy}</span>
                              <span className="mcr-tag blue">{route.type}</span>
                            </div>
                          </div>
                        ))}
                        {modelDraft.routes.length === 0 && (
                          <div className="mc-route-placeholder" style={{ width: '100%', padding: '24px', textAlign: 'center', background: '#fafafa', border: '1px dashed #d9d9d9', borderRadius: 8, color: '#999' }}>
                            尚未选择平台模型路由
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mc-custom-container">
                      <div className="had-section no-border-bottom" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                          <h4 style={{ margin: 0, fontSize: 14, color: '#262626' }}>已配置的服务商 ({modelDraft.customProviders.length})</h4>
                          <button className="action-btn small primary" onClick={() => handleOpenProviderModal()}>+ 添加服务商</button>
                        </div>
                        
                        {!modelDraft.customProviders.length ? (
                          <div className="mc-empty-providers">尚未配置任何自定义模型服务商</div>
                        ) : (
                          <div className="mc-provider-list">
                            {modelDraft.customProviders.map(p => (
                              <div key={p.id} className="mc-provider-item" onClick={() => handleOpenProviderModal(p)}>
                                <div className="mcp-info">
                                  <div className="mcp-name">{p.name || '未命名服务商'}</div>
                                  <div className="mcp-url">{p.baseUrl || '尚未设置 API Endpoint'}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                  <div className="mcp-badge">{p.models?.length || 0} Models</div>
                                  <button className="mcp-del" onClick={(e) => handleDeleteCustomProvider(e, p.id)}><IconTrash size={14} /></button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Default Model Configuration */}
                  <div className="had-section" style={{ marginTop: 20 }}>
                    <div style={{ marginBottom: 16 }}>
                      <h4 style={{ margin: 0, fontSize: 14, color: '#262626' }}>默认模型配置</h4>
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: '#8c8c8c' }}>设置 Agent 在不同场景下的主要模型及备选模型（Fallback）</p>
                    </div>

                    {[
                      { key: 'chat', label: 'Agent 模型', icon: <IconBot size={18} /> },
                      { key: 'vision', label: '图像理解模型', icon: <IconBrush size={18} /> },
                      { key: 'imageGen', label: '图像生成模型', icon: <IconSparkles size={18} /> }
                    ].map(cat => {
                      const config = modelDraft.defaultModelConfig[cat.key] || { mainId: '', fallbacks: [] }
                      const availableOptions = getAllAvailableModels()

                      return (
                        <div key={cat.key} className="dmc-category-box">
                          <div className="dmc-category-header">
                            <span style={{ fontSize: 18 }}>{cat.icon}</span>
                            <span className="dmc-category-label">{cat.label}</span>
                          </div>

                          {/* Primary Model Row */}
                          <div className="dmc-row">
                            <div className="dmc-row-label">主要模型</div>
                            <div className="dmc-row-content">
                              <ModelSearchSelector 
                                value={config.mainId}
                                options={availableOptions}
                                placeholder="选择主要模型..."
                                onSelect={(newId) => {
                                  handleUpdateDefaultModel(cat.key, { ...config, mainId: newId })
                                }}
                              />
                            </div>
                          </div>

                          {/* Fallback Models Rows */}
                          {config.fallbacks.map((fid, fidx) => (
                            <div key={`${cat.key}-fb-${fidx}`} className="dmc-row">
                              <div className="dmc-row-label">备选模型 {fidx + 1}</div>
                              <div className="dmc-row-content">
                                <ModelSearchSelector 
                                  value={fid}
                                  options={availableOptions}
                                  placeholder="选择备选模型..."
                                  onSelect={(newId) => {
                                    const nextFbs = [...config.fallbacks]
                                    nextFbs[fidx] = newId
                                    handleUpdateDefaultModel(cat.key, { ...config, fallbacks: nextFbs })
                                  }}
                                />
                                <button className="dmc-del-btn" onClick={() => {
                                  const nextFbs = config.fallbacks.filter((_, i) => i !== fidx)
                                  }}><IconTrash size={14} /></button>
                              </div>
                            </div>
                          ))}

                          <div className="dmc-add-link" onClick={() => {
                            handleUpdateDefaultModel(cat.key, { 
                              ...config, 
                              fallbacks: [...config.fallbacks, ''] 
                            })
                          }}>
                            <span>+ 添加备选模型</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
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
                          <div className="channel-icon">
                            {ch.type === '企业微信' ? <IconBuilding size={20} /> : ch.type === '飞书' ? <IconBird size={20} /> : ch.type === '钉钉' ? <IconPin size={20} /> : <IconLink size={20} />}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500 }}>{ch.name}</div>
                            <div style={{ fontSize: 12, color: '#999' }}>{ch.type}</div>
                          </div>
                        </div>
                        <div className="channel-status">
                          <span className="ha-status-tag" style={ch.status === '异常' ? { background: '#fff2f0', color: '#ff4d4f', borderColor: '#ffccc7' } : { background: '#f6ffed', color: '#52c41a', borderColor: '#b7eb8f' }}>
                            ● {ch.status === '异常' ? '异常' : '正常'}
                          </span>
                        </div>
                        <button className="action-btn small" onClick={() => {
                          if (window.confirm('确定要断开该渠道连接吗？')) {
                            handleInlineUpdate('channels', agent.channels.filter(c => c.id !== ch.id))
                          }
                        }}>断开</button>
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
                      <div key={f} className={`md-file-item ${activeMdFile === f ? 'active' : ''}`} onClick={() => setActiveMdFile(f)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <IconFile size={14} /> {f}
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
                    {graphGrouping === 'hour' ? (
                      ['每日简报', '周报汇总', '系统清理'].map(t => <span key={t}>{t}</span>)
                    ) : (
                      ['23:59', '18:00', '12:00', '06:00', '00:00'].map(h => <span key={h}>{h}</span>)
                    )}
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
                    let bottom = 0;

                    if (graphGrouping === 'hour') {
                      // 24h View: X = Time of Day, Y = Task Type
                      left = ((date.getHours() * 60 + date.getMinutes()) / (24 * 60)) * 100;
                      const typeIndex = ['每日简报生成', '周报汇总', '系统清理'].indexOf(t.name);
                      bottom = (typeIndex / 2) * 100; 
                    } else {
                      // 7d View: X = Day of Week, Y = Time of Day
                      const dayIndex = (date.getDay() + 6) % 7;
                      left = (dayIndex / 6) * 100;
                      bottom = ((date.getHours() * 60 + date.getMinutes()) / (24 * 60)) * 100;
                    }
                    
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 style={{ margin: 0 }}>定时任务配置</h4>
                <button className="action-btn" onClick={() => navigate(`/super-agent/${agent.id}/webui?view=cron`)}>管理</button>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>任务名称</th>
                    <th>执行频率</th>
                    <th>下次执行时间</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: '每日简报生成', interval: '每天 02:00', next: '2026-04-08 02:00:00', status: '已启用' },
                    { name: '周报汇总', interval: '每周五 17:45', next: '2026-04-10 17:45:00', status: '已启用' },
                    { name: '系统清理', interval: '每 15 分钟', next: '2026-04-07 15:30:00', status: '已禁用' },
                  ].map((ct, idx) => (
                    <tr key={idx}>
                      <td>{ct.name}</td>
                      <td><span className="ha-status-tag" style={{ background: '#f0f5ff', color: '#1d39c4', borderColor: '#adc6ff' }}>{ct.interval}</span></td>
                      <td>{ct.next}</td>
                      <td>
                        <span style={{ color: ct.status === '已启用' ? '#52c41a' : '#bfbfbf' }}>● {ct.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

        {tab === 'system' && (
          <div className="system-dashboard">
            {/* Service Monitor */}
            <div className="system-status-card">
              <div className="system-status-group">
                <div className={`status-indicator ${systemOnline ? 'online' : 'offline'}`}></div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>观测服务: {systemOnline ? '已连接' : '已断开'}</div>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>实时观测与其配套的运行时环境连接情况</div>
                </div>
              </div>
              <div>
                {systemOnline ? (
                  <button className="action-btn small" onClick={() => setSystemOnline(false)}>模拟断开</button>
                ) : (
                  <button className="action-btn small primary" onClick={() => {
                    showToast('正在尝试连接服务...')
                    setTimeout(() => {
                      setSystemOnline(true)
                      showToast('服务已成功重连')
                    }, 1500)
                  }}>一键修复</button>
                )}
              </div>
            </div>

            {/* Recovery Capabilities */}
            <div className="had-section" style={{ background: 'transparent', padding: 0, border: 'none' }}>
              <h4 style={{ marginBottom: 16 }}>灾备与恢复</h4>
              <div className="recovery-grid">
                <div className="recovery-card">
                  <h5>配置恢复</h5>
                  <p>将当前 Agent 配置状态强制回滚至上一个已标记的“可用”版本。</p>
                  <div className="recovery-tips">
                    <IconInfo size={14} style={{ color: '#1890ff' }} />
                    <span>小i提示：建议由于误配置导致服务异常时使用。</span>
                  </div>
                  <button className="action-btn" style={{ marginTop: 'auto' }} onClick={() => showToast('正在回滚配置，请稍候...', 'success')}>立即恢复</button>
                </div>

                <div className="recovery-card">
                  <h5>网关重启</h5>
                  <p>如果接口调用频繁出现超时或 504 错误，可以尝试手动重启 API 网关通道。</p>
                  <button className="action-btn" style={{ marginTop: 'auto' }} onClick={() => showToast('网关重启指令已发送...', 'success')}>网关重启</button>
                </div>

                <div className="recovery-card">
                  <h5>链接终端 (Diagnostic)</h5>
                  <p>通过 SSH 协议安全接入 Agent 运行环境，执行低级别的诊断命令。</p>
                  <button className="action-btn primary" style={{ marginTop: 'auto' }} onClick={openTerminal}>连接终端</button>
                </div>
              </div>
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
                  { id: '企业微信', icon: <IconBuilding size={20} /> },
                  { id: '飞书', icon: <IconBird size={20} /> },
                  { id: '钉钉', icon: <IconPin size={20} /> },
                  { id: '自定义', icon: <IconLink size={20} /> }
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
                            <div className="qr-mock-light">
                              <IconSmartphone size={48} style={{ color: '#1890ff' }} />
                              <div style={{ marginTop: 8, fontSize: 12 }}>管理员扫码</div>
                            </div>
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

      {/* Model Route Selection Modal */}
      {showModelRouteModal && (
        <div className="ha-modal-overlay">
          <ModelRouteSelectionContent 
            onCancel={() => setShowModelRouteModal(false)}
            onConfirm={(ids) => confirmSelectModelRoute(ids)}
            initialSelectedNames={modelDraft.routes.map(r => r.name)}
          />
        </div>
      )}

      {/* Provider Details Modal */}
      {showProviderModal && tempProvider && (
        <div className="ha-modal-overlay">
          <div className="ha-modal" style={{ maxWidth: 600 }}>
            <div className="ha-modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>
                {tempProvider.id.startsWith('cp-') && !modelDraft.customProviders.find(p => p.id === tempProvider.id) ? '添加服务商' : '编辑服务商'}
              </h3>
              <button className="ha-modal-close" onClick={() => setShowProviderModal(false)}>×</button>
            </div>
            <div className="ha-modal-body" style={{ padding: '24px' }}>
              <div className="form-row">
                <label>服务商名称<span style={{ color: 'red' }}>*</span></label>
                <input 
                  type="text" 
                  value={tempProvider.name}
                  onChange={e => setTempProvider(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="例如: OpenAI, Zhipu AI"
                />
              </div>
              <div className="form-row">
                <label>Base URL<span style={{ color: 'red' }}>*</span></label>
                <input 
                  type="text" 
                  value={tempProvider.baseUrl}
                  onChange={e => setTempProvider(prev => ({ ...prev, baseUrl: e.target.value }))}
                  placeholder="https://api.openai.com/v1"
                />
              </div>
              <div className="form-row">
                <label>API Key<span style={{ color: 'red' }}>*</span></label>
                <input 
                  type="password" 
                  value={tempProvider.apiKey}
                  onChange={e => setTempProvider(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="sk-********"
                />
              </div>
              <div className="form-row" style={{ alignItems: 'center' }}>
                <label>模型管理</label>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="mcp-badge" style={{ padding: '6px 12px', fontSize: 13 }}>
                    已配置 {tempProvider.models?.length || 0} 个模型
                  </div>
                    <button 
                      className="action-btn" 
                      onClick={handleOpenModelsModal}
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <IconSettings size={14} /> 配置模型列表
                    </button>
                </div>
              </div>
            </div>
            <div className="ha-modal-footer" style={{ padding: '16px 24px', textAlign: 'right', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="action-btn" onClick={() => setShowProviderModal(false)}>取消</button>
              <button className="action-btn primary" onClick={handleSaveProviderModal}>确定</button>
            </div>
          </div>
        </div>
      )}

      {/* Provider Models Management Modal */}
      {showModelsModal && tempModels && (
        <div className="ha-modal-overlay" style={{ zIndex: 1100 }}>
          <div className="ha-modal" style={{ maxWidth: 900 }}>
            <div className="ha-modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>
                管理模型列表 — {tempProvider.name}
              </h3>
              <button className="ha-modal-close" onClick={() => setShowModelsModal(false)}>×</button>
            </div>
            <div className="ha-modal-body" style={{ padding: '20px' }}>
              <div style={{ marginBottom: 16, textAlign: 'right' }}>
                <button className="action-btn primary small" onClick={handleAddTempModel}>+ 添加模型</button>
              </div>
              <div className="mr-table-container" style={{ border: '1px solid #f0f0f0', borderRadius: 8 }}>
                <table className="mr-table">
                  <thead>
                    <tr>
                      <th style={{ width: '150px' }}>模型 ID / 名称</th>
                      <th style={{ width: '120px' }}>输入类型</th>
                      <th style={{ width: '120px' }}>输出类型</th>
                      <th style={{ width: '140px' }}>Context Window</th>
                      <th style={{ width: '120px' }}>Max Tokens</th>
                      <th style={{ width: '80px' }}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tempModels.map(m => (
                      <tr key={m.id}>
                        <td>
                          <input 
                            type="text" 
                            className="mr-search-input" 
                            style={{ width: '90%', marginBottom: 4 }} 
                            placeholder="ID (如 gpt-4o)"
                            value={m.id}
                            onChange={e => handleUpdateTempModel(m.id, { id: e.target.value })}
                          />
                          <input 
                            type="text" 
                            className="mr-search-input" 
                            style={{ width: '90%', fontSize: 11, opacity: 0.7 }} 
                            placeholder="友好名称 (如 GPT-4o)"
                            value={m.name}
                            onChange={e => handleUpdateTempModel(m.id, { name: e.target.value })}
                          />
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                              <input 
                                type="checkbox" 
                                checked={m.input.includes('text')} 
                                onChange={e => {
                                  const next = e.target.checked ? [...m.input, 'text'] : m.input.filter(i => i !== 'text');
                                  handleUpdateTempModel(m.id, { input: next });
                                }}
                              /> 文本
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                              <input 
                                type="checkbox" 
                                checked={m.input.includes('image')} 
                                onChange={e => {
                                  const next = e.target.checked ? [...m.input, 'image'] : m.input.filter(i => i !== 'image');
                                  handleUpdateTempModel(m.id, { input: next });
                                }}
                              /> 图像
                            </label>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                              <input 
                                type="checkbox" 
                                checked={m.output.includes('text')} 
                                onChange={e => {
                                  const next = e.target.checked ? [...m.output, 'text'] : m.output.filter(i => i !== 'text');
                                  handleUpdateTempModel(m.id, { output: next });
                                }}
                              /> 文本
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                              <input 
                                type="checkbox" 
                                checked={m.output.includes('image')} 
                                onChange={e => {
                                  const next = e.target.checked ? [...m.output, 'image'] : m.output.filter(i => i !== 'image');
                                  handleUpdateTempModel(m.id, { output: next });
                                }}
                              /> 图像
                            </label>
                          </div>
                        </td>
                        <td>
                          <input 
                            type="number" 
                            className="mr-search-input" 
                            style={{ width: '120px' }}
                            value={m.contextWindow}
                            onChange={e => handleUpdateTempModel(m.id, { contextWindow: Number(e.target.value) })}
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            className="mr-search-input" 
                            style={{ width: '100px' }}
                            value={m.maxTokens}
                            onChange={e => handleUpdateTempModel(m.id, { maxTokens: Number(e.target.value) })}
                          />
                        </td>
                        <td>
                          <button 
                            className="mcp-del" 
                            onClick={() => handleDeleteTempModel(m.id)}
                            style={{ opacity: 1, color: '#ff4d4f' }}
                          >
                            <IconTrash size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="ha-modal-footer" style={{ padding: '16px 24px', textAlign: 'right', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="action-btn" onClick={() => setShowModelsModal(false)}>取消</button>
              <button className="action-btn primary" onClick={handleSaveModelsModal}>确定</button>
            </div>
          </div>
        </div>
      )}

      {/* Terminal Modal */}
      {showTerminal && (
        <div className="ha-modal-overlay">
          <div className="ha-modal" style={{ maxWidth: 900 }}>
            <div className="terminal-window">
              <div className="terminal-header">
                <div className="terminal-controls">
                  <div className="t-dot red"></div>
                  <div className="t-dot yellow"></div>
                  <div className="t-dot green"></div>
                </div>
                <div className="terminal-title">agentbase-diagnostic-term — ssh root@agent-runtime-01</div>
                <button className="ha-modal-close" onClick={() => setShowTerminal(false)} style={{ color: '#fff', fontSize: 18 }}>×</button>
              </div>
              <div className="terminal-body" id="term-body">
                {terminalLogs.map((log, idx) => (
                  <p key={idx} className="terminal-line">
                    <span className="t-prompt">{log.startsWith('bash') ? '' : '>'}</span>
                    <span className={log.includes('Active: active') ? 't-success' : ''}>{log}</span>
                  </p>
                ))}
                <p className="terminal-line">
                  <span className="t-prompt">bash-5.1# </span>
                  <span className="t-typing">&nbsp;</span>
                </p>
              </div>
            </div>
            <div style={{ padding: '12px 20px', background: '#222', borderTop: '1px solid #333', textAlign: 'right' }}>
              <button className="action-btn" onClick={() => setShowTerminal(false)}>退出终端</button>
            </div>
          </div>
        </div>
      )}

      {/* Legacy modal state removed */}

      {/* Toast */}
      {toast && <div className={`ha-toast ha-toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}

function ModelRouteSelectionContent({ onCancel, onConfirm, initialSelectedNames }) {
  const [selectedIds, setSelectedIds] = useState(() => {
    return MOCK_MODEL_ROUTES.filter(r => initialSelectedNames.includes(r.name)).map(r => r.id)
  })

  const toggleRoute = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="ha-modal" style={{ maxWidth: 800 }}>
      <div className="ha-modal-header">
        <h3 style={{ fontSize: '16px', fontWeight: 600 }}>选择平台模型路由</h3>
        <button className="ha-modal-close" onClick={onCancel}>×</button>
      </div>
      <div className="ha-modal-body" style={{ padding: '0px' }}>
        <div className="mr-table-container">
          <table className="mr-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>路由名称</th>
                <th>策略</th>
                <th>类型</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_MODEL_ROUTES.map(r => (
                <tr key={r.id} className={selectedIds.includes(r.id) ? 'selected' : ''} onClick={() => toggleRoute(r.id)}>
                  <td onClick={e => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(r.id)} 
                      onChange={() => toggleRoute(r.id)}
                    />
                  </td>
                  <td style={{ fontWeight: 500 }}>{r.name}</td>
                  <td><span className="mcr-tag">{r.strategy}</span></td>
                  <td><span className="mcr-tag blue">{r.type}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="ha-modal-footer" style={{ padding: '16px 24px', textAlign: 'right', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button className="action-btn" onClick={onCancel}>取消</button>
        <button className="action-btn primary" onClick={() => onConfirm(selectedIds)}>确定选择</button>
      </div>
    </div>
  )
}

function ModelSearchSelector({ value, options = [], onSelect, placeholder }) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const dropdownRef = useRef(null)

  const selectedOption = options.find(o => o.id === value)
  const filteredOptions = options.filter(o => 
    (o.name || '').toLowerCase().includes(query.toLowerCase()) || 
    (o.id || '').toLowerCase().includes(query.toLowerCase()) || 
    (o.source && o.source.toLowerCase().includes(query.toLowerCase()))
  )

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="dmc-selector-wrap" ref={dropdownRef}>
      <input 
        type="text" 
        className="dmc-selector-input"
        placeholder={selectedOption ? selectedOption.name : placeholder}
        value={isOpen ? query : (selectedOption ? selectedOption.name : '')}
        onFocus={() => setIsOpen(true)}
        onChange={e => setQuery(e.target.value)}
        readOnly={!isOpen && !!selectedOption}
        onClick={() => !isOpen && setIsOpen(true)}
        autoComplete="off"
      />
      {isOpen && (
        <div className="dmc-popover">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(opt => (
              <div 
                key={opt.id} 
                className={`dmc-option ${opt.id === value ? 'selected' : ''}`}
                onClick={() => {
                  onSelect(opt.id)
                  setIsOpen(false)
                  setQuery('')
                }}
              >
                <div className="dmc-option-name">{opt.name}</div>
                <div className="dmc-option-meta">{opt.source} · {opt.id}</div>
              </div>
            ))
          ) : (
            <div className="dmc-no-results">没有找到匹配的模型</div>
          )}
        </div>
      )}
    </div>
  )
}

export default SuperAgentDetail;

