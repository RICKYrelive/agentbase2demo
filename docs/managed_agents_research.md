# Anthropic Managed Agents — 综合研究报告

## 概述
**Anthropic Managed Agents** 是 Anthropic API 平台的一项新功能（目前处于 Beta 阶段），为通过 Anthropic API 构建和运行 AI Agent 提供完全托管的基础设施。该功能随 Beta 请求头 `managed-agents-2026-04-01` 一起发布。Anthropic 工程博客将其描述为"规模化托管 Agent：大脑与双手的解耦"。

## 核心概念
Managed Agents 是一个**元框架（meta-harness）**——一个具有通用接口的系统，可以承载多种不同的执行框架。它对 Claude 周围的接口有着明确的设计理念：
- 通过 **Session（会话）** 进行**状态操作**（持久化事件日志）
- 通过 **Sandbox（沙箱）** 进行**计算**（基于容器的执行环境）
- 可扩展至多个大脑（Claude 实例）和多个双手（执行环境）

关键的架构洞察是**大脑与双手的解耦**：编排层（harness）不再运行在容器内部。相反，容器由大脑通过工具调用进行配置（`execute(name, input) → string`）。这使得任何自定义工具、任何 MCP 服务器和任何内置工具都可以共享同一个接口。

## API 架构（6 大核心资源）

### 1. Environments（环境）
**端点**：`/v1/environments?beta=true`
- 定义会话的容器配置
- **创建**：`anthropic.beta.environments.create(name=...)`
  - 参数：`name`（必填）、`config`（云配置）、`description`、`metadata`

### 2. Agents（智能体）
**端点**：`/v1/agents?beta=true`
- 包含模型、系统提示词、工具、技能和 MCP 服务器的版本化 Agent 定义
- **创建**：`POST /v1/agents?beta=true`
  - `model`：必填。接受模型字符串（`claude-opus-4-6`、`claude-sonnet-4-6`、`claude-haiku-4-5` 等）或包含 `id` 和可选 `speed`（"standard" 或 "fast"）的 `model_config` 对象
  - `name`：必填。1-256 个字符
  - `system`：可选。系统提示词，最多 100,000 个字符
  - `description`：可选。最多 2,048 个字符
  - `tools`：可选。工具配置（所有工具集总计最多 128 个）
  - `skills`：可选。Agent 的技能（最多 20 个）
  - `mcp_servers`：可选。MCP 服务器连接（最多 20 个，名称唯一）
  - `metadata`：可选。最多 16 个键值对
- **查询**：`GET /v1/agents/{agent_id}?beta=true`（可选 `version` 参数）
- **更新**：`POST /v1/agents/{agent_id}?beta=true` — 需要 `version` 以实现乐观并发控制
- **列表**：`GET /v1/agents?beta=true` — 支持分页、日期过滤、`include_archived`
- **归档**：`POST /v1/agents/{agent_id}/archive?beta=true`
- **版本**：子资源位于 `/v1/agents/{agent_id}/versions`
- Agent 版本从 1 开始，每次修改后递增

### 3. Sessions（会话）
**端点**：`/v1/sessions?beta=true`
- Agent 在某个环境中的运行实例
- **创建**：`POST /v1/sessions?beta=true`
  - `agent`：Agent 引用 — 可以是 `{type: "agent", id, version}` 或仅 Agent ID 字符串
  - `environment_id`：必填。关联到某个环境
  - `resources`：要挂载到容器中的文件/仓库
  - `vault_ids`：会话的凭证保管库
  - `metadata`：键值对
  - `title`：人类可读标题
- **会话状态**：`rescheduling`（重新调度）、`running`（运行中）、`idle`（空闲）、`terminated`（已终止）
- **会话统计**：`active_seconds`（运行时间）、`duration_seconds`（总经过时间）
- **会话用量**：`input_tokens`、`output_tokens`、`cache_read_input_tokens`、`cache_creation`

