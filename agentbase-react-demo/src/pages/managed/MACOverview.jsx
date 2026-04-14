import { useNavigate } from 'react-router-dom'
import { useManagedAgents, SESSION_STATUS_COLORS, AGENT_STATUS_COLORS } from '../../store/managedAgentStore'
import PageLayout from '../../components/PageLayout'
import { 
  IconBot, IconZap, IconPackage, IconTool, 
  IconGlobe, IconLock, IconBarChart, IconKey, 
  IconClipboard, IconSettings, IconDollarSign 
} from '../../components/Icons'
import './MAC.css'

// Generate mock activity data for last 7 days
function generateActivityData() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const now = new Date()
  const todayIdx = (now.getDay() + 6) % 7 // Mon=0
  return days.map((day, i) => ({
    day,
    sessions: i <= todayIdx ? Math.floor(Math.random() * 8) + 1 : 0,
    tokens: i <= todayIdx ? Math.floor(Math.random() * 30000) + 5000 : 0,
  }))
}

const NAV_ITEMS = [
  { key: 'agents', label: 'Agents', icon: <IconBot size={20} />, path: '/managed-agent/agents' },
  { key: 'sessions', label: 'Sessions', icon: <IconZap size={20} />, path: '/managed-agent/sessions' },
  { key: 'environments', label: '环境', icon: <IconPackage size={20} />, path: '/managed-agent/environments' },
  { key: 'tools', label: '工具', icon: <IconTool size={20} />, path: '/managed-agent/tools' },
  { key: 'integrations', label: '集成', icon: <IconGlobe size={20} />, path: '/managed-agent/integrations' },
  { key: 'approvals', label: '审批', icon: <IconLock size={20} />, path: '/managed-agent/approvals' },
  { key: 'analytics', label: '分析', icon: <IconBarChart size={20} />, path: '/managed-agent/analytics' },
  { key: 'secrets', label: '凭证', icon: <IconKey size={20} />, path: '/managed-agent/secrets' },
  { key: 'audit', label: '审计', icon: <IconClipboard size={20} />, path: '/managed-agent/audit' },
  { key: 'settings', label: '设置', icon: <IconSettings size={20} />, path: '/managed-agent/settings/roles' },
]

