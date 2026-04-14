import React from 'react';

/**
 * Global Icon Component Library
 * Standardizes Lucide-style stroke icons (24x24 viewport, stroke-width 2)
 */

export const IconBase = ({ children, size = 18, strokeWidth = 2, className = "", style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`af-icon ${className}`}
    style={{ display: 'block', ...style }}
  >
    {children}
  </svg>
);

// Navigation & Actions
export const IconArrowLeft = (props) => (
  <IconBase {...props}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></IconBase>
);

export const IconArrowUp = (props) => (
  <IconBase {...props}><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></IconBase>
);

export const IconSearch = (props) => (
  <IconBase {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></IconBase>
);

export const IconPlus = (props) => (
  <IconBase {...props}><path d="M5 12h14"/><path d="M12 5v14"/></IconBase>
);

export const IconMinus = (props) => (
  <IconBase {...props}><path d="M5 12h14"/></IconBase>
);

export const IconInfo = (props) => (
  <IconBase {...props}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></IconBase>
);

export const IconRefresh = (props) => (
  <IconBase {...props}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></IconBase>
);

export const IconSettings = (props) => (
  <IconBase {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></IconBase>
);


export const IconCheck = (props) => (
  <IconBase {...props}><polyline points="20 6 9 17 4 12"/></IconBase>
);

export const IconX = (props) => (
  <IconBase {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></IconBase>
);

export const IconCopy = (props) => (
  <IconBase {...props}><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></IconBase>
);


// Objects & Files
export const IconFile = (props) => (
  <IconBase {...props}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></IconBase>
);

export const IconFileText = (props) => (
  <IconBase {...props}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 12h6"/><path d="M9 16h6"/></IconBase>
);

export const IconFolder = (props) => (
  <IconBase {...props}><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></IconBase>
);

export const IconFolderOpen = (props) => (
  <IconBase {...props}><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/></IconBase>
);


export const IconTerminal = (props) => (
  <IconBase {...props}><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></IconBase>
);

export const IconClipboard = (props) => (
  <IconBase {...props}><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></IconBase>
);

export const IconDownload = (props) => (
  <IconBase {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></IconBase>
);

export const IconUpload = (props) => (
  <IconBase {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></IconBase>
);

export const IconPackage = (props) => (
  <IconBase {...props}><path d="M16.5 9.4 7.5 4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.27 6.96 8.73 5.05 8.73-5.05"/><path d="M12 22.08V12"/></IconBase>
);

// Entities
export const IconBot = (props) => (
  <IconBase {...props}><rect width="18" height="10" x="3" y="11" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" x2="8" y1="16" y2="16"/><line x1="16" x2="16" y1="16" y2="16"/></IconBase>
);

export const IconUser = (props) => (
  <IconBase {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></IconBase>
);

export const IconBrain = (props) => (
  <IconBase {...props}><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .52 5.888 3 3 0 1 0 5.996.517 3 3 0 1 0 5.996-.517 4 4 0 0 0 .52-5.887 4 4 0 0 0-2.526-5.77A3 3 0 1 0 12 5"/><path d="M12 11V5"/><path d="M12 13v6"/><path d="M12 13c-4.5 0-7.3-3.6-7.3-7.5"/><path d="M12 13c4.5 0 7.3-3.6 7.3-7.5"/></IconBase>
);

export const IconZap = (props) => (
  <IconBase {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></IconBase>
);

export const IconRocket = (props) => (
  <IconBase {...props}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z"/><path d="M9 12H4s.5-1 1-4c1.5 0 3 .5 3 .5Z"/><path d="M15 9s.5 1.5.5 3c-3 1-4 1-4 1s-.5-1.5-.5-3Z"/></IconBase>
);

// Misc
export const IconPuzzle = (props) => (
  <IconBase {...props}><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.17a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.17a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.17a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.17a1.65 1.65 0 0 0-1.51 1z"/></IconBase>
);

export const IconWrench = (props) => (
  <IconBase {...props}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></IconBase>
);

export const IconBarChart = (props) => (
  <IconBase {...props}><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></IconBase>
);

export const IconTag = (props) => (
  <IconBase {...props}><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></IconBase>
);

export const IconMessageSquare = (props) => (
  <IconBase {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></IconBase>
);

export const IconNotebook = (props) => (
  <IconBase {...props}><path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M16 2v20"/></IconBase>
);

export const IconImage = (props) => (
  <IconBase {...props}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></IconBase>
);

export const IconEdit = (props) => (
  <IconBase {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></IconBase>
);

export const IconTarget = (props) => (
  <IconBase {...props}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></IconBase>
);

export const IconShield = (props) => (
  <IconBase {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></IconBase>
);

export const IconClock = (props) => (
  <IconBase {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></IconBase>
);

export const IconCalendar = (props) => (
  <IconBase {...props}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></IconBase>
);

export const IconMonitor = (props) => (
  <IconBase {...props}><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></IconBase>
);

export const IconPlay = (props) => (
  <IconBase {...props}><polygon points="5 3 19 12 5 21 5 3"/></IconBase>
);

export const IconPin = (props) => (
  <IconBase {...props}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></IconBase>
);

export const IconGlobe = (props) => (
  <IconBase {...props}><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></IconBase>
);

export const IconAtom = (props) => (
  <IconBase {...props}><circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c2.04-2.03.02-7.36-4.52-11.9s-9.87-6.56-11.9-4.52 0 7.37 4.52 11.9 9.87 6.55 11.9 4.52z"/><path d="M3.8 20.2c-2.04-2.03.02-7.36 4.52-11.9s9.87-6.56 11.9-4.52 0 7.37-4.52 11.9-9.87 6.55-11.9 4.52z"/></IconBase>
);

export const IconFlask = (props) => (
  <IconBase {...props}><path d="M9 2v6"/><path d="M15 2v6"/><path d="M12 2v3"/><path d="M5 20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2l-3-6V8h-4v4l-3 6v2Z"/><path d="M8.5 13h7"/></IconBase>
);

export const IconSparkles = (props) => (
  <IconBase {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M3 5h4"/><path d="M21 17v4"/><path d="M19 19h4"/></IconBase>
);

export const IconGithub = (props) => (
  <IconBase {...props}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></IconBase>
);


export const IconDrama = (props) => (
  <IconBase {...props}><path d="M10 11h.01"/><path d="M14 11h.01"/><path d="M10 15h4"/><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z"/><path d="M12 2a12.85 12.85 0 0 0 0 20"/></IconBase>
);

export const IconCpu = (props) => (
  <IconBase {...props}><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></IconBase>
);

export const IconInbox = (props) => (
  <IconBase {...props}><path d="m22 13-5 5H7l-5-5V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/><path d="m2 13 20 0"/></IconBase>
);

export const IconActivity = (props) => (
  <IconBase {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></IconBase>
);

export const IconLayers = (props) => (
  <IconBase {...props}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></IconBase>
);

export const IconDatabase = (props) => (
  <IconBase {...props}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></IconBase>
);

export const IconHammer = (props) => (
  <IconBase {...props}><path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.31C18.73 6.25 18 4 18 4s-2.25.73-3.9 1.73h-.31c-.85 0-1.65.33-2.25.93l-1.25 1.25"/></IconBase>
);

export const IconLogOut = (props) => (
  <IconBase {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></IconBase>
);

export const IconMail = (props) => (
  <IconBase {...props}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></IconBase>
);

export const IconBuilding = (props) => (
  <IconBase {...props}><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></IconBase>
);

export const IconBird = (props) => (
  <IconBase {...props}><path d="M16 7a4 4 0 0 1-8 0a4 4 0 0 1 8 0Z"/><path d="M2 11v1a10 10 0 0 0 10 10a10 10 0 0 0 10-10v-1"/><path d="M7 11c0 2.76 2.24 5 5 5s5-2.24 5-5"/></IconBase>
);

export const IconLink = (props) => (
  <IconBase {...props}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></IconBase>
);

export const IconDollarSign = (props) => (
  <IconBase {...props}><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></IconBase>
);

export const IconLock = (props) => (
  <IconBase {...props}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></IconBase>
);

export const IconKey = (props) => (
  <IconBase {...props}><path d="m21 2-19.6 19.6"/><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-2 2"/><path d="m18 5 3 3"/></IconBase>
);

export const IconTool = (props) => (
  <IconBase {...props}><path d="m12 20 4-9 4-4-4-4-9 4Z"/><path d="M18 14.91V15a6 6 0 0 1-12 0v-.09"/><path d="M12 11.14V22"/><path d="M3 22h18"/><path d="m10 9.5 4 4"/></IconBase>
);


export const IconRotateCcw = (props) => (
  <IconBase {...props}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></IconBase>
);

export const IconXCircle = (props) => (
  <IconBase {...props}><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></IconBase>
);

export const IconSend = (props) => (
  <IconBase {...props}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></IconBase>
);

export const IconPaperclip = (props) => (
  <IconBase {...props}><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></IconBase>
);

export const IconPause = (props) => (
  <IconBase {...props}><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></IconBase>
);

export const IconMoreHorizontal = (props) => (
  <IconBase {...props}><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></IconBase>
);

export const IconChevronDown = (props) => (
  <IconBase {...props}><path d="m6 9 6 6 6-6"/></IconBase>
);

export const IconChevronUp = (props) => (
  <IconBase {...props}><path d="m18 15-6-6-6 6"/></IconBase>
);

export const IconChevronRight = (props) => (
  <IconBase {...props}><path d="m9 18 6-6-6-6"/></IconBase>
);

export const IconChevronLeft = (props) => (
  <IconBase {...props}><path d="m15 18-6-6 6-6"/></IconBase>
);

export const IconTrash = (props) => (
  <IconBase {...props}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></IconBase>
);

export const IconAlertTriangle = (props) => (
  <IconBase {...props}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></IconBase>
);

export const IconEye = (props) => (
  <IconBase {...props}><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></IconBase>
);

export const IconEyeOff = (props) => (
  <IconBase {...props}><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></IconBase>
);

export const IconList = (props) => (
  <IconBase {...props}><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></IconBase>
);

export const IconGrid = (props) => (
  <IconBase {...props}><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></IconBase>
);

export const IconSort = (props) => (
  <IconBase {...props}><path d="m15 18-3 3-3-3"/><path d="m9 6 3-3 3 3"/><path d="M12 3v18"/></IconBase>
);

export const IconSquare = (props) => (
  <IconBase {...props}><rect width="18" height="18" x="3" y="3" rx="2"/></IconBase>
);

export const IconBrush = (props) => (
  <IconBase {...props}><path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 3.02 1.08 3.22 8.67 2.03 8.31-1.96-.03-.35.26-.6.6-.6h3.03l-1-1a3.02 3.02 0 0 0-3-3.02Z"/></IconBase>
);

export const IconSmartphone = (props) => (
  <IconBase {...props}><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></IconBase>
);
