# Agent Console — 企业级托管 Agent Runtime 平台产品方案

> 版本: v1.0 | 日期: 2026-04-09 | 状态: Draft

---

## 一、Product Vision

### 1.1 产品名称
**Agent Console** (占位名)

### 1.2 产品定位
Agent Console 是一个企业级托管 Agent Runtime 平台。它不是一个聊天机器人，不是单轮 Copilot，而是一个让开发者和企业团队可以创建、配置、运行、监控和治理具备工具调用能力的长期运行 Agent 的完整平台。

### 1.3 目标用户
| 用户群体 | 典型场景 | 核心诉求 |
|---------|---------|---------|
| AI 平台团队 | 管理全公司 Agent 资产 | 统一治理、成本控制、审计合规 |
| 内部工具团队 | 构建自动化工作流 Agent | 工具集成、长时运行、异步任务 |
| 自动化/工作流团队 | 业务流程自动化 | 多步骤编排、审批流、异常处理 |
| SaaS 团队 | 在产品中嵌入 Agent | API 接入、白标定制、会话管理 |

### 1.4 产品目标
1. **快速创建和复用** — 模板化创建 Agent，支持版本管理和克隆
2. **托管环境执行** — 容器化沙箱环境，预装依赖，隔离执行
3. **长时运行和异步** — 支持小时级任务，可暂停/恢复/中断
4. **流式事件回传** — SSE streaming，实时推送 agent.message / tool_use 等事件
5. **工具调用和集成** — 内置工具 + Custom Tools + MCP 外部工具
6. **权限治理** — RBAC + 可选 ABAC，多人协作下细粒度权限
7. **审计监控** — 完整审计日志、成本追踪、可观测性

---

## 二、Product Principles

1. **Runtime First** — 一切设计围绕 Agent 的运行时生命周期，不是围绕对话
2. **Observable by Default** — 每一次工具调用、状态变更、token 消耗都默认可观测
3. **Policy as Code** — 工具权限、网络策略、secret 注入都是声明式配置
4. **Stateful, Not Stateless** — Agent 拥有文件系统、环境变量、会话历史，是有状态的
5. **Human-in-the-Loop** — 高风险操作需要审批，用户可随时 interrupt/steer
6. **Enterprise Grade** — 审计、合规、成本控制、权限隔离是第一天需求

---

## 三、Information Architecture

### 3.1 一级导航

```
Agent Console
├── Overview                 # 工作空间概览 Dashboard
├── Agents                   # Agent 管理（列表 / 创建 / 详情）
│   ├── Agent List
│   ├── Create Agent (Wizard)
│   ├── Agent Detail
│   └── Agent Version Compare
├── Environments             # 环境管理
│   ├── Environment List
│   ├── Create Environment
│   └── Environment Detail
├── Sessions                 # 会话运行
│   ├── Session List
│   └── Session Detail / Live Console ★
├── Events                   # 事件流
│   └── Event Timeline Explorer
├── Tools                    # 工具管理
│   ├── Tool Catalog (内置工具)
│   └── Custom Tool Builder
├── Integrations             # 外部集成
│   └── MCP Providers
├── Secrets                  # 凭证管理
│   └── Secrets Manager
├── Approvals                # 审批队列
│   └── Approvals Queue
├── Analytics                # 数据分析
│   ├── Session Dashboard
│   ├── Tool Usage Dashboard
│   ├── Cost Dashboard
│   └── Per-Agent Analytics
├── Audit                    # 审计日志
│   └── Audit Log Explorer
└── Settings                 # 设置
    ├── Roles & Permissions
    └── Workspace Settings
```

### 3.2 首屏设计
- **Owner/Admin** → Overview Dashboard（全局指标、活跃 session、告警）
- **Builder** → Agents List（核心工作区）
- **Operator** → Sessions List（运维监控）
- **Viewer** → Analytics Dashboard（只读数据）

### 3.3 页面类型分类
| 类型 | 页面 |
|-----|------|
| 列表页 | Agents List, Environments List, Sessions List, Tool Catalog, Secrets, Audit Log |
| 详情页 | Agent Detail, Environment Detail, Session Detail |
| 向导页 | Create Agent Wizard, Custom Tool Builder |
| 实时控制台 | Session Detail / Live Console, Event Timeline |
| Dashboard | Overview, Analytics |
| 队列页 | Approvals Queue |

---

## 四、Object Model

### 4.1 Workspace（工作空间）
- **定义**: 顶层隔离边界，所有资源都属于一个 Workspace
- **关键字段**: id, name, description, owner, members[], createdAt, settings
- **关系**: 1:N → Agent, Environment, Session, Secret, Role
- **生命周期**: 创建 → 邀请成员 → 使用 → 归档
- **UI 呈现**: 顶部 Workspace 选择器

