import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSkills } from '../store/skillStore'
import PageLayout from '../components/PageLayout'
import { 
  IconArrowLeft, 
  IconRefresh, 
  IconFolder, 
  IconFileText, 
  IconChevronRight, 
  IconChevronDown,
  IconTrash,
  IconAlertTriangle,
  IconSettings
} from '../components/Icons'

// Helper to render file tree
function FileTreeItem({ node, level = 0, onSelect, selectedFile, expandedFolders, toggleFolder }) {
  const isFolder = node.type === 'folder'
  const isSelected = selectedFile?.name === node.name && !isFolder
  const isExpanded = expandedFolders.has(node.name)

  return (
    <div className="file-tree-container">
      <div 
        className={`file-tree-item ${isSelected ? 'selected' : ''}`} 
        style={{ paddingLeft: level * 16 + 8 }}
        onClick={() => isFolder ? toggleFolder(node.name) : onSelect(node)}
      >
        {isFolder ? (
          <>
            {isExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
            <IconFolder size={16} style={{ color: '#ffc107', margin: '0 6px' }} />
          </>
        ) : (
          <>
            <span style={{ width: 14 }} />
            <IconFileText size={16} style={{ color: '#1677ff', margin: '0 6px' }} />
          </>
        )}
        <span className="file-name">{node.name}</span>
      </div>
      {isFolder && isExpanded && node.children?.map(child => (
        <FileTreeItem 
          key={child.name} 
          node={child} 
          level={level + 1} 
          onSelect={onSelect} 
          selectedFile={selectedFile}
          expandedFolders={expandedFolders}
          toggleFolder={toggleFolder}
        />
      ))}
    </div>
  )
}

export default function SkillDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { skills, dispatch } = useSkills()
  const [activeTab, setActiveTab] = useState('basic') // 'basic' | 'files'
  const [toast, setToast] = useState(null)
  
  const skill = skills.find(s => s.id === id)
  const [selectedVersionNum, setSelectedVersionNum] = useState(skill?.latestVersion || '')
  const [selectedFile, setSelectedFile] = useState(null)
  const [expandedFolders, setExpandedFolders] = useState(new Set(['root']))
  const [confirmDeleteVer, setConfirmDeleteVer] = useState(false)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const currentVersionData = useMemo(() => {
    if (!skill) return null
    return skill.versions.find(v => v.version === selectedVersionNum) || skill.versions[0]
  }, [skill, selectedVersionNum])

  const toggleFolder = (folderName) => {
    const newSet = new Set(expandedFolders)
    if (newSet.has(folderName)) newSet.delete(folderName)
    else newSet.add(folderName)
    setExpandedFolders(newSet)
  }

  const handleDeleteVersion = () => {
    if (skill.versions.length <= 1) {
      showToast('至少保留一个版本', 'error')
      setConfirmDeleteVer(false)
      return
    }
    dispatch({ type: 'DELETE_SKILL_VERSION', skillId: skill.id, version: selectedVersionNum })
    showToast('版本已删除')
    setConfirmDeleteVer(false)
    setSelectedVersionNum(skill.versions.filter(v => v.version !== selectedVersionNum).slice(-1)[0].version)
  }

  if (!skill) {
    return (
      <PageLayout title="未找到 Skill">
        <div className="ha-empty-card-state" style={{marginTop: 60}}>未找到该 Skill</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title={
        <div style={{display:'flex', alignItems:'center', gap:16}}>
          <button className="ha-back-button" onClick={() => navigate('/skill-center')} title="返回列表">
            <IconArrowLeft size={18} />
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18, fontWeight: 600, color: '#1d2129' }}>{skill.name}</span>
              <span className="ha-status-tag-v2" style={{ background: '#f6ffed', color: '#52c41a', border: '1px solid #b7eb8f' }}>
                {skill.status}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#86909c' }}>ID: {skill.id}</div>
          </div>
        </div>
      }
      rightAction={
        <div style={{display:'flex', alignItems: 'center', gap: 12}}>
          <button className="ha-btn-primary-sm" onClick={() => navigate(`/skill-center/skill/update/${skill.id}`)} style={{ marginRight: 4 }}>
            更新版本
          </button>
          <div className="ha-version-control">
            <label>版本</label>
            <div className="ha-select-custom">
              <select 
                value={selectedVersionNum} 
                onChange={(e) => {
                  setSelectedVersionNum(e.target.value)
                  setSelectedFile(null)
                }}
              >
                {skill.versions.map(v => (
                  <option key={v.version} value={v.version}>{v.version} {v.version === skill.latestVersion ? '(最新)' : ''}</option>
                ))}
              </select>
              <IconChevronDown size={12} className="select-arrow" />
            </div>
          </div>
          <button className="ha-btn-danger-ghost" onClick={() => setConfirmDeleteVer(true)} title="删除当前版本">
            <IconTrash size={16} />
          </button>
        </div>
      }
    >
      <div className="skill-center-tabs" style={{marginTop: -8}}>
        <div 
          className={`skill-tab ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          基本信息
        </div>
        <div 
          className={`skill-tab ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          Skill 详情
        </div>
      </div>

      {activeTab === 'basic' && (
        <div className="form-card-container" style={{maxWidth: 800, margin: '20px 0', border: 'none', background: 'transparent', boxShadow: 'none'}}>
          <div className="form-content">
            <div className="form-row"><label>ID：</label><div>{skill.id}</div></div>
            <div className="form-row"><label>名称：</label><div>{skill.name}</div></div>
            <div className="form-row"><label>来源类型：</label><div>{skill.sourceType}</div></div>
            <div className="form-row"><label>描述：</label><div>{skill.description || '-'}</div></div>
            <div className="form-row">
              <label>标签：</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {(skill.tags || []).map(t => <span key={t} className="ha-mini-tag">{t}</span>)}
              </div>
            </div>
            <div className="form-row"><label>当前选中版本：</label><div><span className="ha-version-badge">{selectedVersionNum}</span></div></div>
            <div className="form-row"><label>版本创建时间：</label><div>{currentVersionData?.createdAt}</div></div>
            <div className="form-row"><label>Skill 创建时间：</label><div>{skill.createdAt}</div></div>
          </div>
        </div>
      )}

      {activeTab === 'files' && (
        <div className="skill-explorer">
          <div className="skill-explorer-side">
            <div className="explorer-title">文件目录</div>
            <div className="explorer-tree">
              {currentVersionData?.files?.map(file => (
                <FileTreeItem 
                  key={file.name} 
                  node={file} 
                  onSelect={setSelectedFile} 
                  selectedFile={selectedFile}
                  expandedFolders={expandedFolders}
                  toggleFolder={toggleFolder}
                />
              ))}
              {!currentVersionData?.files?.length && <div className="ha-empty-hint">暂无文件</div>}
            </div>
          </div>
          <div className="skill-explorer-main">
            {selectedFile ? (
              <div className="file-preview-wrap">
                <div className="file-preview-header">
                  <IconFileText size={14} style={{ color: '#1677ff', marginRight: 8 }} />
                  <span>{selectedFile.name}</span>
                </div>
                <div className="file-preview-content">
                  <pre><code>{selectedFile.content || '// 此文件无内容'}</code></pre>
                </div>
              </div>
            ) : (
              <div className="file-preview-empty">
                <IconSettings size={48} style={{ color: '#f2f3f5', marginBottom: 16 }} />
                <div style={{ color: '#86909c' }}>请从左侧选择文件查看内容</div>
              </div>
            )}
          </div>
        </div>
      )}

      {confirmDeleteVer && (
        <div className="modal-overlay" onClick={() => setConfirmDeleteVer(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <IconAlertTriangle size={40} style={{ color: '#ff4d4f', margin: '0 auto 16px', display: 'block' }} />
            <div className="modal-message">确定要删除版本 <strong>{selectedVersionNum}</strong> 吗？此操作不可恢复。</div>
            <div style={{display:'flex', gap: 12, justifyContent:'center', marginTop: 24}}>
              <button className="action-btn primary" style={{background:'#ff4d4f', borderColor:'#ff4d4f'}} onClick={handleDeleteVersion}>删除</button>
              <button className="action-btn" onClick={() => setConfirmDeleteVer(false)}>取消</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`ha-toast ha-toast-${toast.type}`}>{toast.msg}</div>}
    </PageLayout>
  )
}
