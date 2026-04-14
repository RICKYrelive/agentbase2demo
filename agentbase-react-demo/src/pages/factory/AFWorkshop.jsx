import { useState } from 'react'
import PageLayout from '../../components/PageLayout'
import './AFWorkshop.css'

// SVGs for cleaner UI
const IconPaperclip = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
)

const IconSend = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5"></line>
    <polyline points="5 12 12 5 19 12"></polyline>
  </svg>
)

const MOCK_TEMPLATES = {
  'Agent Blueprint': [
    { id: 'at1', name: '数据分析专家', icon: '📈', desc: '擅长处理结构化数据并生成图表' },
    { id: 'at2', name: '全栈开发助手', icon: '💻', desc: '协助编写前端与后端业务代码' },
    { id: 'at3', name: '文案策划专家', icon: '✍️', desc: '高效生成市场文案与创意内容' },
  ],
  Skill: [
    { id: 'st1', name: '网页抓取器', icon: '🕷️', desc: '解析网页 HTML 并提取关键信息' },
    { id: 'st2', name: 'PDF 转换工具', icon: '📄', desc: '将各种文档格式转换为 PDF' },
    { id: 'st3', name: '图片处理脚本', icon: '🖼️', desc: '自动调整图片大小与水印' },
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
    icon: '📊'
  },
  {
    id: 't_002',
    name: '代码审查 Agent',
    desc: '用于自动化审查 PR 并在 GitHub 留言报告',
    createdAt: '2026-04-12 10:15:00',
    expiryAt: '2026-04-13 10:15:00',
    status: 'generating',
    type: 'Agent Blueprint',
    icon: '🔍'
  }
]

