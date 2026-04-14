import PageLayout, { DataToolbar, DataTable } from '../components/PageLayout'
import { IconCheck, IconSearch, IconRotateCcw, IconPlus } from '../components/Icons'

const columns = [
  { key: 'name', label: '名称' },
  { key: 'desc', label: '描述' },
  { key: 'status', label: '状态' },
  { key: 'address', label: '连接地址' },
  { key: 'blockSC', label: '块存储SC' },
  { key: 'objectSC', label: '对象存储SC' },
  { key: 'testTime', label: '最新一次连通性测试时间' },
  { key: 'addTime', label: '添加时间' },
]

const data = [
  { name: 'agent1-az1', desc: 'agent1-az1可用区集群', status: <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#52c41a' }}><IconCheck size={14} /> 已连接</span>, address: 'https://10.103.xxx.xxx:6443', blockSC: 'csi-disk', objectSC: 'csi-obs', testTime: '2025-03-28 15:30', addTime: '2025-03-25 10:00' },
  { name: 'agent2-az1', desc: 'agent2-az1可用区集群', status: <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#52c41a' }}><IconCheck size={14} /> 已连接</span>, address: 'https://10.103.xxx.xxx:6443', blockSC: 'csi-disk', objectSC: 'csi-obs', testTime: '2025-03-28 15:30', addTime: '2025-03-25 10:00' },
]

export default function ClusterManage({ onAlert }) {
  return (
    <PageLayout title="集群管理">
      <DataToolbar
        buttons={
          <button className="action-btn primary" onClick={onAlert} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconPlus size={16} /> 添加</button>
        }
      >
        <div className="search-input">
          <span className="search-icon"><IconSearch size={14} /></span>
          <input placeholder="集群名称" />
        </div>
        <button className="refresh-btn-sm" onClick={() => {}}><IconRotateCcw size={14} /></button>
      </DataToolbar>
      <DataTable columns={columns} data={data} />
    </PageLayout>
  )
}
