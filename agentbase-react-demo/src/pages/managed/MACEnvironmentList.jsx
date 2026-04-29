import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useManagedAgents } from '../../store/managedAgentStore'
import PageLayout, { DataToolbar } from '../../components/PageLayout'
import { 
  IconPlus, IconSearch, IconRotateCcw, IconList, IconGrid, 
  IconPackage, IconTool, IconClipboard, IconLock, IconZap, 
  IconAlertTriangle, IconTrash, IconX
} from '../../components/Icons'
import './MAC.css'




export default function MACEnvironmentList() {
  const navigate = useNavigate()
  const { environments, sessions, dispatch } = useManagedAgents()
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [viewMode, setViewMode] = useState('list')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({ 
    name: '', 
    description: '',
    network: { mode: 'restricted', allowMcp: true, allowPkg: true, allowUrls: '' },
    dependencies: [{ type: 'pip', libraries: 'pandas=1.0\nnumpy\nrequests' }],
    metadata: [{ key: '', value: '' }]
  })
  const [createErrors, setCreateErrors] = useState({})

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const handleOpenCreate = () => {
    setCreateForm({ 
      name: '', 
      description: '',
      network: { mode: 'restricted', allowMcp: true, allowPkg: true, allowUrls: '' },
      dependencies: [{ type: 'pip', libraries: '' }],
      metadata: [{ key: '', value: '' }]
    })
    setCreateErrors({})
    setShowCreateModal(true)
  }

  const handleCreate = () => {
    const errs = {}
    if (!createForm.name.trim()) errs.name = '名称不能为空'
    if (createForm.name.length > 50) errs.name = '名称不超过 50 字符'
    if (Object.keys(errs).length) { setCreateErrors(errs); return }

    dispatch({
      type: 'CREATE_ENVIRONMENT',
      payload: {
        name: createForm.name.trim(),
        description: createForm.description,
        runtime: 'python',
        dependencies: createForm.dependencies,
        networkPolicy: { 
          mode: createForm.network.mode, 
          allowMcp: createForm.network.allowMcp,
          allowPkg: createForm.network.allowPkg,
          allowUrls: createForm.network.allowUrls.split('\n').filter(Boolean) 
        },
        metadata: createForm.metadata.filter(m => m.key && m.value),
      },
    })
    setShowCreateModal(false)
    showToast(`环境 "${createForm.name}" 创建成功`)
  }

  const addDependency = () => {
    setCreateForm(f => ({ ...f, dependencies: [...f.dependencies, { type: 'pip', libraries: '' }] }))
  }

  const removeDependency = (index) => {
    setCreateForm(f => ({ ...f, dependencies: f.dependencies.filter((_, i) => i !== index) }))
  }

  const updateDependency = (index, field, value) => {
    const next = [...createForm.dependencies]
    next[index][field] = value
    setCreateForm(f => ({ ...f, dependencies: next }))
  }

  const addMetadata = () => {
    setCreateForm(f => ({ ...f, metadata: [...f.metadata, { key: '', value: '' }] }))
  }

  const removeMetadata = (index) => {
    setCreateForm(f => ({ ...f, metadata: f.metadata.filter((_, i) => i !== index) }))
  }

  const updateMetadata = (index, field, value) => {
    const next = [...createForm.metadata]
    next[index][field] = value
    setCreateForm(f => ({ ...f, metadata: next }))
  }

  const filtered = environments.filter(e => !search || e.name.toLowerCase().includes(search.toLowerCase()))

  const handleDelete = () => {
    if (confirmDelete) {
      dispatch({ type: 'DELETE_ENVIRONMENT', id: confirmDelete.id })
      showToast(`${confirmDelete.name} 已删除`)
      setConfirmDelete(null)
    }
  }

  return (
    <PageLayout title="沙箱环境" rightAction={<span style={{ fontSize: 12, color: '#999' }}>{environments.length} 个环境</span>}>
      <DataToolbar
        buttons={<button className="action-btn primary" onClick={handleOpenCreate} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconPlus size={16} /> 创建环境</button>}
        filters={
          <div className="ha-view-toggle">
            <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><IconList size={16} /></button>
            <button className={`view-btn ${viewMode === 'card' ? 'active' : ''}`} onClick={() => setViewMode('card')}><IconGrid size={16} /></button>
          </div>
        }
      >
        <div className="search-input">
          <span className="search-icon"><IconSearch size={14} /></span>
          <input placeholder="搜索环境名称" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="refresh-btn-sm" onClick={() => showToast('已刷新')}><IconRotateCcw size={14} /></button>
      </DataToolbar>

      {viewMode === 'list' && (
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>名称</th>
              <th>状态</th>
              <th>Session 数</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="data-table-empty">
                <div className="empty-state ha-empty">
                  <div className="empty-icon"><IconPackage size={48} style={{ opacity: 0.2 }} /></div>
                  <div className="ha-empty-title">还没有环境</div>
                  <div className="ha-empty-desc">创建一个业务沙箱，为 Agent 提供安全且隔离的运行能力</div>
                </div>
              </td></tr>
            ) : filtered.map(env => {
              return (
                <tr key={env.id}>
                  <td>
                    <span className="ha-name-link" onClick={() => navigate(`/af-environment/${env.id}`)}>{env.name}</span>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{env.description}</div>
                  </td>
                  <td>
                    <span className="ha-status-tag" style={{ background: '#f6ffed', color: '#52c41a', border: '1px solid #b7eb8f', padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>可用</span>
                  </td>
                  <td>{env.sessionsCount || 0}</td>
                  <td>{env.createdAt?.slice(0, 10)}</td>
                  <td>
                    <div className="ha-row-actions">
                      <button onClick={() => navigate(`/af-environment/${env.id}`)}>详情</button>
                      <button className="ha-delete-btn" onClick={() => setConfirmDelete(env)}><IconTrash size={14} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="data-pagination"><span>共 {filtered.length} 条</span></div>
      </div>
      )}

      {viewMode === 'card' && (
        <div className="mac-mcp-grid">
          {filtered.map(env => {
            const envSessionCount = sessions.filter(s => s.environmentId === env.id).length
            return (
              <div key={env.id} className="mac-mcp-card" onClick={() => navigate(`/af-environment/${env.id}`)}>
                <div className="mac-mcp-card-header">
                  <span className="mac-mcp-card-name">{env.name}</span>
                  <span style={{ fontSize: 11, color: '#52c41a', fontWeight: 500 }}>● 可用</span>
                </div>
                <div className="mac-mcp-card-desc">{env.description}</div>
                <div className="mac-card-capabilities" style={{ marginTop: 6 }}>
                  <span className="mac-cap-pill"><IconClipboard size={12} style={{ marginRight: 4 }} /> {env.dependencies?.length || 0} deps</span>
                  <span className="mac-cap-pill"><IconZap size={12} style={{ marginRight: 4 }} /> {envSessionCount} sessions</span>
                </div>
                <div className="mac-mcp-card-meta" style={{ marginTop: 8 }}>
                  <span>{env.createdAt?.slice(0, 10)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {toast && <div className={`ha-toast ha-toast-${toast.type}`}>{toast.msg}</div>}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-icon"><IconAlertTriangle size={32} style={{ color: '#faad14' }} /></div>
            <div className="modal-message">确定要删除环境 <strong>{confirmDelete.name}</strong> 吗？</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="action-btn primary" style={{ background: '#ff4d4f', borderColor: '#ff4d4f' }} onClick={handleDelete}>删除</button>
              <button className="action-btn" onClick={() => setConfirmDelete(null)}>取消</button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="mac-create-env-modal" style={{ width: 800, maxWidth: '90vw', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <div className="mac-create-env-modal-header" style={{ padding: '20px 32px' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>创建环境</h2>
              <button className="mac-create-env-close" onClick={() => setShowCreateModal(false)}><IconX size={20} /></button>
            </div>

            <div className="mac-create-env-modal-body" style={{ padding: '0 32px 32px', overflowY: 'auto' }}>
              {/* 基本信息 */}
              <section style={{ marginBottom: 40 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>基本信息</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '16px', alignItems: 'flex-start' }}>
                  <label style={{ fontSize: 13, color: '#333', marginTop: 10 }}>名称：</label>
                  <input
                    className={`mac-env-text-input ${createErrors.name ? 'error' : ''}`}
                    placeholder="请输入环境名称"
                    value={createForm.name}
                    onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '16px', alignItems: 'flex-start', marginTop: 16 }}>
                  <label style={{ fontSize: 13, color: '#333', marginTop: 10 }}>描述：</label>
                  <textarea
                    className="mac-env-textarea"
                    placeholder="选填"
                    value={createForm.description}
                    onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>
              </section>

              {/* 网络 */}
              <section style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700 }}>网络</h3>
                </div>
                <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, marginBottom: 20 }}>
                  1. 控制环境对外访问的策略，确保访问安全可控<br />
                  2. Agent 执行任务过程中发起 MCP / HTTP 访问后，先检查是否存在在指定类别服务的访问许可，再检查是否存在在指定允许访问地址。
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', gap: 24, fontSize: 13, alignItems: 'center' }}>
                    <span style={{ width: 100 }}>外部网络访问：</span>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="radio" checked={createForm.network.mode === 'restricted'} onChange={() => setCreateForm(f => ({ ...f, network: { ...f.network, mode: 'restricted' } }))} /> 有限制
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="radio" checked={createForm.network.mode === 'unrestricted'} onChange={() => setCreateForm(f => ({ ...f, network: { ...f.network, mode: 'unrestricted' } }))} /> 无限制
                    </label>
                    {createForm.network.mode === 'unrestricted' && <span style={{ color: '#d946ef', marginLeft: 'auto' }}>如果选择无限制，则下方无其他配置内容</span>}
                  </div>

                  {createForm.network.mode === 'restricted' && (
                    <>
                      <div style={{ display: 'flex', gap: 24, fontSize: 13, alignItems: 'center' }}>
                        <span style={{ width: 100 }}>访问 MCP 服务：</span>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                          <input type="radio" checked={createForm.network.allowMcp} onChange={() => setCreateForm(f => ({ ...f, network: { ...f.network, allowMcp: true } }))} /> 允许
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                          <input type="radio" checked={!createForm.network.allowMcp} onChange={() => setCreateForm(f => ({ ...f, network: { ...f.network, allowMcp: false } }))} /> 拒绝
                        </label>
                      </div>
                      <div style={{ display: 'flex', gap: 24, fontSize: 13, alignItems: 'center' }}>
                        <span style={{ width: 100 }}>访问包管理服务：</span>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                          <input type="radio" checked={createForm.network.allowPkg} onChange={() => setCreateForm(f => ({ ...f, network: { ...f.network, allowPkg: true } }))} /> 允许
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                          <input type="radio" checked={!createForm.network.allowPkg} onChange={() => setCreateForm(f => ({ ...f, network: { ...f.network, allowPkg: false } }))} /> 拒绝
                        </label>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '16px', alignItems: 'flex-start' }}>
                        <label style={{ fontSize: 13, color: '#333', marginTop: 10 }}>允许访问地址：</label>
                        <textarea
                          className="mac-env-textarea"
                          placeholder="选填，一行一个，可添加多个"
                          value={createForm.network.allowUrls}
                          onChange={e => setCreateForm(f => ({ ...f, network: { ...f.network, allowUrls: e.target.value } }))}
                        />
                      </div>
                    </>
                  )}
                </div>
              </section>

              {/* 环境依赖包 */}
              <section style={{ marginBottom: 40 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>环境依赖包</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {createForm.dependencies.map((dep, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ background: '#eff6ff', padding: '8px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>包类型 {idx + 1}</span>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }} onClick={() => removeDependency(idx)}><IconTrash size={14} /></button>
                      </div>
                      <div style={{ padding: 16 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '16px', alignItems: 'center', marginBottom: 16 }}>
                          <label style={{ fontSize: 12 }}>包类型：</label>
                          <select 
                            style={{ height: 32, borderRadius: 4, border: '1px solid #e2e8f0', padding: '0 8px', fontSize: 13 }}
                            value={dep.type}
                            onChange={e => updateDependency(idx, 'type', e.target.value)}
                          >
                            {['pip', 'npm', 'apt', 'cargo', 'gem', 'go'].map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '16px', alignItems: 'flex-start' }}>
                          <label style={{ fontSize: 12, marginTop: 8 }}>库：</label>
                          <textarea
                            className="mac-env-textarea"
                            style={{ minHeight: 80, fontSize: 12 }}
                            placeholder="一行一个，说明库名称和版本（按需），如pandas=1.0"
                            value={dep.libraries}
                            onChange={e => updateDependency(idx, 'libraries', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button 
                    className="mac-quick-btn" 
                    style={{ width: 'fit-content', padding: '6px 16px' }}
                    onClick={addDependency}
                  >
                    <IconPlus size={14} className="mac-quick-icon" /> 添加
                  </button>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>当前已配置 {createForm.dependencies.length}/10 条</div>
                </div>
              </section>

              {/* 元数据 */}
              <section>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>元数据</h3>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>使用自定义键值对标识环境，请注意键必须为小写。</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {createForm.metadata.map((m, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <input 
                        className="mac-env-text-input" 
                        style={{ height: 32, flex: 1 }} 
                        placeholder="Key (小写)" 
                        value={m.key}
                        onChange={e => updateMetadata(idx, 'key', e.target.value.toLowerCase())}
                      />
                      <input 
                        className="mac-env-text-input" 
                        style={{ height: 32, flex: 1 }} 
                        placeholder="Value" 
                        value={m.value}
                        onChange={e => updateMetadata(idx, 'value', e.target.value)}
                      />
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }} onClick={() => removeMetadata(idx)}><IconTrash size={14} /></button>
                    </div>
                  ))}
                  <button 
                    className="mac-quick-btn" 
                    style={{ width: 'fit-content', padding: '6px 16px' }}
                    onClick={addMetadata}
                  >
                    <IconPlus size={14} className="mac-quick-icon" /> 添加
                  </button>
                </div>
              </section>
            </div>

            <div className="mac-create-env-modal-footer" style={{ padding: '16px 32px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 12, justifyContent: 'flex-start' }}>
              <button
                className="action-btn primary"
                style={{ height: 36, padding: '0 24px' }}
                disabled={!createForm.name.trim()}
                onClick={handleCreate}
              >
                确定
              </button>
              <button
                className="action-btn"
                style={{ height: 36, padding: '0 24px' }}
                onClick={() => setShowCreateModal(false)}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}
