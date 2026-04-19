import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSkills } from '../store/skillStore'
import { IconArrowLeft, IconUpload } from '../components/Icons'

export default function UpdateSkill() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { skills, dispatch } = useSkills()
  const [toast, setToast] = useState(null)
  const [errors, setErrors] = useState({})

  const skill = skills.find(s => s.id === id)
  
  const [method, setMethod] = useState('markdown')
  const [form, setForm] = useState({
    name: '',
    description: '',
    sourceType: '自定义',
    markdown: '',
  })

  useEffect(() => {
    if (skill) {
      setForm({
        name: skill.name,
        description: skill.description || '',
        sourceType: skill.sourceType || '自定义',
        markdown: skill.versions?.slice(-1)[0]?.files?.find(f => f.name === 'main.js')?.content || '',
      })
      // If the last version has a zip-like structure, maybe default to zip? 
      // For now, let's keep it simple.
    }
  }, [skill])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (method === 'markdown' && !form.markdown.trim()) errs.markdown = '请输入 SKILL MarkDown'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const getNextVersion = (latestVer) => {
    if (!latestVer) return 'v1'
    const num = parseInt(latestVer.substring(1))
    return `v${num + 1}`
  }

  const handleSubmit = () => {
    if (!validate()) {
      showToast('请填写必填项', 'error')
      return
    }
    dispatch({
      type: 'UPDATE_SKILL',
      skillId: id,
      payload: {
        description: form.description,
        summary: method === 'markdown' ? form.markdown : 'Updated Binary Content',
        creationMethod: method
      },
    })
    showToast('Skill 版本更新成功')
    setTimeout(() => navigate('/skill-center'), 800)
  }

  const goBack = () => navigate('/skill-center')

  if (!skill) return <div className="ha-empty-card-state" style={{marginTop: 60}}>未找到该 Skill</div>

  const nextVersion = getNextVersion(skill.latestVersion)

  return (
    <div className="create-app-page">
      <div className="create-app-header">
        <button className="ha-back-button" onClick={goBack} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconArrowLeft size={18} />
        </button>
        <div className="breadcrumb">
          <span className="bc-item" onClick={goBack}>Skill 中心</span>
          <span className="bc-separator"> &gt; </span>
          <span className="bc-current">更新 Skill</span>
        </div>
      </div>

      <div className="create-app-body">
        <div className="form-card-container">
          <div className="form-content">
            <section className="form-section">
              <h3 className="section-title">版本更新</h3>
              
              <div className="form-row">
                <label>名称：</label>
                <div style={{flex: 1}}>
                  <input type="text" value={form.name} disabled style={{ background: '#f7f8fa', color: '#86909c', width: '100%', border: '1px solid #e5e6eb', padding: '8px 12px', borderRadius: '4px' }} />
                </div>
              </div>

              <div className="form-row">
                <label>Skill ID：</label>
                <div style={{flex: 1}}>
                  <input type="text" value={id} disabled style={{ background: '#f7f8fa', color: '#86909c', width: '100%', border: '1px solid #e5e6eb', padding: '8px 12px', borderRadius: '4px' }} />
                </div>
              </div>

              <div className="form-row">
                <label>版本号：</label>
                <div style={{flex: 1}}>
                  <input type="text" value={nextVersion} disabled style={{ background: '#f7f8fa', color: '#1677ff', fontWeight: 600, width: '100%', border: '1px solid #e5e6eb', padding: '8px 12px', borderRadius: '4px' }} />
                  <div style={{ fontSize: 12, color: '#86909c', marginTop: 4 }}>此版本基于当前最新版本 {skill.latestVersion} 递增</div>
                </div>
              </div>

              <div className="form-row align-start">
                <label>描述：</label>
                <div className="textarea-wrapper" style={{flex: 1}}>
                  <textarea name="description" value={form.description} onChange={handleChange} placeholder="更新该版本的描述信息" maxLength={100} style={{width:'100%', minHeight: 60, padding: 8}} />
                  <div style={{textAlign: 'right', fontSize: 12, color: '#8c8c8c'}}>{form.description.length}/100</div>
                </div>
              </div>

              <div className="form-row">
                <label>更新方式：</label>
                <div style={{flex: 1}}>
                  <div className="skill-category-tabs" style={{ display:'inline-flex', marginBottom: 0 }}>
                    <div 
                      className={`skill-category-tab ${method === 'markdown' ? 'active' : ''}`}
                      onClick={() => setMethod('markdown')}
                    >
                      Markdown 定义
                    </div>
                    <div 
                      className={`skill-category-tab ${method === 'zip' ? 'active' : ''}`}
                      onClick={() => setMethod('zip')}
                    >
                      上传压缩包
                    </div>
                  </div>
                </div>
              </div>

              {method === 'markdown' ? (
                <div className="form-row align-start">
                  <label>SKILL MarkDown：<span className="required">*</span></label>
                  <div className="textarea-wrapper" style={{flex: 1}}>
                    <textarea 
                      name="markdown" 
                      value={form.markdown} 
                      onChange={handleChange} 
                      placeholder="请在此输入新的 SKILL MarkDown 定义内容..." 
                      style={{width:'100%', minHeight: 200, padding: 12, fontFamily: 'monospace'}} 
                    />
                    {errors.markdown && <div className="cha-field-error">{errors.markdown}</div>}
                  </div>
                </div>
              ) : (
                <div className="form-row align-start">
                  <label>上传压缩包：<span className="required">*</span></label>
                  <div style={{flex: 1}}>
                    <div className="zip-upload-dropzone">
                      <IconUpload size={32} style={{ color: '#86909c', marginBottom: 12 }} />
                      <div className="upload-text">点击或拖拽新的 Zip 压缩包到此处上传</div>
                      <div className="upload-hint">支持 .zip 格式，更新后将替换该版本文件</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-row">
                <label>来源类型：</label>
                <div style={{flex: 1}}>
                  <input type="text" value={form.sourceType} disabled style={{ background: '#f7f8fa', color: '#86909c', width: '100%', border: '1px solid #e5e6eb', padding: '8px 12px', borderRadius: '4px' }} />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="create-app-footer">
        <button className="action-btn primary" onClick={handleSubmit}>确认更新</button>
        <button className="action-btn default" onClick={goBack}>取消</button>
      </div>

      {toast && <div className={`ha-toast ha-toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}
