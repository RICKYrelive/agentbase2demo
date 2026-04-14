import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSkills } from '../store/skillStore'
import PageLayout, { DataToolbar } from '../components/PageLayout'
import { IconSearch, IconArrowLeft, IconRefresh, IconPuzzle, IconAlertTriangle } from '../components/Icons'

// Modify Version Modal
function ModifyVersionModal({ pkg, skillItem, onClose, onChangeVersion }) {
  const { skills } = useSkills()
  const originalSkill = skills.find(s => s.id === skillItem.skillId) || { versions: [skillItem.activeVersion] }
  const [selectedVersion, setSelectedVersion] = useState(skillItem.activeVersion)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ width: 440 }}>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>修改生效版本</h3>
        <div style={{ marginBottom: 16 }}>
          <strong>Skill:</strong> {skillItem.skillName}
        </div>
        <div className="ha-form-item">
          <label className="ha-form-label">选择目标版本</label>
          <select 
            className="ha-form-input" 
            value={selectedVersion} 
            onChange={(e) => setSelectedVersion(e.target.value)}
          >
            {originalSkill.versions.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
        <div style={{display:'flex', gap: 12, justifyContent:'flex-end', marginTop: 24}}>
          <button className="action-btn" onClick={onClose}>取消</button>
          <button 
            className="action-btn primary" 
            disabled={selectedVersion === skillItem.activeVersion}
            onClick={() => onChangeVersion(pkg.id, skillItem.skillId, selectedVersion)}
          >
            确认修改
          </button>
        </div>
      </div>
    </div>
  )
}

