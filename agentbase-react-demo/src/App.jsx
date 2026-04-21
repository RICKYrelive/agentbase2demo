import { useState, useEffect, useCallback } from 'react'
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
import SkillCenter from './pages/SkillCenter'
import SandboxManage from './pages/SandboxManage'
import APIRouting from './pages/APIRouting'
import GlobalObservation from './pages/GlobalObservation'
import Trace from './pages/Trace'
import ClusterManage from './pages/ClusterManage'
import SystemManagePage from './pages/SystemManagePage'
import CreateAgentApp from './pages/CreateAgentApp'
import SuperAgentList from './pages/SuperAgentList'
import CreateSuperAgent from './pages/CreateSuperAgent'
import SuperAgentDetail from './pages/SuperAgentDetail'
import AgentWebUI from './pages/AgentWebUI'
import { SuperAgentProvider } from './store/superAgentStore.jsx'
import { SkillProvider } from './store/skillStore.jsx'
import { CommentProvider, useComments } from './store/commentStore.jsx'
import FloatingCommentBall from './components/FloatingCommentBall'
import CommentPanel from './components/CommentPanel'
import CommentPin from './components/CommentPin'
import { getElementSelector, getElementLabel, highlightElement, locateElement } from './utils/elementSelector'

import CreateSkillPackage from './pages/CreateSkillPackage'
import SkillPackageDetail from './pages/SkillPackageDetail'
import CreateSkill from './pages/CreateSkill'
import UpdateSkill from './pages/UpdateSkill'
import SkillDetail from './pages/SkillDetail'

// Agent Factory
import AFWorkshop from './pages/factory/AFWorkshop'
import AFAgent from './pages/factory/AFAgent'
import AFSession from './pages/factory/AFSession'
import AFVaults from './pages/factory/AFVaults'

