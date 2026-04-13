import { createContext, useContext, useReducer } from 'react'

// ========== Helpers ==========
let _agentNextId = 1
let _envNextId = 1
let _sessionNextId = 1
let _toolNextId = 1
let _secretNextId = 1
let _mcpNextId = 1
let _approvalNextId = 1
let _auditNextId = 1

function ts(daysAgo = 0, hoursAgo = 0) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(d.getHours() - hoursAgo)
  return d.toISOString().replace('T', ' ').slice(0, 19)
}

// ========== Mock Data ==========

const INITIAL_ENVIRONMENTS = [
  {
    id: 'env-001',
    name: 'Python 3.12 Standard',
    baseImage: 'python:3.12-slim',
    runtime: 'python',
    dependencies: ['requests', 'beautifulsoup4', 'pandas', 'numpy'],
    networkPolicy: { mode: 'allowlist', allowDomains: ['api.github.com', 'pypi.org'], allowIPs: [] },
    fileMounts: [{ source: '/data/shared', target: '/workspace/data', readOnly: true }],
    envVars: [{ key: 'PYTHON_ENV', value: 'production' }],
    workDir: '/workspace',
    status: 'healthy',
    lastHealthCheck: ts(0, 1),
    createdAt: ts(14),
    sessionsCount: 12,
    description: '标准 Python 运行环境，适合数据处理和 API 调用',
  },
  {
    id: 'env-002',
    name: 'Node.js 20 Dev',
    baseImage: 'node:20-slim',
    runtime: 'node',
    dependencies: ['axios', 'cheerio', 'lodash'],
    networkPolicy: { mode: 'allow_all', allowDomains: [], allowIPs: [] },
    fileMounts: [],
    envVars: [{ key: 'NODE_ENV', value: 'development' }],
    workDir: '/app',
    status: 'healthy',
    lastHealthCheck: ts(0, 2),
    createdAt: ts(7),
    sessionsCount: 5,
    description: 'Node.js 开发环境，支持 TypeScript',
  },
  {
    id: 'env-003',
    name: 'Go 1.22 Build',
    baseImage: 'golang:1.22-alpine',
    runtime: 'go',
    dependencies: [],
    networkPolicy: { mode: 'deny_all', allowDomains: [], allowIPs: [] },
    fileMounts: [],
    envVars: [],
    workDir: '/go/src/app',
    status: 'unhealthy',
    lastHealthCheck: ts(1),
    createdAt: ts(10),
    sessionsCount: 2,
    description: 'Go 构建环境，适用于代码编译和测试',
  },
]

const BUILTIN_TOOLS = [
  { id: 'bt-bash', name: 'bash', type: 'builtin', description: '执行 shell 命令', riskLevel: 'high', approvalRequired: true, category: 'Execution' },
  { id: 'bt-read', name: 'read_file', type: 'builtin', description: '读取文件内容', riskLevel: 'low', approvalRequired: false, category: 'File' },
  { id: 'bt-write', name: 'write_file', type: 'builtin', description: '写入文件内容', riskLevel: 'high', approvalRequired: true, category: 'File' },
  { id: 'bt-edit', name: 'edit_file', type: 'builtin', description: '编辑文件（查找替换）', riskLevel: 'medium', approvalRequired: false, category: 'File' },
  { id: 'bt-glob', name: 'glob', type: 'builtin', description: '按模式匹配查找文件', riskLevel: 'low', approvalRequired: false, category: 'Search' },
  { id: 'bt-grep', name: 'grep', type: 'builtin', description: '在文件中搜索内容', riskLevel: 'low', approvalRequired: false, category: 'Search' },
  { id: 'bt-fetch', name: 'web_fetch', type: 'builtin', description: '获取 URL 内容', riskLevel: 'medium', approvalRequired: false, category: 'Network' },
  { id: 'bt-search', name: 'web_search', type: 'builtin', description: '搜索互联网信息', riskLevel: 'low', approvalRequired: false, category: 'Network' },
]

