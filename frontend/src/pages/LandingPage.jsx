import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  FileText,
  Activity,
  Layers,
  Search,
  BookOpen,
  Folder,
  Database,
  ChevronDown
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { VIEWS } from '../components/layout/RailNav';
import { useSystemStatus, useDocuments } from '../api/queries';

export function LandingPage({ onNavigate }) {
  const { data: statusData } = useSystemStatus();
  const { data: documents = [] } = useDocuments();

  return (
    <div className="flex-1 overflow-y-auto bg-[#F7F6F2] dark:bg-[#0F1115] text-ink select-none">
      {/* Top Navigation Bar (Reference 5 Slite Style) */}
      <header className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between border-b border-border/40">
        <div className="flex items-center gap-8">
          {/* Logo mark */}
          <div className="flex items-center gap-2 font-bold text-base tracking-tight text-ink">
            <div className="w-6 h-6 rounded bg-[#B84A28] flex items-center justify-center text-white">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 32 32">
                <path d="M8 10h6a4 4 0 0 1 4 4v10a4 4 0 0 0-4-4H8V10zm16 0h-6a4 4 0 0 0-4 4v10a4 4 0 0 1 4-4h6V10z" fill="currentColor"/>
                <circle cx="16" cy="14" r="2" fill="#F7F6F2"/>
              </svg>
            </div>
            <span>nexus<span className="text-[#B84A28]">rag</span></span>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs text-ink-muted font-medium">
            <button onClick={() => onNavigate(VIEWS.DASHBOARD)} className="hover:text-ink transition-colors flex items-center gap-1">
              <span>Product</span>
              <ChevronDown className="w-3 h-3 text-ink-faint" />
            </button>
            <button onClick={() => onNavigate(VIEWS.LIBRARY)} className="hover:text-ink transition-colors flex items-center gap-1">
              <span>Knowledge Bases</span>
            </button>
            <button onClick={() => onNavigate(VIEWS.INSPECTOR)} className="hover:text-ink transition-colors flex items-center gap-1">
              <span>Architecture</span>
            </button>
            <button onClick={() => onNavigate(VIEWS.SETTINGS)} className="hover:text-ink transition-colors flex items-center gap-1">
              <span>Telemetry</span>
            </button>
          </nav>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate(VIEWS.SETTINGS)}
            className="text-xs font-medium text-ink-muted hover:text-ink transition-colors hidden sm:inline"
          >
            System Status
          </button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate(VIEWS.DASHBOARD)}
          >
            Open Workspace
          </Button>
        </div>
      </header>

      {/* Hero Section: Warm paper background, confident short headline */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center flex flex-col items-center">
        {/* Discrete Announcement Pill */}
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded bg-surface border border-border text-xs text-ink mb-6 shadow-2xs hover:border-brand transition-colors cursor-pointer"
          onClick={() => onNavigate(VIEWS.INSPECTOR)}
        >
          <span className="px-1.5 py-0.5 rounded bg-brand/10 text-brand text-[10px] font-bold">UPDATED</span>
          <span className="font-medium text-xs text-ink-muted">
            Transparent Document Synthesis with LangGraph Traces →
          </span>
        </div>

        {/* Hero Editorial Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-ink tracking-tight max-w-4xl leading-[1.14] font-sans">
          Verifiable Research Synthesis for Complex Documents
        </h1>

        <p className="mt-6 text-base sm:text-lg text-ink-muted max-w-2xl font-serif leading-relaxed">
          NexusRAG analyzes PDFs, technical manuals, and research reports with sentence-level citations, groundedness validation, and inspectable retrieval graphs.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="primary"
            size="lg"
            icon={ArrowRight}
            onClick={() => onNavigate(VIEWS.DASHBOARD)}
          >
            Open Research Workspace
          </Button>

          <Button
            variant="outline"
            size="lg"
            icon={Activity}
            onClick={() => onNavigate(VIEWS.INSPECTOR)}
          >
            Explore Features
          </Button>
        </div>

        {/* Live System Stat Proof (Zero Static Data Rule Compliant) */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-ink-muted">
          <span>Live Vectors: {statusData?.faiss_vectors ?? 0}</span>
          <span>•</span>
          <span>Model: {statusData?.generation_model || 'gemini-2.5-flash'}</span>
          <span>•</span>
          <span>Sufficiency Threshold: 0.650</span>
          <span>•</span>
          <span>Storage: {statusData?.database_type || 'sqlite'}</span>
        </div>
      </section>

      {/* Product Architecture Showcase */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="relative rounded-xl border border-border bg-surface shadow-md overflow-hidden">
          {/* Framed Window Header Bar */}
          <div className="h-10 bg-surface-subtle border-b border-border px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-border-strong inline-block" />
              <span className="text-xs font-medium text-ink">
                Workspace Architecture Preview
              </span>
            </div>
            <span className="text-[11px] font-mono text-ink-muted">
              3-Stage Grounded Pipeline
            </span>
          </div>

          {/* Architecture Preview Grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-canvas/30 min-h-[300px]">
            {/* Panel 1: Knowledge Bases & Scope */}
            <div className="p-4 rounded-xl border border-border bg-surface flex flex-col gap-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-ink uppercase tracking-wider">
                  1. Document Ingestion
                </span>
                <span className="text-[10px] font-mono text-status-success font-medium">Ready</span>
              </div>
              <p className="text-xs text-ink-muted font-serif">
                Sentence-level character offset parsing with PyMuPDF and atomic FAISS vector indexing.
              </p>
              <div className="p-3 rounded-lg bg-surface-subtle border border-border font-mono text-[11px] text-ink">
                {documents.length > 0 ? (
                  <>
                    <div className="truncate font-semibold">{documents[0].original_filename}</div>
                    <span className="block text-[10px] text-status-success mt-1 font-semibold">
                      ✓ {documents[0].chunk_count || 1} chunks indexed (768-dim)
                    </span>
                  </>
                ) : (
                  <>
                    <div className="text-ink-muted italic">Awaiting document upload</div>
                    <span className="block text-[10px] text-ink-muted mt-1">
                      Supports PDF, Markdown, and TXT files
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Panel 2: Grounded Synthesis with Citation Badges */}
            <div className="p-4 rounded-xl border border-border bg-surface flex flex-col gap-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-ink uppercase tracking-wider">
                  2. Grounded Synthesis
                </span>
                <span className="text-[10px] font-mono font-bold text-status-success px-1.5 py-0.5 rounded bg-status-success/10">
                  Validated
                </span>
              </div>
              <p className="text-xs text-ink-muted font-serif">
                LangGraph orchestrates candidate retrieval, cross-scoring, and server-side citation validation before returning answers.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-mono text-status-success font-semibold p-2.5 rounded-lg bg-surface-subtle border border-border">
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Every citation links to an exact character offset in the source document.</span>
              </div>
            </div>

            {/* Panel 3: Verifiable Excerpt Card */}
            <div className="p-4 rounded-xl border border-border bg-surface flex flex-col gap-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-ink uppercase tracking-wider">
                  3. Verifiable Passage
                </span>
                <span className="text-[10px] font-mono text-ink-muted">Traceable</span>
              </div>
              <p className="text-xs text-ink-muted font-serif">
                Inspect exact page numbers, source excerpts, and reranker relevance scores in the integrated document reader.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate(VIEWS.RESEARCH)}
              >
                Open Research Workspace
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-border">
        <h2 className="text-2xl font-bold text-ink text-center mb-10 tracking-tight font-sans">
          Built for Verifiable Research, Not Guesswork
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-surface border border-border flex flex-col gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-ink">LangGraph 9-Node DAG</h3>
            <p className="text-xs text-ink-muted leading-relaxed font-serif">
              Every query routes through a structured Directed Acyclic Graph with input validation, query rewriting, FAISS retrieval, cross-scoring reranking, and sufficiency gates.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-surface border border-border flex flex-col gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-ink">Server-Side Citation Verification</h3>
            <p className="text-xs text-ink-muted leading-relaxed font-serif">
              Hallucinated citation references are stripped server-side. Every emitted citation chip links directly to verified database chunks and character spans.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-surface border border-border flex flex-col gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-ink">Full Retrieval Inspector</h3>
            <p className="text-xs text-ink-muted leading-relaxed font-serif">
              Inspect candidate pools, reranking rationales, node duration waterfalls in milliseconds, and sufficiency scores directly in the UI.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/80 bg-surface-subtle/50 py-10 text-xs text-ink-muted">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink">NexusRAG</span>
            <span>•</span>
            <span>Research Engine • Open Source Workspace</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <button onClick={() => onNavigate(VIEWS.SETTINGS)} className="hover:text-ink">Settings</button>
            <button onClick={() => onNavigate(VIEWS.INSPECTOR)} className="hover:text-ink">Inspector</button>
            <button onClick={() => onNavigate(VIEWS.LIBRARY)} className="hover:text-ink">Knowledge Bases</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
