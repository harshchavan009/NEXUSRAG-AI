import React from 'react';
import {
  Sparkles,
  Library,
  BookOpen,
  FileText,
  Activity,
  Settings,
  Sun,
  Moon,
  Compass,
  FolderTree
} from 'lucide-react';
import clsx from 'clsx';

export const VIEWS = {
  LANDING: 'landing',
  DASHBOARD: 'dashboard',
  LIBRARY: 'library',
  RESEARCH: 'research',
  READER: 'reader',
  INSPECTOR: 'inspector',
  SETTINGS: 'settings',
};

export function RailNav({ currentView, onViewChange, isDark, onToggleTheme }) {
  const navItems = [
    { id: VIEWS.LANDING, label: 'Overview', icon: Compass },
    { id: VIEWS.DASHBOARD, label: 'Ask-First Desk', icon: Sparkles },
    { id: VIEWS.LIBRARY, label: 'Knowledge Bases', icon: Library },
    { id: VIEWS.RESEARCH, label: 'Research Sessions', icon: BookOpen },
    { id: VIEWS.READER, label: 'Document Reader', icon: FileText },
    { id: VIEWS.INSPECTOR, label: 'Retrieval Inspector', icon: Activity },
    { id: VIEWS.SETTINGS, label: 'System Settings', icon: Settings },
  ];

  return (
    <aside className="w-16 flex-shrink-0 bg-surface border-r border-border flex flex-col items-center py-4 justify-between z-20 select-none">
      {/* Brand Icon Mark */}
      <div className="flex flex-col items-center gap-6">
        <button
          onClick={() => onViewChange(VIEWS.LANDING)}
          className="w-10 h-10 rounded bg-brand flex items-center justify-center text-white shadow-xs hover:bg-brand-hover transition-colors"
          title="NexusRAG Home"
          aria-label="NexusRAG Home"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 32 32">
            <path d="M8 10h6a4 4 0 0 1 4 4v10a4 4 0 0 0-4-4H8V10zm16 0h-6a4 4 0 0 0-4 4v10a4 4 0 0 1 4-4h6V10z" fill="currentColor"/>
            <circle cx="16" cy="14" r="2" fill="#D96E43"/>
          </svg>
        </button>

        {/* Navigation Rail Buttons */}
        <nav className="flex flex-col gap-1.5" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={clsx(
                  'w-10 h-10 rounded flex items-center justify-center transition-colors relative group',
                  isActive
                    ? 'bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-subtle'
                )}
                title={item.label}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-5 h-5" />
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-brand rounded-r" aria-hidden="true" />
                )}
                {/* Floating Tooltip */}
                <span className="absolute left-14 px-2 py-1 bg-ink text-white text-xs rounded whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Theme Toggle & Bottom Actions */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={onToggleTheme}
          className="w-10 h-10 rounded flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-subtle transition-colors"
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
}