export default function MACOverview() {
  const navigate = useNavigate()
  const { agents, sessions, approvals, secrets, environments } = useManagedAgents()
  const activity = generateActivityData()

  const activeSessions = sessions.filter(s => ['running', 'idle', 'waiting_approval'].includes(s.status)).length
  const pendingApprovals = approvals.filter(a => a.status === 'pending').length
  const todayCost = sessions.reduce((sum, s) => sum + (s.cost || 0), 0).toFixed(2)
  const totalTokens = sessions.reduce((sum, s) => sum + (s.tokenUsage?.total || 0), 0)
  const healthyEnvs = environments.filter(e => e.status === 'healthy').length
  const failedSessions = sessions.filter(s => s.status === 'failed').length

  const cards = [
    { label: '活跃 Agent', value: agents.filter(a => a.status === 'published').length, icon: <IconBot size={24} />, color: '#1890ff', onClick: () => navigate('/managed-agent/agents') },
    { label: '活跃 Session', value: activeSessions, icon: <IconZap size={24} />, color: '#52c41a', onClick: () => navigate('/managed-agent/sessions') },
    { label: '待审批', value: pendingApprovals, icon: <IconLock size={24} />, color: pendingApprovals > 0 ? '#fa8c16' : '#d9d9d9', onClick: () => navigate('/managed-agent/approvals') },
    { label: '今日成本', value: `$${todayCost}`, icon: <IconDollarSign size={24} />, color: '#722ed1', onClick: () => navigate('/managed-agent/analytics') },
  ]

  const recentSessions = sessions.slice(0, 5)
  const maxSessions = Math.max(...activity.map(a => a.sessions), 1)

  return (
    <PageLayout title="Agent Console" rightAction={<span style={{ fontSize: 12, color: '#999' }}>企业级托管 Agent 平台</span>}>
      <div className="mac-overview">
        {/* Metric Cards */}
        <div className="mac-metric-grid">
          {cards.map(c => (
            <div key={c.label} className="mac-metric-card" onClick={c.onClick} style={{ cursor: 'pointer' }}>
              <div className="mac-metric-icon" style={{ background: c.color + '15', color: c.color }}>{c.icon}</div>
              <div className="mac-metric-info">
                <div className="mac-metric-value">{c.value}</div>
                <div className="mac-metric-label">{c.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Sub Navigation */}
        <div className="mac-section">
          <div className="mac-section-title">导航</div>
          <div className="mac-subnav-grid">
            {NAV_ITEMS.map(item => {
              const badge = item.key === 'approvals' && pendingApprovals > 0 ? pendingApprovals : null
              return (
                <div key={item.key} className="mac-subnav-item" onClick={() => navigate(item.path)}>
                  <span className="mac-subnav-icon">{item.icon}</span>
                  <span className="mac-subnav-label">{item.label}</span>
                  {badge && <span className="mac-subnav-badge">{badge}</span>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Two Column: Activity Chart + Environment Health */}
        <div className="mac-two-col">
          {/* Activity Chart */}
          <div className="mac-section">
            <div className="mac-section-title">本周 Session 活动</div>
            <div className="mac-activity-chart">
              {activity.map((a, i) => (
                <div key={i} className="mac-chart-bar-group">
                  <div className="mac-chart-bar-val">{a.sessions}</div>
                  <div className="mac-chart-bar-track">
                    <div
                      className="mac-chart-bar-fill"
                      style={{
                        height: `${(a.sessions / maxSessions) * 100}%`,
                        background: a.sessions > 5 ? '#52c41a' : a.sessions > 2 ? '#1890ff' : '#d9d9d9',
                      }}
                    />
                  </div>
                  <div className="mac-chart-bar-label">{a.day}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Environment Health + Alerts */}
          <div className="mac-section">
            <div className="mac-section-title">环境 & 告警</div>
            <div className="mac-health-list">
              <div className="mac-health-item">
                <span style={{ color: '#52c41a' }}>●</span>
                <span>健康环境</span>
                <span className="mac-health-val">{healthyEnvs} / {environments.length}</span>
              </div>
              <div className="mac-health-item">
                <span style={{ color: '#ff4d4f' }}>●</span>
                <span>失败 Session</span>
                <span className="mac-health-val" style={{ color: failedSessions > 0 ? '#ff4d4f' : undefined }}>{failedSessions}</span>
              </div>
              <div className="mac-health-item">
                <span style={{ color: '#fa8c16' }}>●</span>
                <span>待审批请求</span>
                <span className="mac-health-val" style={{ color: pendingApprovals > 0 ? '#fa8c16' : undefined }}>{pendingApprovals}</span>
              </div>
              <div className="mac-health-item">
                <span style={{ color: '#1890ff' }}>●</span>
                <span>总 Token 消耗</span>
                <span className="mac-health-val">{totalTokens.toLocaleString()}</span>
              </div>
            </div>

            {/* Agent Status Summary */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>Agent 状态分布</div>
              <div className="mac-agent-chips">
                {agents.map(agent => {
                  const sc = AGENT_STATUS_COLORS[agent.status] || AGENT_STATUS_COLORS.draft
                  return (
                    <span
                      key={agent.id}
                      className="mac-agent-chip"
                      style={{ borderLeftColor: sc.color }}
                      onClick={() => navigate(`/managed-agent/agents/${agent.id}`)}
                    >
                      {agent.name}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="mac-section">
          <div className="mac-section-title">最近会话</div>
          <div className="mac-recent-list">
            {recentSessions.length === 0 ? (
              <div className="mac-empty-inline">暂无会话记录</div>
            ) : (
              recentSessions.map(s => {
                const sc = SESSION_STATUS_COLORS[s.status] || SESSION_STATUS_COLORS.created
                return (
                  <div key={s.id} className="mac-recent-item" onClick={() => navigate(`/managed-agent/sessions/${s.id}`)}>
                    <div className="mac-recent-left">
                      <span className="ha-status-tag" style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}>{sc.label}</span>
                      <span className="mac-recent-agent">{s.agentName}</span>
                      <span className="mac-recent-thread">{s.threads?.[0]?.title || 'Untitled'}</span>
                    </div>
                    <div className="mac-recent-right">
                      <span className="mac-recent-meta">{s.tokenUsage?.total?.toLocaleString() || 0} tokens</span>
                      <span className="mac-recent-meta">${s.cost || 0}</span>
                      <span className="mac-recent-time">{s.lastEventAt?.slice(5, 16) || '-'}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
