import { useState } from 'react'
import PageLayout, { GuideCards } from '../components/PageLayout'
import SkillPackageList from './SkillPackageList'
import SkillList from './SkillList'
import './SkillCenter.css'

const guideCards = [
  { title: '01 创建 Skill', desc: '将单个 API 或脚本等基础能力封装成可执行的 Skill。' },
  { title: '02 创建Skill 集并添加 Skills', desc: '根据业务场景将多个 Skill 组合到同一个Skill 集中进行统一管理和分发。' },
  { title: '03 在智能体中集成Skill 集', desc: '在 Agent 配置页选择Skill 集，为智能体赋予相应的工具调用能力。' },
]

export default function SkillCenter() {
  const [activeTab, setActiveTab] = useState('packages') // 'packages' | 'skills'
  const [showGuide, setShowGuide] = useState(true)

  return (
    <PageLayout
      title="Skills 空间"
      rightAction={
        <button className="action-btn" onClick={() => setShowGuide(!showGuide)}>
          {showGuide ? '⊙ 收起指引' : '⊕ 展开指引'}
        </button>
      }
    >
      {/* 描述文案 */}
      <div className="skill-center-desc">
        Skill 中心是 Agent 的可复用能力资产入口，支持通过Skill 集组织和管理 Skills，方便 Agent 集成调用。
      </div>

      {showGuide && <GuideCards cards={guideCards} />}

      <div className="skill-center-tabs">
        <div 
          className={`skill-tab ${activeTab === 'packages' ? 'active' : ''}`}
          onClick={() => setActiveTab('packages')}
        >
          Skill 集
        </div>
        <div 
          className={`skill-tab ${activeTab === 'skills' ? 'active' : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          Skills
        </div>
      </div>

      <div className="skill-center-content">
        {activeTab === 'packages' ? <SkillPackageList /> : <SkillList />}
      </div>
    </PageLayout>
  )
}
