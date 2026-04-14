import React, { useState, useEffect, useRef } from 'react'
import PageLayout from '../../components/PageLayout'
import { 
  IconPaperclip, IconSend, IconDatabase, IconTerminal, 
  IconEdit, IconSearch, IconFile, IconImage, IconBarChart, 
  IconChevronRight, IconChevronDown, IconArrowLeft, IconCheck, IconX,
  IconBot, IconFolder, IconFileText, IconCopy, IconCheckCircle, IconPlay,
  IconAlertTriangle, IconActivity, IconGithub, IconGlobe, IconLock, IconPlus
} from '../../components/Icons'
import './AFWorkshop.css'
import ShapeGrid from '../../components/effects/ShapeGrid'

const MOCK_TEMPLATES = {
  'Agent Blueprint': [
    { 
      id: 'at1', name: 'Blank agent config', icon: <IconFileText />, desc: 'A blank starting point with the core toolset.',
      envTemplate: 'default',
      tags: ['Core'],
      tools: ['bash', 'web_fetch'],
      yaml: `name: blank-agent
description: A blank starting point with the core toolset.
system_prompt: |
  You are a helpful assistant. Use your tools to solve problems.
tools:
  - bash
  - web_fetch
`
    },
    { 
      id: 'at2', name: 'Data analyst', icon: <IconBarChart />, desc: 'Load, explore, and visualize data; build reports and answer questions from datasets.',
      envTemplate: 'data-analyst',
      tags: ['Data', 'Python'],
      tools: ['bash', 'web_fetch', 'python'],
      yaml: `name: data-analyst
description: Load, explore, and visualize data.
system_prompt: |
  You are an expert data analyst. You write Python code to load datasets, 
  clean data, perform statistical analysis, and generate charts using matplotlib.
tools:
  - bash
  - web_fetch
  - python
`
    },
    { 
      id: 'at3', name: 'Deep researcher', icon: <IconSearch />, desc: 'Conducts multi-step web research with source synthesis and citations.',
      envTemplate: 'researcher',
      tags: ['Web', 'Research'],
      tools: ['web_fetch', 'search'],
      yaml: `name: deep-researcher
description: Conducts multi-step web research with source synthesis and citations.
system_prompt: |
  You are a meticulous researcher. You conduct comprehensive web searches, 
  synthesize information from multiple sources, and always provide citations.
tools:
  - web_fetch
  - search
`
    },
    { 
      id: 'at4', name: 'Software Developer', icon: <IconTerminal />, desc: 'Full-stack software developer capable of writing, reviewing, and testing code.',
      envTemplate: 'developer',
      tags: ['Code', 'Development'],
      tools: ['bash', 'github'],
      yaml: `name: software-developer
description: Assists with software development tasks.
system_prompt: |
  You are an experienced full-stack developer. You write clean, testable code,
  perform code reviews, and can execute bash commands to run tests.
tools:
  - bash
  - github
`
    },
    { 
      id: 'at5', name: 'Incident commander', icon: <IconAlertTriangle />, desc: 'Triages alerts, opens incident tickets, and runs the war room.',
      envTemplate: 'ops',
      tags: ['DevOps', 'SRE'],
      tools: ['pagerduty', 'slack', 'jira'],
      yaml: `name: incident-commander
description: Triages alerts and manages incidents.
system_prompt: |
  You are an incident commander. You investigate alerts, coordinate communication
  in Slack, and ensure tickets are tracked and updated.
tools:
  - pagerduty
  - slack
  - jira
`
    },
    { 
      id: 'at6', name: 'Support-to-eng escalator', icon: <IconMessageSquare />, desc: 'Reads customer conversations, reproduces bugs, and files Jira issues.',
      envTemplate: 'support',
      tags: ['Support', 'Engineering'],
      tools: ['intercom', 'jira', 'github'],
      yaml: `name: support-escalator
description: Escalates support tickets to engineering.
system_prompt: |
  You read customer support conversations, identify reproducible bugs,
  and create detailed engineering tickets with reproduction steps.
tools:
  - intercom
  - jira
  - github
`
    },
    { 
      id: 'at7', name: 'Structured extractor', icon: <IconDatabase />, desc: 'Parses unstructured text into a typed JSON schema.',
      envTemplate: 'default',
      tags: ['Data', 'Parsing'],
      tools: ['json_schema'],
      yaml: `name: structured-extractor
description: Extracts structured JSON from unstructured text.
system_prompt: |
  You parse large blocks of unstructured text and extract entities matching
  the provided JSON schema exactly.
tools:
  - json_schema
`
    },
    { 
      id: 'at8', name: 'Feedback miner', icon: <IconEdit />, desc: 'Clusters raw feedback from Slack and Notion into themes and drafts Asana tasks.',
      envTemplate: 'product',
      tags: ['Product', 'Analysis'],
      tools: ['slack', 'notion', 'asana'],
      yaml: `name: feedback-miner
description: Clusters user feedback into actionable themes.
system_prompt: |
  You are a product manager analyzing user feedback. You cluster feedback into
  themes and create actionable tasks for the engineering team.
tools:
  - slack
  - notion
  - asana
`
    },
    { 
      id: 'at9', name: 'Field monitor', icon: <IconGlobe />, desc: 'Scans software blogs for a topic and writes a weekly what-changed brief.',
      envTemplate: 'researcher',
      tags: ['News', 'Monitoring'],
      tools: ['web_fetch', 'rss'],
      yaml: `name: field-monitor
description: Monitors industry blogs and writes summaries.
system_prompt: |
  You monitor specified industry blogs and RSS feeds. You compile a weekly
  brief summarizing the most important changes and announcements.
tools:
  - web_fetch
  - rss
`
    },
    { 
      id: 'at10', name: 'Sprint retro facilitator', icon: <IconActivity />, desc: 'Pulls a closed sprint from Linear, synthesizes themes, and writes the retro doc.',
      envTemplate: 'agile',
      tags: ['Agile', 'Docs'],
      tools: ['linear', 'notion'],
      yaml: `name: sprint-retro
description: Facilitates sprint retrospectives.
system_prompt: |
  You analyze completed sprints in Linear, identifying bottlenecks and successes.
  You generate a comprehensive retrospective document.
tools:
  - linear
  - notion
`
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
    type: 'Agent Blueprint',
    icon: <IconSearch />
  }
]

export default function AFWorkshop() {
  const [view, setView] = useState('home') // 'home' | 'wizard' | 'workspace'
  const [wizardStep, setWizardStep] = useState(1)
  const [activeTab, setActiveTab] = useState('Agent Blueprint')
  const [prompt, setPrompt] = useState('')
  const [selectedTask, setSelectedTask] = useState(null)
  
  // Template Preview Modal
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [previewActiveTab, setPreviewActiveTab] = useState('yaml') // 'yaml' | 'structured'
  const [editedYaml, setEditedYaml] = useState('')

  // Wizard state
  const [agentConfig, setAgentConfig] = useState({
    name: '',
    description: '',
    systemPrompt: '',
    envTemplate: 'default',
    network: 'unrestricted',
    yaml: ''
  })

  // Test Run State
  const [testSession, setTestSession] = useState({
    running: false,
    messages: [],
    events: [],
    input: ''
  })
  
  // Workspace specific states (for Skill)
  const [activeFile, setActiveFile] = useState('SKILL.md')
  const [testInput, setTestInput] = useState('')

  const handleTaskClick = (task) => {
    setSelectedTask(task)
    setView('workspace')
  }

  const openTemplatePreview = (tpl) => {
    setPreviewTemplate(tpl)
    setEditedYaml(tpl.yaml || '')
    setPreviewActiveTab('yaml')
  }

  const startWizardFromTemplate = () => {
    setAgentConfig({
      name: previewTemplate.name,
      description: previewTemplate.desc,
      systemPrompt: (editedYaml.match(/system_prompt:\\s*\\|([\\s\\S]*?)(?=\\ntools:|$)/) || [])[1]?.trim() || '',
      envTemplate: previewTemplate.envTemplate || 'default',
      network: 'unrestricted',
      yaml: editedYaml
    })
    setPreviewTemplate(null)
    setWizardStep(1)
    setView('wizard')
  }
  
  const startWizardEmpty = () => {
    setAgentConfig({
      name: '', description: '', systemPrompt: '', envTemplate: 'default', network: 'unrestricted', yaml: ''
    })
    setWizardStep(1)
    setView('wizard')
  }

  const runTestMessage = () => {
    if (!testSession.input.trim()) return
    const newMsg = { role: 'user', content: testSession.input }
    setTestSession(prev => ({
      ...prev,
      messages: [...prev.messages, newMsg],
      input: '',
      events: [...prev.events, { type: 'user', text: `User request: ${testSession.input}`, time: new Date().toLocaleTimeString() }]
    }))

    // Simulate Agent Processing
    setTimeout(() => {
      setTestSession(prev => ({
        ...prev,
        events: [...prev.events, { type: 'tool', text: `Tool bash called. 14 tokens / 120ms`, time: new Date().toLocaleTimeString() }]
      }))
    }, 800)

    setTimeout(() => {
      setTestSession(prev => ({
        ...prev,
        messages: [...prev.messages, { role: 'agent', content: 'I have executed the necessary commands and gathered the results for you.' }],
        events: [...prev.events, { type: 'agent', text: `Response generated. 45 tokens / 450ms`, time: new Date().toLocaleTimeString() }]
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
          Agent Blueprint Quickstart
        </h1>
        <p className="afw-hero-subtitle notion-body-large" style={{ color: 'var(--notion-gray-500)', fontSize: 18, marginBottom: '48px' }}>
          What do you want to build? Describe your agent or start with a template.
        </p>

        <div className="afw-input-card" style={{ boxShadow: 'var(--notion-shadow-card)', border: 'var(--notion-border)' }}>
          <div className="afw-tabs notion-font">
            {['Agent Blueprint', 'Skill'].map(t => (
              <button 
                key={t} 
                className={`afw-tab ${activeTab === t ? 'active' : ''}`}
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
              placeholder={`Describe your ${activeTab.toLowerCase()}...`}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              style={{ fontSize: 16 }}
            />
          </div>
          <div className="afw-input-actions">
            <div className="afw-action-left">
              <button className="afw-upload-btn" title="Upload file">
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
        <h2 className="afw-section-title notion-card-title">Browse templates</h2>
        <div className="afw-template-grid" style={{ gridTemplateColumns: activeTab === 'Agent Blueprint' ? 'repeat(auto-fill, minmax(340px, 1fr))' : 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          {MOCK_TEMPLATES[activeTab].map(tpl => (
            <div 
              key={tpl.id} 
              className="afw-template-card" 
              onClick={() => activeTab === 'Agent Blueprint' ? openTemplatePreview(tpl) : startWizardEmpty()} 
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

      {activeTab === 'Skill' && (
        <>
          <h2 className="afw-section-title notion-card-title" style={{ marginTop: 48 }}>我的任务 (Workspace Tasks)</h2>
          <div className="afw-tasks-section" style={{ border: 'var(--notion-border)', borderRadius: 12 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th width="180">名称</th>
                  <th>描述</th>
                  <th width="160">创建时间</th>
                  <th width="180" style={{ textAlign: 'right' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_TASKS.filter(t => t.type === 'Skill').map(task => (
                  <tr key={task.id} style={{ cursor: 'pointer' }} onClick={() => handleTaskClick(task)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: 'var(--notion-blue)' }}>{task.icon}</span>
                        <span style={{ fontWeight: 600 }}>{task.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{task.desc}</td>
                    <td>{task.createdAt}</td>
                    <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                      <button className="af-list-btn" onClick={() => handleTaskClick(task)}>进入工作区</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
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
                  <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>Description</div>
                  <div style={{ fontSize: 15, lineHeight: 1.5 }}>{previewTemplate.desc}</div>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>Environment Template</div>
                  <div style={{ fontSize: 14, fontWeight: 600, display: 'inline-block', background: '#f8fafc', padding: '4px 8px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                    {previewTemplate.envTemplate}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>Default Tools</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {previewTemplate.tools?.map(t => (
                      <span key={t} style={{ fontSize: 12, background: '#e0e7ff', color: '#4338ca', padding: '4px 8px', borderRadius: 4, fontWeight: 600 }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="afw-tpl-editor-pane">
                <div className="afw-tab-switch">
                  <button className={`afw-ts-btn ${previewActiveTab === 'yaml' ? 'active' : ''}`} onClick={() => setPreviewActiveTab('yaml')}>YAML</button>
                  <button className={`afw-ts-btn ${previewActiveTab === 'structured' ? 'active' : ''}`} onClick={() => setPreviewActiveTab('structured')}>Preview</button>
                </div>
                
                {previewActiveTab === 'yaml' ? (
                  <textarea 
                    className="afw-yaml-editor"
                    value={editedYaml}
                    onChange={e => setEditedYaml(e.target.value)}
                    spellCheck={false}
                  />
                ) : (
                  <div className="afw-structured-preview">
                    <div className="afw-sp-field">
                      <div className="afw-sp-label">System Prompt</div>
                      <div className="afw-sp-val" style={{ whiteSpace: 'pre-wrap' }}>{(editedYaml.match(/system_prompt:\s*\|([\s\S]*?)(?=\ntools:|$)/) || [])[1]?.trim()}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="afw-tpl-modal-footer">
              <button className="action-btn" onClick={() => { setPreviewTemplate(null); startWizardEmpty(); }}>Start blank</button>
              <button className="action-btn primary" onClick={startWizardFromTemplate}>Use this template</button>
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
          <span style={{ fontSize: 16, fontWeight: 600 }}>Quickstart</span>
        </div>
        
        <div className="afw-stepper">
          {[
            { step: 1, label: 'Create agent', path: 'POST /v1/agents' },
            { step: 2, label: 'Configure environment' },
            { step: 3, label: 'Start session', path: 'POST /v1/sessions' },
            { step: 4, label: 'Integrate' }
          ].map(s => (
            <React.Fragment key={s.step}>
              <div className={`afw-step-item ${wizardStep === s.step ? 'active' : ''} ${wizardStep > s.step ? 'completed' : ''}`}>
                <div className="afw-step-circle">{wizardStep > s.step ? <IconCheck size={12} /> : s.step}</div>
                <div className="afw-step-label">{s.label}</div>
                {s.path && <div className="afw-step-path">{s.path}</div>}
              </div>
              {s.step < 4 && <div className="afw-step-line" />}
            </React.Fragment>
          ))}
        </div>
        
        <div className="afw-wv2-actions">
           {wizardStep < 4 && (
             <button className="action-btn primary" onClick={() => setWizardStep(wizardStep + 1)}>
               {wizardStep === 3 ? 'Stop session' : `Next step`}
             </button>
           )}
           {wizardStep === 4 && (
             <button className="action-btn primary" onClick={() => setView('home')}>Done</button>
           )}
        </div>
      </div>

      <div className="afw-wv2-body">
        {/* Left pane for form/instructions */}
        <div className="afw-wv2-left">
          {wizardStep === 1 && (
            <div className="afw-step-content fade-in">
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Create your agent</h2>
              
              <div className="af-field">
                <label className="af-field-label">Agent Name</label>
                <input 
                  type="text" 
                  className="af-input-text" 
                  value={agentConfig.name}
                  onChange={e => setAgentConfig({...agentConfig, name: e.target.value})}
                  placeholder="e.g. Data analyst" 
                />
              </div>
              
              <div className="af-field">
                <label className="af-field-label">System Prompt</label>
                <div className="af-field-hint">Instructs the agent on its persona and how to use tools.</div>
                <textarea 
                  className="af-input-textarea" 
                  value={agentConfig.systemPrompt}
                  onChange={e => setAgentConfig({...agentConfig, systemPrompt: e.target.value})}
                  style={{ height: 260, fontFamily: 'monospace', fontSize: 13 }}
                  placeholder="You are an expert data analyst..."
                />
              </div>
              
              <div className="af-field">
                <label className="af-field-label">MCP Servers & Tools</label>
                <div className="af-field-hint">Tools the agent has access to automatically.</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                   {['bash', 'web_fetch', 'python', 'github'].map(t => (
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
          )}

          {wizardStep === 2 && (
            <div className="afw-step-content fade-in">
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Configure environment</h2>
              <p style={{ color: '#64748b', marginBottom: 24 }}>Set up the execution sandbox and network permissions for this agent.</p>
              
              <div className="af-field">
                <label className="af-field-label">Environment Variables</label>
                <div className="af-field-hint">Required for some MCP servers (e.g. AMPLITUDE_API_KEY).</div>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, background: '#f8fafc' }}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                    <input type="text" className="af-input-text" placeholder="Key (e.g. API_KEY)" style={{ flex: 1 }} />
                    <input type="password" className="af-input-text" placeholder="Value" style={{ flex: 2 }} />
                  </div>
                  <button style={{ color: '#3b82f6', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ Add variable</button>
                </div>
              </div>

              <div className="af-field">
                <label className="af-field-label">Network Access</label>
                <div className="af-field-hint">Internet routing policies for the sandbox.</div>
                <div className="af-card-grid">
                  {[
                    { id: 'unrestricted', name: 'Unrestricted', icon: <IconGlobe />, desc: 'Full internet access' },
                    { id: 'restricted', name: 'Restricted', icon: <IconAlertTriangle />, desc: 'Specific domains only' },
                    { id: 'none', name: 'None', icon: <IconLock />, desc: 'No outbound traffic' }
                  ].map(opt => (
                    <div 
                      key={opt.id} 
                      className={`af-option-card ${agentConfig.network === opt.id ? 'selected' : ''}`}
                      onClick={() => setAgentConfig({...agentConfig, network: opt.id})}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                         <div className="af-option-icon">{opt.icon}</div>
                         <div className="af-option-name">{opt.name}</div>
                      </div>
                      <div className="af-option-desc">{opt.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="afw-step-content fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: 0 }}>
              <div style={{ marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Your session is live</h2>
                <p style={{ color: '#64748b', fontSize: 14 }}>Send your first message in the test run panel to kick things off!</p>
              </div>

              <div className="afw-curl-box">
                <div className="afw-cb-header">
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>cURL</span>
                  <button className="af-copy-btn" title="Copy"><IconCopy size={14}/></button>
                </div>
                <div className="afw-cb-code">
{`curl -X POST https://api.anthropic.com/v1/sessions/sesn_test123/events \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: $ANTHROPIC_API_KEY" \\
  -H "anthropic-beta: managed-agents-2026-04-01" \\
  -d '{
    "events": [{"type": "user", "text": "${testSession.input || '...'}"}]
  }'`}
                </div>
              </div>
              
              <div style={{ flex: 1, borderTop: '1px solid #e2e8f0', marginTop: 16, paddingTop: 16, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 12, textTransform: 'uppercase' }}>Session Event Sent</div>
                
                {testSession.messages.length > 0 ? (
                  <div className="afw-msg-list">
                    <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.6 }}>The agent received your message. See the transcript and debug stream on the right for intermediate outputs!</p>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 14 }}>
                    Waiting for input...
                  </div>
                )}
                
                <div className="afw-chat-input-area" style={{ marginTop: 'auto' }}>
                  <textarea 
                    value={testSession.input}
                    onChange={e => setTestSession({...testSession, input: e.target.value})}
                    placeholder="E.g. Load the Titanic CSV and analyze survival rates..."
                    onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); runTestMessage(); } }}
                  />
                  <button onClick={runTestMessage} disabled={!testSession.input.trim()} className="afw-send-circle"><IconArrowUp size={16}/></button>
                </div>
              </div>
            </div>
          )}

          {wizardStep === 4 && (
            <div className="afw-step-content fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                <div style={{ width: 48, height: 48, background: '#ecfdf5', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconCheckCircle size={28} />
                </div>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>All set!</h2>
                  <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Your agent is ready for integration.</p>
                </div>
              </div>
              
              <div className="afw-integrate-card">
                <div className="afw-ic-header">Agent ID</div>
                <div className="afw-ic-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <code style={{ fontSize: 14, color: '#334155' }}>agnt_011Ca3fmseBwu2FAXJyPqo2v</code>
                  <button className="af-copy-btn"><IconCopy size={16}/></button>
                </div>
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>Integration Code</h3>
              <div className="afw-code-tabs">
                <div className="afw-code-tab active">cURL</div>
                <div className="afw-code-tab">Python</div>
                <div className="afw-code-tab">Node.js</div>
              </div>
              <div className="afw-code-container" style={{ background: '#1e293b', padding: 16, borderRadius: '0 0 8px 8px', color: '#f8fafc', fontFamily: 'monospace', fontSize: 13, overflowX: 'auto' }}>
{`curl -X POST https://api.anthropic.com/v1/sessions \\
  -H "x-api-key: $ANTHROPIC_API_KEY" \\
  -d '{
    "agent_id": "agnt_011Ca3fmse..." 
  }'`}
              </div>
            </div>
          )}
        </div>
        
        {/* Right pane for preview/debug */}
        <div className="afw-wv2-right">
          {wizardStep < 3 ? (
            <div className="afw-preview-pane">
              <div className="afw-pp-header">
                <div className="afw-pp-tabs">
                  <div className="afw-pp-tab active">Config</div>
                  <div className="afw-pp-tab">Preview</div>
                </div>
              </div>
              <div className="afw-pp-body yaml-view">
                <pre>{agentConfig.yaml || 'name: ' + agentConfig.name + '\ndescription: ' + agentConfig.description + '\n...'}</pre>
              </div>
            </div>
          ) : (
            <div className="afw-preview-pane debug">
               <div className="afw-pp-header" style={{ justifyContent: 'space-between' }}>
                 <div className="afw-pp-tabs">
                   <div className="afw-pp-tab active">Transcript</div>
                   <div className="afw-pp-tab">Debug</div>
                 </div>
                 <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                   <IconActivity size={14}/> Event Stream
                 </div>
               </div>
               <div className="afw-pp-body debug-view">
                 {testSession.events.length === 0 ? (
                   <div style={{ color: '#94a3b8', textAlign: 'center', marginTop: 60, fontSize: 13 }}>Waiting for session events...</div>
                 ) : (
                   <div className="afw-event-stream">
                     {testSession.events.map((ev, i) => (
                       <div key={i} className={`afw-event-row ${ev.type}`}>
                         <div className={`afw-er-badge ${ev.type}`}>{ev.type}</div>
                         <div className="afw-er-text">{ev.text}</div>
                         <div className="afw-er-time">{ev.time}</div>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
            </div>
          )}
        </div>
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
