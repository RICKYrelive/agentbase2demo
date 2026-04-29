import { useState } from 'react'
import PageLayout, { DataToolbar } from '../../components/PageLayout'
import { 
  IconPlus, IconSearch, IconRefresh, IconCopy, IconEdit, IconTrash, IconX, IconEye, IconEyeOff, IconGlobe
} from '../../components/Icons'
import './AF.css'

const MOCK_EXTERNAL_AGENTS = [
  { 
    id: 'ext_01', 
    name: 'Agent 01', 
    desc: '外部部署的生产级客服 Agent', 
    url: 'https://api.external-agent.com', 
    protocols: 'Chat Completion, Dify', 
    updatedAt: '2025-10-02 16:30:11', 
    createdAt: '2025-10-02 16:30:11', 
    owner: 'tenantA' 
  },
  { 
    id: 'ext_02', 
    name: 'Research Assistant', 
    desc: '第三方深度研究服务', 
    url: 'https://research.api.com', 
    protocols: 'Chat Completion', 
    updatedAt: '2025-10-02 16:30:11', 
    createdAt: '2025-10-02 16:30:11', 
    owner: 'administrator' 
  },
  { 
    id: 'ext_03', 
    name: 'Data Processor', 
    desc: '后端自动化数据处理节点', 
    url: 'https://processor.internal', 
    protocols: 'Dify', 
    updatedAt: '2025-10-02 16:30:11', 
    createdAt: '2025-10-02 16:30:11', 
    owner: 'tenantA' 
  },
]

