import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageLayout, { GuideCards, DataToolbar, DataTable } from '../components/PageLayout'
import { IconArrowLeft, IconPlus, IconSearch, IconRotateCcw, IconInbox, IconInfo, IconX } from '../components/Icons'
import './SandboxManage.css'

const guideCards = [
  { title: '沙箱模板定义', desc: '沙箱模板对应集群中的资源定义（Template）。创建模板即意味着在集群中预置环境规格、运行时镜像及预留池策略，为 Agent 提供安全隔离的运行空间。' },
  { title: '实例监控与调试', desc: '从模板派生的运行实例具备独立的访问链接。您可以实时监控实例的资源消耗（CPU/内存），并通过控制台直接进行底层调试。' },
]

const MOCK_TEMPLATES = [
  { 
    id: 'tmpl-001', 
    name: 'OpenSandbox 执行环境', 
    clusterTemplate: 'st-opensandbox-default', 
    image: 'agentbase/runtime-opensandbox:latest', 
    instanceCount: 2, 
    prewarm: { target: 10, actual: 8 },
    description: '标准 OpenSandbox 运行时，支持主流编程语言及工具链' 
  }
]

const MOCK_INSTANCES = [
  { id: 'sb-001', templateId: 'tmpl-001', status: 'Running', cpu: '0.5 / 4 cores', mem: '1.2 / 8 GB', uptime: '12h 30m', url: 'https://sandbox-sb-001.agentbase.dev' },
  { id: 'sb-002', templateId: 'tmpl-001', status: 'Running', cpu: '1.1 / 4 cores', mem: '2.5 / 8 GB', uptime: '5h 12m', url: 'https://sandbox-sb-002.agentbase.dev' },
]

