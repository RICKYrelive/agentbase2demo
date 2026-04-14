# Agent Console — 产品需求文档 v0

> 版本: v0.1 | 日期: 2026-04-14 | 状态: Draft
> 整理自: raw_docs/ 下三份原始文档 + Claude Platform 实际页面分析

---

## 一、项目概述

### 1.1 产品定位

Agent Console 是一个**企业级托管 Agent Runtime 平台**。它不是聊天机器人，也不是单轮 Copilot，而是一个让开发者和企业团队可以**创建、配置、运行、监控和治理**具备工具调用能力的长期运行 Agent 的完整平台。

核心理念借鉴 Anthropic Managed Agents 的 **"大脑与双手解耦"** 架构：
- **大脑** = Claude + 编排框架（运行在容器外部）
- **双手** = 执行沙箱（容器环境）
- **会话** = 持久化事件日志

### 1.2 目标用户

| 用户群体 | 典型场景 | 核心诉求 |
|---------|---------|---------|
| AI 平台团队 | 管理全公司 Agent 资产 | 统一治理、成本控制、审计合规 |
| 内部工具团队 | 构建自动化工作流 Agent | 工具集成、长时运行、异步任务 |
| 自动化/工作流团队 | 业务流程自动化 | 多步骤编排、审批流、异常处理 |
| SaaS 团队 | 在产品中嵌入 Agent | API 接入、白标定制、会话管理 |

### 1.3 参考产品

| 产品 | 参考维度 |
|------|---------|
| Anthropic Claude Managed Agents | 核心架构、API 设计、概念模型 |
| Linear | UI 交互风格、列表页设计 |
| GitHub | 代码/PR 管理、版本对比 |
| Vercel | Dashboard 信息密度 |
| Datadog | 监控、日志、可观测性 |

---

## 二、产品原则

1. **Runtime First** — 一切设计围绕 Agent 的运行时生命周期，不是围绕对话
2. **Observable by Default** — 每一次工具调用、状态变更、token 消耗都默认可观测
3. **Policy as Code** — 工具权限、网络策略、secret 注入都是声明式配置
4. **Stateful, Not Stateless** — Agent 拥有文件系统、环境变量、会话历史，是有状态的
5. **Human-in-the-Loop** — 高风险操作需要审批，用户可随时 interrupt/steer
6. **Enterprise Grade** — 审计、合规、成本控制、权限隔离是第一天需求

---

## 三、核心概念模型

### 3.1 概念总览

| 概念 | 说明 | 对应 Claude API |
|------|------|----------------|
| **Workspace** | 顶层隔离边界，所有资源归属 | Workspace |
| **Agent** | 可复用的 Agent 定义（模型、提示、工具、技能） | Agent |
| **Agent Version** | Agent 的不可变快照，记录配置变更历史 | Agent Version |
| **Environment** | 云端容器配置，定义运行环境 | Environment |
| **Session** | Agent + Environment 的运行实例 | Session |
| **Thread** | Session 内的对话线程，支持子线程 | Session Thread |
| **Event** | Session 中的原子事件记录 | Session Event |
| **Vault** | 凭证存储集合，用于 MCP 认证 | Vault |
| **Skill** | 可复用的能力包（预置 / 自定义） | Skill |
| **Memory Store** | 跨会话持久记忆存储 | Memory Store (Preview) |
| **Outcome** | 定义"完成"标准，Agent 自评估迭代 | Outcome (Preview) |

### 3.2 生命周期

```
Agent:     Draft → Published → Deprecated → Archived
Session:   Created → Running → (Idle ↔ Running) → Completed / Failed
Tool:      Registered → Active → Deprecated
Env:       Created → Healthy → Unhealthy → Deleted
```

---

## 四、信息架构（IA）

### 4.1 导航结构

```
Agent Console
├── Dashboard                    # 工作空间概览
├── Build                        # 构建工具
│   ├── Quickstart               # 快速开始向导（4步）
│   ├── Agents                   # Agent 管理（列表 / 创建 / 详情）
│   ├── Sessions                 # 会话追踪与调试
│   ├── Environments             # 容器环境配置
│   ├── Credential Vaults        # MCP 凭证管理
│   ├── Files                    # 文件管理
│   └── Skills                   # 技能管理
├── Analytics                    # 数据分析
│   ├── Usage                    # Token 用量分析
│   ├── Cost                     # 成本分析
│   ├── Logs                     # 请求日志
│   └── Batches                  # 批处理管理
└── Settings                     # 管理配置
    ├── API Keys                 # 密钥管理
    ├── Limits                   # 限流/配额
    └── Workspace Settings       # 工作区设置
```

