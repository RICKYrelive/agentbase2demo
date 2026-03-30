import { useState } from 'react'
import PageLayout from '../components/PageLayout'
import './AgentDev.css'

export default function AgentDev({ onAlert }) {
  const [tab, setTab] = useState('high')
  return (
    <PageLayout
      title="Agent 应用开发"
      rightAction={<button className="action-btn" onClick={onAlert}>⊙ 低代码应用迁移指引</button>}
    >
      <div className="page-tabs">
        <div className={`page-tab ${tab === 'high' ? 'active' : ''}`} onClick={() => setTab('high')}>高代码开发</div>
        <div className={`page-tab ${tab === 'low' ? 'active' : ''}`} onClick={() => setTab('low')}>低代码开发</div>
      </div>
      <div className="agent-dev-empty">
        <div className="agent-dev-illustration">
          <div className="dev-card">Crew AI</div>
          <div className="dev-card">LangGraph</div>
        </div>
        <h3 className="agent-dev-heading">创建第一个高代码开发环境</h3>
        <p className="agent-dev-desc">使用平台内置高代码应用开发模板，<br />快速构建应用镜像</p>
        <button className="action-btn primary" onClick={onAlert}>模版创建</button>
      </div>
    </PageLayout>
  )
}
