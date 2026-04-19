import { createContext, useContext, useReducer } from 'react'

const INITIAL_SKILLS = [
  {
    id: 'sk-001',
    name: 'web-search',
    description: '通过搜索引擎获取最新网络资讯信息',
    status: '可用',
    sourceType: '平台预置',
    tags: ['基础', '互联网', '搜索'],
    versions: [
      { 
        version: 'v1', 
        createdAt: '2026-04-01 10:00:00',
        files: [
          { name: 'index.js', type: 'file', content: '// 基础搜索逻辑\nexport function search(query) {\n  return `Results for ${query}`;\n}' },
          { name: 'manifest.json', type: 'file', content: '{\n  "name": "web-search",\n  "version": "1.0.0"\n}' }
        ]
      },
      { 
        version: 'v2', 
        createdAt: '2026-04-05 14:00:00',
        files: [
          { name: 'index.js', type: 'file', content: '// 优化后的搜索逻辑\nexport async function search(query) {\n  console.log("Searching...");\n  return fetch(`/api/search?q=${query}`);\n}' },
          { name: 'utils.js', type: 'file', content: 'export const cleanQuery = (q) => q.trim();' },
          { name: 'manifest.json', type: 'file', content: '{\n  "name": "web-search",\n  "version": "1.1.0"\n}' }
        ]
      }
    ],
    latestVersion: 'v2',
    createdAt: '2026-04-01 10:00:00',
    updatedAt: '2026-04-05 14:00:00',
  },
  {
    id: 'sk-002',
    name: 'doc-parser',
    description: '解析PDF、Word、Markdown等格式的文档内容',
    status: '可用',
    sourceType: '平台预置',
    tags: ['基础', '办公', '文档'],
    versions: [
      { 
        version: 'v1', 
        createdAt: '2026-04-02 09:30:00',
        files: [
          { name: 'parser.py', type: 'file', content: 'def parse(doc):\n    return f"Parsed {doc}"' }
        ]
      }
    ],
    latestVersion: 'v1',
    createdAt: '2026-04-02 09:30:00',
    updatedAt: '2026-04-02 09:30:00',
  },
  {
    id: 'sk-003',
    name: 'sql-executor',
    description: '连接业务数据库执行SQL查询',
    status: '可用',
    sourceType: '自定义',
    tags: ['开发', '数据库', '数据'],
    versions: [
      { 
        version: 'v1', 
        createdAt: '2026-04-03 16:20:00',
        files: [
          { name: 'db.sql', type: 'file', content: 'SELECT * FROM users;' }
        ]
      }
    ],
    latestVersion: 'v1',
    createdAt: '2026-04-03 16:20:00',
    updatedAt: '2026-04-06 11:15:00',
  },
  {
    id: 'sk-004',
    name: 'speech-to-text',
    description: '音频转文字，支持多语种',
    status: '可用',
    sourceType: '自定义',
    tags: ['AI', '语音', '效率'],
    versions: [
      { 
        version: 'v1', 
        createdAt: '2026-04-07 08:00:00',
        files: [
          { name: 'model.bin', type: 'file', content: 'BINARY_DATA' },
          { name: 'worker.js', type: 'file', content: 'onmessage = (e) => transcribe(e.data)' }
        ]
      }
    ],
    latestVersion: 'v1',
    createdAt: '2026-04-07 08:00:00',
    updatedAt: '2026-04-07 08:00:00',
  }
]

const INITIAL_PACKAGES = [
  {
    id: 'sp-001',
    name: '基础搜索解析包',
    description: '提供基础的网络搜索和文档解析能力，适合信息检索场景',
    status: '可用',
    tags: ['基础', '检索'],
    project: 'Demo项目',
    skillsCount: 2,
    createdAt: '2026-04-04 12:00:00',
    updatedAt: '2026-04-04 12:00:00',
    skills: [
      { skillId: 'sk-001', skillName: 'web-search', status: '可用', description: '通过搜索引擎获取最新网络资讯信息', activeVersion: 'v2' },
      { skillId: 'sk-002', skillName: 'doc-parser', status: '可用', description: '解析PDF、Word、Markdown等格式的文档内容', activeVersion: 'v1' }
    ]
  },
  {
    id: 'sp-002',
    name: '数据处理全家桶',
    description: '用于结构化数据提取与SQL执行',
    status: '可用',
    tags: ['数据', '提效'],
    project: 'Demo项目',
    skillsCount: 1,
    createdAt: '2026-04-06 10:00:00',
    updatedAt: '2026-04-06 11:20:00',
    skills: [
      { skillId: 'sk-003', skillName: 'sql-executor', status: '可用', description: '连接业务数据库执行SQL查询', activeVersion: 'v1' }
    ]
  }
]

function getFormattedTime() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19)
}

function getNextVersion(versions) {
  if (!versions || versions.length === 0) return 'v1'
  const max = Math.max(...versions.map(v => parseInt(v.version.slice(1))))
  return `v${max + 1}`
}

let skillIdAcc = 10
let packageIdAcc = 10

function appReducer(state, action) {
  switch (action.type) {
    case 'CREATE_PACKAGE': {
      const newPkg = {
        ...action.payload,
        id: `sp-${String(packageIdAcc++).padStart(3, '0')}`,
        status: action.payload.status || '可用',
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
      const v1 = {
        version: 'v1',
        createdAt: getFormattedTime(),
        files: [
          { name: 'main.js', type: 'file', content: '// Initial code for ' + action.payload.name }
        ]
      }
      const newSkill = {
        ...action.payload,
        id: `sk-${String(skillIdAcc++).padStart(3, '0')}`,
        status: '可用',
        versions: [v1],
        latestVersion: 'v1',
        createdAt: getFormattedTime(),
        updatedAt: getFormattedTime()
      }
      return { ...state, skills: [newSkill, ...state.skills] }
    }
    case 'UPDATE_SKILL': {
      return {
        ...state,
        skills: state.skills.map(s => {
          const targetId = action.id || action.skillId
          if (s.id !== targetId) return s
          
          const nextV = getNextVersion(s.versions)
          let newFiles = [...(s.versions[s.versions.length - 1]?.files || [])]
          
          // Apply new content if provided (simplification for demo)
          if (action.payload && action.payload.summary) {
            const mainFile = newFiles.find(f => f.name === 'main.js' || f.name === 'index.js' || f.name === 'index.ts')
            if (mainFile) {
              mainFile.content = action.payload.summary
            } else {
              newFiles.push({ name: 'main.js', type: 'file', content: action.payload.summary })
            }
          }

          const newVersion = {
            version: nextV,
            createdAt: getFormattedTime(),
            files: newFiles
          }

          return {
            ...s,
            description: action.payload?.description || s.description,
            versions: [...s.versions, newVersion],
            latestVersion: nextV,
            updatedAt: getFormattedTime()
          }
        })
      }
    }
    case 'DELETE_SKILL_VERSION': {
      return {
        ...state,
        skills: state.skills.map(s => {
          if (s.id !== action.skillId) return s
          const newVersions = s.versions.filter(v => v.version !== action.version)
          if (newVersions.length === 0) return s // Keep at least one version or handle skill deletion
          const newLatest = newVersions[newVersions.length - 1].version
          return {
            ...s,
            versions: newVersions,
            latestVersion: newLatest,
            updatedAt: getFormattedTime()
          }
        })
      }
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
            status: '可用',
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
