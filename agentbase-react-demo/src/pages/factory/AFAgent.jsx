import { useState } from 'react'
import PageLayout, { GuideCards, DataToolbar } from '../../components/PageLayout'
import { 
  IconBot, IconSearch, IconRefresh, IconCopy, 
  IconDrama, IconZap, IconBrain, IconSparkles, IconX, IconPlus, IconMinus
} from '../../components/Icons'
import './AF.css'

const guideCards = [
  { title: '定义 Agent 蓝图', desc: '配置模型、系统提示词、工具集和技能，创建可复用的 Agent 定义。每次修改版本号自动递增。' },
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

  // Drawer Form State
  const [formData, setFormData] = useState({
    name: '',
    desc: '',
    model: 'sonnet',
    systemPrompt: '',
    tools: []
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
    setFormData({ name: '', desc: '', model: 'sonnet', systemPrompt: '', tools: [] })
  }

  const handleCreate = () => {
    showToast('Blueprint 创建成功')
    resetAndClose()
  }

  return (
    <PageLayout
      title="Agent Blueprint"
      rightAction={
        <button className="action-btn" onClick={() => setShowGuide(!showGuide)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {showGuide ? <><IconMinus size={14} /> 收起指引</> : <><IconPlus size={14} /> 展开指引</>}
        </button>
      }
    >
      {showGuide && <GuideCards cards={guideCards} />}

      <DataToolbar
        buttons={
          <button className="action-btn primary" onClick={() => setShowDrawer(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconPlus size={16} /> 新建 Blueprint</button>
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
            <tr>{columns.map(c => <th key={c}>{c === '名称' ? 'Blueprint 名称' : c}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={columns.length} className="data-table-empty">
                <div className="empty-state">
                  <IconBot size={40} style={{ color: 'var(--notion-gray-300)', marginBottom: 12 }} />
                  <span>暂无 Blueprint — 点击「新建 Blueprint」进行创建</span>
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
                      <button className="notion-body-medium" style={{ color: 'var(--notion-blue)' }}>详情</button>
                      <button className="notion-body-medium">编辑</button>
                      <button className="ha-delete-btn notion-body-medium" style={{ color: 'var(--notion-warning)' }}>归档</button>
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
                <div className="af-drawer-title notion-h3">新建 Blueprint</div>
              </div>
              <button className="af-drawer-close" onClick={resetAndClose}>
                <IconX size={20} />
              </button>
            </div>
            
            <div className="af-drawer-body">
              {/* Wizard Progress */}
              <div className="af-wizard-progress">
                <div className={`af-wizard-step-bubble ${drawerStep === 1 ? 'active' : (drawerStep > 1 ? 'completed' : '')}`}>1</div>
                <div className={`af-wizard-step-line ${drawerStep > 1 ? 'completed' : ''}`}></div>
                <div className={`af-wizard-step-bubble ${drawerStep === 2 ? 'active' : (drawerStep > 2 ? 'completed' : '')}`}>2</div>
                <div className={`af-wizard-step-line ${drawerStep > 2 ? 'completed' : ''}`}></div>
                <div className={`af-wizard-step-bubble ${drawerStep === 3 ? 'active' : (drawerStep > 3 ? 'completed' : '')}`}>3</div>
              </div>

              {drawerStep === 1 && (
                <div className="af-wizard-content">
                  <div className="af-field">
                    <label className="af-field-label">名称</label>
                    <input 
                      type="text" 
                      className="af-input-text notion-body" 
                      placeholder="给你的 Agent 起个名字" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="af-field">
                    <label className="af-field-label">描述</label>
                    <textarea 
                      className="af-input-textarea notion-body" 
                      placeholder="简要描述这个 Agent 的职责内容…" 
                      style={{ minHeight: 80 }}
                      value={formData.desc}
                      onChange={e => setFormData({...formData, desc: e.target.value})}
                    />
                  </div>
                  <div className="af-field">
                    <label className="af-field-label">选择推理模型</label>
                    <div className="af-card-grid">
                      {MOCK_MODELS.map(m => (
                        <div 
                          key={m.id} 
                          className={`af-option-card ${formData.model === m.id ? 'selected' : ''}`}
                          onClick={() => setFormData({...formData, model: m.id})}
                        >
                          <div className="af-option-icon">{m.icon}</div>
                          <div className="af-option-name notion-body-medium">{m.name}</div>
                          <div className="af-option-desc">{m.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {drawerStep === 2 && (
                <div className="af-wizard-content">
                  <div className="af-field">
                    <label className="af-field-label">系统提示词 (System Prompt)</label>
                    <div className="af-field-hint">核心指令集，定义 Agent 的角色、语气、回复格式及行为约束。</div>
                    <textarea 
                      className="af-input-textarea notion-body" 
                      placeholder="Enter system prompt instructions here..." 
                      style={{ minHeight: 340, fontFamily: 'var(--notion-font-family)', fontSize: '15px' }}
                      value={formData.systemPrompt}
                      onChange={e => setFormData({...formData, systemPrompt: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {drawerStep === 3 && (
                <div className="af-wizard-content">
                  <div className="af-field">
                    <label className="af-field-label">功能扩展 (Tools & Skills)</label>
                    <div className="af-field-hint">为 Agent 挂载必要的外部工具或业务技能（如 GitHub API、数据清洗脚本）。</div>
                    <div className="af-card-grid">
                      {['GitHub MCP', 'Slack Toolkit', 'Python Interpreter', 'Web Search'].map(tool => (
                        <div key={tool} className="af-option-card">
                          <div className="af-option-name" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input type="checkbox" /> {tool}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="af-success-state">
                    <IconSparkles size={48} style={{ color: '#f5a623', marginBottom: 12 }} />
                    <h3 className="notion-card-title">一切准备就绪</h3>
                    <p className="notion-body" style={{ color: 'var(--notion-gray-500)', marginTop: 8 }}>您可以立即创建此 Agent 或返回修改配置。</p>
                  </div>
                </div>
              )}
            </div>

            <div className="af-drawer-footer">
              <button className="action-btn" onClick={resetAndClose}>取消</button>
              {drawerStep > 1 && (
                <button className="action-btn" onClick={() => setDrawerStep(drawerStep - 1)}>上一步</button>
              )}
              {drawerStep < 3 ? (
                <button className="action-btn primary" onClick={() => setDrawerStep(drawerStep + 1)}>下一步</button>
              ) : (
                <button className="action-btn primary" onClick={handleCreate}>保存并创建</button>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && <div className="ha-toast ha-toast-success">{toast}</div>}
    </PageLayout>
  )
}
