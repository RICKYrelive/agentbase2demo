import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DataToolbar } from '../components/PageLayout'
import { useSkills } from '../store/skillStore'

const STATUS_COLORS = {
  '运行中': { bg: '#f6ffed', color: '#52c41a', border: '#b7eb8f' },
  '停止': { bg: '#f5f5f5', color: '#595959', border: '#d9d9d9' },
}

const columns = [
  { key: 'name', label: '技能包名称/ID' },
  { key: 'status', label: '状态' },
  { key: 'description', label: '描述' },
  { key: 'tags', label: '标签' },
  { key: 'skillsCount', label: '包含 Skills' },
  { key: 'createdAt', label: '创建时间' },
  { key: 'updatedAt', label: '更新时间' },
  { key: 'actions', label: '操作' },
]

export default function SkillPackageList() {
  const { packages, dispatch } = useSkills()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const filtered = packages.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.id.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const doDelete = () => {
    if (confirmDelete) {
      dispatch({ type: 'DELETE_PACKAGE', id: confirmDelete.id })
      showToast(`${confirmDelete.name} 已删除`)
      setConfirmDelete(null)
    }
  }

  return (
    <div className="skill-package-list">
      <DataToolbar
        buttons={
          <button className="action-btn primary" onClick={() => navigate('/skill-center/package/create')}>+ 创建技能包</button>
        }
      >
        <div className="search-input">
          <span className="search-icon">🔍</span>
          <input placeholder="搜索名称或ID" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="refresh-btn-sm" onClick={() => showToast('已刷新', 'info')}>↻</button>
      </DataToolbar>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="data-table-empty">
                  <div className="empty-state ha-empty">
                    <div className="empty-icon">📦</div>
                    <div className="ha-empty-title">还没有技能包</div>
                    <div className="ha-empty-desc">创建一个技能包，将多个相关的 Skill 组织在一起</div>
                    <button className="action-btn primary" style={{marginTop: 12}} onClick={() => navigate('/skill-center/package/create')}>+ 创建技能包</button>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map(pkg => {
                const sc = STATUS_COLORS[pkg.status] || STATUS_COLORS['停止']
                return (
                  <tr key={pkg.id}>
                    <td>
                      <div className="ha-name-link" onClick={() => navigate(`/skill-center/package/${pkg.id}`)}>{pkg.name}</div>
                      <div style={{fontSize: 12, color: '#8c8c8c'}}>{pkg.id}</div>
                    </td>
                    <td>
                      <span className="ha-status-tag" style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}>
                        {pkg.status}
                      </span>
                    </td>
                    <td><span className="ha-desc-cell">{pkg.description}</span></td>
                    <td>
                      <div className="ha-tags-cell">
                        {(pkg.tags || []).slice(0, 3).map(t => <span key={t} className="ha-mini-tag">{t}</span>)}
                        {(pkg.tags || []).length > 3 && <span className="ha-mini-tag">+{pkg.tags.length - 3}</span>}
                      </div>
                    </td>
                    <td><span className="ha-version-badge">{pkg.skillsCount} 个</span></td>
                    <td>{pkg.createdAt}</td>
                    <td>{pkg.updatedAt}</td>
                    <td>
                      <div className="ha-row-actions">
                        <button onClick={() => navigate(`/skill-center/package/${pkg.id}`)}>查看</button>
                        <button className="ha-delete-btn" onClick={() => setConfirmDelete(pkg)}>删除</button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {toast && (
        <div className={`ha-toast ha-toast-${toast.type}`}>{toast.msg}</div>
      )}

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">⚠️</div>
            <div className="modal-message">确定要删除技能包 <strong>{confirmDelete.name}</strong> 吗？此操作不可恢复。</div>
            <div style={{display:'flex', gap: 12, justifyContent:'center'}}>
              <button className="action-btn primary" style={{background:'#ff4d4f', borderColor:'#ff4d4f'}} onClick={doDelete}>删除</button>
              <button className="action-btn" onClick={() => setConfirmDelete(null)}>取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
