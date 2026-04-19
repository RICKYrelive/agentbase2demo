import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DataToolbar } from '../components/PageLayout'
import { useSkills } from '../store/skillStore'
import { IconSearch, IconRefresh, IconPuzzle, IconGrid, IconList, IconPackage, IconChevronDown } from '../components/Icons'

// Add to package modal
function AddToPackageModal({ skill, onClose, onAdd }) {
  const { packages } = useSkills()
  const [selectedPkgId, setSelectedPkgId] = useState('')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card premium-modal" onClick={e => e.stopPropagation()} style={{ width: 440, padding: '40px 32px' }}>
        <div className="modal-icon-header">
          <div className="icon-circle">
            <IconPackage size={32} />
          </div>
        </div>
        
        <h3 style={{ marginTop: 20, marginBottom: 8, fontSize: 20, fontWeight: 600 }}>添加到技能包</h3>
        <p style={{ color: '#86909c', fontSize: 13, marginBottom: 24 }}>
          将 <span style={{ color: '#1d2129', fontWeight: 500 }}>{skill.name}</span> ({skill.latestVersion}) 添加到指定项目
        </p>

        <div className="ha-form-item" style={{ textAlign: 'left', marginBottom: 32 }}>
          <label className="ha-form-label" style={{ marginBottom: 8, display: 'block', color: '#4e5969' }}>选择目标技能包</label>
          <div className="ha-select-custom" style={{ width: '100%' }}>
            <select 
              className="ha-form-input" 
              value={selectedPkgId} 
              onChange={(e) => setSelectedPkgId(e.target.value)}
              style={{ width: '100%', paddingRight: 32 }}
            >
              <option value="">-- 请选择技能包 --</option>
              {packages.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.project})</option>
              ))}
            </select>
            <IconChevronDown size={14} className="select-arrow" style={{ right: 12 }} />
          </div>
        </div>

        <div style={{display:'flex', gap: 12, width: '100%'}}>
          <button className="ha-btn-secondary" style={{ flex: 1 }} onClick={onClose}>取消</button>
          <button 
            className="ha-btn-primary" 
            style={{ flex: 1.5 }}
            disabled={!selectedPkgId}
            onClick={() => onAdd(selectedPkgId, skill)}
          >
            确认添加
          </button>
        </div>
      </div>
    </div>
  )
}

const STATUS_COLORS = {
  '可用': { bg: '#f6ffed', color: '#52c41a', border: '#b7eb8f' },
  '已发布': { bg: '#f6ffed', color: '#52c41a', border: '#b7eb8f' },
  '草稿': { bg: '#f5f5f5', color: '#595959', border: '#d9d9d9' },
  '运行中': { bg: '#f6ffed', color: '#52c41a', border: '#b7eb8f' },
}

