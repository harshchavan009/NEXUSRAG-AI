import React from 'react';
import { StatusDot } from '../common/StatusDot';
import { useSystemStatus, useCurrentWorkspace } from '../../api/queries';
import { Search, MessageSquareShare, Keyboard } from 'lucide-react';

export function TopBar({ title, subtitle, onSearchClick, onFeedbackClick, onShortcutsClick }) {
  const { data: statusData, isError } = useSystemStatus();
  const { data: workspaceData } = useCurrentWorkspace();

  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const shortcutHint = isMac ? '⌘K' : 'Ctrl+K';

  return (
    <header className="h-14 border-b border-border bg-surface px-6 flex items-center justify-between flex-shrink-0 z-10 font-sans">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-sm font-semibold text-ink leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-xs text-ink-muted leading-tight">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Search / Command Palette Shortcut Trigger */}
        <button
          onClick={onSearchClick}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface-subtle text-xs text-ink-muted hover:border-border-strong hover:text-ink transition-colors shadow-2xs"
          title={`Search documents and execute actions (${shortcutHint})`}
        >
          <Search className="w-3.5 h-3.5 text-ink-faint" />
          <span>Quick command...</span>
          <kbd className="font-mono text-[10px] bg-surface px-1.5 py-0.5 rounded border border-border text-ink-muted">
            {shortcutHint}
          </kbd>
        </button>

        {/* Feedback Trigger */}
        {onFeedbackClick && (
          <button
            onClick={onFeedbackClick}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-surface text-xs text-ink-muted hover:text-ink hover:bg-surface-subtle transition-colors shadow-2xs"
            title="Share feedback or report an issue"
          >
            <MessageSquareShare className="w-3.5 h-3.5 text-brand" />
            <span className="hidden md:inline">Feedback</span>
          </button>
        )}

        {/* Shortcuts Reference Trigger */}
        {onShortcutsClick && (
          <button
            onClick={onShortcutsClick}
            className="hidden sm:flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-border bg-surface text-xs text-ink-muted hover:text-ink hover:bg-surface-subtle transition-colors shadow-2xs"
            title="View keyboard shortcuts (?)"
          >
            <Keyboard className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Workspace Health Indicator: displayed only when degraded or offline */}
        <div className="flex items-center gap-2 pl-1">
          {isError ? (
            <span className="text-[11px] font-medium text-status-error px-2 py-0.5 rounded bg-status-error/10 border border-status-error/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-status-error animate-pulse" />
              <span>Backend Offline</span>
            </span>
          ) : statusData?.status && statusData.status !== 'healthy' ? (
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Degraded: {statusData.database !== 'connected' ? 'Database offline' : 'Check settings'}</span>
            </span>
          ) : null}
        </div>
      </div>
    </header>
  );
}
