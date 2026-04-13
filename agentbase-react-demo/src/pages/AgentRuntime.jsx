import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout, { GuideCards, DataToolbar, DataTable } from '../components/PageLayout'
import SelectionModal from '../components/SelectionModal'

const guideCards = [
  { title: 'Agent 应用开发', desc: '高代码开发：基于模板快速构建高代码开发环境，将 AI 数据库等各类组件调用命令集成至应用代码。随后，发布镜像版本或将已开发完成的镜像上传至仓库。' },
  { title: 'Agent 应用创建和发布', desc: '指定单个容器镜像或 Helm Chart 创建高代码应用，完成外部访问、组件与服务等配置。在低代码平台中创建并发布 Agent 应用，将自动同步至 AgentBase。' },
  { title: 'Agent 应用全链路观测', desc: '支持 Agent 应用、AI 数据库、记忆体、AI 模型服务、MCP 服务视角的全局应用观测，实时洞察应用性能表现，并发情况、可用性等。' },
]

const MOCK_SANDBOXES = [
  { id: 'sb-001', name: 'dev-sandbox-python', status: 'Running', createTime: '2026-04-12' },
  { id: 'sb-002', name: 'test-sandbox-node', status: 'Running', createTime: '2026-04-12' },
  { id: 'sb-003', name: 'creative-writing-env', status: 'Stopped', createTime: '2026-04-11' },
  { id: 'sb-004', name: 'v-qa-sandbox', status: 'Running', createTime: '2026-04-13' },
  { id: 'sb-005', name: 'data-mining-01', status: 'Running', createTime: '2026-04-13' },
]

export default function AgentRuntime({ onAlert }) {
  const [tab, setTab] = useState('runtime')
  const [codeType, setCodeType] = useState('high')
  const [showGuide, setShowGuide] = useState(true)
  const [showSandboxModal, setShowSandboxModal] = useState(false)
  const [currentRow, setCurrentRow] = useState(null)
  const navigate = useNavigate()

  const openSandboxModal = (row) => {
    setCurrentRow(row)
    setShowSandboxModal(true)
  }

  const columns = [
    { key: 'name', label: '名称', sortable: true },
    { key: 'status', label: '状态', sortable: true },
    { key: 'desc', label: '描述' },
    { key: 'sandbox', label: '运行沙箱', render: (val) => val ? val : '未绑定' },
    { key: 'k8s', label: '所在 K8s 集群' },
    { key: 'createTime', label: '创建时间', sortable: true },
    { key: 'creator', label: '创建人', sortable: true },
    { 
      key: 'actions', 
      label: '操作', 
      render: (_, row) => (
        <div className="ha-row-actions">
          <button onClick={() => openSandboxModal(row)}>更新沙箱</button>
          <button>详情</button>
          <button className="ha-delete-btn">停止</button>
        </div>
      )
    },
  ]

  const mockData = [
    { id: 1, name: 'CustomerSupport-Agent', status: 'Running', desc: '处理客户常见问题咨询', sandbox: 'dev-sandbox-python', k8s: 'cls-prod-01', createTime: '2026-04-12 10:00', creator: 'Admin' },
    { id: 2, name: 'DataAnalysis-Bot', status: 'Running', desc: '每日报表自动分析生成', sandbox: '', k8s: 'cls-prod-01', createTime: '2026-04-11 15:30', creator: 'Ricky' },
    { id: 3, name: 'CodeReview-Helper', status: 'Stopped', desc: '辅助代码质量检查', sandbox: 'test-sandbox-node', k8s: 'cls-dev-02', createTime: '2026-04-10 09:12', creator: 'Admin' },
  ]

  return (
    <PageLayout
      title="Agent 应用运行时"
      rightAction={
        <button className="action-btn" onClick={() => setShowGuide(!showGuide)}>
          {showGuide ? '⊙ 收起指引' : '⊕ 展开指引'}
        </button>
      }
    >
      {showGuide && <GuideCards cards={guideCards} />}
      <div className="page-tabs">
        <div className={`page-tab ${tab === 'runtime' ? 'active' : ''}`} onClick={() => setTab('runtime')}>Agent 应用运行时</div>
        <div className={`page-tab ${tab === 'artifact' ? 'active' : ''}`} onClick={() => setTab('artifact')}>制品上传管理</div>
      </div>
      <div className="info-alert">
        <span className="info-alert-icon">ℹ️</span>
        <span>平台暂仅支持创建高码 Agent 应用。如需创建低代码应用请前往 FastGPT 等平台，创建后的应用将自动同步至下方，可统一管理。</span>
        <span className="info-alert-close">×</span>
      </div>
      <DataToolbar
        buttons={
          <button className="action-btn primary" onClick={() => navigate('/agent-runtime/create')}>+ 创建 Agent 应用</button>
        }
        filters={
          <>
            <div className="radio-group">
              <button className={`radio-btn ${codeType === 'high' ? 'active' : ''}`} onClick={() => setCodeType('high')}>高代码应用</button>
              <button className={`radio-btn ${codeType === 'low' ? 'active' : ''}`} onClick={() => setCodeType('low')}>低代码应用</button>
            </div>
            <button className="action-btn" onClick={onAlert}>🔧 筛选</button>
          </>
        }
      >
        <div className="search-input">
          <span className="search-icon">🔍</span>
          <input placeholder="名称" />
        </div>
        <button className="refresh-btn-sm">↻</button>
      </DataToolbar>
      <DataTable columns={columns} data={mockData} />

      <SelectionModal
        title={`关联沙箱实例 - ${currentRow?.name}`}
        isVisible={showSandboxModal}
        onClose={() => setShowSandboxModal(false)}
        onConfirm={(ids) => {
          console.log('Updating sandboxes for', currentRow?.name, ids)
          setShowSandboxModal(false)
        }}
        items={MOCK_SANDBOXES}
        columns={[
          { key: 'name', label: '名称' },
          { key: 'status', label: '状态' },
          { key: 'createTime', label: '创建日期' },
        ]}
        initialSelection={currentRow?.sandbox ? [MOCK_SANDBOXES.find(s => s.name === currentRow.sandbox)?.id].filter(Boolean) : []}
      />
    </PageLayout>
  )
}
