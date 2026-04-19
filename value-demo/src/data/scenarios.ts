export interface Scenario {
  title: string;
  painPoint: string;
  solution: string;
}

export interface CoreValue {
  id: string;
  title: string;
  color: string;
  scenarios: Scenario[];
}

export const coreValues: CoreValue[] = [
  {
    id: "harness",
    title: "提供 Agent Harness 虚拟化托管平台\n快速上线可用 Agent",
    color: "#6C5CE7",
    scenarios: [
      {
        title: "Agent 重构业务流",
        painPoint: "Agent 搭建高度依赖基础设施就绪，需要对 Harness 组件选型部署，选择多、部署复杂",
        solution: "提供一站式 Agent Harness 托管平台，用户可通过 WebUI/SDK 部署完整 Harness 并灵活管控",
      },
      {
        title: "零散 Agent 统一治理",
        painPoint: "业务 Agent 散落在脚本、Prompt 和不同代码仓中，版本难管、交接难、复制难",
        solution: "将 Agent 资源拆解为 Blueprint、Session、Vaults 等原子资源，实现标准化托管与分发",
      },
      {
        title: "快速搭建验证业务 Agent",
        painPoint: "业务人员知道目标但不会设计 Agent 配置，搭建高度依赖专家人工介入，启动慢",
        solution: "内置 Meta-Agent，自然语言需求转 Agent Blueprint 草稿，自动推荐 MCP/Skill，一键拉起测试",
      },
      {
        title: "标准化环境与秒级冷启动",
        painPoint: "运行前临时装包、手工配环境，不同任务环境不一致，拉长启动时间",
        solution: "通过 Environment 预定义镜像和依赖，Session 启动前完成依赖准备，实现秒级冷启动",
      },
    ],
  },
  {
    id: "skill",
    title: "助力企业能力沉淀为\n可复用的 Agent Skill 资产",
    color: "#00B894",
    scenarios: [
      {
        title: "多团队接入企业内部系统",
        painPoint: "每个项目都重复封装接口、重复处理权限和字段映射，开发成本高、质量不一致",
        solution: "将连接内部系统的能力抽象为标准 Skill 与 Skill Package，平台统一管理、检索和分发",
      },
      {
        title: "业务人员快速调用企业能力",
        painPoint: "已有能力沉淀但业务人员不知道去哪找、能不能用，导致复用率低",
        solution: "Agent Factory 中直接查阅和检索经验证的 Skill 组件，按需嵌入 Blueprint，降低调用门槛",
      },
      {
        title: "开发者复用 Agent 能力",
        painPoint: "平台能力只能在画布里使用，不能进入业务代码，形成孤岛",
        solution: "通过 AgentBase SDK 原生调取 Skill Package，同一套能力同时服务低代码与高代码场景",
      },
    ],
  },
  {
    id: "security",
    title: "为高风险 Agent 执行\n构建可信安全边界",
    color: "#E17055",
    scenarios: [
      {
        title: "动态生成代码安全执行",
        painPoint: "生成代码具有不确定性，可能触发高内存消耗、异常依赖、危险调用，直接运行风险极高",
        solution: "Sandbox as a Tool，将未知代码发往轻量、无状态、即用即销毁的沙箱执行，隔离风险外溢",
      },
      {
        title: "敏感数据与内网访问控制",
        painPoint: "执行边界不清晰，Agent 可能越权访问服务或在共享环境中造成数据泄露",
        solution: "Agent in Sandbox 模式 + 网络白名单 + 环境级网络控制，限制 Agent 可访问的资源边界",
      },
      {
        title: "多身份用户权限隔离",
        painPoint: "密钥写在应用配置里，Agent 拿着统一权限执行，容易越权代理和权限串号",
        solution: "Vaults 做凭证集中托管，Session 运行时按触发者身份动态挂载对应凭证",
      },
      {
        title: "复杂运行环境标准化",
        painPoint: "不同任务环境不一致，导致本地能跑线上跑不起来，拉长启动时间",
        solution: "预定义 Python 镜像和依赖包列表，支持虚拟盘块挂载，标准化环境与秒级启动",
      },
    ],
  },
  {
    id: "observability",
    title: "让 Agent 全生命周期\n可观测、可审计、可治理",
    color: "#0984E3",
    scenarios: [
      {
        title: "快速定位 Agent 输出错误",
        painPoint: "传统日志只能看到接口结果，无法判断问题来自模型推理、工具还是下游服务",
        solution: "基于 Event-Sourced Session 与结构化事件流，追踪 user/agent/session/span 链路",
      },
      {
        title: "沙箱异常事后复盘",
        painPoint: "无状态执行环境失败即销毁，上下文有限，无法还原出错现场",
        solution: "采集 Sandbox 的 stdout/stderr/Exception Stack/OOM 等信息，纳入审计与观测体系",
      },
      {
        title: "高风险动作人工审批",
        painPoint: "无审批阻断与留痕机制，企业难满足安全审计要求，不敢用到生产流程",
        solution: "HITL 机制对高风险步骤人工审批、灰度放行、全链路留痕，写入不可变审计日志",
      },
    ],
  },
];