// Add Skill Modal
function AddSkillToPkgModal({ pkg, onClose, onAdd }) {
  const { skills } = useSkills()
  const [selectedSkillId, setSelectedSkillId] = useState('')
  const [search, setSearch] = useState('')

  // filter skills not already in pkg
  const availableSkills = skills.filter(s => !pkg.skills.find(ps => ps.skillId === s.id) && s.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ width: 480 }}>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>添加 Skill 到技能包</h3>
        
        <div className="search-input" style={{marginBottom: 16, width: '100%'}}>
          <IconSearch className="search-icon" size={16} />
          <input placeholder="搜索 Skill 名称" value={search} onChange={e => setSearch(e.target.value)} style={{width: '90%'}} />
        </div>

        <div className="ha-form-item">
          <label className="ha-form-label">选择 Skill</label>
          <select 
            className="ha-form-input" 
            value={selectedSkillId} 
            onChange={(e) => setSelectedSkillId(e.target.value)}
          >
            <option value="">-- 请选择 Skill --</option>
            {availableSkills.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.sourceType})</option>
            ))}
          </select>
        </div>
        <div style={{display:'flex', gap: 12, justifyContent:'flex-end', marginTop: 24}}>
          <button className="action-btn" onClick={onClose}>取消</button>
          <button 
            className="action-btn primary" 
            disabled={!selectedSkillId}
            onClick={() => onAdd(pkg.id, skills.find(s => s.id === selectedSkillId))}
          >
            确认添加
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SkillPackageDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { packages, dispatch } = useSkills()
  const [activeTab, setActiveTab] = useState('skills') // 'basic' | 'skills'
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')
  const [modifyVersionModal, setModifyVersionModal] = useState(null)
  const [addSkillModal, setAddSkillModal] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const pkg = packages.find(p => p.id === id)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  if (!pkg) {
    return (
      <div className="create-app-page">
        <div className="ha-empty-card-state" style={{marginTop: 60}}>未找到该技能包</div>
      </div>
    )
  }

  const doDelete = () => {
    dispatch({ type: 'DELETE_PACKAGE', id: pkg.id })
    navigate('/skill-center')
  }

  const handleRemoveSkill = (skillId) => {
    if (window.confirm('确定要从该技能包中移除此技能吗？')) {
      dispatch({ type: 'REMOVE_SKILL_FROM_PACKAGE', packageId: pkg.id, skillId })
      showToast('已移除关联的 Skill')
    }
  }

  const handleChangeVersion = (pkgId, skillId, version) => {
    dispatch({ type: 'UPDATE_SKILL_VERSION_IN_PACKAGE', packageId: pkgId, skillId, version })
    setModifyVersionModal(null)
    showToast('版本修改成功')
  }

  const handleAddSkill = (pkgId, skill) => {
    dispatch({ type: 'ADD_SKILL_TO_PACKAGE', packageId: pkgId, skill })
    setAddSkillModal(false)
    showToast('Skill 已成功添加到技能包')
  }

  const filteredSkills = (pkg.skills || []).filter(s => !search || s.skillName.toLowerCase().includes(search.toLowerCase()))

  return (
    <PageLayout
      title={
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <button className="back-btn" onClick={() => navigate('/skill-center')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconArrowLeft size={16} />
          </button>
          <span>{pkg.name}</span>
          <span className="ha-status-tag" style={{ marginLeft: 8, background: '#f6ffed', color: '#52c41a', borderColor: '#b7eb8f', fontSize: 13, height: 22, lineHeight: '20px' }}>{pkg.status}</span>
        </div>
      }
      rightAction={
        <div style={{display:'flex', gap: 8}}>
          <button className="refresh-btn-sm" onClick={() => showToast('已刷新', 'info')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconRefresh size={14} /> 刷新
          </button>
          <button className="ha-delete-btn" style={{padding: '4px 12px'}} onClick={() => setConfirmDelete(pkg)}>删除</button>
        </div>
      }
    >
      <div className="skill-center-tabs" style={{marginTop: -8}}>
        <div 
          className={`skill-tab ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          基本信息
        </div>
        <div 
          className={`skill-tab ${activeTab === 'skills' ? 'active' : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          Skills 管理 ({pkg.skillsCount})
        </div>
      </div>

      {activeTab === 'basic' && (
        <div className="form-card-container" style={{maxWidth: 800, margin: 0, border: 'none', background: 'transparent', boxShadow: 'none'}}>
          <div className="form-content">
            <div className="form-row"><label>ID：</label><div>{pkg.id}</div></div>
            <div className="form-row"><label>名称：</label><div>{pkg.name}</div></div>
            <div className="form-row"><label>所属项目：</label><div>{pkg.project}</div></div>
            <div className="form-row"><label>描述：</label><div>{pkg.description || '-'}</div></div>
            <div className="form-row"><label>标签：</label><div>{(pkg.tags || []).length > 0 ? pkg.tags.map(t => <span key={t} className="ha-mini-tag">{t}</span>) : '-'}</div></div>
            <div className="form-row"><label>创建时间：</label><div>{pkg.createdAt}</div></div>
            <div className="form-row"><label>更新时间：</label><div>{pkg.updatedAt}</div></div>
          </div>
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="skill-package-list">
          <DataToolbar
            buttons={
              <button className="action-btn primary" onClick={() => setAddSkillModal(true)}>+ 添加 Skill</button>
            }
          >
            <div className="search-input">
              <IconSearch className="search-icon" size={16} />
              <input placeholder="搜索 Skill 名称" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </DataToolbar>

          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>名称/ID</th>
                  <th>状态</th>
                  <th>描述</th>
                  <th>生效版本</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredSkills.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="data-table-empty">
                      <div className="empty-state ha-empty">
                        <IconPuzzle size={40} style={{ color: 'var(--notion-gray-300)', marginBottom: 16 }} />
                        <div className="ha-empty-title">暂无关联的 Skill</div>
                        <button className="action-btn primary" style={{marginTop: 12}} onClick={() => setAddSkillModal(true)}>+ 添加 Skill</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSkills.map(s => (
                    <tr key={s.skillId}>
                      <td>
                        <div className="ha-name-link" onClick={() => navigate(`/skill-center/skill/${s.skillId}`)}>{s.skillName}</div>
                        <div style={{fontSize: 12, color: '#8c8c8c'}}>{s.skillId}</div>
                      </td>
                      <td>
                        <span className="ha-status-tag" style={{ background: '#f6ffed', color: '#52c41a', borderColor: '#b7eb8f' }}>
                          {s.status}
                        </span>
                      </td>
                      <td><span className="ha-desc-cell">{s.description}</span></td>
                      <td><span className="ha-version-badge">{s.activeVersion}</span></td>
                      <td>
                        <div className="ha-row-actions">
                          <button onClick={() => setModifyVersionModal(s)}>修改版本</button>
                          <button className="ha-delete-btn" onClick={() => handleRemoveSkill(s.skillId)}>移除</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {toast && <div className={`ha-toast ha-toast-${toast.type}`}>{toast.msg}</div>}

      {modifyVersionModal && (
        <ModifyVersionModal 
          pkg={pkg}
          skillItem={modifyVersionModal}
          onClose={() => setModifyVersionModal(null)}
          onChangeVersion={handleChangeVersion}
        />
      )}

      {addSkillModal && (
        <AddSkillToPkgModal
          pkg={pkg}
          onClose={() => setAddSkillModal(false)}
          onAdd={handleAddSkill}
        />
      )}

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <IconAlertTriangle size={40} style={{ color: '#ff4d4f', margin: '0 auto 16px', display: 'block' }} />
            <div className="modal-message">确定要删除技能包 <strong>{confirmDelete.name}</strong> 吗？此操作不可恢复。</div>
            <div style={{display:'flex', gap: 12, justifyContent:'center'}}>
              <button className="action-btn primary" style={{background:'#ff4d4f', borderColor:'#ff4d4f'}} onClick={doDelete}>删除</button>
              <button className="action-btn" onClick={() => setConfirmDelete(null)}>取消</button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}
