import { createContext, useContext, useReducer, useState } from 'react'

// ========== Status machine ==========
const VALID_TRANSITIONS = {
  Draft:   ['Running'],
  Running: ['Paused', 'Stopped', 'Error'],
  Paused:  ['Running', 'Stopped'],
  Stopped: ['Running'],
  Error:   ['Running', 'Stopped'],
}

export function canTransition(from, to) {
  return (VALID_TRANSITIONS[from] || []).includes(to)
}

// ========== Initial mock data ==========
let _nextId = 7

function ts(daysAgo, hoursAgo = 0) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(d.getHours() - hoursAgo)
  return d.toISOString().replace('T', ' ').slice(0, 19)
}

const INITIAL_AGENTS = [
  {
    id: 'ha-001',
    name: 'insight-brief-agent',
    description: '信息摘要 Agent，用于自动化生成每日简报',
    version: 'v2.1.0',
    status: 'Running',
    owner: 'admin',
    cluster: 'cls-prod-cluster-1',
    createdAt: ts(14),
    updatedAt: ts(1),
    lastRunAt: ts(0, 2),
    model: 'gpt-4o',
    prompt: '你是一个专业的信息分析师，负责从多个数据源汇总关键信息并生成每日简报。\n请确保报告结构清晰、重点突出。',
    endpoint: 'http://insight-brief:8080',
    concurrency: 5,
    timeout: 120,
    retry: 3,
    memoryEnabled: true,
    memorySpace: 'insight-mem-01',
    skills: ['web-search', 'doc-parser', 'summarizer'],
    imType: '企业微信',
    imConfig: { webhookUrl: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx' },
    tags: ['production', 'daily', '信息摘要'],
    replicasMode: 'fixed',
    replicas: 2,
    cpu: 2,
    memory: 4,
    k8sCluster: 'cls-prod-cluster-1',
    events: [
      { time: ts(14), action: '创建', detail: 'Agent 创建成功' },
      { time: ts(13), action: '启动', detail: 'Agent 启动成功，运行中' },
      { time: ts(7), action: '更新配置', detail: '修改并发数为 5' },
      { time: ts(1), action: '重启', detail: '配置更新后自动重启' },
    ],
    tasks: [
      { id: 't-001', name: '每日简报生成', status: 'Success', time: ts(0, 2), duration: '45s' },
      { id: 't-002', name: '每日简报生成', status: 'Success', time: ts(1, 2), duration: '38s' },
      { id: 't-003', name: '周报汇总', status: 'Success', time: ts(7), duration: '2m12s' },
    ],
    conversations: [
      {
        id: 'conv-001', title: '每日简报生成', createdAt: ts(0, 2),
        messages: [
          { role: 'user', content: '请帮我生成今天的新闻简报', time: ts(0, 2) },
          { role: 'tool', content: '🔧 调用 web-search … 搜索到 15 条相关新闻\n🔧 调用 doc-parser … 解析完成\n🔧 调用 summarizer … 生成摘要', time: ts(0, 2) },
          { role: 'assistant', content: '# 每日简报 — 2026-04-06\n\n## 🔥 热点要闻\n1. **AI 领域**: Google DeepMind 发布 Gemini 3 Pro，支持原生多模态推理\n2. **科技产业**: 苹果宣布 M5 芯片产线完成\n3. **金融市场**: A 股三大指数集体高开，AI 概念股领涨\n\n## 📊 数据摘要\n- 共抓取 15 条新闻源\n- 覆盖 5 个领域\n- 关键实体 12 个\n\n如需了解某条新闻的详细内容，请告诉我。', time: ts(0, 2) },
        ]
      },
      {
        id: 'conv-002', title: '周报汇总', createdAt: ts(7),
        messages: [
          { role: 'user', content: '汇总本周重要事件', time: ts(7) },
          { role: 'assistant', content: '本周重要事件汇总已生成，共涉及 23 条信息。', time: ts(7) },
        ]
      },
    ],
    workspace: {
      files: [
        { name: 'workspace', type: 'folder', children: [
          { name: 'memory', type: 'folder', children: [
            { name: 'daily_context.json', type: 'file', size: '2.4KB' },
          ]},
          { name: 'output', type: 'folder', children: [
            { name: '2026-04-06_brief.md', type: 'file', size: '3.1KB' },
            { name: '2026-04-05_brief.md', type: 'file', size: '2.8KB' },
          ]},
          { name: 'config.yaml', type: 'file', size: '1.2KB' },
          { name: 'pyproject.toml', type: 'file', size: '0.8KB' },
        ]},
      ]
    },
  },
  {
    id: 'ha-002',
    name: 'code-review-agent',
    description: '代码审查 Agent，自动对 PR 进行 review',
    version: 'v1.3.2',
    status: 'Paused',
    owner: 'zhangsan',
    cluster: 'cls-dev-cluster-2',
    createdAt: ts(10),
    updatedAt: ts(3),
    lastRunAt: ts(3),
    model: 'claude-sonnet-4',
    prompt: '你是一个资深代码审查专家。请对提交的代码进行全面审查，关注安全性、性能和代码风格。',
    endpoint: 'http://code-review:8081',
    concurrency: 3,
    timeout: 180,
    retry: 2,
    memoryEnabled: false,
    memorySpace: '',
    skills: ['code-analysis', 'security-scan'],
    imType: '飞书',
    imConfig: { webhookUrl: 'https://open.feishu.cn/open-apis/bot/v2/hook/xxx' },
    tags: ['dev', 'code-review'],
    replicasMode: 'fixed',
    replicas: 1,
    cpu: 1,
    memory: 2,
    k8sCluster: 'cls-dev-cluster-2',
    events: [
      { time: ts(10), action: '创建', detail: 'Agent 创建成功' },
      { time: ts(10), action: '启动', detail: 'Agent 启动成功' },
      { time: ts(3), action: '暂停', detail: '用户手动暂停' },
    ],
    tasks: [
      { id: 't-004', name: 'PR #142 Review', status: 'Success', time: ts(3, 1), duration: '1m20s' },
      { id: 't-005', name: 'PR #141 Review', status: 'Success', time: ts(4), duration: '55s' },
    ],
    conversations: [
      {
        id: 'conv-003', title: 'PR #142 代码审查', createdAt: ts(3, 1),
        messages: [
          { role: 'user', content: '请审查 PR #142', time: ts(3, 1) },
          { role: 'tool', content: '🔧 调用 code-analysis … 分析 12 个文件变更\n🔧 调用 security-scan … 未发现安全风险', time: ts(3, 1) },
          { role: 'assistant', content: '## PR #142 审查结果\n\n✅ 无安全风险\n⚠️ 2 个建议优化项\n\n### 建议\n1. `utils.js:45` — 建议使用 `const` 替代 `let`\n2. `api.js:120` — 建议添加错误边界处理', time: ts(3, 1) },
        ]
      },
    ],
    workspace: {
      files: [
        { name: 'workspace', type: 'folder', children: [
          { name: 'reviews', type: 'folder', children: [
            { name: 'PR_142_review.md', type: 'file', size: '1.5KB' },
          ]},
          { name: 'config.yaml', type: 'file', size: '0.9KB' },
        ]},
      ]
    },
  },
  {
    id: 'ha-003',
    name: 'customer-support-bot',
    description: '客户支持 Agent，处理工单和FAQ',
    version: 'v3.0.1',
    status: 'Stopped',
    owner: 'lisi',
    cluster: 'cls-prod-cluster-1',
    createdAt: ts(30),
    updatedAt: ts(5),
    lastRunAt: ts(5),
    model: 'qwen-turbo',
    prompt: '你是一名友善的客户支持专员。请根据知识库内容解答用户问题。',
    endpoint: '',
    concurrency: 10,
    timeout: 60,
    retry: 1,
    memoryEnabled: true,
    memorySpace: 'support-mem-01',
    skills: ['faq-retrieval', 'ticket-manager'],
    imType: '钉钉',
    imConfig: { webhookUrl: 'https://oapi.dingtalk.com/robot/send?access_token=xxx' },
    tags: ['support', 'production'],
    replicasMode: 'elastic',
    replicas: 3,
    cpu: 2,
    memory: 4,
    k8sCluster: 'cls-prod-cluster-1',
    events: [
      { time: ts(30), action: '创建', detail: 'Agent 创建成功' },
      { time: ts(29), action: '启动', detail: 'Agent 启动成功' },
      { time: ts(5), action: '停止', detail: '维护期间停止' },
    ],
    tasks: [
      { id: 't-006', name: '工单 #2891 处理', status: 'Success', time: ts(5, 1), duration: '12s' },
    ],
    conversations: [],
    workspace: { files: [{ name: 'workspace', type: 'folder', children: [{ name: 'config.yaml', type: 'file', size: '0.7KB' }] }] },
  },
  {
    id: 'ha-004',
    name: 'data-pipeline-agent',
    description: '数据流水线 Agent，负责 ETL 任务调度',
    version: 'v1.0.0-beta',
    status: 'Error',
    owner: 'wangwu',
    cluster: 'cls-prod-cluster-1',
    createdAt: ts(7),
    updatedAt: ts(0, 6),
    lastRunAt: ts(0, 6),
    model: 'gemini-2.5-pro',
    prompt: '你是数据工程专家。负责协调数据抽取、转换和加载流程。',
    endpoint: 'http://data-pipeline:8082',
    concurrency: 8,
    timeout: 300,
    retry: 5,
    memoryEnabled: true,
    memorySpace: 'pipeline-mem-01',
    skills: ['sql-executor', 'data-validator', 'schema-migrator'],
    imType: '自定义 Webhook',
    imConfig: { webhookUrl: 'https://internal.example.com/alerts' },
    tags: ['data', 'etl', 'critical'],
    replicasMode: 'fixed',
    replicas: 2,
    cpu: 4,
    memory: 8,
    k8sCluster: 'cls-prod-cluster-1',
    events: [
      { time: ts(7), action: '创建', detail: 'Agent 创建成功' },
      { time: ts(7), action: '启动', detail: 'Agent 启动成功' },
      { time: ts(0, 6), action: '错误', detail: 'OOM Killed: 内存超限，Pod 被驱逐' },
    ],
    tasks: [
      { id: 't-007', name: '日增量同步', status: 'Failed', time: ts(0, 6), duration: '5m30s' },
      { id: 't-008', name: '日增量同步', status: 'Success', time: ts(1, 6), duration: '4m15s' },
    ],
    conversations: [],
    workspace: { files: [{ name: 'workspace', type: 'folder', children: [{ name: 'config.yaml', type: 'file', size: '1.1KB' }] }] },
  },
  {
    id: 'ha-005',
    name: 'meeting-assistant',
    description: '会议助手 Agent，自动记录、总结和分配待办',
    version: 'v2.0.0',
    status: 'Draft',
    owner: 'admin',
    cluster: '',
    createdAt: ts(1),
    updatedAt: ts(1),
    lastRunAt: '',
    model: 'gpt-4o-mini',
    prompt: '你是一个高效的会议助手。负责记录会议要点、生成会议纪要并分配行动项。',
    endpoint: '',
    concurrency: 2,
    timeout: 90,
    retry: 2,
    memoryEnabled: false,
    memorySpace: '',
    skills: ['speech-to-text', 'summarizer'],
    imType: '飞书',
    imConfig: { webhookUrl: '' },
    tags: ['meeting', 'draft'],
    replicasMode: 'fixed',
    replicas: 1,
    cpu: 1,
    memory: 2,
    k8sCluster: '',
    events: [
      { time: ts(1), action: '创建', detail: 'Agent 创建成功（草稿）' },
    ],
    tasks: [],
    conversations: [],
    workspace: { files: [{ name: 'workspace', type: 'folder', children: [] }] },
  },
]

// ========== Reducer ==========
function agentReducer(state, action) {
  switch (action.type) {
    case 'CREATE': {
      const newAgent = {
        ...action.payload,
        id: `ha-${String(_nextId++).padStart(3, '0')}`,
        status: 'Draft',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        lastRunAt: '',
        events: [{ time: new Date().toISOString().replace('T', ' ').slice(0, 19), action: '创建', detail: 'Agent 创建成功（草稿）' }],
        tasks: [],
        conversations: [],
        workspace: { files: [{ name: 'workspace', type: 'folder', children: [] }] },
      }
      return [...state, newAgent]
    }
    case 'UPDATE': {
      return state.map(a => a.id === action.id
        ? { ...a, ...action.payload, updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) }
        : a
      )
    }
    case 'DELETE': {
      return state.filter(a => a.id !== action.id)
    }
    case 'CHANGE_STATUS': {
      const { id, newStatus } = action
      return state.map(a => {
        if (a.id !== id) return a
        if (!canTransition(a.status, newStatus)) return a
        const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
        const statusLabels = { Running: '启动', Paused: '暂停', Stopped: '停止', Error: '错误' }
        const evt = { time: now, action: statusLabels[newStatus] || newStatus, detail: `Agent 状态变更为 ${newStatus}` }
        return {
          ...a,
          status: newStatus,
          updatedAt: now,
          lastRunAt: newStatus === 'Running' ? now : a.lastRunAt,
          events: [...a.events, evt],
        }
      })
    }
    case 'ADD_EVENT': {
      return state.map(a => {
        if (a.id !== action.id) return a
        return { ...a, events: [...a.events, action.event] }
      })
    }
    case 'ADD_TASK': {
      return state.map(a => {
        if (a.id !== action.id) return a
        return { ...a, tasks: [action.task, ...a.tasks], lastRunAt: action.task.time }
      })
    }
    case 'ADD_CONVERSATION': {
      return state.map(a => {
        if (a.id !== action.id) return a
        return { ...a, conversations: [action.conversation, ...(a.conversations || [])] }
      })
    }
    case 'ADD_MESSAGE': {
      return state.map(a => {
        if (a.id !== action.agentId) return a
        return {
          ...a,
          conversations: (a.conversations || []).map(c =>
            c.id === action.convId ? { ...c, messages: [...c.messages, action.message] } : c
          )
        }
      })
    }
    default:
      return state
  }
}

