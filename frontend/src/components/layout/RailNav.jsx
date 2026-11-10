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
  Compass
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
    <aside className="w-16 flex-shrink-0 bg-[#1E242B] border-r border-[#2D3540] flex flex-col items-center py-4 justify-between z-20 select-none text-white">
      {/* Brand Icon Mark (Design Reference 1 Dark Rail Logic) */}
      <div className="flex flex-col items-center gap-6">
        <button
          onClick={() => onViewChange(VIEWS.LANDING)}
          className="w-10 h-10 rounded-md bg-[#B84A28] flex items-center justify-center text-white shadow-sm hover:bg-[#9E3E20] transition-colors relative group focus:outline-none focus:ring-2 focus:ring-[#D96E43]"
          title="NexusRAG Home"
          aria-label="NexusRAG Home"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 32 32">
            <path d="M8 10h6a4 4 0 0 1 4 4v10a4 4 0 0 0-4-4H8V10zm16 0h-6a4 4 0 0 0-4 4v10a4 4 0 0 1 4-4h6V10z" fill="currentColor"/>
            <circle cx="16" cy="14" r="2" fill="#F7F6F2"/>
          </svg>
        </button>

        {/* Navigation Rail Buttons */}
        <nav className="flex flex-col gap-2" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={clsx(
                  'w-10 h-10 rounded-md flex items-center justify-center transition-all relative group focus:outline-none',
                  isActive
                    ? 'bg-[#B84A28] text-white shadow-sm'
                    : 'text-[#8C9BAE] hover:text-white hover:bg-[#2A333E]'
                )}
                title={item.label}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-4.5 h-4.5" />
                {isActive && (
                  <span className="absolute -left-1 top-2.5 bottom-2.5 w-1 bg-white rounded-r" aria-hidden="true" />
                )}
                {/* Floating Tooltip */}
                <span className="absolute left-14 px-2.5 py-1 bg-[#11161B] text-white text-xs font-medium rounded whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg border border-[#2D3540]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Theme Toggle & Bottom Actions */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={onToggleTheme}
          className="w-10 h-10 rounded-md flex items-center justify-center text-[#8C9BAE] hover:text-white hover:bg-[#2A333E] transition-colors"
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </button>

        {/* Workspace status dot */}
        <div className="w-2 h-2 rounded-full bg-[#34A853] mt-1" title="Workspace Connected" />
      </div>
    </aside>
  );
}