export default function AFExternalRegister() {
  const [search, setSearch] = useState('')
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [showKey, setShowKey] = useState(false)

  const filtered = MOCK_EXTERNAL_AGENTS.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.id.includes(search)
  )

  const openDetail = (agent) => {
    setSelectedAgent(agent)
  }

  return (
    <PageLayout title="外部 Agent 注册">
      <DataToolbar
        buttons={
          <button className="action-btn primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <IconPlus size={16} /> 注册
          </button>
        }
      >
        <div className="search-input">
          <IconSearch className="search-icon" size={16} />
          <input 
            placeholder="搜索名称或 ID" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <button className="refresh-btn-sm">
          <IconRefresh size={14} />
        </button>
      </DataToolbar>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>名称</th>
              <th>描述</th>
              <th>访问地址</th>
              <th>访问协议</th>
              <th>最近更新时间</th>
              <th>注册时间</th>
              <th>注册人</th>
              <th style={{ textAlign: 'right' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id}>
                <td>
                  <span 
                    className="af-name-link" 
                    onClick={() => openDetail(a)}
                    style={{ color: 'var(--notion-blue)', cursor: 'pointer', fontWeight: 500 }}
                  >
                    {a.name}
                  </span>
                </td>
                <td className="af-muted">{a.desc}</td>
                <td className="af-muted"><code>{a.url}</code></td>
                <td className="af-muted">{a.protocols}</td>
                <td className="af-muted">{a.updatedAt}</td>
                <td className="af-muted">{a.createdAt}</td>
                <td className="af-muted">{a.owner}</td>
                <td>
                  <div className="ha-row-actions" style={{ justifyContent: 'flex-end' }}>
                    <button className="notion-body-medium" style={{ color: 'var(--notion-blue)' }}>编辑</button>
                    <button className="ha-delete-btn notion-body-medium" style={{ color: 'var(--notion-warning)' }}>移除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="data-pagination">
          <span>共 {filtered.length} 条</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
            <span>每页</span>
            <select className="pagination-select"><option>50</option></select>
            <span>条</span>
            <div className="pagination-controls">
              <button disabled>‹</button>
              <button className="active">1</button>
              <button disabled>›</button>
            </div>
            <span>前往</span>
            <input type="text" className="pagination-go" defaultValue="1" />
            <span>页</span>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedAgent && (
        <div className="af-drawer-overlay" onClick={() => setSelectedAgent(null)}>
          <div className="af-drawer" style={{ width: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="af-drawer-header" style={{ borderBottom: '1px solid var(--notion-gray-200)' }}>
              <div className="af-drawer-title-wrap">
                <div className="af-drawer-title notion-h3">{selectedAgent.name}</div>
              </div>
              <button className="af-drawer-close" onClick={() => setSelectedAgent(null)}>
                <IconX size={20} />
              </button>
            </div>
            
            <div className="af-drawer-body" style={{ padding: '24px 32px' }}>
              {/* 基本信息 */}
              <section style={{ marginBottom: 32 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--notion-gray-900)' }}>基本信息</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', fontSize: 13 }}>
                    <span style={{ width: 80, color: 'var(--notion-gray-500)' }}>名称：</span>
                    <span style={{ color: 'var(--notion-gray-800)' }}>{selectedAgent.name}</span>
                  </div>
                  <div style={{ display: 'flex', fontSize: 13 }}>
                    <span style={{ width: 80, color: 'var(--notion-gray-500)' }}>描述：</span>
                    <span style={{ color: 'var(--notion-gray-800)' }}>{selectedAgent.desc}</span>
                  </div>
                </div>
              </section>

              {/* 访问与协议 */}
              <section style={{ marginBottom: 32 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--notion-gray-900)' }}>访问与协议</h4>
                <div style={{ display: 'flex', fontSize: 13, marginBottom: 20 }}>
                  <span style={{ width: 80, color: 'var(--notion-gray-500)' }}>访问地址：</span>
                  <code style={{ color: 'var(--notion-blue)', background: 'var(--notion-blue-bg)', padding: '2px 4px', borderRadius: 4 }}>{selectedAgent.url}</code>
                </div>

                {/* Chat Completion Protocol */}
                <div style={{ marginBottom: 24, borderTop: '1px solid var(--notion-gray-100)', paddingTop: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--notion-gray-600)', marginBottom: 12 }}>Chat Completion 协议</div>
                  <div style={{ display: 'flex', fontSize: 13, marginBottom: 12 }}>
                    <span style={{ width: 80, color: 'var(--notion-gray-500)' }}>Path:</span>
                    <span style={{ color: 'var(--notion-gray-800)' }}>/openai/v1/chat/completions</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--notion-gray-500)', marginBottom: 8 }}>Header:</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: 'var(--notion-bg-alt)', textAlign: 'left' }}>
                        <th style={{ padding: '8px', border: '1px solid var(--notion-gray-200)', fontWeight: 600 }}>键</th>
                        <th style={{ padding: '8px', border: '1px solid var(--notion-gray-200)', fontWeight: 600 }}>值</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '8px', border: '1px solid var(--notion-gray-200)' }}>Authorization</td>
                        <td style={{ padding: '8px', border: '1px solid var(--notion-gray-200)', color: 'var(--notion-gray-400)' }}>Bearer ****************</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Dify Protocol */}
                <div style={{ marginBottom: 24, borderTop: '1px solid var(--notion-gray-100)', paddingTop: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--notion-gray-600)', marginBottom: 12 }}>Dify 协议</div>
                  <div style={{ display: 'flex', fontSize: 13, marginBottom: 12 }}>
                    <span style={{ width: 80, color: 'var(--notion-gray-500)' }}>Path:</span>
                    <span style={{ color: 'var(--notion-gray-800)' }}>/v1/chat-messages</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--notion-gray-500)', marginBottom: 8 }}>Header:</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: 'var(--notion-bg-alt)', textAlign: 'left' }}>
                        <th style={{ padding: '8px', border: '1px solid var(--notion-gray-200)', fontWeight: 600 }}>键</th>
                        <th style={{ padding: '8px', border: '1px solid var(--notion-gray-200)', fontWeight: 600 }}>值</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '8px', border: '1px solid var(--notion-gray-200)' }}>Authorization</td>
                        <td style={{ padding: '8px', border: '1px solid var(--notion-gray-200)', color: 'var(--notion-gray-400)' }}>Bearer ****************</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* 认证管理 */}
              <section>
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--notion-gray-900)' }}>认证管理 (入站)</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: 'var(--notion-bg-alt)', textAlign: 'left' }}>
                      <th style={{ padding: '8px', border: '1px solid var(--notion-gray-200)', fontWeight: 600 }}>Key 名称</th>
                      <th style={{ padding: '8px', border: '1px solid var(--notion-gray-200)', fontWeight: 600 }}>API Key</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '8px', border: '1px solid var(--notion-gray-200)' }}>key 01</td>
                      <td style={{ padding: '8px', border: '1px solid var(--notion-gray-200)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <code style={{ color: 'var(--notion-gray-800)' }}>{showKey ? 'sk-a33d909ab7bd4199b0241e91b4775070' : 'sk-a33d909a********************'}</code>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="af-copy-btn" onClick={() => setShowKey(!showKey)}>
                              {showKey ? <IconEyeOff size={14} /> : <IconEye size={14} />}
                            </button>
                            <button className="af-copy-btn" onClick={() => { navigator.clipboard.writeText('sk-a33d909ab7bd4199b0241e91b4775070'); alert('已复制') }}>
                              <IconCopy size={14} />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px', border: '1px solid var(--notion-gray-200)' }}>key 02</td>
                      <td style={{ padding: '8px', border: '1px solid var(--notion-gray-200)', color: 'var(--notion-gray-400)' }}>
                        **********
                      </td>
                    </tr>
                  </tbody>
                </table>
              </section>
            </div>

            <div className="af-drawer-footer" style={{ borderTop: '1px solid var(--notion-gray-200)' }}>
              <button className="action-btn" onClick={() => setSelectedAgent(null)}>关闭</button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}
