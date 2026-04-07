import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSkills } from '../store/skillStore'
import PageLayout from '../components/PageLayout'

export default function SkillDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { skills } = useSkills()
  const [toast, setToast] = useState(null)

  const skill = skills.find(s => s.id === id)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  if (!skill) {
    return (
      <div className="create-app-page">
        <div className="ha-empty-card-state" style={{marginTop: 60}}>未找到该 Skill</div>
      </div>
    )
  }

  return (
    <PageLayout
      title={
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <button className="back-btn" onClick={() => navigate('/skill-center')}>⬅</button>
          <span>{skill.name}</span>
          <span className="ha-status-tag" style={{ marginLeft: 8, background: skill.status === '已发布' ? '#f6ffed' : '#f5f5f5', color: skill.status === '已发布' ? '#52c41a' : '#595959', borderColor: skill.status === '已发布' ? '#b7eb8f' : '#d9d9d9', fontSize: 13, height: 22, lineHeight: '20px' }}>
            {skill.status}
          </span>
        </div>
      }
      rightAction={
        <div style={{display:'flex', gap: 8}}>
          <button className="refresh-btn-sm" onClick={() => showToast('已刷新', 'info')}>↻ 刷新</button>
        </div>
      }
    >
      <div className="form-card-container" style={{maxWidth: 800, margin: '20px 0', border: 'none', background: 'transparent', boxShadow: 'none'}}>
        <div className="form-content">
          <h3 className="section-title" style={{paddingLeft: 0, marginTop: 0}}>基本信息</h3>
          <div className="form-row"><label>ID：</label><div>{skill.id}</div></div>
          <div className="form-row"><label>名称：</label><div>{skill.name}</div></div>
          <div className="form-row"><label>来源类型：</label><div>{skill.sourceType}</div></div>
          <div className="form-row"><label>描述：</label><div>{skill.description || '-'}</div></div>
          <div className="form-row"><label>最新版本：</label><div><span className="ha-version-badge">{skill.latestVersion}</span></div></div>
          <div className="form-row"><label>创建时间：</label><div>{skill.createdAt}</div></div>
          <div className="form-row"><label>更新时间：</label><div>{skill.updatedAt}</div></div>

          <h3 className="section-title" style={{paddingLeft: 0, marginTop: 40}}>版本列表</h3>
          <div className="data-table-wrap" style={{marginLeft: 0}}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>版本号</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {skill.versions.map(v => (
                  <tr key={v}>
                    <td><span className="ha-version-badge">{v}</span></td>
                    <td>{v === skill.latestVersion ? <span style={{color: '#52c41a'}}>最新</span> : '历史版本'}</td>
                    <td>
                      <div className="ha-row-actions">
                        <button onClick={() => showToast('查看版本详情功能尚未实现')}>查看</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {toast && <div className={`ha-toast ha-toast-${toast.type}`}>{toast.msg}</div>}
    </PageLayout>
  )
}