### 4.2 页面路由映射

| 页面 | URL 模式 | 层级 |
|------|----------|------|
| Dashboard | `/dashboard` | 全局 |
| Quickstart | `/workspaces/{ws}/agent-quickstart` | 工作区 |
| Agents | `/workspaces/{ws}/agents` | 工作区 |
| Sessions | `/workspaces/{ws}/sessions` | 工作区 |
| Environments | `/workspaces/{ws}/environments` | 工作区 |
| Credential Vaults | `/workspaces/{ws}/vaults` | 工作区 |
| Files | `/workspaces/{ws}/files` | 工作区 |
| Skills | `/workspaces/{ws}/skills` | 工作区 |
| Usage | `/usage` | 全局 |
| Cost | `/workspaces/{ws}/cost` | 工作区 |
| Logs | `/workspaces/{ws}/logs` | 工作区 |
| Batches | `/workspaces/{ws}/batches` | 工作区 |
| API Keys | `/settings/workspaces/{ws}/keys` | 设置 |
| Workspace Settings | `/settings/workspaces/{ws}` | 设置 |
| Limits | `/settings/limits` | 组织设置 |

### 4.3 首屏设计

| 角色 | 默认首屏 | 核心任务 |
|------|---------|---------|
| Owner/Admin | Dashboard | 全局指标、活跃 session、告警 |
| Builder | Agents List | 创建/编辑 Agent |
| Operator | Sessions List | 运维监控 |
| Viewer | Analytics | 只读数据 |

---

## 五、功能规格

### 5.1 Agent 管理

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 创建 Agent | 描述输入 / 模板选择 → 生成配置 → 发布 | P0 |
| 编辑 Agent | YAML/JSON 配置编辑器 + Tab 切换 | P0 |
| 版本管理 | 每次修改自动递增版本，支持查看历史 | P0 |
| 模板化 | 10+ 预置模板（Blank、Deep Researcher、Support Agent 等） | P0 |
| 模型选择 | Claude Opus 4.6 / Sonnet 4.6 / Haiku 4.5 | P0 |
| 工具绑定 | 内置工具集 + MCP 工具 + 自定义工具 | P0 |
| 技能绑定 | 预置技能（xlsx/pptx/pdf/docx）+ 自定义技能 | P0 |
| MCP 绑定 | 声明 MCP Server，自动发现工具 | P0 |
| 归档/删除 | 归档后不再显示，需 Show archived 开关 | P1 |
| 克隆 | 一键克隆 Agent 配置 | P2 |

**Agent 配置字段：**

```yaml
name: string              # 必填, 1-256字符
model: string             # 必填, 如 claude-sonnet-4-6
system: string            # 可选, 最多 100K 字符
tools: []                 # 工具配置, 总计最多 128 个
skills: []                # 技能列表, 最多 20 个
mcp_servers: []           # MCP 服务器, 最多 20 个
callable_agents: []       # 可调用的子 Agent (多Agent编排)
```

### 5.2 Environment 管理

| 功能 | 描述 |
|------|------|
| 创建环境 | 名称 + 托管类型（Cloud/Local） + 描述 |
| 包管理 | apt / pip / npm / cargo / gem / go 等 |
| 网络策略 | unrestricted（无限制）/ limited（白名单域名） |
| 状态监控 | Active / 非 Active |

**容器规格：**

| 属性 | 值 |
|------|-----|
| 操作系统 | Ubuntu 22.04 LTS |
| 预装语言 | Python 3.12+, Node.js 20+, Go 1.22+, Rust 1.77+, Java 21+, Ruby 3.3+, PHP 8.3+ |
| 预装工具 | git, curl, wget, jq, ripgrep, tmux, vim, docker(有限) |
| 内存上限 | 8 GB |
| 磁盘上限 | 10 GB |
| 数据库客户端 | SQLite(本地), PostgreSQL/Redis(远程连接) |

### 5.3 Session 运行

