import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHarnessAgents, HARNESS_TYPES, IM_TYPES, SKILL_OPTIONS } from '../store/harnessAgentStore.jsx'
import './CreateHarnessAgent.css'

export default function CreateHarnessAgent() {
  const navigate = useNavigate()
  const { dispatch } = useHarnessAgents()
  const [activeAnchor, setActiveAnchor] = useState('basic-info')
  const [toast, setToast] = useState(null)
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    name: '',
    description: '',
    harnessType: '',
    owner: 'admin',
    tags: '',
    // harness config
    endpoint: '',
    model: '',
    prompt: '',
    concurrency: 5,
    timeout: 120,
    retry: 3,
    // capability
    skills: [],
    memoryEnabled: false,
    memorySpace: '',
    workspace: 'Demo项目',
    imType: '',
    imWebhookUrl: '',
    // resources
    k8sCluster: '',
    replicasMode: 'fixed',
    replicas: 1,
    cpu: 1,
    memory: 2,
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

  const toggleSkill = (skill) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  const scrollTo = (id) => {
    setActiveAnchor(id)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = '请输入名称'
    if (!form.harnessType) errs.harnessType = '请选择 Harness 类型'
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
        harnessType: form.harnessType,
        owner: form.owner,
        tags: form.tags.split(/[,，\s]+/).filter(Boolean),
        endpoint: form.endpoint,
        model: form.model,
        prompt: form.prompt,
        concurrency: Number(form.concurrency),
        timeout: Number(form.timeout),
        retry: Number(form.retry),
        skills: form.skills,
        memoryEnabled: form.memoryEnabled,
        memorySpace: form.memorySpace,
        workspace: form.workspace,
        imType: form.imType,
        imConfig: { webhookUrl: form.imWebhookUrl },
        k8sCluster: form.k8sCluster,
        replicasMode: form.replicasMode,
        replicas: Number(form.replicas),
        cpu: Number(form.cpu),
        memory: Number(form.memory),
        cluster: form.k8sCluster,
      },
    })
    showToast('Harness Agent 创建成功')
    setTimeout(() => navigate('/harness-agent'), 800)
  }

  const goBack = () => navigate('/harness-agent')

  return (
    <div className="create-app-page">
      <div className="create-app-header">
        <button className="back-btn" onClick={goBack}>⬅</button>
        <div className="breadcrumb">
          <span className="bc-item" onClick={goBack}>Harness Agent</span>
          <span className="bc-separator"> &gt; </span>
          <span className="bc-current">创建 Harness Agent</span>
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
                <label>Harness 类型：<span className="required">*</span></label>
                <div style={{flex: 1}}>
                  <select name="harnessType" value={form.harnessType} onChange={handleChange} style={{width:'100%'}}>
                    <option value="">请选择</option>
                    {HARNESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.harnessType && <div className="cha-field-error">{errors.harnessType}</div>}
                </div>
              </div>
              <div className="form-row">
                <label>Owner：</label>
                <input type="text" name="owner" value={form.owner} onChange={handleChange} />
              </div>
              <div className="form-row">
                <label>标签：</label>
                <input type="text" name="tags" value={form.tags} onChange={handleChange} placeholder="多个标签用逗号分隔" />
              </div>
            </section>

            {/* Harness 配置 */}
            <section id="harness-config" className="form-section">
              <h3 className="section-title">Harness 配置</h3>
              <p className="section-desc">
                当前 Harness 类型：<strong>{form.harnessType || '未选择'}</strong>
              </p>
              <div className="form-row">
                <label>运行入口：</label>
                <input type="text" name="endpoint" value={form.endpoint} onChange={handleChange} placeholder="http://..." />
              </div>
              <div className="form-row">
                <label>模型名称：</label>
                <input type="text" name="model" value={form.model} onChange={handleChange} placeholder="例如 gpt-4o / claude-sonnet-4" />
              </div>
              <div className="form-row align-start">
                <label>System Prompt：</label>
                <textarea name="prompt" value={form.prompt} onChange={handleChange} placeholder="输入 Agent 的系统提示词" style={{height: 100}} />
              </div>
              <div className="form-row">
                <label>并发数：</label>
                <div className="number-input-group">
                  <input type="number" name="concurrency" value={form.concurrency} onChange={handleChange} min={1} />
                </div>
              </div>
              <div className="form-row">
                <label>超时时间：</label>
                <div className="number-input-group">
                  <input type="number" name="timeout" value={form.timeout} onChange={handleChange} min={1} />
                  <span className="unit">秒</span>
                </div>
              </div>
              <div className="form-row">
                <label>重试次数：</label>
                <div className="number-input-group">
                  <input type="number" name="retry" value={form.retry} onChange={handleChange} min={0} />
                  <span className="unit">次</span>
                </div>
              </div>
            </section>

            {/* 基础能力挂载 */}
            <section id="capabilities" className="form-section">
              <h3 className="section-title">基础能力挂载</h3>
              <div className="form-row align-start">
                <label>Skill 绑定：</label>
                <div className="cha-skill-tags">
                  {SKILL_OPTIONS.map(s => (
                    <span
                      key={s}
                      className={`cha-skill-tag ${form.skills.includes(s) ? 'selected' : ''}`}
                      onClick={() => toggleSkill(s)}
                    >{s}</span>
                  ))}
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
              <div className="form-row">
                <label>工作区：</label>
                <select name="workspace" value={form.workspace} onChange={handleChange}>
                  <option value="Demo项目">Demo项目</option>
                  <option value="生产环境">生产环境</option>
                </select>
              </div>
              <div className="form-row">
                <label>IM 类型：</label>
                <select name="imType" value={form.imType} onChange={handleChange}>
                  <option value="">请选择</option>
                  {IM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              {form.imType && (
                <div className="form-row">
                  <label>Webhook URL：</label>
                  <input type="text" name="imWebhookUrl" value={form.imWebhookUrl} onChange={handleChange} placeholder="https://..." />
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
                <label>Pod 副本数：</label>
                <div className="complex-input">
                  <div className="radio-options">
                    <label>
                      <input type="radio" name="replicasMode" value="fixed" checked={form.replicasMode === 'fixed'} onChange={handleChange} />
                      固定数量
                    </label>
                    <label>
                      <input type="radio" name="replicasMode" value="elastic" checked={form.replicasMode === 'elastic'} onChange={handleChange} />
                      弹性伸缩
                    </label>
                  </div>
                  <div className="number-input-group mt-2">
                    <input type="number" name="replicas" value={form.replicas} onChange={handleChange} min={1} />
                    <span className="unit">个</span>
                  </div>
                </div>
              </div>
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
              <div className="form-row">
                <label>数据卷：</label>
                <button className="add-btn text-btn">+ 添加数据卷</button>
              </div>
              <div className="form-row">
                <label>网络配置：</label>
                <button className="add-btn text-btn">+ 添加网络入口</button>
              </div>
            </section>
          </div>

          <div className="anchor-nav">
            <div className="anchor-nav-inner">
              {[
                ['basic-info', '基本信息'],
                ['harness-config', 'Harness 配置'],
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
