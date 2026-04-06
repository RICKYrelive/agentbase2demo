import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './CreateAgentApp.css'

export default function CreateAgentApp() {
  const navigate = useNavigate()
  const [activeAnchor, setActiveAnchor] = useState('basic-info')
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deployMode: 'single',
    imageRepo: '',
    containerImage: '',
    k8sCluster: '',
    replicasMode: 'fixed',
    replicas: 1,
    cpu: 1,
    memory: 2,
    db: '',
    memoryComp: '',
    modelRouting: '',
    mcpService: '',
    observerEnabled: false,
    envMode: 'table',
    cmd: '',
    args: ''
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const goBack = () => navigate('/agent-runtime')

  const scrollTo = (id) => {
    setActiveAnchor(id)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="create-app-page">
      <div className="create-app-header">
        <button className="back-btn" onClick={goBack}>⬅</button>
        <div className="breadcrumb">
          <span className="bc-item" onClick={goBack}>Agent 应用运行时</span>
          <span className="bc-separator"> &gt; </span>
          <span className="bc-current">创建 Agent 应用</span>
        </div>
      </div>
      
      <div className="create-app-body">
        <div className="form-card-container">
          <div className="form-content">
            <section id="basic-info" className="form-section">
              <h3 className="section-title">基本信息</h3>
              <div className="form-row">
                <label>名称：<span className="required">*</span></label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} />
              </div>
              <div className="form-row align-start">
                <label>描述：</label>
                <div className="textarea-wrapper">
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    placeholder="选填"
                    maxLength={512}
                  />
                  <span className="char-count">{formData.description.length}/512</span>
                </div>
              </div>
            </section>

            <section id="image-config" className="form-section">
              <h3 className="section-title">镜像</h3>
              <div className="form-row">
                <label>部署模式：</label>
                <div className="radio-options">
                  <label>
                    <input type="radio" name="deployMode" value="single" checked={formData.deployMode === 'single'} onChange={handleChange} />
                    部署单个容器镜像
                  </label>
                  <label>
                    <input type="radio" name="deployMode" value="helm" checked={formData.deployMode === 'helm'} onChange={handleChange} />
                    通过 Helm Chart 部署
                  </label>
                </div>
              </div>
              <div className="form-row">
                <label>镜像仓库：</label>
                <select name="imageRepo" value={formData.imageRepo} onChange={handleChange}>
                  <option value="">请选择</option>
                  <option value="dockerhub">Docker Hub</option>
                  <option value="aliyun">Aliyun Registry</option>
                </select>
              </div>
              <div className="form-row">
                <label>容器镜像：</label>
                <div className="container-image-select">
                  <input type="text" name="containerImage" value={formData.containerImage} onChange={handleChange} placeholder="请选择或输入" />
                  <button className="icon-btn">☰</button>
                </div>
              </div>
            </section>

            <section id="resources" className="form-section">
              <h3 className="section-title">资源与网络</h3>
              <div className="form-row">
                <label>K8s 集群：</label>
                <select name="k8sCluster" value={formData.k8sCluster} onChange={handleChange}>
                  <option value="">请选择</option>
                  <option value="cls-prod">cls-prod-cluster-1</option>
                  <option value="cls-dev">cls-dev-cluster-2</option>
                </select>
              </div>
              <div className="form-row align-start">
                <label>Pod 副本数：</label>
                <div className="complex-input">
                  <div className="radio-options">
                    <label>
                      <input type="radio" name="replicasMode" value="fixed" checked={formData.replicasMode === 'fixed'} onChange={handleChange} />
                      固定数量
                    </label>
                    <label>
                      <input type="radio" name="replicasMode" value="elastic" checked={formData.replicasMode === 'elastic'} onChange={handleChange} />
                      弹性伸缩
                    </label>
                  </div>
                  <div className="number-input-group mt-2">
                    <input type="number" name="replicas" value={formData.replicas} onChange={handleChange} />
                    <span className="unit">个</span>
                  </div>
                </div>
              </div>
              <div className="form-row">
                <label>CPU：</label>
                <div className="number-input-group">
                  <input type="number" name="cpu" value={formData.cpu} onChange={handleChange} />
                  <span className="unit">核</span>
                </div>
              </div>
              <div className="form-row">
                <label>内存：</label>
                <div className="number-input-group">
                  <input type="number" name="memory" value={formData.memory} onChange={handleChange} />
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

            <section id="services" className="form-section">
              <h3 className="section-title">服务与组件</h3>
              <p className="section-desc">关联以下组件后，系统将自动注入相应的环境变量以供 Agent 应用使用。</p>
              <div className="form-row">
                <label>AI 数据库：</label>
                <select name="db" value={formData.db} onChange={handleChange}><option value="">请选择</option></select>
              </div>
              <div className="form-row">
                <label>记忆体：</label>
                <select name="memoryComp" value={formData.memoryComp} onChange={handleChange}><option value="">请选择</option></select>
              </div>
              <div className="form-row">
                <label>AI 模型路由：</label>
                <select name="modelRouting" value={formData.modelRouting} onChange={handleChange}><option value="">请选择</option></select>
              </div>
              <div className="form-row">
                <label>MCP 服务：</label>
                <select name="mcpService" value={formData.mcpService} onChange={handleChange}><option value="">请选择</option></select>
              </div>
              <div className="form-row">
                <label>观测服务：</label>
                <label className="checkbox-label">
                  <input type="checkbox" name="observerEnabled" checked={formData.observerEnabled} onChange={handleChange} />
                  启用全链路观测 (Trace)
                </label>
              </div>
            </section>

            <section id="env-vars" className="form-section">
              <h3 className="section-title">环境变量</h3>
              <div className="env-tabs">
                <div className={`env-tab ${formData.envMode === 'table' ? 'active' : ''}`} onClick={() => setFormData({...formData, envMode: 'table'})}>表格</div>
                <div className={`env-tab ${formData.envMode === 'yaml' ? 'active' : ''}`} onClick={() => setFormData({...formData, envMode: 'yaml'})}>YAML</div>
                <div className={`env-tab ${formData.envMode === 'json' ? 'active' : ''}`} onClick={() => setFormData({...formData, envMode: 'json'})}>JSON</div>
              </div>
              {formData.envMode === 'table' && (
                <div className="env-table-view">
                  <button className="action-btn sm">+ 添加</button>
                  <div className="empty-env">暂无环境变量</div>
                </div>
              )}
              {formData.envMode !== 'table' && (
                <textarea className="code-textarea" placeholder={`在此输入 ${formData.envMode.toUpperCase()} 格式的环境变量`}></textarea>
              )}
            </section>

            <section id="startup-cmd" className="form-section">
              <h3 className="section-title">启动命令</h3>
              <div className="form-row align-start">
                <label>命令：</label>
                <textarea name="cmd" value={formData.cmd} onChange={handleChange} placeholder="相当于 Dockerfile 中的 ENTRYPOINT"></textarea>
              </div>
              <div className="form-row align-start">
                <label>参数：</label>
                <textarea name="args" value={formData.args} onChange={handleChange} placeholder="相当于 Dockerfile 中的 CMD"></textarea>
              </div>
            </section>
          </div>

          <div className="anchor-nav">
            <div className="anchor-nav-inner">
              <div onClick={() => scrollTo('basic-info')} className={`anchor-link ${activeAnchor === 'basic-info' ? 'active' : ''}`}>基本信息</div>
              <div onClick={() => scrollTo('image-config')} className={`anchor-link ${activeAnchor === 'image-config' ? 'active' : ''}`}>镜像</div>
              <div onClick={() => scrollTo('resources')} className={`anchor-link ${activeAnchor === 'resources' ? 'active' : ''}`}>资源与网络</div>
              <div onClick={() => scrollTo('services')} className={`anchor-link ${activeAnchor === 'services' ? 'active' : ''}`}>服务与组件</div>
              <div onClick={() => scrollTo('env-vars')} className={`anchor-link ${activeAnchor === 'env-vars' ? 'active' : ''}`}>环境变量</div>
              <div onClick={() => scrollTo('startup-cmd')} className={`anchor-link ${activeAnchor === 'startup-cmd' ? 'active' : ''}`}>启动命令</div>
            </div>
          </div>
        </div>
      </div>

      <div className="create-app-footer">
        <button className="action-btn primary" onClick={goBack}>确定</button>
        <button className="action-btn default" onClick={goBack}>取消</button>
      </div>
    </div>
  )
}