// ========== Context ==========
const AgentContext = createContext(null)

export function HarnessAgentProvider({ children }) {
  const [agents, dispatch] = useReducer(agentReducer, INITIAL_AGENTS)
  const [globalTags, setGlobalTags] = useState(INITIAL_TAGS)
  return (
    <AgentContext.Provider value={{ agents, dispatch, globalTags, setGlobalTags }}>
      {children}
    </AgentContext.Provider>
  )
}

export function useHarnessAgents() {
  const ctx = useContext(AgentContext)
  if (!ctx) throw new Error('useHarnessAgents must be used within HarnessAgentProvider')
  return ctx
}

// ========== Constants ==========
export const VERSIONS = ['v1.0.0', 'v1.0.0-beta', 'v1.3.2', 'v2.0.0', 'v2.1.0', 'v3.0.1']
export const STATUS_LIST = ['Draft', 'Running', 'Paused', 'Stopped', 'Error']
export const IM_TYPES = ['企业微信', '飞书', '钉钉', '自定义 Webhook']
export const SKILL_OPTIONS = [
  'web-search', 'doc-parser', 'summarizer', 'code-analysis',
  'security-scan', 'faq-retrieval', 'ticket-manager', 'sql-executor',
  'data-validator', 'schema-migrator', 'speech-to-text', 'image-gen',
]
export const INITIAL_TAGS = ['production', 'daily', '信息摘要', 'dev', 'code-review', 'support', 'data', 'etl', 'critical', 'meeting', 'draft']
