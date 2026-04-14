import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useManagedAgents, RISK_LEVEL_COLORS } from '../../store/managedAgentStore'
import PageLayout, { DataToolbar } from '../../components/PageLayout'
import { IconCheckCircle, IconTool } from '../../components/Icons'
import './MAC.css'

export default function MACApprovals() {
  const navigate = useNavigate()
  const { approvals, dispatch } = useManagedAgents()
  const [toast, setToast] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedApproval, setExpandedApproval] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const filtered = approvals.filter(a => statusFilter === 'all' || a.status === statusFilter)
  const pending = approvals.filter(a => a.status === 'pending')

  const handleApprove = (id) => {
    dispatch({ type: 'RESOLVE_APPROVAL', id, status: 'approved', reviewer: 'admin' })
    showToast('已批准')
  }

  const handleReject = (id) => {
    dispatch({ type: 'RESOLVE_APPROVAL', id, status: 'rejected', reviewer: 'admin' })
    showToast('已拒绝', 'info')
  }

  return (
    <PageLayout title="Approvals" rightAction={
      <span style={{ fontSize: 13, color: pending.length > 0 ? '#fa8c16' : '#999', fontWeight: pending.length > 0 ? 600 : 400 }}>
        {pending.length > 0 ? `${pending.length} 个待审批` : '无待审批'}
      </span>
    }>
      <DataToolbar
        buttons={<></>}
        filters={
          <select className="pagination-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">全部状态</option>
            <option value="pending">待审批</option>
            <option value="approved">已批准</option>
            <option value="rejected">已拒绝</option>
          </select>
        }
      >
        <span style={{ fontSize: 13, color: '#666' }}>工具调用审批队列</span>
      </DataToolbar>

      <div className="mac-approvals-list">
        {filtered.length === 0 ? (
          <div className="mac-empty-state-full">
            <div className="empty-icon"><IconCheckCircle size={48} style={{ opacity: 0.2 }} /></div>
            <div className="ha-empty-title">{statusFilter === 'pending' ? '没有待审批的请求' : '没有匹配的审批记录'}</div>
          </div>
        ) : filtered.map(appr => {
          const rc = RISK_LEVEL_COLORS[appr.riskLevel] || RISK_LEVEL_COLORS.medium
          const isExpanded = expandedApproval === appr.id
          const isPending = appr.status === 'pending'

          return (
            <div key={appr.id} className={`mac-approval-card ${appr.status}`}>
              <div className="mac-approval-main" onClick={() => setExpandedApproval(isExpanded ? null : appr.id)}>
                <div className="mac-approval-left">
                  <div className="mac-approval-tool">
                    <span className="mac-approval-icon"><IconTool size={16} /></span>
                    <strong>{appr.toolName}</strong>
                    <span className="ha-status-tag" style={{ background: rc.bg, color: rc.color, borderColor: rc.border, fontSize: 11, padding: '1px 6px' }}>{rc.label}风险</span>
                  </div>
                  <div className="mac-approval-meta">
                    <span>Agent: {appr.sessionAgentName}</span>
                    <span>Session: <span className="ha-name-link" onClick={e => { e.stopPropagation(); navigate(`/managed-agent/sessions/${appr.sessionId}`) }}>{appr.sessionId}</span></span>
                    <span>{appr.requestedAt}</span>
                  </div>
                </div>
                <div className="mac-approval-status">
                  {appr.status === 'pending' && <span style={{ color: '#fa8c16', fontWeight: 600 }}>等待审批</span>}
                  {appr.status === 'approved' && <span style={{ color: '#52c41a' }}>已批准 by {appr.reviewedBy}</span>}
                  {appr.status === 'rejected' && <span style={{ color: '#ff4d4f' }}>已拒绝 by {appr.reviewedBy}</span>}
                </div>
              </div>

              {isExpanded && (
                <div className="mac-approval-detail">
                  <h4>调用参数</h4>
                  <pre className="mac-json-viewer">{JSON.stringify(appr.arguments, null, 2)}</pre>
                </div>
              )}

              {isPending && (
                <div className="mac-approval-actions">
                  <button className="action-btn primary" onClick={() => handleApprove(appr.id)}>Approve</button>
                  <button className="action-btn" style={{ color: '#ff4d4f' }} onClick={() => handleReject(appr.id)}>Reject</button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {toast && <div className={`ha-toast ha-toast-${toast.type}`}>{toast.msg}</div>}
    </PageLayout>
  )
}