### 4.2 Agent（智能体）
- **定义**: 一个具备 system prompt、模型配置、工具集绑定的可执行 Agent 定义
- **关键字段**: id, name, description, systemPrompt, model, tools[], skills[], mcpServers[], metadata, visibility, owner, createdAt, updatedAt
- **关系**: belongs_to → Workspace; has_many → AgentVersion, Session; has_many → Tool (via binding)
- **生命周期**: Draft → Published → Deprecated → Archived
- **UI 呈现**: Agent List (卡片/列表), Agent Detail (tabs), Create Wizard

### 4.3 Agent Version（版本）
- **定义**: Agent 的一个不可变快照，记录配置变更历史
- **关键字段**: id, agentId, version (semver), config (snapshot), changelog, publishedAt, publishedBy
- **关系**: belongs_to → Agent
- **生命周期**: Created → Published → (optionally) Rolled Back
- **UI 呈现**: Agent Detail → Version Tab, Version Compare 页面

### 4.4 Environment（运行环境）
- **定义**: Agent 运行时的容器化沙箱环境
- **关键字段**: id, name, baseImage, runtime (python/node/go), dependencies[], networkPolicy (allowlist), fileMounts[], workDir, envVars[], secrets[], readOnlyPaths[]
- **关系**: belongs_to → Workspace; referenced_by → Session
- **生命周期**: Created → Healthy → Unhealthy → Deleted
- **UI 呈现**: Environment List, Environment Detail (健康状态、文件树)

### 4.5 Session（会话）
- **定义**: 一次 Agent + Environment 的运行实例，持有完整状态
- **关键字段**: id, agentId, agentVersion, environmentId, status (idle/running/waiting_approval/completed/failed), createdAt, lastEventAt, tokenUsage, cost, tags[], parentThreadId
- **关系**: belongs_to → Agent, Environment; has_many → Event, Thread
- **生命周期**: Created → Running → (Idle ↔ Running) → Completed / Failed
- **UI 呈现**: Session List, Session Detail / Live Console ★

### 4.6 Event（事件）
- **定义**: Session 中的原子事件记录
- **关键字段**: id, sessionId, threadId, type (user.message | agent.message | tool_use | tool_result | status | approval | custom), payload, timestamp, metadata
- **关系**: belongs_to → Session, Thread
- **生命周期**: Emitted → Stored → (可选) Replayed
- **UI 呈现**: Event Timeline (时间线视图), Live Console 实时流

### 4.7 Thread（线程）
- **定义**: Session 内的对话线程，支持子线程/子 Agent
- **关键字段**: id, sessionId, parentThreadId, agentId, title, status, createdAt
- **关系**: belongs_to → Session; has_many → Event; self-referencing → parentThread
- **生命周期**: Created → Active → Paused → Completed
- **UI 呈现**: Session Detail 左侧 thread 列表

### 4.8 Tool（工具定义）
- **定义**: 一个可供 Agent 调用的工具描述
- **关键字段**: id, name, type (builtin|custom|mcp), description, parametersSchema, riskLevel (low|medium|high|critical), approvalRequired, timeout, retryPolicy
- **关系**: referenced_by → Agent (binding), ToolPolicy
- **生命周期**: Registered → Active → Deprecated
- **UI 呈现**: Tool Catalog (分类展示)

### 4.9 Tool Policy（工具策略）
- **定义**: 定义工具在特定 Agent 中的执行策略
- **关键字段**: id, agentId, toolId, allowed, approvalRequired, maxCallsPerSession, rateLimit, allowedParams
- **关系**: belongs_to → Agent, Tool
- **UI 呈现**: Agent Detail → Tools Tab 中的策略配置

### 4.10 Custom Tool（自定义工具）
- **定义**: 用户注册的自定义工具
- **关键字段**: id, name, namespace, description, schema (JSON Schema), executionType (webhook|callback), endpoint, headers, timeout, retryPolicy, idempotent
- **关系**: registered_in → Workspace; bound_to → Agent
- **UI 呈现**: Custom Tool Builder 页面

### 4.11 MCP Server / External Tool Provider
- **定义**: 外部工具提供方 (Model Context Protocol)
- **关键字段**: id, name, endpoint, authType (none|api_key|oauth|custom), authConfig, status, availableTools[], lastSyncAt
- **关系**: referenced_by → Agent
- **UI 呈现**: Integrations 页面

### 4.12 Secret / Credential
- **定义**: 加密存储的敏感凭证
- **关键字段**: id, name, scope (workspace|user|environment), type (api_key|token|password|certificate), valueRef (加密引用), rotationPolicy, lastRotatedAt
- **关系**: belongs_to → Workspace or User; injected_into → Environment
- **UI 呈现**: Secrets Manager (永远不显示明文)