| 功能 | 描述 |
|------|------|
| 创建 Session | 选择 Agent + Environment + 可选 Vault/Memory/Files |
| 实时事件流 | SSE streaming，实时推送所有事件 |
| 发送消息 | `user.message` 事件触发 Agent 处理 |
| 中断/控制 | `user.interrupt` 中断当前执行 |
| 工具审批 | `user.tool_confirmation` 批准/拒绝工具调用 |
| 自定义工具结果 | `user.custom_tool_result` 回注结果 |
| 文件挂载 | 运行中可动态添加/删除文件 |
| GitHub 挂载 | 克隆仓库到容器，支持 PR 创建 |

**Session 状态流转：**

```
rescheduling → running ↔ idle → terminated
                    ↓
                  error
```

### 5.4 事件系统

| 分类 | 事件类型 | 方向 |
|------|----------|------|
| 会话状态 | `session.status_running/idle/terminated/error/rescheduled` | 平台→用户 |
| Agent 输出 | `agent.message`, `session.output_text_delta` | 平台→用户 |
| 工具调用 | `agent.tool_use/result`, `agent.mcp_tool_use/result`, `agent.custom_tool_use` | 平台→用户 |
| 用户交互 | `user.message`, `user.interrupt`, `user.tool_confirmation`, `user.custom_tool_result` | 用户→平台 |
| 多Agent | `session.thread_created/idle`, `agent.thread_message_sent/received` | 平台→用户 |
| 评估 | `span.outcome_evaluation_start/ongoing/end` | 平台→用户 |
| 模型追踪 | `span.model_request_start/end` | 平台→用户 |

### 5.5 工具系统

**三类工具：**

| 类型 | 标识 | 说明 |
|------|------|------|
| 内置工具集 | `agent_toolset_20260401` | Bash、文件操作、Web搜索、Web获取 |
| MCP 工具集 | `mcp_toolset` | 外部 MCP 服务器提供的工具 |
| 自定义工具 | `custom` | 应用层实现，事件驱动 |

**权限策略：**

| 策略 | 行为 |
|------|------|
| `always_allow` | 自动执行，无需确认 |
| `always_ask` | 暂停等待用户确认后再执行 |

默认策略：内置工具集 `always_allow`，MCP 工具集 `always_ask`。支持单工具级别的策略覆盖。

### 5.6 凭证管理 (Vaults)

- Vault 是工作区级别的凭证集合，每个 Vault 最多 20 个凭证
- 支持 OAuth（自动刷新）和静态 Bearer Token
- 凭证绑定到 `mcp_server_url`
- 创建 Session 时通过 `vault_ids` 传入
- Token 不在 API 响应中回显

### 5.7 技能系统 (Skills)

| 类型 | 示例 | 来源 |
|------|------|------|
| 预置技能 | xlsx, pptx, docx, pdf | Anthropic 内置 |
| 自定义技能 | 用户上传的 Markdown 文件 | 用户上传 |

限制：每个 Agent 最多 20 个技能。

### 5.8 分析与监控

| Dashboard | 核心指标 |
|-----------|---------|
| Usage | Total tokens in/out, Web searches, 按模型分组趋势 |
| Cost | 月度成本，Spend limits, Email 通知阈值 |
| Logs | 请求日志（时间、ID、模型、Token数、类型） |

### 5.9 高级能力 (Roadmap)

| 功能 | 版本 | 状态 |
|------|------|------|
| Outcomes（结果定义与自评估） | Research Preview | 需申请 |
| Memory Store（跨会话记忆） | Research Preview | 需申请 |
| Multi-Agent（多Agent编排） | Research Preview | 需申请 |
| Prompt 版本管理与回滚 | Beta | 可用 |

---

## 六、权限体系

### 6.1 角色定义

| 角色 | 说明 |
|------|------|
| Owner | 工作空间所有者，完全控制 |
| Admin | 管理员，可管理成员和配置 |
| Builder | 开发者，可创建/编辑 Agent 和工具 |
| Operator | 运维人员，可启动/监控 Session |
| Viewer | 只读观察者 |

### 6.2 权限矩阵

