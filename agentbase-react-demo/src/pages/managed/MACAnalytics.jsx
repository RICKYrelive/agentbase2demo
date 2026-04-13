import { useState, useMemo } from 'react'
import { useManagedAgents, SESSION_STATUS_COLORS } from '../../store/managedAgentStore'
import PageLayout from '../../components/PageLayout'
import './MAC.css'

export default function MACAnalytics() {
  const { sessions, agents } = useManagedAgents()
  const [activeTab, setActiveTab] = useState('sessions')

  // Compute metrics
  const metrics = useMemo(() => {
    const totalTokens = sessions.reduce((s, sess) => s + (sess.tokenUsage?.total || 0), 0)
    const totalCost = sessions.reduce((s, sess) => s + (sess.cost || 0), 0)
    const totalDuration = sessions.reduce((s, sess) => s + (sess.duration || 0), 0)
    const failedCount = sessions.filter(s => s.status === 'failed').length
    const activeCount = sessions.filter(s => ['running', 'idle', 'waiting_approval'].includes(s.status)).length

    // Per-agent stats
    const agentStats = {}
    agents.forEach(a => { agentStats[a.id] = { name: a.name, sessions: 0, tokens: 0, cost: 0, errors: 0 } })
    sessions.forEach(s => {
      if (agentStats[s.agentId]) {
        agentStats[s.agentId].sessions++
        agentStats[s.agentId].tokens += s.tokenUsage?.total || 0
        agentStats[s.agentId].cost += s.cost || 0
        if (s.status === 'failed') agentStats[s.agentId].errors++
      }
    })

    // Status distribution
    const statusDist = {}
    sessions.forEach(s => { statusDist[s.status] = (statusDist[s.status] || 0) + 1 })

    return { totalTokens, totalCost, totalDuration, failedCount, activeCount, agentStats, statusDist }
  }, [sessions, agents])

  const tabs = ['sessions', 'tools', 'cost', 'per-agent']

  return (
    <PageLayout title="Analytics" rightAction={<span style={{ fontSize: 12, color: '#999' }}>数据分析</span>}>
      {/* Metric Cards */}
      <div className="mac-metric-grid" style={{ marginBottom: 24 }}>
        <div className="mac-metric-card">
          <div className="mac-metric-icon" style={{ background: '#e6f7ff22', color: '#1890ff' }}>⚡</div>
          <div className="mac-metric-info"><div className="mac-metric-value">{metrics.activeCount}</div><div className="mac-metric-label">活跃 Session</div></div>
        </div>
        <div className="mac-metric-card">
          <div className="mac-metric-icon" style={{ background: '#f6ffed22', color: '#52c41a' }}>📊</div>
          <div className="mac-metric-info"><div className="mac-metric-value">{metrics.totalTokens.toLocaleString()}</div><div className="mac-metric-label">Total Tokens</div></div>
        </div>
        <div className="mac-metric-card">
          <div className="mac-metric-icon" style={{ background: '#f9f0ff22', color: '#722ed1' }}>💰</div>
          <div className="mac-metric-info"><div className="mac-metric-value">${metrics.totalCost.toFixed(2)}</div><div className="mac-metric-label">Total Cost</div></div>
        </div>
        <div className="mac-metric-card">
          <div className="mac-metric-icon" style={{ background: '#fff2f022', color: '#ff4d4f' }}>❌</div>
          <div className="mac-metric-info"><div className="mac-metric-value">{metrics.failedCount}</div><div className="mac-metric-label">Failed Sessions</div></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mac-tabs">
        {tabs.map(tab => (
          <button key={tab} className={`mac-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {{ sessions: 'Session 概览', tools: '工具使用', cost: '成本分析', 'per-agent': 'Per-Agent' }[tab]}
          </button>
        ))}
      </div>

      <div className="mac-tab-content">
        {activeTab === 'sessions' && (
          <div>
            <h4 style={{ marginBottom: 12 }}>Session 状态分布</h4>
            <div className="mac-chart-placeholder">
              {Object.entries(metrics.statusDist).map(([status, count]) => {
                const sc = SESSION_STATUS_COLORS[status] || { bg: '#f5f5f5', color: '#999' }
                const pct = Math.round((count / sessions.length) * 100)
                return (
                  <div key={status} className="mac-bar-row">
                    <span className="mac-bar-label" style={{ width: 100 }}>{status}</span>
                    <div className="mac-bar-track">
                      <div className="mac-bar-fill" style={{ width: `${pct}%`, background: sc.color }} />
                    </div>
                    <span className="mac-bar-val">{count} ({pct}%)</span>
                  </div>
                )
              })}
            </div>
            <h4 style={{ marginTop: 24, marginBottom: 12 }}>最近 Session</h4>
            <table className="data-table">
              <thead><tr><th>ID</th><th>Agent</th><th>状态</th><th>Tokens</th><th>Cost</th><th>Duration</th></tr></thead>
              <tbody>
                {sessions.slice(0, 10).map(s => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.agentName}</td>
                    <td>{s.status}</td>
                    <td>{s.tokenUsage?.total?.toLocaleString()}</td>
                    <td>${s.cost}</td>
                    <td>{s.duration}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'tools' && (() => {
          const toolNames = ['web_search', 'read_file', 'bash', 'write_file', 'web_fetch', 'grep', 'glob', 'edit_file', 'sql_query']
          const toolCounts = toolNames.map(tool => ({
            tool,
            count: sessions.reduce((c, s) => c + (s.events || []).filter(e => e.type === 'tool_use' && e.payload?.tool === tool).length, 0)
          }))
          const maxTool = Math.max(...toolCounts.map(t => t.count), 1)
          return (
            <div>
              <h4 style={{ marginBottom: 12 }}>工具调用统计</h4>
              <div className="mac-chart-placeholder">
                {toolCounts.map(({ tool, count }) => (
                  <div key={tool} className="mac-bar-row">
                    <span className="mac-bar-label" style={{ width: 100, fontFamily: 'monospace', fontSize: 12 }}>{tool}</span>
                    <div className="mac-bar-track">
                      <div className="mac-bar-fill" style={{ width: `${(count / maxTool) * 100}%`, background: count === maxTool ? '#52c41a' : '#1890ff' }} />
                    </div>
                    <span className="mac-bar-val">{count} 次</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20, padding: 14, background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ margin: '0 0 8px' }}>工具调用总览</h4>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>总调用: <strong style={{ color: 'var(--text-primary)' }}>{toolCounts.reduce((s, t) => s + t.count, 0)}</strong></span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>最常用: <strong style={{ color: '#52c41a' }}>{toolCounts.sort((a, b) => b.count - a.count)[0]?.tool} ({toolCounts[0]?.count})</strong></span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>工具种类: <strong style={{ color: 'var(--text-primary)' }}>{toolCounts.filter(t => t.count > 0).length}</strong></span>
                </div>
              </div>
            </div>
          )
        })()}

        {activeTab === 'cost' && (
          <div>
            <h4 style={{ marginBottom: 12 }}>成本概览</h4>
            <div className="mac-metric-grid" style={{ marginBottom: 16 }}>
              <div className="mac-metric-card"><div className="mac-metric-info"><div className="mac-metric-value">${metrics.totalCost.toFixed(2)}</div><div className="mac-metric-label">总成本</div></div></div>
              <div className="mac-metric-card"><div className="mac-metric-info"><div className="mac-metric-value">{Math.round(metrics.totalDuration / 60)}m</div><div className="mac-metric-label">总运行时间</div></div></div>
              <div className="mac-metric-card"><div className="mac-metric-info"><div className="mac-metric-value">{metrics.totalTokens.toLocaleString()}</div><div className="mac-metric-label">总 Tokens</div></div></div>
            </div>
            <h4 style={{ marginBottom: 12 }}>按 Agent 分布</h4>
            {Object.values(metrics.agentStats).filter(a => a.cost > 0).map(a => (
              <div key={a.name} className="mac-bar-row">
                <span className="mac-bar-label" style={{ width: 140 }}>{a.name}</span>
                <div className="mac-bar-track">
                  <div className="mac-bar-fill" style={{ width: `${(a.cost / metrics.totalCost) * 100}%`, background: '#722ed1' }} />
                </div>
                <span className="mac-bar-val">${a.cost.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'per-agent' && (
          <div>
            <table className="data-table">
              <thead><tr><th>Agent</th><th>Sessions</th><th>Tokens</th><th>Cost</th><th>Errors</th></tr></thead>
              <tbody>
                {Object.values(metrics.agentStats).map(a => (
                  <tr key={a.name}>
                    <td><strong>{a.name}</strong></td>
                    <td>{a.sessions}</td>
                    <td>{a.tokens.toLocaleString()}</td>
                    <td>${a.cost.toFixed(2)}</td>
                    <td>{a.errors > 0 ? <span style={{ color: '#ff4d4f' }}>{a.errors}</span> : 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
