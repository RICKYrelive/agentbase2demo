import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DataToolbar } from '../components/PageLayout'
import { useSkills } from '../store/skillStore'

// Add to package modal
function AddToPackageModal({ skill, onClose, onAdd }) {
  const { packages } = useSkills()
  const [selectedPkgId, setSelectedPkgId] = useState('')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ width: 440 }}>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>将 Skill 添加到技能包</h3>
        <div style={{ marginBottom: 12 }}>
          <strong>所选 Skill:</strong> {skill.name} ({skill.latestVersion})
        </div>
        <div className="ha-form-item">
          <label className="ha-form-label">选择目标技能包</label>
          <select 
            className="ha-form-input" 
            value={selectedPkgId} 
            onChange={(e) => setSelectedPkgId(e.target.value)}
          >
            <option value="">-- 请选择技能包 --</option>
            {packages.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
            ))}
          </select>
        </div>
        <div style={{display:'flex', gap: 12, justifyContent:'flex-end', marginTop: 24}}>
          <button className="action-btn" onClick={onClose}>取消</button>
          <button 
            className="action-btn primary" 
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
  '已发布': { bg: '#f6ffed', color: '#52c41a', border: '#b7eb8f' },
  '草稿': { bg: '#f5f5f5', color: '#595959', border: '#d9d9d9' },
}

export default function SkillList() {
  const { skills, packages, dispatch } = useSkills()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('平台预置') // '平台预置' | '自定义'
  const [toast, setToast] = useState(null)
  const [addSkillModal, setAddSkillModal] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const filtered = skills.filter(s => {
    if (s.sourceType !== category) return false
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.id.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Clone a skill
  const handleClone = (e, skill) => {
    e.stopPropagation()
    dispatch({
      type: 'CREATE_SKILL',
      payload: {
        name: `${skill.name}-copy`,
        description: skill.description,
        sourceType: '自定义',
        versions: ['v1.0.0'],
        latestVersion: 'v1.0.0'
      }
    })
    showToast(`成功克隆 ${skill.name}`)
  }

  // Handle addition
  const handleAddToPackage = (pkgId, skill) => {
    // Check if it's already in the package
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
      <div className="skill-category-tabs">
        <div 
          className={`skill-category-tab ${category === '平台预置' ? 'active' : ''}`}
          onClick={() => setCategory('平台预置')}
        >
          平台预置 Skill
        </div>
        <div 
          className={`skill-category-tab ${category === '自定义' ? 'active' : ''}`}
          onClick={() => setCategory('自定义')}
        >
          自定义 Skill
        </div>
      </div>

      <DataToolbar
        buttons={
          <button className="action-btn primary" onClick={() => navigate('/skill-center/skill/create')}>+ 创建 Skill</button>
        }
      >
        <div className="search-input">
          <span className="search-icon">🔍</span>
          <input placeholder="搜索名称或ID" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="refresh-btn-sm" onClick={() => showToast('已刷新', 'info')}>↻</button>
      </DataToolbar>

      <div className="skill-card-grid">
        {filtered.length === 0 ? (
          <div className="ha-empty-card-state" style={{ gridColumn: '1 / -1', minHeight: 300 }}>
            <div className="empty-icon">🧩</div>
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
                  {category === '平台预置' && (
                    <button onClick={(e) => handleClone(e, skill)}>克隆</button>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); setAddSkillModal(skill) }}>+ 加入技能包</button>
                </div>
              </div>
            )
          })
        )}
      </div>

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