const CUSTOM_TOOLS = [
  { id: 'ct-001', name: 'sql_query', namespace: 'db', type: 'custom', description: '执行 SQL 查询并返回结果', riskLevel: 'high', approvalRequired: true, endpoint: 'https://api.internal.com/sql', executionType: 'webhook', status: 'active', createdAt: ts(10) },
  { id: 'ct-002', name: 'send_email', namespace: 'comms', type: 'custom', description: '发送电子邮件', riskLevel: 'medium', approvalRequired: true, endpoint: 'https://api.internal.com/email', executionType: 'webhook', status: 'active', createdAt: ts(8) },
  { id: 'ct-003', name: 'jira_create', namespace: 'pm', type: 'custom', description: '在 Jira 中创建工单', riskLevel: 'low', approvalRequired: false, endpoint: 'https://api.internal.com/jira', executionType: 'webhook', status: 'active', createdAt: ts(5) },
]

const INITIAL_AGENTS = [
  {
    id: 'ma-001',
    name: 'research-analyst',
    description: '深度研究分析 Agent，自动收集、整理和分析行业信息',
    systemPrompt: '你是一个专业的研究分析助手。你的职责是:\n1. 根据用户的研究需求，制定搜索策略\n2. 收集相关信息并进行交叉验证\n3. 生成结构化的研究报告\n\n注意：\n- 始终标注信息来源\n- 区分事实和观点\n- 给出置信度评估',
    model: { provider: 'platform', modelId: 'gpt-4o', temperature: 0.3, maxTokens: 8192 },
    visibility: 'team',
    owner: 'admin',
    tags: ['research', 'production'],
    tools: ['bt-bash', 'bt-read', 'bt-write', 'bt-search', 'bt-fetch', 'bt-grep'],
    skills: ['web-research', 'data-analysis', 'report-generation'],
    mcpServers: [],
    environmentId: 'env-001',
    currentVersion: 'v1.2.0',
    status: 'published',
    versions: [
      { id: 'v-001', version: 'v1.2.0', changelog: '增加交叉验证能力', publishedAt: ts(2), publishedBy: 'admin', isCurrent: true },
      { id: 'v-002', version: 'v1.1.0', changelog: '优化搜索策略', publishedAt: ts(7), publishedBy: 'admin', isCurrent: false },
      { id: 'v-003', version: 'v1.0.0', changelog: '初始版本', publishedAt: ts(14), publishedBy: 'admin', isCurrent: false },
    ],
    metadata: { department: 'research', priority: 'high' },
    createdAt: ts(14),
    updatedAt: ts(2),
    lastRunAt: ts(0, 3),
  },
  {
    id: 'ma-002',
    name: 'code-architect',
    description: '代码架构助手，帮助团队进行代码审查和架构设计',
    systemPrompt: '你是一个资深的软件架构师。你会帮助团队进行代码审查、架构设计和技术方案评估。',
    model: { provider: 'custom', modelId: 'claude-sonnet-4', temperature: 0.2, maxTokens: 16384 },
    visibility: 'workspace',
    owner: 'zhangsan',
    tags: ['development', 'code-review'],
    tools: ['bt-bash', 'bt-read', 'bt-write', 'bt-edit', 'bt-glob', 'bt-grep'],
    skills: ['code-analysis', 'architecture-review'],
    mcpServers: ['mcp-001'],
    environmentId: 'env-002',
    currentVersion: 'v2.0.0',
    status: 'published',
    versions: [
      { id: 'v-004', version: 'v2.0.0', changelog: '支持多语言架构分析', publishedAt: ts(1), publishedBy: 'zhangsan', isCurrent: true },
      { id: 'v-005', version: 'v1.0.0', changelog: '初始版本', publishedAt: ts(10), publishedBy: 'zhangsan', isCurrent: false },
    ],
    metadata: { team: 'backend' },
    createdAt: ts(10),
    updatedAt: ts(1),
    lastRunAt: ts(0, 5),
  },
  {
    id: 'ma-003',
    name: 'data-pipeline-manager',
    description: '数据管道管理 Agent，负责 ETL 任务监控和异常处理',
    systemPrompt: '你是一个数据管道运维专家。负责监控 ETL 任务、处理异常、优化数据流。',
    model: { provider: 'platform', modelId: 'glm-4-plus', temperature: 0.1, maxTokens: 4096 },
    visibility: 'team',
    owner: 'lisi',
    tags: ['data', 'etl', 'ops'],
    tools: ['bt-bash', 'bt-read', 'bt-grep', 'ct-001'],
    skills: ['sql-ops', 'pipeline-monitor'],
    mcpServers: [],
    environmentId: 'env-001',
    currentVersion: 'v1.0.0',
    status: 'draft',
    versions: [
      { id: 'v-006', version: 'v1.0.0', changelog: '初始版本', publishedAt: ts(3), publishedBy: 'lisi', isCurrent: true },
    ],
    metadata: {},
    createdAt: ts(3),
    updatedAt: ts(1),
    lastRunAt: '',
  },
  {
    id: 'ma-004',
    name: 'security-scanner',
    description: '安全扫描 Agent，自动化代码安全审计和漏洞检测',
    systemPrompt: '你是一个安全审计专家。扫描代码库，识别安全漏洞、依赖风险和配置问题。',
    model: { provider: 'platform', modelId: 'gpt-4o', temperature: 0.0, maxTokens: 8192 },
    visibility: 'private',
    owner: 'wangwu',
    tags: ['security', 'audit'],
    tools: ['bt-bash', 'bt-read', 'bt-glob', 'bt-grep'],
    skills: ['security-scan', 'dependency-audit'],
    mcpServers: [],
    environmentId: 'env-003',
    currentVersion: 'v0.5.0-beta',
    status: 'draft',
    versions: [
      { id: 'v-007', version: 'v0.5.0-beta', changelog: 'Beta 版本', publishedAt: ts(1), publishedBy: 'wangwu', isCurrent: true },
    ],
    metadata: {},
    createdAt: ts(1),
    updatedAt: ts(1),
    lastRunAt: '',
  },
]