export default function AFWorkshop() {
  const [view, setView] = useState('home') // 'home' | 'wizard' | 'workspace'
  const [wizardStep, setWizardStep] = useState(1)
  const [activeTab, setActiveTab] = useState('Agent Blueprint') // Agent Blueprint before Skill
  const [prompt, setPrompt] = useState('')
  const [selectedTask, setSelectedTask] = useState(null)
  
  // Workspace specific states
  const [activeFile, setActiveFile] = useState('SKILL.md')
  const [testInput, setTestInput] = useState('')

  const handleTaskClick = (task) => {
    setSelectedTask(task)
    setView('workspace')
  }

  const startWizard = () => {
    setWizardStep(1)
    setView('wizard')
  }

  const nextStep = () => {
    if (wizardStep < 4) setWizardStep(wizardStep + 1)
    else setView('workspace')
  }

  // --- RENDERING HELPERS ---

  const renderHome = () => (
    <div className="af-workshop afw-home">
      {/* Centered Hero Section */}
      <div className="afw-hero">
        <h1 className="afw-hero-title notion-h1" style={{ justifyContent: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: 44 }}>⌨️</span> Agent 工坊
        </h1>
        <p className="afw-hero-subtitle notion-body-large" style={{ color: 'var(--notion-gray-500)', fontSize: 20, marginBottom: '48px' }}>
          高效构建 AI Agent 与 Skill，让能力从设想变为现实
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
              placeholder={`输入你想创建的 ${activeTab} 的核心功能或上传文件...`}
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
              <button className="af-list-btn notion-body-medium" style={{ marginLeft: 8, color: 'var(--notion-blue)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 16 }}>💡</span> 获取灵感
              </button>
            </div>
            <button 
              className="afw-send-btn action-btn primary" 
              disabled={!prompt.trim()} 
              onClick={startWizard}
              style={{ width: 44, height: 44, borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <IconSend />
            </button>
          </div>
        </div>
      </div>

      {/* Templates Section */}
      <div className="afw-templates-section">
        <h2 className="afw-section-title notion-card-title">使用模板快速开始</h2>
        <div className="afw-template-grid">
          {MOCK_TEMPLATES[activeTab].map(tpl => (
            <div key={tpl.id} className="afw-template-card" onClick={startWizard} style={{ border: 'var(--notion-border)', boxShadow: 'var(--notion-shadow-card)', borderRadius: 12 }}>
              <div className="afw-template-icon" style={{ background: 'var(--notion-bg-alt)' }}>{tpl.icon}</div>
              <div>
                <div className="afw-template-name notion-body-medium">{tpl.name}</div>
                <div className="notion-caption" style={{ color: 'var(--notion-gray-500)', marginTop: 2 }}>{tpl.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task List Section (Table) */}
      <h2 className="afw-section-title notion-card-title" style={{ marginTop: 48 }}>我的任务</h2>
      <div className="afw-tasks-section" style={{ border: 'var(--notion-border)', borderRadius: 12 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th width="180">名称</th>
              <th>描述</th>
              <th width="160">创建时间</th>
              <th width="160">过期时间</th>
              <th width="180" style={{ textAlign: 'right' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_TASKS.map(task => (
              <tr key={task.id} style={{ cursor: 'pointer' }} onClick={() => handleTaskClick(task)}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{task.icon}</span>
                    <span style={{ fontWeight: 600 }}>{task.name}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{task.desc}</td>
                <td>{task.createdAt}</td>
                <td style={{ color: '#fa8c16' }}>{task.expiryAt}</td>
                <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                  <button className="af-list-btn" onClick={() => handleTaskClick(task)}>详情</button>
                  <button className="af-list-btn">续期</button>
                  <button className="af-list-btn delete">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderWizard = () => (
    <div className="afw-wizard">
      <div className="afw-wizard-side">
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 40 }}>创建 {activeTab}</h2>
        {[
          { step: 1, title: '基础定义', desc: '设定名称与核心目标' },
          { step: 2, title: '详细指令', desc: '编写系统级运行提示词' },
          { step: 3, title: '能力扩展', desc: '添加工具或外部数据' },
          { step: 4, title: '生成并初始化', desc: 'AI 生成初始代码与文档' },
        ].map(s => (
          <div key={s.step} className={`afw-wizard-step ${wizardStep === s.step ? 'active' : ''} ${wizardStep > s.step ? 'completed' : ''}`}>
            <div className="afw-step-num">{wizardStep > s.step ? '✓' : s.step}</div>
            <div className="afw-step-info">
              <div className="afw-step-title">{s.title}</div>
              <div style={{ fontSize: 11, color: '#b0aca8' }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="afw-wizard-main">
        <div className="afw-wizard-content">
          {wizardStep === 1 && (
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>为你的 {activeTab} 命名</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>这将作为其唯一标识。好的名称能让人一目了然。</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, marginBottom: 8, fontWeight: 600 }}>名称</label>
                  <input type="text" className="data-toolbar-search" style={{ width: '100%' }} placeholder="例如：GitHub 代码审查专家" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, marginBottom: 8, fontWeight: 600 }}>一句话描述</label>
                  <textarea className="data-toolbar-search" style={{ width: '100%', height: 80, padding: 12 }} placeholder="描述这个 Agent 或 Skill 最大的价值点" />
                </div>
              </div>
            </div>
          )}
          {wizardStep === 2 && (
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>编写运行指令</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>这是决定 AI 行为的核心。你可以使用自然语言描述。</p>
              <textarea 
                className="data-toolbar-search" 
                style={{ width: '100%', height: 300, padding: 16, fontFamily: 'monospace' }} 
                placeholder="# 你的身份\n你是一个代码审查专家...\n\n# 你的任务\n检查 PR 的代码质量与安全性..."
              />
            </div>
          )}
          {wizardStep === 3 && (
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>选择核心能力</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>为你的 Agent 挂载必要的工具或知识库。</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Google 搜索工具', 'GitHub API 工具', 'PDF 解析器', 'Python 代码解释器'].map(tool => (
                  <div key={tool} style={{ border: '1px solid var(--card-border)', padding: '12px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input type="checkbox" />
                    <span style={{ fontSize: 14 }}>{tool}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {wizardStep === 4 && (
            <div style={{ textAlign: 'center', paddingTop: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 20 }}>🤖</div>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>一切就绪！</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 40 }}>AI 正在根据你的指令生成初始模块、文档和脚本...</p>
              <div style={{ width: '100%', height: 4, background: '#f0f0f0', borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '70%', background: 'var(--color-blue)', borderRadius: 2 }}></div>
              </div>
            </div>
          )}
        </div>
        <div style={{ marginTop: 40, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button className="action-btn" onClick={() => setView('home')}>取消</button>
          <button className="action-btn primary" onClick={nextStep}>
            {wizardStep === 4 ? '进入工作区进行调试' : '下一步'}
          </button>
        </div>
      </div>
    </div>
  )

  const renderWorkspace = () => (
    <div className="afw-workspace-split">
      {/* Left: Chat Area */}
      <div className="afw-ws-left">
        <div className="afw-header" style={{ borderBottom: '1px solid var(--card-border)', background: '#fff' }}>
          <div className="afw-back-btn" onClick={() => setView('home')}>←</div>
          <div className="page-header-left" style={{ margin: 0 }}>
            <div className="page-title-bar"></div>
            <h1 className="page-title">{selectedTask?.name || '创建中...'}</h1>
          </div>
        </div>
        
        <div className="afw-ws-chat">
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 11, marginBottom: 20 }}>历史会话回放</div>
          <div style={{ 
            background: '#fff', 
            padding: '12px 16px', 
            borderRadius: '8px', 
            border: '1px solid var(--card-border)',
            width: 'fit-content',
            maxWidth: '85%',
            fontSize: 13,
            marginBottom: 16
          }}>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>Workshop Agent:</p>
            已为你生成了核心脚本 `competitor_analysis.py` 和 包含文档的 `SKILL.md`。您可以直接在下方输入指令来测试或进一步优化。
          </div>
          
          <div style={{ 
            background: '#ebf4ff', 
            padding: '12px 16px', 
            borderRadius: '8px', 
            width: 'fit-content',
            maxWidth: '85%',
            fontSize: 13,
            alignSelf: 'flex-end',
            marginLeft: 'auto',
            marginBottom: 16
          }}>
             帮我增加一个 Excel 导出功能。
          </div>
        </div>

        <div className="afw-ws-footer">
          <div className="afw-test-input-wrap">
            <textarea 
              className="afw-test-input" 
              placeholder="在这里测试你的 Skill，或者要求 AI 调整逻辑..."
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
            />
            <div className="afw-test-actions">
              <button className="afw-eval-btn" title="调用系统评估功能">
                ⚖️ 提测评估
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                 <button className="afw-upload-btn">📎</button>
                 <button className="afw-send-btn">↑</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Preview Area */}
      <div className="afw-ws-right">
        <div className="afw-preview-header">
           <span style={{ fontSize: 12, fontWeight: 600 }}>预览区域：{activeFile}</span>
           <button className="action-btn primary" style={{ height: 28, fontSize: 11, padding: '0 12px', marginLeft: 'auto' }}>发布资产</button>
        </div>
        <div className="afw-preview-body">
          <div className="afw-explorer">
            <div className="afw-exp-item afw-exp-folder">📁 skills1/research</div>
            {['SKILL.md', 'competitor_analysis.py', 'data_guide.md', 'template.csv'].map(f => (
              <div 
                key={f} 
                className={`afw-exp-item ${activeFile === f ? 'active' : ''}`}
                onClick={() => setActiveFile(f)}
              >
                {f.endsWith('.py') ? '🐍' : '📄'} {f}
              </div>
            ))}
          </div>
          <div className="afw-code-content">
             {activeFile === 'SKILL.md' ? (
               <div className="markdown-body">
                 <h1># 竞品研究技能</h1>
                 <p>本技能提供完整的竞品研究工具包，用于系统性地收集、分析和报告竞品信息。</p>
                 <pre>
{`---
name: competitor-research
description: Comprehensive toolkit for research.
---

## 核心功能
1. 竞品数据收集
2. 多维度分析
3. 导出报表
`}
                 </pre>
               </div>
             ) : (
               <pre style={{ margin: 0 }}>
{`import os
import sys

def main():
    print("Running competitor research script...")
    # TODO: Implement collection logic
    
if __name__ == "__main__":
    main()`}
               </pre>
             )}
          </div>
        </div>
      </div>
    </div>
  )

  // MAIN LAYOUT RETURN
  if (view === 'wizard') return renderWizard()
  if (view === 'workspace') return renderWorkspace()
  
  return (
    <PageLayout title="Agent 工坊">
      {renderHome()}
    </PageLayout>
  )
}
