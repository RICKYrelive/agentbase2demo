import './AlertModal.css'

export default function AlertModal({ onClose, message = '非demo演示区域' }) {
  const isDeprecated = message === '该部分已废弃';
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-icon-wrap">
          {isDeprecated ? (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--notion-warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          ) : (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--notion-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          )}
        </div>
        <div className="modal-message notion-body-medium">{message}</div>
        <button className="alert-modal-btn" onClick={onClose}>确定</button>
      </div>
    </div>
  )
}
