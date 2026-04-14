import { useState } from 'react'
import PageLayout from '../../components/PageLayout'
import './AF.css'

const MOUNT_TYPES = {
  file:      { label: '文件',   icon: '📄' },
  github:    { label: 'GitHub', icon: '🐙' },
  workspace: { label: '工作区', icon: '📁' },
}

const MOCK_FS = [
  {
    id: 'fs_alpha001', name: 'Code Review Workspace', sessionCount: 3, createdAt: '2026-04-10 11:00',
    desc: '包含 Python 脚本 and 数据集，挂载到 Code Reviewer Agent',
    mounts: [
      { id: 'm1', type: 'github', src: 'https://github.com/acme/backend', mountPath: '/workspace/backend', note: 'branch: main' },
      { id: 'm2', type: 'file', src: 'file_abc123 (schema.json)', mountPath: '/workspace/schema.json', note: '218 KB' },
    ],
  },
  {
    id: 'fs_beta002', name: 'Data Pipeline Workspace', sessionCount: 1, createdAt: '2026-04-11 14:22',
    desc: '用于数据清洗和分析任务的工作区',
    mounts: [
      { id: 'm3', type: 'file', src: 'file_xyz789 (sales_q1.csv)', mountPath: '/workspace/sales_q1.csv', note: '2.1 MB' },
      { id: 'm4', type: 'workspace', src: '本地目录 /data/cache', mountPath: '/workspace/cache', note: 'read-only' },
    ],
  },
]

export default function AFFilesystem() {
  const [expanded, setExpanded] = useState(MOCK_FS[0]?.id)
  const [showDrawer, setShowDrawer] = useState(false)
  const [fsName, setFsName] = useState('')
  const [fsDesc, setFsDesc] = useState('')
  const [mounts, setMounts] = useState([])
  const [toast, setToast] = useState(null)

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2000) }

  const addMountLine = () => {
    setMounts([...mounts, { type: 'file', src: '', path: '' }])
  }

  const handleCreate = () => {
    showToast('Filesystem 工作区创建成功')
    setShowDrawer(false)
    setFsName('')
    setFsDesc('')
    setMounts([])
  }

  return (
    <PageLayout
      title="Filesystem"
      rightAction={<button className="action-btn primary" onClick={() => setShowDrawer(true)}>+ New Filesystem</button>}
    >
      <div className="info-alert">
        <span className="info-alert-icon">ℹ️</span>
        Filesystem 定义可挂载到 Session 工作区的文件系统快照，支持 GitHub 仓库、Files API 文件和本地目录三种挂载类型。在创建 Session 时引用，确保工作环境一致性。
      </div>

      <div className="affs-list">
        {MOCK_FS.map(fs => {
          const isOpen = expanded === fs.id
          return (
            <div key={fs.id} className="affs-card">
              <div className="affs-head" onClick={() => setExpanded(isOpen ? null : fs.id)}>
                <div className="affs-head-left">
                  <span className="affs-icon">📂</span>
                  <div>
                    <div className="affs-name">{fs.name}</div>
                    <div className="affs-meta">
                      <span className="af-id-cell">{fs.id}</span>
                      <span className="affs-sep">·</span>
                      <span>{fs.mounts.length} 个挂载点</span>
                      <span className="affs-sep">·</span>
                      <span>关联 {fs.sessionCount} 个 Session</span>
                    </div>
                  </div>
                </div>
                <div className="affs-head-right">
                  <span className="affs-created">{fs.createdAt}</span>
                  <span className={`affs-arrow ${isOpen ? 'open' : ''}`}>›</span>
                </div>
              </div>
              {isOpen && (
                <div className="affs-body">
                  <div className="affs-desc">{fs.desc}</div>
                  <div className="affs-mount-label">挂载配置</div>
                  {fs.mounts.map(m => (
                    <div key={m.id} className="affs-mount-row">
                      <span className={`affs-type-badge affs-type-${m.type}`}>{MOUNT_TYPES[m.type]?.icon} {MOUNT_TYPES[m.type]?.label}</span>
                      <div className="affs-path-area">
                        <div className="affs-src">{m.src}</div>
                        <div className="affs-mount-path">↳ {m.mountPath}</div>
                      </div>
                      <span className="affs-note">{m.note}</span>
                    </div>
                  ))}
                  <div className="affs-actions">
                    <button className="action-btn" onClick={() => setShowDrawer(true)}>+ 添加挂载</button>
                    <button className="action-btn">在 Session 中使用</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Filesystem Side Drawer */}
      {showDrawer && (
        <div className="af-drawer-overlay" onClick={() => setShowDrawer(false)}>
          <div className="af-drawer" onClick={e => e.stopPropagation()}>
            <div className="af-drawer-header">
              <div className="af-drawer-title-wrap">
                <div className="af-drawer-icon">📂</div>
                <div className="af-drawer-title">新建 Filesystem</div>
              </div>
              <button className="af-drawer-close" onClick={() => setShowDrawer(false)}>×</button>
            </div>

            <div className="af-drawer-body">
              <div className="af-field">
                <label className="af-field-label">工作区名称</label>
                <input 
                  className="af-input-text" 
                  placeholder="例如：ML Training Workspace" 
                  value={fsName} 
                  onChange={e => setFsName(e.target.value)} 
                />
              </div>

              <div className="af-field">
                <label className="af-field-label">描述</label>
                <textarea 
                  className="af-input-textarea" 
                  placeholder="描述这个工作区的用途…" 
                  style={{ minHeight: 80 }}
                  value={fsDesc}
                  onChange={e => setFsDesc(e.target.value)}
                />
              </div>

              <div className="af-form-section">
                <div className="af-form-section-title">挂载配置 (Mounts)</div>
                <div className="af-field-hint">
                  你可以为一个工作区配置多个源。当 Session 启动时，系统将按照配置将这些源合并挂载到指定的路径。
                </div>

                {mounts.length === 0 ? (
                  <div className="af-success-state" style={{ padding: '20px 0' }}>
                    <p style={{ color: '#64748b', fontSize: 13 }}>暂无挂载点。点击下方按钮开始添加。</p>
                  </div>
                ) : (
                  mounts.map((m, i) => (
                    <div key={i} className="af-field" style={{ padding: 16, border: '1px solid #e2e8f0', borderRadius: 12, marginBottom: 16 }}>
                      <div className="af-field">
                        <label className="af-field-label">类型</label>
                        <select className="af-input-select" value={m.type}>
                          <option value="file">Files API 文件</option>
                          <option value="github">GitHub 仓库</option>
                          <option value="workspace">本地工作区</option>
                        </select>
                      </div>
                      <div className="af-field">
                        <label className="af-field-label">源 (Source)</label>
                        <input className="af-input-text" placeholder={m.type === 'github' ? 'https://github.com/...' : 'file_id or path'} />
                      </div>
                      <div className="af-field">
                        <label className="af-field-label">挂载路径 (Mount Path)</label>
                        <input className="af-input-text" placeholder="/workspace/data/" />
                      </div>
                    </div>
                  ))
                )}
                <button className="action-btn" style={{ width: '100%', borderStyle: 'dashed' }} onClick={addMountLine}>+ 添加挂载源</button>
              </div>
            </div>

            <div className="af-drawer-footer">
              <button className="action-btn" onClick={() => setShowDrawer(false)}>取消</button>
              <button className="action-btn primary" disabled={!fsName.trim()} onClick={handleCreate}>保存 Filesystem</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="ha-toast ha-toast-success">{toast}</div>}
    </PageLayout>
  )
}