// Agent Console (Managed Agent)
import { ManagedAgentProvider } from './store/managedAgentStore.jsx'
import MACEnvironmentList from './pages/managed/MACEnvironmentList'
import MACEnvironmentDetail from './pages/managed/MACEnvironmentDetail'
import MACEventTimeline from './pages/managed/MACEventTimeline'
import MACToolCatalog from './pages/managed/MACToolCatalog'
import MACCustomToolBuilder from './pages/managed/MACCustomToolBuilder'
import MACIntegrations from './pages/managed/MACIntegrations'
import MACSecrets from './pages/managed/MACSecrets'
import MACApprovals from './pages/managed/MACApprovals'
import MACAnalytics from './pages/managed/MACAnalytics'
import MACAuditLog from './pages/managed/MACAuditLog'
import MACRoles from './pages/managed/MACRoles'

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
  const [modalMessage, setModalMessage] = useState('非demo演示区域')
  const [panelOpen, setPanelOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const currentPath = location.pathname.replace(/^\//, '') || 'overview'

  const handleNavClick = (key) => {
    if (key === 'super-agent' || key === 'managed-agent' || key === 'sandbox-manage') {
      handleAlert('本次迭代暂不开放页面')
    }
    if (key.startsWith('agent-runtime/') || key.startsWith('super-agent/') || key.startsWith('skill-center/') || key.startsWith('managed-agent/')) {
        navigate('/' + key.split('/')[0])
    } else {
        navigate('/' + key)
    }
  }

  const handleAlert = useCallback((msg = '非demo演示区域') => {
    setModalMessage(msg)
    setShowModal(true)
  }, [setModalMessage, setShowModal])

  let activeNav = currentPath
  if (activeNav.startsWith('super-agent/')) activeNav = 'super-agent'
  if (activeNav.startsWith('agent-runtime/')) activeNav = 'agent-runtime'
  if (activeNav.startsWith('skill-center/')) activeNav = 'skill-center'
  if (activeNav.startsWith('managed-agent/')) activeNav = 'managed-agent'

  return (
    <div className="app-layout">
      <Sidebar activeNav={activeNav} onNavClick={handleNavClick} />
      <div className="app-main">
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/application-portal" element={<AppPortal onAlert={handleAlert} />} />
          <Route path="/agent-dev" element={<AgentDev onAlert={handleAlert} />} />
          <Route path="/agent-runtime" element={<AgentRuntime onAlert={handleAlert} />} />
          <Route path="/agent-runtime/create" element={<CreateAgentApp />} />
          <Route path="/super-agent" element={<SuperAgentList />} />
          <Route path="/super-agent/create" element={<CreateSuperAgent />} />
          <Route path="/super-agent/:id" element={<SuperAgentDetail />} />
          <Route path="/ai-database" element={<AIDatabase onAlert={handleAlert} />} />
          <Route path="/memory" element={<Memory onAlert={handleAlert} />} />
          <Route path="/ai-model-service" element={<AIModelService onAlert={handleAlert} />} />
          <Route path="/mcp-service" element={<MCPService onAlert={handleAlert} />} />
          <Route path="/skill-center" element={<SkillCenter onAlert={handleAlert} />} />
          <Route path="/skill-center/package/create" element={<CreateSkillPackage />} />
          <Route path="/skill-center/package/:id" element={<SkillPackageDetail />} />
          <Route path="/skill-center/skill/create" element={<CreateSkill />} />
          <Route path="/skill-center/skill/update/:id" element={<UpdateSkill />} />
          <Route path="/skill-center/skill/:id" element={<SkillDetail />} />
          <Route path="/sandbox-manage" element={<SandboxManage onAlert={handleAlert} />} />
          <Route path="/sandbox-manage/:id/instances" element={<SandboxManage onAlert={handleAlert} />} />
          <Route path="/api-routing" element={<APIRouting onAlert={handleAlert} />} />
          <Route path="/global-observation" element={<GlobalObservation onAlert={handleAlert} />} />
          <Route path="/trace" element={<Trace onAlert={handleAlert} />} />
          <Route path="/cluster-manage" element={<ClusterManage onAlert={handleAlert} />} />
          {/* Agent Console (Managed Agent) Routes */}
          <Route path="/managed-agent/environments" element={<MACEnvironmentList />} />
          <Route path="/managed-agent/environments/:id" element={<MACEnvironmentDetail />} />
          <Route path="/managed-agent/events" element={<MACEventTimeline />} />
          <Route path="/managed-agent/tools" element={<MACToolCatalog />} />
          <Route path="/managed-agent/tools/create" element={<MACCustomToolBuilder />} />
          <Route path="/managed-agent/integrations" element={<MACIntegrations />} />
          <Route path="/managed-agent/secrets" element={<MACSecrets />} />
          <Route path="/managed-agent/approvals" element={<MACApprovals />} />
          <Route path="/managed-agent/analytics" element={<MACAnalytics />} />
          <Route path="/managed-agent/audit" element={<MACAuditLog />} />
          <Route path="/managed-agent/settings/roles" element={<MACRoles />} />
          {/* Agent Factory Routes */}
          <Route path="/af-workshop" element={<AFWorkshop />} />
          <Route path="/af-agent" element={<AFAgent />} />
          <Route path="/af-session" element={<AFSession />} />
          <Route path="/af-environment" element={<MACEnvironmentList />} />
          <Route path="/af-environment/:id" element={<MACEnvironmentDetail />} />
          <Route path="/af-passport" element={<AFVaults />} />
          {Object.entries(systemPages).map(([key, cfg]) => (
            <Route key={key} path={`/${key}`} element={
              <SystemManagePage onAlert={handleAlert} pageTitle={cfg.title} columns={cfg.columns} />
            } />
          ))}
        </Routes>
      </div>
      {showModal && <AlertModal message={modalMessage} onClose={() => setShowModal(false)} />}
      <CommentLayer
        currentPage={`/${currentPath}`}
        panelOpen={panelOpen}
        setPanelOpen={setPanelOpen}
        navigate={navigate}
      />
    </div>
  )
}

/**
 * Inner layer that has access to CommentContext.
 * Handles middle-mouse-click global listener + renders comment UI.
 */
function CommentLayer({ currentPage, panelOpen, setPanelOpen, navigate }) {
  const { dispatch, comments, pendingLocateId } = useComments();

  // Global middle-mouse-click (button 1) listener
  useEffect(() => {
    const handleMouseDown = (e) => {
      // Only trigger on middle mouse button (button === 1)
      if (e.button !== 1) return;

      // Ignore clicks on comment system UI itself
      if (e.target.closest('.floating-comment-ball, .comment-panel-overlay, .comment-pin, .pin-mode-hint, .ball-menu, .sidebar')) return;

      e.preventDefault();
      e.stopPropagation();

      const target = e.target;
      const selector = getElementSelector(target);
      const label = getElementLabel(target);

      // Highlight the element immediately
      if (selector) {
        const el = document.querySelector(selector);
        if (el) highlightElement(el);
      }

      // Set pending comment so the panel form is pre-filled
      dispatch({
        type: 'SET_PENDING_COMMENT',
        payload: {
          linkedSelector: selector,
          linkedLabel: label,
          page: currentPage
        }
      });

      // Open the panel
      setPanelOpen(true);
    };

    document.addEventListener('mousedown', handleMouseDown, true);
    return () => document.removeEventListener('mousedown', handleMouseDown, true);
  }, [currentPage, dispatch, setPanelOpen]);

  // Handle cross-page locate: after page changes, execute pending locate
  useEffect(() => {
    if (!pendingLocateId) return;
    const comment = comments.find(c => c.id === pendingLocateId);
    if (!comment) {
      dispatch({ type: 'CLEAR_PENDING_LOCATE' });
      return;
    }
    // Only execute when we've arrived on the right page
    if (comment.page !== currentPage) return;

    dispatch({ type: 'CLEAR_PENDING_LOCATE' });

    // Wait for the new page's DOM to render
    const timer = setTimeout(() => {
      if (comment.linkedSelector) {
        const el = locateElement(comment.linkedSelector);
        if (el) highlightElement(el);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [currentPage, pendingLocateId, comments, dispatch]);

  return (
    <>
      <CommentPin currentPage={currentPage} onCommentClick={() => setPanelOpen(true)} />
      <FloatingCommentBall onTogglePanel={() => setPanelOpen(!panelOpen)} panelOpen={panelOpen} />
      <CommentPanel open={panelOpen} onClose={() => setPanelOpen(false)} currentPage={currentPage} navigate={navigate} />
    </>
  );
}

function App() {
  return (
    <HashRouter>
      <SuperAgentProvider>
        <SkillProvider>
          <ManagedAgentProvider>
            <CommentProvider>
              <Routes>
                <Route path="/super-agent/:id/webui" element={<AgentWebUI />} />
                <Route path="/*" element={<AppLayout />} />
              </Routes>
            </CommentProvider>
          </ManagedAgentProvider>
        </SkillProvider>
      </SuperAgentProvider>
    </HashRouter>
  )
}

export default App