const INITIAL_SESSIONS = [
  {
    id: 'sess-001',
    agentId: 'ma-001',
    agentName: 'research-analyst',
    agentVersion: 'v1.2.0',
    environmentId: 'env-001',
    environmentName: 'Python 3.12 Standard',
    status: 'idle',
    createdBy: 'admin',
    tags: ['research', 'ai-industry'],
    tokenUsage: { input: 12450, output: 8920, total: 21370 },
    cost: 0.42,
    duration: 345,
    startedAt: ts(0, 3),
    lastEventAt: ts(0, 2),
    endedAt: null,
    threads: [
      { id: 'th-001', title: 'AI 行业趋势分析', status: 'active', createdAt: ts(0, 3) },
    ],
    events: [
      { id: 'evt-001', sessionId: 'sess-001', threadId: 'th-001', type: 'user.message', payload: { content: '请分析 2026 年 AI 行业的三大趋势' }, timestamp: ts(0, 3), metadata: {} },
      { id: 'evt-002', sessionId: 'sess-001', threadId: 'th-001', type: 'agent.message', payload: { content: '好的，我来为你搜索最新的 AI 行业动态。让我先收集相关信息...' }, timestamp: ts(0, 3, 1), metadata: {} },
      { id: 'evt-003', sessionId: 'sess-001', threadId: 'th-001', type: 'tool_use', payload: { tool: 'web_search', args: { query: '2026 AI industry trends' }, status: 'running' }, timestamp: ts(0, 3, 2), metadata: { riskLevel: 'low' } },
      { id: 'evt-004', sessionId: 'sess-001', threadId: 'th-001', type: 'tool_result', payload: { tool: 'web_search', result: '找到 15 条相关结果', status: 'completed', duration: 1200 }, timestamp: ts(0, 3, 2), metadata: {} },
      { id: 'evt-005', sessionId: 'sess-001', threadId: 'th-001', type: 'tool_use', payload: { tool: 'web_fetch', args: { url: 'https://example.com/ai-report-2026' }, status: 'running' }, timestamp: ts(0, 3, 3), metadata: { riskLevel: 'medium' } },
      { id: 'evt-006', sessionId: 'sess-001', threadId: 'th-001', type: 'tool_result', payload: { tool: 'web_fetch', result: '获取到 2400 字报告内容', status: 'completed', duration: 2300 }, timestamp: ts(0, 3, 3), metadata: {} },
      { id: 'evt-007', sessionId: 'sess-001', threadId: 'th-001', type: 'agent.message', payload: { content: '# 2026 年 AI 行业三大趋势\n\n## 1. Agent 原生应用崛起\n企业级 Agent 平台成为主流，从 Copilot 转向完全自主的 Agent Runtime...\n\n## 2. 多模态融合深化\n视觉、语音、代码、结构化数据的统一处理能力大幅提升...\n\n## 3. AI 治理与合规\n全球 AI 监管框架逐步成型，企业级治理工具需求激增...' }, timestamp: ts(0, 2, 5), metadata: {} },
    ],
    artifacts: [
      { id: 'art-001', name: 'AI_trends_2026.md', type: 'file', size: '4.2KB', mimeType: 'text/markdown', createdAt: ts(0, 2) },
    ],
  },
  {
    id: 'sess-002',
    agentId: 'ma-002',
    agentName: 'code-architect',
    agentVersion: 'v2.0.0',
    environmentId: 'env-002',
    environmentName: 'Node.js 20 Dev',
    status: 'running',
    createdBy: 'zhangsan',
    tags: ['code-review'],
    tokenUsage: { input: 8200, output: 4500, total: 12700 },
    cost: 0.28,
    duration: 120,
    startedAt: ts(0, 1),
    lastEventAt: ts(0, 0, 5),
    endedAt: null,
    threads: [
      { id: 'th-002', title: 'PR #287 架构审查', status: 'active', createdAt: ts(0, 1) },
    ],
    events: [
      { id: 'evt-010', sessionId: 'sess-002', threadId: 'th-002', type: 'user.message', payload: { content: '请审查 PR #287 的架构变更' }, timestamp: ts(0, 1), metadata: {} },
      { id: 'evt-011', sessionId: 'sess-002', threadId: 'th-002', type: 'agent.message', payload: { content: '我来分析这个 PR 的变更...' }, timestamp: ts(0, 1, 1), metadata: {} },
      { id: 'evt-012', sessionId: 'sess-002', threadId: 'th-002', type: 'tool_use', payload: { tool: 'bash', args: { command: 'gh pr diff 287' }, status: 'running' }, timestamp: ts(0, 0, 5), metadata: { riskLevel: 'high' } },
    ],
    artifacts: [],
  },
  {
    id: 'sess-003',
    agentId: 'ma-001',
    agentName: 'research-analyst',
    agentVersion: 'v1.2.0',
    environmentId: 'env-001',
    environmentName: 'Python 3.12 Standard',
    status: 'waiting_approval',
    createdBy: 'admin',
    tags: ['research'],
    tokenUsage: { input: 5600, output: 3200, total: 8800 },
    cost: 0.18,
    duration: 89,
    startedAt: ts(0, 0, 30),
    lastEventAt: ts(0, 0, 10),
    endedAt: null,
    threads: [
      { id: 'th-003', title: '竞品分析报告', status: 'active', createdAt: ts(0, 0, 30) },
    ],
    events: [
      { id: 'evt-020', sessionId: 'sess-003', threadId: 'th-003', type: 'user.message', payload: { content: '帮我生成竞品分析报告，保存到文件' }, timestamp: ts(0, 0, 30), metadata: {} },
      { id: 'evt-021', sessionId: 'sess-003', threadId: 'th-003', type: 'agent.message', payload: { content: '好的，我正在搜索竞品信息...' }, timestamp: ts(0, 0, 28), metadata: {} },
      { id: 'evt-022', sessionId: 'sess-003', threadId: 'th-003', type: 'tool_use', payload: { tool: 'write_file', args: { path: '/workspace/competitor_report.md', content: '# 竞品分析...' }, status: 'waiting_approval' }, timestamp: ts(0, 0, 10), metadata: { riskLevel: 'high' } },
    ],
    artifacts: [],
  },
  {
    id: 'sess-004',
    agentId: 'ma-003',
    agentName: 'data-pipeline-manager',
    agentVersion: 'v1.0.0',
    environmentId: 'env-001',
    environmentName: 'Python 3.12 Standard',
    status: 'failed',
    createdBy: 'lisi',
    tags: ['etl', 'error'],
    tokenUsage: { input: 2100, output: 800, total: 2900 },
    cost: 0.06,
    duration: 45,
    startedAt: ts(1, 2),
    lastEventAt: ts(1, 2),
    endedAt: ts(1, 2),
    threads: [
      { id: 'th-004', title: 'ETL 异常处理', status: 'completed', createdAt: ts(1, 2) },
    ],
    events: [
      { id: 'evt-030', sessionId: 'sess-004', threadId: 'th-004', type: 'user.message', payload: { content: '检查昨晚的增量同步任务' }, timestamp: ts(1, 2), metadata: {} },
      { id: 'evt-031', sessionId: 'sess-004', threadId: 'th-004', type: 'tool_use', payload: { tool: 'sql_query', args: { query: 'SELECT * FROM etl_logs WHERE date = CURRENT_DATE - 1' }, status: 'running' }, timestamp: ts(1, 2), metadata: { riskLevel: 'high' } },
      { id: 'evt-032', sessionId: 'sess-004', threadId: 'th-004', type: 'tool_result', payload: { tool: 'sql_query', result: null, error: 'Connection timeout: database unavailable', status: 'failed', duration: 30000 }, timestamp: ts(1, 2), metadata: {} },
      { id: 'evt-033', sessionId: 'sess-004', threadId: 'th-004', type: 'status', payload: { status: 'failed', reason: 'Tool execution failed: database connection timeout' }, timestamp: ts(1, 2), metadata: {} },
    ],
    artifacts: [],
  },
  {
    id: 'sess-005',
    agentId: 'ma-002',
    agentName: 'code-architect',
    agentVersion: 'v1.0.0',
    environmentId: 'env-002',
    environmentName: 'Node.js 20 Dev',
    status: 'completed',
    createdBy: 'zhangsan',
    tags: ['review'],
    tokenUsage: { input: 15000, output: 6200, total: 21200 },
    cost: 0.38,
    duration: 540,
    startedAt: ts(2),
    lastEventAt: ts(2),
    endedAt: ts(2),
    threads: [
      { id: 'th-005', title: '微服务拆分方案评审', status: 'completed', createdAt: ts(2) },
    ],
    events: [
      { id: 'evt-040', sessionId: 'sess-005', threadId: 'th-005', type: 'user.message', payload: { content: '评审我们的微服务拆分方案' }, timestamp: ts(2), metadata: {} },
      { id: 'evt-041', sessionId: 'sess-005', threadId: 'th-005', type: 'agent.message', payload: { content: '## 微服务拆分方案评审\n\n### 总体评价\n方案整体合理，但有以下建议...\n\n### 建议调整\n1. 用户服务拆分过细，建议合并\n2. 订单服务需要增加 saga 模式\n3. 建议增加 API Gateway 层' }, timestamp: ts(2), metadata: {} },
    ],
    artifacts: [
      { id: 'art-005', name: 'microservice_review.md', type: 'file', size: '8.5KB', mimeType: 'text/markdown', createdAt: ts(2) },
    ],
  },
]