| 操作 | Owner | Admin | Builder | Operator | Viewer |
|-----|:-----:|:-----:|:-------:|:--------:|:------:|
| Create Agent | ✓ | ✓ | ✓ | ✗ | ✗ |
| Edit Agent | ✓ | ✓ | ✓(自己的) | ✗ | ✗ |
| Delete Agent | ✓ | ✓ | ✗ | ✗ | ✗ |
| Manage Environment | ✓ | ✓ | ✓ | ✗ | ✗ |
| Manage Secrets | ✓ | ✓ | ✗ | ✗ | ✗ |
| Create Session | ✓ | ✓ | ✓ | ✓ | ✗ |
| Send Message | ✓ | ✓ | ✓ | ✓ | ✗ |
| Approve Tool Use | ✓ | ✓ | ✓ | ✓ | ✗ |
| View Logs | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manage Members | ✓ | ✓ | ✗ | ✗ | ✗ |
| View Audit Log | ✓ | ✓ | ✗ | ✗ | ✗ |

---

## 七、限制与配额

| 资源 | 上限 |
|------|------|
| 总工具数 | 128 个 / Agent |
| MCP 服务器数 | 20 个 / Agent |
| 技能数 | 20 个 / Agent |
| 系统提示词 | 100K 字符 |
| 每会话文件数 | 100 个 |
| 每会话 Memory Store | 8 个 |
| 每条记忆大小 | 100KB (~25K tokens) |
| Memory prompt | 4,096 字符 |
| 每 Vault 凭证数 | 20 个 |
| Outcomes 最大迭代 | 20 次（默认 3） |
| 多 Agent 委派层级 | 1 级 |
| Agent 名称 | 1-256 字符 |
| Agent 描述 | 2,048 字符 |
| Metadata 键值对 | 16 个 |
| 容器内存 | 8 GB |
| 容器磁盘 | 10 GB |

---

## 八、数据模型

### 8.1 Agent

```
id: string (uuid)
workspace_id: string
name: string (1-256, workspace内唯一)
description: string (≤2048)
model: string
system: string (≤100K)
tools: ToolConfig[]
skills: SkillRef[]
mcp_servers: McpServerConfig[]
callable_agents: CallableAgentRef[]
metadata: Record<string, string> (≤16 pairs)
version: number (自增, 从1开始)
status: "active" | "archived"
created_at: datetime
updated_at: datetime
```

### 8.2 Environment

```
id: string
workspace_id: string
name: string (≤50)
hosting_type: "cloud" | "local"
description: string
config:
  packages: { manager: string, packages: string[] }[]
  network_policy: "unrestricted" | "limited"
  allowed_hosts: string[]  # 当 network_policy=limited
status: "active" | "archived"
created_at: datetime
```

### 8.3 Session

```
id: string
workspace_id: string
agent: { type: "agent", id: string, version: number }
environment_id: string
title: string
vault_ids: string[]
resources: ResourceRef[]
status: "rescheduling" | "running" | "idle" | "terminated"
usage: { input_tokens, output_tokens, cache_read, cache_creation }
active_seconds: number
duration_seconds: number
created_at: datetime
```

### 8.4 Event

```
id: string
session_id: string
session_thread_id: string | null
type: string (见事件类型表)
payload: any
timestamp: datetime
```

### 8.5 Vault & Credential

```
vault:
  id: string
  workspace_id: string
  display_name: string (≤50)
  status: "active"
  created_at: datetime

credential:
  id: string
  vault_id: string
  mcp_server_url: string
  auth_type: "static_bearer" | "oauth"
  token: string (加密存储)
```

---

## 九、API 约定

### 9.1 Beta Header

```
anthropic-beta: managed-agents-2026-04-01
```

Research Preview 功能（Outcomes、Memory、Multiagent）需追加：
```
managed-agents-2026-04-01-research-preview
```

### 9.2 核心 API 端点

| 资源 | 方法 | 端点 |
|------|------|------|
| Agents | POST/GET/DELETE | `/v1/agents` |
| Agent 版本 | GET | `/v1/agents/{id}/versions` |
| Environments | POST/GET | `/v1/environments` |
| Sessions | POST/GET | `/v1/sessions` |
| 发送事件 | POST | `/v1/sessions/{id}/events` |
| 事件流 | GET (SSE) | `/v1/sessions/{id}/stream` |
| Threads | GET | `/v1/sessions/{id}/threads` |
| Thread 流 | GET (SSE) | `/v1/sessions/{id}/threads/{tid}/stream` |
| Vaults | POST/GET | `/v1/vaults` |
| Files | POST/GET | `/v1/files` |
| Memory Stores | POST/GET | `/v1/memory_stores` |
| Skills | POST/GET | `/v1/skills` |

