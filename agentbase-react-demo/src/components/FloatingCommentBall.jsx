import { useState, useRef, useEffect } from 'react';
import { useComments } from '../store/commentStore';
import './FloatingCommentBall.css';

export default function FloatingCommentBall({ onTogglePanel, panelOpen }) {
  const { openCount, isPinMode, dispatch } = useComments();
  const ballRef = useRef(null);
  const [pos, setPos] = useState({ x: window.innerWidth - 80, y: window.innerHeight / 2 });
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMouseDown = (e) => {
    dragging.current = false;
    offset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    };

    const handleMouseMove = (e) => {
      dragging.current = true;
      setPos({
        x: Math.min(Math.max(0, e.clientX - offset.current.x), window.innerWidth - 56),
        y: Math.min(Math.max(0, e.clientY - offset.current.y), window.innerHeight - 56)
      });
    };

    const handleMouseUp = (e) => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (!dragging.current) {
        handleBallClick();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleBallClick = () => {
    if (menuOpen) {
      setMenuOpen(false);
      return;
    }
    onTogglePanel();
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setMenuOpen(!menuOpen);
  };

  const togglePinMode = () => {
    dispatch({ type: 'TOGGLE_PIN_MODE' });
    setMenuOpen(false);
  };

  useEffect(() => {
    if (!panelOpen) setMenuOpen(false);
  }, [panelOpen]);

  // Toggle body class for pin mode cursor
  useEffect(() => {
    if (isPinMode) {
      document.body.classList.add('pin-mode-active');
    } else {
      document.body.classList.remove('pin-mode-active');
    }
    return () => document.body.classList.remove('pin-mode-active');
  }, [isPinMode]);

  return (
    <>
      {isPinMode && (
        <div className="pin-mode-hint">
          📍 点击页面任意位置放置评论标记 · 按 ESC 退出
        </div>
      )}
      <div
        ref={ballRef}
        className={`floating-comment-ball ${isPinMode ? 'pin-mode' : ''} ${panelOpen ? 'active' : ''}`}
        style={{ left: pos.x, top: pos.y }}
        onMouseDown={handleMouseDown}
        onContextMenu={handleContextMenu}
        title="评论 & 备注"
      >
        <span className="ball-icon">{isPinMode ? '📍' : '💬'}</span>
        {openCount > 0 && (
          <span className="ball-badge">{openCount}</span>
        )}
      </div>

      {menuOpen && (
        <>
          <div className="ball-menu-overlay" onClick={() => setMenuOpen(false)} />
          <div
            className="ball-menu"
            style={{
              left: Math.min(pos.x - 100, window.innerWidth - 180),
              top: pos.y - 130
            }}
          >
            <button className="ball-menu-item" onClick={togglePinMode}>
              <span className="menu-icon">{isPinMode ? '✖' : '📍'}</span>
              {isPinMode ? '退出标注模式' : '进入标注模式'}
            </button>
            <button className="ball-menu-item" onClick={() => { onTogglePanel(); setMenuOpen(false); }}>
              <span className="menu-icon">📋</span>
              查看所有评论
            </button>
            <button className="ball-menu-item" onClick={() => { onTogglePanel(); setMenuOpen(false); }}>
              <span className="menu-icon">➕</span>
              新建评论
            </button>
          </div>
        </>
      )}
    </>
  );
}
