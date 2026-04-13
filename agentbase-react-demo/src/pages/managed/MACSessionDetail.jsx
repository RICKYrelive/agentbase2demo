import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useManagedAgents, SESSION_STATUS_COLORS, EVENT_TYPE_ICONS } from '../../store/managedAgentStore'
import './MAC.css'

export default function MACSessionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { sessions, dispatch } = useManagedAgents()
  const [inputMsg, setInputMsg] = useState('')
  const [activeThread, setActiveThread] = useState(null)
  const [showDrawer, setShowDrawer] = useState(null)
  const [toast, setToast] = useState(null)
  const [showWorkspace, setShowWorkspace] = useState(false)
  const [toolFilter, setToolFilter] = useState('all')
  const eventsEndRef = useRef(null)

  const session = sessions.find(s => s.id === id)
  if (!session) return <div className="mac-not-found">Session 未找到</div>

  const sc = SESSION_STATUS_COLORS[session.status] || SESSION_STATUS_COLORS.created
  const threads = session.threads || []
  const currentThread = activeThread || threads[0]?.id
  const events = (session.events || []).filter(e => {
    if (e.threadId !== currentThread) return false
    if (toolFilter === 'tools') return ['tool_use', 'tool_result'].includes(e.type)
    if (toolFilter === 'messages') return ['user.message', 'agent.message'].includes(e.type)
    return true
  })

  // Auto-scroll to bottom when events change
  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [events.length])

  // Workspace mock files
  const workspaceFiles = [
    { name: 'workspace/', type: 'folder' },
    { name: '  data/', type: 'folder' },
    { name: '    input.csv', type: 'file', size: '2.4KB' },
    { name: '    config.json', type: 'file', size: '0.8KB' },
    { name: '  output/', type: 'folder' },
    { name: '    result.md', type: 'file', size: '4.1KB' },
    { name: '  main.py', type: 'file', size: '1.2KB' },
    { name: '  requirements.txt', type: 'file', size: '0.3KB' },
  ]

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const handleSend = () => {
    if (!inputMsg.trim()) return
    dispatch({
      type: 'UPDATE_SESSION', id: session.id, payload: {
        events: [...(session.events || []), {
          id: `evt-user-${Date.now()}`,
          sessionId: session.id,
          threadId: currentThread,
          type: 'user.message',
          payload: { content: inputMsg },
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          metadata: {},
        }],
        lastEventAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      }
    })
    setInputMsg('')
  }

  const handleInterrupt = () => {
    dispatch({ type: 'UPDATE_SESSION', id: session.id, payload: { status: 'idle' } })
    showToast('已暂停 Session')
  }

  const handleStop = () => {
    dispatch({ type: 'UPDATE_SESSION', id: session.id, payload: { status: 'completed', endedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) } })
    showToast('Session 已终止')
  }

  const toolUseCount = (session.events || []).filter(e => e.type === 'tool_use').length
  const msgCount = (session.events || []).filter(e => ['user.message', 'agent.message'].includes(e.type)).length

  return (
    <div className="mac-console-page">
      {/* Top Status Bar */}
      <div className="mac-console-header">
        <div className="mac-console-header-left">
          <button className="back-btn" onClick={() => navigate('/managed-agent/sessions')}>←</button>
          <span className="mac-console-id">{session.id}</span>
          <span className="ha-status-tag" style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}>{sc.label}</span>
          <span className="mac-console-agent">
            <span className="ha-name-link" onClick={() => navigate(`/managed-agent/agents/${session.agentId}`)}>{session.agentName}</span>
            <span className="ha-version-badge">{session.agentVersion}</span>
          </span>
          <span className="mac-console-env">{session.environmentName}</span>
        </div>
        <div className="mac-console-header-right">
          <div className="mac-metric-pill">Msgs: {msgCount}</div>
          <div className="mac-metric-pill">Tools: {toolUseCount}</div>
          <div className="mac-metric-pill">Tokens: {session.tokenUsage?.total?.toLocaleString()}</div>
          <div className="mac-metric-pill">Cost: ${session.cost}</div>
          <div className="mac-metric-pill">Dur: {session.duration ? `${Math.floor(session.duration / 60)}m${session.duration % 60}s` : '-'}</div>
          <div className="mac-console-controls">
            {['running', 'waiting_approval'].includes(session.status) && (
              <button className="mac-ctrl-btn warn" onClick={handleInterrupt}>⏸ Interrupt</button>
            )}
            {['running', 'idle', 'waiting_approval'].includes(session.status) && (
              <button className="mac-ctrl-btn danger" onClick={handleStop}>⏹ Stop</button>
            )}
            {session.status === 'failed' && (
              <button className="mac-ctrl-btn primary" onClick={() => showToast('重试功能开发中', 'info')}>↻ Retry</button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content: Thread sidebar + Event stream + Drawer */}
      <div className="mac-console-body">
        {/* Thread Sidebar */}
        <div className="mac-console-threads">
          <div className="mac-thread-header">Threads ({threads.length})</div>
          {threads.map(t => (
            <div key={t.id} className={`mac-thread-item ${t.id === currentThread ? 'active' : ''}`} onClick={() => setActiveThread(t.id)}>
              <span className="mac-thread-dot" style={{ background: t.status === 'active' ? '#52c41a' : '#999' }} />
              <span className="mac-thread-title">{t.title}</span>
            </div>
          ))}
          <div style={{ padding: '12px 14px', borderTop: '1px solid var(--card-border)' }}>
            <div style={{ fontSize: 11, color: '#999', marginBottom: 8 }}>SESSION INFO</div>
            <div className="mac-kv-list" style={{ fontSize: 11 }}>
              <div className="mac-kv-row"><span style={{ color: '#999' }}>Agent</span><span>{session.agentName}</span></div>
              <div className="mac-kv-row"><span style={{ color: '#999' }}>Version</span><span>{session.agentVersion}</span></div>
              <div className="mac-kv-row"><span style={{ color: '#999' }}>Env</span><span>{session.environmentName}</span></div>
              <div className="mac-kv-row"><span style={{ color: '#999' }}>Started</span><span>{session.startedAt?.slice(5, 16)}</span></div>
              <div className="mac-kv-row"><span style={{ color: '#999' }}>Created by</span><span>{session.createdBy}</span></div>
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: '#999', marginBottom: 6 }}>TAGS</div>
              <div className="mac-tag-list">
                {(session.tags || []).map(t => <span key={t} className="ha-mini-tag">{t}</span>)}
              </div>
            </div>
          </div>
        </div>

        {/* Event Stream */}
        <div className="mac-console-stream">
          {/* Event Filter Bar */}
          <div className="mac-event-filter-bar">
            <button className={`mac-filter-btn ${toolFilter === 'all' ? 'active' : ''}`} onClick={() => setToolFilter('all')}>All ({(session.events || []).filter(e => e.threadId === currentThread).length})</button>
            <button className={`mac-filter-btn ${toolFilter === 'messages' ? 'active' : ''}`} onClick={() => setToolFilter('messages')}>Messages ({msgCount})</button>
            <button className={`mac-filter-btn ${toolFilter === 'tools' ? 'active' : ''}`} onClick={() => setToolFilter('tools')}>Tools ({toolUseCount})</button>
            <div style={{ flex: 1 }} />
            <button className={`mac-filter-btn ${showWorkspace ? 'active' : ''}`} onClick={() => setShowWorkspace(!showWorkspace)}>📁 Workspace</button>
          </div>

          <div className="mac-stream-events">
            {events.length === 0 ? (
              <div className="mac-stream-empty">
                <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                等待事件... 发送消息开始对话
              </div>
            ) : events.map(evt => {
              const icon = EVENT_TYPE_ICONS[evt.type] || '⚡'
              const isUser = evt.type === 'user.message'
              const isToolUse = evt.type === 'tool_use'
              const isToolResult = evt.type === 'tool_result'
              const isApproval = isToolUse && evt.payload.status === 'waiting_approval'

              return (
                <div key={evt.id} className={`mac-event ${isUser ? 'mac-event-user' : 'mac-event-agent'} ${isApproval ? 'mac-event-approval' : ''}`}>
                  <div className="mac-event-icon">{icon}</div>
                  <div className="mac-event-body">
                    <div className="mac-event-header">
                      <span className="mac-event-type">
                        {{ 'user.message': 'You', 'agent.message': 'Agent', 'tool_use': 'Tool', 'tool_result': 'Result', 'status': 'Status' }[evt.type]}
                      </span>
                      <span className="mac-event-time">{evt.timestamp?.slice(11, 19)}</span>
                    </div>

                    {isUser && <div className="mac-event-content mac-user-msg">{evt.payload.content}</div>}

                    {evt.type === 'agent.message' && (
                      <div className="mac-event-content mac-agent-msg">{evt.payload.content}</div>
                    )}

                    {isToolUse && (
                      <div className="mac-tool-card-console">
                        <div className="mac-tool-header">
                          <span className="mac-tool-name">🔧 {evt.payload.tool}</span>
                          <span className={`mac-tool-status ${evt.payload.status}`}>
                            {evt.payload.status === 'running' ? '⏳ 运行中' : evt.payload.status === 'waiting_approval' ? '🔒 等待审批' : '✓ 完成'}
                          </span>
                        </div>
                        <div className="mac-tool-args">
                          <pre>{JSON.stringify(evt.payload.args, null, 2)}</pre>
                        </div>
                        {isApproval && (
                          <div className="mac-approval-actions">
                            <button className="action-btn primary" style={{ fontSize: 12 }} onClick={() => showToast('已批准', 'success')}>Approve</button>
                            <button className="action-btn" style={{ fontSize: 12, color: '#ff4d4f' }} onClick={() => showToast('已拒绝', 'info')}>Reject</button>
                          </div>
                        )}
                      </div>
                    )}

                    {isToolResult && (
                      <div className={`mac-tool-result ${evt.payload.error ? 'error' : ''}`}>
                        {evt.payload.error ? (
                          <span>❌ {evt.payload.error}</span>
                        ) : (
                          <span>{typeof evt.payload.result === 'string' ? evt.payload.result : JSON.stringify(evt.payload.result)}</span>
                        )}
                        {evt.payload.duration && <span className="mac-tool-duration">{evt.payload.duration}ms</span>}
                      </div>
                    )}

                    {evt.type === 'status' && (
                      <div className={`mac-status-event ${evt.payload.status}`}>{evt.payload.status}: {evt.payload.reason || ''}</div>
                    )}
                  </div>
                  <button className="mac-event-detail-btn" onClick={() => setShowDrawer(evt)} title="查看详情">…</button>
                </div>
              )
            })}
            <div ref={eventsEndRef} />
          </div>

          {/* Input Area */}
          <div className="mac-console-input">
            {session.status === 'waiting_approval' && (
              <div className="mac-approval-banner">
                ⚠️ 有工具调用等待审批。请批准或拒绝以继续。
              </div>
            )}
            <div className="mac-input-row">
              <textarea
                className="mac-input-textarea"
                value={inputMsg}
                onChange={e => setInputMsg(e.target.value)}
                placeholder={session.status === 'completed' || session.status === 'failed' ? '会话已结束' : '输入消息... (Enter 发送, Shift+Enter 换行)'}
                disabled={session.status === 'completed' || session.status === 'failed'}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                rows={1}
              />
              <button className="mac-send-btn" onClick={handleSend} disabled={!inputMsg.trim() || session.status === 'completed' || session.status === 'failed'}>
                ➤
              </button>
            </div>
          </div>
        </div>

        {/* Workspace Panel (toggleable) */}
        {showWorkspace && (
          <div className="mac-console-workspace">
            <div className="mac-drawer-header">
              <span>📁 工作区文件</span>
              <button onClick={() => setShowWorkspace(false)}>✕</button>
            </div>
            <div className="mac-workspace-content">
              {workspaceFiles.map((f, i) => (
                <div key={i} className={`mac-ws-file ${f.type === 'folder' ? 'mac-ws-folder' : ''}`}>
                  <span>{f.type === 'folder' ? '📂' : '📄'}</span>
                  <span className="mac-ws-name">{f.name.trim()}</span>
                  {f.size && <span className="mac-ws-size">{f.size}</span>}
                </div>
              ))}
            </div>
            {/* Artifacts */}
            {(session.artifacts || []).length > 0 && (
              <div style={{ padding: '0 12px 12px' }}>
                <div style={{ fontSize: 11, color: '#999', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' }}>Artifacts</div>
                {session.artifacts.map(a => (
                  <div key={a.id} className="mac-ws-file">
                    <span>📎</span>
                    <span className="mac-ws-name">{a.name}</span>
                    <span className="mac-ws-size">{a.size}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Right Drawer */}
        {showDrawer && (
          <div className="mac-console-drawer">
            <div className="mac-drawer-header">
              <span>事件详情</span>
              <button onClick={() => setShowDrawer(null)}>✕</button>
            </div>
            <div className="mac-drawer-content">
              <div className="mac-kv-list">
                <div className="mac-kv-row"><span className="mac-kv-key">Event ID</span><span style={{ fontFamily: 'monospace', fontSize: 11 }}>{showDrawer.id}</span></div>
                <div className="mac-kv-row"><span className="mac-kv-key">Type</span><span>{showDrawer.type}</span></div>
                <div className="mac-kv-row"><span className="mac-kv-key">Thread</span><span>{showDrawer.threadId}</span></div>
                <div className="mac-kv-row"><span className="mac-kv-key">Time</span><span>{showDrawer.timestamp}</span></div>
              </div>
              <h4 style={{ marginTop: 16, fontSize: 12, textTransform: 'uppercase', color: '#999', letterSpacing: 0.5 }}>Payload</h4>
              <pre className="mac-json-viewer">{JSON.stringify(showDrawer.payload, null, 2)}</pre>
              {Object.keys(showDrawer.metadata || {}).length > 0 && (
                <>
                  <h4 style={{ marginTop: 16, fontSize: 12, textTransform: 'uppercase', color: '#999', letterSpacing: 0.5 }}>Metadata</h4>
                  <pre className="mac-json-viewer">{JSON.stringify(showDrawer.metadata, null, 2)}</pre>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Artifacts Bar */}
      {!showWorkspace && (session.artifacts || []).length > 0 && (
        <div className="mac-console-artifacts">
          <span className="mac-artifacts-label">Artifacts:</span>
          {session.artifacts.map(a => (
            <span key={a.id} className="mac-artifact-chip">{a.name} ({a.size})</span>
          ))}
        </div>
      )}

      {toast && <div className={`ha-toast ha-toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}
