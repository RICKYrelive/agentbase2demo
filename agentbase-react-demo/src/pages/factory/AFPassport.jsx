import { useState } from 'react'
import PageLayout, { DataToolbar } from '../../components/PageLayout'
import './AF.css'

const MOCK_VAULTS = [
  { id: 'vlt_aB3cD9eF', name: 'GitHub Production', status: 'active', credCount: 2, createdAt: '2026-04-01 10:00', creds: [
    { id: 'c1', type: 'static_bearer', target: 'https://api.github.com/mcp/', masked: 'ghp_●●●●●●1a2b' },
    { id: 'c2', type: 'static_bearer', target: 'https://api.githubcopilot.com/mcp/', masked: 'ghp_●●●●●●3c4d' },
  ]},
  { id: 'vlt_gH4iJ1kL', name: 'Slack Workspace', status: 'active', credCount: 1, createdAt: '2026-04-05 14:30', creds: [
    { id: 'c3', type: 'oauth', target: 'https://slack.com/api/mcp/', masked: 'xoxb-●●●●●●' },
  ]},
  { id: 'vlt_mN5oP2qR', name: 'Notion Integration', status: 'inactive', credCount: 0, createdAt: '2026-04-08 09:12', creds: [] },
]

const STATUS_COLORS = {
  active:   { bg: '#f6ffed', color: '#52c41a', border: '#b7eb8f', label: '活跃' },
  inactive: { bg: '#f5f5f5', color: '#595959', border: '#d9d9d9', label: '未激活' },
}

