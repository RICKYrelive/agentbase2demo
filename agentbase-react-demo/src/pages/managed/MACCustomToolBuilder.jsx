import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './MAC.css'

export default function MACCustomToolBuilder() {
  const navigate = useNavigate()
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({
    name: '',
    namespace: '',
    description: '',
    endpoint: '',
    executionType: 'webhook',
    riskLevel: 'medium',
    approvalRequired: false,
    timeout: 30000,
    schema: '{\n  "type": "object",\n  "properties": {},\n  "required": []\n}',
    headers: '{}',
  })
  const [testResult, setTestResult] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleTest = () => {
    setTestResult({ status: 'success', result: 'Tool test completed successfully', duration: 150 })
    showToast('测试完成', 'info')
  }

  return (
    <div className="create-app-page">
      <div className="create-app-header">
        <button className="back-btn" onClick={() => navigate('/managed-agent/tools')}>← 返回</button>
        <div className="breadcrumb">
          <span className="bc-item" onClick={() => navigate('/managed-agent/tools')}>Tools</span>
          <span className="bc-sep">/</span>
          <span className="bc-current">注册 Custom Tool</span>
        </div>
      </div>

      <div className="create-app-body">
        <div className="mac-tool-builder">
          <div className="mac-tb-left">
            <div className="form-card-container">
              <div className="form-content">
                <div className="form-section">
                  <div className="section-title">基本信息</div>
                  <div className="form-row">
                    <label className="form-label">工具名称 <span className="required">*</span></label>
                    <input className="form-input" value={form.name} onChange={e => updateForm('name', e.target.value)} placeholder="例如: sql_query" />
                  </div>
                  <div className="form-row">
                    <label className="form-label">命名空间</label>
                    <input className="form-input" value={form.namespace} onChange={e => updateForm('namespace', e.target.value)} placeholder="例如: db" />
                  </div>
                  <div className="form-row">
                    <label className="form-label">描述 <span className="required">*</span></label>
                    <textarea className="form-textarea" value={form.description} onChange={e => updateForm('description', e.target.value)} placeholder="描述工具的功能和用途" rows={3} />
                  </div>
                </div>
                <div className="form-section">
                  <div className="section-title">执行配置</div>
                  <div className="form-row">
                    <label className="form-label">执行类型</label>
                    <div className="radio-options">
                      {['webhook', 'callback'].map(v => (
                        <label key={v} className="radio-label"><input type="radio" checked={form.executionType === v} onChange={() => updateForm('executionType', v)} />{v}</label>
                      ))}
                    </div>
                  </div>
                  <div className="form-row">
                    <label className="form-label">Endpoint <span className="required">*</span></label>
                    <input className="form-input" value={form.endpoint} onChange={e => updateForm('endpoint', e.target.value)} placeholder="https://api.example.com/tool" style={{ fontFamily: 'monospace' }} />
                  </div>
                  <div className="form-row">
                    <label className="form-label">Headers (JSON)</label>
                    <textarea className="form-textarea" value={form.headers} onChange={e => updateForm('headers', e.target.value)} rows={3} style={{ fontFamily: 'monospace' }} />
                  </div>
                </div>
                <div className="form-section">
                  <div className="section-title">参数 Schema (JSON Schema)</div>
                  <div className="form-row">
                    <textarea className="form-textarea" value={form.schema} onChange={e => updateForm('schema', e.target.value)} rows={8} style={{ fontFamily: 'monospace' }} />
                  </div>
                </div>
                <div className="form-section">
                  <div className="section-title">策略</div>
                  <div className="form-row">
                    <label className="form-label">风险等级</label>
                    <select className="form-select" value={form.riskLevel} onChange={e => updateForm('riskLevel', e.target.value)}>
                      <option value="low">低</option><option value="medium">中</option><option value="high">高</option><option value="critical">极高</option>
                    </select>
                  </div>
                  <div className="form-row">
                    <label className="checkbox-label"><input type="checkbox" checked={form.approvalRequired} onChange={e => updateForm('approvalRequired', e.target.checked)} />需要审批</label>
                  </div>
                  <div className="form-row">
                    <label className="form-label">超时 (ms)</label>
                    <input type="number" className="form-input" value={form.timeout} onChange={e => updateForm('timeout', parseInt(e.target.value))} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Panel */}
          <div className="mac-tb-right">
            <div className="mac-test-panel">
              <h4>测试台</h4>
              <div className="form-help" style={{ marginBottom: 12 }}>输入测试参数，验证工具是否能正常工作。</div>
              <textarea className="form-textarea" placeholder='{ "arg1": "value1" }' rows={6} style={{ fontFamily: 'monospace', marginBottom: 12 }} />
              <button className="action-btn primary" onClick={handleTest} style={{ width: '100%' }}>运行测试</button>
              {testResult && (
                <div className={`mac-test-result ${testResult.status}`}>
                  <div className="mac-test-status">{testResult.status === 'success' ? '✅ 成功' : '❌ 失败'}</div>
                  <div className="mac-test-detail">{testResult.result}</div>
                  <div className="mac-test-duration">{testResult.duration}ms</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="create-app-footer">
        <div />
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="action-btn" onClick={() => navigate('/managed-agent/tools')}>取消</button>
          <button className="action-btn primary" onClick={() => showToast('Custom Tool 注册成功')}>注册</button>
        </div>
      </div>

      {toast && <div className={`ha-toast ha-toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}
