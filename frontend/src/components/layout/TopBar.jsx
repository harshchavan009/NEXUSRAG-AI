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

        {/* Live Health & Tenant Badge */}
        <div className="flex items-center gap-3 pl-2 border-l border-border">
          <StatusDot
            status={statusData?.status || 'checking'}
            label={statusData?.status === 'healthy' ? 'FAISS Ready' : 'System Ready'}
          />

          <span
            className="text-[11px] font-mono text-ink-muted px-2 py-0.5 rounded bg-surface-subtle border border-border"
            title={`Workspace ID: ${workspaceData?.workspace_id || 'Connecting...'}`}
          >
            {workspaceData?.workspace_id ? `ws:${workspaceData.workspace_id.slice(0, 8)}` : 'ws:visitor'}
          </span>
        </div>
      </div>
    </header>
  );
}