const INITIAL_SECRETS = [
  { id: 'sec-001', name: 'OpenAI API Key', scope: 'workspace', type: 'api_key', description: 'OpenAI GPT-4 API 密钥', maskedValue: 'sk-****7xKj', lastRotatedAt: ts(5), usageCount: 234, createdAt: ts(30) },
  { id: 'sec-002', name: 'GitHub Token', scope: 'user', type: 'token', description: 'GitHub 个人访问令牌', maskedValue: 'ghp_****mN3p', lastRotatedAt: ts(10), usageCount: 89, createdAt: ts(25) },
  { id: 'sec-003', name: 'Database Connection', scope: 'workspace', type: 'password', description: '生产数据库连接串', maskedValue: '****wXrT', lastRotatedAt: ts(2), usageCount: 456, createdAt: ts(20) },
  { id: 'sec-004', name: 'Slack Webhook', scope: 'workspace', type: 'token', description: 'Slack 通知 Webhook URL', maskedValue: '****kL9v', lastRotatedAt: ts(15), usageCount: 120, createdAt: ts(18) },
]

const INITIAL_MCPS = [
  { id: 'mcp-001', name: 'GitHub MCP', endpoint: 'https://mcp.github.internal', authType: 'oauth', status: 'connected', availableTools: 12, lastSyncAt: ts(0, 1), description: 'GitHub 代码仓库集成' },
  { id: 'mcp-002', name: 'Jira MCP', endpoint: 'https://mcp.jira.internal', authType: 'api_key', status: 'connected', availableTools: 8, lastSyncAt: ts(0, 3), description: 'Jira 项目管理集成' },
  { id: 'mcp-003', name: 'Slack MCP', endpoint: 'https://mcp.slack.internal', authType: 'oauth', status: 'disconnected', availableTools: 6, lastSyncAt: ts(3), description: 'Slack 通讯集成' },
]

