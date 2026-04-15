import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useManagedAgents } from '../../store/managedAgentStore'
import { 
  IconPlus, IconTrash, IconChevronRight, IconGlobe, IconAlertTriangle,
  IconArrowLeft, IconCheck, IconRefresh
} from '../../components/Icons'
import './MAC.css'

const PACKAGE_MANAGERS = ['pip', 'npm', 'apt', 'cargo', 'gem', 'go']
const NETWORK_MODES = ['limited', 'allow_all', 'deny_all']
const NETWORK_MODE_LABELS = { limited: 'Limited', allow_all: 'Allow All', deny_all: 'Deny All' }

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      className={`mac-env-toggle ${checked ? 'active' : ''}`}
      onClick={() => onChange(!checked)}
      aria-checked={checked}
    >
      <div className="mac-env-toggle-knob" />
    </button>
  )
}

export default function MACEnvironmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { environments, sessions, dispatch } = useManagedAgents()
  const [toast, setToast] = useState(null)
  const [dirty, setDirty] = useState(false)

  const env = environments.find(e => e.id === id)
  const envSessions = sessions.filter(s => s.environmentId === id)

  // Parse dependencies into structured pkg rows: { manager, spec }
  const parseDeps = (deps = []) =>
    deps.map(d => {
      const parts = d.split(':')
      return parts.length === 2 ? { manager: parts[0], spec: parts[1] } : { manager: 'pip', spec: d }
    })

  const [form, setForm] = useState(null)

  useEffect(() => {
    if (env) {
      setForm({
        name: env.name,
        description: env.description || '',
        networkPolicy: {
          mode: env.networkPolicy?.mode || 'limited',
          allowMcpAccess: env.networkPolicy?.allowMcpAccess ?? false,
          allowPkgManagerAccess: env.networkPolicy?.allowPkgManagerAccess ?? false,
          allowedHosts: (env.networkPolicy?.allowDomains || []).join(', '),
        },
        packages: parseDeps(env.dependencies || []),
        metadata: (env.envVars || []).map(v => ({ key: v.key, value: v.value })),
      })
      setDirty(false)
    }
  }, [env?.id]) // eslint-disable-line

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const patch = (updater) => {
    setForm(prev => ({ ...prev, ...updater(prev) }))
    setDirty(true)
  }

  const handleSave = () => {
    const allowDomains = form.networkPolicy.allowedHosts
      .split(',').map(s => s.trim()).filter(Boolean)
    const dependencies = form.packages
      .filter(p => p.spec.trim())
      .map(p => `${p.manager}:${p.spec}`)
    const envVars = form.metadata.filter(m => m.key.trim())

    dispatch({
      type: 'UPDATE_ENVIRONMENT',
      id,
      payload: {
        name: form.name,
        description: form.description,
        networkPolicy: {
          mode: form.networkPolicy.mode,
          allowMcpAccess: form.networkPolicy.allowMcpAccess,
          allowPkgManagerAccess: form.networkPolicy.allowPkgManagerAccess,
          allowDomains,
        },
        dependencies,
        envVars,
      },
    })
    setDirty(false)
    showToast('配置已保存')
  }

  const handleCancel = () => {
    if (env) {
      setForm({
        name: env.name,
        description: env.description || '',
        networkPolicy: {
          mode: env.networkPolicy?.mode || 'limited',
          allowMcpAccess: env.networkPolicy?.allowMcpAccess ?? false,
          allowPkgManagerAccess: env.networkPolicy?.allowPkgManagerAccess ?? false,
          allowedHosts: (env.networkPolicy?.allowDomains || []).join(', '),
        },
        packages: parseDeps(env.dependencies || []),
        metadata: (env.envVars || []).map(v => ({ key: v.key, value: v.value })),
      })
      setDirty(false)
    }
  }



  if (!env || !form) {
    return <div className="mac-not-found">环境未找到</div>
  }

  return (
    <div className="mac-env-edit-page">
      {/* Header */}
      <div className="mac-env-edit-header">
        <div className="mac-env-edit-header-top">
          <button className="back-btn" onClick={() => navigate('/af-environment')}>
            <IconArrowLeft size={16} />
          </button>
          <div className="breadcrumb">
            <span className="bc-item" onClick={() => navigate('/af-environment')}>Environments</span>
            <span className="bc-separator"><IconChevronRight size={12} /></span>
            <span className="bc-current">{env.name}</span>
          </div>
        </div>

        {/* Inline name + type bar */}
        <div className="mac-env-name-bar">
          <input
            className="mac-env-name-input"
            value={form.name}
            onChange={e => patch(() => ({ name: e.target.value }))}
            maxLength={50}
          />
          <span className="mac-env-type-badge">{env.runtime || 'Cloud'}</span>
          <IconGlobe size={16} style={{ color: '#94a3b8', marginLeft: 4 }} />
        </div>
      </div>

      {/* Scrollable body */}
      <div className="mac-env-edit-body">
        {/* Description */}
        <div className="mac-env-field-row">
          <label className="mac-env-label">Description</label>
          <textarea
            className="mac-env-textarea"
            rows={3}
            placeholder="Add a description for this environment (optional)"
            value={form.description}
            onChange={e => patch(() => ({ description: e.target.value }))}
          />
        </div>

        {/* Networking */}
        <div className="mac-env-section-card">
          <div className="mac-env-section-header">
            <div>
              <div className="mac-env-section-title">Networking</div>
              <div className="mac-env-section-desc">配置此沙箱的网络访问策略，确保 Agent 在合规范围内连接外部服务。</div>
            </div>
          </div>

          <div className="mac-env-field-row" style={{ marginTop: 16 }}>
            <label className="mac-env-label">Type</label>
            <select
              className="mac-env-select"
              value={form.networkPolicy.mode}
              onChange={e => patch(f => ({ networkPolicy: { ...f.networkPolicy, mode: e.target.value } }))}
            >
              {NETWORK_MODES.map(m => (
                <option key={m} value={m}>{NETWORK_MODE_LABELS[m]}</option>
              ))}
            </select>
          </div>

          <div className="mac-env-toggle-row">
            <span>Allow MCP server network access</span>
            <Toggle
              checked={form.networkPolicy.allowMcpAccess}
              onChange={v => patch(f => ({ networkPolicy: { ...f.networkPolicy, allowMcpAccess: v } }))}
            />
          </div>

          <div className="mac-env-toggle-row">
            <span>Allow package manager network access</span>
            <Toggle
              checked={form.networkPolicy.allowPkgManagerAccess}
              onChange={v => patch(f => ({ networkPolicy: { ...f.networkPolicy, allowPkgManagerAccess: v } }))}
            />
          </div>

          {form.networkPolicy.mode === 'limited' && (
            <div className="mac-env-field-row" style={{ marginTop: 12 }}>
              <label className="mac-env-label">Allowed Hosts</label>
              <textarea
                className="mac-env-textarea mono"
                rows={3}
                placeholder="www.example1.com, www.example2.com"
                value={form.networkPolicy.allowedHosts}
                onChange={e => patch(f => ({ networkPolicy: { ...f.networkPolicy, allowedHosts: e.target.value } }))}
              />
            </div>
          )}
        </div>

        {/* Packages */}
        <div className="mac-env-section-card">
          <div className="mac-env-section-header">
            <div>
              <div className="mac-env-section-title">Packages</div>
              <div className="mac-env-section-desc">Specify packages and their versions available in this environment. Separate multiple values with spaces.</div>
            </div>
            <button
              className="mac-env-add-btn"
              onClick={() => patch(f => ({ packages: [...f.packages, { manager: 'pip', spec: '' }] }))}
            >
              <IconPlus size={16} />
            </button>
          </div>

          <div className="mac-env-pkg-list">
            {form.packages.map((pkg, i) => (
              <div key={i} className="mac-env-pkg-row">
                <div className="mac-env-pkg-manager-wrap">
                  <select
                    className="mac-env-pkg-manager"
                    value={pkg.manager}
                    onChange={e => patch(f => {
                      const next = [...f.packages]
                      next[i] = { ...next[i], manager: e.target.value }
                      return { packages: next }
                    })}
                  >
                    {PACKAGE_MANAGERS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <input
                  className="mac-env-pkg-input"
                  value={pkg.spec}
                  placeholder="package package==1.0.0"
                  onChange={e => patch(f => {
                    const next = [...f.packages]
                    next[i] = { ...next[i], spec: e.target.value }
                    return { packages: next }
                  })}
                />
                <button
                  className="mac-env-del-btn"
                  onClick={() => patch(f => ({ packages: f.packages.filter((_, j) => j !== i) }))}
                >
                  <IconTrash size={14} />
                </button>
              </div>
            ))}
            {form.packages.length === 0 && (
              <div style={{ color: '#94a3b8', fontSize: 13, padding: '8px 0' }}>
                No packages added. Click + to add.
              </div>
            )}
          </div>
        </div>

        {/* Metadata (Env Vars) */}
        <div className="mac-env-section-card">
          <div className="mac-env-section-header">
            <div>
              <div className="mac-env-section-title">Metadata</div>
              <div className="mac-env-section-desc">Add custom key-value pairs to tag and organize this environment. Keys must be lowercase.</div>
            </div>
            <button
              className="mac-env-add-btn"
              onClick={() => patch(f => ({ metadata: [...f.metadata, { key: '', value: '' }] }))}
            >
              <IconPlus size={16} />
            </button>
          </div>

          <div className="mac-env-pkg-list">
            {form.metadata.map((m, i) => (
              <div key={i} className="mac-env-pkg-row">
                <input
                  className="mac-env-meta-key"
                  value={m.key}
                  placeholder="client_key..."
                  onChange={e => patch(f => {
                    const next = [...f.metadata]
                    next[i] = { ...next[i], key: e.target.value.toLowerCase() }
                    return { metadata: next }
                  })}
                />
                <input
                  className="mac-env-pkg-input"
                  value={m.value}
                  placeholder="Value"
                  onChange={e => patch(f => {
                    const next = [...f.metadata]
                    next[i] = { ...next[i], value: e.target.value }
                    return { metadata: next }
                  })}
                />
                <button
                  className="mac-env-del-btn"
                  onClick={() => patch(f => ({ metadata: f.metadata.filter((_, j) => j !== i) }))}
                >
                  <IconTrash size={14} />
                </button>
              </div>
            ))}
            {form.metadata.length === 0 && (
              <div style={{ color: '#94a3b8', fontSize: 13, padding: '8px 0' }}>
                No metadata added.
              </div>
            )}
          </div>
        </div>

        {/* Sessions */}
        {envSessions.length > 0 && (
          <div className="mac-env-section-card">
            <div className="mac-env-section-header">
              <div>
                <div className="mac-env-section-title">关联 Sessions ({envSessions.length})</div>
                <div className="mac-env-section-desc">使用此环境的运行中和历史会话。</div>
              </div>
            </div>
            <table className="data-table" style={{ marginTop: 12 }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Agent</th>
                  <th>状态</th>
                  <th>Tokens</th>
                  <th>开始时间</th>
                </tr>
              </thead>
              <tbody>
                {envSessions.map(s => (
                  <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/managed-agent/sessions/${s.id}`)}>
                    <td><span className="ha-name-link">{s.id}</span></td>
                    <td>{s.agentName}</td>
                    <td>{s.status}</td>
                    <td>{s.tokenUsage?.total?.toLocaleString()}</td>
                    <td>{s.startedAt?.slice(5, 16)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mac-env-edit-footer">
        <div style={{ fontSize: 12, color: '#94a3b8' }}>
          创建时间: {env.createdAt}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="action-btn" onClick={handleCancel} disabled={!dirty}>
            Cancel
          </button>
          <button
            className="action-btn primary"
            style={{ background: dirty ? '#0f172a' : undefined, borderColor: dirty ? '#0f172a' : undefined }}
            onClick={handleSave}
            disabled={!dirty}
          >
            {dirty ? <><IconCheck size={14} style={{ marginRight: 4 }} />Save changes</> : 'No changes'}
          </button>
        </div>
      </div>

      {toast && <div className={`ha-toast ha-toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}
