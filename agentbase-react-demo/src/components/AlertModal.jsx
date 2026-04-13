import './AlertModal.css'

export default function AlertModal({ onClose, message = '非demo演示区域' }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-icon">ℹ️</div>
        <div className="modal-message">{message}</div>
        <button className="modal-btn" onClick={onClose}>确定</button>
      </div>
    </div>
  )
}
