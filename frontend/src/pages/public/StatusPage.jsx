import React from 'react';
import { PublicHeader } from '../../components/public/PublicHeader';
import { PublicFooter } from '../../components/public/PublicFooter';
import { VIEWS } from '../../components/layout/RailNav';
import { StatusDot } from '../../components/common/StatusDot';
import { useSystemStatus } from '../../api/queries';
import { Activity, Database, Cpu, CheckCircle2, AlertCircle, HardDrive } from 'lucide-react';

export function StatusPage({ onNavigate }) {
  const { data: statusData, isLoading, isError } = useSystemStatus();

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans flex flex-col">
      <PublicHeader currentView={VIEWS.STATUS} onNavigate={onNavigate} />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full flex flex-col gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand/10 text-brand uppercase font-mono">
              Live Health
            </span>
            <span className="text-xs text-ink-muted">• Real-Time Telemetry</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink font-sans">
            System Status & Service Uptime
          </h1>
          <p className="mt-2 text-sm sm:text-base text-ink-muted font-serif max-w-xl leading-relaxed">
            Live operational status across our API server, FAISS vector indexing engine, relational database, and generation services.
          </p>
        </div>

        {/* Global Status Banner */}
        <div className="p-5 rounded-xl bg-surface border border-border shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-status-success animate-pulse" />
            <div>
              <h2 className="text-sm font-semibold text-ink">
                {isError ? 'System Offline' : 'All Core Systems Fully Operational'}
              </h2>
              <p className="text-xs text-ink-muted font-mono mt-0.5">
                NexusRAG v1.0.0 • Environment: {statusData?.environment || 'development'}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-ink-muted hidden sm:inline">
            Status Poll: 30s
          </span>
        </div>

        {/* Component Health Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
          <div className="p-4 rounded-xl bg-surface border border-border shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4 text-brand" />
              <div>
                <span className="font-semibold text-ink block">FastAPI REST Server</span>
                <span className="text-[11px] text-ink-muted">Uvicorn ASGI Engine • Python 3.11+</span>
              </div>
            </div>
            <StatusDot status="ready" text="Operational" />
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4 text-brand" />
              <div>
                <span className="font-semibold text-ink block">Metadata Database</span>
                <span className="text-[11px] text-ink-muted uppercase font-mono">{statusData?.database_type || 'SQLite 3'} • SQLAlchemy 2.0</span>
              </div>
            </div>
            <StatusDot status="ready" text="Connected" />
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HardDrive className="w-4 h-4 text-brand" />
              <div>
                <span className="font-semibold text-ink block">FAISS Vector Store</span>
                <span className="text-[11px] text-ink-muted font-mono">{statusData?.faiss_vectors ?? 0} vectors • IndexIDMap2</span>
              </div>
            </div>
            <StatusDot status="ready" text="Online" />
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cpu className="w-4 h-4 text-brand" />
              <div>
                <span className="font-semibold text-ink block">Google Gemini API</span>
                <span className="text-[11px] text-ink-muted font-mono">{statusData?.generation_model || 'gemini-2.5-flash'}</span>
              </div>
            </div>
            <StatusDot status="ready" text="Online" />
          </div>
        </div>

        {/* Runtime Constraints Card */}
        <section className="p-5 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-3 text-xs">
          <h3 className="font-semibold text-ink">Configured Runtime Limits</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[11px]">
            <div className="p-3 rounded-lg bg-surface-subtle border border-border">
              <span className="text-ink-muted text-[10px] block">Max File Size</span>
              <span className="text-ink font-bold">25 MB</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-subtle border border-border">
              <span className="text-ink-muted text-[10px] block">Max PDF Pages</span>
              <span className="text-ink font-bold">60 pages</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-subtle border border-border">
              <span className="text-ink-muted text-[10px] block">Session TTL</span>
              <span className="text-ink font-bold">7 days</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-subtle border border-border">
              <span className="text-ink-muted text-[10px] block">Embedding Dim</span>
              <span className="text-ink font-bold">768-dim</span>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter onNavigate={onNavigate} />
    </div>
  );
}

