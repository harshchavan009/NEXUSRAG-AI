import React from 'react';
import { StatusDot } from '../common/StatusDot';
import { useSystemStatus, useCurrentWorkspace } from '../../api/queries';
import { Search } from 'lucide-react';

export function TopBar({ title, subtitle, onSearchClick }) {
  const { data: statusData } = useSystemStatus();
  const { data: workspaceData } = useCurrentWorkspace();

  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const shortcutHint = isMac ? '⌘K' : 'Ctrl+K';

  return (
    <header className="h-14 border-b border-border bg-surface px-6 flex items-center justify-between flex-shrink-0 z-10">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-sm font-semibold text-ink leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-xs text-ink-muted leading-tight">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Search Shortcut Trigger */}
        <button
          onClick={onSearchClick}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded border border-border bg-surface-subtle text-xs text-ink-muted hover:border-border-strong hover:text-ink transition-colors"
          title="Search documents and queries"
        >
          <Search className="w-3.5 h-3.5 text-ink-faint" />
          <span>Quick search...</span>
          <kbd className="font-mono text-[10px] bg-surface px-1.5 py-0.5 rounded border border-border text-ink-muted">
            {shortcutHint}
          </kbd>
        </button>

        {/* Workspace Health Indicator */}
        <div className="flex items-center gap-2 pl-2">
          {statusData?.status && statusData.status !== 'healthy' && (
            <StatusDot
              status={statusData.status}
              label="Service Degraded"
            />
          )}

          <span
            className="text-[11px] font-medium text-ink-muted px-2 py-0.5 rounded bg-surface-subtle border border-border flex items-center gap-1.5"
            title="Session data is strictly isolated"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
            <span>Workspace Active</span>
          </span>
        </div>
      </div>
    </header>
  );
}

