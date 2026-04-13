import { useState, useEffect } from 'react';
import { useComments } from '../store/commentStore';
import { getElementSelector, getElementLabel, highlightElement, locateElement } from '../utils/elementSelector';
import './CommentPin.css';

export default function CommentPin({ currentPage, onCommentClick }) {
  const { comments, isPinMode, dispatch } = useComments();
  const [hoveredPin, setHoveredPin] = useState(null);

  // Pin mode click handler — capture element + position
  useEffect(() => {
    if (!isPinMode) return;

    const handlePinClick = (e) => {
      if (e.target.closest('.floating-comment-ball, .comment-panel-overlay, .comment-pin, .pin-mode-hint, .ball-menu')) return;

      e.preventDefault();
      e.stopPropagation();

      const rect = document.body.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // Capture element info
      const target = e.target;
      const linkedSelector = getElementSelector(target);
      const linkedLabel = getElementLabel(target);

      dispatch({
        type: 'ADD_COMMENT',
        payload: {
          page: currentPage,
          text: `📍 ${linkedLabel ? `关于「${linkedLabel}」` : '页面标注'}（请编辑内容）`,
          type: 'comment',
          pinnedPosition: { x, y },
          linkedSelector,
          linkedLabel
        }
      });
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        dispatch({ type: 'SET_PIN_MODE', payload: false });
      }
    };

    document.addEventListener('click', handlePinClick, true);
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('click', handlePinClick, true);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isPinMode, currentPage, dispatch]);

  // Highlight linked elements for current-page comments
  const pinnedComments = comments.filter(
    c => c.page === currentPage && c.pinnedPosition
  );

  // Locate element for a comment
  const handleLocate = (comment) => {
    if (!comment.linkedSelector) return;
    const el = locateElement(comment.linkedSelector);
    if (el) highlightElement(el);
  };

  return (
    <div className="comment-pins-container">
      {pinnedComments.map((comment, index) => (
        <div
          key={comment.id}
          className={`comment-pin ${comment.status === 'resolved' ? 'resolved' : ''} ${hoveredPin === comment.id ? 'hovered' : ''}`}
          style={{
            left: `${comment.pinnedPosition.x}%`,
            top: `${comment.pinnedPosition.y}%`
          }}
          onMouseEnter={() => setHoveredPin(comment.id)}
          onMouseLeave={() => setHoveredPin(null)}
          onClick={() => {
            handleLocate(comment);
            onCommentClick && onCommentClick(comment.id);
          }}
        >
          <span className="pin-number">{index + 1}</span>
          {hoveredPin === comment.id && (
            <div className="pin-tooltip">
              {comment.linkedLabel && (
                <span className="pin-tooltip-linked">🔗 {comment.linkedLabel}</span>
              )}
              <p className="pin-tooltip-text">{comment.text}</p>
              <span className="pin-tooltip-author">{comment.author} · {comment.createdAt.split(' ')[1] || ''}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