const INITIAL_APPROVALS = [
  { id: 'appr-001', sessionId: 'sess-003', sessionAgentName: 'research-analyst', toolExecutionId: 'te-001', toolName: 'write_file', arguments: { path: '/workspace/competitor_report.md', content: '# 竞品分析报告\n...(约 2000 字)' }, riskLevel: 'high', requestedAt: ts(0, 0, 10), status: 'pending', reviewedBy: null, reviewedAt: null, comment: null, expiresAt: ts(-1) },
]

const INITIAL_AUDIT_LOGS = [
  { id: 'aud-001', userId: 'admin', userName: 'Admin', action: 'agent.create', resourceType: 'Agent', resourceId: 'ma-001', resourceName: 'research-analyst', result: 'success', ipAddress: '10.0.1.100', timestamp: ts(14), metadata: {} },
  { id: 'aud-002', userId: 'admin', userName: 'Admin', action: 'agent.publish', resourceType: 'AgentVersion', resourceId: 'v-001', resourceName: 'v1.2.0', result: 'success', ipAddress: '10.0.1.100', timestamp: ts(2), metadata: {} },
  { id: 'aud-003', userId: 'zhangsan', userName: '张三', action: 'session.create', resourceType: 'Session', resourceId: 'sess-002', resourceName: 'PR #287 架构审查', result: 'success', ipAddress: '10.0.1.101', timestamp: ts(0, 1), metadata: {} },
  { id: 'aud-004', userId: 'admin', userName: 'Admin', action: 'secret.rotate', resourceType: 'Secret', resourceId: 'sec-001', resourceName: 'OpenAI API Key', result: 'success', ipAddress: '10.0.1.100', timestamp: ts(5), metadata: {} },
  { id: 'aud-005', userId: 'lisi', userName: '李四', action: 'session.create', resourceType: 'Session', resourceId: 'sess-004', resourceName: 'ETL 异常处理', result: 'success', ipAddress: '10.0.1.102', timestamp: ts(1, 2), metadata: {} },
  { id: 'aud-006', userId: 'zhangsan', userName: '张三', action: 'tool.approve', resourceType: 'ToolExecution', resourceId: 'te-002', resourceName: 'bash: gh pr diff 287', result: 'success', ipAddress: '10.0.1.101', timestamp: ts(0, 0, 5), metadata: {} },
  { id: 'aud-007', userId: 'wangwu', userName: '王五', action: 'agent.create', resourceType: 'Agent', resourceId: 'ma-004', resourceName: 'security-scanner', result: 'success', ipAddress: '10.0.1.103', timestamp: ts(1), metadata: {} },
  { id: 'aud-008', userId: 'admin', userName: 'Admin', action: 'environment.update', resourceType: 'Environment', resourceId: 'env-001', resourceName: 'Python 3.12 Standard', result: 'success', ipAddress: '10.0.1.100', timestamp: ts(3), metadata: {} },
]

