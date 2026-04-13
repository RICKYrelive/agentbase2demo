import { useState } from 'react'
import PageLayout from '../../components/PageLayout'
import './MAC.css'

const ROLES = ['Owner', 'Admin', 'Builder', 'Operator', 'Viewer', 'Restricted User']

const PERMISSIONS = [
  { action: 'Create Agent', roles: ['Owner', 'Admin', 'Builder'] },
  { action: 'Edit Agent', roles: ['Owner', 'Admin', 'Builder'] },
  { action: 'Delete Agent', roles: ['Owner', 'Admin'] },
  { action: 'Publish Version', roles: ['Owner', 'Admin', 'Builder'] },
  { action: 'Manage Environment', roles: ['Owner', 'Admin', 'Builder'] },
  { action: 'Manage Secrets', roles: ['Owner', 'Admin'] },
  { action: 'Create Session', roles: ['Owner', 'Admin', 'Builder', 'Operator', 'Restricted User'] },
  { action: 'Send Message', roles: ['Owner', 'Admin', 'Builder', 'Operator', 'Restricted User'] },
  { action: 'Interrupt Session', roles: ['Owner', 'Admin', 'Builder', 'Operator'] },
  { action: 'Approve Tool Use', roles: ['Owner', 'Admin', 'Builder', 'Operator'] },
  { action: 'View Logs', roles: ['Owner', 'Admin', 'Builder', 'Operator', 'Viewer'] },
  { action: 'Export Data', roles: ['Owner', 'Admin'] },
  { action: 'Manage Members', roles: ['Owner', 'Admin'] },
  { action: 'View Audit Log', roles: ['Owner', 'Admin'] },
  { action: 'Manage MCP Integration', roles: ['Owner', 'Admin', 'Builder'] },
]

const MEMBERS = [
  { name: 'Admin', email: 'admin@company.com', role: 'Owner' },
  { name: '张三', email: 'zhangsan@company.com', role: 'Builder' },
  { name: '李四', email: 'lisi@company.com', role: 'Builder' },
  { name: '王五', email: 'wangwu@company.com', role: 'Builder' },
  { name: '赵六', email: 'zhaoliu@company.com', role: 'Operator' },
  { name: '孙七', email: 'sunqi@company.com', role: 'Viewer' },
]

export default function MACRoles() {
  const [editingMember, setEditingMember] = useState(null)
  const [selectedRole, setSelectedRole] = useState('')
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const roleColors = { Owner: '#722ed1', Admin: '#1890ff', Builder: '#52c41a', Operator: '#fa8c16', Viewer: '#999', 'Restricted User': '#ff4d4f' }

  return (
    <PageLayout title="Roles & Permissions" rightAction={<span style={{ fontSize: 12, color: '#999' }}>权限管理</span>}>
      {/* Permission Matrix */}
      <div className="mac-section">
        <div className="mac-section-title">权限矩阵</div>
        <div className="mac-perm-table-wrap">
          <table className="data-table mac-perm-table">
            <thead>
              <tr>
                <th style={{ minWidth: 180 }}>操作</th>
                {ROLES.map(role => <th key={role} style={{ textAlign: 'center', minWidth: 80 }}>{role}</th>)}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map(perm => (
                <tr key={perm.action}>
                  <td>{perm.action}</td>
                  {ROLES.map(role => (
                    <td key={role} style={{ textAlign: 'center' }}>
                      {perm.roles.includes(role) ? (
                        <span style={{ color: '#52c41a', fontSize: 16 }}>✓</span>
                      ) : (
                        <span style={{ color: '#d9d9d9', fontSize: 16 }}>—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Members */}
      <div className="mac-section" style={{ marginTop: 24 }}>
        <div className="mac-section-title">成员管理</div>
        <table className="data-table">
          <thead><tr><th>姓名</th><th>邮箱</th><th>角色</th><th>操作</th></tr></thead>
          <tbody>
            {MEMBERS.map(m => {
              return (
                <tr key={m.email}>
                  <td><strong>{m.name}</strong></td>
                  <td style={{ color: '#666' }}>{m.email}</td>
                  <td><span className="ha-status-tag" style={{ background: roleColors[m.role] + '15', color: roleColors[m.role], borderColor: roleColors[m.role] + '40' }}>{m.role}</span></td>
                  <td>
                    <div className="ha-row-actions">
                      <button onClick={() => { setEditingMember(m); setSelectedRole(m.role) }}>修改角色</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Role Descriptions */}
      <div className="mac-section" style={{ marginTop: 24 }}>
        <div className="mac-section-title">角色说明</div>
        <div className="mac-role-cards">
          {[
            { name: 'Owner', desc: '工作空间所有者，完全控制所有资源和设置', color: '#722ed1' },
            { name: 'Admin', desc: '管理员，可管理成员、凭证和所有配置', color: '#1890ff' },
            { name: 'Builder', desc: '开发者，可创建和编辑 Agent、工具、环境', color: '#52c41a' },
            { name: 'Operator', desc: '运维人员，可启动/监控 Session、审批工具调用', color: '#fa8c16' },
            { name: 'Viewer', desc: '只读观察者，可查看日志和分析数据', color: '#999' },
            { name: 'Restricted User', desc: '受限用户，只能使用被授权的特定 Agent', color: '#ff4d4f' },
          ].map(role => (
            <div key={role.name} className="mac-role-card">
              <div className="mac-role-name" style={{ color: role.color }}>{role.name}</div>
              <div className="mac-role-desc">{role.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Role Modal */}
      {editingMember && (
        <div className="modal-overlay" onClick={() => setEditingMember(null)}>
          <div className="modal-card" style={{ width: 400 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16 }}>修改角色 — {editingMember.name}</h3>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>当前角色: <strong>{editingMember.role}</strong></div>
              <select className="form-select" value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="action-btn" onClick={() => setEditingMember(null)}>取消</button>
              <button className="action-btn primary" onClick={() => {
                editingMember.role = selectedRole
                showToast(`${editingMember.name} 角色已更新为 ${selectedRole}`)
                setEditingMember(null)
              }}>保存</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`ha-toast ha-toast-${toast.type}`}>{toast.msg}</div>}
    </PageLayout>
  )
}
