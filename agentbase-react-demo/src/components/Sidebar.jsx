import { useState } from 'react'
import './Sidebar.css'

const LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%234080ff"/><stop offset="50%" stop-color="%2350b371"/><stop offset="100%" stop-color="%23f5a623"/></linearGradient></defs><path d="M16 2L28 9v14l-12 7L4 23V9z" fill="url(%23g1)" opacity="0.9"/><path d="M16 8L22 11.5v7L16 22l-6-3.5v-7z" fill="white" opacity="0.85"/></svg>`

const navItems = [
  { key: 'overview', label: '概览', icon: '🏠' },
  { key: 'application-portal', label: '应用门户', icon: '📱' },
]

const workspaceNavGroups = [
  {
    title: '构建与运行时',
    items: [
      { key: 'agent-dev', label: 'Agent 应用开发', icon: '🤖' },
      { key: 'agent-runtime', label: 'Agent 应用运行时', icon: '⚡' },
      { key: 'harness-agent', label: 'Harness Agent', icon: '🔗' },
    ]
  },
  {
    title: '基础组件',
    items: [
      { key: 'ai-database', label: 'AI 数据库', icon: '🗄️' },
      { key: 'memory', label: '记忆体', icon: '🧠' },
      { key: 'ai-model-service', label: 'AI 模型服务', icon: '🏗️' },
      { key: 'mcp-service', label: 'MCP 服务', icon: '🌐' },
      { key: 'api-routing', label: 'API 应用路由', icon: '🔀' },
    ]
  },
  {
    title: '观测与监控',
    items: [
      { key: 'global-observation', label: '全局应用观测', icon: '📊' },
      { key: 'trace', label: 'Agent 链路追踪 (Trace)', icon: '🔍' },
    ]
  },
]

const systemItems = [
  { key: 'cluster-manage', label: '集群管理' },
  { key: 'image-registry', label: '镜像仓库' },
  { key: 'member-management', label: '成员管理' },
  { key: 'workspace-management', label: '工作空间管理' },
  { key: 'operation-audit', label: '操作审计' },
  { key: 'gateway-instance', label: '网关实例管理' },
  { key: 'auth-manage', label: '凭证管理' },
]

export default function Sidebar({ activeNav, onNavClick }) {
  const [systemOpen, setSystemOpen] = useState(
    systemItems.some(item => activeNav === item.key)
  )

  const isSystemActive = systemItems.some(item => activeNav === item.key)

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        {/* Logo */}
        <div className="sidebar-logo">
          <img src={LOGO_SVG} alt="AgentBase" className="sidebar-logo-icon" />
          <span className="sidebar-logo-text">AgentBase</span>
        </div>

        {/* Top nav items */}
        <ul className="sidebar-nav">
          {navItems.map(item => (
            <li
              key={item.key}
              className={`sidebar-nav-item ${activeNav === item.key ? 'active' : ''}`}
              onClick={() => onNavClick(item.key)}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
            </li>
          ))}
        </ul>

        <div className="sidebar-divider" />

        {/* Workspace selector */}
        <div className="sidebar-workspace">
          <div className="sidebar-workspace-select">
            <span>Demo项目</span>
            <span className="sidebar-workspace-caret">▾</span>
          </div>
        </div>

        {/* Workspace nav groups */}
        {workspaceNavGroups.map(group => (
          <div key={group.title} className="sidebar-group">
            <div className="sidebar-group-title">{group.title}</div>
            <ul className="sidebar-nav">
              {group.items.map(item => (
                <li
                  key={item.key}
                  className={`sidebar-nav-item ${activeNav === item.key ? 'active' : ''}`}
                  onClick={() => onNavClick(item.key)}
                >
                  <span className="sidebar-nav-icon">{item.icon}</span>
                  <span className="sidebar-nav-label">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="sidebar-divider" />

        {/* System Management (expandable) */}
        <div className="sidebar-group">
          <div
            className={`sidebar-nav-item sidebar-submenu-trigger ${isSystemActive ? 'active-parent' : ''}`}
            onClick={() => setSystemOpen(!systemOpen)}
            style={{ margin: '0 8px' }}
          >
            <span className="sidebar-nav-icon">⚙️</span>
            <span className="sidebar-nav-label">系统管理</span>
            <span className={`sidebar-submenu-arrow ${systemOpen ? 'open' : ''}`}>›</span>
          </div>
          {systemOpen && (
            <ul className="sidebar-nav sidebar-subnav">
              {systemItems.map(item => (
                <li
                  key={item.key}
                  className={`sidebar-nav-item sidebar-sub-item ${activeNav === item.key ? 'active' : ''}`}
                  onClick={() => onNavClick(item.key)}
                >
                  <span className="sidebar-nav-label">{item.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Bottom items */}
        <div className="sidebar-bottom">
          <div className="sidebar-nav-item" onClick={() => onNavClick('overview')}>
            <span className="sidebar-nav-icon">❓</span>
            <span className="sidebar-nav-label">新手引导</span>
          </div>
          <div className="sidebar-nav-item" onClick={() => onNavClick('overview')}>
            <span className="sidebar-nav-icon">👤</span>
            <span className="sidebar-nav-label">超级管理员</span>
          </div>
        </div>
      </div>

      {/* Collapse button */}
      <div className="sidebar-collapse">
        <span className="sidebar-collapse-icon">☰</span>
      </div>
    </div>
  )
}