// ========== Reducer ==========
function managedAgentReducer(state, action) {
  switch (action.type) {
    case 'CREATE_AGENT':
      return {
        ...state,
        agents: [...state.agents, {
          ...action.payload,
          id: `ma-${String(_agentNextId++).padStart(3, '0')}`,
          status: 'draft',
          versions: [],
          currentVersion: 'draft',
          createdAt: ts(0),
          updatedAt: ts(0),
          lastRunAt: '',
        }],
      }
    case 'UPDATE_AGENT':
      return {
        ...state,
        agents: state.agents.map(a => a.id === action.id ? { ...a, ...action.payload, updatedAt: ts(0) } : a),
      }
    case 'DELETE_AGENT':
      return { ...state, agents: state.agents.filter(a => a.id !== action.id) }
    case 'CREATE_ENVIRONMENT':
      return {
        ...state,
        environments: [...state.environments, {
          ...action.payload,
          id: `env-${String(_envNextId++).padStart(3, '0')}`,
          status: 'healthy',
          sessionsCount: 0,
          lastHealthCheck: ts(0),
          createdAt: ts(0),
        }],
      }
    case 'UPDATE_ENVIRONMENT':
      return { ...state, environments: state.environments.map(e => e.id === action.id ? { ...e, ...action.payload } : e) }
    case 'DELETE_ENVIRONMENT':
      return { ...state, environments: state.environments.filter(e => e.id !== action.id) }
    case 'CREATE_SESSION':
      return {
        ...state,
        sessions: [...state.sessions, {
          ...action.payload,
          id: `sess-${String(_sessionNextId++).padStart(3, '0')}`,
          status: 'running',
          tokenUsage: { input: 0, output: 0, total: 0 },
          cost: 0,
          duration: 0,
          startedAt: ts(0),
          lastEventAt: ts(0),
          endedAt: null,
          threads: [{ id: `th-new-${Date.now()}`, title: '新会话', status: 'active', createdAt: ts(0) }],
          events: [],
          artifacts: [],
        }],
      }
    case 'UPDATE_SESSION':
      return { ...state, sessions: state.sessions.map(s => s.id === action.id ? { ...s, ...action.payload } : s) }
    case 'CREATE_SECRET':
      return {
        ...state,
        secrets: [...state.secrets, {
          ...action.payload,
          id: `sec-${String(_secretNextId++).padStart(3, '0')}`,
          maskedValue: '****' + Math.random().toString(36).slice(2, 6),
          usageCount: 0,
          lastRotatedAt: ts(0),
          createdAt: ts(0),
        }],
      }
    case 'DELETE_SECRET':
      return { ...state, secrets: state.secrets.filter(s => s.id !== action.id) }
    case 'CREATE_MCP':
      return {
        ...state,
        mcps: [...state.mcps, {
          ...action.payload,
          id: `mcp-${String(_mcpNextId++).padStart(3, '0')}`,
          status: 'disconnected',
          availableTools: 0,
          lastSyncAt: '',
        }],
      }
    case 'DELETE_MCP':
      return { ...state, mcps: state.mcps.filter(m => m.id !== action.id) }
    case 'UPDATE_MCP':
      return { ...state, mcps: state.mcps.map(m => m.id === action.id ? { ...m, ...action.payload } : m) }
    case 'RESOLVE_APPROVAL':
      return {
        ...state,
        approvals: state.approvals.map(a => a.id === action.id ? { ...a, status: action.status, reviewedBy: action.reviewer, reviewedAt: ts(0) } : a),
      }
    default:
      return state
  }
}