### 4.13 User / Role
- **User**: id, name, email, role, workspaceId, lastLoginAt
- **Role**: Owner, Admin, Builder, Operator, Viewer, Restricted User
- **UI 呈现**: Settings → Roles & Permissions

### 4.14 Audit Log
- **定义**: 所有操作的不可变审计记录
- **关键字段**: id, userId, action, resourceType, resourceId, result, ipAddress, userAgent, timestamp, metadata
- **UI 呈现**: Audit Log Explorer (筛选、搜索、导出)

### 4.15 Usage / Cost Record
- **关键字段**: id, sessionId, agentId, userId, inputTokens, outputTokens, model, cost, duration, timestamp
- **UI 呈现**: Analytics Dashboard

### 4.16 Outcome / Artifact
- **定义**: Agent 执行产出的文件或结构化结果
- **关键字段**: id, sessionId, type (file|report|data), name, path, size, mimeType, createdAt
- **UI 呈现**: Session Detail → Artifacts Tab

---

## 五、Feature Scope

### A. Agent 管理
| 功能 | 描述 |
|-----|------|
| 创建 Agent | 6 步向导: Basic Info → Model & Prompt → Tools → Integrations → Environment → Review |
| 编辑 Agent | 进入详情页的各 Tab 进行编辑 |
| 版本管理 | 每次发布生成不可变版本，支持回滚和 diff 对比 |
| 模板化 | 将 Agent 保存为模板，支持从模板创建 |
| System Prompt 管理 | 多行编辑器，支持变量插值 {{variable}} |
| 模型选择 | 平台模型路由 + 自定义 Provider |
| Skills 配置 | 绑定 Skill Pack，声明 Agent 能力 |
| Toolset 绑定 | 拖拽式工具绑定，每个工具可配策略 |
| MCP 绑定 | 选择已注册的 MCP Server，自动发现工具 |
| Metadata | 自定义 key-value 标签 |
| 克隆 | 一键克隆 Agent 配置到新 Agent |
| 发布/回滚 | 发布新版本 / 回滚到历史版本 |
| 权限可见范围 | Private / Team / Workspace |

### B. Environment 管理
- 容器模板选择 (Python/Node/Go/自定义镜像)
- 语言/Runtime 选择
- 预装依赖 (pip/npm packages)
- 网络访问策略 (白名单域名/IP)
- 文件挂载 (只读/读写)
- 环境变量与 Secret 注入
- 环境复用 (多个 Session 可共享)
- 环境版本/快照
- 健康状态监控 (Healthy/Unhealthy/Unknown)

### C. Session 运行
| 功能 | 交互描述 |
|-----|---------|
| 启动 Session | 选择 Agent + Environment → 点击"新建会话" |
| 会话级历史 | Session 详情页展示完整事件流 |
| 状态化文件系统 | 底部文件面板展示工作区目录树 |
| 长时间运行 | 状态栏显示 duration，支持后台运行 |
| 暂停/恢复/终止 | 顶部控制栏提供 Pause/Resume/Stop 按钮 |
| 追加用户消息 | 底部输入框随时可发消息 (interrupt/steer) |
| 会话标签 | 支持给 Session 打标签分类 |
| 会话搜索 | 全文搜索会话内容 |
| 会话归档 | 完成的会话可归档 |
| 会话共享 | 生成只读分享链接 |
| Thread 机制 | 左侧 Thread 列表，支持子线程 |

### D. Event 流
| 事件类型 | UI 呈现 |
|---------|--------|
| user.message | 右对齐气泡，用户头像 |
| agent.message | 左对齐气泡，支持 Markdown 渲染 |
| agent.tool_use | 可折叠卡片，显示工具名 + 参数摘要 |
| tool_result | 嵌套在 tool_use 下方，显示结果/错误 |
| session.status | 顶部状态栏变更通知 |
| approval | 阻塞式卡片，显示 Approve/Reject 按钮 |
| custom | 自定义渲染器 |

- SSE streaming 实时推送
- 时间线 UI (左侧时间戳 + 右侧事件卡片)
- 按类型筛选
- 事件重放 (回放历史 Session)
- 服务端事件历史 (分页查询)

### E. 内置工具

| 工具 | 参数 | 风险等级 | 需审批 | UI 展示 |
|-----|------|---------|-------|--------|
| bash | command, timeout, cwd | 🔴 High | 是 (写操作) | 终端样式的代码块 + 输出 |
| read_file | path, offset, limit | 🟢 Low | 否 | 文件路径 + 内容预览 |
| write_file | path, content | 🔴 High | 是 | diff 视图 (before/after) |
| edit_file | path, old_string, new_string | 🟡 Medium | 视情况 | inline diff 高亮 |
| glob | pattern, path | 🟢 Low | 否 | 匹配文件列表 |
| grep | pattern, path, output_mode | 🟢 Low | 否 | 搜索结果列表 |
| web_fetch | url, method, headers | 🟡 Medium | 视情况 | URL + 响应摘要 |
| web_search | query, max_results | 🟢 Low | 否 | 搜索结果卡片 |

