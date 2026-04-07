import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSuperAgents, STATUS_LIST } from '../store/superAgentStore.jsx'
import PageLayout, { GuideCards, DataToolbar } from '../components/PageLayout'
import TagSelectModal from '../components/TagSelectModal'
import './SuperAgentList.css'

const STATUS_COLORS = {
  '运行中': { bg: '#f6ffed', color: '#52c41a', border: '#b7eb8f' },
  '启动中': { bg: '#e6f7ff', color: '#1890ff', border: '#91d5ff' },
  '关闭中': { bg: '#fff2e8', color: '#fa8c16', border: '#ffd8bf' },
  '停止': { bg: '#f5f5f5', color: '#595959', border: '#d9d9d9' },
}

const STATUS_DOT = {
  '运行中': '#52c41a',
  '启动中': '#1890ff',
  '关闭中': '#fa8c16',
  '停止': '#8c8c8c'
}

const guideCards = [
  { title: '创建 Super Agent', desc: '配置 Agent 基本信息、版本、模型、Skill 和 IM 连接，完成 Agent 初始化。' },
  { title: '扫码连接 IM', desc: '扫描二维码将 Agent 绑定至企业微信、飞书或钉钉，实现 IM 渠道即时访问。' },
  { title: '通过 WebUI 或 IM 访问 Agent', desc: '使用内置 WebUI 体验服务或通过已绑定的 IM 渠道与 Agent 对话交互。' },
]

const columns = [
  { key: 'name', label: '名称', sortable: true },
  { key: 'status', label: '状态', sortable: true },
  { key: 'version', label: '版本' },
  { key: 'description', label: '描述' },
  { key: 'tags', label: '标签' },
  { key: 'createdAt', label: '创建时间', sortable: true },
  { key: 'owner', label: '创建人', sortable: true },
  { key: 'lastRunAt', label: '最近运行时间' },
  { key: 'actions', label: '操作' },
]

