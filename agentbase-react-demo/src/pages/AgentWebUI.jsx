import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useHarnessAgents } from '../store/harnessAgentStore.jsx'
import './AgentWebUI.css'

export default function AgentWebUI() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { agents, dispatch } = useHarnessAgents()
  const agent = agents.find(a => a.id === id)

  const [activeConv, setActiveConv] = useState(null)
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [fileNames, setFileNames] = useState([])
  const chatEndRef = useRef(null)
  const fileInputRef = useRef(null)

  // Initialize with first conversation
  useEffect(() => {
    if (agent && agent.conversations?.length > 0 && !activeConv) {
      setActiveConv(agent.conversations[0].id)
    }
  }, [agent])

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConv, agent?.conversations])

  if (!agent) {
    return (
      <div className="webui-not-found">
        <div>Agent 不存在</div>
        <button className="action-btn primary" onClick={() => navigate('/harness-agent')}>返回列表</button>
      </div>
    )
  }

  const conversations = agent.conversations || []
  const currentConv = conversations.find(c => c.id === activeConv)

  const createConversation = () => {
    const newConv = {
      id: `conv-${Date.now()}`,
      title: '新任务',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      messages: [],
    }
    dispatch({ type: 'ADD_CONVERSATION', id: agent.id, conversation: newConv })
    setActiveConv(newConv.id)
  }

  const sendMessage = () => {
    if (!inputText.trim() && fileNames.length === 0) return
    if (!activeConv) {
      // Create new conversation first
      const newConv = {
        id: `conv-${Date.now()}`,
        title: inputText.trim().slice(0, 20) || '新任务',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        messages: [],
      }
      dispatch({ type: 'ADD_CONVERSATION', id: agent.id, conversation: newConv })
      setActiveConv(newConv.id)
      // Send in next tick
      setTimeout(() => doSend(newConv.id), 50)
      return
    }
    doSend(activeConv)
  }

  const doSend = (convId) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
    let content = inputText.trim()
    if (fileNames.length > 0) {
      content += `\n📎 附件: ${fileNames.join(', ')}`
    }

    // Add user message
    dispatch({
      type: 'ADD_MESSAGE',
      agentId: agent.id,
      convId,
      message: { role: 'user', content, time: now },
    })
    setInputText('')
    setFileNames([])
    setIsTyping(true)

    // Simulate tool calls + response
    setTimeout(() => {
      const skillsUsed = agent.skills.slice(0, Math.min(2, agent.skills.length))
      const toolLog = skillsUsed.map(s => `🔧 调用 ${s} … 执行完成`).join('\n')
      if (toolLog) {
        dispatch({
          type: 'ADD_MESSAGE',
          agentId: agent.id,
          convId,
          message: { role: 'tool', content: toolLog, time: now },
        })
      }

      setTimeout(() => {
        const responses = [
          `根据您的请求，我已完成分析。以下是处理结果：\n\n1. 已从数据源获取相关信息\n2. 完成内容整理与摘要\n3. 结果已保存至工作区\n\n如需进一步处理，请告诉我。`,
          `任务已完成 ✅\n\n### 处理摘要\n- 输入分析完毕\n- 调用了 ${skillsUsed.join('、')} 等能力\n- 耗时约 ${Math.floor(Math.random() * 20 + 5)} 秒\n\n是否需要对结果进行调整？`,
          `我已经处理了您的请求。\n\n**关键发现：**\n- 检测到 ${Math.floor(Math.random() * 10 + 3)} 个相关条目\n- 数据质量评分: ${(Math.random() * 20 + 80).toFixed(1)}%\n- 已生成结构化输出\n\n请查看工作区中的输出文件。`,
        ]
        dispatch({
          type: 'ADD_MESSAGE',
          agentId: agent.id,
          convId,
          message: { role: 'assistant', content: responses[Math.floor(Math.random() * responses.length)], time: now },
        })
        setIsTyping(false)
      }, 1200)
    }, 800)
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setFileNames(prev => [...prev, ...files.map(f => f.name)])
    e.target.value = ''
  }

  const removeFile = (name) => {
    setFileNames(prev => prev.filter(f => f !== name))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Render file tree recursively
  const renderFileTree = (items, depth = 0) => {
    return items.map((item, i) => (
      <div key={i}>
        <div className="webui-file-item" style={{ paddingLeft: depth * 16 + 12 }}>
          <span className="webui-file-icon">{item.type === 'folder' ? (depth < 2 ? '📂' : '📁') : '📄'}</span>
          <span className="webui-file-name">{item.name}</span>
          {item.size && <span className="webui-file-size">{item.size}</span>}
        </div>
        {item.children && renderFileTree(item.children, depth + 1)}
      </div>
    ))
  }

  return (
    <div className="webui-page">
      {/* ========== LEFT: Conversation List ========== */}
      <div className="webui-sidebar">
        <div className="webui-sidebar-header">
          <button className="webui-back-btn" onClick={() => navigate(`/harness-agent/${agent.id}`)}>← 返回</button>
          <div className="webui-agent-name">{agent.name}</div>
        </div>
        
        <div className="webui-sidebar-menu">
          <div className="webui-menu-item active">💬 会话列表</div>
          <div className="webui-menu-item" onClick={() => alert('暂未开放')}>🔧 技能配置</div>
          <div className="webui-menu-item" onClick={() => alert('暂未开放')}>⏱️ 定时任务</div>
        </div>
        
        <div className="webui-menu-divider" />
        
        <button className="webui-new-task" onClick={createConversation}>+ 新任务</button>
        <div className="webui-conv-list">
          {conversations.map(conv => (
            <div
              key={conv.id}
              className={`webui-conv-item ${activeConv === conv.id ? 'active' : ''}`}
              onClick={() => setActiveConv(conv.id)}
            >
              <div className="webui-conv-title">{conv.title}</div>
              <div className="webui-conv-time">{conv.createdAt?.slice(5, 16)}</div>
            </div>
          ))}
          {conversations.length === 0 && (
            <div className="webui-conv-empty">暂无会话，点击上方按钮创建</div>
          )}
        </div>
      </div>

      {/* ========== CENTER: Chat Window ========== */}
      <div className="webui-chat">
        <div className="webui-chat-header">
          <span className="webui-chat-title">{currentConv ? currentConv.title : '选择或创建一个会话'}</span>
          <span className="webui-model-badge">{agent.model}</span>
        </div>

        <div className="webui-messages">
          {!currentConv ? (
            <div className="webui-welcome">
              <div className="webui-welcome-icon">🤖</div>
              <div className="webui-welcome-title">欢迎使用 {agent.name}</div>
              <div className="webui-welcome-desc">{agent.description}</div>
              <button className="action-btn primary" onClick={createConversation}>开始新对话</button>
            </div>
          ) : currentConv.messages.length === 0 ? (
            <div className="webui-welcome">
              <div className="webui-welcome-icon">💬</div>
              <div className="webui-welcome-title">开始对话</div>
              <div className="webui-welcome-desc">输入你的需求，Agent 将为你处理</div>
            </div>
          ) : (
            currentConv.messages.map((msg, i) => (
              <div key={i} className={`webui-msg webui-msg-${msg.role}`}>
                {msg.role === 'user' && (
                  <div className="webui-msg-row webui-msg-user-row">
                    <div className="webui-msg-bubble webui-msg-user-bubble">{msg.content}</div>
                    <div className="webui-msg-avatar webui-avatar-user">U</div>
                  </div>
                )}
                {msg.role === 'tool' && (
                  <div className="webui-msg-row webui-msg-tool-row">
                    <div className="webui-msg-avatar webui-avatar-tool">⚙</div>
                    <div className="webui-tool-log">
                      <div className="webui-tool-header">工具执行过程</div>
                      <pre>{msg.content}</pre>
                    </div>
                  </div>
                )}
                {msg.role === 'assistant' && (
                  <div className="webui-msg-row webui-msg-assistant-row">
                    <div className="webui-msg-avatar webui-avatar-agent">🤖</div>
                    <div className="webui-msg-bubble webui-msg-agent-bubble">
                      {msg.content.split('\n').map((line, li) => (
                        <span key={li}>{line}<br/></span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          {isTyping && (
            <div className="webui-msg webui-msg-assistant">
              <div className="webui-msg-row webui-msg-assistant-row">
                <div className="webui-msg-avatar webui-avatar-agent">🤖</div>
                <div className="webui-typing">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <div className="webui-input-area">
          {fileNames.length > 0 && (
            <div className="webui-attached-files">
              {fileNames.map(f => (
                <span key={f} className="webui-attached-file">📎 {f} <span className="webui-file-remove" onClick={() => removeFile(f)}>×</span></span>
              ))}
            </div>
          )}
          <div className="webui-input-row">
            <button className="webui-attach-btn" onClick={() => fileInputRef.current?.click()} title="上传文件">+</button>
            <input type="file" ref={fileInputRef} style={{display:'none'}} multiple onChange={handleFileSelect} />
            <textarea
              className="webui-textarea"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="请输入你的需求"
              rows={1}
            />
            <button className="webui-send-btn" onClick={sendMessage} disabled={!inputText.trim() && fileNames.length === 0}>↑</button>
          </div>
        </div>
      </div>

      {/* ========== RIGHT: Workspace Files ========== */}
      <div className="webui-workspace">
        <div className="webui-workspace-header">
          <span>工作区文件</span>
        </div>
        <div className="webui-file-tree">
          {(agent.workspace?.files || []).length > 0 ? (
            renderFileTree(agent.workspace.files)
          ) : (
            <div className="webui-file-empty">暂无文件</div>
          )}
        </div>
      </div>
    </div>
  )
}
