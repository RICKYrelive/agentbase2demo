# Claude Platform Console — UI 产品需求文档 (PRD)

> 基于对 Claude Platform Console (https://platform.claude.com) 实际页面的 UI 分析整理  
> 生成日期：2026-04-13  
> 分析范围：Console 全部页面模块（Dashboard、Build、Managed Agents、Analytics、Claude Code、Manage）

---

## 1. 整体设计语言

### 1.1 设计系统概览

| 属性 | 值 |
|------|-----|
| 字体族 | `anthropicSans`, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif |
| 页面背景色 | `#F8F8F6` (rgb(248, 248, 246)) — 暖灰色 |
| 侧边栏背景色 | `#F4F4F1` (rgb(244, 244, 241)) — 略深暖灰 |
| 主文字色 | `#121212` (rgb(18, 18, 18)) |
| 次要文字色 | `#373734` (rgb(55, 55, 52)) |
| 辅助文字色 | `#7B7974` (rgb(123, 121, 116)) |
| 边框色 | `rgba(31, 31, 30, 0.15)` — 极淡黑色半透明 |
| 主强调色 | `#2977D6` (rgb(41, 119, 214)) — 品牌蓝 |
| "New" 徽章背景 | `rgba(203, 225, 251, 0.4)` — 淡蓝半透明 |
| 圆角规范 | 按钮/卡片 6-8px，徽章 4px |
| CSS 框架 | Tailwind CSS (class-based) |

### 1.2 排版规范

| 元素 | 字号 | 字重 | 颜色 | 备注 |
|------|------|------|------|------|
| 页面标题 H1 | 24px | 500 (medium) | `#121212` | margin-bottom: 4px |
| 章节标题 H2 | 略小于 H1 | 500 | `#121212` | |
| 卡片标题 H3 | 14-16px | 600 (semi-bold) | `#121212` | |
| 正文描述 | 14px | 400 | `#373734` | 辅助说明文字 |
| 表头 | 12px | 600 (semi-bold) | `#373734` | padding: 8px 12px |
| 按钮（主要） | 12px | 500 (medium) | 白色 `#FFFFFF` | height: 32px |
| 按钮（次要/筛选） | 14px | 400 | `#373734` | border: 1px solid rgba(31,30,30,0.15) |
| 侧边栏分组标题 | 14px | 400 | `#373734` | padding: 0 8px |
| 侧边栏链接 | 16px | 400 | `#373734` | padding: 0 8px 0 40px |
| "New" 徽章 | 10px | 500 (medium) | `#2977D6` | padding: 0 4px, background: rgba(203,225,251,0.4) |
| 工作区选择器 | 12px | 400 | `#121212` | |

### 1.3 交互与动效

- 按钮悬停效果：`scale-y-[1.015] scale-x-[1.005]` + 底部径向渐变光泽 (cubic-bezier(0.165, 0.85, 0.45, 1), 150ms)
- 按钮按下效果：backface-visibility hidden
- 侧边栏可折叠/展开（Collapse/Expand 按钮）
- 表格行支持 hover 高亮
- 开关控件（Toggle switch）用于布尔过滤条件
- 分页按钮：禁用态使用 `disabled:opacity-50`

---

## 2. 全局布局结构

### 2.1 页面骨架

```
┌──────────────────────────────────────────────────────┐
│  通知区域 (Notifications F8)                          │
├────────────┬─────────────────────────────────────────┤
│            │                                         │
│  侧边栏     │  主内容区                                │
│  256px     │                                         │
│  固定宽度    │  自适应宽度                               │
│  无右边框    │                                         │
│            │                                         │
│            │                                         │
├────────────┴─────────────────────────────────────────┤
```

### 2.2 侧边栏导航结构

侧边栏从上到下依次包含：

1. **品牌区域**
   - 展开按钮 (Expand) / 折叠按钮 (Collapse)
   - Dashboard 链接 + Claude Console Logo

2. **工作区选择器**
   - Combobox 下拉选择，显示当前工作区名称（如 "Default"）
   - 带图标

3. **导航分组**（可折叠树形菜单）

   | 分组 | 子菜单项 | URL 路径 |
   |------|----------|----------|
   | **Build** | Workbench | `/workbench` |
   | | Files | `/workspaces/{ws}/files` |
   | | Skills | `/workspaces/{ws}/skills` |
   | **Managed Agents** [New] | Quickstart | `/workspaces/{ws}/agent-quickstart` |
   | | Agents | `/workspaces/{ws}/agents` |
   | | Sessions | `/workspaces/{ws}/sessions` |
   | | Environments | `/workspaces/{ws}/environments` |
   | | Credential vaults | `/workspaces/{ws}/vaults` |
   | **Analytics** | Usage | `/usage` |
   | | Cost | `/workspaces/{ws}/cost` |
   | | Logs | `/workspaces/{ws}/logs` |
   | | Batches | `/workspaces/{ws}/batches` |
   | **Claude Code** | Usage | `/claude-code` |
   | | Settings | `/claude-code/settings` |
   | **Manage** | API keys | `/settings/workspaces/{ws}/keys` |
   | | Limits | `/settings/limits` |
   | | Workspace settings | `/settings/workspaces/{ws}` |

4. **底部区域**
   - Documentation 外链 → `/docs/en/home`
   - 用户头像按钮 → 显示角色名 + 组织名（如 "Ricky Admin Ricky's Individual Org"）

### 2.3 导航交互细节

- 分组标题是可点击按钮，点击展开/收起子菜单
- 展开态的分组按钮右侧有箭头指示器
- 分组标题内联 "New" 徽章（如 "Managed Agents [New]"），使用蓝色标签
- 当前页面链接自动高亮
- 子菜单项缩进 40px (padding-left)
- 分组标题圆角 8px

---

## 3. 页面模块详细设计

### 3.1 Dashboard（仪表盘）

**URL**: `/dashboard`

**页面结构**:
- 页面标题（H2 级别）："Almost time to build"
- 副标题："Begin building with Claude for only $5"
- CTA 按钮："Buy credits"（主要按钮样式）
- 引导链接："Get started with agents" → 跳转 `/workspaces/{ws}/agent-quickstart`
- 快捷操作按钮组：
  - "Generate a prompt"
  - "Get API Key"
- 底部链接区域：
  - "API status" → https://status.claude.com/
  - "Help & support" → https://support.claude.com/en/
  - "Feedback" 按钮

**设计特点**:
- 空状态引导页，面向新用户
- 大面积留白，居中布局

---

### 3.2 Quickstart（快速开始）

**URL**: `/workspaces/{ws}/agent-quickstart`

**页面结构**:

#### 3.2.1 步骤导航栏

水平步骤条，固定在内容区顶部：
- 步骤按钮 "Quickstart"，4个步骤：
  1. Create agent — `POST /v1/agents`
  2. Configure environment
  3. Start session
  4. Integrate

#### 3.2.2 Agent 描述输入区

- 标题（H2）："What do you want to build?"
- 副标题："Describe your agent or start with a template."
- 输入框：placeholder "Describe your agent..."
- 发送按钮 "Send"（初始禁用态，输入内容后启用）

#### 3.2.3 模板浏览区

- 标题（H2）："Browse templates"
- 搜索框：placeholder "Search templates"
- 模板卡片网格布局，每个卡片包含：
  - 模板名称
  - 模板描述
  - 关联工具标签（如 notion, slack, github, linear 等）

**可用模板列表**:

| 模板名称 | 描述 | 关联工具标签 |
|----------|------|-------------|
| Blank agent config | A blank starting point with the core toolset. | — |
| Deep researcher | Conducts multi-step web research with source synthesis and citations. | — |
| Structured extractor | Parses unstructured text into a typed JSON schema. | — |
| Field monitor | Scans software blogs for a topic and writes a weekly what-changed brief. | notion |
| Support agent | Answers customer questions from your docs and knowledge base, and escalates when needed. | notion, slack |
| Incident commander | Triages a Sentry alert, opens a Linear incident ticket, and runs the Slack war room. | sentry, linear, slack, github |
| Feedback miner | Clusters raw feedback from Slack and Notion into themes and drafts Asana tasks for the top asks. | slack, notion, asana |
| Sprint retro facilitator | Pulls a closed sprint from Linear, synthesizes themes, and writes the retro doc before the meeting. | linear, slack, docx |
| Support-to-eng escalator | Reads an Intercom conversation, reproduces the bug, and files a linked Jira issue with repro steps. | intercom, atlassian, slack |
| Data analyst | Load, explore, and visualize data; build reports and answer questions from datasets. | amplitude |

#### 3.2.4 模板预览（点击模板卡片后）

- 面包屑/返回："Back to templates" 按钮
- 模板标题 + "Template" 标签
- "Use this template" 按钮
- 代码预览区：
  - YAML / JSON Tab 切换
  - "Copy code" 按钮
  - 编辑器提示："Tab inserts indentation. Press Escape then Tab to move focus out of the editor."
  - 代码块展示模板 YAML/JSON 配置

**模板配置示例**（Blank agent config）：
```yaml
name: Untitled agent
description: A blank starting point with the core toolset.
model: claude-sonnet-4-6
system: You are a general-purpose agent that can research, write code, run commands, and use connected tools to complete the user's task end to end.
mcp_servers: []
tools:
  - type: agent_toolset_20260401
skills: []
```

---

### 3.3 Agents（Agent 列表）

**URL**: `/workspaces/{ws}/agents`

**页面结构**:

#### 页面头部
- 标题（H1）："Agents"
- 副标题："Create and manage autonomous agents."

#### 工具栏
- **主要操作按钮**："New agent"（带加号图标，Button_primary 样式）
  - CSS classes: `Button_fill__JiIcX Button_primary__0oSjX`
  - 高度 32px，字号 12px，白色文字，深色背景
  - hover 动效：微缩放 + 底部渐变光泽
- **搜索框**：placeholder "Go to agent ID"
- **时间筛选**：按钮 "Created All time"（下拉筛选器样式，带 border）
- **归档开关**："Show archived" Toggle switch

#### 数据表格

| 列名 | 说明 |
|------|------|
| ID | Agent 唯一标识，带复制按钮 |
| Name | Agent 名称 |
| Model | 使用的模型 |
| Status | 当前状态 |
| Created | 创建时间 |
| Last updated | 最后更新时间 |

- 表头字号 12px，字重 600
- 全宽表格，border-collapse: collapse
- 支持排序（点击表头）
- 空状态：表格区域显示空

#### 分页
- "Previous page" / "Next page" 按钮
- 禁用态 opacity-50

#### "New Agent" 创建弹窗（Modal Dialog）

弹窗标题："Create agent"

- 副标题："Start from a template or describe what you need."
- **起始方式选择器**：
  - "Starting point · Blank agent" 下拉按钮
  - Radio 选项：
    - ○ Describe your agent（默认选中）
    - ○ Template
- **描述输入框**：placeholder "Summarizes new GitHub PRs and posts a digest to Slack."
- **Generate 按钮**（初始禁用）
- **Agent 配置编辑区**：
  - 标签："Agent config"
  - YAML / JSON Tab 切换
  - "Copy code" 按钮
  - 编辑器提示文案
  - 代码块（YAML 格式，同模板配置）
- **底部操作按钮**："Create agent"

---

### 3.4 Sessions（会话列表）

**URL**: `/workspaces/{ws}/sessions`

**页面结构**:

#### 页面头部
- 标题（H1）："Sessions"
- 副标题："Trace and debug Claude Managed Agents sessions."

#### 工具栏
- **主要操作按钮**："New session"
- **搜索框**：placeholder "Go to session ID"
- **时间筛选**："Created All time" 按钮
- **Agent 筛选**：Combobox "Agent All"
- **归档开关**："Show archived" Toggle switch

#### 数据表格

| 列名 | 说明 |
|------|------|
| ☐ (全选) | Checkbox 列，支持批量选择 |
| ID | Session ID |
| Name | Session 名称 |
| Status | 当前状态 |
| Agent | 关联的 Agent |
| Created | 创建时间 |

- 带全选 Checkbox
- 空状态文案："No sessions yet — Sessions will appear here once created through the API."

#### 分页
- Previous / Next 按钮

---

### 3.5 Environments（环境列表）

**URL**: `/workspaces/{ws}/environments`

**页面结构**:

#### 页面头部
- 标题（H1）："Environments"
- 副标题："Configuration template for containers, such as sessions or code execution."

#### 工具栏
- **主要操作按钮**："Add environment"
- **状态过滤**：Radio 按钮组 — "All"（默认选中）/ "Active"

#### 数据表格

| 列名 | 说明 |
|------|------|
| ID | Environment ID |
| Name | 环境名称 |
| Status | 状态 |
| Type | 托管类型（Cloud/Local） |

- 空状态："No environments yet — Create your first environment to get started."

#### "Add Environment" 创建弹窗

弹窗标题："Add environment"

表单字段：
| 字段 | 类型 | 校验 | Placeholder |
|------|------|------|-------------|
| Name | Text input | ≤50 字符 | "E.g. My Environment" |
| Hosting Type | Combobox 下拉 | 创建后不可更改 | 默认 "Cloud" |
| Description | Text input | 可选 | "Optional description for this environment" |

底部操作："Create" 按钮

---

### 3.6 Credential Vaults（凭证保管库）

**URL**: `/workspaces/{ws}/vaults`

**页面结构**:

#### 页面头部
- 标题（H1）："Credential vaults"
- 副标题："Manage credential vaults that provide your agents with access to MCP servers and other tools."

#### 工具栏
- **主要操作按钮**："New vault"
- **状态过滤**：Radio 按钮组 — "All"（默认选中）/ "Active"

#### 数据表格

| 列名 | 说明 |
|------|------|
| ID | Vault ID（截断显示，如 `vlt_…bWfUY6y`）+ 复制按钮 |
| Name | 保管库名称 |
| Status | 状态（如 Active） |
| Created | 创建时间 |
| Actions | 更多操作按钮（"More actions"） |

#### "Create Vault" 创建弹窗

弹窗标题："Create vault"

- 提示文案："Vaults are shared across this workspace. Credentials added to this vault will be usable by anyone with API key access. Learn more here."（"here" 为文档链接）

表单字段：
| 字段 | 类型 | 校验 | Placeholder |
|------|------|------|-------------|
| Name | Text input | ≤50 字符 | "Production MCP Vault" |

底部操作："Create" 按钮

---

### 3.7 Skills（技能列表）

**URL**: `/workspaces/{ws}/skills`

**页面结构**:

#### 页面头部
- 标题（无 H1，仅文本）："Skills"
- **主要操作按钮**："Add skill"
- 描述说明："Skills are repeatable and customizable instructions that Claude API can follow. Only skills from the Default workspace are shown. To see other workspace's skills, select a workspace."

#### 技能卡片网格

卡片式布局（非表格），每个卡片包含：
- 标题（H3）：技能名称（如 xlsx, pptx, pdf, docx）
- 描述文本（2行）
- "Loading..." 加载态
- 复制按钮："Copy {name}"
- 创建者 + 创建时间（如 "Anthropic 2/3/2026, 11:09 PM"）

**系统预置技能**:
| 技能 | 创建者 | 时间 |
|------|--------|------|
| xlsx | Anthropic | 2026-02-03 |
| pptx | Anthropic | 2026-03-05 |
| pdf | Anthropic | 2026-02-03 |
| docx | Anthropic | 2026-03-05 |

---

### 3.8 Files（文件管理）

**URL**: `/workspaces/{ws}/files`

**页面结构**:

#### 页面头部
- 标题（H1）："Files"
- 工作区提示："Only files from the Default workspace are shown. To see other workspace's files, select a workspace."

#### 数据表格

| 列名 | 说明 |
|------|------|
| ID | 文件 ID |
| Name | 文件名 |
| Size | 文件大小 |
| Created | 上传时间 |

- 无搜索/筛选工具栏
- 无创建按钮（文件通过 API 上传）
- Previous / Next 分页按钮

---

### 3.9 Workbench（工作台）

**URL**: `/workbench`

**页面结构**:
- 两个图标按钮（无文字标签）
- 状态指示："Loading..."

> 注：此页面内容主要通过 JavaScript 动态渲染，快照中仅显示加载态。

---

### 3.10 Usage（用量分析）

**URL**: `/usage`

**页面结构**:

#### 筛选工具栏
- **工作区筛选**："All Workspaces" 按钮
- **时间选择器**：月份选择器，显示当前月份（如 "April 2026"）
- **API Key 筛选**：下拉 "All"
- **模型筛选**：下拉 "All"
- **分组维度**："Group by: Model" 下拉
- **导出**："Export" 按钮

#### 指标卡片区域
- Total tokens in — 输入 Token 总量
- Total tokens out — 输出 Token 总量
- Total web searches — Web 搜索次数

#### 图表区域
- **Token usage 折线/柱状图**：按时间维度展示 Token 用量趋势
- **Rate-limited requests**：限流请求数（带详情链接）
- **Rate Limit Use 图表**（两张）：
  - Input tokens rate limit use
  - Output tokens rate limit use

---

### 3.11 Cost（成本分析）

**URL**: `/workspaces/{ws}/cost`

**页面结构**:
- 标题（H1）："Cost"

> 注：内容通过 JavaScript 动态渲染。

---

### 3.12 Logs（日志）

**URL**: `/workspaces/{ws}/logs`

**页面结构**:

#### 工具栏
- 最后刷新时间戳（如 "Last refresh time: ..."）
- 无显式筛选器（在工具栏区域外）

#### 数据表格

| 列名 | 说明 |
|------|------|
| Time (GMT+8) | 请求时间 |
| ID | 请求 ID |
| Model | 使用的模型 |
| Input Tokens | 输入 Token 数 |
| Output Tokens | 输出 Token 数 |
| Type | 请求类型 |
| Service Tier | 服务层级 |
| Request | 请求内容摘要 |

#### 分页
- "Lines per page" Combobox（默认 10 条/页）
- Previous / Next 按钮

---

### 3.13 Batches（批处理）

**URL**: `/workspaces/{ws}/batches`

**页面结构**:

#### 数据表格

| 列名 | 说明 |
|------|------|
| ID | 批次 ID |
| Status | 状态 |
| Requests | 请求数量 |
| Created at (GMT+8) | 创建时间 |
| Actions | 操作按钮 |

- 无标题（标题与表格合并显示）
- 无创建按钮（通过 API 创建）
- 分页：Previous / Next 按钮

---

### 3.14 API Keys（API 密钥管理）

**URL**: `/settings/workspaces/{ws}/keys`

**页面结构**:

#### 二级导航标签页
- "API keys"（当前激活）
- "Security and compliance"

#### 内容区域
- 页面标题（H2）："Create an API key"
- **Create key 按钮**（带图标 + 文字）
- 说明文字："Create a key to integrate with the Claude API. You can use the API directly or through a client SDK."（"client SDK" 为外链）

---

### 3.15 Limits（限制配置）

**URL**: `/settings/limits`

**特殊布局**：此页面使用不同的侧边栏导航（Organization settings 级别）：
- Profile
- Appearance
- Organization
- Workspaces
- Billing
- Limits
- API keys
- Privacy controls

**页面结构**:

#### Rate Limits 区域
- 标题（H1）："Rate limits Free Tier"
- 说明："Limits help us mitigate against misuse and manage API capacity. Rate limits restrict API usage frequency over a certain period of time."
- 链接按钮："Monitor rate limit usage" → 跳转 `/usage#rate-limit-usage`

数据表格：

| 指标 | 限制说明 | 值 |
|------|----------|-----|
| Batch requests | Limit per minute across all models | 5 |
| Web search tool uses | Limit per second across all models | 30 |
| Files API storage limit | Total storage across your organization | 500 GB |

- 底部："Contact the Anthropic accounts team to learn more about custom rate limits."
- 链接按钮："Contact sales"

#### Spend Limits 区域
- 标题（H1）："Spend limits"
- 说明："You can manage your spend by setting monthly spend limits."
- 子标题（H2）："Monthly limit"
- 子标题（H2）："Email notification"

---

## 4. 通用组件规范

### 4.1 按钮体系

| 类型 | 样式特征 | 使用场景 |
|------|----------|----------|
| **Primary** | 深色背景，白色文字，6px 圆角，32px 高，12px 字号，hover 微缩放 + 底部渐变 | 主要操作（New agent, Create, Buy credits） |
| **Secondary / Filter** | 透明背景，`#373734` 文字，1px border (rgba(31,30,30,0.15))，8px 圆角 | 筛选器、次要操作 |
| **Ghost / Link** | 无背景，无边框，`#7B7974` 文字 | 导航链接、辅助操作 |
| **Icon button** | 仅图标，无文字 | 复制、更多操作、展开/折叠 |
| **Disabled** | opacity-50, pointer-events-none | 表单未填完时的提交按钮 |

CSS class 命名约定：
- 主要按钮：`Button_fill__JiIcX Button_primary__0oSjX`
- 通用：`font-base-bold`, `can-focus`, `select-none`, `transition-transform`, `backface-hidden`

### 4.2 弹窗（Modal Dialog）

通用规范：
- 居中弹出，带半透明遮罩
- 标题（H2）
- 右上角关闭按钮（X 图标）
- 表单字段垂直排列
- 字段标签 + 输入框 + 校验提示
- 底部主操作按钮

### 4.3 数据表格

通用规范：
- 全宽表格，border-collapse: collapse
- 表头：12px，600 字重，`#373734` 色，padding 8px 12px
- 无明显行分隔线（border-bottom: 0）
- ID 列：截断显示 + 复制按钮
- 空状态：表格内显示提示文案
- 分页：Previous / Next 按钮，禁用态 opacity-50

### 4.4 筛选器组件

- **时间筛选**：按钮形式，显示当前值（如 "Created All time"），点击展开下拉
- **下拉选择器**：Combobox（如 Agent 筛选、Group by）
- **Radio 分组**：用于状态过滤（All / Active）
- **Toggle Switch**：用于布尔开关（Show archived）
- **搜索框**：placeholder 引导文本（如 "Go to agent ID"）

### 4.5 空状态设计

- 在表格区域内部显示
- 标题行 + 描述行
- 居中显示
- 部分带引导链接

### 4.6 代码编辑器组件

- YAML / JSON Tab 切换
- Copy code 按钮
- 底部提示："Tab inserts indentation. Press Escape then Tab to move focus out of the editor."
- 语法高亮显示

---

## 5. 工作区（Workspace）系统

### 5.1 概念

- 所有资源（Agents、Sessions、Environments、Vaults、Files、Skills）归属于某个 Workspace
- URL 路径格式：`/workspaces/{workspace_id}/...`
- 部分页面是组织级别的（不带 workspace 路径）：Dashboard、Usage、Limits

### 5.2 工作区选择器

- 位置：侧边栏顶部，Logo 下方
- 形式：Combobox 下拉
- 显示当前工作区名称（如 "Default"）
- 带图标
- 切换工作区后，列表页数据按工作区过滤
- 部分页面显示工作区范围提示（如 Files、Skills 页面）

---

## 6. 页面路由映射

| 页面 | URL 模式 | 层级 |
|------|----------|------|
| Dashboard | `/dashboard` | 全局 |
| Workbench | `/workbench` | 全局 |
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
| Claude Code Usage | `/claude-code` | 全局 |
| Claude Code Settings | `/claude-code/settings` | 全局 |
| API Keys | `/settings/workspaces/{ws}/keys` | 设置 |
| Workspace Settings | `/settings/workspaces/{ws}` | 设置 |
| Workspace Settings (Security) | `/settings/workspaces/{ws}/security-compliance` | 设置 |
| Limits | `/settings/limits` | 组织设置 |
| Profile | `/settings/profile` | 组织设置 |
| Appearance | `/settings/appearance` | 组织设置 |
| Organization | `/settings/organization` | 组织设置 |
| Billing | `/settings/billing` | 组织设置 |
| Privacy Controls | `/settings/privacy` | 组织设置 |

---

## 7. 信息架构总览

```
Claude Platform Console
├── Dashboard (入口/引导)
├── Build (构建工具)
│   ├── Workbench (交互式工作台)
│   ├── Files (文件管理)
│   └── Skills (技能管理)
├── Managed Agents [NEW] (托管智能体) ⭐
│   ├── Quickstart (快速开始向导)
│   ├── Agents (Agent 列表/CRUD)
│   ├── Sessions (会话追踪/调试)
│   ├── Environments (容器环境配置)
│   └── Credential Vaults (MCP 凭证管理)
├── Analytics (数据分析)
│   ├── Usage (Token 用量分析)
│   ├── Cost (成本分析)
│   ├── Logs (请求日志)
│   └── Batches (批处理管理)
├── Claude Code (CLI 工具)
│   ├── Usage (用量)
│   └── Settings (设置)
└── Manage (管理配置)
    ├── API Keys (密钥管理)
    ├── Limits (限流/配额)
    └── Workspace Settings (工作区设置)
        ├── API keys
        └── Security and compliance
```

---

## 8. 关键设计模式总结

### 8.1 CRUD 列表页标准模式

适用于：Agents、Sessions、Environments、Credential Vaults、Files、Batches

标准结构：
1. H1 标题 + 描述副标题
2. 工具栏：主操作按钮 + 搜索框 + 筛选器
3. 数据表格（带列头排序）
4. 分页（Previous / Next）
5. 空状态提示

### 8.2 创建资源标准弹窗

适用于：New Agent、Add Environment、Create Vault

标准结构：
1. Modal Dialog
2. H2 标题 + 关闭按钮
3. 表单字段（垂直排列）
4. 底部主操作按钮

### 8.3 分析页标准模式

适用于：Usage、Cost、Logs

标准结构：
1. 时间范围选择器
2. 多维度筛选器
3. 指标卡片
4. 图表区域
5. 数据表格（Logs）

---

> 文档来源：基于对 https://platform.claude.com 各页面的实际 UI 抓取与分析  
> 分析工具：Browser Accessibility Tree + CSS Computed Styles  
> 生成日期：2026-04-13
