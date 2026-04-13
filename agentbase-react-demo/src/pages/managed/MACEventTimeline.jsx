import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useManagedAgents, EVENT_TYPE_ICONS, EVENT_TYPE_LABELS, SESSION_STATUS_COLORS } from '../../store/managedAgentStore'
import PageLayout, { DataToolbar } from '../../components/PageLayout'
import './MAC.css'

export default function MACEventTimeline() {
  const navigate = useNavigate()
  const { sessions } = useManagedAgents()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sessionFilter, setSessionFilter] = useState('all')
  const [expandedEvent, setExpandedEvent] = useState(null)

  const allEvents = useMemo(() => {
    let events = []
    sessions.forEach(s => {
      (s.events || []).forEach(e => {
        events.push({ ...e, sessionAgentName: s.agentName, sessionId: s.id, sessionStatus: s.status })
      })
    })
    events.sort((a, b) => b.timestamp?.localeCompare(a.timestamp))
    return events
  }, [sessions])

  const filtered = useMemo(() => {
    return allEvents.filter(e => {
      if (typeFilter !== 'all' && e.type !== typeFilter) return false
      if (sessionFilter !== 'all' && e.sessionId !== sessionFilter) return false
      if (search) {
        const content = JSON.stringify(e.payload || {}).toLowerCase()
        if (!content.includes(search.toLowerCase())) return false
      }
      return true
    })
  }, [allEvents, typeFilter, sessionFilter, search])

  const uniqueSessionIds = [...new Set(allEvents.map(e => e.sessionId))]

  return (
    <PageLayout title="Event Timeline" rightAction={<span style={{ fontSize: 12, color: '#999' }}>{filtered.length} 个事件</span>}>
      <DataToolbar
        buttons={<></>}
        filters={
          <div className="ha-filter-group">
            <select className="pagination-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="all">全部类型</option>
              {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select className="pagination-select" value={sessionFilter} onChange={e => setSessionFilter(e.target.value)}>
              <option value="all">全部 Session</option>
              {uniqueSessionIds.map(sid => <option key={sid} value={sid}>{sid}</option>)}
            </select>
          </div>
        }
      >
        <div className="search-input">
          <span className="search-icon">🔍</span>
          <input placeholder="搜索事件内容" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </DataToolbar>

      <div className="mac-timeline">
        {filtered.length === 0 ? (
          <div className="mac-empty-inline" style={{ padding: 40 }}>没有匹配的事件</div>
        ) : filtered.slice(0, 50).map(evt => {
          const icon = EVENT_TYPE_ICONS[evt.type] || '⚡'
          const isExpanded = expandedEvent === evt.id
          return (
            <div key={evt.id} className="mac-timeline-item">
              <div className="mac-timeline-marker">
                <div className="mac-timeline-dot">{icon}</div>
              </div>
              <div className="mac-timeline-content">
                <div className="mac-timeline-header" onClick={() => setExpandedEvent(isExpanded ? null : evt.id)}>
                  <span className="mac-timeline-type">{EVENT_TYPE_LABELS[evt.type] || evt.type}</span>
                  <span className="mac-timeline-session" onClick={e => { e.stopPropagation(); navigate(`/managed-agent/sessions/${evt.sessionId}`) }}>
                    {evt.sessionAgentName} / {evt.sessionId}
                  </span>
                  <span className="mac-timeline-time">{evt.timestamp}</span>
                </div>
                <div className="mac-timeline-summary">
                  {evt.type === 'user.message' && evt.payload.content?.slice(0, 80)}
                  {evt.type === 'agent.message' && evt.payload.content?.slice(0, 80)}
                  {evt.type === 'tool_use' && `${evt.payload.tool}(${Object.keys(evt.payload.args || {}).join(', ')})`}
                  {evt.type === 'tool_result' && (evt.payload.error ? `Error: ${evt.payload.error}` : evt.payload.result?.toString?.()?.slice(0, 80))}
                  {evt.type === 'status' && `${evt.payload.status}: ${evt.payload.reason || ''}`}
                </div>
                {isExpanded && (
                  <pre className="mac-json-viewer" style={{ marginTop: 8 }}>{JSON.stringify(evt.payload, null, 2)}</pre>
                )}
              </div>
            </div>
          )
        })}
        {filtered.length > 50 && <div className="mac-timeline-more">显示前 50 条，共 {filtered.length} 条</div>}
      </div>
    </PageLayout>
  )
}
