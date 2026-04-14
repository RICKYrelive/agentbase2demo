import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSkills } from '../store/skillStore'
import { IconArrowLeft } from '../components/Icons'

export default function CreateSkill() {
  const navigate = useNavigate()
  const { dispatch } = useSkills()
  const [toast, setToast] = useState(null)
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    name: '',
    description: '',
    sourceType: '自定义',
    version: 'v1.0.0',
    summary: '',
  })

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
    if (!form.name.trim()) errs.name = '请输入名称'
    if (!form.version.trim()) errs.version = '请输入初始版本号'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) {
      showToast('请填写必填项', 'error')
      return
    }
    dispatch({
      type: 'CREATE_SKILL',
      payload: {
        name: form.name.trim(),
        description: form.description,
        sourceType: form.sourceType,
        versions: [form.version],
        latestVersion: form.version,
        summary: form.summary
      },
    })
    showToast('Skill 创建成功')
    setTimeout(() => navigate('/skill-center'), 800)
  }

  const goBack = () => navigate('/skill-center')

  return (
    <div className="create-app-page">
      <div className="create-app-header">
        <button className="back-btn" onClick={goBack} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconArrowLeft size={16} />
        </button>
        <div className="breadcrumb">
          <span className="bc-item" onClick={goBack}>Skill 中心</span>
          <span className="bc-separator"> &gt; </span>
          <span className="bc-current">创建 Skill</span>
        </div>
      </div>

      <div className="create-app-body">
        <div className="form-card-container">
          <div className="form-content">
            <section className="form-section">
              <h3 className="section-title">基本信息</h3>
              <div className="form-row">
                <label>名称：<span className="required">*</span></label>
                <div style={{flex: 1}}>
                  <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="请输入 Skill 名称" style={{width:'100%'}} />
                  {errors.name && <div className="cha-field-error">{errors.name}</div>}
                </div>
              </div>
              <div className="form-row align-start">
                <label>说明/摘要：</label>
                <div className="textarea-wrapper" style={{flex: 1}}>
                  <textarea name="description" value={form.description} onChange={handleChange} placeholder="简短的一句话描述该工具能力" maxLength={100} style={{width:'100%', minHeight: 60, padding: 8}} />
                  <div style={{textAlign: 'right', fontSize: 12, color: '#8c8c8c'}}>{form.description.length}/100</div>
                </div>
              </div>
              <div className="form-row align-start">
                <label>执行内容：</label>
                <div className="textarea-wrapper" style={{flex: 1}}>
                  <textarea name="summary" value={form.summary} onChange={handleChange} placeholder="填入 OpenAPI Spec 或具体执行代码..." style={{width:'100%', minHeight: 120, padding: 8}} />
                </div>
              </div>
              <div className="form-row">
                <label>来源类型：</label>
                <div style={{flex: 1}}>
                  <input type="text" value={form.sourceType} disabled style={{ background: '#f5f7fa', color: '#999', width: '100%' }} />
                </div>
              </div>
              <div className="form-row">
                <label>初始版本：<span className="required">*</span></label>
                <div style={{flex: 1}}>
                  <input type="text" name="version" value={form.version} onChange={handleChange} style={{width:'100%'}} />
                  {errors.version && <div className="cha-field-error">{errors.version}</div>}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="create-app-footer">
        <button className="action-btn primary" onClick={handleSubmit}>确定</button>
        <button className="action-btn default" onClick={goBack}>取消</button>
      </div>

      {toast && <div className={`ha-toast ha-toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}
