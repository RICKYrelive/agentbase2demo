import { useState } from 'react'
import PageLayout from '../components/PageLayout'
import './GlobalObservation.css'

const tabs = ['Agent 应用', 'AI 数据库', '记忆体', 'AI 模型服务', 'MCP 服务']
const sections = ['概览', '性能延迟', '流量并发', 'Token 消耗', '调用 AI 模型服务', 'Trace 统计']

export default function GlobalObservation({ onAlert }) {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <PageLayout
      title="全局应用观测"
      rightAction={<button className="action-btn" onClick={onAlert}>⊙ 观测服务集成指引</button>}
    >
      <div className="page-tabs">
        {tabs.map((t, i) => (
          <div key={i} className={`page-tab ${activeTab === i ? 'active' : ''}`} onClick={() => setActiveTab(i)}>{t}</div>
        ))}
      </div>

      <div className="obs-filters">
        <div className="radio-group">
          <button className="radio-btn active">高代码应用</button>
          <button className="radio-btn">低代码应用</button>
        </div>
        <button className="filter-select" onClick={onAlert}>选择应用 ▾</button>
        <button className="filter-select" onClick={onAlert}>近 7 天 ▾</button>
      </div>

      <div className="obs-content">
        <div className="obs-main">
          {sections.map((sec, i) => (
            <div key={i} className="obs-section">
              <h3 className="obs-section-title">{sec}</h3>
              <div className="obs-charts-grid">
                <div className="obs-chart-placeholder">
                  <div className="obs-chart-label">P99 延迟</div>
                  <div className="obs-no-data">暂无数据</div>
                </div>
                <div className="obs-chart-placeholder">
                  <div className="obs-chart-label">P95 延迟</div>
                  <div className="obs-no-data">暂无数据</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="obs-anchor-menu">
          {sections.map((sec, i) => (
            <div key={i} className="obs-anchor-item">{sec}</div>
          ))}
        </div>
      </div>
    </PageLayout>
  )
}
