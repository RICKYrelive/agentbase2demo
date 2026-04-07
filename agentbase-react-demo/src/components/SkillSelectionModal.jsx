import { useState } from 'react'
import { useSkills } from '../store/skillStore'
import './SkillSelectionModal.css'

export default function SkillSelectionModal({ value = [], onChange }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('packages') // 'packages' | 'individual'
  const [search, setSearch] = useState('')
  const { skills, packages } = useSkills()

  const toggleSkill = (skillName) => {
    if (value.includes(skillName)) onChange(value.filter(s => s !== skillName))
    else onChange([...value, skillName])
  }

  const removeSkill = (e, skillName) => {
    e.stopPropagation()
    onChange(value.filter(s => s !== skillName))
  }

  const togglePackage = (pkg) => {
    const pkgSkillNames = pkg.skills.map(s => s.skillName)
    const hasAll = pkgSkillNames.every(sn => value.includes(sn))
    if (hasAll) {
      // Remove all
      onChange(value.filter(sn => !pkgSkillNames.includes(sn)))
    } else {
      // Add all missing
      const newSkills = [...value]
      pkgSkillNames.forEach(sn => {
        if (!newSkills.includes(sn)) newSkills.push(sn)
      })
      onChange(newSkills)
    }
  }

  const filteredIndividual = skills.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
  const filteredPackages = packages.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="ssm-wrapper">
      <div className="ssm-chips">
        {value.map(skill => (
          <span key={skill} className="cha-skill-tag selected ssm-chip">
            {skill}
            <span className="ssm-chip-x" onClick={(e) => removeSkill(e, skill)}>×</span>
          </span>
        ))}
        <button type="button" className="action-btn default" onClick={() => setOpen(true)}>+ 新增 Skill</button>
      </div>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal-card ssm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
              <h3 style={{margin:0}}>新增 Skill</h3>
              <button className="close-btn" style={{background:'none',border:'none',fontSize:20,cursor:'pointer'}} onClick={() => setOpen(false)}>×</button>
            </div>
            
            <div className="ssm-tabs">
              <div className={`ssm-tab ${tab === 'packages' ? 'active' : ''}`} onClick={() => setTab('packages')}>技能包</div>
              <div className={`ssm-tab ${tab === 'individual' ? 'active' : ''}`} onClick={() => setTab('individual')}>独立技能</div>
            </div>

            <div className="ssm-search" style={{marginBottom:16}}>
              <input 
                type="text" 
                placeholder={tab === 'packages' ? "搜索技能包..." : "搜索独立技能..."}
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                style={{width:'100%',padding:'8px 12px',border:'1px solid var(--color-border)',borderRadius:4, fontSize:14}}
              />
            </div>

            <div className="ssm-list-container">
              {tab === 'packages' && (
                <div className="ssm-package-list">
                  {filteredPackages.length === 0 ? <div className="ssm-empty">无匹配技能包</div> : (
                    filteredPackages.map(pkg => {
                      const pkgSkillNames = pkg.skills.map(s => s.skillName)
                      const selectedCount = pkgSkillNames.filter(sn => value.includes(sn)).length
                      const isAllSelected = selectedCount === pkgSkillNames.length
                      const isPartial = selectedCount > 0 && !isAllSelected
                      return (
                        <div key={pkg.id} className={`ssm-package-item ${isAllSelected ? 'selected' : ''}`} onClick={() => togglePackage(pkg)}>
                          <div className="ssm-pkg-header">
                            <span className="ssm-pkg-name">{pkg.name}</span>
                            <span className={`ssm-pkg-check ${isAllSelected ? 'checked' : isPartial ? 'partial' : ''}`}></span>
                          </div>
                          <div className="ssm-pkg-skills">包含: {pkgSkillNames.join(', ')}</div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}

              {tab === 'individual' && (
                <div className="ssm-individual-list">
                  {filteredIndividual.length === 0 ? <div className="ssm-empty">无匹配独立技能</div> : (
                    filteredIndividual.map(skill => (
                      <div key={skill.id} className={`ssm-individual-item ${value.includes(skill.name) ? 'selected' : ''}`} onClick={() => toggleSkill(skill.name)}>
                        <span>{skill.name}</span>
                        {value.includes(skill.name) && <span className="ssm-check">✓</span>}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div style={{marginTop:24, textAlign:'right'}}>
              <button className="action-btn primary" onClick={() => setOpen(false)}>完成</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