每个工具调用日志包含: 工具名、参数、结果、耗时、token 消耗、状态

### F. Custom Tools
- 注册: 填写工具名、命名空间、描述、JSON Schema
- 执行: Webhook / Callback URL
- Result 回注: 异步回注 tool_result
- 超时/重试: 可配置 timeout (默认 30s) 和 retryPolicy
- 幂等性: 声明 idempotent 标记
- 工具测试台: 在注册页面直接测试工具调用

### G. MCP / 外部集成
- Provider 管理: 添加/编辑/删除外部 Provider
- 连接状态: 在线/离线/错误
- 认证方式: API Key / OAuth / 自定义 Header
- Scope 管理: 限制可发现的工具范围
- 可见工具清单: 展示 Provider 暴露的所有工具
- 审批边界: 配置哪些 MCP 工具需要审批

### H. 权限与协作

#### 角色定义
| 角色 | 说明 |
|-----|------|
| Owner | 工作空间所有者，完全控制 |
| Admin | 管理员，可管理成员和配置 |
| Builder | 开发者，可创建/编辑 Agent 和工具 |
| Operator | 运维人员，可启动/监控 Session |
| Viewer | 只读观察者 |
| Restricted User | 受限用户，只能使用被授权的特定 Agent |

#### 共享场景
- 同 Workspace 多人共享 Agent (通过 visibility 控制)
- 同一 Agent 被多个 Session 引用
- Credential 区分: 服务凭证 (workspace-scoped) vs 用户凭证 (user-scoped)
- 查看审计日志需要 Owner/Admin 权限
- 管理凭证需要 Admin 权限

### I. Secret / Credential 管理
- 平台托管: AES-256 加密存储
- User-scoped: 用户个人凭证 (如个人 GitHub Token)
- Workspace-scoped: 团队共享服务凭证 (如 AWS Key)
- Environment 注入: 运行时通过环境变量注入，不落盘
- Secret Rotation: 可配置自动轮换策略
- Usage Audit: 记录每次使用
- UI Masking: 永远显示 `sk-****xxxx` 格式
- 引用式调用: 工具使用 `{{secret:secret_id}}` 引用，不传明文

### J. 可观测性 / 监控

| Dashboard | 核心指标 |
|-----------|---------|
| Session Status | 活跃/空闲/失败数, 平均持续时间, 当前并发 |
| Tool Usage | 调用次数 Top 10, 成功率, 平均耗时 |
| Token/Cost | 每日/周/月消耗趋势, 按 Agent 分组, 按 Model 分组 |
| Error Rate | 错误率趋势, 错误类型分布 |
| Per-Agent | 单个 Agent 的完整运行指标 |
| Per-User | 单个用户的资源使用统计 |

告警规则: 错误率超阈值 / 成本超预算 / Session 超时

### K. 高级能力 (Roadmap)
- **Memory** (v1.5): Agent 长期记忆，跨 Session 保持上下文
- **Outcomes / Artifacts** (v1): Session 产出物管理
- **Multi-Agent Orchestration** (v2): Agent 编排，Agent A 调用 Agent B
- **Sub-Agent Thread** (v2): 主 Agent 创建子 Agent 线程
- **Plan Mode** (v1.5): Agent 先输出计划，用户确认后执行
- **Prompt Compaction** (v2): 自动压缩长对话上下文
- **Prompt Caching** (v2): 缓存重复 prompt 降低成本
- **Session Summarization** (v1.5): 自动生成会话摘要
- **Reusable Skills** (v1.5): 可复用的技能包
- **Templates Marketplace** (v2): Agent 模板市场

---

## 六、Core User Flows

### Flow 1: 创建并运行一个 Agent
1. 导航到 Agents → 点击"创建 Agent"
2. Wizard Step 1: 填写名称、描述、标签
3. Wizard Step 2: 选择模型、编写 System Prompt
4. Wizard Step 3: 绑定工具 (bash, read_file, web_search...)
5. Wizard Step 4: 连接 MCP 外部工具 (可选)
6. Wizard Step 5: 选择/创建 Environment
7. Wizard Step 6: Review → 发布
8. 进入 Agent Detail → 点击"新建会话"
9. 进入 Session Detail / Live Console
10. 在输入框发送消息 → 观察事件流实时更新

### Flow 2: 监控和审批
1. Operator 收到通知: "Agent X 的 bash 工具调用等待审批"
2. 进入 Approvals Queue
3. 查看工具调用详情 (命令、参数、风险等级)
4. 点击 Approve → Session 继续
5. 或点击 Reject → Agent 收到拒绝结果，调整策略