### 9.3 SDK 支持

- Python: `anthropic.beta.agents/sessions/environments/vaults/skills/files`
- TypeScript: `client.beta.agents/sessions/environments/vaults/skills/files`

---

## 十、页面规格（逐页）

### 10.1 全局布局

```
┌──────────────────────────────────────────────────────┐
│  通知区域                                            │
├────────────┬─────────────────────────────────────────┤
│            │                                         │
│  侧边栏     │  主内容区                                │
│  256px     │  自适应宽度                               │
│  可折叠     │                                         │
│            │                                         │
├────────────┴─────────────────────────────────────────┤
│  底部: Documentation 外链 + 用户头像                   │
└──────────────────────────────────────────────────────┘
```

侧边栏结构：品牌Logo → 工作区选择器(Combobox) → 导航分组(可折叠) → 底部链接

### 10.2 标准页面模式

**CRUD 列表页标准模式**（Agents/Sessions/Environments/Vaults/Files/Batches）：

```
┌─────────────────────────────────────────────┐
│ H1 标题                                      │
│ 副标题描述                                    │
├─────────────────────────────────────────────┤
│ [主操作按钮]  [搜索框]  [筛选器]  [归档开关]   │
├─────────────────────────────────────────────┤
│ 表头 (12px, 600, #373734)                    │
│ 数据行...                                    │
│ 数据行...                                    │
├─────────────────────────────────────────────┤
│ [Previous]                    [Next]         │
└─────────────────────────────────────────────┘
```

**创建资源标准弹窗**（New Agent / Add Environment / Create Vault）：

```
┌──────────────────────────────┐
│ H2 标题              [✕]     │
├──────────────────────────────┤
│ 表单字段（垂直排列）           │
│ - Label + Input + 校验提示    │
│ - ...                        │
├──────────────────────────────┤
│              [Cancel] [创建]  │
└──────────────────────────────┘
```

### 10.3 核心页面清单（18页）

| # | 页面 | URL | 类型 | 核心内容 |
|---|------|-----|------|---------|
| 1 | Dashboard | `/dashboard` | 引导页 | 空状态引导，Buy credits，快捷操作 |
| 2 | Quickstart | `/workspaces/{ws}/agent-quickstart` | 向导 | 4步：Create Agent → Configure Env → Start Session → Integrate |
| 3 | Agents | `/workspaces/{ws}/agents` | 列表 | Agent 列表表格 + 搜索筛选 + New Agent 弹窗 |
| 4 | Sessions | `/workspaces/{ws}/sessions` | 列表 | Session 列表 + 状态筛选 + Agent 筛选 |
| 5 | Environments | `/workspaces/{ws}/environments` | 列表 | 环境列表 + Add Environment 弹窗 |
| 6 | Credential Vaults | `/workspaces/{ws}/vaults` | 列表 | Vault 列表 + Create Vault 弹窗 |
| 7 | Skills | `/workspaces/{ws}/skills` | 卡片 | 技能卡片网格（非表格） |
| 8 | Files | `/workspaces/{ws}/files` | 列表 | 文件列表（API上传，无创建按钮） |
| 9 | Workbench | `/workbench` | 交互 | JS 动态渲染工作台 |
| 10 | Usage | `/usage` | 分析 | Token 用量指标卡 + 趋势图 + 限流图 |
| 11 | Cost | `/workspaces/{ws}/cost` | 分析 | 成本分析（JS 动态渲染） |
| 12 | Logs | `/workspaces/{ws}/logs` | 列表 | 请求日志表格 + 时间/模型筛选 |
| 13 | Batches | `/workspaces/{ws}/batches` | 列表 | 批处理列表 |
| 14 | API Keys | `/settings/workspaces/{ws}/keys` | 管理 | 创建 API Key + 安全合规 |
| 15 | Limits | `/settings/limits` | 管理 | Rate Limits 表 + Spend Limits |
| 16 | Workspace Settings | `/settings/workspaces/{ws}` | 管理 | API Keys + Security |
| 17 | Quickstart 模板预览 | - | 详情 | 模板卡片点击 → YAML/JSON 预览 + Use this template |
| 18 | Session 详情/实时控制台 | - | 实时 | 三栏布局：Thread 列表 + 事件流 + 工具详情 |

### 10.4 Session 实时控制台布局（核心页面）

