/**
 * Generate a reliable CSS selector for a DOM element.
 * Walks up from target, finds the nearest "landmark" (element with a unique class),
 * then builds a short path from landmark to target.
 */
export function getElementSelector(el) {
  if (!el || el === document.body || el === document.documentElement) return null;
  if (el.id) return `#${CSS.escape(el.id)}`;

  const scope = document.querySelector('.app-main') || document.body;
  let landmark = null;
  let landmarkSel = null;

  let cur = el;
  while (cur && cur !== document.body && cur !== document.documentElement) {
    const sel = buildSelfSelector(cur);
    if (sel && scope.querySelectorAll(sel).length === 1) {
      landmark = cur;
      landmarkSel = sel;
      break;
    }
    cur = cur.parentElement;
  }

  if (landmark && landmark !== el) {
    const path = pathBetween(landmark, el);
    return landmarkSel + path;
  }

  return buildFullPath(el);
}

function buildSelfSelector(el) {
  let sel = el.tagName.toLowerCase();
  if (el.className && typeof el.className === 'string') {
    const classes = el.className.trim().split(/\s+/).filter(c => c && !c.startsWith('_'));
    if (classes.length) {
      sel += '.' + classes.slice(0, 2).map(c => CSS.escape(c)).join('.');
    }
  }
  return sel;
}

function pathBetween(ancestor, descendant) {
  const parts = [];
  let cur = descendant;
  while (cur && cur !== ancestor) {
    const parent = cur.parentElement;
    if (!parent) break;
    let sel = cur.tagName.toLowerCase();
    const sameTagSiblings = Array.from(parent.children).filter(s => s.tagName === cur.tagName);
    if (sameTagSiblings.length > 1) {
      const idx = sameTagSiblings.indexOf(cur) + 1;
      sel += `:nth-of-type(${idx})`;
    }
    parts.unshift(sel);
    cur = parent;
  }
  return parts.length ? ' > ' + parts.join(' > ') : '';
}

function buildFullPath(el) {
  const parts = [];
  let cur = el;
  while (cur && cur !== document.body && cur !== document.documentElement) {
    const sel = buildSelfSelector(cur);
    const parent = cur.parentElement;
    if (parent) {
      const sameTagSiblings = Array.from(parent.children).filter(s => s.tagName === cur.tagName);
      if (sameTagSiblings.length > 1) {
        const idx = sameTagSiblings.indexOf(cur) + 1;
        parts.unshift(sel + `:nth-of-type(${idx})`);
      } else {
        parts.unshift(sel);
      }
    }
    cur = parent;
    if (parts.length >= 5) break;
  }
  return parts.join(' > ');
}

/**
 * Get a human-readable label for an element.
 */
export function getElementLabel(el) {
  if (!el) return null;

  if (el.getAttribute('aria-label')) return el.getAttribute('aria-label');
  if (el.title) return el.title;
  if (el.placeholder) return el.placeholder;

  if (/^H[1-6]$/.test(el.tagName)) {
    return el.textContent?.trim().slice(0, 40) || null;
  }

  if (el.tagName === 'BUTTON' || el.closest('button')) {
    const btn = el.tagName === 'BUTTON' ? el : el.closest('button');
    return btn.textContent?.trim().slice(0, 30) || '按钮';
  }

  if (el.tagName === 'TD' || el.tagName === 'TH') {
    return el.textContent?.trim().slice(0, 30) || '表格单元格';
  }

  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
    return el.placeholder || '输入框';
  }

  if (el.className && typeof el.className === 'string') {
    const cls = el.className.trim().split(/\s+/)[0];
    if (cls) {
      const text = el.textContent?.trim();
      if (text && text.length < 50) return `${text} (.${cls})`;
      return `.${cls}`;
    }
  }

  const text = el.textContent?.trim();
  if (text && text.length < 40) return text;

  return `<${el.tagName.toLowerCase()}>`;
}

// ============================================================
// Highlight overlay — fixed positioned, always visible
// ============================================================

let highlightOverlay = null;
let highlightTimer = null;
let highlightRAF = null;

/**
 * Find an element by selector, with fallback strategies.
 */
export function locateElement(selector) {
  if (!selector) return null;

  // Strategy 1: direct match
  try {
    const el = document.querySelector(selector);
    if (el) return el;
  } catch { /* invalid selector */ }

  // Strategy 2: strip child combinator path, try just the first part
  const firstPart = selector.split(' > ')[0];
  try {
    const el = document.querySelector(firstPart);
    if (el) return el;
  } catch { /* ignore */ }

  // Strategy 3: strip :nth-of-type, try class-only
  const cleanSelector = selector.replace(/:nth-of-type\(\d+\)/g, '');
  try {
    const el = document.querySelector(cleanSelector);
    if (el) return el;
  } catch { /* ignore */ }

  return null;
}

/**
 * Highlight an element with a positioned overlay box.
 * Uses position: fixed so it always works regardless of scroll containers.
 */
export function highlightElement(el) {
  if (!el) return;

  removeHighlight();

  // Find the scroll container — could be .app-main or window
  const scrollParent = getScrollParent(el);

  // Scroll the element into view
  if (scrollParent === document.documentElement) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else {
    // Scroll within the container
    const containerRect = scrollParent.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const scrollTarget = scrollParent.scrollTop + (elRect.top - containerRect.top) - containerRect.height / 2 + elRect.height / 2;
    scrollParent.scrollTo({ top: Math.max(0, scrollTarget), behavior: 'smooth' });
  }

  // Wait for scroll to finish, then show overlay
  setTimeout(() => {
    createOverlay(el);
  }, 450);
}

function createOverlay(el) {
  const overlay = document.createElement('div');
  overlay.className = 'pm-highlight-overlay';
  overlay.innerHTML = '<div class="pm-highlight-box"></div>';
  document.body.appendChild(overlay);
  highlightOverlay = overlay;

  // Position immediately
  updateOverlayPosition(el);

  // Pulse animation
  requestAnimationFrame(() => {
    const box = overlay.querySelector('.pm-highlight-box');
    if (box) box.classList.add('pm-pulse');
  });

  // Keep repositioning while visible (handles layout shifts)
  const trackPosition = () => {
    updateOverlayPosition(el);
    highlightRAF = requestAnimationFrame(trackPosition);
  };
  highlightRAF = requestAnimationFrame(trackPosition);

  // Auto-remove after 3s
  highlightTimer = setTimeout(removeHighlight, 3000);
}

function updateOverlayPosition(el) {
  if (!highlightOverlay) return;
  const box = highlightOverlay.querySelector('.pm-highlight-box');
  if (!box) return;

  const rect = el.getBoundingClientRect();
  box.style.position = 'fixed';
  box.style.top = (rect.top - 4) + 'px';
  box.style.left = (rect.left - 4) + 'px';
  box.style.width = (rect.width + 8) + 'px';
  box.style.height = (rect.height + 8) + 'px';
}

function getScrollParent(el) {
  let parent = el.parentElement;
  while (parent) {
    const { overflow, overflowY } = getComputedStyle(parent);
    if (/(auto|scroll)/.test(overflow + overflowY)) return parent;
    parent = parent.parentElement;
  }
  return document.documentElement;
}

export function removeHighlight() {
  if (highlightTimer) { clearTimeout(highlightTimer); highlightTimer = null; }
  if (highlightRAF) { cancelAnimationFrame(highlightRAF); highlightRAF = null; }
  if (highlightOverlay) { highlightOverlay.remove(); highlightOverlay = null; }
}
