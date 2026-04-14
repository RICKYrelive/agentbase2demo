import { createContext, useContext, useReducer, useEffect } from 'react';

const CommentContext = createContext(null);
const STORAGE_KEY = 'agentbase_pm_comments';

// ============================================================
// Mock seed data — only used when localStorage is empty
// ============================================================
const seedComments = [
  {
    id: 'cmt-001',
    page: '/overview',
    text: '[演示样例] 首页概览卡片的数据建议增加对比指标（如环比/同比），以便于用户更直观地感知性能趋势。',
    author: 'Ricky',
    type: 'comment',
    status: 'open',
    pinnedPosition: { x: 35, y: 22 },
    linkedSelector: 'div.section-card',
    linkedLabel: '应用状态概览卡片',
    createdAt: '2026-04-14 10:30',
    replies: [
      { author: 'AgentBase', text: '非常有用的建议，我们会在后续版本中进行排期。', createdAt: '2026-04-14 11:10' }
    ]
  }
];

// ============================================================
// Load / save helpers
// ============================================================
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      return {
        ...saved,
        // Always reset transient state
        filterStatus: 'all',
        filterType: 'all',
        isPinMode: false,
        pendingComment: null
      };
    }
  } catch { /* corrupt data, ignore */ }
  return null;
}

function saveState(state) {
  try {
    // Only persist the comments array + currentUser
    const toSave = {
      comments: state.comments,
      currentUser: state.currentUser
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch { /* quota exceeded, ignore */ }
}

// ============================================================
// Initial state
// ============================================================
function getInitialState() {
  const saved = loadState();
  return {
    comments: saved ? saved.comments : seedComments,
    currentUser: saved?.currentUser || '产品经理',
    filterStatus: 'all',
    filterType: 'all',
    isPinMode: false,
    pendingComment: null,
    pendingLocateId: null
  };
}

// ============================================================
// Reducer
// ============================================================
function commentReducer(state, action) {
  switch (action.type) {
    case 'ADD_COMMENT':
      return {
        ...state,
        pendingComment: null,
        comments: [
          ...state.comments,
          {
            id: `cmt-${String(Date.now()).slice(-6)}`,
            page: action.payload.page,
            text: action.payload.text,
            author: state.currentUser,
            type: action.payload.type || 'comment',
            status: 'open',
            pinnedPosition: action.payload.pinnedPosition || null,
            linkedSelector: action.payload.linkedSelector || null,
            linkedLabel: action.payload.linkedLabel || null,
            createdAt: new Date().toLocaleString('zh-CN', {
              year: 'numeric', month: '2-digit', day: '2-digit',
              hour: '2-digit', minute: '2-digit'
            }),
            replies: []
          }
        ]
      };
    case 'DELETE_COMMENT':
      return {
        ...state,
        comments: state.comments.filter(c => c.id !== action.payload)
      };
    case 'RESOLVE_COMMENT':
      return {
        ...state,
        comments: state.comments.map(c =>
          c.id === action.payload ? { ...c, status: 'resolved' } : c
        )
      };
    case 'REOPEN_COMMENT':
      return {
        ...state,
        comments: state.comments.map(c =>
          c.id === action.payload ? { ...c, status: 'open' } : c
        )
      };
    case 'ADD_REPLY':
      return {
        ...state,
        comments: state.comments.map(c =>
          c.id === action.payload.commentId
            ? {
                ...c,
                replies: [
                  ...c.replies,
                  {
                    author: state.currentUser,
                    text: action.payload.text,
                    createdAt: new Date().toLocaleString('zh-CN', {
                      year: 'numeric', month: '2-digit', day: '2-digit',
                      hour: '2-digit', minute: '2-digit'
                    })
                  }
                ]
              }
            : c
        )
      };
    case 'SET_FILTER_STATUS':
      return { ...state, filterStatus: action.payload };
    case 'SET_FILTER_TYPE':
      return { ...state, filterType: action.payload };
    case 'TOGGLE_PIN_MODE':
      return { ...state, isPinMode: !state.isPinMode };
    case 'SET_PIN_MODE':
      return { ...state, isPinMode: action.payload };
    case 'SET_PENDING_COMMENT':
      return { ...state, pendingComment: action.payload };
    case 'CLEAR_PENDING_COMMENT':
      return { ...state, pendingComment: null };
    case 'SET_PENDING_LOCATE':
      return { ...state, pendingLocateId: action.payload };
    case 'CLEAR_PENDING_LOCATE':
      return { ...state, pendingLocateId: null };
    case 'RESET_TO_SEED':
      return { ...getInitialState(), comments: seedComments };
    default:
      return state;
  }
}

// ============================================================
// Provider — auto-persists to localStorage
// ============================================================
export function CommentProvider({ children }) {
  const [state, dispatch] = useReducer(commentReducer, undefined, getInitialState);

  const openCount = state.comments.filter(c => c.status === 'open').length;

  // Persist whenever comments change
  useEffect(() => {
    saveState(state);
  }, [state.comments, state.currentUser]);

  return (
    <CommentContext.Provider value={{ ...state, openCount, dispatch }}>
      {children}
    </CommentContext.Provider>
  );
}

export function useComments() {
  const ctx = useContext(CommentContext);
  if (!ctx) throw new Error('useComments must be used within CommentProvider');
  return ctx;
}
