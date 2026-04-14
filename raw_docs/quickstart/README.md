# Claude Platform — Managed Agents Quickstart 体验记录

> 体验时间：2026-04-14  
> 页面地址：https://platform.claude.com/workspaces/default/agent-quickstart  
> 截图数量：18 张

---

## 整体流程概览

Claude 的 Managed Agents Quickstart 是一个 **4 步骤向导式** 的 Agent 创建体验，帮助开发者快速从零到一创建、配置、测试并集成一个托管 AI Agent。

```
Step 1: Create agent (POST /v1/agents)
    ↓
Step 2: Configure environment
    ↓
Step 3: Start session (POST /v1/sessions)
    ↓
Step 4: Integrate
```

---

## Step 1 — Create Agent（创建 Agent）

**截图：** `01_page_overview.png` → `04_json_view.png`

### 功能描述
- 页面左侧是一个 **"Describe your agent..."** 的自然语言输入框，用户可以通过文字描述来生成 Agent 配置
- 页面右侧提供 **Browse templates（浏览模板）** 快速上手

### 可用模板（Template 列表）
| 模板名称 | 描述 |
|---|---|
| Blank agent config | 空白模板，标准工具集 |
| Deep researcher | 多步骤网页研究，生成引文摘要 |
| Structured extractor | 将非结构化文本解析为 JSON Schema |
| Field monitor | 扫描软件博客生成每周摘要 |
| Support agent | 基于文档/知识库回答客服问题 |
| Incident commander | Sentry 告警 → Linear 工单 → Slack 战情室 |
| Feedback miner | 从 Slack/Notion 聚类反馈并创建 Asana 任务 |
| Sprint retro facilitator | 从 Linear 拉取 sprint 数据生成回顾文档 |
| Support-to-eng escalator | Intercom 对话 → 复现 Bug → Jira 工单 |
| **Data analyst** | 加载、探索、可视化数据集，生成报告 |

### 实际操作
- 选择了 **Data analyst** 模板
- 配置包含：Agent Name、Description、System Prompt、MCP Servers（如 Magnitude）、工具列表
- 右侧实时显示 **YAML/JSON 双视图** 的 Agent 配置结构
- 点击 **"Use this template"** → 进入下一步

---

## Step 2 — Configure Environment（配置环境）

**截图：** `05_configure_environment.png` → `07_env_access_selected.png`

### 功能描述
为 Agent 的 MCP Server 配置运行时所需的环境变量和网络访问权限。

### 主要配置项
- **Environment Variables（环境变量）**：配置 MCP Server 所需的 API Key（如 `AMPLITUDE_API_KEY`）
- **Environment Template（环境模板）**：选择预装了特定 Python 包的环境（如 `data-analyst` 模板预装 `pandas`、`matplotlib`）
- **Internet Access（网络访问）**：
  - `Unrestricted`（不受限）— 本次选择
  - `Restricted`（受限）
  - `None`（无网络）

### 实际操作
- 保留了模板默认的 `data-analyst` 环境模板
- 跳过了 Amplitude API Key 的配置
- 选择 **Unrestricted** 网络访问
- 点击 **"Next: Start session"** → 进入下一步

---

## Step 3 — Start Session（启动会话）

**截图：** `08_start_session.png` → `15_session_stopped_integrate_next.png`

### 功能描述
这是最核心的步骤，在此处真实运行 Agent 并进行测试。

### Credential Vault（凭证保险库）
- 系统提示创建 Vault 以安全存储会话级别的密钥
- 本次选择 **Skip for now** 跳过

### Test Run（测试运行）
页面分为左右两栏：
- **左侧**：Agent 配置详情 + 交互指引
  - 显示 `POST /v1/sessions/{{session_id}}/events` 的 cURL 命令
  - 实时显示 Agent 接收到消息的状态提示
- **右侧**：Preview 面板，包含两个 Tab：
  - **Transcript（对话记录）**：按时间顺序显示用户消息、工具调用、Agent 回复
  - **Debug（调试日志）**：低层级事件日志，包含 token 用量、工具耗时等