### 4. Session Events（会话事件）
**端点**：`/v1/sessions/{session_id}/events?beta=true`
- 核心交互机制——事件流协议
- **发送事件**：`POST /v1/sessions/{session_id}/events?beta=true`
- **流式获取事件**：`GET /v1/sessions/{session_id}/events?beta=true`（SSE 流）
- **列出事件**：`GET /v1/sessions/{session_id}/events?beta=true`（分页）

**用户事件类型**（你发送的事件）：
- `user.message` — 向 Agent 发送的文本消息
- `user.interrupt` — 中断 Agent
- `user.tool_confirmation` — 确认/拒绝需要审批的工具使用
- `user.custom_tool_result` — 返回自定义工具的执行结果

**Agent 事件类型**（你接收到的事件）：
- `agent.message` — Agent 文本回复
- `agent.thinking` — Agent 思考/推理过程
- `agent.tool_use` — 内置工具集工具调用
- `agent.tool_result` — 内置工具集工具结果
- `agent.custom_tool_use` — 自定义工具调用（需要通过 `user.custom_tool_result` 响应）
- `agent.mcp_tool_use` — MCP 服务器工具调用
- `agent.mcp_tool_result` — MCP 服务器工具结果
- `agent.thread_context_compacted` — 上下文窗口压缩事件

**系统事件类型**：
- `session.status_rescheduled` — 会话正在重新调度
- `session.status_running` — 会话正在运行
- `session.status_idle` — 会话进入空闲状态（检查 `stop_reason.type` 是否为 "end_turn"）
- `session.status_terminated` — 会话已终止
- `session.error` — 错误事件
- `session.deleted` — 会话已删除
- `span.model_request_start` / `span.model_request_end` — 模型请求追踪

### 5. Vaults & Credentials（保管库与凭证）
**端点**：`/v1/vaults?beta=true`
- 为 MCP 服务器提供安全的凭证存储
- **创建保管库**：`anthropic.beta.vaults.create(display_name=...)`
- **创建凭证**：支持多种认证类型：
  - `static_bearer` — 静态 Bearer Token，包含 `mcp_server_url` 和 `token`
  - MCP OAuth（多种流程：`auth_none`、`auth_basic`、`auth_post`）
- 保管库通过 `vault_ids` 参数附加到会话

### 6. Skills（技能）
**端点**：`/v1/skills?beta=true`
- Agent 的可复用能力包
- **两种类型**：
  - `anthropic` 技能 — Anthropic 预置技能（如 "xlsx"）
  - `custom` 技能 — 用户上传的技能文件（Markdown 格式）
- 每个 Agent 最多 20 个技能

## 工具类型（3 大类别）

### Agent 工具集（`agent_toolset_20260401`）
- Anthropic 为沙箱执行提供的内置工具
- 可通过 `default_config` 配置：
  - `enabled`：布尔值
  - `permission_policy`：`"always_allow"` 或 `"always_ask"`

### MCP 工具集（`mcp_toolset`）
- 连接到 `mcp_servers` 中定义的外部 MCP 服务器
- 通过 `mcp_server_name` 引用

### 自定义工具（`custom`）
- 用户定义的工具，包含 `name`、`description`、`input_schema`
- 当 Agent 调用自定义工具时，你会收到 `agent.custom_tool_use` 事件
- 你通过 `user.custom_tool_result` 响应包含结果

## 资源类型（挂载到会话中）

### 文件资源
- 通过 Files API 上传，然后使用 `file_id` 和可选的 `mount_path` 挂载
- 默认挂载路径：`/mnt/session/uploads/<file_id>`

### GitHub 仓库资源
- 使用 `url`、`authorization_token` 挂载 GitHub 仓库
- 可选 `checkout`（分支或提交 SHA）
- 默认挂载路径：`/workspace/<仓库名>`

## 架构：大脑 ↔ 双手解耦

工程博客描述了一个关键的架构演进：

1. **旧架构（耦合）**：大脑 + 编排框架 + 沙箱全部在一个容器内。问题：安全边界问题（不可信代码可以访问凭证）、扩展问题（每个大脑一个容器）以及"宠物式"基础设施模型。

