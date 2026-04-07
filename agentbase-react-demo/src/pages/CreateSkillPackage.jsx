import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSkills } from '../store/skillStore'
import TagSelectModal from '../components/TagSelectModal'

export default function CreateSkillPackage() {
  const navigate = useNavigate()
  const { dispatch } = useSkills()
  const [toast, setToast] = useState(null)
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    name: '',
    description: '',
    project: 'Demo项目',
    tags: [],
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
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) {
      showToast('请填写必填项', 'error')
      return
    }
    dispatch({
      type: 'CREATE_PACKAGE',
      payload: {
        name: form.name.trim(),
        description: form.description,
        project: form.project,
        tags: form.tags,
      },
    })
    showToast('技能包创建成功')
    setTimeout(() => navigate('/skill-center'), 800)
  }

  const goBack = () => navigate('/skill-center')

  return (
    <div className="create-app-page">
      <div className="create-app-header">
        <button className="back-btn" onClick={goBack}>⬅</button>
        <div className="breadcrumb">
          <span className="bc-item" onClick={goBack}>Skill 中心</span>
          <span className="bc-separator"> &gt; </span>
          <span className="bc-current">创建技能包</span>
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
                  <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="请输入技能包名称" style={{width:'100%'}} />
                  {errors.name && <div className="cha-field-error">{errors.name}</div>}
                </div>
              </div>
              <div className="form-row align-start">
                <label>描述：</label>
                <div className="textarea-wrapper" style={{flex: 1}}>
                  <textarea name="description" value={form.description} onChange={handleChange} placeholder="选填，描述该技能包的用途" maxLength={512} style={{width:'100%', minHeight: 80, padding: 8}} />
                  <div style={{textAlign: 'right', fontSize: 12, color: '#8c8c8c'}}>{form.description.length}/512</div>
                </div>
              </div>
              <div className="form-row">
                <label>所属项目：</label>
                <div style={{flex: 1}}>
                  <select name="project" value={form.project} onChange={handleChange} style={{width:'100%'}}>
                    <option value="Demo项目">Demo项目</option>
                    <option value="默认项目">默认项目</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <label>标签：</label>
                <div style={{flex: 1}}>
                  <TagSelectModal value={form.tags} onChange={tags => setForm(prev => ({...prev, tags}))} />
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
