import React, { useState } from 'react';
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
  ChevronLeft,
  ChevronRight
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
  const [isExpanded, setIsExpanded] = useState(() => {
    return localStorage.getItem('nexusrag_rail_expanded') !== 'false';
  });

  const toggleExpanded = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      localStorage.setItem('nexusrag_rail_expanded', String(next));
      return next;
    });
  };

  const navItems = [
    { id: VIEWS.DASHBOARD, label: 'Dashboard', icon: Sparkles },
    { id: VIEWS.LIBRARY, label: 'Knowledge Bases', icon: Library },
    { id: VIEWS.RESEARCH, label: 'Research Desk', icon: BookOpen },
    { id: VIEWS.READER, label: 'Document Reader', icon: FileText },
    { id: VIEWS.INSPECTOR, label: 'Retrieval Inspector', icon: Activity },
    { id: VIEWS.SETTINGS, label: 'System Settings', icon: Settings },
  ];

  return (
    <aside
      className={clsx(
        'flex-shrink-0 bg-[#1E242B] border-r border-[#2D3540] flex flex-col justify-between py-4 select-none text-white transition-all duration-200 z-20',
        isExpanded ? 'w-56 px-3' : 'w-16 items-center px-2'
      )}
    >
      {/* Brand Header */}
      <div className="flex flex-col gap-6">
        <div className={clsx('flex items-center', isExpanded ? 'justify-between px-1' : 'justify-center')}>
          <button
            onClick={() => onViewChange(VIEWS.DASHBOARD)}
            className="flex items-center gap-2.5 focus:outline-none group text-left"
            aria-label="NexusRAG Home"
          >
            <div className="w-9 h-9 rounded-md bg-[#B84A28] flex items-center justify-center text-white shadow-sm group-hover:bg-[#9E3E20] transition-colors flex-shrink-0">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 32 32">
                <path d="M8 10h6a4 4 0 0 1 4 4v10a4 4 0 0 0-4-4H8V10zm16 0h-6a4 4 0 0 0-4 4v10a4 4 0 0 1 4-4h6V10z" fill="currentColor"/>
                <circle cx="16" cy="14" r="2" fill="#F7F6F2"/>
              </svg>
            </div>
            {isExpanded && (
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-white leading-none">
                  nexus<span className="text-[#D96E43]">rag</span>
                </span>
                <span className="text-[10px] text-[#8C9BAE] font-mono mt-0.5">research workspace</span>
              </div>
            )}
          </button>
        </div>

        {/* Navigation Buttons */}
        <nav className="flex flex-col gap-1.5" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={clsx(
                  'rounded-md flex items-center transition-all relative focus:outline-none text-xs font-medium',
                  isExpanded
                    ? 'w-full px-3 py-2 gap-3 text-left'
                    : 'w-10 h-10 justify-center group',
                  isActive
                    ? 'bg-[#B84A28] text-white shadow-xs'
                    : 'text-[#8C9BAE] hover:text-white hover:bg-[#2A333E]'
                )}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                {isExpanded ? (
                  <span className="truncate">{item.label}</span>
                ) : (
                  /* Floating Tooltip in collapsed mode (NO native title to prevent double-tooltip overlay) */
                  <span className="absolute left-14 px-2.5 py-1 bg-[#11161B] text-white text-xs font-medium rounded whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg border border-[#2D3540]">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls */}
      <div className="flex flex-col gap-1.5 pt-3 border-t border-[#2D3540]">
        {/* Public Site Link */}
        <button
          onClick={() => onViewChange(VIEWS.LANDING)}
          className={clsx(
            'rounded-md flex items-center transition-colors text-xs font-medium text-[#8C9BAE] hover:text-white hover:bg-[#2A333E]',
            isExpanded ? 'w-full px-3 py-2 gap-3' : 'w-10 h-10 justify-center group relative'
          )}
          aria-label="Overview"
        >
          <Compass className="w-4.5 h-4.5 flex-shrink-0" />
          {isExpanded ? (
            <span className="truncate">Public Site</span>
          ) : (
            <span className="absolute left-14 px-2.5 py-1 bg-[#11161B] text-white text-xs font-medium rounded whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg border border-[#2D3540]">
              Public Site
            </span>
          )}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className={clsx(
            'rounded-md flex items-center transition-colors text-xs font-medium text-[#8C9BAE] hover:text-white hover:bg-[#2A333E]',
            isExpanded ? 'w-full px-3 py-2 gap-3' : 'w-10 h-10 justify-center group relative'
          )}
          aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isDark ? <Sun className="w-4.5 h-4.5 flex-shrink-0" /> : <Moon className="w-4.5 h-4.5 flex-shrink-0" />}
          {isExpanded && <span className="truncate">{isDark ? 'Light Theme' : 'Dark Theme'}</span>}
        </button>

        {/* Collapse / Expand Rail Toggle */}
        <button
          onClick={toggleExpanded}
          className={clsx(
            'rounded-md flex items-center transition-colors text-xs font-medium text-[#8C9BAE] hover:text-white hover:bg-[#2A333E]',
            isExpanded ? 'w-full px-3 py-2 gap-3' : 'w-10 h-10 justify-center group relative'
          )}
          aria-label={isExpanded ? 'Collapse Navigation' : 'Expand Navigation'}
        >
          {isExpanded ? (
            <>
              <ChevronLeft className="w-4.5 h-4.5 flex-shrink-0" />
              <span className="truncate">Collapse Sidebar</span>
            </>
          ) : (
            <>
              <ChevronRight className="w-4.5 h-4.5 flex-shrink-0" />
              <span className="absolute left-14 px-2.5 py-1 bg-[#11161B] text-white text-xs font-medium rounded whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg border border-[#2D3540]">
                Expand Sidebar
              </span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
