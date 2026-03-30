import { useState } from 'react'
import './OverviewPage.css'

const appCards = [
  {
    name: 'test-77',
    status: 'running',
    tokenTotal: 0,
    inputTokens: 0,
    outputTokens: 0,
    traceError: 0,
    spanError: 0,
    p99: 0,
    p95: 0,
  },
  {
    name: 'test',
    status: 'running',
    tokenTotal: 0,
    inputTokens: 0,
    outputTokens: 0,
    traceError: 0,
    spanError: 0,
    p99: 0,
    p95: 0,
  },
]

const tokenRankingData = [
  { name: 'Demo项目', total: 0, input: 0, output: 0 },
  { name: '云BG', total: 0, input: 0, output: 0 },
  { name: 'AI超融合', total: 0, input: 0, output: 0 },
]

const k8sNodes = [
  { name: 'agent1-az1', status: 'healthy' },
  { name: 'agent2-az1', status: 'healthy' },
  { name: 'agent2-az1', status: 'healthy' },
]

const resourceRanking = [
  { name: '云BG', value: 35.74, percent: 50.3 },
  { name: 'Demo项目', value: 31.37, percent: 44.2 },
]

export default function OverviewPage() {
  const [appTab, setAppTab] = useState('high_code')
  const [tokenDimension, setTokenDimension] = useState('workspace')
  const [resourceType, setResourceType] = useState('cpu')

  return (
    <div className="overview-page">
      {/* Header */}
      <div className="overview-header">
        <div className="overview-header-left">
          <div className="overview-title-bar"></div>
          <h1 className="overview-title">概览</h1>
          <div className="overview-workspace-select">
            <span>全部工作空间</span>
            <span className="select-caret">▾</span>
          </div>
        </div>
        <button className="refresh-btn" title="刷新">↻</button>
      </div>

      {/* App Section */}
      <div className="section-card">
        {/* Tabs + Time + Status */}
        <div className="app-tabs-bar">
          <div className="app-tabs-left">
            <div className="app-tabs">
              <div
                className={`app-tab ${appTab === 'high_code' ? 'active' : ''}`}
                onClick={() => setAppTab('high_code')}
              >
                高代码应用
              </div>
              <div
                className={`app-tab ${appTab === 'low_code' ? 'active' : ''}`}
                onClick={() => setAppTab('low_code')}
              >
                低代码应用
              </div>
            </div>
            <div className="app-time-select">
              <span>近 1 天</span>
              <span className="select-caret">▾</span>
            </div>
          </div>
          <div className="app-tabs-right">
            <span className="status-tag"><span className="status-dot error"></span>异常 0</span>
            <span className="status-tag"><span className="status-dot running"></span>运行 2</span>
            <span className="status-tag"><span className="status-dot stopped"></span>停用 0</span>
          </div>
        </div>

        {/* View more */}
        <div className="view-more-link-top">
          <span className="sim-link">查看更多 ›</span>
        </div>

        {/* App Cards Grid */}
        <div className="app-cards-grid">
          {appCards.map((card, i) => (
            <div key={i} className="metric-card">
              <div className={`metric-card-title metric-card-title--${card.status}`}>
                {card.name}
              </div>
              <div className="metric-card-total">
                <div className="metric-card-total-value">{card.tokenTotal}</div>
                <div className="metric-card-total-label">Token 总数</div>
              </div>
              <div className="metric-card-rows">
                <div className="metric-row">
                  <div className="metric-item">
                    <span className="metric-label">Input Tokens</span>
                    <span className="metric-value">{card.inputTokens}</span>
                  </div>
                  <div className="metric-divider"></div>
                  <div className="metric-item">
                    <span className="metric-label">Output Tokens</span>
                    <span className="metric-value">{card.outputTokens}</span>
                  </div>
                </div>
                <div className="metric-row">
                  <div className="metric-item">
                    <span className="metric-label">Trace 异常</span>
                    <span className="metric-value">{card.traceError}</span>
                  </div>
                  <div className="metric-divider"></div>
                  <div className="metric-item">
                    <span className="metric-label">Span 异常</span>
                    <span className="metric-value">{card.spanError}</span>
                  </div>
                </div>
                <div className="metric-row">
                  <div className="metric-item">
                    <span className="metric-label">P99 延迟</span>
                    <span className="metric-value">{card.p99}<span className="metric-unit">s</span></span>
                  </div>
                  <div className="metric-divider"></div>
                  <div className="metric-item">
                    <span className="metric-label">P95 延迟</span>
                    <span className="metric-value">{card.p95}<span className="metric-unit">s</span></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Token Section */}
      <div className="section-card token-section">
        <div className="token-section-header">
          <h2 className="section-title">Token 消耗</h2>
          <span className="sim-link">查看更多 ›</span>
        </div>
        <div className="token-content">
          {/* Chart area */}
          <div className="token-chart-card">
            <div className="token-summary">
              <div className="token-summary-item">
                <div className="token-summary-value">0</div>
                <div className="token-summary-label">Token 消耗总数</div>
              </div>
              <div className="token-summary-item">
                <div className="token-summary-value">0</div>
                <div className="token-summary-label">Input 消耗</div>
              </div>
              <div className="token-summary-item">
                <div className="token-summary-value">0</div>
                <div className="token-summary-label">Output 消耗</div>
              </div>
            </div>
            {/* Chart placeholder */}
            <div className="token-chart-area">
              <div className="chart-y-axis">
                {[1, 0.8, 0.6, 0.4, 0.2, 0].map(v => (
                  <span key={v} className="chart-y-label">{v}</span>
                ))}
              </div>
              <div className="chart-grid">
                <div className="chart-line"></div>
                <div className="chart-line"></div>
                <div className="chart-line"></div>
                <div className="chart-line"></div>
                <div className="chart-line"></div>
                <div className="chart-line"></div>
              </div>
              <div className="chart-x-axis">
                <span>03-29 18:00</span>
                <span>03-30 00:00</span>
                <span>03-30 06:00</span>
                <span>03-30 12:00</span>
              </div>
            </div>
            <div className="chart-legend">
              <span className="legend-item"><span className="legend-dot blue"></span>Input Tokens</span>
              <span className="legend-item"><span className="legend-dot green"></span>Output Tokens</span>
            </div>
          </div>

          {/* Ranking area */}
          <div className="token-ranking-card">
            <div className="token-ranking-header">
              <h3 className="token-ranking-title">Token 消耗排行</h3>
              <div className="radio-group">
                {[
                  { key: 'workspace', label: '工作空间' },
                  { key: 'application', label: 'Agent 应用' },
                  { key: 'model', label: 'AI 模型路由' },
                ].map(item => (
                  <button
                    key={item.key}
                    className={`radio-btn ${tokenDimension === item.key ? 'active' : ''}`}
                    onClick={() => setTokenDimension(item.key)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <table className="ranking-table">
              <thead>
                <tr>
                  <th>工作空间</th>
                  <th>总 Tokens <span className="sort-arrows">↕</span></th>
                  <th>Input Tok... <span className="sort-arrows">↕</span></th>
                  <th>Output To... <span className="sort-arrows">↕</span></th>
                </tr>
              </thead>
              <tbody>
                {tokenRankingData.map((row, i) => (
                  <tr key={i}>
                    <td>{row.name}</td>
                    <td>{row.total}</td>
                    <td>{row.input}</td>
                    <td>{row.output}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* K8s Section */}
      <div className="section-card k8s-section">
        <h2 className="section-title">K8s 集群</h2>
        <div className="k8s-content">
          {/* Cluster status */}
          <div className="k8s-cluster-card">
            <div className="k8s-cluster-top">
              <div className="k8s-icon-area">
                <svg className="k8s-icon" viewBox="0 0 48 48" width="60" height="60">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#c0c8d4" strokeWidth="1" strokeDasharray="3,3"/>
                  <circle cx="24" cy="24" r="12" fill="none" stroke="#c0c8d4" strokeWidth="1" strokeDasharray="3,3"/>
                  <circle cx="24" cy="12" r="3" fill="#dce0e6"/>
                  <circle cx="12" cy="30" r="3" fill="#dce0e6"/>
                  <circle cx="36" cy="30" r="3" fill="#dce0e6"/>
                  <circle cx="24" cy="24" r="4" fill="#c0c8d4"/>
                </svg>
              </div>
              <div className="k8s-status-summary">
                <span className="k8s-status-item">
                  <span className="status-dot error"></span>
                  <span className="k8s-status-text error">异常 0</span>
                </span>
                <span className="k8s-status-item">
                  <span className="status-dot running"></span>
                  <span className="k8s-status-text running">正常 3</span>
                </span>
                <span className="k8s-status-item">
                  <span className="status-dot stopped"></span>
                  <span className="k8s-status-text stopped">离线 0</span>
                </span>
              </div>
            </div>
            <div className="k8s-node-list">
              {k8sNodes.map((node, i) => (
                <div key={i} className="k8s-node">
                  <span className="k8s-node-bar"></span>
                  <span className="k8s-node-name">{node.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Resource ranking */}
          <div className="resource-ranking-card">
            <div className="resource-ranking-header">
              <h3 className="resource-ranking-title">工作空间资源使用排行</h3>
              <div className="radio-group">
                {[
                  { key: 'cpu', label: 'CPU' },
                  { key: 'memory', label: '内存' },
                  { key: 'storage', label: '存储' },
                ].map(item => (
                  <button
                    key={item.key}
                    className={`radio-btn ${resourceType === item.key ? 'active' : ''}`}
                    onClick={() => setResourceType(item.key)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="resource-ranking-list">
              {resourceRanking.map((item, i) => (
                <div key={i} className="resource-rank-item">
                  <div className="resource-rank-left">
                    <span className={`rank-tag ${i < 3 ? 'top' : ''}`}>{i + 1}</span>
                    <span className="rank-name">{item.name}</span>
                  </div>
                  <div className="rank-bar-wrap">
                    <div className="rank-bar" style={{ width: `${item.percent}%` }}></div>
                  </div>
                  <div className="rank-value">{item.value} 核</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
