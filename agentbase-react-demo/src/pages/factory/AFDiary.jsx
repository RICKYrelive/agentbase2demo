import { useState } from 'react'
import PageLayout, { DataToolbar } from '../../components/PageLayout'
import './AF.css'

const MOCK_DIARIES = [
  {
    id: 'diary_001', sessionId: 'ses_a1b2c3d4', sessionTitle: 'PR 代码审查 #384',
    agentName: 'Code Reviewer', createdAt: '2026-04-12 18:45',
    entries: [
      { path: 'observation/code_style', content: 'ACME backend 项目严格使用 Black 格式化。缩进为 4 空格，最大行长度 88 字符。', time: '18:34:12', tags: ['代码风格', 'Python'] },
      { path: 'observation/test_patterns', content: 'pytest + fixtures，测试文件命名规范为 test_*.py。覆盖率报告在 /reports/coverage.xml。', time: '18:36:50', tags: ['测试', 'pytest'] },
      { path: 'learning/pr_workflow', content: 'PR #384 涉及 3 个文件修改，主要集中在 auth 模块。reviewer 需关注 JWT expiry 逻辑。', time: '18:42:07', tags: ['PR', 'auth'] },
    ],
  },
  {
    id: 'diary_002', sessionId: 'ses_e5f6a7b8', sessionTitle: '市场报告研究',
    agentName: 'Deep Researcher', createdAt: '2026-04-12 21:55',
    entries: [
      { path: 'research/market_size', content: '2025 年全球 AI Agent 市场规模约 $5.1B，预计 2030 年达 $47B (CAGR ~55%)。来源：Gartner, IDC。', time: '21:10:33', tags: ['市场', 'AI'] },
      { path: 'research/key_players', content: '主要竞争者：Anthropic (Claude), OpenAI (GPTs), Google (Vertex AI Agents), Microsoft (Azure AI)。', time: '21:23:11', tags: ['竞争分析'] },
    ],
  },
]

export default function AFDiary() {
  const [selected, setSelected] = useState(MOCK_DIARIES[0])
  const [entrySearch, setEntrySearch] = useState('')

  const filteredEntries = selected?.entries.filter(e =>
    !entrySearch || e.path.includes(entrySearch) || e.content.includes(entrySearch) || e.tags.some(t => t.includes(entrySearch))
  ) ?? []

  return (
    <PageLayout title="Diary">
      <div className="info-alert">
        <span className="info-alert-icon">ℹ️</span>
        Diary 记录每个 Session 实例在执行过程中积累的<strong>本地记忆</strong>，生命周期与 Session 绑定。
        区别于全局「记忆体」模块（跨会话持久化），Diary 仅在单次 Session 内有效，用于追踪 Agent 的观察与学习。
      </div>

      <DataToolbar buttons={null} filters={null}>
        <div className="search-input">
          <span className="search-icon">🔍</span>
          <input placeholder="搜索路径、内容或标签" value={entrySearch} onChange={e => setEntrySearch(e.target.value)} />
        </div>
        <button className="refresh-btn-sm">↻</button>
      </DataToolbar>

      <div className="afd-layout">
        {/* Diary list */}
        <div className="afd-sidebar">
          <div className="afd-sidebar-label">Session 日记本</div>
          {MOCK_DIARIES.map(d => (
            <div key={d.id} className={`afd-diary-item ${selected?.id === d.id ? 'active' : ''}`} onClick={() => setSelected(d)}>
              <div className="afd-diary-title notion-body-medium">{d.sessionTitle}</div>
              <div className="afd-diary-meta">
                <span className="af-model-badge notion-badge-text" style={{ fontSize: 10 }}>{d.agentName}</span>
                <span className="af-muted notion-caption">{d.entries.length} 条</span>
              </div>
              <div className="afd-diary-time">{d.createdAt}</div>
            </div>
          ))}
        </div>

        {/* Detail */}
        <div className="afd-content">
          {selected ? (
            <>
              <div className="afd-content-header">
                <div>
                  <div className="afd-content-title notion-h3">{selected.sessionTitle}</div>
                  <div className="afd-content-sub notion-caption">
                    <span className="af-id-cell">{selected.sessionId}</span>
                    <span>·</span>
                    <span>来自 Session 实例，非全局记忆体</span>
                  </div>
                </div>
                <span className="status-badge" style={{ background: 'var(--notion-bg-alt)', color: 'var(--notion-gray-500)', border: 'var(--notion-border)', borderRadius: '9999px', padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>📓 Local Diary</span>
              </div>

              <div className="afd-entries">
                {filteredEntries.length === 0 ? (
                  <div className="empty-state" style={{ padding: '24px 0' }}>
                    <div className="empty-icon">📋</div>
                    <span>无匹配记录</span>
                  </div>
                ) : filteredEntries.map((e, i) => (
                  <div key={i} className="afd-entry" style={{ border: 'var(--notion-border)', boxShadow: 'var(--notion-shadow-card)', borderRadius: 8, background: 'var(--notion-bg)' }}>
                    <div className="afd-entry-header">
                      <span className="afd-entry-path notion-body-medium" style={{ color: 'var(--notion-blue)' }}>📝 {e.path}</span>
                      <span className="afd-entry-time notion-caption">{e.time}</span>
                    </div>
                    <div className="afd-entry-content notion-body">{e.content}</div>
                    <div className="afd-entry-tags">
                      {e.tags.map(t => <span key={t} className="status-badge" style={{ background: 'var(--notion-bg-alt)', color: 'var(--notion-blue)', border: 'var(--notion-border)', borderRadius: '4px', fontSize: 10 }}>{t}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ padding: '48px 0' }}>
              <div className="empty-icon">📓</div>
              <span>选择左侧的 Session 日记本查看记录</span>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
