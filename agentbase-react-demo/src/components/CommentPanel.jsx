import { useState, useEffect } from 'react';
import { useComments } from '../store/commentStore';
import { highlightElement, locateElement } from '../utils/elementSelector';
import './CommentPanel.css';

const TYPE_LABELS = {
  comment: { label: '评论', color: '#4080ff' },
  note: { label: '备注', color: '#ffa502' },
  bug: { label: '问题', color: '#ff4757' },
  feature: { label: '需求', color: '#2ed573' }
};

export default function CommentPanel({ open, onClose, currentPage, navigate }) {
  const { comments, filterStatus, filterType, pendingComment, dispatch } = useComments();
  const [newText, setNewText] = useState('');
  const [newType, setNewType] = useState('comment');
  const [expandedId, setExpandedId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);

  // When pendingComment arrives (from Ctrl+Click), open the form & pre-fill
  useEffect(() => {
    if (pendingComment) {
      setShowNewForm(true);
      setNewText('');
      setNewType('comment');
    }
  }, [pendingComment]);

  const filtered = comments.filter(c => {
    if (filterStatus === 'open' && c.status !== 'open') return false;
    if (filterStatus === 'resolved' && c.status !== 'resolved') return false;
    if (filterType !== 'all' && c.type !== filterType) return false;
    return true;
  });

  const pageFiltered = filtered.filter(c => c.page === currentPage);
  const allFiltered = filtered;

  const [viewMode, setViewMode] = useState('current');

  const displayComments = viewMode === 'current' ? pageFiltered : allFiltered;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    dispatch({
      type: 'ADD_COMMENT',
      payload: {
        page: currentPage,
        text: newText.trim(),
        type: newType,
        linkedSelector: pendingComment?.linkedSelector || null,
        linkedLabel: pendingComment?.linkedLabel || null
      }
    });
    setNewText('');
    setShowNewForm(false);
  };

  const handleReply = (commentId) => {
    if (!replyText.trim()) return;
    dispatch({
      type: 'ADD_REPLY',
      payload: { commentId, text: replyText.trim() }
    });
    setReplyText('');
  };

  const handleLocate = (comment) => {
    if (!comment.linkedSelector) return;

    // Cross-page: navigate first, let CommentLayer handle the highlight after arrival
    if (comment.page !== currentPage && navigate) {
      dispatch({ type: 'SET_PENDING_LOCATE', payload: comment.id });
      // Normalize path for router (remove trailing slashes, handle /overview)
      const navPath = comment.page === '/overview' ? '/' : comment.page;
      navigate(navPath);
      return;
    }

    // Same page: locate directly
    const el = locateElement(comment.linkedSelector);
    if (el) {
      highlightElement(el);
    }
  };

  const getPageName = (page) => {
    const names = {
      '/overview': '概览',
      '/application-portal': '应用门户',
      '/agent-dev': '智能体开发',
      '/agent-runtime': '运行时',
      '/super-agent': '超级代理',
      '/ai-database': 'AI 数据库',
      '/memory': '记忆管理',
      '/ai-model-service': '模型服务',
      '/mcp-service': 'MCP 服务',
      '/skill-center': '技能中心',
      '/api-routing': 'API 路由',
      '/global-observation': '全局观测',
      '/trace': '链路追踪',
      '/cluster-manage': '集群管理',
      '/managed-agent': '托管代理'
    };
    return names[page] || page;
  };

  if (!open) return null;

  return (
    <div className="comment-panel-overlay" onClick={onClose}>
      <div className="comment-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cp-header">
          <div className="cp-header-left">
            <h3 className="cp-title">评论 & 备注</h3>
            <div className="cp-header-subtitle">
              <span className="cp-count">{displayComments.length} 条评论</span>
              <span className="cp-hint">提示：鼠标中键点击页面任一位置可创建评论</span>
            </div>
          </div>
          <button className="cp-close" onClick={onClose}>✕</button>
        </div>

        {/* View mode toggle */}
        <div className="cp-view-toggle">
          <button
            className={`cp-toggle-btn ${viewMode === 'current' ? 'active' : ''}`}
            onClick={() => setViewMode('current')}
          >
            当前页面 ({pageFiltered.length})
          </button>
          <button
            className={`cp-toggle-btn ${viewMode === 'all' ? 'active' : ''}`}
            onClick={() => setViewMode('all')}
          >
            全部 ({allFiltered.length})
          </button>
        </div>

        {/* Filters */}
        <div className="cp-filters">
          <div className="cp-filter-group">
            <select
              className="cp-select"
              value={filterStatus}
              onChange={(e) => dispatch({ type: 'SET_FILTER_STATUS', payload: e.target.value })}
            >
              <option value="all">全部状态</option>
              <option value="open">待处理</option>
              <option value="resolved">已解决</option>
            </select>
            <select
              className="cp-select"
              value={filterType}
              onChange={(e) => dispatch({ type: 'SET_FILTER_TYPE', payload: e.target.value })}
            >
              <option value="all">全部类型</option>
              <option value="comment">评论</option>
              <option value="note">备注</option>
              <option value="bug">问题</option>
              <option value="feature">需求</option>
            </select>
          </div>
          <button
            className="cp-add-btn"
            onClick={() => {
              if (showNewForm) {
                setShowNewForm(false);
                dispatch({ type: 'CLEAR_PENDING_COMMENT' });
              } else {
                dispatch({ type: 'CLEAR_PENDING_COMMENT' });
                setShowNewForm(true);
              }
            }}
          >
            {showNewForm ? '取消' : '+ 新评论'}
          </button>
        </div>

        {/* New comment form */}
        {showNewForm && (
          <form className="cp-new-form" onSubmit={handleSubmit}>
            {/* Ctrl+Click captured element preview */}
            {pendingComment && pendingComment.linkedLabel && (
              <div className="cp-pending-element">
                <span className="cp-pending-icon">🎯</span>
                <div className="cp-pending-info">
                  <span className="cp-pending-label">已关联组件</span>
                  <span className="cp-pending-name">{pendingComment.linkedLabel}</span>
                </div>
                <button
                  type="button"
                  className="cp-pending-locate"
                  onClick={() => {
                    const el = locateElement(pendingComment.linkedSelector);
                    if (el) highlightElement(el);
                  }}
                >
                  📍 定位
                </button>
              </div>
            )}
            <div className="cp-type-selector">
              {Object.entries(TYPE_LABELS).map(([key, { label, color }]) => (
                <button
                  key={key}
                  type="button"
                  className={`cp-type-btn ${newType === key ? 'selected' : ''}`}
                  style={newType === key ? { background: color, borderColor: color } : {}}
                  onClick={() => setNewType(key)}
                >
                  {label}
                </button>
              ))}
            </div>
            <textarea
              className="cp-textarea"
              placeholder={pendingComment?.linkedLabel ? `对「${pendingComment.linkedLabel}」的评论...` : '输入评论内容...'}
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              rows={3}
              autoFocus
            />
            <div className="cp-form-actions">
              <button type="submit" className="cp-submit-btn" disabled={!newText.trim()}>
                提交评论
              </button>
            </div>
          </form>
        )}

        {/* Comment list */}
        <div className="cp-list">
          {displayComments.length === 0 ? (
            <div className="cp-empty">
              <span className="cp-empty-icon">💬</span>
              <p>暂无评论</p>
              <p className="cp-empty-hint">鼠标中键 点击页面组件添加评论</p>
            </div>
          ) : (
            displayComments.map((comment) => {
              const typeInfo = TYPE_LABELS[comment.type] || TYPE_LABELS.comment;
              const isExpanded = expandedId === comment.id;
              return (
                <div
                  key={comment.id}
                  className={`cp-item ${comment.status === 'resolved' ? 'resolved' : ''} ${isExpanded ? 'expanded' : ''}`}
                >
                  <div className="cp-item-header" onClick={() => setExpandedId(isExpanded ? null : comment.id)}>
                    <div className="cp-item-meta">
                      <span
                        className="cp-type-tag"
                        style={{ background: `${typeInfo.color}15`, color: typeInfo.color, borderColor: `${typeInfo.color}30` }}
                      >
                        {typeInfo.label}
                      </span>
                      <span className="cp-item-status">
                        {comment.status === 'open' ? '🟡 待处理' : '🟢 已解决'}
                      </span>
                      {comment.linkedLabel && (
                        <span className="cp-pin-indicator" title={`关联: ${comment.linkedLabel}`}>🔗</span>
                      )}
                    </div>
                    <span className="cp-item-arrow">{isExpanded ? '▲' : '▼'}</span>
                  </div>

                  {viewMode === 'all' && (
                    <div className="cp-item-page">{getPageName(comment.page)}</div>
                  )}

                  {/* Linked element info — click to locate */}
                  {comment.linkedLabel && (
                    <div className="cp-linked-element" onClick={() => handleLocate(comment)}>
                      <span className="cp-linked-icon">🔗</span>
                      <span className="cp-linked-label">{comment.linkedLabel}</span>
                      <span className="cp-linked-action">定位 →</span>
                    </div>
                  )}

                  <p className="cp-item-text">{comment.text}</p>

                  <div className="cp-item-footer">
                    <span className="cp-item-author">{comment.author}</span>
                    <span className="cp-item-time">{comment.createdAt}</span>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="cp-item-detail">
                      {/* Linked element detail */}
                      {comment.linkedLabel && comment.linkedSelector && (
                        <div className="cp-linked-detail">
                          <span className="cp-linked-detail-icon">🔗</span>
                          <div>
                            <span className="cp-linked-detail-label">关联组件：{comment.linkedLabel}</span>
                            <span className="cp-linked-detail-selector">{comment.linkedSelector}</span>
                          </div>
                          <button className="cp-locate-btn" onClick={() => handleLocate(comment)}>
                            📍 定位到组件
                          </button>
                        </div>
                      )}

                      {/* Replies */}
                      {comment.replies.length > 0 && (
                        <div className="cp-replies">
                          {comment.replies.map((reply, i) => (
                            <div key={i} className="cp-reply">
                              <span className="cp-reply-author">{reply.author}</span>
                              <p className="cp-reply-text">{reply.text}</p>
                              <span className="cp-reply-time">{reply.createdAt}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply input */}
                      <div className="cp-reply-form">
                        <input
                          className="cp-reply-input"
                          placeholder="回复..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleReply(comment.id);
                            }
                          }}
                        />
                        <button
                          className="cp-reply-send"
                          onClick={() => handleReply(comment.id)}
                          disabled={!replyText.trim()}
                        >
                          ↵
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="cp-item-actions">
                        {comment.status === 'open' ? (
                          <button
                            className="cp-action-btn resolve"
                            onClick={() => dispatch({ type: 'RESOLVE_COMMENT', payload: comment.id })}
                          >
                            ✓ 标为已解决
                          </button>
                        ) : (
                          <button
                            className="cp-action-btn reopen"
                            onClick={() => dispatch({ type: 'REOPEN_COMMENT', payload: comment.id })}
                          >
                            ↺ 重新打开
                          </button>
                        )}
                        <button
                          className="cp-action-btn delete"
                          onClick={() => dispatch({ type: 'DELETE_COMMENT', payload: comment.id })}
                        >
                          🗑 删除
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