export default function SkillList() {
  const { skills, packages, dispatch } = useSkills()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('平台预置') // '平台预置' | '自定义'
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [toast, setToast] = useState(null)
  const [addSkillModal, setAddSkillModal] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const filtered = skills.filter(s => {
    if (s.sourceType !== category) return false
    const searchLower = search.toLowerCase()
    const matchesName = s.name.toLowerCase().includes(searchLower)
    const matchesId = s.id.toLowerCase().includes(searchLower)
    const matchesTags = (s.tags || []).some(t => t.toLowerCase().includes(searchLower))
    return matchesName || matchesId || matchesTags
  })

  // Update a skill (bump version)
  const handleUpdate = (e, skill) => {
    e.stopPropagation()
    navigate(`/skill-center/skill/update/${skill.id}`)
  }

  // Handle addition
  const handleAddToPackage = (pkgId, skill) => {
    const pkg = packages.find(p => p.id === pkgId)
    if (pkg && pkg.skills.find(s => s.skillId === skill.id)) {
      showToast('该技能已在目标技能包中', 'error')
      return
    }

    dispatch({
      type: 'ADD_SKILL_TO_PACKAGE',
      packageId: pkgId,
      skill: skill
    })
    showToast(`已成功添加至技能包 ${pkg?.name || pkgId}`)
    setAddSkillModal(null)
  }

  return (
    <div className="skill-list-view">
      <DataToolbar
        buttons={
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button className="action-btn primary" onClick={() => navigate('/skill-center/skill/create')}>创建 Skill</button>
            <div className="skill-category-tabs">
              <div 
                className={`skill-category-tab ${category === '平台预置' ? 'active' : ''}`}
                onClick={() => setCategory('平台预置')}
              >
                平台预置
              </div>
              <div 
                className={`skill-category-tab ${category === '自定义' ? 'active' : ''}`}
                onClick={() => setCategory('自定义')}
              >
                自定义
              </div>
            </div>
          </div>
        }
      >
        <div className="search-input">
          <IconSearch className="search-icon" size={16} />
          <input placeholder="搜索名称、ID或标签" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        
        <div style={{ display: 'flex', gap: 4, background: '#f2f3f5', padding: 2, borderRadius: 6, marginLeft: 8 }}>
          <button 
            className={`refresh-btn-sm ${viewMode === 'grid' ? 'active-view' : ''}`} 
            onClick={() => setViewMode('grid')}
            title="网格视图"
            style={{ padding: '4px 8px', background: viewMode === 'grid' ? '#fff' : 'transparent', border: 'none', boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', color: viewMode === 'grid' ? '#1677ff' : '#86909c' }}
          >
            <IconGrid size={16} />
          </button>
          <button 
            className={`refresh-btn-sm ${viewMode === 'list' ? 'active-view' : ''}`} 
            onClick={() => setViewMode('list')}
            title="列表视图"
            style={{ padding: '4px 8px', background: viewMode === 'list' ? '#fff' : 'transparent', border: 'none', boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', color: viewMode === 'list' ? '#1677ff' : '#86909c' }}
          >
            <IconList size={16} />
          </button>
        </div>

        <button className="refresh-btn-sm" onClick={() => showToast('已刷新', 'info')} style={{ marginLeft: 8 }}>
          <IconRefresh size={14} />
        </button>
      </DataToolbar>

      {viewMode === 'grid' ? (
        <div className="skill-card-grid">
          {filtered.length === 0 ? (
            <div className="ha-empty-card-state" style={{ gridColumn: '1 / -1', minHeight: 300 }}>
              <IconPuzzle size={40} style={{ color: 'var(--notion-gray-300)', marginBottom: 16 }} />
              <div className="ha-empty-title">没有找到符合条件的 Skill</div>
              <button className="action-btn primary" style={{marginTop: 12}} onClick={() => navigate('/skill-center/skill/create')}>+ 去创建</button>
            </div>
          ) : (
            filtered.map(skill => {
              const sc = STATUS_COLORS[skill.status] || STATUS_COLORS['草稿']
              return (
                <div key={skill.id} className="skill-card" onClick={() => navigate(`/skill-center/skill/${skill.id}`)}>
                  <div className="skill-card-header">
                    <div>
                      <div className="skill-card-name">{skill.name}</div>
                      <div className="skill-card-id">{skill.id}</div>
                    </div>
                    <span className="ha-status-tag" style={{ background: sc.bg, color: sc.color, borderColor: sc.border, fontSize: 11, padding: '2px 6px' }}>
                      {skill.status}
                    </span>
                  </div>
                  
                  <div className="skill-card-desc" title={skill.description}>
                    {skill.description}
                  </div>

                  <div className="skill-card-footer">
                    <span>{skill.updatedAt} 更新</span>
                    <span className="ha-version-badge" style={{fontSize: 11}}>{skill.latestVersion}</span>
                  </div>

                  <div className="skill-card-actions">
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/skill-center/skill/${skill.id}`) }}>查看</button>
                    <button onClick={(e) => handleUpdate(e, skill)}>更新</button>
                    <button onClick={(e) => { e.stopPropagation(); setAddSkillModal(skill) }}>+ 加入技能包</button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      ) : (
        <div className="data-table-wrap" style={{ marginTop: 16 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>名称/ID</th>
                <th>状态</th>
                <th>描述/标签</th>
                <th>生效版本</th>
                <th>更新时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="data-table-empty">
                    <div className="ha-empty-title">没有找到符合条件的 Skill</div>
                  </td>
                </tr>
              ) : (
                filtered.map(skill => (
                  <tr key={skill.id}>
                    <td onClick={() => navigate(`/skill-center/skill/${skill.id}`)} style={{ cursor: 'pointer' }}>
                      <div className="ha-name-link">{skill.name}</div>
                      <div style={{ fontSize: 12, color: '#86909c' }}>{skill.id}</div>
                    </td>
                    <td>
                      <span className="ha-status-tag" style={{ ...STATUS_COLORS[skill.status] || STATUS_COLORS['草稿'], fontSize: 11, padding: '1px 6px' }}>
                        {skill.status}
                      </span>
                    </td>
                    <td>
                      <div className="ha-desc-cell" style={{ marginBottom: 4 }}>{skill.description}</div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {(skill.tags || []).map(t => (
                          <span key={t} className="ha-mini-tag">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td><span className="ha-version-badge">{skill.latestVersion}</span></td>
                    <td style={{ fontSize: 12, color: '#86909c' }}>{skill.updatedAt}</td>
                    <td>
                      <div className="ha-row-actions">
                        <button onClick={() => navigate(`/skill-center/skill/${skill.id}`)}>查看</button>
                        <button onClick={(e) => handleUpdate(e, skill)}>更新</button>
                        <button onClick={() => setAddSkillModal(skill)}>+ 加入技能包</button>
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      )}

      {toast && (
        <div className={`ha-toast ha-toast-${toast.type}`}>{toast.msg}</div>
      )}

      {addSkillModal && (
        <AddToPackageModal 
          skill={addSkillModal} 
          onClose={() => setAddSkillModal(null)} 
          onAdd={handleAddToPackage}
        />
      )}
    </div>
  )
}
