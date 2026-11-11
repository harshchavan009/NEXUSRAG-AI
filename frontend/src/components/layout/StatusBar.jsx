import React from 'react';
import { useSystemStatus, useCurrentWorkspace } from '../../api/queries';
import { Database, HardDrive, ShieldCheck } from 'lucide-react';

export function StatusBar() {
  const { data: statusData } = useSystemStatus();
  const { data: workspaceData } = useCurrentWorkspace();

  return (
    <footer className="h-7 bg-surface border-t border-border px-4 flex items-center justify-between text-[11px] font-mono text-ink-muted flex-shrink-0 select-none z-10">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5" title="Relational Database">
          <Database className="w-3 h-3 text-ink-faint" />
          <span>{statusData?.database_type || 'sqlite'}</span>
        </span>

        <span className="flex items-center gap-1.5" title="FAISS Vector Store Count">
          <HardDrive className="w-3 h-3 text-ink-faint" />
          <span>{statusData?.faiss_vectors ?? 0} vectors</span>
        </span>

        <span className="hidden md:inline" title="Total Indexed Chunks">
          {statusData?.indexed_chunks ?? 0} chunks indexed
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden sm:inline" title="Session Isolation Security">
          <ShieldCheck className="w-3 h-3 inline mr-1 text-status-success" />
          Session Isolated
        </span>
        <span title="NexusRAG Engine Version">v{statusData?.version || '1.0.0'}</span>
      </div>
    </footer>
  );
}

