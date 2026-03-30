import './PageLayout.css'

export default function PageLayout({ title, rightAction, children }) {
  return (
    <div className="page-layout">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title-bar"></div>
          <h1 className="page-title">{title}</h1>
        </div>
        {rightAction && <div className="page-header-right">{rightAction}</div>}
      </div>
      <div className="page-body">
        {children}
      </div>
    </div>
  )
}

export function GuideCards({ cards }) {
  return (
    <div className="guide-cards">
      {cards.map((card, i) => (
        <div key={i} className="guide-card">
          <div className="guide-card-header">
            <h3 className="guide-card-title">{card.title}</h3>
            <span className="guide-card-number">{String(i + 1).padStart(2, '0')}</span>
          </div>
          <p className="guide-card-desc">{card.desc}</p>
          {card.link && (
            <span className="guide-card-link" onClick={card.onLinkClick}>
              {card.link} →
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

export function DataToolbar({ buttons, filters, children }) {
  return (
    <div className="data-toolbar">
      <div className="data-toolbar-left">
        {buttons}
      </div>
      <div className="data-toolbar-right">
        {filters}
        {children}
      </div>
    </div>
  )
}

export function DataTable({ columns, data = [], emptyText = '暂无数据' }) {
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i}>{col.label} {col.sortable && <span className="sort-icon">↕</span>}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="data-table-empty">
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <span>{emptyText}</span>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={i}>
                {columns.map((col, j) => (
                  <td key={j}>{row[col.key]}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="data-pagination">
        <span>共 {data.length} 条</span>
        <span>每页</span>
        <select className="pagination-select"><option>50</option></select>
        <span>条</span>
        <span className="pagination-nav">前往</span>
        <input className="pagination-input" defaultValue="1" />
        <span>页</span>
      </div>
    </div>
  )
}

export function AlertButton({ children, onClick }) {
  return (
    <button className="action-btn primary" onClick={onClick}>
      {children}
    </button>
  )
}
