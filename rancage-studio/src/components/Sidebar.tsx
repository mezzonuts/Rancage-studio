'use client';

import React, { useCallback } from 'react';

interface NavItem {
  id: string;
  label: string;
  badge?: number;
  badgeColor?: string;
  icon?: string;
  action?: boolean;
}

export interface SidebarProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
  onImportClick: () => void;
}

const SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Workspace',
    items: [
      { id: 'spreadsheets', label: 'Spreadsheets', badge: 3 },
      { id: 'import', label: 'Import Documents', icon: 'upload', action: true },
      { id: 'integrations', label: 'Integrations', badge: 12, badgeColor: 'success' },
    ],
  },
  {
    label: 'Automate',
    items: [
      { id: 'replays', label: 'Replays', badge: 5 },
      { id: 'templates', label: 'Templates' },
    ],
  },
  {
    label: 'Analyze',
    items: [
      { id: 'dashboards', label: 'Dashboards' },
      { id: 'python', label: 'Python Scripts' },
    ],
  },
];

const NAV_ICONS: Record<string, React.ReactNode> = {
  spreadsheets: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[18px] w-[18px] opacity-70">
      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 3v18" />
    </svg>
  ),
  upload: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[18px] w-[18px] opacity-70">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  ),
  integrations: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[18px] w-[18px] opacity-70">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  replays: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[18px] w-[18px] opacity-70">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  ),
  templates: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[18px] w-[18px] opacity-70">
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" />
    </svg>
  ),
  dashboards: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[18px] w-[18px] opacity-70">
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  ),
  python: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[18px] w-[18px] opacity-70">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  ),
};

export function Sidebar({ activeNav, onNavChange, onImportClick }: SidebarProps) {
  const handleClick = useCallback(
    (item: NavItem) => {
      if (item.id === 'import') {
        onImportClick();
      } else {
        onNavChange(item.id);
      }
    },
    [onNavChange, onImportClick]
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <svg viewBox="0 0 28 28" fill="none" className="h-7 w-7 shrink-0">
          <rect width="28" height="28" rx="7" fill="#6c5ce7" />
          <path d="M8 10h12M8 14h8M8 18h10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span>Rancagé</span>
      </div>
      <nav className="sidebar-nav">
        {SECTIONS.map((section) => (
          <div key={section.label}>
            <div className="nav-section-label">{section.label}</div>
            {section.items.map((item) => (
              <div
                key={item.id}
                className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
                onClick={() => handleClick(item)}
              >
                {NAV_ICONS[item.icon ?? item.id]}
                {item.label}
                {item.badge != null && (
                  <span
                    className="nav-badge"
                    style={item.badgeColor === 'success' ? { background: 'var(--success)' } : undefined}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">PC</div>
          <div>
            <div className="user-name">Andika</div>
            <div className="user-email">andikasosha@gmail.com</div>
          </div>
        </div>
      </div>

      <style>{`
        .sidebar {
          grid-area: sidebar;
          background: var(--bg-sidebar);
          color: var(--text-sidebar);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          grid-row: 1 / -1;
        }
        .sidebar-logo {
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          height: 52px;
        }
        .sidebar-logo span {
          font-size: 17px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.3px;
        }
        .sidebar-nav {
          padding: 12px;
          flex: 1;
          overflow-y: auto;
        }
        .nav-section-label {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-sidebar-dim);
          padding: 16px 12px 8px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13.5px;
          font-weight: 500;
          transition: background 0.15s;
          color: var(--text-sidebar);
        }
        .nav-item:hover { background: var(--bg-sidebar-hover); }
        .nav-item.active { background: var(--bg-sidebar-active); color: #fff; }
        .nav-item.active svg { opacity: 1; }
        .nav-badge {
          margin-left: auto;
          background: var(--accent);
          color: #fff;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 10px;
          min-width: 18px;
          text-align: center;
        }
        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .user-info:hover { background: var(--bg-sidebar-hover); }
        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--accent-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          flex-shrink: 0;
        }
        .user-name { font-size: 13px; font-weight: 500; color: #fff; }
        .user-email { font-size: 11px; color: var(--text-sidebar-dim); }
      `}</style>
    </aside>
  );
}
