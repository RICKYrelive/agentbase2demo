import PageLayout, { DataToolbar, DataTable } from '../components/PageLayout'

const columns = [
  { key: 'traceId', label: 'TraceID' },
  { key: 'traceName', label: 'Trace 名称' },
  { key: 'appName', label: '应用名称' },
  { key: 'status', label: '状态' },
  { key: 'span', label: 'Span' },
  { key: 'startTime', label: '开始时间' },
  { key: 'input', label: '输入' },
  { key: 'output', label: '输出' },
  { key: 'duration', label: '耗时' },
]

export default function Trace({ onAlert }) {
  return (
    <PageLayout title="Agent 链路追踪 (Trace)">
      <DataToolbar
        buttons={
          <button className="filter-select" onClick={onAlert}>选择 Agent 应用 ▾</button>
        }
        filters={
          <>
            <button className="filter-select" onClick={onAlert}>近 24 小时 ▾</button>
            <button className="action-btn" onClick={onAlert}>🔧 筛选</button>
            <button className="action-btn" onClick={onAlert}>更多操作 ▾</button>
          </>
        }
      >
        <button className="refresh-btn-sm">↻</button>
      </DataToolbar>
      <DataTable columns={columns} />
    </PageLayout>
  )
}