const INITIAL_STATE = {
  agents: INITIAL_AGENTS,
  environments: INITIAL_ENVIRONMENTS,
  sessions: INITIAL_SESSIONS,
  secrets: INITIAL_SECRETS,
  mcps: INITIAL_MCPS,
  approvals: INITIAL_APPROVALS,
  auditLogs: INITIAL_AUDIT_LOGS,
}

// ========== Context ==========
const ManagedAgentContext = createContext(null)

export function ManagedAgentProvider({ children }) {
  const [state, dispatch] = useReducer(managedAgentReducer, INITIAL_STATE)
  return (
    <ManagedAgentContext.Provider value={{ ...state, dispatch }}>
      {children}
    </ManagedAgentContext.Provider>
  )
}

export function useManagedAgents() {
  const ctx = useContext(ManagedAgentContext)
  if (!ctx) throw new Error('useManagedAgents must be used within ManagedAgentProvider')
  return ctx
}

// ========== Constants ==========
export const AGENT_STATUS_COLORS = {
  published: { bg: '#f6ffed', color: '#52c41a', border: '#b7eb8f', label: '已发布' },
  draft: { bg: '#f5f5f5', color: '#595959', border: '#d9d9d9', label: '草稿' },
  deprecated: { bg: '#fff2e8', color: '#fa8c16', border: '#ffd8bf', label: '已弃用' },
  archived: { bg: '#f0f0f0', color: '#8c8c8c', border: '#d9d9d9', label: '已归档' },
}

