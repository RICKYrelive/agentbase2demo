import { useState } from 'react'
import './Sidebar.css'

const LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%234080ff"/><stop offset="50%" stop-color="%2350b371"/><stop offset="100%" stop-color="%23f5a623"/></linearGradient></defs><path d="M16 2L28 9v14l-12 7L4 23V9z" fill="url(%23g1)" opacity="0.9"/><path d="M16 8L22 11.5v7L16 22l-6-3.5v-7z" fill="white" opacity="0.85"/></svg>`

// Modern Stroke Icons (Lucide-style)
const Icon = ({ children }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    {children}
  </svg>
)

const IconHome = () => <Icon><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></Icon>
const IconLayoutGrid = () => <Icon><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></Icon>
const IconTerminal = () => <Icon><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></Icon>
const IconCompass = () => <Icon><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></Icon>
const IconActivity = () => <Icon><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></Icon>
const IconShield = () => <Icon><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"/></Icon>
const IconHammer = () => <Icon><path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.31C18.73 6.25 18 4 18 4s-2.25.73-3.9 1.73h-.31c-.85 0-1.65.33-2.25.93l-1.25 1.25"/></Icon>
const IconZap = () => <Icon><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></Icon>
const IconDatabase = () => <Icon><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></Icon>
const IconCpu = () => <Icon><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></Icon>
const IconAtom = () => <Icon><circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c2.04-2.03.02-7.36-4.52-11.9s-9.87-6.56-11.9-4.52 0 7.37 4.52 11.9 9.87 6.55 11.9 4.52z"/><path d="M3.8 20.2c-2.04-2.03.02-7.36 4.52-11.9s9.87-6.56 11.9-4.52 0 7.37-4.52 11.9-9.87 6.55-11.9 4.52z"/></Icon>
const IconGlobe = () => <Icon><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></Icon>
const IconPuzzle = () => <Icon><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.17a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.17a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.17a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.17a1.65 1.65 0 0 0-1.51 1z"/></Icon>
const IconPackage = () => <Icon><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.27 6.96 8.73 5.05 8.73-5.05"/><path d="M12 22.08V12"/></Icon>
const IconSplit = () => <Icon><path d="M16 3h5v5"/><path d="m8 3 13 13"/><path d="M16 21h5v-5"/><path d="m21 3-5 5"/><path d="m21 21-5-5"/><path d="m8 21-5-5"/><path d="m3 3 5 5"/></Icon>
const IconBarChart = () => <Icon><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></Icon>
const IconFootprints = () => <Icon><path d="M4 16v-2.38C4 11.5 5.8 8 8 8c.67 0 1.13.3 1.51.6l1.49 1.4"/><path d="M18 11.5V14c0 1.53-1.47 3-3 3-.67 0-1.13-.3-1.51-.6l-1.49-1.4"/><circle cx="15.5" cy="5.5" r="1"/><circle cx="11.5" cy="3" r="1"/><circle cx="8" cy="3.5" r="1"/><circle cx="5.5" cy="6" r="1"/></Icon>
const IconSettings = () => <Icon><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></Icon>
const IconUser = () => <Icon><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Icon>
const IconHelpCircle = () => <Icon><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" x2="12.01" y1="17" y2="17"/></Icon>
const IconLink = () => <Icon><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></Icon>
const IconLayers = () => <Icon><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></Icon>

const navItems = [
  { key: 'overview', label: '概览', icon: <IconHome /> },
  { key: 'application-portal', label: '应用门户', icon: <IconLayoutGrid /> },
]

const agentFactoryItems = [
  { key: 'af-agent', label: '配置Agent', icon: <IconCompass />, desc: 'Agent 定义库' },
  { key: 'af-session', label: '会话管理', icon: <IconActivity />, desc: '运行实例' },
  { key: 'af-environment', label: '沙箱环境配置', icon: <IconGlobe />, desc: '运行环境' },
  { key: 'af-passport', label: '凭证托管', icon: <IconShield />, desc: '凭证保险箱' },
]

