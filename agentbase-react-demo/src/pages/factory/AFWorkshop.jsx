import React, { useState, useEffect, useRef } from 'react'
import PageLayout from '../../components/PageLayout'
import { 
  IconPaperclip, IconSend, IconDatabase, IconTerminal, 
  IconEdit, IconSearch, IconFile, IconImage, IconBarChart, 
  IconChevronRight, IconChevronDown, IconArrowLeft, IconArrowUp, IconCheck, IconX,
  IconBot, IconFolder, IconFileText, IconCopy, IconCheckCircle, IconPlay,
  IconAlertTriangle, IconActivity, IconGithub, IconGlobe, IconLock, IconPlus, IconMessageSquare
} from '../../components/Icons'
import './AFWorkshop.css'
import ShapeGrid from '../../components/effects/ShapeGrid'

const MOCK_TEMPLATES = {
  'Agent蓝图': [
    { 
      id: 'at1', name: 'Blank agent config', icon: <IconFileText />, desc: 'A blank starting point with the core toolset.',
      envTemplate: 'default',
      tags: ['Core'],
      tools: ['bash', 'web_fetch'],
      yaml: "name: blank-agent\ndescription: A blank starting point with the core toolset.\nsystem_prompt: |\n  You are a helpful assistant. Use your tools to solve problems.\ntools:\n  - bash\n  - web_fetch"
    },
    { 
      id: 'at2', name: 'Data analyst', icon: <IconBarChart />, desc: 'Load, explore, and visualize data; build reports and answer questions from datasets.',
      envTemplate: 'data-analyst',
      tags: ['Data', 'Python'],
      tools: ['bash', 'web_fetch', 'python'],
      yaml: "name: data-analyst\ndescription: Load, explore, and visualize data.\nsystem_prompt: |\n  You are an expert data analyst. You write Python code to load datasets, \n  clean data, perform statistical analysis, and generate charts using matplotlib.\ntools:\n  - bash\n  - web_fetch\n  - python"
    },
    { 
      id: 'at3', name: 'Deep researcher', icon: <IconSearch />, desc: 'Conducts multi-step web research with source synthesis and citations.',
      envTemplate: 'researcher',
      tags: ['Web', 'Research'],
      tools: ['web_fetch', 'search'],
      yaml: "name: deep-researcher\ndescription: Conducts multi-step web research with source synthesis and citations.\nsystem_prompt: |\n  You are a meticulous researcher. You conduct comprehensive web searches, \n  synthesize information from multiple sources, and always provide citations.\ntools:\n  - web_fetch\n  - search"
    },
    { 
      id: 'at4', name: 'Software Developer', icon: <IconTerminal />, desc: 'Full-stack software developer capable of writing, reviewing, and testing code.',
      envTemplate: 'developer',
      tags: ['Code', 'Development'],
      tools: ['bash', 'github'],
      yaml: "name: software-developer\ndescription: Assists with software development tasks.\nsystem_prompt: |\n  You are an experienced full-stack developer. You write clean, testable code,\n  perform code reviews, and can execute bash commands to run tests.\ntools:\n  - bash\n  - github"
    },
    { 
      id: 'at5', name: 'Incident commander', icon: <IconAlertTriangle />, desc: 'Triages alerts, opens incident tickets, and runs the war room.',
      envTemplate: 'ops',
      tags: ['DevOps', 'SRE'],
      tools: ['pagerduty', 'slack', 'jira'],
      yaml: "name: incident-commander\ndescription: Triages alerts and manages incidents.\nsystem_prompt: |\n  You are an incident commander. You investigate alerts, coordinate communication\n  in Slack, and ensure tickets are tracked and updated.\ntools:\n  - pagerduty\n  - slack\n  - jira"
    },
    { 
      id: 'at6', name: 'Support-to-eng escalator', icon: <IconMessageSquare />, desc: 'Reads customer conversations, reproduces bugs, and files Jira issues.',
      envTemplate: 'support',
      tags: ['Support', 'Engineering'],
      tools: ['intercom', 'jira', 'github'],
      yaml: "name: support-escalator\ndescription: Escalates support tickets to engineering.\nsystem_prompt: |\n  You read customer support conversations, identify reproducible bugs,\n  and create detailed engineering tickets with reproduction steps.\ntools:\n  - intercom\n  - jira\n  - github"
    },
    { 
      id: 'at7', name: 'Structured extractor', icon: <IconDatabase />, desc: 'Parses unstructured text into a typed JSON schema.',
      envTemplate: 'default',
      tags: ['Data', 'Parsing'],
      tools: ['json_schema'],
      yaml: "name: structured-extractor\ndescription: Extracts structured JSON from unstructured text.\nsystem_prompt: |\n  You parse large blocks of unstructured text and extract entities matching\n  the provided JSON schema exactly.\ntools:\n  - json_schema"
    },
    { 
      id: 'at8', name: 'Feedback miner', icon: <IconEdit />, desc: 'Clusters raw feedback from Slack and Notion into themes and drafts Asana tasks.',
      envTemplate: 'product',
      tags: ['Product', 'Analysis'],
      tools: ['slack', 'notion', 'asana'],
      yaml: "name: feedback-miner\ndescription: Clusters user feedback into actionable themes.\nsystem_prompt: |\n  You are a product manager analyzing user feedback. You cluster feedback into\n  themes and create actionable tasks for the engineering team.\ntools:\n  - slack\n  - notion\n  - asana"
    },
    { 
      id: 'at9', name: 'Field monitor', icon: <IconGlobe />, desc: 'Scans software blogs for a topic and writes a weekly what-changed brief.',
      envTemplate: 'researcher',
      tags: ['News', 'Monitoring'],
      tools: ['web_fetch', 'rss'],
      yaml: "name: field-monitor\ndescription: Monitors industry blogs and writes summaries.\nsystem_prompt: |\n  You monitor specified industry blogs and RSS feeds. You compile a weekly\n  brief summarizing the most important changes and announcements.\ntools:\n  - web_fetch\n  - rss"
    },
    { 
      id: 'at10', name: 'Sprint retro facilitator', icon: <IconActivity />, desc: 'Pulls a closed sprint from Linear, synthesizes themes, and writes the retro doc.',
      envTemplate: 'agile',
      tags: ['Agile', 'Docs'],
      tools: ['linear', 'notion'],
      yaml: "name: sprint-retro\ndescription: Facilitates sprint retrospectives.\nsystem_prompt: |\n  You analyze completed sprints in Linear, identifying bottlenecks and successes.\n  You generate a comprehensive retrospective document.\ntools:\n  - linear\n  - notion"
    }
  ],
  Skill: [
    { id: 'st1', name: '网页抓取器', icon: <IconSearch />, desc: '解析网页 HTML 并提取关键信息' },
    { id: 'st2', name: 'PDF 转换工具', icon: <IconFile />, desc: '将各种文档格式转换为 PDF' },
    { id: 'st3', name: '图片处理脚本', icon: <IconImage />, desc: '自动调整图片大小与水印' },
  ]
}

