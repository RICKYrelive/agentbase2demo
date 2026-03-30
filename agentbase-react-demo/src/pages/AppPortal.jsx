import PageLayout from '../components/PageLayout'
import './AppPortal.css'

const apps = [
  { name: '旅游助手✨', desc: '', icon: '🚀', category: '旅游助手' },
  { name: 'nametest', desc: '这是一段描述', icon: '🚀', category: '销售工具' },
]

export default function AppPortal({ onAlert }) {
  return (
    <PageLayout
      title="应用门户"
      rightAction={<button className="action-btn" onClick={onAlert}>⊙ 门户管理</button>}
    >
      <div className="portal-hero">
        <h2 className="portal-hero-title">
          用 <span className="portal-hero-accent">Agent</span> 重塑生产力
        </h2>
        <p className="portal-hero-subtitle">
          低门槛 ｜ 灵活编排 ｜ 安全可信 ｜ 开箱即用
        </p>
        <div className="portal-search">
          <span className="portal-search-icon">🔍</span>
          <input placeholder="搜索你感兴趣的应用" />
        </div>
      </div>

      <div className="portal-categories">
        <button className="category-btn active">全部</button>
        <button className="category-btn">旅游助手</button>
        <button className="category-btn">销售工具</button>
      </div>

      <div className="portal-app-grid">
        {apps.map((app, i) => (
          <div key={i} className="portal-app-card" onClick={onAlert}>
            <div className="portal-app-icon">{app.icon}</div>
            <div className="portal-app-info">
              <div className="portal-app-name">{app.name}</div>
              {app.desc && <div className="portal-app-desc">{app.desc}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="portal-footer">© 2026 AgentBase . All rights reserved.</div>
    </PageLayout>
  )
}