export const SESSION_STATUS_COLORS = {
  running: { bg: '#e6f7ff', color: '#1890ff', border: '#91d5ff', label: '运行中' },
  idle: { bg: '#f6ffed', color: '#52c41a', border: '#b7eb8f', label: '空闲' },
  waiting_approval: { bg: '#fff2e8', color: '#fa8c16', border: '#ffd8bf', label: '等待审批' },
  completed: { bg: '#f5f5f5', color: '#595959', border: '#d9d9d9', label: '已完成' },
  failed: { bg: '#fff2f0', color: '#ff4d4f', border: '#ffccc7', label: '失败' },
  created: { bg: '#e6f7ff', color: '#1890ff', border: '#91d5ff', label: '已创建' },
}

export const RISK_LEVEL_COLORS = {
  low: { bg: '#f6ffed', color: '#52c41a', border: '#b7eb8f', label: '低' },
  medium: { bg: '#fffbe6', color: '#faad14', border: '#ffe58f', label: '中' },
  high: { bg: '#fff2e8', color: '#fa8c16', border: '#ffd8bf', label: '高' },
  critical: { bg: '#fff2f0', color: '#ff4d4f', border: '#ffccc7', label: '极高' },
}

export const EVENT_TYPE_ICONS = {
  'user.message': '👤',
  'agent.message': '🤖',
  'tool_use': '🔧',
  'tool_result': '📋',
  'status': '📊',
  'approval': '🔒',
  'custom': '⚡',
}

export const EVENT_TYPE_LABELS = {
  'user.message': '用户消息',
  'agent.message': 'Agent 回复',
  'tool_use': '工具调用',
  'tool_result': '工具结果',
  'status': '状态变更',
  'approval': '审批事件',
  'custom': '自定义事件',
}