const MOCK_TASKS = [
  {
    id: 't_001',
    name: '竞品研究技能',
    desc: '成功创建了竞品研究技能。包含完整的竞品分析工具包...',
    createdAt: '2026-04-12 22:02:35',
    expiryAt: '2026-04-13 22:02:35',
    status: 'completed',
    type: 'Skill',
    icon: <IconBarChart />
  },
  {
    id: 't_002',
    name: '代码审查 Agent',
    desc: '用于自动化审查 PR 并在 GitHub 留言报告',
    createdAt: '2026-04-12 10:15:00',
    expiryAt: '2026-04-13 10:15:00',
    status: 'generating',
    type: 'Agent蓝图',
    icon: <IconSearch />,
    envTemplate: 'developer',
    tools: ['bash', 'github'],
    yaml: "name: 代码审查 Agent\ndescription: 用于自动化审查 PR 并在 GitHub 留言报告\nsystem_prompt: |\n  You are an experienced code reviewer...\ntools:\n  - bash\n  - github"
  }
]

export default function AFWorkshop() {
  const [view, setView] = useState('home') // 'home' | 'wizard' | 'workspace'
  const [wizardStep, setWizardStep] = useState(1)
  const [activeTab, setActiveTab] = useState('Agent蓝图')
  const [prompt, setPrompt] = useState('')
  const [selectedTask, setSelectedTask] = useState(null)
  
  // Template Preview Modal
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [previewMode, setPreviewMode] = useState('template') // 'template' | 'task'
  const [editedYaml, setEditedYaml] = useState('')

  // Wizard state
  const [agentConfig, setAgentConfig] = useState({
    name: '',
    description: '',
    systemPrompt: '',
    tools: ['bash', 'web_fetch']
  })

  // Meta Agent Chat State (for Step 1)
  const [metaSession, setMetaSession] = useState({
    input: '',
    messages: []
  })

  // Test Run State (for Step 2)
  const [testSession, setTestSession] = useState({
    input: '',
    messages: [],
    events: []
  })
  
  // Workspace specific states (for Skill)
  const [activeFile, setActiveFile] = useState('SKILL.md')

  const handleTaskClick = (task) => {
    setSelectedTask(task)
    if (task.type === 'Agent蓝图') {
      setView('wizard')
      setWizardStep(1)
    } else {
      setView('workspace')
    }
  }

  const openBlueprintDetail = (task) => {
    setPreviewMode('task')
    setPreviewTemplate(task)
    setEditedYaml(task.yaml || '')
  }

  const openTemplatePreview = (tpl) => {
    setPreviewMode('template')
    setPreviewTemplate(tpl)
    setEditedYaml(tpl.yaml || '')
  }

  const startWizardFromTemplate = () => {
    const sysPromptMatch = editedYaml.match(/system_prompt:\s*\|([\s\S]*?)(?=\ntools:|$)/);
    setAgentConfig({
      name: previewTemplate.name,
      description: previewTemplate.desc,
      systemPrompt: sysPromptMatch ? sysPromptMatch[1].trim() : '',
      tools: previewTemplate.tools || ['bash', 'web_fetch']
    })
    
    setMetaSession({
      input: '',
      messages: [
        { role: 'agent', content: "你选择了【" + previewTemplate.name + "】模板。我已为你预填好右侧的参数配置。你可以直接在右侧手动调整，或者在这里告诉我你还有哪些改动需求，我会帮你自动化润色。" }
      ]
    })
    
    setPreviewTemplate(null)
    setWizardStep(1)
    setView('wizard')
  }
  
  const startWizardEmpty = () => {
    setAgentConfig({
      name: '自定义 Agent蓝图', description: '', systemPrompt: '', tools: ['bash']
    })
    
    const initialMessages = [{
      role: 'agent',
      content: prompt ? "我收到你的需求了：“" + prompt + "”。我帮你先初始化了一个草稿配置，让我们开始细化这个 Agent 吧！告诉我在专业领域它需要负责什么核心任务？" : "你好！我是你的造物助手 Meta-Agent。你想打造一款什么样的 Agent？告诉我它的用途，我会帮你一步步生成右侧所有的核心配置。"
    }]
    
    if (prompt) {
      initialMessages.unshift({ role: 'user', content: prompt })
    }
    
    setMetaSession({ input: '', messages: initialMessages })
    setPrompt('')
    setWizardStep(1)
    setView('wizard')
  }

  const sendMetaMessage = () => {
    if (!metaSession.input.trim()) return
    const txt = metaSession.input
    setMetaSession(prev => ({
      ...prev,
      messages: [...prev.messages, { role: 'user', content: txt }],
      input: ''
    }))
    
    setTimeout(() => {
      setMetaSession(prev => ({
        ...prev,
        messages: [...prev.messages, { role: 'agent', content: "好的，我已经根据你的描述优化了 System Prompt 并帮你预设了所需的新工具，请查看右侧的变更。" }]
      }))
    }, 1000)
  }

  const runTestMessage = () => {
    if (!testSession.input.trim()) return
    const txt = testSession.input
    setTestSession(prev => ({
      ...prev,
      messages: [...prev.messages, { role: 'user', content: txt }],
      input: '',
      events: [...prev.events, { type: 'user', text: "User request: " + txt, time: new Date().toLocaleTimeString() }]
    }))

    // Simulate Agent Processing
    setTimeout(() => {
      setTestSession(prev => ({
        ...prev,
        events: [...prev.events, { type: 'tool', text: "Tool bash called. 14 tokens / 120ms", time: new Date().toLocaleTimeString() }]
      }))
    }, 800)

    setTimeout(() => {
      setTestSession(prev => ({
        ...prev,
        messages: [...prev.messages, { role: 'agent', content: '我已经为你执行对应的工具提取了结果并完成分析。' }],
        events: [...prev.events, { type: 'agent', text: "Response generated. 45 tokens / 450ms", time: new Date().toLocaleTimeString() }]
      }))
    }, 1500)
  }

  // --- RENDERING HELPERS ---

  const renderHome = () => (
    <div className="af-workshop-container">
      <div className="afw-bg-wrap">
        <ShapeGrid 
          speed={0.24}
          squareSize={38}
          direction="up"
          borderColor="#c5c6c8"
          hoverFillColor="#000000"
          hoverTrailAmount={5}
        />
      </div>

      <div className="af-workshop afw-home">
      <div className="afw-hero">
        <h1 className="afw-hero-title notion-h1" style={{ justifyContent: 'center', marginBottom: '24px' }}>
          Agent工坊
        </h1>
        <p className="afw-hero-subtitle notion-body-large" style={{ color: 'var(--notion-gray-500)', fontSize: 18, marginBottom: '48px' }}>
          你需要构建哪些能力？描述你构想的智能体或从模版开始。
        </p>

        <div className="afw-input-card" style={{ boxShadow: 'var(--notion-shadow-card)', border: 'var(--notion-border)' }}>
          <div className="afw-tabs notion-font">
            {['Agent蓝图', 'Skill'].map(t => (
              <button 
                key={t} 
                className={"afw-tab " + (activeTab === t ? 'active' : '')}
                onClick={() => setActiveTab(t)}
                style={{ fontSize: 15 }}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="afw-textarea-wrap">
            <textarea 
              className="afw-textarea notion-body" 
              placeholder={"请一句话描述你的 " + activeTab + " 需要做什么..."}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              style={{ fontSize: 16 }}
            />
          </div>
          <div className="afw-input-actions">
            <div className="afw-action-left">
              <button className="afw-upload-btn" title="上传附件">
                <IconPaperclip />
              </button>
            </div>
            <button 
              className="afw-send-btn action-btn primary" 
              disabled={!prompt.trim()} 
              onClick={startWizardEmpty}
              style={{ width: 44, height: 44, borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <IconArrowLeft style={{ transform: 'rotate(180deg)' }} />
            </button>
          </div>
        </div>
      </div>

      <div className="afw-templates-section">
        <h2 className="afw-section-title notion-card-title">浏览模版库</h2>
        <div className="afw-template-grid" style={{ gridTemplateColumns: activeTab === 'Agent蓝图' ? 'repeat(auto-fill, minmax(340px, 1fr))' : 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          {MOCK_TEMPLATES[activeTab].map(tpl => (
            <div 
              key={tpl.id} 
              className="afw-template-card" 
              onClick={() => activeTab === 'Agent蓝图' ? openTemplatePreview(tpl) : startWizardEmpty()} 
              style={{ border: 'var(--notion-border)', boxShadow: 'var(--notion-shadow-card)', borderRadius: 12, alignItems: 'flex-start' }}
            >
              <div className="afw-template-icon" style={{ background: 'var(--notion-bg-alt)' }}>{tpl.icon}</div>
              <div style={{ flex: 1 }}>
                <div className="afw-template-name notion-body-medium" style={{ marginBottom: 4 }}>{tpl.name}</div>
                <div className="notion-caption" style={{ color: 'var(--notion-gray-500)', lineHeight: '1.4' }}>{tpl.desc}</div>
                {tpl.tags && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    {tpl.tags.map(tag => (
                      <span key={tag} style={{ fontSize: 11, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, color: '#64748b' }}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <h2 className="afw-section-title notion-card-title" style={{ marginTop: 48 }}>我的任务 (Workspace Tasks)</h2>
      <div className="afw-tasks-section" style={{ background: 'rgba(255, 255, 255, 0.85)', border: '1px solid rgba(255, 255, 255, 0.9)', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', borderRadius: 12, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th width="180">名称</th>
              <th>描述</th>
              <th width="160">创建时间</th>
              <th width="220" style={{ textAlign: 'right' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_TASKS.filter(t => t.type === activeTab).map(task => (
              <tr key={task.id} style={{ cursor: 'pointer' }} onClick={() => task.type === 'Agent蓝图' ? openBlueprintDetail(task) : handleTaskClick(task)}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: 'var(--notion-blue)' }}>{task.icon}</span>
                    <span style={{ fontWeight: 600 }}>{task.name}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{task.desc}</td>
                <td>{task.createdAt}</td>
                <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                  {task.type === 'Agent蓝图' ? (
                     <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                       <button className="afw-text-btn primary" onClick={() => handleTaskClick(task)}>恢复</button>
                       <button className="afw-text-btn" onClick={() => {}}>续期</button>
                       <button className="afw-text-btn danger" onClick={() => {}}>删除</button>
                     </div>
                  ) : (
                     <button className="afw-text-btn primary" onClick={() => handleTaskClick(task)}>进入工作区</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <div className="afw-tpl-modal-overlay">
          <div className="afw-tpl-modal">
            <div className="afw-tpl-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="afw-template-icon" style={{ background: '#f1f5f9' }}>{previewTemplate.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{previewTemplate.name}</div>
              </div>
              <button className="afw-tpl-close" onClick={() => setPreviewTemplate(null)}><IconX /></button>
            </div>
            
            <div className="afw-tpl-modal-body">
              <div className="afw-tpl-info-pane">
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>环境模板 / Env Template</div>
                  <div style={{ fontSize: 14, fontWeight: 600, display: 'inline-block', background: '#f8fafc', padding: '4px 8px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                    {previewTemplate.envTemplate}
                  </div>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>详细描述 / Description</div>
                  <div style={{ fontSize: 14, lineHeight: 1.5, color: '#334155' }}>{previewTemplate.desc}</div>
                </div>
                <div>
                  <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>挂载工具 / Default Tools</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {previewTemplate.tools?.map(t => (
                      <span key={t} style={{ fontSize: 12, background: '#e0e7ff', color: '#4338ca', padding: '4px 8px', borderRadius: 4, fontWeight: 600 }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="afw-tpl-editor-pane">
                <textarea 
                  className="afw-yaml-editor"
                  value={editedYaml}
                  onChange={e => setEditedYaml(e.target.value)}
                  spellCheck={false}
                />
              </div>
            </div>
            
            <div className="afw-tpl-modal-footer">
              {previewMode === 'task' ? (
                <>
                  <button className="action-btn" onClick={() => setPreviewTemplate(null)}>取消</button>
                  <button className="action-btn primary" onClick={() => setPreviewTemplate(null)}>存为模板</button>
                </>
              ) : (
                <>
                  <button className="action-btn" onClick={() => { setPreviewTemplate(null); startWizardEmpty(); }}>不使用模版 (Start blank)</button>
                  <button className="action-btn primary" onClick={startWizardFromTemplate}>使用模版创建配置</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderWizard = () => (
    <div className="afw-wizard-v2">
      <div className="afw-wv2-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="afw-back-btn" onClick={() => setView('home')} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><IconArrowLeft size={20} /></button>
          <span style={{ fontSize: 16, fontWeight: 600 }}>配置 Agent 蓝图</span>
        </div>
        
        <div className="afw-stepper">
          {[
            { step: 1, label: '创排蓝图内容', path: 'Define & Setup' },
            { step: 2, label: '启动Session测试', path: 'Test Session' },
            { step: 3, label: '部署验证集成', path: 'Integrate API' }
          ].map(s => (
            <React.Fragment key={s.step}>
              <div className={"afw-step-item " + (wizardStep === s.step ? 'active' : '') + " " + (wizardStep > s.step ? 'completed' : '')}>
                <div className="afw-step-circle">{wizardStep > s.step ? <IconCheck size={12} /> : s.step}</div>
                <div className="afw-step-label">{s.label}</div>
              </div>
              {s.step < 3 && <div className="afw-step-line" />}
            </React.Fragment>
          ))}
        </div>
        
        <div className="afw-wv2-actions">
           {wizardStep < 3 && (
             <button className="action-btn primary" onClick={() => setWizardStep(wizardStep + 1)}>
               {wizardStep === 2 ? '结束Session' : '保存并启动Session'}
             </button>
           )}
           {wizardStep === 3 && (
             <button className="action-btn primary" onClick={() => setView('home')}>确认完成</button>
           )}
        </div>
      </div>

      <div className="afw-wv2-body" style={{ background: '#f1f5f9' }}>
        {wizardStep === 1 && (
          <>
            <div className="afw-wv2-left" style={{ width: '450px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #e2e8f0', background: '#fff', padding: 0 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#fafbfc' }}>
                 <div style={{ fontWeight: 600, fontSize: 14, color: '#334155' }}>Meta-Agent (辅助架构师)</div>
                 <div style={{ fontSize: 12, color: '#64748b' }}>用自然语言调优你的 Agent 蓝图</div>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {metaSession.messages.map((m, i) => (
                    <div key={i} style={{ 
                      alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                      background: m.role === 'user' ? '#e0e7ff' : '#f8fafc',
                      color: m.role === 'user' ? '#3730A3' : '#334155',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: m.role === 'agent' ? '1px solid #e2e8f0' : 'none',
                      maxWidth: '90%',
                      fontSize: '13px',
                      lineHeight: '1.5'
                    }}>
                      {m.content}
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', background: '#fff' }}>
                <div className="afw-chat-input-area">
                  <textarea 
                    value={metaSession.input}
                    onChange={e => setMetaSession({...metaSession, input: e.target.value})}
                    placeholder="向 Meta-Agent 提出修改需求..."
                    onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMetaMessage(); } }}
                    style={{ background: 'transparent' }}
                  />
                  <button onClick={sendMetaMessage} disabled={!metaSession.input.trim()} className="afw-send-circle"><IconArrowUp size={16}/></button>
                </div>
              </div>
            </div>
            
            <div className="afw-wv2-right" style={{ flex: 1, padding: '32px 48px', overflowY: 'auto' }}>
              <div className="afw-preview-pane" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '32px' }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, color: '#0f172a' }}>Agent 蓝图属性配置</h2>
                
                <div className="af-field">
                  <label className="af-field-label">应用名称 (Name)</label>
                  <input 
                    type="text" 
                    className="af-input-text" 
                    value={agentConfig.name}
                    onChange={e => setAgentConfig({...agentConfig, name: e.target.value})}
                  />
                </div>
                
                <div className="af-field">
                  <label className="af-field-label">功能详述 (Description)</label>
                  <input 
                    type="text" 
                    className="af-input-text" 
                    value={agentConfig.description}
                    onChange={e => setAgentConfig({...agentConfig, description: e.target.value})}
                  />
                </div>
                
                <div className="af-field">
                  <label className="af-field-label">系统设定指令 (System Prompt)</label>
                  <div className="af-field-hint">这里定义该 Agent 的性格、目标以及执行逻辑底座。</div>
                  <textarea 
                    className="af-input-textarea" 
                    value={agentConfig.systemPrompt}
                    onChange={e => setAgentConfig({...agentConfig, systemPrompt: e.target.value})}
                    style={{ height: 220, fontFamily: 'monospace', fontSize: 13 }}
                  />
                </div>
                
                <div className="af-field">
                  <label className="af-field-label">挂载技能集 (Skills)</label>
                  <div className="af-field-hint">选择专注的业务操作技能或编排。</div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                     <button style={{ padding: '6px 12px', border: '1px dashed #cbd5e1', borderRadius: 6, fontSize: 13, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                       <IconPlus size={14}/> Add Skill
                     </button>
                  </div>
                </div>
                
                <div className="af-field">
                  <label className="af-field-label">挂载能力池 (MCPs and tools)</label>
                  <div className="af-field-hint">为 Agent 授权本地或外部服务。带有一个默认的内置工具包，通过左侧 Meta-Agent 也可以快速添加外部 MCP 工具。</div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                     <div style={{ padding: '6px 12px', border: '1px solid #c7d2fe', borderRadius: 6, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, background: '#e0e7ff', color: '#4338ca', fontWeight: 600 }}>
                       <IconDatabase size={14} /> build-in-tools
                     </div>
                     {agentConfig.tools.map(t => (
                       <div key={t} style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc' }}>
                         <IconCheck size={14} color="#10b981" /> {t}
                       </div>
                     ))}
                     <button style={{ padding: '6px 12px', border: '1px dashed #cbd5e1', borderRadius: 6, fontSize: 13, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                       <IconPlus size={14}/> Add Tool
                     </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {wizardStep === 2 && (
          <>
            <div className="afw-wv2-left" style={{ width: '500px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #e2e8f0', background: '#fff' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#fafbfc' }}>
                 <div style={{ fontWeight: 600, fontSize: 14, color: '#334155' }}>测试代理台</div>
                 <div style={{ fontSize: 12, color: '#64748b' }}>正在与【{agentConfig.name || '全新蓝图'}】进行会话联调</div>
              </div>

              <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                <div className="afw-curl-box" style={{ marginBottom: 16 }}>
                  <div className="afw-cb-header">
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>REST cURL 参考</span>
                    <button className="af-copy-btn"><IconCopy size={13}/></button>
                  </div>
                  <div className="afw-cb-code">
{"curl -X POST https://api.workspace.com/v1/sessions/sesn_test123/events \\\n  -d '{\"events\": [{\"type\": \"user\", \"text\": \"" + (testSession.input || '...') + "\"}]}'"}
                  </div>
                </div>
                
                {testSession.messages.length > 0 ? (
                  <div className="afw-msg-list" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                    {testSession.messages.map((m, i) => (
                      <div key={i} style={{ 
                        alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                        background: m.role === 'user' ? '#1e293b' : '#f1f5f9',
                        color: m.role === 'user' ? '#f8fafc' : '#334155',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        maxWidth: '85%',
                        fontSize: '13px',
                        lineHeight: '1.5'
                      }}>
                        {m.content}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13 }}>
                    发送一条消息开始触发链路...
                  </div>
                )}
              </div>
              
              <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', background: '#fff' }}>
                <div className="afw-chat-input-area">
                  <textarea 
                    value={testSession.input}
                    onChange={e => setTestSession({...testSession, input: e.target.value})}
                    placeholder="向新蓝图下发任务..."
                    onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); runTestMessage(); } }}
                  />
                  <button onClick={runTestMessage} disabled={!testSession.input.trim()} className="afw-send-circle"><IconArrowUp size={16}/></button>
                </div>
              </div>
            </div>
            
            <div className="afw-wv2-right" style={{ flex: 1, padding: 24, background: '#f8fafc' }}>
              <div className="afw-preview-pane debug">
                 <div className="afw-pp-header" style={{ justifyContent: 'space-between' }}>
                   <div className="afw-pp-tabs">
                     <div className="afw-pp-tab active">观测面板 (Debug Stream)</div>
                   </div>
                   <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                     <IconActivity size={14}/> Event Trace
                   </div>
                 </div>
                 <div className="afw-pp-body debug-view">
                   {testSession.events.length === 0 ? (
                     <div style={{ color: '#94a3b8', textAlign: 'center', marginTop: 60, fontSize: 13 }}>暂无调度事件产生...</div>
                   ) : (
                     <div className="afw-event-stream">
                       {testSession.events.map((ev, i) => (
                         <div key={i} className={"afw-event-row " + ev.type}>
                           <div className={"afw-er-badge " + ev.type}>{ev.type}</div>
                           <div className="afw-er-text">{ev.text}</div>
                           <div className="afw-er-time">{ev.time}</div>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
              </div>
            </div>
          </>
        )}

        {wizardStep === 3 && (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '64px', background: '#fff' }}>
            <div className="afw-step-content fade-in" style={{ width: 640 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                <div style={{ width: 48, height: 48, background: '#ecfdf5', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconCheckCircle size={28} />
                </div>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>应用配置完成！</h2>
                  <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>该 Agent 蓝图处于 Ready 状态，你可以随时通过后端接入。</p>
                </div>
              </div>
              
              <div className="afw-integrate-card">
                <div className="afw-ic-header">唯一资源标识符 (Agent Blueprint ID)</div>
                <div className="afw-ic-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <code style={{ fontSize: 14, color: '#334155', fontWeight: 600 }}>ab_098KxOq2PLmswN88s9AOp1</code>
                  <button className="af-copy-btn"><IconCopy size={16}/></button>
                </div>
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>直接调用代码片段</h3>
              <div className="afw-code-tabs">
                <div className="afw-code-tab active">cURL</div>
                <div className="afw-code-tab">Python</div>
                <div className="afw-code-tab">Node.js</div>
              </div>
              <div className="afw-code-container" style={{ background: '#1e293b', padding: 16, borderRadius: '0 0 8px 8px', color: '#f8fafc', fontFamily: 'monospace', fontSize: 13, overflowX: 'auto' }}>
{"curl -X POST https://api.workspace.com/v1/meta/sessions \\\n  -H \"x-api-key: $WORKSPACE_API_KEY\" \\\n  -d '{\n    \"blueprint_id\": \"ab_098KxOq2PLmswN88s9AOp1\" \n  }'"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderWorkspace = () => (
    <div className="afw-workspace-split">
      <div className="afw-ws-left">
        <div className="afw-header" style={{ borderBottom: '1px solid var(--card-border)', background: '#fff' }}>
          <div className="afw-back-btn" onClick={() => setView('home')}>
            <IconArrowLeft size={18} />
          </div>
          <div className="page-header-left" style={{ margin: 0 }}>
            <div className="page-title-bar"></div>
            <h1 className="page-title">{selectedTask?.name || 'Workspace'}</h1>
          </div>
        </div>
        <div className="afw-ws-chat">
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 11, marginBottom: 20 }}>Workspace Chat</div>
        </div>
        <div className="afw-ws-footer">
          <div className="afw-test-input-wrap">
            <textarea 
              className="afw-test-input" 
              placeholder="Test your skill..."
            />
          </div>
        </div>
      </div>
      <div className="afw-ws-right">
        <div className="afw-preview-header">
           <span style={{ fontSize: 12, fontWeight: 600 }}>Skill Editor</span>
        </div>
        <div className="afw-preview-body">
           <div style={{ padding: 24, fontSize: 14, color: '#666' }}>Workspace area for editing Skill Markdown and Python scripts...</div>
        </div>
      </div>
    </div>
  )

  if (view === 'wizard') return renderWizard()
  if (view === 'workspace') return renderWorkspace()
  
  return (
    <PageLayout title="">
      {renderHome()}
    </PageLayout>
  )
}