export default function SandboxManage({ onAlert }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState('template')
  const [showCreateDrawer, setShowCreateDrawer] = useState(false)
  const [showEditDrawer, setShowEditDrawer] = useState(false)
  const [editingTmpl, setEditingTmpl] = useState(null)

  // Creation Form State
  const [newTmpl, setNewTmpl] = useState({
    name: '',
    clusterTemplate: '',
    image: '',
    prewarmTarget: 0,
    description: ''
  })

  const templateColumns = [
    { 
      key: 'name', 
      label: '名称', 
      render: (val, row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span 
            style={{ fontWeight: 600, color: 'var(--color-blue)', cursor: 'pointer' }} 
            onClick={() => navigate(`/sandbox-manage/${row.id}/instances`)}
          >
            {val}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.id}</span>
        </div>
      )
    },
    { key: 'clusterTemplate', label: '集群模板' },
    { key: 'image', label: '运行时镜像' },
    { 
      key: 'prewarm', 
      label: '预热池(可用/目标)',
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 40, height: 6, background: '#eee', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${(val.actual / val.target) * 100}%`, height: '100%', background: val.actual < val.target ? '#fa8c16' : '#52c41a' }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{val.actual} / {val.target}</span>
        </div>
      )
    },
    { 
      key: 'instanceCount', 
      label: '活跃实例',
      render: (val) => (
        <span className={`status-badge ${val > 0 ? 'running' : 'stopped'}`}>
          {val} 个实例
        </span>
      )
    },
    { 
      key: 'actions', 
      label: '操作',
      render: (_, row) => (
        <div className="ha-row-actions">
          <button onClick={() => navigate(`/sandbox-manage/${row.id}/instances`)}>管理实例</button>
          <button onClick={() => handleEditClick(row)}>编辑</button>
          <button className="ha-delete-btn" onClick={() => onAlert('确认删除模板及其所有实例？')}>删除</button>
        </div>
      )
    },
  ]

  const instanceColumns = [
    { key: 'id', label: '实例 ID' },
    { 
      key: 'status', 
      label: '状态', 
      render: (val) => <span className={`status-badge ${val.toLowerCase()}`}>{val}</span>
    },
    { 
      key: 'resources', 
      label: '资源占用',
      render: (_, row) => (
        <div style={{ fontSize: 11 }}>
          <div>CPU: {row.cpu}</div>
          <div>MEM: {row.mem}</div>
        </div>
      )
    },
    { key: 'uptime', label: '运行时间' },
    { 
      key: 'url', 
      label: '访问链接',
      render: (val) => (
        <a href={val} target="_blank" rel="noreferrer" className="link-btn primary">打开链接</a>
      )
    },
    {
      key: 'actions',
      label: '操作',
      render: () => (
        <div className="ha-row-actions">
          <button onClick={() => onAlert('日志拉取中...')}>日志</button>
          <button onClick={() => onAlert('正在重启实例...')}>重启</button>
          <button className="ha-delete-btn" onClick={() => onAlert('实例已销毁')}>销毁</button>
        </div>
      )
    }
  ]

  const handleCreateTemplate = () => {
    onAlert('沙箱模板已创建，正在集群中进行同步...')
    setShowCreateDrawer(false)
    setNewTmpl({ name: '', clusterTemplate: '', image: '', prewarmTarget: 0, description: '' })
  }

  const handleEditClick = (row) => {
    setEditingTmpl({
      id: row.id,
      name: row.name,
      clusterTemplate: row.clusterTemplate,
      image: row.image,
      prewarmTarget: row.prewarm?.target || 0,
      description: row.description
    })
    setShowEditDrawer(true)
  }

  const handleSaveEdit = () => {
    onAlert('沙箱模板更新成功！已同步至集群。')
    setShowEditDrawer(false)
    setEditingTmpl(null)
  }

  // --- Recursive Render Logic ---

  if (id) {
    const activeTemplate = MOCK_TEMPLATES.find(t => t.id === id)
    const currentInstances = MOCK_INSTANCES.filter(inst => inst.templateId === id)

    return (
      <PageLayout 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="back-btn" onClick={() => navigate('/sandbox-manage')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconArrowLeft size={16} /></button>
            <span>实例管理 - {activeTemplate?.name || '未知模板'}</span>
          </div>
        }
      >
        <div className="page-tabs">
          <div className="page-tab active">沙箱实例</div>
        </div>

        <div className="info-alert">
          <span className="info-alert-icon">ℹ️</span>
          <div>
            当前模板: <strong>{activeTemplate?.clusterTemplate}</strong> ({activeTemplate?.image})。
            描述: {activeTemplate?.description}
          </div>
        </div>

        <DataToolbar
          buttons={
            <button className="action-btn primary" onClick={() => onAlert('正在启动新实例...')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconPlus size={16} /> 启动新实例</button>
          }
        >
          <div className="search-input">
            <span className="search-icon"><IconSearch size={14} /></span>
            <input placeholder="搜索实例 ID" />
          </div>
          <button className="refresh-btn-sm" onClick={() => onAlert('已刷新')}><IconRotateCcw size={14} /></button>
        </DataToolbar>

        {currentInstances.length > 0 ? (
          <DataTable columns={instanceColumns} data={currentInstances} />
        ) : (
          <div className="af-success-state">
            <IconInbox size={40} style={{ color: 'var(--notion-gray-300)', marginBottom: 12 }} />
            <p>该模板下暂无活跃实例</p>
          </div>
        )}
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="沙箱管理 (已废弃)"
      rightAction={
        <button className="action-btn" onClick={() => onAlert('展开/收起指引')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <IconInfo size={14} /> 指引记录
        </button>
      }
    >
      <GuideCards cards={guideCards} />

      <div className="page-tabs">
        <div 
          className={`page-tab ${tab === 'template' ? 'active' : ''}`} 
          onClick={() => setTab('template')}
        >
          沙箱模板
        </div>
      </div>

      <div className="info-alert" style={{ background: '#fff2f0', border: '1px solid #ffccc7' }}>
        <span className="info-alert-icon">⚠️</span>
        <span style={{ color: '#ff4d4f', fontWeight: 500 }}>提示：该模块已废弃。下个版本将不再独立展示，其功能已整合至 Environment 模块，此处仅供 Agent Factory 兼容性参考。</span>
      </div>

      <DataToolbar
        buttons={
          <button className="action-btn primary" onClick={() => setShowCreateDrawer(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconPlus size={16} /> 创建沙箱模板</button>
        }
      >
        <div className="search-input">
          <span className="search-icon"><IconSearch size={14} /></span>
          <input placeholder="搜索模板名称" />
        </div>
        <button className="refresh-btn-sm" onClick={() => onAlert('刷新完成')}><IconRotateCcw size={14} /></button>
      </DataToolbar>

      <DataTable columns={templateColumns} data={MOCK_TEMPLATES} />

      {/* Create Template Drawer */}
      {showCreateDrawer && (
        <div className="af-drawer-overlay" onClick={() => setShowCreateDrawer(false)}>
          <div className="af-drawer" onClick={e => e.stopPropagation()}>
            <div className="af-drawer-header">
              <div className="af-drawer-title-wrap">
                <div className="af-drawer-title">创建沙箱模板</div>
              </div>
              <button className="af-drawer-close" onClick={() => setShowCreateDrawer(false)}><IconX size={20} /></button>
            </div>
            
            <div className="af-drawer-body">
              <div className="af-field">
                <label className="af-field-label">模板名称</label>
                <input 
                  className="af-input-text" 
                  placeholder="例如：OpenSandbox 标准执行环境" 
                  value={newTmpl.name}
                  onChange={e => setNewTmpl({...newTmpl, name: e.target.value})}
                />
              </div>

              <div className="af-field">
                <label className="af-field-label">集群模板名称 (Cluster Template)</label>
                <input 
                  className="af-input-text" 
                  placeholder="请输入集群环境对应的模板 ID" 
                  value={newTmpl.clusterTemplate}
                  onChange={e => setNewTmpl({...newTmpl, clusterTemplate: e.target.value})}
                />
              </div>

              <div className="af-field">
                <label className="af-field-label">运行时镜像</label>
                <input 
                  className="af-input-text" 
                  placeholder="例如：agentbase/runtime-opensandbox:latest" 
                  value={newTmpl.image}
                  onChange={e => setNewTmpl({...newTmpl, image: e.target.value})}
                />
              </div>

              <div className="af-field">
                <label className="af-field-label">预热池目标数</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input 
                    type="number"
                    className="af-input-text" 
                    style={{ width: 120 }}
                    value={newTmpl.prewarmTarget}
                    onChange={e => setNewTmpl({...newTmpl, prewarmTarget: parseInt(e.target.value) || 0})}
                  />
                  <span style={{ fontSize: 13, color: '#64748b' }}>个预热实例</span>
                </div>
              </div>

              <div className="af-field">
                <label className="af-field-label">描述</label>
                <textarea 
                  className="af-input-text" 
                  style={{ height: 80, padding: '10px 12px' }}
                  placeholder="请输入该模板的应用场景描述..." 
                  value={newTmpl.description}
                  onChange={e => setNewTmpl({...newTmpl, description: e.target.value})}
                />
              </div>
            </div>

            <div className="af-drawer-footer">
              <button 
                className="action-btn primary" 
                style={{ width: '100%' }}
                onClick={handleCreateTemplate}
                disabled={!newTmpl.name || !newTmpl.clusterTemplate || !newTmpl.image}
              >
                创建模板
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Template Drawer */}
      {showEditDrawer && editingTmpl && (
        <div className="af-drawer-overlay" onClick={() => setShowEditDrawer(false)}>
          <div className="af-drawer" onClick={e => e.stopPropagation()}>
            <div className="af-drawer-header">
              <div className="af-drawer-title-wrap">
                <div className="af-drawer-title">编辑沙箱模板</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>ID: {editingTmpl.id}</div>
              </div>
              <button className="af-drawer-close" onClick={() => setShowEditDrawer(false)}><IconX size={20} /></button>
            </div>
            
            <div className="af-drawer-body">
              <div className="af-field">
                <label className="af-field-label">模板名称</label>
                <input 
                  className="af-input-text" 
                  placeholder="例如：OpenSandbox 标准执行环境" 
                  value={editingTmpl.name}
                  onChange={e => setEditingTmpl({...editingTmpl, name: e.target.value})}
                />
              </div>

              <div className="af-field">
                <label className="af-field-label">集群模板名称 (Cluster Template)</label>
                <input 
                  className="af-input-text" 
                  placeholder="请输入集群环境对应的模板 ID" 
                  value={editingTmpl.clusterTemplate}
                  onChange={e => setEditingTmpl({...editingTmpl, clusterTemplate: e.target.value})}
                />
              </div>

              <div className="af-field">
                <label className="af-field-label">运行时镜像</label>
                <input 
                  className="af-input-text" 
                  placeholder="例如：agentbase/runtime-opensandbox:latest" 
                  value={editingTmpl.image}
                  onChange={e => setEditingTmpl({...editingTmpl, image: e.target.value})}
                />
              </div>

              <div className="af-field">
                <label className="af-field-label">预热池目标数</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input 
                    type="number"
                    className="af-input-text" 
                    style={{ width: 120 }}
                    value={editingTmpl.prewarmTarget}
                    onChange={e => setEditingTmpl({...editingTmpl, prewarmTarget: parseInt(e.target.value) || 0})}
                  />
                  <span style={{ fontSize: 13, color: '#64748b' }}>个预热实例</span>
                </div>
              </div>

              <div className="af-field">
                <label className="af-field-label">描述</label>
                <textarea 
                  className="af-input-text" 
                  style={{ height: 80, padding: '10px 12px' }}
                  placeholder="请输入该模板的应用场景描述..." 
                  value={editingTmpl.description}
                  onChange={e => setEditingTmpl({...editingTmpl, description: e.target.value})}
                />
              </div>
            </div>

            <div className="af-drawer-footer">
              <button 
                className="action-btn primary" 
                style={{ width: '100%' }}
                onClick={handleSaveEdit}
                disabled={!editingTmpl.name || !editingTmpl.clusterTemplate || !editingTmpl.image}
              >
                保存变更
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}
