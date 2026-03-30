import PageLayout, { GuideCards, DataToolbar, DataTable } from '../components/PageLayout'

const guideCards = [
  { title: '创建数据库', desc: '支持创建 PGVector、Milvus、Redis、NebulaGraph 四类数据库，可根据业务场景选择单机、集群等部署模式，完成资源配置，自动生成连接信息与多语言集成代码。' },
  { title: '在Agent 应用中集成数据库', desc: '先将"数据库详情 > 集成代码"集成至应用，随后在创建 Agent 应用时选择关联数据库，平台将自动配置环境变量，应用即可调用数据库。' },
  { title: '持续观测评估性能', desc: '实时监控数据库的性能延迟、流量并发与资源消耗等关键指标，并查看相关Trace，深入浏览数据库调用过程，精准定位和分析问题。' },
]

const columns = [
  { key: 'name', label: '名称' },
  { key: 'status', label: '状态', sortable: true },
  { key: 'address', label: '访问地址' },
  { key: 'dbType', label: '数据库类型' },
  { key: 'k8s', label: '所在K8s集群' },
  { key: 'podCount', label: 'Pod 数 (运行中/全部)' },
  { key: 'createTime', label: '创建时间', sortable: true },
  { key: 'actions', label: '操作' },
]

export default function AIDatabase({ onAlert }) {
  return (
    <PageLayout
      title="AI 数据库"
      rightAction={<button className="action-btn" onClick={onAlert}>⊙ 收起教程</button>}
    >
      <GuideCards cards={guideCards} />
      <DataToolbar
        buttons={
          <button className="action-btn primary" onClick={onAlert}>+ 创建</button>
        }
        filters={
          <>
            <button className="filter-select" onClick={onAlert}>全部类型 ▾</button>
            <button className="action-btn" onClick={onAlert}>🔧 筛选</button>
          </>
        }
      >
        <div className="search-input">
          <span className="search-icon">🔍</span>
          <input placeholder="名称" />
        </div>
        <button className="refresh-btn-sm">↻</button>
      </DataToolbar>
      <DataTable columns={columns} />
    </PageLayout>
  )
}
