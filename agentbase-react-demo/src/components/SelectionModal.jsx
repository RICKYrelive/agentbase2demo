import { useState, useEffect } from 'react'
import './SelectionModal.css'

export default function SelectionModal({ 
  title = '选择', 
  isVisible, 
  onClose, 
  onConfirm, 
  items = [], 
  columns = [{ key: 'name', label: '名称' }],
  initialSelection = [] 
}) {
  const [selectedIds, setSelectedIds] = useState(initialSelection)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (isVisible) {
      setSelectedIds(initialSelection)
    }
  }, [isVisible, initialSelection])

  if (!isVisible) return null

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleItem = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleConfirm = () => {
    onConfirm(selectedIds)
    onClose()
  }

  const selectedList = items.filter(item => selectedIds.includes(item.id))

  return (
    <div className="selection-modal-overlay" onClick={onClose}>
      <div className="selection-modal" onClick={e => e.stopPropagation()}>
        <div className="selection-modal-header">
          <h3>{title}</h3>
          <button className="selection-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="selection-modal-body">
          {/* Left Pane */}
          <div className="selection-pane-left">
            <div className="selection-pane-toolbar">
              <span className="selection-pane-title">待选</span>
              <button className="selection-btn-add">+ 创建</button>
              <div className="selection-search-wrap">
                <input 
                  placeholder="搜索名称" 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <span className="search-icon">🔍</span>
              </div>
              <button className="selection-btn-icon">↻</button>
            </div>
            
            <div className="selection-table-wrap">
              <table className="selection-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>
                      <input 
                        type="checkbox" 
                        checked={selectedIds.length === items.length && items.length > 0}
                        onChange={() => {
                          if (selectedIds.length === items.length) setSelectedIds([])
                          else setSelectedIds(items.map(i => i.id))
                        }}
                      />
                    </th>
                    {columns.map(col => (
                      <th key={col.key}>{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(item => (
                    <tr key={item.id} onClick={() => toggleItem(item.id)} style={{ cursor: 'pointer' }}>
                      <td>
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(item.id)}
                          onChange={() => {}} // Toggle handled by row click
                        />
                      </td>
                      {columns.map(col => (
                        <td key={col.key}>{item[col.key]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Pane */}
          <div className="selection-pane-right">
            <div className="selection-right-header">
              <span className="selection-count">已选 ({selectedIds.length})</span>
              <span className="selection-clear" onClick={() => setSelectedIds([])}>🗑️</span>
            </div>
            <ul className="selected-items-list">
              {selectedList.map(item => (
                <li key={item.id} className="selected-item-row">
                  <span className="selected-item-name">{item.name}</span>
                  <span className="selected-item-remove" onClick={() => toggleItem(item.id)}>×</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="selection-modal-footer">
          <button className="modal-btn modal-btn-primary" onClick={handleConfirm}>确定</button>
          <button className="modal-btn" onClick={onClose}>取消</button>
        </div>
      </div>
    </div>
  )
}
