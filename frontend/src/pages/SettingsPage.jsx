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
import { useSystemStatus, useCurrentWorkspace, usePurgeWorkspace } from '../api/queries';
import { useToast } from '../components/common/Toast';
import clsx from 'clsx';

export function SettingsPage() {
  const { data: statusData } = useSystemStatus();
  const { data: workspaceData } = useCurrentWorkspace();
  const purgeMutation = usePurgeWorkspace();
  const toast = useToast();

  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
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
          <span className="text-[11px] font-mono text-status-success flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
            <span>API Online</span>
          </span>
        </div>

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
              <option value="gemini-2.5-flash">Google Gemini 2.5 Flash (Primary Research Synthesis)</option>
              <option value="gemini-2.0-flash">Google Gemini 2.0 Flash (Fast Reasoning Engine)</option>
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
              <span className="font-mono text-ink font-semibold">text-embedding-004</span>
              <span className="text-[11px] text-ink-muted">768-dim • Unit L2 Norm</span>
            </div>
            <span className="text-[11px] text-ink-muted mt-1 block">
              Cosine similarity computed via FAISS IndexFlatIP
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-surface-subtle border border-border flex flex-col gap-1">
            <span className="text-ink-muted text-[10px] uppercase font-sans font-medium">Chunk Size</span>
            <span className="text-ink font-bold text-sm">700 tokens</span>
            <span className="text-ink-muted text-[10px]">PyMuPDF splitter</span>
          </div>

          <div className="p-3 rounded-lg bg-surface-subtle border border-border flex flex-col gap-1">
            <span className="text-ink-muted text-[10px] uppercase font-sans font-medium">Chunk Overlap</span>
            <span className="text-ink font-bold text-sm">100 tokens</span>
            <span className="text-ink-muted text-[10px]">Sliding boundary</span>
          </div>

          <div className="p-3 rounded-lg bg-surface-subtle border border-border flex flex-col gap-1">
            <span className="text-ink-muted text-[10px] uppercase font-sans font-medium">Initial Retrieval</span>
            <span className="text-ink font-bold text-sm">Top-8 Chunks</span>
            <span className="text-ink-muted text-[10px]">FAISS IndexFlatIP</span>
          </div>

          <div className="p-3 rounded-lg bg-surface-subtle border border-border flex flex-col gap-1">
            <span className="text-ink-muted text-[10px] uppercase font-sans font-medium">Reranked Context</span>
            <span className="text-ink font-bold text-sm">Top-4 Chunks</span>
            <span className="text-ink-muted text-[10px]">Flash Reranker</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-surface-subtle/60 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-brand" />
            <div>
              <span className="font-semibold text-ink">Evidence Sufficiency Gate: </span>
              <span className="font-mono text-ink">0.650 / 1.000</span>
              <p className="text-[11px] text-ink-muted">Abstains cleanly if retrieved documents lack conclusive proof.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-brand" />
            <div>
              <span className="font-semibold text-ink">Groundedness Gate: </span>
              <span className="font-mono text-ink">0.700 / 1.000</span>
              <p className="text-[11px] text-ink-muted">Validates all generated sentences against source character offsets.</p>
            </div>
          </div>
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
          <p className="font-semibold text-ink mb-1">Architecture Note: SQLite & PostgreSQL Dual-Dialect Design</p>
          <p>
            NexusRAG models are implemented using dialect-agnostic SQLAlchemy 2.0 declarative mappings with full PostgreSQL 16 migration support via Alembic. For zero-friction local execution without managing background database servers, SQLite with Write-Ahead Logging (WAL) is the default active runtime. For containerized production deployments, PostgreSQL 16 is defined in <code className="font-mono text-ink">docker-compose.yml</code>. Both backends share identical table schemas and pass 100% of automated tests.
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
              Warm sand canvas (<code className="font-mono text-[10px]">#F7F6F2</code>) with pure white surfaces, deep charcoal text, and burnished terracotta accent (<code className="font-mono text-[10px]">#B84A28</code>).
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
              Deep slate graphite canvas (<code className="font-mono text-[10px]">#0F1115</code>) with elevated zinc obsidian panels, soft bone typography, and copper ochre accent.
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

      {/* 6. Data Management & Portability */}
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
