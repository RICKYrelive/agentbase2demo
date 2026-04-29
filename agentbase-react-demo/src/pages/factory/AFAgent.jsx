import { useState } from 'react'
import PageLayout, { GuideCards, DataToolbar } from '../../components/PageLayout'
import { 
  IconBot, IconSearch, IconRefresh, IconCopy, 
  IconDrama, IconZap, IconBrain, IconSparkles, IconX, IconPlus, IconMinus,
  IconRocket, IconPuzzle, IconWrench, IconTarget, IconShield, IconCpu, IconLayers, IconFlask, IconVault, IconGlobe, IconAlertTriangle, IconTerminal, IconDatabase, IconFileText, IconEdit
} from '../../components/Icons'
import './AF.css'
import './AFWorkshop.css'

const guideCards = [
  { title: '定义 Agent', desc: '配置模型、系统提示词、工具集和技能，创建可复用的 Agent 定义。每次修改版本号自动递增。' },
  { title: '启动 Session 运行', desc: '选择已创建的 Agent，组合 Environment、Vaults、Filesystem 后启动运行实例。' },
]

const STATUS_COLORS = {
  active:   { bg: '#f6ffed', color: '#52c41a', border: '#b7eb8f', label: '活跃' },
  archived: { bg: '#f5f5f5', color: '#595959', border: '#d9d9d9', label: '已归档' },
}

const MOCK_AGENTS = [
  { id: 'agt_7f3a2b1c', name: 'Code Reviewer', model: 'claude-sonnet-4-6', version: 3, status: 'active', tools: 'agent_toolset, github_mcp', skills: 'code_review', createdAt: '2026-04-10 14:23', updatedAt: '2026-04-12 09:11', owner: 'Admin' },
  { id: 'agt_9d1e5f7a', name: 'Deep Researcher', model: 'claude-opus-4-6', version: 1, status: 'active', tools: 'agent_toolset', skills: '—', createdAt: '2026-04-11 08:00', updatedAt: '2026-04-11 08:00', owner: 'Admin' },
  { id: 'agt_2c4b8d9e', name: 'Data Analyst', model: 'claude-haiku-4-5', version: 7, status: 'archived', tools: 'agent_toolset', skills: 'xlsx, pdf', createdAt: '2026-04-01 11:45', updatedAt: '2026-04-09 17:32', owner: 'Demo' },
]

const MOCK_MODELS = [
  { id: 'sonnet', name: 'Claude 3.5 Sonnet', desc: '智能与速度的最佳平衡，适合复杂任务。', icon: <IconDrama size={24} /> },
  { id: 'haiku', name: 'Claude 3.5 Haiku', desc: '极速响应，适合简单分类与路由。', icon: <IconZap size={24} /> },
  { id: 'opus', name: 'Claude 3 Opus', desc: '极致推理能力，处理深层科学与数学问题。', icon: <IconBrain size={24} /> },
]

const columns = ['ID', '名称', '模型', '版本', '状态', '工具集', '技能', '创建时间', '创建人', '操作']