2. **新架构（解耦）**：
   - **大脑** = Claude + 编排框架（运行在容器外部）
   - **双手** = 执行沙箱（容器、手机或任何环境）
   - **会话** = 持久化事件日志
   - 接口：`execute(name, input) → string` — 所有工具统一接口
   - 优势：p50 TTFT 降低约 60%，p95 降低约 90%；多个大脑共享基础设施；双手可以替换；大脑之间可以传递双手

3. **元框架设计**：对接口有明确规范，对具体框架实现不做限制。Claude Code 是一个示例框架；客户自建的框架也可以在该平台上运行。

## SDK 支持
- **Python SDK**：通过 `anthropic.beta.agents`、`anthropic.beta.sessions`、`anthropic.beta.environments`、`anthropic.beta.vaults`、`anthropic.beta.skills`、`anthropic.beta.files` 完整支持
- **TypeScript SDK**：通过 `client.beta.agents`、`client.beta.sessions` 等完整支持
- 所有方法需要 Beta 请求头：`anthropic-beta: managed-agents-2026-04-01`

## 示例 Cookbook Notebook
Anthropic Cookbook 仓库包含以下托管 Agent 示例：
- `CMA_explore_unfamiliar_codebase.ipynb` — 探索陌生代码库
- `CMA_gate_human_in_the_loop.ipynb` — 人工审批流程
- `CMA_iterate_fix_failing_tests.ipynb` — 迭代修复失败测试
- `CMA_operate_in_production.ipynb` — 生产环境运维
- `CMA_orchestrate_issue_to_pr.ipynb` — 从 Issue 到 PR 的全流程编排
- `CMA_prompt_versioning_and_rollback.ipynb` — 提示词版本管理与回滚
- `data_analyst_agent.ipynb` — 数据分析 Agent
- `slack_data_bot.ipynb` — Slack 数据机器人
- `sre_incident_responder.ipynb` — SRE 事件响应

## 简单示例（Python SDK）

```python
from anthropic import Anthropic

client = Anthropic()

# 1. 创建环境
environment = client.beta.environments.create(name="my-env")

# 2. 创建 Agent
agent = client.beta.agents.create(
    name="my-agent",
    model="claude-sonnet-4-6",
    system="你是一个有用的助手。",
    tools=[{"type": "agent_toolset_20260401"}],
)

# 3. 创建会话
session = client.beta.sessions.create(
    environment_id=environment.id,
    agent={"type": "agent", "id": agent.id, "version": agent.version},
)

# 4. 发送消息并流式接收响应
client.beta.sessions.events.send(
    session.id,
    events=[{"type": "user.message", "content": [{"type": "text", "text": "你好！"}]}],
)

with client.beta.sessions.events.stream(session.id) as stream:
    for event in stream:
        print(event)
        if event.type == "session.status_idle":
            break
```

## 定价
- Managed Agents 的定价文档未单独说明（由于地区限制文档无法访问）
- 底层模型使用标准 Claude 模型定价（如 Claude Sonnet 4.6：输入 $3/百万 Token，输出 $15/百万 Token）
- 沙箱环境可能产生额外基础设施费用，详情在无法访问的文档中
- 模型配置支持 `speed: "fast"` 以获得更快的推理速度，但需支付溢价

## 关键限制
- 每个 Agent 所有工具集总计最多 128 个工具
- 每个 Agent 最多 20 个 MCP 服务器
- 每个 Agent 最多 20 个技能
- 最多 16 个 metadata 键值对
- 系统提示词：最多 100,000 个字符
- Agent 名称：1-256 个字符
- 描述：最多 2,048 个字符

## 参考资料
- **SDK 源码**：https://github.com/anthropics/anthropic-sdk-python（类型定义和资源）
- **工程博客**：https://anthropic.com/engineering/managed-agents（"Scaling Managed Agents: Decoupling the brain from the hands"）
- **Cookbook 示例**：https://github.com/anthropics/anthropic-cookbook/managed_agents/
- **官方文档**：https://docs.anthropic.com/en/docs/agents-and-tools/managed-agents（本环境因地区限制无法访问）
