# Claude Managed Agents 用户需求文档

> 基于 Claude Platform 官方文档整理
> 来源：https://platform.claude.com/docs/en/managed-agents/
> 整理日期：2026-04-12

---

## 目录

1. [概述](#1-概述)
2. [Agent 定义与配置](#2-agent-定义与配置)
   - 2.1 [Agent 创建](#21-agent-创建)
   - 2.2 [工具系统 (Tools)](#22-工具系统-tools)
   - 2.3 [MCP 连接器](#23-mcp-连接器)
   - 2.4 [权限策略](#24-权限策略)
   - 2.5 [技能系统 (Skills)](#25-技能系统-skills)
3. [环境配置](#3-环境配置)
   - 3.1 [云环境设置](#31-云环境设置)
   - 3.2 [容器规格参考](#32-容器规格参考)
4. [会话管理](#4-会话管理)
   - 4.1 [创建会话](#41-创建会话)
   - 4.2 [事件与流式传输](#42-事件与流式传输)
5. [委托工作](#5-委托工作)
   - 5.1 [定义结果 (Outcomes)](#51-定义结果-outcomes)
   - 5.2 [凭证管理 (Vaults)](#52-凭证管理-vaults)
   - 5.3 [访问 GitHub](#53-访问-github)
   - 5.4 [文件管理](#54-文件管理)
   - 5.5 [记忆系统 (Memory)](#55-记忆系统-memory)
6. [高级编排](#6-高级编排)
   - 6.1 [多 Agent 会话](#61-多-agent-会话)
7. [限制与配额汇总](#7-限制与配额汇总)
8. [API 约定](#8-api-约定)

---

## 1. 概述

**Claude Managed Agents** 是 Anthropic 推出的 Agent 托管平台产品（Beta）。其核心理念是 **"Decoupling brain from hands"（脑手分离）** —— 将 Agent 的编排逻辑运行在容器之外，通过统一的 `execute(name, input) → string` 接口与云端的沙箱容器交互。

### 核心概念

| 概念 | 说明 |
|------|------|
| **Agent** | 可复用的 Agent 定义，包含模型、系统提示、工具、MCP 服务器和技能 |
| **Environment** | 云端容器配置，定义运行环境（包、网络策略等） |
| **Session** | Agent 的运行实例，绑定一个 Agent + 一个 Environment |
| **Vault** | 凭证存储集合，用于 MCP OAuth 和静态 Token 认证 |
| **Skill** | 可复用的能力包，分为 Anthropic 预置和用户自定义两类 |
| **Memory Store** | 跨会话持久记忆存储，Agent 可自动读写 |
| **Outcome** | 定义"完成"标准，Agent 自评估迭代直到满足目标 |

### 架构流程

```
用户/应用 → 创建 Agent (定义模型、工具、技能)
         → 创建 Environment (配置容器环境)
         → 创建 Session (Agent + Environment + Vault + Memory + Files)
         → 发送消息/定义结果
         → Agent 在云容器中执行，通过事件流返回进度
         → 获取输出文件/结果
```

> 来源：https://platform.claude.com/docs/en/managed-agents/overview

---

## 2. Agent 定义与配置

### 2.1 Agent 创建

创建 Agent 时需配置以下核心字段：

| 字段 | 必填 | 说明 |
|------|------|------|
| `name` | 是 | Agent 名称 |
| `model` | 是 | 模型 ID，如 `claude-sonnet-4-6` |
| `system` | 否 | 系统提示词 |
| `tools` | 否 | 工具列表 |
| `mcp_servers` | 否 | MCP 服务器声明列表 |
| `skills` | 否 | 技能列表（最多 20 个） |
| `callable_agents` | 否 | 可调用的子 Agent 列表（多 Agent 编排用） |

**示例（CLI）：**
```bash
ant beta:agents create <<'YAML'
name: Coding Assistant
model: claude-sonnet-4-6
system: You are an expert coding assistant.
tools:
  - type: agent_toolset_20260401
mcp_servers:
  - type: url
    name: github
    url: https://mcp.example.com/github
skills:
  - type: prebuilt
    skill_id: xlsx
YAML
```

> 来源：https://platform.claude.com/docs/en/managed-agents/agent-setup

---

### 2.2 工具系统 (Tools)

Managed Agents 支持三种工具类型：

#### 2.2.1 Agent Toolset（内置沙箱工具）

类型标识：`agent_toolset_20260401`

包含以下内置工具：
- **Bash** — 在容器中执行 shell 命令
- **文件操作** — 读取、写入、搜索文件
- **Web 搜索** — 搜索互联网内容
- **Web 获取** — 获取网页内容

#### 2.2.2 MCP Toolset（外部 MCP 服务器工具）

类型标识：`mcp_toolset`

通过 MCP 协议连接外部工具服务器，每个 MCP 服务器对应一个独立的工具集。

配置时需指定 `mcp_server_name`，与 Agent 定义中的 `mcp_servers` 数组中的 `name` 对应。

#### 2.2.3 Custom Tools（自定义工具）

由应用层实现，Agent 发出 `agent.custom_tool_use` 事件，应用收到后自行执行并返回 `user.custom_tool_result`。

#### 工具数量限制

| 类别 | 上限 |
|------|------|
| 总工具数 | 128 个 |
| MCP 服务器数 | 20 个 |
| 技能数 | 20 个 |

> 来源：https://platform.claude.com/docs/en/managed-agents/tools

---

### 2.3 MCP 连接器

在 Agent 定义中声明 MCP 服务器：

```yaml
mcp_servers:
  - type: url
    name: github
    url: https://api.githubcopilot.com/mcp/
```

**关键特性：**
- 支持 Streamable HTTP 传输协议
- 认证通过 Vault 在会话创建时传入（`vault_ids`）
- MCP 工具集默认权限策略为 `always_ask`（需用户确认）
- 每个 MCP 服务器对应一个独立的 `mcp_toolset` 工具定义

**认证流程：**
1. 在 Vault 中创建凭证（OAuth 或静态 Bearer Token）
2. 凭证绑定到 `mcp_server_url`
3. 创建会话时传入 `vault_ids`
4. 平台自动将凭证注入 MCP 连接

> 来源：https://platform.claude.com/docs/en/managed-agents/mcp-connector

---

### 2.4 权限策略

控制 Agent 和 MCP 工具是否自动执行或等待审批。

#### 策略类型

| 策略 | 行为 |
|------|------|
| `always_allow` | 工具自动执行，无需确认 |
| `always_ask` | 会话发出 `session.status_idle` 事件，等待 `user.tool_confirmation` 事件后再执行 |

#### 默认策略

| 工具类型 | 默认策略 |
|----------|----------|
| Agent Toolset | `always_allow`（如不指定 `default_config`） |
| MCP Toolset | `always_ask`（确保新添加的工具不会未经批准执行） |
| Custom Tools | 不适用（由应用层自行控制） |

#### Agent Toolset 权限配置

```yaml
tools:
  - type: agent_toolset_20260401
    default_config:
      permission_policy:
        type: always_ask
```

#### MCP Toolset 权限配置

```yaml
tools:
  - type: mcp_toolset
    mcp_server_name: github
    default_config:
      permission_policy:
        type: always_allow
```

#### 单工具策略覆盖

通过 `configs` 数组对特定工具设置不同策略：

```json
{
  "type": "agent_toolset_20260401",
  "default_config": {
    "permission_policy": {"type": "always_allow"}
  },
  "configs": [
    {
      "name": "bash",
      "permission_policy": {"type": "always_ask"}
    }
  ]
}
```

#### 确认请求处理流程

1. Agent 调用 `always_ask` 策略的工具
2. 会话发出 `agent.tool_use` 或 `agent.mcp_tool_use` 事件
3. 会话暂停，发出 `session.status_idle` 事件（`stop_reason: requires_action`）
4. 应用发送 `user.tool_confirmation` 事件，`result` 为 `"allow"` 或 `"deny"`
5. 所有阻塞事件解决后，会话恢复运行

> 来源：https://platform.claude.com/docs/en/managed-agents/permission-policies

---

### 2.5 技能系统 (Skills)

Skills 是可复用的能力包，附加在 Agent 定义上，按需加载。

#### 技能类型

| 类型 | 说明 | 来源 |
|------|------|------|
| 预置技能 | `xlsx`、`pptx`、`docx`、`pdf` | Anthropic 内置 |
| 自定义技能 | 组织创建，通过 `skill_id` 引用 | 用户上传 |

#### 使用限制

- 每个 Agent 最多 20 个技能
- 每个会话最多 20 个技能
- 技能附加在 Agent 定义上，运行时按需加载

**示例：**
```yaml
skills:
  - type: prebuilt
    skill_id: xlsx
  - type: prebuilt
    skill_id: pdf
  - type: custom
    skill_id: my_org_custom_skill
```

> 来源：https://platform.claude.com/docs/en/managed-agents/skills

---

## 3. 环境配置

### 3.1 云环境设置

Environment 定义 Agent 运行的云端容器配置。

#### 包管理器支持

| 包管理器 | 说明 |
|----------|------|
| `apt` | 系统包 |
| `cargo` | Rust 包 |
| `gem` | Ruby 包 |
| `go` | Go 模块 |
| `npm` | Node.js 包 |
| `pip` | Python 包 |

#### 网络配置

| 模式 | 说明 |
|------|------|
| `unrestricted` | 无限制网络访问 |
| `limited` | 仅允许 `allowed_hosts` 列表中的域名 |

#### 生命周期

- 容器创建后持续存在，直到被归档或删除
- 同一 Environment 可被多个会话复用

> 来源：https://platform.claude.com/docs/en/managed-agents/environments

---

### 3.2 容器规格参考

#### 编程语言（预装）

| 语言 | 版本 | 包管理器 |
|------|------|----------|
| Python | 3.12+ | pip, uv |
| Node.js | 20+ | npm, yarn, pnpm |
| Go | 1.22+ | go modules |
| Rust | 1.77+ | cargo |
| Java | 21+ | maven, gradle |
| Ruby | 3.3+ | bundler, gem |
| PHP | 8.3+ | composer |
| C/C++ | GCC 13+ | make, cmake |

#### 数据库

| 数据库 | 说明 |
|--------|------|
| SQLite | 预装，立即可用 |
| PostgreSQL 客户端 | psql，连接外部数据库 |
| Redis 客户端 | redis-cli，连接外部实例 |

> 注意：容器内不运行数据库服务器（PostgreSQL、Redis 等），仅提供客户端工具。SQLite 可完全本地使用。

#### 系统工具

- **版本控制**：git
- **HTTP 客户端**：curl, wget
- **JSON 处理**：jq
- **归档工具**：tar, zip, unzip
- **远程访问**：ssh, scp（需启用网络）
- **终端复用**：tmux, screen
- **构建系统**：make, cmake
- **容器管理**：docker（有限可用）
- **文件搜索**：ripgrep (rg)
- **目录可视化**：tree
- **进程监控**：htop
- **文本编辑器**：sed, awk, grep, vim, nano, diff, patch

#### 容器规格

| 属性 | 值 |
|------|------|
| 操作系统 | Ubuntu 22.04 LTS |
| 架构 | x86_64 (amd64) |
| 内存 | 最高 8 GB |
| 磁盘空间 | 最高 10 GB |
| 网络 | 默认禁用（需在环境配置中启用） |

> 来源：https://platform.claude.com/docs/en/managed-agents/cloud-containers

---

## 4. 会话管理

### 4.1 创建会话

Session 是 Agent 的运行实例，绑定以下资源：

```json
{
  "agent": "$agent_id",
  "environment_id": "$environment_id",
  "title": "可选标题",
  "vault_ids": ["$vault_id"],
  "resources": [
    {
      "type": "memory_store",
      "memory_store_id": "$store_id",
      "access": "read_write"
    },
    {
      "type": "file",
      "file_id": "$file_id",
      "mount_path": "/workspace/data.csv"
    },
    {
      "type": "github_repository",
      "url": "https://github.com/org/repo",
      "mount_path": "/workspace/repo",
      "authorization_token": "ghp_..."
    }
  ]
}
```

**会话资源类型：**

| 资源类型 | 说明 |
|----------|------|
| `memory_store` | 记忆存储，支持 `read_write` 或 `read_only` |
| `file` | 文件挂载，通过 Files API 上传 |
| `github_repository` | GitHub 仓库挂载 |

#### 发送消息

```bash
curl -fsSL "https://api.anthropic.com/v1/sessions/$SESSION_ID/events" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01" \
  -H "content-type: application/json" \
  -d '{
    "events": [{
      "type": "user.message",
      "content": [{"type": "text", "text": "帮我分析这个CSV文件"}]
    }]
  }'
```

> 来源：https://platform.claude.com/docs/en/managed-agents/sessions

---

### 4.2 事件与流式传输

会话通过 SSE (Server-Sent Events) 事件流实时推送状态更新。

#### 事件分类

| 分类 | 事件类型 | 说明 |
|------|----------|------|
| **会话状态** | `session.status_running` | Agent 正在处理 |
|  | `session.status_idle` | Agent 等待输入 |
|  | `session.status_error` | 发生错误 |
| **Agent 输出** | `session.output_text_delta` | 文本增量输出 |
|  | `agent.message` | Agent 完整消息 |
| **工具调用** | `agent.tool_use` | Agent 调用内置工具 |
|  | `agent.mcp_tool_use` | Agent 调用 MCP 工具 |
|  | `agent.custom_tool_use` | Agent 调用自定义工具 |
| **用户交互** | `user.tool_confirmation` | 工具确认（allow/deny） |
|  | `user.custom_tool_result` | 自定义工具结果 |
| **结果** | `session.summary` | 会话摘要 |
| **结果评估** | `span.outcome_evaluation_start` | 评估开始 |
|  | `span.outcome_evaluation_ongoing` | 评估进行中 |
|  | `span.outcome_evaluation_end` | 评估结束 |
| **多 Agent** | `session.thread_created` | 子线程创建 |
|  | `session.thread_idle` | 子线程空闲 |
|  | `agent.thread_message_sent` | 线程间消息发送 |
|  | `agent.thread_message_received` | 线程间消息接收 |

#### 流式连接

```bash
curl -fsSN "https://api.anthropic.com/v1/sessions/$SESSION_ID/stream" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01"
```

#### 历史事件查询

```bash
curl -fsSL "https://api.anthropic.com/v1/sessions/$SESSION_ID/events" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01"
```

> 来源：https://platform.claude.com/docs/en/managed-agents/events-and-streaming

---

## 5. 委托工作

### 5.1 定义结果 (Outcomes)

> **注意：Outcomes 是 Research Preview 功能，需额外申请。**

Outcomes 将会话从"对话"提升为"工作"。定义完成标准和质量衡量方式后，Agent 自评估并迭代直到满足目标。

#### 核心机制

1. 用户定义结果描述（`description`）和评分标准（`rubric`）
2. 平台自动创建独立的评分器（Grader），使用独立上下文窗口
3. 评分器返回逐条标准评估：通过或指出差距
4. 反馈传递给 Agent 进行下一轮迭代

#### 评分标准（Rubric）

Rubric 是一个 Markdown 文档，描述逐条评分标准。可内联传递或通过 Files API 上传复用。

**Rubric 示例：**
```markdown
# DCF 模型评分标准

## 收入预测
- 使用最近5个财年的历史收入数据
- 至少预测未来5年收入
- 增长率假设明确且合理

## 折现率
- WACC 计算包含权益成本和债务成本假设
- Beta、无风险利率和权益风险溢价有来源或说明

## 输出质量
- 所有数据在单个 .xlsx 文件中，工作表标签清晰
- 关键假设在单独的"假设"工作表上
- 包含 WACC 和终值增长率的敏感性分析
```

#### 创建 Outcomes 会话

```json
{
  "type": "user.define_outcome",
  "description": "构建 Costco 的 DCF 模型 (.xlsx)",
  "rubric": {"type": "text", "content": "# DCF 模型评分标准\n..."},
  "max_iterations": 5
}
```

| 参数 | 说明 |
|------|------|
| `description` | 任务描述 |
| `rubric` | 评分标准，支持 `text`（内联）或 `file`（Files API 上传） |
| `max_iterations` | 最大迭代次数，默认 3，最大 20 |

#### 评估结果

| 结果 | 后续动作 |
|------|----------|
| `satisfied` | 会话进入 idle |
| `needs_revision` | Agent 开始新一轮迭代 |
| `max_iterations_reached` | 不再评估，Agent 可做最终修订 |
| `failed` | 评分标准与任务不匹配 |
| `interrupted` | 用户中断 |

#### 获取输出

Agent 将输出文件写入容器内 `/mnt/session/outputs/`。会话 idle 后通过 Files API 获取：

```bash
# 列出会话产出的文件
curl -fsSL "https://api.anthropic.com/v1/files?scope_id=$SESSION_ID" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-beta: files-api-2025-04-14,managed-agents-2026-04-01-research-preview"

# 下载文件
curl -fsSL "https://api.anthropic.com/v1/files/$FILE_ID/content" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-beta: files-api-2025-04-14" \
  -o output.xlsx
```

> 来源：https://platform.claude.com/docs/en/managed-agents/define-outcomes

---

### 5.2 凭证管理 (Vaults)

Vault 是用户级别的凭证集合，用于 MCP 服务器认证。

#### 核心特性

- 每个 Vault 最多 20 个凭证
- 支持 OAuth（自动刷新 Token）和静态 Bearer Token
- 凭证绑定到 `mcp_server_url`
- 在会话创建时通过 `vault_ids` 传入
- 凭证在会话期间自动重新解析（如 OAuth Token 过期自动刷新）

#### 使用方式

1. 在 Claude Console 或 API 中创建 Vault
2. 添加凭证（OAuth 或 Bearer Token）
3. 凭证自动绑定到对应 MCP 服务器 URL
4. 创建会话时引用 Vault ID

> 来源：https://platform.claude.com/docs/en/managed-agents/vaults

---

### 5.3 访问 GitHub

Agent 可以克隆、读取 GitHub 仓库，并通过 GitHub MCP 创建 Pull Request。

#### 挂载 GitHub 仓库

在会话的 `resources` 中声明：

```json
{
  "type": "github_repository",
  "url": "https://github.com/org/repo",
  "mount_path": "/workspace/repo",
  "authorization_token": "ghp_your_github_token"
}
```

**关键特性：**
- 仓库会被缓存，后续使用相同仓库的会话启动更快
- `authorization_token` 不会在 API 响应中回显
- 支持多仓库挂载（多个 `github_repository` 资源条目）
- 支持运行中会话的 Token 轮换
- 每个会话最多 100 个文件资源

#### Token 权限建议

| 操作 | 所需 Scope |
|------|------------|
| 克隆私有仓库 | `repo` |
| 创建 PR | `repo` |
| 读取 Issues | `repo`（私有）或 `public_repo`（公开） |
| 创建 Issues | `repo`（私有）或 `public_repo`（公开） |

> 建议使用细粒度个人访问令牌（Fine-grained PAT），避免使用过宽权限的令牌。

#### 配合 GitHub MCP

Agent 定义中声明 GitHub MCP 服务器后，Agent 可自动创建分支、提交代码、推送并创建 PR。

> 来源：https://platform.claude.com/docs/en/managed-agents/github

---

### 5.4 文件管理

#### 上传文件

通过 Files API 上传：

```bash
file=$(curl --fail-with-body -sS "https://api.anthropic.com/v1/files" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-beta: files-api-2025-04-14" \
  -F file=@data.csv)
file_id=$(jq -r '.id' <<< "$file")
```

#### 挂载文件到会话

在创建会话时通过 `resources` 挂载：

```json
{
  "type": "file",
  "file_id": "file_abc123",
  "mount_path": "/workspace/data.csv"
}
```

- 最多 100 个文件/会话
- 文件在容器内为只读副本，Agent 写入新路径以创建修改版本
- 父目录自动创建
- 路径需为绝对路径

#### 运行中会话的文件管理

- 可通过 `resources` API 动态添加/删除文件
- 每个 Session 内的文件副本不占用存储配额

#### 支持的文件类型

- 源代码（.py, .js, .ts, .go, .rs 等）
- 数据文件（.csv, .json, .xml, .yaml）
- 文档（.txt, .md）
- 归档文件（.zip, .tar.gz）— Agent 可用 bash 解压
- 二进制文件 — Agent 可用适当工具处理

> 来源：https://platform.claude.com/docs/en/managed-agents/files

---

### 5.5 记忆系统 (Memory)

> **注意：Agent Memory 是 Research Preview 功能，需额外申请。**

Memory Stores 让 Agent 拥有跨会话的持久记忆。

#### 核心概念

| 概念 | 说明 |
|------|------|
| **Memory Store** | 工作区级别的文本文档集合，ID 格式 `memstore_...` |
| **Memory** | Store 中的单条记忆，支持路径（path）和内容（content） |
| **Memory Version** | 每次修改创建的不可变版本，用于审计和回滚，ID 格式 `memver_...` |

#### 工作流程

1. **创建 Memory Store**：指定 `name` 和 `description`
2. **预填充内容**（可选）：写入参考材料
3. **附加到会话**：在 `resources[]` 中声明，支持 `read_write` 或 `read_only`
4. **Agent 自动使用**：任务开始前自动检查，任务完成时自动写入学习

#### 记忆工具（Agent 自动获得）

| 工具 | 说明 |
|------|------|
| `memory_list` | 列出 Store 中的记忆，支持路径前缀过滤 |
| `memory_search` | 全文搜索记忆内容 |
| `memory_read` | 读取单条记忆内容 |
| `memory_write` | 创建或覆盖记忆 |
| `memory_edit` | 修改现有记忆 |
| `memory_delete` | 删除记忆 |

#### API 管理

- **创建**：`POST /v1/memory_stores`
- **列出记忆**：`GET /v1/memory_stores/:id/memories`（支持 `path_prefix` 过滤）
- **读取记忆**：`GET /v1/memory_stores/:id/memories/:memory_id`
- **写入/覆盖**：`POST /v1/memory_stores/:id/memories`（通过 `path` upsert）
- **更新**：`PATCH /v1/memory_stores/:id/memories/:memory_id`
- **删除**：`DELETE /v1/memory_stores/:id/memories/:memory_id`
- **版本审计**：`GET /v1/memory_stores/:id/memory_versions`
- **版本内容**：`GET /v1/memory_stores/:id/memory_versions/:version_id`
- **版本擦除**：`POST /v1/memory_stores/:id/memory_versions/:version_id/redact`

#### 并发安全

- **创建保护**：`precondition: {"type": "not_exists"}`，避免覆盖已有内容（返回 409）
- **更新保护**：`precondition: {"type": "content_sha256", "content_sha256": "..."}`，乐观并发控制

#### 限制

- 每条记忆最大 100KB（约 25K tokens）
- 每个会话最多 8 个 Memory Store
- 每个会话的记忆 prompt 最大 4,096 字符

> 来源：https://platform.claude.com/docs/en/managed-agents/memory

---

## 6. 高级编排

### 6.1 多 Agent 会话

> **注意：Multiagent 是 Research Preview 功能，需额外申请。**

多 Agent 编排让一个协调者 Agent 协调其他 Agent 并行完成复杂工作。

#### 工作原理

- 所有 Agent **共享同一容器和文件系统**
- 每个 Agent 运行在独立的 **Session Thread**（上下文隔离）
- 主线程（Primary Thread）= 会话级事件流
- 子线程在运行时由协调者按需创建
- **Thread 是持久的**：协调者可回访之前调用的 Agent，保留全部历史

#### 声明可调用 Agent

在 Agent 定义中通过 `callable_agents` 声明：

```yaml
name: Engineering Lead
model: claude-sonnet-4-6
system: |
  你是工程负责人。将代码审查委派给 reviewer agent，
  将测试编写委派给 test agent。
tools:
  - type: agent_toolset_20260401
callable_agents:
  - type: agent
    id: $REVIEWER_AGENT_ID
    version: $REVIEWER_AGENT_VERSION
  - type: agent
    id: $TEST_WRITER_AGENT_ID
    version: $TEST_WRITER_AGENT_VERSION
```

**限制：仅支持一级委派** — 协调者可调用其他 Agent，但被调用的 Agent 不能再调用 Agent。

#### 典型使用场景

| 场景 | 说明 |
|------|------|
| 代码审查 | 审查 Agent 使用专注的系统提示和只读工具 |
| 测试生成 | 测试 Agent 编写和运行测试，不接触生产代码 |
| 研究 | 搜索 Agent 使用 Web 工具，汇总发现返回给协调者 |

#### Session Threads API

```bash
# 列出所有线程
curl -fsSL "https://api.anthropic.com/v1/sessions/$SESSION_ID/threads" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-beta: managed-agents-2026-04-01"

# 流式获取特定线程事件
curl -fsSN "https://api.anthropic.com/v1/sessions/$SESSION_ID/threads/$THREAD_ID/stream" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-beta: managed-agents-2026-04-01"

# 查询线程历史事件
curl -fsSL "https://api.anthropic.com/v1/sessions/$SESSION_ID/threads/$THREAD_ID/events" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-beta: managed-agents-2026-04-01"
```

#### 多 Agent 事件类型

| 事件 | 说明 |
|------|------|
| `session.thread_created` | 协调者创建新线程 |
| `session.thread_idle` | Agent 线程完成当前工作 |
| `agent.thread_message_sent` | Agent 向另一线程发送消息 |
| `agent.thread_message_received` | Agent 收到来自另一线程的消息 |

#### 工具权限在子线程中的处理

当子线程需要用户确认（`always_ask` 工具）或自定义工具结果时：
- 请求在会话级事件流中携带 `session_thread_id`
- 回复时需包含相同的 `session_thread_id`，平台据此路由到对应线程
- 如 `session_thread_id` 缺失，则请求来自主线程

> 来源：https://platform.claude.com/docs/en/managed-agents/multi-agent

---

## 7. 限制与配额汇总

| 资源 | 上限 |
|------|------|
| 总工具数 | 128 个 |
| MCP 服务器数 | 20 个 |
| 技能数 | 20 个 / Agent |
| 系统提示词 | 100K 字符 |
| 每会话文件数 | 100 个 |
| 每会话 Memory Store | 8 个 |
| 每条记忆大小 | 100KB (~25K tokens) |
| Memory prompt | 4,096 字符 |
| 每 Vault 凭证数 | 20 个 |
| Outcomes 最大迭代 | 20 次（默认 3） |
| 多 Agent 委派层级 | 1 级 |
| 容器内存 | 最高 8 GB |
| 容器磁盘 | 最高 10 GB |

---

## 8. API 约定

### Beta Header

所有 Managed Agents API 请求必须包含：
```
anthropic-beta: managed-agents-2026-04-01
```

Research Preview 功能（Outcomes、Memory、Multiagent）额外需要：
```
anthropic-beta: managed-agents-2026-04-01,managed-agents-2026-04-01-research-preview
```

Files API 需要：
```
anthropic-beta: files-api-2025-04-14
```

> SDK 会自动设置这些 Header。

### SDK 支持

- **Python SDK**：通过 `anthropic.beta` 命名空间
- **TypeScript SDK**：通过 `anthropic.beta` 命名空间

### 基础 API 端点

| 资源 | 端点 |
|------|------|
| Agents | `POST /v1/agents` |
| Environments | `POST /v1/environments` |
| Sessions | `POST /v1/sessions` |
| Events | `POST /v1/sessions/:id/events` |
| Event Stream | `GET /v1/sessions/:id/stream` |
| Vaults | `POST /v1/vaults` |
| Files | `POST /v1/files` |
| Memory Stores | `POST /v1/memory_stores` |
| Threads | `GET /v1/sessions/:id/threads` |
| Thread Stream | `GET /v1/sessions/:id/threads/:thread_id/stream` |

---

## 参考链接

| 文档页面 | URL |
|----------|-----|
| 概述 | https://platform.claude.com/docs/en/managed-agents/overview |
| Agent 设置 | https://platform.claude.com/docs/en/managed-agents/agent-setup |
| 工具 | https://platform.claude.com/docs/en/managed-agents/tools |
| MCP 连接器 | https://platform.claude.com/docs/en/managed-agents/mcp-connector |
| 权限策略 | https://platform.claude.com/docs/en/managed-agents/permission-policies |
| 技能 | https://platform.claude.com/docs/en/managed-agents/skills |
| 云环境设置 | https://platform.claude.com/docs/en/managed-agents/environments |
| 容器参考 | https://platform.claude.com/docs/en/managed-agents/cloud-containers |
| 会话 | https://platform.claude.com/docs/en/managed-agents/sessions |
| 事件与流式传输 | https://platform.claude.com/docs/en/managed-agents/events-and-streaming |
| 定义结果 | https://platform.claude.com/docs/en/managed-agents/define-outcomes |
| 凭证管理 | https://platform.claude.com/docs/en/managed-agents/vaults |
| 访问 GitHub | https://platform.claude.com/docs/en/managed-agents/github |
| 文件管理 | https://platform.claude.com/docs/en/managed-agents/files |
| 记忆系统 | https://platform.claude.com/docs/en/managed-agents/memory |
| 多 Agent 会话 | https://platform.claude.com/docs/en/managed-agents/multi-agent |
