import { useState } from 'react'
import { useHarnessAgents } from '../store/harnessAgentStore'
import './TagSelectModal.css'

export default function TagSelectModal({ value = [], onChange }) {
  const { globalTags } = useHarnessAgents()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const toggleTag = (tag) => {
    if (value.includes(tag)) onChange(value.filter(t => t !== tag))
    else onChange([...value, tag])
  }
  const removeTag = (e, tag) => {
    e.stopPropagation()
    onChange(value.filter(t => t !== tag))
  }

  const filteredTags = globalTags.filter(t => t.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="tsm-wrapper">
      <div className="tsm-chips">
        {value.map(tag => (
          <span key={tag} className="tsm-tag-chip">
            {tag}
            <span className="tsm-tag-x" onClick={e => removeTag(e, tag)}>×</span>
          </span>
        ))}
        <button type="button" className="action-btn default" onClick={() => setOpen(true)}>+ 选择标签</button>
      </div>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{width: 480}}>
            <div className="modal-header" style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
              <h3 style={{margin:0}}>选择标签</h3>
              <button className="close-btn" style={{background:'none',border:'none',fontSize:20,cursor:'pointer'}} onClick={() => setOpen(false)}>×</button>
            </div>
            <div className="tsm-search" style={{marginBottom:16}}>
              <input 
                type="text" 
                placeholder="搜索已存在的标签..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                style={{width:'100%',padding:'8px 12px',border:'1px solid var(--color-border)',borderRadius:4, fontSize:14}}
              />
            </div>
            <div className="tsm-list">
              {filteredTags.length === 0 ? <div className="tsm-empty">无匹配标签</div> : 
                filteredTags.map(tag => {
                  const selected = value.includes(tag)
                  return (
                    <div key={tag} className={`tsm-option ${selected ? 'selected' : ''}`} onClick={() => toggleTag(tag)}>
                      <span>{tag}</span>
                      {selected && <span className="tsm-check">✓</span>}
                    </div>
                  )
                })
              }
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
