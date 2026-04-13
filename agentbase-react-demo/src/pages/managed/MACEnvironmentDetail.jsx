import { useNavigate, useParams } from 'react-router-dom'
import { useManagedAgents } from '../../store/managedAgentStore'
import './MAC.css'

export default function MACEnvironmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { environments, sessions } = useManagedAgents()

  const env = environments.find(e => e.id === id)
  if (!env) return <div className="mac-not-found">环境未找到</div>

  const envSessions = sessions.filter(s => s.environmentId === env.id)
  const healthColor = env.status === 'healthy' ? '#52c41a' : '#ff4d4f'

  return (
    <div className="mac-detail-page">
      <div className="mac-detail-header">
        <div className="mac-detail-top">
          <button className="back-btn" onClick={() => navigate('/managed-agent/environments')}>← 返回</button>
          <div className="breadcrumb">
            <span className="bc-item" onClick={() => navigate('/managed-agent/environments')}>Environments</span>
            <span className="bc-sep">/</span>
            <span className="bc-current">{env.name}</span>
          </div>
        </div>
        <div className="mac-detail-info">
          <h2>{env.name}</h2>
          <div className="mac-detail-meta">
            <span style={{ color: healthColor }}>● {env.status}</span>
            <span>Runtime: {env.runtime}</span>
            <span>Sessions: {envSessions.length}</span>
            <span>Last Check: {env.lastHealthCheck}</span>
          </div>
          <div className="mac-detail-desc">{env.description}</div>
        </div>
      </div>

      <div className="mac-tab-content">
        <div className="mac-config-grid">
          <div className="mac-config-section">
            <h4>环境配置</h4>
            <div className="mac-kv-list">
              <div className="mac-kv-row"><span className="mac-kv-key">基础镜像</span><span style={{ fontFamily: 'monospace' }}>{env.baseImage}</span></div>
              <div className="mac-kv-row"><span className="mac-kv-key">Runtime</span><span>{env.runtime}</span></div>
              <div className="mac-kv-row"><span className="mac-kv-key">工作目录</span><span style={{ fontFamily: 'monospace' }}>{env.workDir}</span></div>
              <div className="mac-kv-row"><span className="mac-kv-key">依赖</span><span>{env.dependencies.join(', ') || '-'}</span></div>
            </div>
          </div>
          <div className="mac-config-section">
            <h4>网络策略</h4>
            <div className="mac-kv-list">
              <div className="mac-kv-row"><span className="mac-kv-key">模式</span><span className="ha-mini-tag">{env.networkPolicy.mode}</span></div>
              <div className="mac-kv-row"><span className="mac-kv-key">允许域名</span><span>{env.networkPolicy.allowDomains.join(', ') || '-'}</span></div>
            </div>
          </div>
          <div className="mac-config-section">
            <h4>环境变量</h4>
            <div className="mac-kv-list">
              {env.envVars.map((v, i) => (
                <div key={i} className="mac-kv-row"><span className="mac-kv-key">{v.key}</span><span>{v.value || '(secret ref)'}</span></div>
              ))}
              {env.envVars.length === 0 && <span style={{ color: '#999' }}>无</span>}
            </div>
          </div>
          <div className="mac-config-section">
            <h4>文件挂载</h4>
            <div className="mac-kv-list">
              {env.fileMounts.map((m, i) => (
                <div key={i} className="mac-kv-row"><span className="mac-kv-key">{m.source}</span><span>{m.target} {m.readOnly ? '(只读)' : '(读写)'}</span></div>
              ))}
              {env.fileMounts.length === 0 && <span style={{ color: '#999' }}>无</span>}
            </div>
          </div>
        </div>

        <div className="mac-config-section" style={{ marginTop: 24 }}>
          <h4>关联会话 ({envSessions.length})</h4>
          {envSessions.length === 0 ? (
            <div className="mac-empty-inline">暂无会话</div>
          ) : (
            <table className="data-table">
              <thead><tr><th>ID</th><th>Agent</th><th>状态</th><th>Token</th><th>开始时间</th></tr></thead>
              <tbody>
                {envSessions.map(s => (
                  <tr key={s.id}>
                    <td><span className="ha-name-link" onClick={() => navigate(`/managed-agent/sessions/${s.id}`)}>{s.id}</span></td>
                    <td>{s.agentName}</td>
                    <td>{s.status}</td>
                    <td>{s.tokenUsage?.total?.toLocaleString()}</td>
                    <td>{s.startedAt?.slice(5, 16)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