export default function AFPassport() {
  const [expanded, setExpanded] = useState(null)
  const [showDrawer, setShowDrawer] = useState(false)
  const [toast, setToast] = useState(null)

  // New Credential Form State
  const [credName, setCredName] = useState('')
  const [credType, setCredType] = useState('oauth') // 'oauth' | 'bearer'
  const [mcpUrl, setMcpUrl] = useState('')
  const [bearerToken, setBearerToken] = useState('')
  const [openAccessToken, setOpenAccessToken] = useState(false)
  const [openClientCreds, setOpenClientCreds] = useState(false)
  const [isAcknowledged, setIsAcknowledged] = useState(false)

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2000) }

  const handleCreate = () => {
    showToast('凭证连接成功')
    setShowDrawer(false)
    resetForm()
  }

  const resetForm = () => {
    setCredName('')
    setCredType('oauth')
    setMcpUrl('')
    setBearerToken('')
    setOpenAccessToken(false)
    setOpenClientCreds(false)
    setIsAcknowledged(false)
  }

  const isFormValid = () => {
    if (!mcpUrl.trim()) return false
    if (!isAcknowledged) return false
    if (credType === 'bearer' && !bearerToken.trim()) return false
    return true
  }

  return (
    <PageLayout
      title="Passport"
      rightAction={<button className="action-btn primary" onClick={() => setShowDrawer(true)}>+ New Passport</button>}
    >
      <div className="info-alert">
        <span className="info-alert-icon">ℹ️</span>
        Passport 是凭证保险箱，在 Session 创建时通过 <code>vault_ids</code> 注入，用于 MCP 服务器的 OAuth 和 Bearer Token 认证。Passport 作用域为当前工作空间，具有 API 访问权限的成员均可使用。
      </div>

      <DataToolbar
        buttons={null}
        filters={
          <div className="radio-group">
            <button className="radio-btn active">全部</button>
            <button className="radio-btn">活跃</button>
          </div>
        }
      >
        <div className="search-input">
          <span className="search-icon">🔍</span>
          <input placeholder="搜索 Passport 名称或 ID" />
        </div>
      </DataToolbar>

      <div className="afp-vault-list">
        {MOCK_VAULTS.map(v => {
          const sc = STATUS_COLORS[v.status]
          const isOpen = expanded === v.id
          return (
            <div key={v.id} className="afp-vault-card">
              <div className="afp-vault-head" onClick={() => setExpanded(isOpen ? null : v.id)}>
                <div className="afp-vault-left">
                  <span className="afp-vault-icon">🔐</span>
                  <div>
                    <div className="afp-vault-name">{v.name}</div>
                    <div className="afp-vault-id">{v.id}</div>
                  </div>
                </div>
                <div className="afp-vault-right">
                  <span className="ha-status-tag" style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}>{sc.label}</span>
                  <span className="afp-cred-count">{v.credCount} 个凭证</span>
                  <span className={`afp-arrow ${isOpen ? 'open' : ''}`}>›</span>
                </div>
              </div>
              {isOpen && (
                <div className="afp-cred-list">
                  {v.creds.length === 0 ? (
                    <div className="afp-cred-empty">暂无凭证 — 点击「添加凭证」导入 Bearer Token 或 OAuth 凭证</div>
                  ) : v.creds.map(c => (
                    <div key={c.id} className="afp-cred-row">
                      <span className={`afp-cred-type afp-cred-${c.type}`}>{c.type === 'oauth' ? 'OAuth' : 'Bearer'}</span>
                      <span className="afp-cred-target">{c.target}</span>
                      <span className="afp-cred-masked">{c.masked}</span>
                      <button className="af-copy-btn" onClick={() => { navigator.clipboard.writeText(c.masked); showToast('已复制') }}>⎘</button>
                    </div>
                  ))}
                  <div className="afp-cred-actions">
                    <button className="action-btn" onClick={() => setShowDrawer(true)}>+ 添加凭证</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Passport Side Drawer */}
      {showDrawer && (
        <div className="af-drawer-overlay" onClick={() => { setShowDrawer(false); resetForm(); }}>
          <div className="af-drawer" onClick={e => e.stopPropagation()}>
            <div className="af-drawer-header">
              <div className="af-drawer-title-wrap">
                <div className="af-drawer-title">添加凭证</div>
              </div>
              <button className="af-drawer-close" onClick={() => { setShowDrawer(false); resetForm(); }}>×</button>
            </div>
            
            <div style={{ padding: '0 40px', color: '#64748b', fontSize: '14px', marginBottom: '10px' }}>
              通过授权 MCP 服务器，为 Agent 提供委派用户认证能力。
            </div>

            <div className="af-drawer-body">
              {/* Name Field */}
              <div className="af-field">
                <label className="af-field-label">名称 <span className="af-optional-badge">可选</span></label>
                <input 
                  type="text"
                  className="af-input-text" 
                  placeholder="例如：我的 GitHub 访问凭证" 
                  value={credName} 
                  onChange={e => setCredName(e.target.value)} 
                />
              </div>

              {/* Type Toggle */}
              <div className="af-field">
                <label className="af-field-label">类型 <span style={{ color: '#94a3b8', marginLeft: 4 }}>ⓘ</span></label>
                <div className="af-type-toggle">
                  <button 
                    className={`af-type-btn ${credType === 'oauth' ? 'active' : ''}`}
                    onClick={() => setCredType('oauth')}
                  >
                    OAuth
                  </button>
                  <button 
                    className={`af-type-btn ${credType === 'bearer' ? 'active' : ''}`}
                    onClick={() => setCredType('bearer')}
                  >
                    Bearer token
                  </button>
                </div>
              </div>

              {/* MCP Server Link */}
              <div className="af-field">
                <label className="af-field-label">MCP Server 链接</label>
                <input 
                  type="text"
                  className="af-input-text" 
                  placeholder="请输入链接，例如：https://mcp.figma.com/mcp" 
                  value={mcpUrl} 
                  onChange={e => setMcpUrl(e.target.value)} 
                />
              </div>

              {credType === 'oauth' ? (
                <>
                  {/* Collapsible: Access Token */}
                  <div className="af-collapsible">
                    <button className="af-collapsible-head" onClick={() => setOpenAccessToken(!openAccessToken)}>
                      <span className={`af-collapsible-arrow ${openAccessToken ? 'open' : ''}`}>›</span>
                      <span className="af-collapsible-label">Access token</span>
                      <span className="af-optional-badge">可选</span>
                      <span style={{ color: '#94a3b8', marginLeft: 8 }}>ⓘ</span>
                    </button>
                    {openAccessToken && (
                      <div className="af-collapsible-body">
                        <input className="af-input-text" type="password" placeholder="在此粘贴访问令牌" />
                      </div>
                    )}
                  </div>

                  {/* Collapsible: Client Credentials */}
                  <div className="af-collapsible">
                    <button className="af-collapsible-head" onClick={() => setOpenClientCreds(!openClientCreds)}>
                      <span className={`af-collapsible-arrow ${openClientCreds ? 'open' : ''}`}>›</span>
                      <span className="af-collapsible-label">OAuth 客户端凭证</span>
                      <span className="af-optional-badge">可选</span>
                      <span style={{ color: '#94a3b8', marginLeft: 8 }}>ⓘ</span>
                    </button>
                    {openClientCreds && (
                      <div className="af-collapsible-body">
                        <div className="af-field" style={{ marginBottom: 12 }}>
                          <label className="af-field-label" style={{ fontSize: 13 }}>Client ID</label>
                          <input className="af-input-text" placeholder="输入客户端 ID" />
                        </div>
                        <div className="af-field" style={{ marginBottom: 0 }}>
                          <label className="af-field-label" style={{ fontSize: 13 }}>Client Secret</label>
                          <input className="af-input-text" type="password" placeholder="输入客户端 Secret" />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="af-field">
                  <label className="af-field-label">Token <span style={{ color: 'red', marginLeft: 4 }}>*</span></label>
                  <input 
                    className="af-input-text" 
                    type="password" 
                    placeholder="请输入 Bearer Token" 
                    value={bearerToken}
                    onChange={e => setBearerToken(e.target.value)}
                  />
                </div>
              )}

              {/* Warning Box */}
              <div className="af-warning-box">
                <input 
                  type="checkbox" 
                  className="af-warning-box-checkbox" 
                  checked={isAcknowledged}
                  onChange={e => setIsAcknowledged(e.target.checked)}
                />
                <div className="af-warning-content">
                  此凭证将在当前工作空间内共享。任何具有 API 密钥访问权限的成员都可以在 Agent 会话中使用此凭证来访问相关服务，包括代表凭证所有者读取数据和执行操作。更多说明请 <a href="#" className="af-warning-link">点此查看</a>。
                  
                  <span className="af-warning-ack">
                    我确认已知晓此凭证为共享性质，并对该凭证的存储和使用负责。
                  </span>
                </div>
              </div>
            </div>

            <div className="af-drawer-footer">
              <button 
                className="action-btn primary" 
                style={{ height: 44, padding: '0 32px', borderRadius: 10, fontSize: 15 }}
                disabled={!isFormValid()}
                onClick={handleCreate}
              >
                授权并连接
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="ha-toast ha-toast-success">{toast}</div>}
    </PageLayout>
  )
}
