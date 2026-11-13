import React, { useState } from 'react';
import {
  ShieldCheck,
  Database,
  HardDrive,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
  FileCode,
  Cpu,
  Layers,
  Palette,
  Sliders,
  CheckCircle2,
  Info,
  Clock,
  Sparkles
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { StatusDot } from '../components/common/StatusDot';
import { Modal } from '../components/common/Modal';
import { useSystemStatus, useCurrentWorkspace, usePurgeWorkspace, useProviderProbe, useDocuments, useSessions } from '../api/queries';
import { useToast } from '../components/common/Toast';
import clsx from 'clsx';

export function SettingsPage() {
  const { data: statusData } = useSystemStatus();
  const { data: workspaceData } = useCurrentWorkspace();
  const { data: probeData, isLoading: probeLoading } = useProviderProbe();
  const { data: documents = [] } = useDocuments();
  const { data: sessions = [] } = useSessions();
  const purgeMutation = usePurgeWorkspace();
  const toast = useToast();

  const docsList = Array.isArray(documents) ? documents : (documents.documents || []);
  const sessionsList = Array.isArray(sessions) ? sessions : (sessions.sessions || []);
  const totalStorageBytes = docsList.reduce((sum, d) => sum + (d.file_size_bytes || 0), 0);
  const totalStorageMB = (totalStorageBytes / (1024 * 1024)).toFixed(2);

  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-3.5-flash-lite');
  const [retrievalParams, setRetrievalParams] = useState(() => {
    try {
      const stored = localStorage.getItem('nexusrag_retrieval_params');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      topK: 8,
      rerankCount: 4,
      sufficiencyThreshold: 0.65,
      groundednessThreshold: 0.70,
      temperature: 0.20,
    };
  });

  const handleUpdateParam = (key, value) => {
    setRetrievalParams((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem('nexusrag_retrieval_params', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('nexusrag_theme') === 'dark';
  });

  const handleExportData = () => {
    window.location.href = '/api/v1/user/export';
    toast.success('Workspace JSON export initiated.');
  };

  const handleConfirmPurge = async () => {
    try {
      await purgeMutation.mutateAsync();
      setIsPurgeModalOpen(false);
      toast.success('All workspace documents, vectors, and sessions have been permanently purged.');
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err) {
      toast.error('Failed to purge workspace data.');
    }
  };

  const handleThemeChange = (dark) => {
    setIsDark(dark);
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('nexusrag_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('nexusrag_theme', 'light');
    }
    toast.info(`Theme set to ${dark ? 'Dark (Obsidian)' : 'Light (Warm Sand)'}`);
  };

  return (
    <main className="flex-1 overflow-y-auto bg-canvas p-6 md:p-8 max-w-5xl mx-auto flex flex-col gap-8 font-sans">
      {/* Header */}
      <div className="pb-4 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-ink font-sans">
            System Settings & Architecture
          </h1>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-brand/10 text-brand">
            v1.0.0
          </span>
        </div>
        <p className="text-xs sm:text-sm text-ink-muted mt-1 font-serif">
          Manage AI model parameters, chunking thresholds, vector persistence, database dialect, and tenant data privacy.
        </p>
      </div>

      {/* 1. AI Provider & Model Configuration (Spec Page 7) */}
      <section className="p-5 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-brand" />
            <h2 className="text-sm font-semibold text-ink">AI Provider & Generation Model</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className={clsx(
              "text-[11px] font-mono flex items-center gap-1.5 px-2 py-0.5 rounded",
              probeData?.status === 'online' && "text-status-success bg-status-success/10",
              probeData?.status === 'missing_key' && "text-amber-600 dark:text-amber-400 bg-amber-500/10",
              probeData?.status === 'error' && "text-status-error bg-status-error/10",
              !probeData && "text-ink-muted bg-surface-subtle"
            )}>
              <span className={clsx(
                "w-1.5 h-1.5 rounded-full",
                probeData?.status === 'online' && "bg-status-success",
                probeData?.status === 'missing_key' && "bg-amber-500 animate-pulse",
                probeData?.status === 'error' && "bg-status-error",
                !probeData && "bg-ink-muted"
              )} />
              <span>
                {probeLoading ? 'Probing API...' : probeData?.status === 'online' ? `API Online (${probeData.latency_ms}ms)` : probeData?.status === 'missing_key' ? 'Key Not Configured' : 'API Degraded'}
              </span>
            </span>
          </div>
        </div>

        {probeData?.status === 'missing_key' && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
            <div>
              <span className="font-semibold">API Key Not Configured: </span>
              {probeData.message}
            </div>
          </div>
        )}

        {probeData?.status === 'error' && (
          <div className="p-3 rounded-lg bg-status-error/10 border border-status-error/20 text-xs text-status-error flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-status-error" />
            <div>
              <span className="font-semibold">Provider Probe Error: </span>
              {probeData.message}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-ink-muted font-medium mb-1.5">
              Active Generation LLM
            </label>
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                toast.success(`Active LLM updated to ${e.target.value}`);
              }}
              className="w-full bg-surface-subtle border border-border rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-brand font-medium text-xs cursor-pointer"
            >
              <option value="gemini-3.5-flash-lite">Google Gemini 3.5 Flash-Lite (Fast, Grounded Synthesis)</option>
              <option value="gemini-3.8-flash">Google Gemini 3.8 Flash (High-Capacity Multimodal Reasoning)</option>
            </select>
            <span className="text-[11px] text-ink-muted mt-1 block">
              Temperature: 0.20 • Max Generation: 2,048 tokens
            </span>
          </div>

          <div>
            <label className="block text-ink-muted font-medium mb-1.5">
              Semantic Embedding Model
            </label>
            <div className="p-2.5 rounded-lg bg-surface-subtle border border-border flex items-center justify-between text-xs">
              <span className="font-mono text-ink font-semibold">gemini-embedding-2</span>
              <span className="text-[11px] text-ink-muted">768-dim (MRL) • Unit L2 Norm</span>
            </div>
            <span className="text-[11px] text-ink-muted mt-1 block">
              Cosine similarity computed via FAISS IndexFlatIP with IndexIDMap2
            </span>
          </div>
        </div>
      </section>

      {/* 2. Chunking & Retrieval Parameters (Spec Page 7) */}
      <section className="p-5 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand" />
            <h2 className="text-sm font-semibold text-ink">Chunking & LangGraph Pipeline Parameters</h2>
          </div>
          <span className="text-[11px] text-ink-muted font-mono">9-Node Directed Acyclic Graph</span>
        </div>

        {/* Static Chunking Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-surface-subtle border border-border flex flex-col gap-1">
            <span className="text-ink-muted text-[10px] uppercase font-sans font-medium">Chunk Size</span>
            <span className="text-ink font-bold text-sm">700 tokens</span>
            <span className="text-ink-muted text-[10px]">tiktoken (cl100k_base) sentence-boundary chunker</span>
          </div>

          <div className="p-3 rounded-lg bg-surface-subtle border border-border flex flex-col gap-1">
            <span className="text-ink-muted text-[10px] uppercase font-sans font-medium">Chunk Overlap</span>
            <span className="text-ink font-bold text-sm">100 tokens</span>
            <span className="text-ink-muted text-[10px]">Sliding boundary preservation</span>
          </div>
        </div>

        {/* Configurable Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
          {/* Top-K Initial Retrieval */}
          <div className="p-3.5 rounded-lg bg-surface-subtle border border-border flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-ink">Initial Retrieval (Top-K)</label>
              <span className="font-mono text-brand font-bold bg-surface px-2 py-0.5 rounded border border-border">
                {retrievalParams.topK} chunks
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={retrievalParams.topK}
              onChange={(e) => handleUpdateParam('topK', parseInt(e.target.value, 10))}
              className="w-full accent-brand cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-ink-muted font-mono">
              <span>1 (Precise)</span>
              <span>Default: 8</span>
              <span>20 (Broad)</span>
            </div>
          </div>

          {/* Reranked Context Count */}
          <div className="p-3.5 rounded-lg bg-surface-subtle border border-border flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-ink">Reranked Context (Top-N)</label>
              <span className="font-mono text-brand font-bold bg-surface px-2 py-0.5 rounded border border-border">
                {retrievalParams.rerankCount} chunks
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={retrievalParams.rerankCount}
              onChange={(e) => handleUpdateParam('rerankCount', parseInt(e.target.value, 10))}
              className="w-full accent-brand cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-ink-muted font-mono">
              <span>1</span>
              <span>Default: 4</span>
              <span>10</span>
            </div>
          </div>

          {/* Evidence Sufficiency Gate Threshold */}
          <div className="p-3.5 rounded-lg bg-surface-subtle border border-border flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-ink">Evidence Sufficiency Gate</label>
              <span className="font-mono text-brand font-bold bg-surface px-2 py-0.5 rounded border border-border">
                {retrievalParams.sufficiencyThreshold.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.50"
              max="0.95"
              step="0.05"
              value={retrievalParams.sufficiencyThreshold}
              onChange={(e) => handleUpdateParam('sufficiencyThreshold', parseFloat(e.target.value))}
              className="w-full accent-brand cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-ink-muted font-mono">
              <span>0.50 (Permissive)</span>
              <span>Default: 0.65</span>
              <span>0.95 (Strict)</span>
            </div>
          </div>

          {/* Faithful Groundedness Gate Threshold */}
          <div className="p-3.5 rounded-lg bg-surface-subtle border border-border flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-ink">Groundedness Gate Threshold</label>
              <span className="font-mono text-brand font-bold bg-surface px-2 py-0.5 rounded border border-border">
                {retrievalParams.groundednessThreshold.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.50"
              max="0.95"
              step="0.05"
              value={retrievalParams.groundednessThreshold}
              onChange={(e) => handleUpdateParam('groundednessThreshold', parseFloat(e.target.value))}
              className="w-full accent-brand cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-ink-muted font-mono">
              <span>0.50</span>
              <span>Default: 0.70</span>
              <span>0.95</span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-surface-subtle/60 border border-border flex items-center justify-between text-xs text-ink-muted">
          <span>Settings automatically persist to local workspace runtime.</span>
          <button
            onClick={() => {
              const defaults = {
                topK: 8,
                rerankCount: 4,
                sufficiencyThreshold: 0.65,
                groundednessThreshold: 0.70,
                temperature: 0.20,
              };
              setRetrievalParams(defaults);
              localStorage.setItem('nexusrag_retrieval_params', JSON.stringify(defaults));
              toast.info('Retrieval settings reset to defaults.');
            }}
            className="text-brand hover:underline font-medium text-[11px]"
          >
            Reset to Defaults
          </button>
        </div>
      </section>

      {/* 3. Relational Database & Storage Architecture (Formal Dual-Dialect Justification) */}
      <section className="p-5 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-brand" />
            <h2 className="text-sm font-semibold text-ink">Relational Database & Storage Architecture</h2>
          </div>
          <span className="text-[11px] font-mono text-brand bg-brand/10 px-2 py-0.5 rounded">
            Dual-Engine SQLAlchemy 2.0
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-surface-subtle border border-border flex flex-col gap-1">
            <span className="text-ink-muted text-[10px] uppercase font-sans font-medium">Active Database</span>
            <span className="text-ink font-bold text-sm uppercase">{statusData?.database_type || 'SQLite 3'}</span>
            <span className="text-status-success text-[10px]">• Local single-process WAL</span>
          </div>

          <div className="p-3 rounded-lg bg-surface-subtle border border-border flex flex-col gap-1">
            <span className="text-ink-muted text-[10px] uppercase font-sans font-medium">FAISS Vector Store</span>
            <span className="text-ink font-bold text-sm">{statusData?.faiss_vectors ?? 0} vectors</span>
            <span className="text-ink-muted text-[10px]">IndexIDMap2 (supports deletion)</span>
          </div>

          <div className="p-3 rounded-lg bg-surface-subtle border border-border flex flex-col gap-1">
            <span className="text-ink-muted text-[10px] uppercase font-sans font-medium">Indexed Chunks</span>
            <span className="text-ink font-bold text-sm">{statusData?.indexed_chunks ?? 0} chunks</span>
            <span className="text-ink-muted text-[10px]">Foreign key linked to docs</span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-surface-subtle border border-border text-xs leading-relaxed text-ink-muted">
          <p className="font-semibold text-ink mb-1">Architecture Note: Relational Persistence Model</p>
          <p>
            NexusRAG uses SQLAlchemy 2.0 declarative models with Alembic migrations. SQLite 3 with Write-Ahead Logging (WAL) is the default local development runtime. PostgreSQL 16 Alpine is orchestrated in Docker Compose for production. Uploaded files and FAISS indices persist across container restarts.
          </p>
        </div>
      </section>

      {/* 4. Appearance & Theme Preference (Spec Page 7) */}
      <section className="p-5 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-brand" />
          <h2 className="text-sm font-semibold text-ink">Appearance & Theme Preference</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleThemeChange(false)}
            className={clsx(
              'p-4 rounded-xl border text-left flex flex-col gap-2 transition-all',
              !isDark ? 'border-brand ring-2 ring-brand/20 bg-surface' : 'border-border bg-surface-subtle/50 hover:border-brand/40'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink">Light Theme (Warm Sand)</span>
              {!isDark && <CheckCircle2 className="w-4 h-4 text-brand" />}
            </div>
            <p className="text-[11px] text-ink-muted leading-relaxed">
              Warm sand canvas with crisp white surfaces, deep charcoal ink, and burnished terracotta accent.
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleThemeChange(true)}
            className={clsx(
              'p-4 rounded-xl border text-left flex flex-col gap-2 transition-all',
              isDark ? 'border-brand ring-2 ring-brand/20 bg-surface' : 'border-border bg-surface-subtle/50 hover:border-brand/40'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink">Dark Theme (Obsidian Slate)</span>
              {isDark && <CheckCircle2 className="w-4 h-4 text-brand" />}
            </div>
            <p className="text-[11px] text-ink-muted leading-relaxed">
              Deep slate graphite canvas with elevated obsidian panels, soft bone typography, and copper ochre accent.
            </p>
          </button>
        </div>
      </section>

      {/* 5. Session & Workspace Privacy */}
      <section className="p-5 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand" />
            <h2 className="text-sm font-semibold text-ink">Session Isolation & Privacy</h2>
          </div>
          <span className="text-[11px] text-status-success font-medium flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Session Scoped</span>
          </span>
        </div>

        <div className="flex flex-col gap-2 text-xs">
          <div className="p-3 rounded-lg bg-surface-subtle border border-border flex items-center justify-between">
            <div>
              <span className="text-ink-muted block text-[10px] uppercase font-medium">Session Status</span>
              <span className="text-ink font-semibold">
                {workspaceData ? 'Active Isolated Visitor Session' : 'Initializing...'}
              </span>
            </div>
            <span className="text-[11px] font-mono text-ink-muted">7-Day Rolling Retention</span>
          </div>

          <p className="text-ink-muted text-xs leading-relaxed pt-1">
            Workspace data is scoped via HttpOnly, Secure, SameSite=Lax session cookies (<code className="font-mono text-ink">nexus_session</code>) and validated with double-submit CSRF tokens (<code className="font-mono text-ink">X-CSRF-Token</code>). Documents, vector embeddings, and research conversations are partitioned per session.
          </p>
        </div>
      </section>

      {/* 6. Workspace Usage, Quotas & Sign-In Architecture */}
      <section className="p-5 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-brand" />
            <h2 className="text-sm font-semibold text-ink">Workspace Quotas & Retention Policy</h2>
          </div>
          <span className="text-[11px] font-mono text-ink-muted">
            Strict Capacity Bounds
          </span>
        </div>

        {/* Real Metrics Grid (Zero Static Data) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-surface-subtle border border-border flex flex-col gap-1">
            <span className="text-ink-muted text-[10px] uppercase font-sans font-medium">Document Capacity</span>
            <span className="text-ink font-bold text-sm">{docsList.length} / 100 files</span>
            <span className="text-ink-muted text-[10px]">25MB maximum per file</span>
          </div>

          <div className="p-3 rounded-lg bg-surface-subtle border border-border flex flex-col gap-1">
            <span className="text-ink-muted text-[10px] uppercase font-sans font-medium">Physical Storage</span>
            <span className="text-ink font-bold text-sm">{totalStorageMB} MB / 250 MB</span>
            <span className="text-ink-muted text-[10px]">Indexed PDF, MD & TXT files</span>
          </div>

          <div className="p-3 rounded-lg bg-surface-subtle border border-border flex flex-col gap-1">
            <span className="text-ink-muted text-[10px] uppercase font-sans font-medium">Active Research Sessions</span>
            <span className="text-ink font-bold text-sm">{sessionsList.length} sessions</span>
            <span className="text-ink-muted text-[10px]">Multi-turn synthesis threads</span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-surface-subtle border border-border text-xs leading-relaxed text-ink-muted space-y-2">
          <div>
            <p className="font-semibold text-ink">Session Lifespan & Cookie Loss Explanation</p>
            <p className="font-serif">
              NexusRAG prioritizes zero-friction privacy: no marketing cookies, third-party tracking, or mandatory user accounts. All documents, collections, and conversation history are anchored to your private session cookie. If you clear your browser cookies or change browsers, a new isolated workspace is generated. Use "Export Workspace JSON" below at any time to preserve your workspace.
            </p>
          </div>
          <div className="pt-2 border-t border-border/60">
            <p className="font-semibold text-ink">Optional Multi-Device & Enterprise Sign-In Roadmap</p>
            <p className="font-serif">
              For teams requiring multi-device synchronization and permanent user profiles, NexusRAG's data layer supports optional OAuth2 / OIDC authentication providers without altering the underlying vector store or LangGraph execution engine.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Data Management & Portability */}
      <section className="p-5 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold text-ink">Data Portability & Purge Actions</h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Export all ingested document metadata and conversation history, or permanently wipe your workspace.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportData}
          >
            Export Workspace JSON
          </Button>

          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={() => setIsPurgeModalOpen(true)}
          >
            Purge All Workspace Data
          </Button>
        </div>
      </section>

      {/* Purge Confirmation Modal */}
      <Modal
        isOpen={isPurgeModalOpen}
        onClose={() => setIsPurgeModalOpen(false)}
        title="Purge All Workspace Data"
      >
        <div className="flex flex-col gap-4 text-xs">
          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-status-error/10 border border-status-error/30 text-status-error">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Irreversible Action</p>
              <p className="mt-1 leading-relaxed text-xs">
                This will permanently delete all uploaded files from physical storage, remove all chunk vectors from the FAISS index, delete all research sessions and messages, and reset your workspace session cookie.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setIsPurgeModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={purgeMutation.isPending}
              onClick={handleConfirmPurge}
            >
              Confirm and Purge Everything
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
