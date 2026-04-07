import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout, { GuideCards, DataToolbar, DataTable } from '../components/PageLayout'

const guideCards = [
  { title: 'Agent 应用开发', desc: '高代码开发：基于模板快速构建高代码开发环境，将 AI 数据库等各类组件调用命令集成至应用代码。随后，发布镜像版本或将已开发完成的镜像上传至仓库。' },
  { title: 'Agent 应用创建和发布', desc: '指定单个容器镜像或 Helm Chart 创建高代码应用，完成外部访问、组件与服务等配置。在低代码平台中创建并发布 Agent 应用，将自动同步至 AgentBase。' },
  { title: 'Agent 应用全链路观测', desc: '支持 Agent 应用、AI 数据库、记忆体、AI 模型服务、MCP 服务视角的全局应用观测，实时洞察应用性能表现，并发情况、可用性等。' },
]

const columns = [
  { key: 'name', label: '名称', sortable: true },
  { key: 'status', label: '状态', sortable: true },
  { key: 'desc', label: '描述' },
  { key: 'k8s', label: '所在 K8s 集群' },
  { key: 'portal', label: '添加至应用门户' },
  { key: 'createTime', label: '创建时间', sortable: true },
  { key: 'creator', label: '创建人', sortable: true },
  { key: 'actions', label: '操作' },
]

export default function AgentRuntime({ onAlert }) {
  const [tab, setTab] = useState('runtime')
  const [codeType, setCodeType] = useState('high')
  const [showGuide, setShowGuide] = useState(true)
  const navigate = useNavigate()

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
      <DataTable columns={columns} />
    </PageLayout>
  )
}