### 实际测试任务
给 Data Analyst Agent 发送任务：
> "Load the CSV at https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv and tell me the survival rate broken down by passenger class and sex, then save a bar chart of the results."

### Agent 执行过程（Debug 事件流）
| 事件类型 | 内容 | 耗时 |
|---|---|---|
| Error | MCP server 'amplitude' 初始化失败（Token 无效） | 0:00:05 |
| Error | MCP server 'amplitude' 再次初始化失败 | 0:01:01 |
| User | 发送 CSV 加载 + 存活率分析任务 | 0:01:02 |
| Tool | Web Fetch（获取 CSV 文件，5.4k/98 tokens） | 0:01:04 |
| Agent | "Got the data. Now let me analyze it and generate the chart." | 0:01:13 |
| Tool | Bash（执行 Python 数据分析） | 0:01:13 |
| Tool | Bash（生成 matplotlib 图表） | 0:01:42 |
| Agent | 输出完整分析结果（泰坦尼克号按舱级和性别的存活率） | 0:01:55 |

**关键观察**：即使 Amplitude MCP Server 因缺少 Token 而失败，Agent 依然优雅地完成了数据分析任务（使用 Bash + Python 工具链）。

### cURL API 集成
页面实时展示了每次 API 调用对应的 cURL 命令，例如：
```bash
curl -X POST https://api.anthropic.com/v1/sessions/sesn_xxx/events \
  -H "Content-Type: application/json" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01" \
  -d '{"events": [{"type": "user", "text": "..."}]}'
```

---

## Step 4 — Integrate（集成）

**截图：** `16_integrate_step_view.png` → `18_quickstart_completed_dashboard.png`

### 功能描述
回顾测试结果，决定是否对配置进行调整，或直接进入生产集成。

### 总结提示
页面显示了本次 Test Run 的执行总结，并提问：
> "Would you like to make any changes before integrating?"

---

## 核心产品能力总结

| 能力 | 描述 |
|---|---|
| **模板市场** | 10+ 预置场景模板，开箱即用 |
| **MCP Server 集成** | 支持接入第三方 MCP 工具服务器 |
| **环境隔离** | 预置 Python 环境模板，按需配置包 |
| **凭证保险库** | 安全存储会话级别的 API Key |
| **实时 Debug** | 事件流、token 用量、工具调用耗时完整可观测 |
| **cURL 可见** | 每次 UI 操作同步展示对应 API 调用，便于程序化集成 |
| **优雅降级** | MCP 服务失败不影响 Agent 核心任务执行 |

---

## 截图索引

| 文件名 | 内容描述 |
|---|---|
| `01_page_overview.png` | Quickstart 首页，模板浏览界面 |
| `02_scrolled_templates.png` | 滚动后显示更多模板 |
| `03_data_analyst_clicked.png` | 点击 Data analyst 模板后的配置详情 |
| `04_json_view.png` | Agent 配置的 JSON 视图 |
| `05_configure_environment.png` | 环境配置页面 - Step 2 |
| `06_configure_env_scrolled.png` | 环境配置页面（滚动后） |
| `07_env_access_selected.png` | 选择 Unrestricted 网络访问 |
| `08_start_session.png` | 启动会话页面 - Step 3 |
| `09_vault_skipped.png` | 跳过 Credential Vault 创建 |
| `10_session_starting_after_vault_skip.png` | Vault 跳过后的会话初始化 |
| `11_after_auth_skip.png` | 跳过认证后的状态 |
| `12_test_run_started.png` | Test Run 开始，左侧配置 + 右侧 Preview |
| `13_agent_processing_titanic.png` | Agent 处理泰坦尼克数据集任务中 |
| `14_agent_transcript_view.png` | Transcript 视图 - 对话记录 |
| `15_session_stopped_integrate_next.png` | 会话结束，进入 Integrate 步骤 |
| `16_integrate_step_view.png` | Step 4 Integrate 页面 |
| `17_integrate_step_scrolled.png` | Integrate 页面（滚动后） |
| `18_quickstart_completed_dashboard.png` | Quickstart 完成后的最终状态 |