```
┌─────────────────────────────────────────────────────────┐
│ 状态栏: Agent名 | 版本 | 环境 | 状态 | 时长 | Token | 费用 │
├──────┬──────────────────────────────────┬───────────────┤
│      │ 事件流主面板                      │ 右侧抽屉      │
│Thread│ user: 请分析这个文件               │ 工具详情      │
│ 列表 │ agent: 好的，我来读取...           │ JSON 查看    │
│      │ tool_use: read_file              │ 参数结构      │
│ ▸Main│   └─ result: 文件内容...          │ 执行日志      │
│ ▸Sub1│ agent: 分析结果如下...            │              │
│      │                                  │              │
│      ├──────────────────────────────────┤              │
│      │ [输入区]                          │              │
│      │ [⚠️审批卡片]                      │              │
│      │ [发送消息 / Interrupt]            │              │
└──────┴──────────────────────────────────┴───────────────┘
```

---

## 十一、设计系统

### 11.1 色彩规范

| 属性 | 值 | 用途 |
|------|-----|------|
| 页面背景 | `#F8F8F6` | 主背景 |
| 侧边栏背景 | `#F4F4F1` | 侧边栏 |
| 主文字 | `#121212` | 标题、正文 |
| 次要文字 | `#373734` | 描述、表头 |
| 辅助文字 | `#7B7974` | 占位符、辅助信息 |
| 边框 | `rgba(31,31,30,0.15)` | 分割线、卡片边框 |
| 品牌蓝 | `#2977D6` | 主强调色、CTA |
| "New" 徽章背景 | `rgba(203,225,251,0.4)` | 新功能标签 |

### 11.2 字体规范

| 元素 | 字号 | 字重 | 颜色 |
|------|------|------|------|
| 页面标题 H1 | 24px | 500 | `#121212` |
| 卡片标题 H3 | 14-16px | 600 | `#121212` |
| 正文描述 | 14px | 400 | `#373734` |
| 表头 | 12px | 600 | `#373734` |
| 主按钮 | 12px | 500 | `#FFFFFF` |
| 次要按钮 | 14px | 400 | `#373734` |
| "New" 徽章 | 10px | 500 | `#2977D6` |

字体族：`anthropicSans`, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif

### 11.3 组件规范

**按钮体系：**

| 类型 | 样式 | 场景 |
|------|------|------|
| Primary | 深色背景+白色文字，6px圆角，32px高，hover微缩放+底部渐变光泽 | 主操作 |
| Secondary | 透明背景+`#373734`文字+1px边框，8px圆角 | 筛选/次要操作 |
| Ghost | 无背景无边框+`#7B7974`文字 | 导航链接 |
| Icon | 仅图标 | 复制/更多操作 |
| Disabled | opacity-50 | 表单未完成 |

**表格：**
- 全宽，border-collapse
- 表头 12px/600/`#373734`，padding 8px 12px
- 无明显行分隔线
- ID列截断+复制按钮
- 空状态：表格内居中提示

**弹窗：**
- 居中弹出+半透明遮罩
- H2标题+右上角关闭
- 表单垂直排列
- 底部主操作按钮

**代码编辑器：**
- YAML/JSON Tab 切换
- Copy code 按钮
- 语法高亮

### 11.4 交互与动效

- 按钮悬停：`scale-y-[1.015] scale-x-[1.005]` + 底部径向渐变光泽 (150ms)
- 侧边栏可折叠/展开
- 表格行 hover 高亮
- Toggle switch 用于布尔筛选
- 分页按钮禁用态 opacity-50

---

## 十二、核心用户流程

### Flow 1: Quickstart（快速上手，4步）

```
Step 1: Create Agent
  → 输入描述 或 选择模板
  → 系统生成 Agent 配置(YAML)
  → 编辑/确认 → 创建

Step 2: Configure Environment
  → 选择已有环境 或 创建新环境
  → 配置网络访问策略

Step 3: Start Session
  → 可选: 关联 Vault(凭证)
  → 创建 Session
  → 等待容器启动

Step 4: Integrate
  → 获取 SDK 集成代码
  → 完成
```

### Flow 2: 监控和审批

```
Agent 调用 always_ask 工具
  → 发出 agent.tool_use 事件
  → Session 进入 idle (stop_reason: requires_action)
  → 用户收到通知
  → 查看 tool 详情 (工具名+参数+风险等级)
  → 发送 user.tool_confirmation (allow/deny)
  → Session 恢复运行
```