### Flow 3: 版本管理
1. Builder 在 Agent Detail 修改 System Prompt
2. 点击"发布新版本"
3. 输入版本号和 changelog
4. 新版本创建，旧版本仍可查看
5. 如需回滚，进入 Version Tab → 选择旧版本 → "回滚到此版本"

---

## 七、Permission Matrix

| 操作 | Owner | Admin | Builder | Operator | Viewer | Restricted |
|-----|:-----:|:-----:|:-------:|:--------:|:------:|:----------:|
| Create Agent | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit Agent | ✅ | ✅ | ✅ (自己的) | ❌ | ❌ | ❌ |
| Publish Version | ✅ | ✅ | ✅ (自己的) | ❌ | ❌ | ❌ |
| Delete Agent | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Environment | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage Secrets | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create Session | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ (指定 Agent) |
| Send Message | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Interrupt Session | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Approve Tool Use | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Logs | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Export Data | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Members | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Audit Log | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage MCP Integration | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 八、Data Model Suggestion

### 8.1 agent
```
{
  id: string (uuid)
  workspaceId: string
  name: string (unique within workspace)
  description: string
  systemPrompt: string
  model: {
    provider: string
    modelId: string
    temperature: number (0-2)
    maxTokens: number
  }
  visibility: "private" | "team" | "workspace"
  owner: string (userId)
  tags: string[]
  metadata: Record<string, string>
  currentVersion: string
  status: "draft" | "published" | "deprecated" | "archived"
  createdAt: datetime
  updatedAt: datetime
}
```

### 8.2 agent_version
```
{
  id: string
  agentId: string
  version: string (semver)
  config: {
    systemPrompt: string
    model: {...}
    tools: string[]
    skills: string[]
    mcpServers: string[]
    environmentTemplateId: string
  }
  changelog: string
  publishedBy: string (userId)
  publishedAt: datetime
  isCurrent: boolean
}
```

### 8.3 environment
```
{
  id: string
  workspaceId: string
  name: string
  baseImage: string
  runtime: "python" | "node" | "go" | "custom"
  dependencies: string[]
  networkPolicy: {
    mode: "allow_all" | "allowlist" | "deny_all"
    allowDomains: string[]
    allowIPs: string[]
  }
  fileMounts: { source: string, target: string, readOnly: boolean }[]
  envVars: { key: string, value: string | {secretRef: string} }[]
  workDir: string
  status: "healthy" | "unhealthy" | "unknown"
  lastHealthCheck: datetime
  createdAt: datetime
}
```

### 8.4 session
```
{
  id: string
  workspaceId: string
  agentId: string
  agentVersion: string
  environmentId: string
  status: "created" | "running" | "idle" | "waiting_approval" | "completed" | "failed"
  createdBy: string (userId)
  tags: string[]
  tokenUsage: { input: number, output: number, total: number }
  cost: number
  duration: number (seconds)
  startedAt: datetime
  lastEventAt: datetime
  endedAt: datetime | null
  parentThreadId: string | null
}
```

### 8.5 session_thread
```
{
  id: string
  sessionId: string
  parentThreadId: string | null
  agentId: string
  title: string
  status: "active" | "paused" | "completed"
  createdAt: datetime
}
```

### 8.6 event
```
{
  id: string
  sessionId: string
  threadId: string
  type: "user.message" | "agent.message" | "tool_use" | "tool_result" | "status" | "approval" | "custom"
  payload: any (type-specific)
  timestamp: datetime
  metadata: Record<string, any>
}
```

### 8.7 tool_definition
```
{
  id: string
  name: string
  type: "builtin" | "custom" | "mcp"
  namespace: string
  description: string
  parametersSchema: JSONSchema
  riskLevel: "low" | "medium" | "high" | "critical"
  approvalRequired: boolean
  timeout: number (ms)
  retryPolicy: { maxRetries: number, backoffMs: number }
  executionConfig: {
    type: "builtin" | "webhook" | "mcp"
    endpoint: string
    headers: Record<string, string>
  }
}
```

### 8.8 tool_execution
```
{
  id: string
  sessionId: string
  eventId: string
  toolId: string
  toolName: string
  arguments: any
  result: any
  status: "pending" | "approved" | "running" | "completed" | "failed" | "rejected" | "timeout"
  approvedBy: string | null
  startedAt: datetime
  completedAt: datetime
  duration: number (ms)
  error: string | null
}
```

### 8.9 secret
```
{
  id: string
  workspaceId: string
  name: string
  scope: "workspace" | "user"
  type: "api_key" | "token" | "password" | "certificate"
  valueRef: string (encrypted reference, never exposed)
  description: string
  rotationPolicy: { enabled: boolean, intervalDays: number }
  lastRotatedAt: datetime
  createdBy: string (userId)
  createdAt: datetime
}
```

