import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSuperAgents, VERSIONS, IM_TYPES } from '../store/superAgentStore.jsx'
import TagSelectModal from '../components/TagSelectModal'
import SkillSelectionModal from '../components/SkillSelectionModal'
import { IconArrowLeft, IconChevronRight } from '../components/Icons'
import './CreateSuperAgent.css'

export default function CreateSuperAgent() {
  const navigate = useNavigate()
  const { dispatch } = useSuperAgents()
  const [activeAnchor, setActiveAnchor] = useState('basic-info')
  const [toast, setToast] = useState(null)
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    name: '',
    description: '',
    version: '',
    owner: 'admin',
    tags: [],
    // config
    model: '',
    // capability
    skills: [],
    memoryEnabled: false,
    memorySpace: '',
    // resources
    k8sCluster: '',
    resourceSpec: 'standard',
    cpu: 4,
    memory: 4,
  })

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleResourceSpecChange = (spec) => {
    const specs = {
      lite: { cpu: 2, memory: 2 },
      standard: { cpu: 4, memory: 4 },
      heavy: { cpu: 8, memory: 8 },
      custom: { cpu: form.cpu, memory: form.memory }
    }
    setForm(prev => ({ ...prev, resourceSpec: spec, cpu: specs[spec].cpu, memory: specs[spec].memory }))
  }

  const scrollTo = (id) => {
    setActiveAnchor(id)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = '请输入名称'
    if (!form.version) errs.version = '请选择版本'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) {
      showToast('请填写必填项', 'error')
      return
    }
    dispatch({
      type: 'CREATE',
      payload: {
        name: form.name.trim(),
        description: form.description,
        version: form.version,
        owner: form.owner,
        tags: form.tags,
        model: form.model,
        skills: form.skills,
        memoryEnabled: form.memoryEnabled,
        memorySpace: form.memorySpace,
        k8sCluster: form.k8sCluster,
        resourceSpec: form.resourceSpec,
        cpu: Number(form.cpu),
        memory: Number(form.memory),
        cluster: form.k8sCluster,
      },
    })
    showToast('Super Agent 创建成功')
    setTimeout(() => navigate('/super-agent'), 800)
  }

  const goBack = () => navigate('/super-agent')

  return (
    <div className="create-app-page">
      <div className="create-app-header">
        <button className="back-btn" onClick={goBack} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconArrowLeft size={16} /></button>
        <div className="breadcrumb">
          <span className="bc-item" onClick={goBack}>Super Agent</span>
          <span className="bc-separator"> <IconChevronRight size={12} /> </span>
          <span className="bc-current">创建 Super Agent</span>
        </div>
      </div>

      <div className="create-app-body">
        <div className="form-card-container">
          <div className="form-content">
            {/* 基本信息 */}
            <section id="basic-info" className="form-section">
              <h3 className="section-title">基本信息</h3>
              <div className="form-row">
                <label>名称：<span className="required">*</span></label>
                <div style={{flex: 1}}>
                  <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="请输入 Agent 名称" style={{width:'100%'}} />
                  {errors.name && <div className="cha-field-error">{errors.name}</div>}
                </div>
              </div>
              <div className="form-row align-start">
                <label>描述：</label>
                <div className="textarea-wrapper">
                  <textarea name="description" value={form.description} onChange={handleChange} placeholder="选填" maxLength={512} />
                  <span className="char-count">{form.description.length}/512</span>
                </div>
              </div>
              <div className="form-row">
                <label>版本：<span className="required">*</span></label>
                <div style={{flex: 1}}>
                  <select name="version" value={form.version} onChange={handleChange} style={{width:'100%'}}>
                    <option value="">请选择版本</option>
                    {VERSIONS.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  {errors.version && <div className="cha-field-error">{errors.version}</div>}
                </div>
              </div>
              <div className="form-row">
                <label>Owner：</label>
                <input type="text" value="admin" disabled style={{ background: '#f5f7fa', color: '#999' }} />
              </div>
              <div className="form-row">
                <label>标签：</label>
                <div style={{flex: 1}}>
                  <TagSelectModal value={form.tags} onChange={tags => setForm(prev => ({...prev, tags}))} />
                </div>
              </div>
            </section>

            {/* Agent 配置 */}
            <section id="agent-config" className="form-section">
              <h3 className="section-title">Agent 配置</h3>
              <div className="form-row">
                <label>模型名称：</label>
                <input type="text" name="model" value={form.model} onChange={handleChange} placeholder="例如 gpt-4o / claude-sonnet-4" />
              </div>
            </section>

            {/* 基础能力挂载 */}
            <section id="capabilities" className="form-section">
              <h3 className="section-title">基础能力挂载</h3>
              <div className="form-row align-start">
                <label>Skill 绑定：</label>
                <div style={{flex: 1}}>
                  <SkillSelectionModal value={form.skills} onChange={skills => setForm(prev => ({...prev, skills}))} />
                </div>
              </div>
              <div className="form-row">
                <label>Memory：</label>
                <label className="checkbox-label">
                  <input type="checkbox" name="memoryEnabled" checked={form.memoryEnabled} onChange={handleChange} />
                  启用 Memory
                </label>
              </div>
              {form.memoryEnabled && (
                <div className="form-row">
                  <label>Memory 空间：</label>
                  <select name="memorySpace" value={form.memorySpace} onChange={handleChange}>
                    <option value="">请选择</option>
                    <option value="insight-mem-01">insight-mem-01</option>
                    <option value="support-mem-01">support-mem-01</option>
                    <option value="pipeline-mem-01">pipeline-mem-01</option>
                  </select>
                </div>
              )}
            </section>

            {/* 资源与部署 */}
            <section id="resources" className="form-section">
              <h3 className="section-title">资源与部署</h3>
              <div className="form-row">
                <label>K8s 集群：</label>
                <select name="k8sCluster" value={form.k8sCluster} onChange={handleChange}>
                  <option value="">请选择</option>
                  <option value="cls-prod-cluster-1">cls-prod-cluster-1</option>
                  <option value="cls-dev-cluster-2">cls-dev-cluster-2</option>
                </select>
              </div>
              <div className="form-row align-start">
                <label>资源规格：</label>
                <div className="resource-tier-group" style={{display:'flex', gap:16, flexWrap:'wrap', flex: 1}}>
                  {[
                    {id: 'lite', label: '轻量级', desc: '2C2G'},
                    {id: 'standard', label: '标准级', desc: '4C4G'},
                    {id: 'heavy', label: '重量级', desc: '8C8G'},
                    {id: 'custom', label: '自定义', desc: '手动配置'}
                  ].map(tier => (
                    <div 
                      key={tier.id} 
                      className={`resource-tier-card ${form.resourceSpec === tier.id ? 'active' : ''}`}
                      onClick={() => handleResourceSpecChange(tier.id)}
                    >
                      <div className="rt-label">{tier.label}</div>
                      <div className="rt-desc">{tier.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              {form.resourceSpec === 'custom' && (
                <>
                  <div className="form-row">
                    <label>CPU：</label>
                    <div className="number-input-group">
                      <input type="number" name="cpu" value={form.cpu} onChange={handleChange} min={1} />
                      <span className="unit">核</span>
                    </div>
                  </div>
                  <div className="form-row">
                    <label>内存：</label>
                    <div className="number-input-group">
                      <input type="number" name="memory" value={form.memory} onChange={handleChange} min={1} />
                      <span className="unit">Gi</span>
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>

          <div className="anchor-nav">
            <div className="anchor-nav-inner">
              {[
                ['basic-info', '基本信息'],
                ['agent-config', 'Agent 配置'],
                ['capabilities', '基础能力挂载'],
                ['resources', '资源与部署'],
              ].map(([id, label]) => (
                <div key={id} onClick={() => scrollTo(id)} className={`anchor-link ${activeAnchor === id ? 'active' : ''}`}>{label}</div>
              ))}
            </div>
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
