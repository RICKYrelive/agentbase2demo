import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useManagedAgents } from '../../store/managedAgentStore'
import './MAC.css'

const STEPS = ['基本信息', '模型与 Prompt', '工具绑定', '集成 / MCP', '运行环境', '确认发布']

const MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'platform' },
  { id: 'gpt-4o-mini', name: 'GPT-4o-mini', provider: 'platform' },
  { id: 'claude-sonnet-4', name: 'Claude Sonnet 4', provider: 'custom' },
  { id: 'glm-4-plus', name: 'GLM-4 Plus', provider: 'platform' },
  { id: 'glm-4-flash', name: 'GLM-4 Flash', provider: 'platform' },
]

const BUILTIN_TOOLS = [
  { id: 'bt-bash', name: 'bash', risk: 'high' },
  { id: 'bt-read', name: 'read_file', risk: 'low' },
  { id: 'bt-write', name: 'write_file', risk: 'high' },
  { id: 'bt-edit', name: 'edit_file', risk: 'medium' },
  { id: 'bt-glob', name: 'glob', risk: 'low' },
  { id: 'bt-grep', name: 'grep', risk: 'low' },
  { id: 'bt-fetch', name: 'web_fetch', risk: 'medium' },
  { id: 'bt-search', name: 'web_search', risk: 'low' },
]

