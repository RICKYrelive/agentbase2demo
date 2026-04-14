import { useState, useMemo } from 'react'
import { useManagedAgents } from '../../store/managedAgentStore'
import PageLayout, { DataToolbar } from '../../components/PageLayout'
import { IconSearch, IconDownload, IconCheck, IconX, IconClipboard } from '../../components/Icons'
import './MAC.css'

export default function MACAuditLog() {
  const { auditLogs } = useManagedAgents()
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [userFilter, setUserFilter] = useState('all')

  const uniqueActions = [...new Set(auditLogs.map(l => l.action.split('.')[0]))]
  const uniqueUsers = [...new Set(auditLogs.map(l => l.userName))]

  const filtered = useMemo(() => {
    return auditLogs.filter(l => {
      if (actionFilter !== 'all' && !l.action.startsWith(actionFilter)) return false
      if (userFilter !== 'all' && l.userName !== userFilter) return false
      if (search) {
        const text = `${l.action} ${l.resourceName} ${l.userName}`.toLowerCase()
        if (!text.includes(search.toLowerCase())) return false
      }
      return true
    })
  }, [auditLogs, search, actionFilter, userFilter])

  const actionLabels = {
    'agent.create': '创建 Agent',
    'agent.publish': '发布版本',
    'session.create': '创建 Session',
    'secret.rotate': '轮换凭证',
    'tool.approve': '审批工具',
    'environment.update': '更新环境',
  }

  const resultColors = { success: '#52c41a', failure: '#ff4d4f' }

  const handleExport = () => {
    const header = '时间,操作人,操作类型,资源类型,资源名称,结果,IP\n'
    const rows = filtered.map(l => `${l.timestamp},${l.userName},${l.action},${l.resourceType},${l.resourceName},${l.result},${l.ipAddress}`).join('\n')
    const csv = header + rows
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <PageLayout title="Audit Log" rightAction={<span style={{ fontSize: 12, color: '#999' }}>操作审计</span>}>
      <DataToolbar
        buttons={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="action-btn" onClick={handleExport} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <IconDownload size={14} /> 导出 CSV
            </button>
            <span style={{ fontSize: 12, color: '#999', alignSelf: 'center' }}>{filtered.length} 条记录</span>
          </div>
        }
        filters={
          <div className="ha-filter-group">
            <select className="pagination-select" value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
              <option value="all">全部操作</option>
              {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select className="pagination-select" value={userFilter} onChange={e => setUserFilter(e.target.value)}>
              <option value="all">全部用户</option>
              {uniqueUsers.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        }
      >
        <div className="search-input">
          <span className="search-icon"><IconSearch size={14} /></span>
          <input placeholder="搜索操作、资源" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </DataToolbar>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>时间</th><th>操作人</th><th>操作类型</th><th>资源类型</th><th>资源名称</th><th>结果</th><th>IP</th></tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="data-table-empty"><div className="mac-empty-inline">没有匹配的审计记录</div></td></tr>
            ) : filtered.map(log => (
              <tr key={log.id}>
                <td style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{log.timestamp}</td>
                <td><strong>{log.userName}</strong></td>
                <td><span className="ha-mini-tag">{actionLabels[log.action] || log.action}</span></td>
                <td>{log.resourceType}</td>
                <td>{log.resourceName}</td>
                 <td><span style={{ color: resultColors[log.result], display: 'flex', alignItems: 'center' }}>{log.result === 'success' ? <IconCheck size={14} /> : <IconX size={14} />}</span></td>
                <td style={{ fontSize: 12, fontFamily: 'monospace', color: '#999' }}>{log.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="data-pagination"><span>共 {filtered.length} 条</span></div>
      </div>

      <div className="mac-notice" style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <IconClipboard size={14} /> 审计日志记录所有关键操作，包括 Agent 创建、版本发布、Session 管理、凭证操作和工具审批。日志不可篡改。
      </div>
    </PageLayout>
  )
}
