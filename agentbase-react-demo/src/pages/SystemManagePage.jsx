import PageLayout, { DataToolbar, DataTable } from '../components/PageLayout'
import { IconSearch, IconRotateCcw } from '../components/Icons'

export default function SystemManagePage({ onAlert, pageTitle, columns }) {
  return (
    <PageLayout title={pageTitle}>
      <DataToolbar
        buttons={
          <button className="action-btn primary" onClick={onAlert}>+ 创建</button>
        }
      >
        <div className="search-input">
          <span className="search-icon"><IconSearch size={14} /></span>
          <input placeholder="名称" />
        </div>
        <button className="refresh-btn-sm" onClick={() => {}}><IconRotateCcw size={14} /></button>
      </DataToolbar>
      <DataTable columns={columns} />
    </PageLayout>
  )
}
