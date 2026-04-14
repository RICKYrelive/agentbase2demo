import { useState, useRef, useEffect } from 'react';
import { useComments } from '../store/commentStore';
import './FloatingCommentBall.css';

const IconMessage = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)

const IconPin = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
  </svg>
)

const IconList = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
)

const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

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
        <div className="ball-icon-wrap">
          {isPinMode ? <IconPin /> : <IconMessage />}
        </div>
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
              <span className="menu-icon">{isPinMode ? <IconX /> : <IconPin />}</span>
              {isPinMode ? '退出标注模式' : '进入标注模式'}
            </button>
            <button className="ball-menu-item" onClick={() => { onTogglePanel(); setMenuOpen(false); }}>
              <span className="menu-icon"><IconList /></span>
              查看所有评论
            </button>
            <button className="ball-menu-item" onClick={() => { onTogglePanel(); setMenuOpen(false); }}>
              <span className="menu-icon"><IconPlus /></span>
              新建评论
            </button>
          </div>
        </>
      )}
    </>
  );
}
