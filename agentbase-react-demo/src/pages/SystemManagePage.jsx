import PageLayout, { DataToolbar, DataTable } from '../components/PageLayout'

export default function SystemManagePage({ onAlert, pageTitle, columns }) {
  return (
    <PageLayout title={pageTitle}>
      <DataToolbar
        buttons={
          <button className="action-btn primary" onClick={onAlert}>+ 创建</button>
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