export default function SuperAgentList() {
  const { agents, dispatch, globalTags } = useSuperAgents()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [viewMode, setViewMode] = useState('list') // 'list' | 'card'
  const [showGuide, setShowGuide] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedTags, setSelectedTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [tagEditAgent, setTagEditAgent] = useState(null)
  const [newTag, setNewTag] = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  // Collect all unique tags from agents
  const allTags = useMemo(() => {
    const set = new Set()
    agents.forEach(a => (a.tags || []).forEach(t => set.add(t)))
    globalTags.forEach(t => set.add(t))
    return [...set].sort()
  }, [agents, globalTags])

  const filtered = agents.filter(a => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false
    if (selectedTags.length > 0 && !selectedTags.some(t => (a.tags || []).includes(t))) return false
    return true
  })

  const handleAction = (agent, action) => {
    switch (action) {
      case 'start':
        dispatch({ type: 'UPDATE', id: agent.id, payload: { status: '启动中' } })
        showToast(`${agent.name} 启动中...`)
        setTimeout(() => {
          dispatch({ type: 'UPDATE', id: agent.id, payload: { status: '运行中' } })
        }, 1500)
        break
      case 'stop':
        dispatch({ type: 'UPDATE', id: agent.id, payload: { status: '关闭中' } })
        showToast(`${agent.name} 关闭中...`)
        setTimeout(() => {
          dispatch({ type: 'UPDATE', id: agent.id, payload: { status: '停止' } })
        }, 1500)
        break
      case 'delete':
        setConfirmDelete(agent)
        break
      case 'webui':
        navigate(`/super-agent/${agent.id}/webui`)
        break
      case 'connect':
        navigate(`/super-agent/${agent.id}?tab=config&sub=channel`)
        break
      case 'snapshot':
        navigate(`/super-agent/${agent.id}?tab=snapshots`)
        break
      default:
        break
    }
  }

  const doDelete = () => {
    if (confirmDelete) {
      dispatch({ type: 'DELETE', id: confirmDelete.id })
      showToast(`${confirmDelete.name} 已删除`)
      setConfirmDelete(null)
    }
  }

  const addTagToAgent = (agent) => {
    if (newTag.trim() && !(agent.tags || []).includes(newTag.trim())) {
      dispatch({ type: 'UPDATE', id: agent.id, payload: { tags: [...(agent.tags || []), newTag.trim()] } })
      showToast(`已添加标签 "${newTag.trim()}"`)
    }
    setNewTag('')
    setTagEditAgent(null)
  }

  const removeTagFromAgent = (agent, tag) => {
    dispatch({ type: 'UPDATE', id: agent.id, payload: { tags: (agent.tags || []).filter(t => t !== tag) } })
  }

  return (
    <PageLayout
      title="Super Agent"
      rightAction={
        <button className="action-btn" onClick={() => setShowGuide(!showGuide)}>
          {showGuide ? '⊙ 收起指引' : '⊕ 展开指引'}
        </button>
      }
    >
      {showGuide && <GuideCards cards={guideCards} />}

      <DataToolbar
        buttons={
          <button className="action-btn primary" onClick={() => navigate('/super-agent/create')}>+ 创建 Super Agent</button>
        }
        filters={
          <div className="ha-filter-group">
            <div className="ha-view-toggle">
              <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="列表视图">☰</button>
              <button className={`view-btn ${viewMode === 'card' ? 'active' : ''}`} onClick={() => setViewMode('card')} title="卡片视图">▦</button>
            </div>
            <div className="ha-tag-filter-wrap">
              <button className={`action-btn ${selectedTags.length > 0 ? 'primary' : ''}`} onClick={() => setFilterOpen(!filterOpen)}>
                🏷 标签筛选 {selectedTags.length > 0 && `(${selectedTags.length})`}
              </button>
              {filterOpen && (
                <div className="ha-tag-dropdown">
                  <div className="ha-tag-dropdown-header">按标签筛选（可多选）</div>
                  <div className="ha-tag-filter-search">
                    <input placeholder="搜索标签" value={tagInput} onChange={e => setTagInput(e.target.value)} />
                  </div>
                  <div className="ha-tag-options">
                    {allTags.filter(t => !tagInput || t.includes(tagInput)).map(tag => (
                      <label key={tag} className="ha-tag-option">
                        <input type="checkbox" checked={selectedTags.includes(tag)} onChange={() => toggleTag(tag)} />
                        {tag}
                      </label>
                    ))}
                  </div>
                  {selectedTags.length > 0 && (
                    <div className="ha-tag-dropdown-footer">
                      <button className="text-btn" onClick={() => setSelectedTags([])}>清除全部</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        }
      >
        <div className="search-input">
          <span className="search-icon">🔍</span>
          <input placeholder="搜索名称" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="refresh-btn-sm" onClick={() => showToast('已刷新', 'info')}>↻</button>
      </DataToolbar>

      {/* Active tag chips */}
      {selectedTags.length > 0 && (
        <div className="ha-active-tags">
          {selectedTags.map(t => (
            <span key={t} className="ha-active-tag" onClick={() => toggleTag(t)}>{t} ×</span>
          ))}
        </div>
      )}

      {/* ========== LIST VIEW ========== */}
      {viewMode === 'list' && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((col, i) => (
                  <th key={i}>{col.label} {col.sortable && <span className="sort-icon">↕</span>}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="data-table-empty">
                    <div className="empty-state ha-empty">
                      <div className="empty-icon">🔗</div>
                      <div className="ha-empty-title">还没有 Super Agent</div>
                      <div className="ha-empty-desc">创建一个 Super Agent，配置后即可通过 WebUI 或 IM 与其对话</div>
                      <button className="action-btn primary" style={{marginTop: 12}} onClick={() => navigate('/super-agent/create')}>+ 创建 Super Agent</button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(agent => {
                  const sc = STATUS_COLORS[agent.status] || STATUS_COLORS['停止']
                  return (
                    <tr key={agent.id}>
                      <td>
                        <span className="ha-name-link" onClick={() => navigate(`/super-agent/${agent.id}`)}>{agent.name}</span>
                      </td>
                      <td>
                        <span className="ha-status-tag" style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}>
                          {agent.status}
                        </span>
                      </td>
                      <td><span className="ha-version-badge">{agent.version}</span></td>
                      <td><span className="ha-desc-cell">{agent.description}</span></td>
                      <td>
                        <div className="ha-tags-cell">
                          {(agent.tags || []).slice(0, 3).map(t => <span key={t} className="ha-mini-tag">{t}</span>)}
                          {(agent.tags || []).length > 3 && <span className="ha-mini-tag">+{agent.tags.length - 3}</span>}
                        </div>
                      </td>
                      <td>{agent.createdAt}</td>
                      <td>{agent.owner}</td>
                      <td>{agent.lastRunAt || '-'}</td>
                      <td>
                        <div className="ha-row-actions">
                          {['停止', '启动中'].includes(agent.status) && (
                            <button disabled={agent.status === '启动中'} onClick={() => handleAction(agent, 'start')}>启动</button>
                          )}
                          {['运行中', '关闭中'].includes(agent.status) && (
                            <button disabled={agent.status === '关闭中'} onClick={() => handleAction(agent, 'stop')}>停止</button>
                          )}
                          <button onClick={() => handleAction(agent, 'webui')}>WebUI</button>
                          <button onClick={() => handleAction(agent, 'connect')}>连接管理</button>
                          <button onClick={() => handleAction(agent, 'snapshot')}>快照</button>
                          <button className="ha-delete-btn" onClick={() => handleAction(agent, 'delete')}>删除</button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
          <div className="data-pagination">
            <span>共 {filtered.length} 条</span>
            <span>每页</span>
            <select className="pagination-select"><option>50</option></select>
            <span>条</span>
          </div>
        </div>
      )}

      {/* ========== CARD VIEW ========== */}
      {viewMode === 'card' && (
        <div className="ha-card-grid">
          {filtered.length === 0 ? (
            <div className="ha-empty-card-state">
              <div className="empty-icon">🔗</div>
              <div className="ha-empty-title">还没有 Super Agent</div>
              <button className="action-btn primary" style={{marginTop: 12}} onClick={() => navigate('/super-agent/create')}>+ 创建</button>
            </div>
          ) : (
            filtered.map(agent => {
              const sc = STATUS_COLORS[agent.status] || STATUS_COLORS['停止']
              const dotColor = STATUS_DOT[agent.status] || '#8c8c8c'
              return (
                <div key={agent.id} className="ha-agent-card" onClick={() => navigate(`/super-agent/${agent.id}`)}>
                  <div className="ha-card-header">
                    <div className="ha-card-avatar">
                      <span className="ha-card-avatar-text">{agent.name.charAt(0).toUpperCase()}</span>
                      <span className="ha-card-status-dot" style={{ background: dotColor }} />
                    </div>
                    <div className="ha-card-info">
                      <div className="ha-card-name">{agent.name}</div>
                      <div className="ha-card-meta">
                        <span className="ha-status-tag" style={{ background: sc.bg, color: sc.color, borderColor: sc.border, fontSize: 11, padding: '1px 6px' }}>{agent.status}</span>
                        <span className="ha-version-badge" style={{fontSize: 11}}>{agent.version}</span>
                      </div>
                    </div>
                  </div>
                  <div className="ha-card-desc">{agent.description}</div>
                  <div className="ha-card-tags">
                    {(agent.tags || []).slice(0, 4).map(t => <span key={t} className="ha-mini-tag">{t}</span>)}
                  </div>
                  <div className="ha-card-date-top">{agent.createdAt?.slice(0, 10)}</div>
                  <div className="ha-card-footer">
                    <span className="ha-card-owner">{agent.owner}</span>
                  </div>
                  <div className="ha-card-actions" onClick={e => e.stopPropagation()}>
                    {['停止', '启动中'].includes(agent.status) && (
                      <button disabled={agent.status === '启动中'} onClick={() => handleAction(agent, 'start')}>▶</button>
                    )}
                    {['运行中', '关闭中'].includes(agent.status) && (
                      <button disabled={agent.status === '关闭中'} onClick={() => handleAction(agent, 'stop')}>⏹</button>
                    )}
                    <button onClick={() => handleAction(agent, 'webui')} title="WebUI">🌐</button>
                    <button onClick={() => handleAction(agent, 'connect')} title="连接管理">🔌</button>
                    <button onClick={() => handleAction(agent, 'snapshot')} title="快照">📸</button>
                    <button className="ha-delete-btn" onClick={() => handleAction(agent, 'delete')} title="删除">🗑</button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`ha-toast ha-toast-${toast.type}`}>{toast.msg}</div>
      )}

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">⚠️</div>
            <div className="modal-message">确定要删除 <strong>{confirmDelete.name}</strong> 吗？此操作不可恢复。</div>
            <div style={{display:'flex', gap: 12, justifyContent:'center'}}>
              <button className="action-btn primary" style={{background:'#ff4d4f', borderColor:'#ff4d4f'}} onClick={doDelete}>删除</button>
              <button className="action-btn" onClick={() => setConfirmDelete(null)}>取消</button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close filter */}
      {filterOpen && <div className="ha-filter-backdrop" onClick={() => setFilterOpen(false)} />}
    </PageLayout>
  )
}