### Flow 3: 版本管理

```
修改 Agent 配置
  → POST /v1/agents/{id} (需带 version 做乐观并发控制)
  → 版本号自动递增
  → 旧版本可通过 ?version=N 查询
  → 支持回滚 (用旧版本配置重新更新)
```

---

## 十三、开发路线图

### v1 — MVP（核心运行时）

- [ ] Agent CRUD + 版本管理
- [ ] Environment 管理
- [ ] Session 创建和实时事件流
- [ ] 内置工具集 (Bash, 文件操作, Web)
- [ ] 权限策略 (always_allow / always_ask)
- [ ] Vault 凭证管理
- [ ] Quickstart 向导
- [ ] 基础 Analytics (Usage/Cost/Logs)
- [ ] RBAC 权限

### v1.5 — 增强

- [ ] 自定义工具 (Custom Tools)
- [ ] 技能系统 (Skills)
- [ ] Memory Store (跨会话记忆)
- [ ] Outcomes (结果定义与自评估)
- [ ] Multi-Agent 编排
- [ ] 高级 Analytics (Per-Agent/Per-User)
- [ ] 告警规则

### v2 — 平台化

- [ ] Templates Marketplace
- [ ] ABAC 权限
- [ ] 白标/嵌入式 SDK
- [ ] API Gateway / Webhook 回调
- [ ] Prompt Caching
- [ ] Prompt Compaction

---

## 附录 A: 可用模板列表

| 模板名称 | 描述 | 关联工具标签 |
|----------|------|-------------|
| Blank agent config | 空白起点，包含核心工具集 | — |
| Deep researcher | 多步 Web 研究 + 来源综合 | — |
| Structured extractor | 非结构化文本 → 结构化 JSON | — |
| Field monitor | 扫描软件博客，生成周报 | notion |
| Support agent | 客户问答 + 升级处理 | notion, slack |
| Incident commander | Sentry 告警 → Linear 工单 → Slack 战情室 | sentry, linear, slack, github |
| Feedback miner | Slack/Notion 反馈 → 主题聚类 → Asana 任务 | slack, notion, asana |
| Sprint retro facilitator | Linear Sprint → 主题综合 → 回顾文档 | linear, slack, docx |
| Support-to-eng escalator | Intercom 对话 → Bug 复现 → Jira 工单 | intercom, atlassian, slack |
| Data analyst | 数据加载/探索/可视化/报告 | amplitude |

## 附录 B: 参考链接

| 资源 | URL |
|------|-----|
| Claude Platform Console | https://platform.claude.com |
| Managed Agents 概述 | https://platform.claude.com/docs/en/managed-agents/overview |
| Agent 设置 | https://platform.claude.com/docs/en/managed-agents/agent-setup |
| 工具系统 | https://platform.claude.com/docs/en/managed-agents/tools |
| MCP 连接器 | https://platform.claude.com/docs/en/managed-agents/mcp-connector |
| 权限策略 | https://platform.claude.com/docs/en/managed-agents/permission-policies |
| 技能系统 | https://platform.claude.com/docs/en/managed-agents/skills |
| 云环境 | https://platform.claude.com/docs/en/managed-agents/environments |
| 容器规格 | https://platform.claude.com/docs/en/managed-agents/cloud-containers |
| 会话管理 | https://platform.claude.com/docs/en/managed-agents/sessions |
| 事件与流式传输 | https://platform.claude.com/docs/en/managed-agents/events-and-streaming |
| 定义结果 | https://platform.claude.com/docs/en/managed-agents/define-outcomes |
| 凭证管理 | https://platform.claude.com/docs/en/managed-agents/vaults |
| GitHub 集成 | https://platform.claude.com/docs/en/managed-agents/github |
| 文件管理 | https://platform.claude.com/docs/en/managed-agents/files |
| 记忆系统 | https://platform.claude.com/docs/en/managed-agents/memory |
| 多 Agent | https://platform.claude.com/docs/en/managed-agents/multi-agent |
| 工程博客 | https://anthropic.com/engineering/managed-agents |
| Python SDK | https://github.com/anthropics/anthropic-sdk-python |
| Cookbook 示例 | https://github.com/anthropics/anthropic-cookbook/managed_agents/ |