export default function MACCreateAgent() {
  const navigate = useNavigate()
  const { dispatch, environments, mcps } = useManagedAgents()
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)

  const [form, setForm] = useState({
    name: '',
    description: '',
    visibility: 'team',
    tags: [],
    model: { provider: 'platform', modelId: 'gpt-4o', temperature: 0.7, maxTokens: 4096 },
    systemPrompt: '',
    tools: ['bt-read', 'bt-glob', 'bt-grep', 'bt-search'],
    mcpServers: [],
    environmentId: environments[0]?.id || '',
  })

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const validate = () => {
    const errs = {}
    if (step === 0 && !form.name.trim()) errs.name = 'Agent 名称不能为空'
    if (step === 1 && !form.systemPrompt.trim()) errs.systemPrompt = 'System Prompt 不能为空'
    if (step === 4 && !form.environmentId) errs.environmentId = '请选择运行环境'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const next = () => { if (validate()) setStep(s => Math.min(s + 1, STEPS.length - 1)) }
  const prev = () => { setStep(s => Math.max(s - 1, 0)); setErrors({}) }

  const handlePublish = () => {
    dispatch({ type: 'CREATE_AGENT', payload: form })
    showToast('Agent 创建成功')
    setTimeout(() => navigate('/managed-agent/agents'), 1500)
  }

  const handleDraft = () => {
    dispatch({ type: 'CREATE_AGENT', payload: { ...form, status: 'draft' } })
    showToast('已保存为草稿', 'info')
    setTimeout(() => navigate('/managed-agent/agents'), 1500)
  }

  const toggleTool = (toolId) => {
    setForm(prev => ({
      ...prev,
      tools: prev.tools.includes(toolId) ? prev.tools.filter(t => t !== toolId) : [...prev.tools, toolId]
    }))
  }

  const toggleMcp = (mcpId) => {
    setForm(prev => ({
      ...prev,
      mcpServers: prev.mcpServers.includes(mcpId) ? prev.mcpServers.filter(m => m !== mcpId) : [...prev.mcpServers, mcpId]
    }))
  }

  return (
    <div className="create-app-page">
      <div className="create-app-header">
        <button className="back-btn" onClick={() => navigate('/managed-agent/agents')}>← 返回</button>
        <div className="breadcrumb">
          <span className="bc-item" onClick={() => navigate('/managed-agent/agents')}>Agents</span>
          <span className="bc-sep">/</span>
          <span className="bc-current">创建 Agent</span>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="mac-wizard-steps">
        {STEPS.map((label, i) => (
          <div key={i} className={`mac-step-item ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`} onClick={() => i < step && setStep(i)}>
            <div className="mac-step-num">{i < step ? '✓' : i + 1}</div>
            <div className="mac-step-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="create-app-body">
        <div className="mac-wizard-content">
          {/* Step 0: Basic Info */}
          {step === 0 && (
            <div className="form-card-container">
              <div className="form-content">
                <div className="form-section">
                  <div className="section-title">基本信息</div>
                  <div className="form-row">
                    <label className="form-label">Agent 名称 <span className="required">*</span></label>
                    <input className="form-input" value={form.name} onChange={e => updateForm('name', e.target.value)} placeholder="例如: data-analyst" />
                    {errors.name && <div className="cha-field-error">{errors.name}</div>}
                    <div className="form-help">建议使用 kebab-case 格式，3-64 字符</div>
                  </div>
                  <div className="form-row">
                    <label className="form-label">描述</label>
                    <textarea className="form-textarea" value={form.description} onChange={e => updateForm('description', e.target.value)} placeholder="描述 Agent 的功能和用途" rows={3} />
                  </div>
                  <div className="form-row">
                    <label className="form-label">可见范围</label>
                    <div className="radio-options">
                      {['private', 'team', 'workspace'].map(v => (
                        <label key={v} className="radio-label">
                          <input type="radio" name="visibility" checked={form.visibility === v} onChange={() => updateForm('visibility', v)} />
                          {{ private: '仅自己', team: '团队', workspace: '工作空间' }[v]}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Model & Prompt */}
          {step === 1 && (
            <div className="form-card-container">
              <div className="form-content">
                <div className="form-section">
                  <div className="section-title">模型与 Prompt</div>
                  <div className="form-row">
                    <label className="form-label">模型</label>
                    <select className="form-select" value={form.model.modelId} onChange={e => updateForm('model', { ...form.model, modelId: e.target.value })}>
                      {MODELS.map(m => <option key={m.id} value={m.id}>{m.name} ({m.provider})</option>)}
                    </select>
                  </div>
                  <div className="form-row">
                    <label className="form-label">Temperature: {form.model.temperature}</label>
                    <input type="range" min="0" max="2" step="0.1" value={form.model.temperature} onChange={e => updateForm('model', { ...form.model, temperature: parseFloat(e.target.value) })} style={{ width: '100%' }} />
                  </div>
                  <div className="form-row">
                    <label className="form-label">Max Tokens</label>
                    <input type="number" className="form-input" value={form.model.maxTokens} onChange={e => updateForm('model', { ...form.model, maxTokens: parseInt(e.target.value) })} />
                  </div>
                  <div className="form-row">
                    <label className="form-label">System Prompt <span className="required">*</span></label>
                    <div className="textarea-wrapper">
                      <textarea className="form-textarea" value={form.systemPrompt} onChange={e => updateForm('systemPrompt', e.target.value)} placeholder="定义 Agent 的行为准则、能力和约束..." rows={12} style={{ fontFamily: 'monospace' }} />
                      <span className="char-count">{form.systemPrompt.length} 字符</span>
                    </div>
                    {errors.systemPrompt && <div className="cha-field-error">{errors.systemPrompt}</div>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Tools */}
          {step === 2 && (
            <div className="form-card-container">
              <div className="form-content">
                <div className="form-section">
                  <div className="section-title">工具绑定</div>
                  <div className="form-help" style={{ marginBottom: 16 }}>选择 Agent 可以使用的工具。高风险工具调用时将需要审批。</div>
                  <div className="mac-tool-grid">
                    {BUILTIN_TOOLS.map(tool => {
                      const isSelected = form.tools.includes(tool.id)
                      const riskColors = { low: '#52c41a', medium: '#faad14', high: '#fa8c16' }
                      return (
                        <div key={tool.id} className={`mac-tool-card ${isSelected ? 'selected' : ''}`} onClick={() => toggleTool(tool.id)}>
                          <div className="mac-tool-check">{isSelected ? '☑' : '☐'}</div>
                          <div className="mac-tool-name">{tool.name}</div>
                          <div className="mac-tool-risk" style={{ color: riskColors[tool.risk] }}>{tool.risk}</div>
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ marginTop: 12, fontSize: 13, color: '#999' }}>已选择 {form.tools.length} 个工具</div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Integrations / MCP */}
          {step === 3 && (
            <div className="form-card-container">
              <div className="form-content">
                <div className="form-section">
                  <div className="section-title">集成 / MCP Provider</div>
                  <div className="form-help" style={{ marginBottom: 16 }}>连接外部 MCP Provider，自动发现可用工具。</div>
                  {mcps.length === 0 ? (
                    <div className="mac-empty-inline">还没有注册的 MCP Provider</div>
                  ) : (
                    <div className="mac-mcp-list">
                      {mcps.map(mcp => {
                        const isSelected = form.mcpServers.includes(mcp.id)
                        const statusColor = mcp.status === 'connected' ? '#52c41a' : '#999'
                        return (
                          <div key={mcp.id} className={`mac-mcp-item ${isSelected ? 'selected' : ''}`} onClick={() => toggleMcp(mcp.id)}>
                            <div className="mac-mcp-header">
                              <span className="mac-mcp-check">{isSelected ? '☑' : '☐'}</span>
                              <span className="mac-mcp-name">{mcp.name}</span>
                              <span className="mac-mcp-status" style={{ color: statusColor }}>● {mcp.status}</span>
                            </div>
                            <div className="mac-mcp-meta">{mcp.availableTools} 个可用工具 · {mcp.authType}</div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Environment */}
          {step === 4 && (
            <div className="form-card-container">
              <div className="form-content">
                <div className="form-section">
                  <div className="section-title">运行环境</div>
                  <div className="form-row">
                    <label className="form-label">选择环境</label>
                    <select className="form-select" value={form.environmentId} onChange={e => updateForm('environmentId', e.target.value)}>
                      <option value="">请选择</option>
                      {environments.map(env => <option key={env.id} value={env.id}>{env.name} ({env.runtime})</option>)}
                    </select>
                    {errors.environmentId && <div className="cha-field-error">{errors.environmentId}</div>}
                  </div>
                  {form.environmentId && (() => {
                    const env = environments.find(e => e.id === form.environmentId)
                    if (!env) return null
                    return (
                      <div className="mac-env-preview">
                        <div className="mac-env-row"><span>基础镜像</span><span>{env.baseImage}</span></div>
                        <div className="mac-env-row"><span>Runtime</span><span>{env.runtime}</span></div>
                        <div className="mac-env-row"><span>依赖</span><span>{env.dependencies.join(', ') || '-'}</span></div>
                        <div className="mac-env-row"><span>网络策略</span><span>{env.networkPolicy.mode}</span></div>
                        <div className="mac-env-row"><span>工作目录</span><span>{env.workDir}</span></div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="form-card-container">
              <div className="form-content">
                <div className="form-section">
                  <div className="section-title">确认发布</div>
                  <div className="mac-review-grid">
                    <div className="mac-review-item"><span className="mac-review-label">名称</span><span>{form.name}</span></div>
                    <div className="mac-review-item"><span className="mac-review-label">描述</span><span>{form.description || '-'}</span></div>
                    <div className="mac-review-item"><span className="mac-review-label">可见范围</span><span>{form.visibility}</span></div>
                    <div className="mac-review-item"><span className="mac-review-label">模型</span><span>{form.model.modelId}</span></div>
                    <div className="mac-review-item"><span className="mac-review-label">Temperature</span><span>{form.model.temperature}</span></div>
                    <div className="mac-review-item"><span className="mac-review-label">工具</span><span>{form.tools.length} 个</span></div>
                    <div className="mac-review-item"><span className="mac-review-label">MCP</span><span>{form.mcpServers.length} 个</span></div>
                    <div className="mac-review-item"><span className="mac-review-label">环境</span><span>{environments.find(e => e.id === form.environmentId)?.name || '-'}</span></div>
                  </div>
                  <div className="form-row" style={{ marginTop: 20 }}>
                    <label className="form-label">System Prompt 预览</label>
                    <pre className="mac-prompt-preview">{form.systemPrompt}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="create-app-footer">
        <div style={{ display: 'flex', gap: 12 }}>
          {step > 0 && <button className="action-btn" onClick={prev}>上一步</button>}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {step < STEPS.length - 1 && <button className="action-btn primary" onClick={next}>下一步</button>}
          {step === STEPS.length - 1 && (
            <>
              <button className="action-btn" onClick={handleDraft}>保存为草稿</button>
              <button className="action-btn primary" onClick={handlePublish}>发布</button>
            </>
          )}
          <button className="action-btn" onClick={() => navigate('/managed-agent/agents')}>取消</button>
        </div>
      </div>

      {toast && <div className={`ha-toast ha-toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}