const workspaceNavGroups = [
  {
    title: '高/低代码构建与运行时',
    items: [
      { key: 'agent-dev', label: 'Agent 应用开发', icon: <IconHammer /> },
      { key: 'agent-runtime', label: 'Agent 应用运行时', icon: <IconZap /> },
    ]
  },
  {
    title: 'Harness 托管',
    items: [
      { 
        key: 'managed-agent', 
        label: 'Agent Factory', 
        icon: <IconLayers />,
        isSubmenu: true,
        subItems: agentFactoryItems
      },
      { key: 'super-agent', label: 'Super Agent (已废弃)', icon: <IconLink /> },
    ]
  },
  {
    title: '基础组件',
    items: [
      { key: 'ai-database', label: 'AI 数据库', icon: <IconDatabase /> },
      { key: 'memory', label: '记忆体', icon: <IconCpu /> },
      { key: 'ai-model-service', label: 'AI 模型服务', icon: <IconAtom /> },
      { key: 'mcp-service', label: 'MCP 服务', icon: <IconGlobe /> },
      { key: 'skill-center', label: 'Skill 中心', icon: <IconPuzzle /> },
      { key: 'sandbox-manage', label: '沙箱 (待完善)', icon: <IconPackage /> },
      { key: 'api-routing', label: 'API 应用路由', icon: <IconSplit /> },
    ]
  },
  {
    title: '观测与监控',
    items: [
      { key: 'global-observation', label: '全局应用观测', icon: <IconBarChart /> },
      { key: 'trace', label: 'Agent 链路追踪 (Trace)', icon: <IconFootprints /> },
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
  const [factoryOpen, setFactoryOpen] = useState(
    agentFactoryItems.some(item => activeNav === item.key)
  )
  const [showProfile, setShowProfile] = useState(false)

  const isSystemActive = systemItems.some(item => activeNav === item.key)
  const isFactoryActive = agentFactoryItems.some(item => activeNav === item.key)

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

        {/* Floating item below workspace */}
        <ul className="sidebar-nav" style={{ marginTop: 4, marginBottom: 8 }}>
          <li
            className={`sidebar-nav-item ${activeNav === 'af-workshop' ? 'active' : ''}`}
            onClick={() => onNavClick('af-workshop')}
          >
            <span className="sidebar-nav-icon"><IconTerminal /></span>
            <span className="sidebar-nav-label">Agent 工坊</span>
          </li>
        </ul>

        {/* Workspace nav groups */}
        {workspaceNavGroups.map(group => (
          <div key={group.title} className="sidebar-group">
            <div className="sidebar-group-title">{group.title}</div>
            <ul className="sidebar-nav">
              {group.items.map(item => (
                <div key={item.key}>
                  <li
                    className={`sidebar-nav-item ${activeNav === item.key || (item.subItems && item.subItems.some(si => si.key === activeNav)) ? 'active' : ''} ${item.isSubmenu ? 'sidebar-submenu-trigger' : ''}`}
                    onClick={() => {
                      if (item.isSubmenu) {
                        setFactoryOpen(!factoryOpen)
                      } else {
                        onNavClick(item.key)
                      }
                    }}
                  >
                    <span className="sidebar-nav-icon">{item.icon}</span>
                    <span className="sidebar-nav-label">{item.label}</span>
                    {item.isSubmenu && <span className={`sidebar-submenu-arrow ${factoryOpen ? 'open' : ''}`}>›</span>}
                  </li>
                  {item.isSubmenu && factoryOpen && (
                    <ul className="sidebar-nav sidebar-subnav">
                      {item.subItems.map(sub => (
                        <li
                          key={sub.key}
                          className={`sidebar-nav-item sidebar-sub-item ${activeNav === sub.key ? 'active' : ''}`}
                          onClick={() => onNavClick(sub.key)}
                        >
                          <span className="sidebar-nav-icon">{sub.icon}</span>
                          <span className="sidebar-nav-label">{sub.label}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </ul>
          </div>
        ))}

        <div className="sidebar-divider" />

        <div className="sidebar-divider" />

        {/* System Management (expandable) */}
        <div className="sidebar-group">
          <div
            className={`sidebar-nav-item sidebar-submenu-trigger ${isSystemActive ? 'active-parent' : ''}`}
            onClick={() => setSystemOpen(!systemOpen)}
          >
            <span className="sidebar-nav-icon"><IconSettings /></span>
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
            <span className="sidebar-nav-icon"><IconHelpCircle /></span>
            <span className="sidebar-nav-label">新手引导</span>
          </div>
          
          <div 
            className="sidebar-user-container"
            onMouseEnter={() => setShowProfile(true)}
            onMouseLeave={() => setShowProfile(false)}
          >
            {showProfile && (
              <div className="sidebar-profile-popover">
                <div className="spp-info">
                  <div className="spp-header">
                    <span className="spp-title">AgentBase</span>
                    <span className="spp-badge">已授权</span>
                  </div>
                  <div className="spp-stat">vCPU授权数: 400核</div>
                  <div className="spp-stat">有效期：2026-09-30</div>
                </div>
                <div className="spp-menu">
                  <div className="spp-menu-item">更新授权</div>
                  <div className="spp-menu-item" style={{ fontWeight: 600, color: 'var(--color-blue)' }}>APIKey 管理</div>
                  <div className="spp-menu-item">重置密码</div>
                  <div className="spp-menu-item danger">退出</div>
                </div>
              </div>
            )}
            <div className="sidebar-nav-item">
              <span className="sidebar-nav-icon"><IconUser /></span>
              <span className="sidebar-nav-label">Ricky</span>
            </div>
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
