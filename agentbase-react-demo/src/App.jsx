import { useState } from 'react'
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import OverviewPage from './components/OverviewPage'
import AlertModal from './components/AlertModal'
import AppPortal from './pages/AppPortal'
import AgentDev from './pages/AgentDev'
import AgentRuntime from './pages/AgentRuntime'
import AIDatabase from './pages/AIDatabase'
import Memory from './pages/Memory'
import AIModelService from './pages/AIModelService'
import MCPService from './pages/MCPService'
import APIRouting from './pages/APIRouting'
import GlobalObservation from './pages/GlobalObservation'
import Trace from './pages/Trace'
import ClusterManage from './pages/ClusterManage'
import SystemManagePage from './pages/SystemManagePage'
import CreateAgentApp from './pages/CreateAgentApp'

import './App.css'

const systemPages = {
  'image-registry': { title: '镜像仓库', columns: [{key:'name',label:'名称'},{key:'status',label:'状态'},{key:'url',label:'仓库地址'},{key:'type',label:'类型'},{key:'createTime',label:'创建时间'}] },
  'member-management': { title: '成员管理', columns: [{key:'name',label:'用户名'},{key:'role',label:'角色'},{key:'email',label:'邮箱'},{key:'lastLogin',label:'最近登录'},{key:'createTime',label:'创建时间'}] },
  'workspace-management': { title: '工作空间管理', columns: [{key:'name',label:'名称'},{key:'desc',label:'描述'},{key:'members',label:'成员数'},{key:'createTime',label:'创建时间'}] },
  'operation-audit': { title: '操作审计', columns: [{key:'user',label:'操作人'},{key:'action',label:'操作类型'},{key:'resource',label:'操作对象'},{key:'result',label:'结果'},{key:'time',label:'操作时间'}] },
  'gateway-instance': { title: '网关实例管理', columns: [{key:'name',label:'名称'},{key:'status',label:'状态'},{key:'type',label:'类型'},{key:'k8s',label:'所在K8s集群'},{key:'createTime',label:'创建时间'}] },
  'auth-manage': { title: '凭证管理', columns: [{key:'name',label:'名称'},{key:'type',label:'类型'},{key:'desc',label:'描述'},{key:'createTime',label:'创建时间'}] },
}

function AppLayout() {
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const currentPath = location.pathname.replace(/^\//, '') || 'overview'

  const handleNavClick = (key) => {
    if (key.startsWith('agent-runtime/')) {
        navigate('/' + key.split('/')[0])
    } else {
        navigate('/' + key)
    }
  }

  const handleAlert = () => setShowModal(true)

  return (
    <div className="app-layout">
      <Sidebar activeNav={currentPath} onNavClick={handleNavClick} />
      <div className="app-main">
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/application-portal" element={<AppPortal onAlert={handleAlert} />} />
          <Route path="/agent-dev" element={<AgentDev onAlert={handleAlert} />} />
          <Route path="/agent-runtime" element={<AgentRuntime onAlert={handleAlert} />} />
          <Route path="/agent-runtime/create" element={<CreateAgentApp />} />
          <Route path="/ai-database" element={<AIDatabase onAlert={handleAlert} />} />
          <Route path="/memory" element={<Memory onAlert={handleAlert} />} />
          <Route path="/ai-model-service" element={<AIModelService onAlert={handleAlert} />} />
          <Route path="/mcp-service" element={<MCPService onAlert={handleAlert} />} />
          <Route path="/api-routing" element={<APIRouting onAlert={handleAlert} />} />
          <Route path="/global-observation" element={<GlobalObservation onAlert={handleAlert} />} />
          <Route path="/trace" element={<Trace onAlert={handleAlert} />} />
          <Route path="/cluster-manage" element={<ClusterManage onAlert={handleAlert} />} />
          {Object.entries(systemPages).map(([key, cfg]) => (
            <Route key={key} path={`/${key}`} element={
              <SystemManagePage onAlert={handleAlert} pageTitle={cfg.title} columns={cfg.columns} />
            } />
          ))}
        </Routes>
      </div>
      {showModal && <AlertModal onClose={() => setShowModal(false)} />}
    </div>
  )
}

function App() {
  return (
    <HashRouter>
      <AppLayout />
    </HashRouter>
  )
}

export default App