export default function AFAgent() {
  const [showGuide, setShowGuide] = useState(true)
  const [showArchived, setShowArchived] = useState(false)
  const [search, setSearch] = useState('')
  const [showDrawer, setShowDrawer] = useState(false)
  const [drawerStep, setDrawerStep] = useState(1)
  const [toast, setToast] = useState(null)
  const [detailAgent, setDetailAgent] = useState(null)
  const [editAgent, setEditAgent] = useState(null)
  const [selectedIconKey, setSelectedIconKey] = useState('Bot')
  const [showIconPicker, setShowIconPicker] = useState(false)

  const PRESET_ICONS = {
    'Bot': <IconBot />,
    'Search': <IconSearch />,
    'Analysis': <IconZap />, // MapZap for Analysis in this file
    'Dev': <IconBot />,
    'Database': <IconBrain />,
    'Gov': <IconShield />,
    'Global': <IconGlobe />,
    'Alert': <IconAlertTriangle />,
    'Edit': <IconEdit />,
    'File': <IconFileText />,
    'Rocket': <IconRocket />,
    'Puzzle': <IconPuzzle />,
    'Wrench': <IconWrench />,
    'Target': <IconTarget />,
    'Shield': <IconShield />,
    'Cpu': <IconCpu />,
    'Layers': <IconLayers />,
    'Flask': <IconFlask />,
    'Sparkles': <IconSparkles />,
    'Vault': <IconVault />,
    'Dev': <IconTerminal />,
    'Database': <IconDatabase />
  }

  // Drawer Form State
  const [formData, setFormData] = useState({
    name: '',
    desc: '',
    model: 'sonnet',
    systemPrompt: '',
    tools: [],
    callableAgents: []
  })

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2000) }

  const filtered = MOCK_AGENTS.filter(a => {
    if (!showArchived && a.status === 'archived') return false
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.id.includes(search)) return false
    return true
  })

  const resetAndClose = () => {
    setShowDrawer(false)
    setDrawerStep(1)
    setFormData({ name: '', desc: '', model: 'sonnet', systemPrompt: '', tools: [], callableAgents: [] })
  }

  const handleCreate = () => {
    showToast('Agent 创建成功')
    resetAndClose()
  }

  const openDetail = (agent) => {
    setDetailAgent({
      ...agent,
      desc: '此为系统生成的详细描述。负责处理 ' + agent.name + ' 相关的核心逻辑。',
      envTemplate: 'default-env',
      toolsList: agent.tools ? agent.tools.split(', ') : [],
      yaml: `name: ${agent.name}\ndescription: 此为系统生成的详细描述。负责处理 ${agent.name} 相关的核心逻辑。\nmodel: ${agent.model}\nsystem: |-\n  You are an expert helper for ${agent.name}. Match the user's tone.\n\n  1. Understand the core mission of ${agent.name}.\n  2. Respond accurately using available tools.\nmcp_servers:\n  - name: internal-db\n    type: url\n    url: https://mcp.db.com/mcp\ntools:\n  - type: agent_toolset_20260401\n  - type: mcp_toolset\n    mcp_server_name: internal-db\nskills: \n  - type: builtin\n    skill_id: xlsx\n  - type: custom\n    skill_id: skill_abc123\n    version: latest\ncallable_agents:\n  - type: agent\n    id: agt_reviewer_1\n    version: v1.0.0`
    })
    setSelectedIconKey('Bot')
  }

  const openEdit = (agent) => {
    setEditAgent({
      ...agent,
      desc: '此为系统生成的详细描述。负责处理 ' + agent.name + ' 相关的核心逻辑。',
      envTemplate: 'default-env',
      toolsList: agent.tools ? agent.tools.split(', ') : [],
      yaml: `name: ${agent.name}\ndescription: 此为系统生成的详细描述。负责处理 ${agent.name} 相关的核心逻辑。\nmodel: ${agent.model}\nsystem: |-\n  You are an expert helper for ${agent.name}. Match the user's tone.\n\n  1. Understand the core mission of ${agent.name}.\n  2. Respond accurately using available tools.\nmcp_servers:\n  - name: internal-db\n    type: url\n    url: https://mcp.db.com/mcp\ntools:\n  - type: agent_toolset_20260401\n  - type: mcp_toolset\n    mcp_server_name: internal-db\nskills: \n  - type: builtin\n    skill_id: xlsx\n  - type: custom\n    skill_id: skill_abc123\n    version: latest\ncallable_agents:\n  - type: agent\n    id: agt_reviewer_1\n    version: v1.0.0`
    })
  }

  return (
    <PageLayout
      title="Agent"
      rightAction={
        <button className="action-btn" onClick={() => setShowGuide(!showGuide)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {showGuide ? <><IconMinus size={14} /> 收起指引</> : <><IconPlus size={14} /> 展开指引</>}
        </button>
      }
    >
      {showGuide && <GuideCards cards={guideCards} />}

      <DataToolbar
        buttons={
          <button className="action-btn primary" onClick={() => setShowDrawer(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconPlus size={16} /> 新建 Agent</button>
        }
        filters={
          <label className="af-toggle-label">
            <input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} />
            显示已归档
          </label>
        }
      >
        <div className="search-input">
          <IconSearch className="search-icon" size={16} />
          <input placeholder="搜索名称或 ID" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="refresh-btn-sm" onClick={() => showToast('已刷新')}>
          <IconRefresh size={14} />
        </button>
      </DataToolbar>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>{columns.map(c => <th key={c}>{c === '名称' ? 'Agent 名称' : c}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={columns.length} className="data-table-empty">
                <div className="empty-state">
                  <IconBot size={40} style={{ color: 'var(--notion-gray-300)', marginBottom: 12 }} />
                  <span>暂无 Agent — 点击「新建 Agent」进行创建</span>
                </div>
              </td></tr>
            ) : filtered.map(a => {
              const sc = STATUS_COLORS[a.status]
              return (
                <tr key={a.id}>
                  <td>
                    <span className="af-id-cell">{a.id}</span>
                    <button className="af-copy-btn" onClick={() => { navigator.clipboard.writeText(a.id); showToast('已复制') }}>
                      <IconCopy size={12} />
                    </button>
                  </td>
                  <td><span className="af-name-link">{a.name}</span></td>
                  <td><span className="af-model-badge">{a.model}</span></td>
                  <td><span className="ha-version-badge notion-caption">v{a.version}</span></td>
                  <td><span className="status-badge" style={{ background: 'var(--notion-blue-bg)', color: 'var(--notion-blue-text)', borderRadius: '9999px', padding: '2px 10px', fontWeight: 600 }}>{sc.label}</span></td>
                  <td className="af-muted">{a.tools}</td>
                  <td className="af-muted">{a.skills}</td>
                  <td className="af-muted">{a.createdAt}</td>
                  <td className="af-muted">{a.owner}</td>
                  <td>
                    <div className="ha-row-actions">
                      <button className="notion-body-medium" style={{ color: 'var(--notion-blue)' }} onClick={() => { console.log('Detail clicked', a); openDetail(a); }}>详情</button>
                      <button className="ha-delete-btn notion-body-medium" style={{ color: 'var(--notion-warning)' }} onClick={() => showToast('已将 ' + a.name + ' 归档')}>归档</button>
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

      {/* New Agent Side Drawer */}
      {showDrawer && (
        <div className="af-drawer-overlay" onClick={resetAndClose}>
          <div className="af-drawer" onClick={e => e.stopPropagation()}>
            <div className="af-drawer-header">
              <div className="af-drawer-title-wrap">
                <IconBot size={24} style={{ color: 'var(--notion-blue)' }} />
                <div className="af-drawer-title notion-h3">新建 Agent</div>
              </div>
              <button className="af-drawer-close" onClick={resetAndClose}>
                <IconX size={20} />
              </button>
            </div>
            
            <div className="af-drawer-body" style={{ padding: '24px 32px' }}>
              <div className="af-wizard-content">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: 32 }}>
                  <div className="af-field">
                    <label className="af-field-label">Agent 名称</label>
                    <input 
                      type="text" 
                      className="af-input-text notion-body" 
                      placeholder="例如: Engineering Lead" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="af-field">
                    <label className="af-field-label">推理模型 (Model)</label>
                    <select 
                      className="af-input-text"
                      value={formData.model}
                      onChange={e => setFormData({...formData, model: e.target.value})}
                      style={{ height: '42px' }}
                    >
                      {MOCK_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="af-field" style={{ marginBottom: 32 }}>
                  <label className="af-field-label">功能描述 (Description)</label>
                  <input 
                    type="text" 
                    className="af-input-text notion-body" 
                    placeholder="简要描述这个 Agent 的职责内容…" 
                    value={formData.desc}
                    onChange={e => setFormData({...formData, desc: e.target.value})}
                  />
                </div>

                <div className="af-field" style={{ marginBottom: 32 }}>
                  <label className="af-field-label">系统设定 (System Prompt)</label>
                  <div className="af-field-hint">核心指令集，定义 Agent 的角色、语气及行为约束。</div>
                  <textarea 
                    className="af-input-textarea notion-body" 
                    placeholder="Enter system prompt instructions here..." 
                    style={{ minHeight: 180, fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.6' }}
                    value={formData.systemPrompt}
                    onChange={e => setFormData({...formData, systemPrompt: e.target.value})}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                  <div className="af-field">
                    <label className="af-field-label">挂载能力 (Tools & Skills)</label>
                    <div className="af-field-hint">选择必要的外部工具或业务技能。</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                      {['GitHub MCP', 'Slack Toolkit', 'Python Interpreter', 'Web Search'].map(tool => (
                        <label key={tool} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
                          <input type="checkbox" /> {tool}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="af-field">
                    <label className="af-field-label">协同 Agent (Callable Agents)</label>
                    <div className="af-field-hint">配置可调用的其他下级 Agent。</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                      {['Code Reviewer', 'Test Writer', 'Data Analyst'].map(agt => (
                        <label key={agt} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={formData.callableAgents.includes(agt)}
                            onChange={e => {
                              const next = e.target.checked 
                                ? [...formData.callableAgents, agt]
                                : formData.callableAgents.filter(x => x !== agt)
                              setFormData({...formData, callableAgents: next})
                            }}
                          /> {agt}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="af-success-state" style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid var(--notion-gray-200)' }}>
                  <IconSparkles size={32} style={{ color: '#f5a623', marginBottom: 12 }} />
                  <h3 className="notion-card-title">一切准备就绪</h3>
                  <p className="notion-body" style={{ color: 'var(--notion-gray-500)', marginTop: 4 }}>点击下方按钮即可保存并部署您的 Agent。</p>
                </div>
              </div>
            </div>

            <div className="af-drawer-footer">
              <button className="action-btn" onClick={resetAndClose}>取消</button>
              <button className="action-btn primary" onClick={handleCreate} style={{ padding: '0 32px' }}>保存并创建</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailAgent && (
        <div className="afw-tpl-modal-overlay">
          <div className="afw-tpl-modal">
            <div className="afw-tpl-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ position: 'relative' }}>
                  <div 
                    className="afw-template-icon clickable" 
                    style={{ background: '#f1f5f9', cursor: 'pointer' }}
                    onClick={() => setShowIconPicker(!showIconPicker)}
                  >
                    {PRESET_ICONS[selectedIconKey]}
                    {/* Reuse Icons mapping from AFWorkshop if possible, but localized here for now */}
                  </div>
                  {showIconPicker && (
                    <div className="afw-icon-picker-popover">
                       <div className="afw-icon-picker-grid">
                          {Object.keys(PRESET_ICONS).map(key => (
                            <div 
                              key={key} 
                              className={"afw-icon-picker-item " + (selectedIconKey === key ? 'active' : '')}
                              onClick={() => { setSelectedIconKey(key); setShowIconPicker(false); }}
                            >
                              {PRESET_ICONS[key]}
                            </div>
                          ))}
                       </div>
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{detailAgent.name} <span style={{ fontSize: 12, color: '#64748b', fontWeight: 400, marginLeft: 8 }}>v{detailAgent.version}</span></div>
              </div>
              <button className="afw-tpl-close" onClick={() => { setDetailAgent(null); setShowIconPicker(false); }}><IconX /></button>
            </div>
            
            <div className="afw-tpl-modal-body">
              <div className="afw-tpl-info-pane">
                <div style={{ marginBottom: 28 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
                    详细描述 / Description
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.6, color: '#334155' }}>
                    {detailAgent.desc}
                  </div>
                </div>

                <div style={{ marginBottom: 28 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
                    挂载工具 / MCP and Tools
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {detailAgent.toolsList?.map(t => (
                      <span key={t} style={{ fontSize: 12, background: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: 6, fontWeight: 600, border: '1px solid #c7d2fe' }}>
                        {t}
                      </span>
                    )) || <span style={{ color: '#94a3b8', fontSize: 13 }}>无预设工具</span>}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
                    挂载技能 / Skills
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, background: '#f0fdf4', color: '#16a34a', padding: '4px 10px', borderRadius: 6, fontWeight: 600, border: '1px solid #bbf7d0' }}>
                      core_skills
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="afw-tpl-editor-pane">
                <textarea 
                  className="afw-yaml-editor"
                  value={detailAgent.yaml}
                  readOnly
                />
              </div>
            </div>
            
            <div className="afw-tpl-modal-footer">
              <button className="action-btn" onClick={() => setDetailAgent(null)}>关闭详情</button>
              <button className="action-btn" onClick={() => showToast('模板保存成功')}>保存为模板</button>
              <button className="action-btn primary" onClick={() => { setEditAgent(detailAgent); setDetailAgent(null); }}>进入编辑</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editAgent && (
        <div className="afw-tpl-modal-overlay">
          <div className="afw-tpl-modal">
            <div className="afw-tpl-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="afw-template-icon" style={{ background: '#f1f5f9' }}><IconBot /></div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>编辑: {editAgent.name}</div>
              </div>
              <button className="afw-tpl-close" onClick={() => setEditAgent(null)}><IconX /></button>
            </div>
            
            <div className="afw-tpl-modal-body">
              <div className="afw-tpl-info-pane">
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>环境模板 / Env Template</div>
                  <input className="af-input-text" value={editAgent.envTemplate} onChange={e => setEditAgent({...editAgent, envTemplate: e.target.value})} />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>详细描述 / Description</div>
                  <textarea className="af-input-textarea" style={{minHeight: 120}} value={editAgent.desc} onChange={e => setEditAgent({...editAgent, desc: e.target.value})} />
                </div>
              </div>
              
              <div className="afw-tpl-editor-pane">
                <textarea 
                  className="afw-yaml-editor"
                  value={editAgent.yaml}
                  onChange={e => setEditAgent({...editAgent, yaml: e.target.value})}
                  spellCheck={false}
                />
              </div>
            </div>
            
            <div className="afw-tpl-modal-footer">
              <button className="action-btn" onClick={() => setEditAgent(null)}>取消修改</button>
              <button className="action-btn primary" onClick={() => { showToast('保存配置成功'); setEditAgent(null); }}>保存配置变更</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="ha-toast ha-toast-success">{toast}</div>}
    </PageLayout>
  )
}
