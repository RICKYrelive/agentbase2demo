import { createContext, useContext, useReducer } from 'react'

const INITIAL_SKILLS = [
  {
    id: 'sk-001',
    name: 'web-search',
    description: '通过搜索引擎获取最新网络资讯信息',
    status: '已发布',
    sourceType: '平台预置',
    versions: ['v1.0.0', 'v1.1.0'],
    latestVersion: 'v1.1.0',
    createdAt: '2026-04-01 10:00:00',
    updatedAt: '2026-04-05 14:00:00',
  },
  {
    id: 'sk-002',
    name: 'doc-parser',
    description: '解析PDF、Word、Markdown等格式的文档内容',
    status: '已发布',
    sourceType: '平台预置',
    versions: ['v2.1.0'],
    latestVersion: 'v2.1.0',
    createdAt: '2026-04-02 09:30:00',
    updatedAt: '2026-04-02 09:30:00',
  },
  {
    id: 'sk-003',
    name: 'sql-executor',
    description: '连接业务数据库执行SQL查询',
    status: '已发布',
    sourceType: '自定义',
    versions: ['v1.0.0', 'v1.0.1'],
    latestVersion: 'v1.0.1',
    createdAt: '2026-04-03 16:20:00',
    updatedAt: '2026-04-06 11:15:00',
  },
  {
    id: 'sk-004',
    name: 'speech-to-text',
    description: '音频转文字，支持多语种',
    status: '草稿',
    sourceType: '自定义',
    versions: ['v0.9.0-beta'],
    latestVersion: 'v0.9.0-beta',
    createdAt: '2026-04-07 08:00:00',
    updatedAt: '2026-04-07 08:00:00',
  }
]

const INITIAL_PACKAGES = [
  {
    id: 'sp-001',
    name: '基础搜索解析包',
    description: '提供基础的网络搜索和文档解析能力，适合信息检索场景',
    status: '运行中',
    tags: ['基础', '检索'],
    project: 'Demo项目',
    skillsCount: 2,
    createdAt: '2026-04-04 12:00:00',
    updatedAt: '2026-04-04 12:00:00',
    skills: [
      { skillId: 'sk-001', skillName: 'web-search', status: '已发布', description: '通过搜索引擎获取最新网络资讯信息', activeVersion: 'v1.1.0' },
      { skillId: 'sk-002', skillName: 'doc-parser', status: '已发布', description: '解析PDF、Word、Markdown等格式的文档内容', activeVersion: 'v2.1.0' }
    ]
  },
  {
    id: 'sp-002',
    name: '数据处理全家桶',
    description: '用于结构化数据提取与SQL执行',
    status: '运行中',
    tags: ['数据', '提效'],
    project: 'Demo项目',
    skillsCount: 1,
    createdAt: '2026-04-06 10:00:00',
    updatedAt: '2026-04-06 11:20:00',
    skills: [
      { skillId: 'sk-003', skillName: 'sql-executor', status: '已发布', description: '连接业务数据库执行SQL查询', activeVersion: 'v1.0.1' }
    ]
  }
]

function getFormattedTime() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19)
}

let skillIdAcc = 10
let packageIdAcc = 10

function appReducer(state, action) {
  switch (action.type) {
    case 'CREATE_PACKAGE': {
      const newPkg = {
        ...action.payload,
        id: `sp-${String(packageIdAcc++).padStart(3, '0')}`,
        status: action.payload.status || '运行中',
        skillsCount: 0,
        skills: [],
        createdAt: getFormattedTime(),
        updatedAt: getFormattedTime()
      }
      return { ...state, packages: [newPkg, ...state.packages] }
    }
    case 'DELETE_PACKAGE': {
      return { ...state, packages: state.packages.filter(p => p.id !== action.id) }
    }
    case 'CREATE_SKILL': {
      const newSkill = {
        ...action.payload,
        id: `sk-${String(skillIdAcc++).padStart(3, '0')}`,
        status: '已发布', // Default for demo
        createdAt: getFormattedTime(),
        updatedAt: getFormattedTime()
      }
      return { ...state, skills: [newSkill, ...state.skills] }
    }
    case 'ADD_SKILL_TO_PACKAGE': {
      return {
        ...state,
        packages: state.packages.map(p => {
          if (p.id !== action.packageId) return p
          const exists = p.skills.find(s => s.skillId === action.skill.id)
          if (exists) return p
          
          const newPkgSkill = {
            skillId: action.skill.id,
            skillName: action.skill.name,
            status: action.skill.status,
            description: action.skill.description,
            activeVersion: action.skill.latestVersion
          }
          return {
            ...p,
            skillsCount: p.skillsCount + 1,
            skills: [newPkgSkill, ...p.skills],
            updatedAt: getFormattedTime()
          }
        })
      }
    }
    case 'REMOVE_SKILL_FROM_PACKAGE': {
      return {
        ...state,
        packages: state.packages.map(p => {
          if (p.id !== action.packageId) return p
          return {
            ...p,
            skills: p.skills.filter(s => s.skillId !== action.skillId),
            skillsCount: p.skillsCount - 1,
            updatedAt: getFormattedTime()
          }
        })
      }
    }
    case 'UPDATE_SKILL_VERSION_IN_PACKAGE': {
      return {
        ...state,
        packages: state.packages.map(p => {
          if (p.id !== action.packageId) return p
          return {
            ...p,
            skills: p.skills.map(s => s.skillId === action.skillId ? { ...s, activeVersion: action.version } : s),
            updatedAt: getFormattedTime()
          }
        })
      }
    }
    default:
      return state
  }
}

const SkillContext = createContext(null)

export function SkillProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, {
    packages: INITIAL_PACKAGES,
    skills: INITIAL_SKILLS
  })

  return (
    <SkillContext.Provider value={{
      packages: state.packages,
      skills: state.skills,
      dispatch
    }}>
      {children}
    </SkillContext.Provider>
  )
}

export function useSkills() {
  const ctx = useContext(SkillContext)
  if (!ctx) throw new Error('useSkills must be used within SkillProvider')
  return ctx
}
