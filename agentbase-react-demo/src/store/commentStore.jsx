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
    text: '首页概览卡片的数据需要更直观，建议加上同比环比指标',
    author: '张经理',
    type: 'comment',
    status: 'open',
    pinnedPosition: { x: 35, y: 22 },
    linkedSelector: 'div.section-card',
    linkedLabel: '应用状态概览卡片',
    createdAt: '2026-04-08 14:30',
    replies: [
      { author: '李开发', text: '好的，下个迭代加上', createdAt: '2026-04-08 15:10' }
    ]
  },
  {
    id: 'cmt-002',
    page: '/super-agent',
    text: '超级代理列表页缺少批量操作功能，需要加上全选和批量删除',
    author: '王总监',
    type: 'feature',
    status: 'open',
    pinnedPosition: null,
    linkedSelector: null,
    linkedLabel: null,
    createdAt: '2026-04-08 16:00',
    replies: []
  },
  {
    id: 'cmt-003',
    page: '/overview',
    text: 'Token 消耗图表的 Y 轴刻度不太合理，建议自适应',
    author: '张经理',
    type: 'bug',
    status: 'resolved',
    pinnedPosition: null,
    linkedSelector: 'div.token-section',
    linkedLabel: 'Token 消耗统计区域',
    createdAt: '2026-04-07 10:20',
    replies: [
      { author: '陈前端', text: '已修复，Y轴已改为自适应', createdAt: '2026-04-07 11:30' }
    ]
  },
  {
    id: 'cmt-004',
    page: '/overview',
    text: 'K8s 集群卡片需要增加节点详情展开功能',
    author: '赵PM',
    type: 'comment',
    status: 'open',
    pinnedPosition: null,
    linkedSelector: 'div.k8s-section',
    linkedLabel: 'K8s 集群状态区域',
    createdAt: '2026-04-09 09:15',
    replies: []
  },
  {
    id: 'cmt-005',
    page: '/managed-agent',
    text: '托管代理创建流程步骤太多，建议简化为3步以内',
    author: '王总监',
    type: 'note',
    status: 'open',
    pinnedPosition: null,
    linkedSelector: null,
    linkedLabel: null,
    createdAt: '2026-04-09 10:00',
    replies: []
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