### 8.10 approval_request
```
{
  id: string
  sessionId: string
  toolExecutionId: string
  toolName: string
  arguments: any
  riskLevel: string
  requestedAt: datetime
  status: "pending" | "approved" | "rejected" | "expired"
  reviewedBy: string | null
  reviewedAt: datetime | null
  comment: string | null
  expiresAt: datetime
}
```

### 8.11 audit_log
```
{
  id: string
  workspaceId: string
  userId: string
  action: string
  resourceType: string
  resourceId: string
  result: "success" | "failure"
  ipAddress: string
  userAgent: string
  timestamp: datetime
  metadata: Record<string, any>
}
```

### 8.12 usage_record
```
{
  id: string
  sessionId: string
  agentId: string
  userId: string
  model: string
  inputTokens: number
  outputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
  cost: number
  duration: number (ms)
  timestamp: datetime
}
```

---

## 九、Page-by-Page Spec (18 个核心页面)

### Page 1: Workspace Overview Dashboard
**页面目标**: 一目了然掌握工作空间全局状态
**核心任务**: 查看活跃指标、快速进入常用功能、发现异常
**信息层级**:
- L1: 核心指标卡 (4 个: Active Sessions, Active Agents, Pending Approvals, Today's Cost)
- L2: 趋势图 (Session 活跃度 24h / Token 消耗 7d)
- L3: 最近活动列表 (最近 10 条 Session 事件)
- L4: 快捷操作 (创建 Agent / 新建 Session / 查看审批)
**空状态**: "欢迎使用 Agent Console" → 引导创建第一个 Agent
**加载态**: Skeleton 卡片 + 骨架屏
**错误态**: 指标卡显示 "--" + 重试按钮

### Page 2: Agents List
**页面目标**: 管理和发现所有 Agent
**核心任务**: 浏览 Agent、搜索筛选、快速操作
**信息层级**:
- L1: DataToolbar (创建按钮 + 搜索 + 状态/标签筛选 + 视图切换)
- L2: 表格/卡片 (name, status, version, model, tools count, lastRunAt, owner, actions)
- L3: 分页
**交互**: 点击名称 → Agent Detail; 行操作: 启动/停止/克隆/删除
**空状态**: "还没有 Agent" → 创建按钮

### Page 3: Agent Detail
**页面目标**: 查看/编辑单个 Agent 的完整配置
**核心任务**: 查看概览、管理版本、编辑配置、查看运行历史
**信息层级**:
- L1: Header (name + status badge + version + owner + actions: 新建会话/发布版本/克隆/删除)
- L2: Tabs (Overview | Versions | Configuration | Sessions | Events)
  - Overview: 基本信息 + 关键指标 + 最近 5 次 Session
  - Versions: 版本列表 + diff 对比
  - Configuration: System Prompt / Model / Tools / MCP / Environment / Metadata (sub-tabs)
  - Sessions: 该 Agent 关联的所有 Session 列表
  - Events: 该 Agent 的所有事件时间线
**空状态**: 各 Tab 有对应空状态

### Page 4: Create Agent Wizard
**页面目标**: 引导用户分步创建 Agent
**6 个步骤**:

**Step 1: Basic Info**
- name* (必填, 3-64 字符)
- description (选填, 最多 500 字符)
- visibility (Private / Team / Workspace, 默认 Team)
- tags (可选)
- 帮助文案: "为你的 Agent 起一个唯一名称，建议使用 kebab-case 格式"
- 校验: name 在 workspace 内唯一

**Step 2: Model & Prompt**
- model provider* (平台路由 / 自定义)
- model id* (下拉选择)
- temperature (滑块, 0-2, 默认 0.7)
- maxTokens (数字输入, 默认 4096)
- systemPrompt* (大文本框, 支持 Markdown 预览)
- 帮助文案: "System Prompt 定义了 Agent 的行为准则和能力边界"
- 高级折叠区: top_p, frequency_penalty, presence_penalty

**Step 3: Tools**
- 工具列表 (checkboxes 分组: 内置工具 / Custom Tools / MCP Tools)
- 每个工具: 开关 + 风险等级标签 + 点击展开策略配置
- 策略配置: approvalRequired, maxCallsPerSession, timeout
- 高级: Tool Policy 模板选择

**Step 4: Integrations / MCP**
- 已注册的 MCP Provider 列表 (checkboxes)
- 每项显示: Provider 名称 + 连接状态 + 可用工具数
- 点击展开: 可用工具清单 + 策略配置
- 可选: "添加新 Provider" 快捷入口

**Step 5: Environment Defaults**
- 选择已有 Environment / 创建新 Environment
- 预览: 镜像、runtime、依赖、网络策略
- 高级: 文件挂载、环境变量覆盖

**Step 6: Review & Publish**
- 左侧: 配置摘要 (只读)
- 右侧: 版本号输入 + changelog
- 底部: "发布" / "保存为草稿" 按钮
- 校验: 所有必填项检查

### Page 5: Agent Version Compare
**页面目标**: 对比两个版本的配置差异
**核心任务**: 理解变更内容，决定是否回滚
**信息层级**: 左右分栏 (side-by-side diff)
**交互**: 下拉选择对比版本; 高亮差异行; 点击"回滚到此版本"

### Page 6: Environments List
**页面目标**: 管理所有运行环境
**核心任务**: 查看/创建/编辑环境
**信息层级**: 表格 (name, runtime, baseImage, status, sessions count, createdAt)
**空状态**: "还没有环境" → "创建环境" 按钮

### Page 7: Environment Detail
**页面目标**: 查看环境配置和健康状态
**核心任务**: 检查配置、查看关联 Session、监控健康
**Tabs**: Overview (配置摘要 + 健康状态) | Configuration (依赖、网络、挂载) | Sessions (关联会话)

### Page 8: Session List
**页面目标**: 管理所有会话实例
**核心任务**: 监控活跃会话、搜索历史会话
**信息层级**: 表格 (agent name, status, environment, duration, token count, cost, createdAt, actions)
**筛选**: 状态 (running/idle/waiting_approval/completed/failed) + Agent + 时间范围
**行操作**: 进入详情 / 终止会话 / 归档

### Page 9: Session Detail / Live Console ★ (核心页面)
**页面目标**: 实时监控和操控单个 Session
**布局** (三栏):
```
┌─────────────────────────────────────────────────────┐
│ [Session 状态栏] Agent: xxx | v1.0 | Env: xxx | Status | Duration | Token | Cost │
├──────┬──────────────────────────────────┬───────────┤
│      │ [事件流主面板]                     │ [右侧抽屉] │
│ Thread│ user: 请分析这个文件              │ 工具详情   │
│ 列表  │ agent: 好的，我来读取...          │ JSON查看   │
│      │ 🔧 tool_use: read_file            │ 参数结构   │
│ ▸ Main│   └─ result: 文件内容...          │ 执行日志   │
│ ▸ Sub1│ agent: 分析结果如下...            │           │
│ ▸ Sub2│                                  │           │
│      │ [工具调用面板 - 可折叠]             │           │
│      │ [文件系统面板 - 可折叠]             │           │
│      │ [Artifact 面板 - 可折叠]           │           │
│      ├──────────────────────────────────┤           │
│      │ [输入区] ⚠️ 审批卡片 (如需)         │           │
│      │ [发送消息 / Interrupt / Steer]      │           │
└──────┴──────────────────────────────────┴───────────┘
```

**事件交互规则**:
1. **用户发送消息**: 输入区 → 事件流追加 user.message 气泡 → 状态变为 running → Agent 开始处理
2. **工具调用**: 事件流追加可折叠 tool_use 卡片 (显示工具名 + 参数摘要) → 展开显示完整参数 → 运行中显示 spinner
3. **工具需审批**: tool_use 卡片变为阻塞态 (橙色边框) → 输入区上方弹出审批卡片 → Approve/Reject → 放行后继续
4. **Session Idle**: 状态栏变灰 → 显示 "Agent 等待输入" → 底部输入框获得焦点
5. **Session Failed**: 状态栏变红 → 显示错误信息 → 提供 "重试" / "查看详情" 按钮
6. **Thread 切换**: 左侧点击不同 Thread → 事件流切换到对应 Thread 的事件 → 当前 Thread 高亮

### Page 10: Event Timeline Explorer
**页面目标**: 搜索和浏览历史事件
**核心任务**: 按类型/时间/Session 筛选事件，查看原始 payload
**信息层级**: 左侧筛选面板 + 右侧时间线视图 + 点击展开 payload 详情

### Page 11: Tool Catalog
**页面目标**: 浏览和管理所有可用工具
**核心任务**: 了解工具能力、配置工具策略
**分类**: 内置工具 / Custom Tools / MCP Tools
**每项展示**: 工具名 + 描述 + 风险等级 + 使用统计 + 状态

### Page 12: Custom Tool Builder
**页面目标**: 注册和测试自定义工具
**核心任务**: 填写工具 Schema、配置执行方式、测试
**布局**: 左侧表单 (名称/命名空间/描述/Schema/执行配置) + 右侧预览 + 底部测试台

### Page 13: Integrations / MCP Providers
**页面目标**: 管理外部工具提供方
**核心任务**: 添加/编辑 MCP Provider、查看连接状态、浏览可用工具
**信息层级**: Provider 卡片列表 + 点击展开详情 (连接状态、工具清单、认证配置)

### Page 14: Secrets Manager
**页面目标**: 安全管理凭证
**核心任务**: 创建/轮换/删除凭证、查看使用审计
**信息层级**: 表格 (name, scope, type, lastRotated, usage count, actions)
**安全**: 永远不显示明文，使用 `sk-****xxxx` 格式

### Page 15: Approvals Queue
**页面目标**: 处理待审批的工具调用
**核心任务**: 审查请求、批准/拒绝
**信息层级**: 待审批列表 (时间倒序) + 每项显示: Agent名 + 工具名 + 参数 + 风险等级 + Approve/Reject
**空状态**: "没有待审批的请求" ✓

### Page 16: Analytics Dashboard
**页面目标**: 全局数据分析
**核心任务**: 查看 Session/Tool/Cost/Error 趋势
**Tabs**: Sessions | Tool Usage | Cost | Per-Agent
**每个 Tab**: 顶部指标卡 + 中部趋势图 + 底部明细表

### Page 17: Audit Log Explorer
**页面目标**: 审查操作历史
**核心任务**: 搜索/筛选/导出审计日志
**信息层级**: 筛选栏 (操作人/操作类型/时间范围/资源类型) + 日志表格 + 导出按钮

### Page 18: Role & Permission Settings
**页面目标**: 管理角色和权限
**核心任务**: 查看权限矩阵、管理成员角色
**信息层级**: 权限矩阵表 + 成员列表 + 角色分配

---

## 十、UI Component System

### 10.1 设计风格
- **企业级**: 深色边框，清晰层级，专业配色
- **工程感**: 等宽字体用于代码/日志，结构化信息展示
- **高信息密度**: 紧凑但有序，避免大面积留白
- **参考**: Linear (简洁高效) + GitHub (代码/PR 管理) + Vercel (Dashboard) + Datadog (监控)

### 10.2 核心组件
| 组件 | 用途 | 说明 |
|------|------|------|
| DataTable | 列表页核心 | 排序/筛选/分页/行操作 |
| Timeline | 事件流 | 左侧时间戳 + 右侧事件卡片，支持折叠 |
| CommandBar | Session 输入区 | 支持文本/代码切换、附件、快捷键 |
| ChatComposer | 消息输入 | 自适应高度、Markdown 预览、发送快捷键 |
| StatusBadge | 状态标签 | 颜色编码 (绿/蓝/橙/红/灰) |
| LogViewer | 日志查看 | 终端风格、语法高亮、自动滚动 |
| DiffViewer | 版本对比 | Side-by-side / Inline 模式 |
| KeyValueInspector | KV 编辑 | 表格形式 key-value 编辑 |
| JSONPayloadViewer | JSON 查看 | 折叠/展开、语法高亮、复制 |
| ApprovalCard | 审批卡片 | 阻塞式展示，Approve/Reject 按钮 |
| TokenCostMeter | Token/成本 | 进度条 + 数字显示 |
| SplitPane | 分栏布局 | 可拖拽分隔线 |
| Drawer | 抽屉面板 | 右侧滑出，查看详情 |
| CommandPalette | 命令面板 | Cmd+K 唤起全局命令 |

---

## 十一、Empty / Loading / Error States

### 通用原则
| 状态 | 设计 |
|------|------|
| Empty | 主题图标 + 标题 + 描述 + CTA 按钮 |
| Loading | Skeleton 骨架屏 (不是 spinner) |
| Error | 错误图标 + 错误信息 + 重试按钮 |
| No Permission | 锁图标 + "您没有权限访问此页面" + 联系管理员提示 |

### 移动端降级
- 列表页: 表格 → 卡片列表
- Detail 页: Tab 变为手风琴折叠
- Session Console: 三栏 → 单栏 (Thread 顶部下拉)
- Analytics: 图表简化为指标卡

---

## 十二、Roadmap

### v1 — MVP (核心运行时)
- Agent CRUD + 版本管理
- Environment 管理
- Session 创建和实时控制台
- 内置工具 (bash, file ops, web)
- Event 流和 SSE
- 基础权限 (RBAC)
- Secret 管理
- 审批流
- 基础 Analytics

### v1.5 — 增强
- Custom Tools 注册和测试台
- MCP Provider 集成
- Memory (跨 Session 上下文)
- Plan Mode (先计划后执行)
- Session Summarization
- Reusable Skills
- 高级 Analytics (Per-Agent / Per-User)
- 告警规则

### v2 — 平台化
- Multi-Agent Orchestration
- Sub-Agent Thread
- Prompt Compaction / Caching
- Templates Marketplace
- ABAC 权限
- 自定义事件类型
- 白标 / 嵌入式 SDK
- API Gateway / Webhook 回调
