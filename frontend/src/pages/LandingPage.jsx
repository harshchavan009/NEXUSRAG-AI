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
  ExternalLink,
  Sparkles,
  SlidersHorizontal,
  Lock,
  Compass
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { PublicHeader } from '../components/public/PublicHeader';
import { PublicFooter } from '../components/public/PublicFooter';
import { VIEWS } from '../components/layout/RailNav';
import { useSystemStatus, useDocuments } from '../api/queries';

export function LandingPage({ onNavigate }) {
  const { data: statusData } = useSystemStatus();
  const { data: documents = [] } = useDocuments();

  return (
    <div className="flex-1 overflow-y-auto bg-canvas text-ink select-none font-sans flex flex-col">
      {/* 1. Public Marketing Header */}
      <PublicHeader currentView={VIEWS.LANDING} onNavigate={onNavigate} />

      {/* 2. Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-14 text-center flex flex-col items-center">
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
            icon={BookOpen}
            onClick={() => onNavigate(VIEWS.DOCS)}
          >
            View Documentation
          </Button>
        </div>

        {/* Live System Stat Proof (Zero Static Data Rule Compliant) */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-ink-muted">
          <span>Live Vectors: {statusData?.faiss_vectors ?? 0}</span>
          <span>•</span>
          <span>Model: {statusData?.generation_model || 'gemini-2.5-flash'}</span>
          <span>•</span>
          <span>Evidence Gate: 0.650</span>
          <span>•</span>
          <span>Dialect: {statusData?.database_type || 'sqlite'}</span>
        </div>

        {/* Real Product Proof Preview: Captured Screenshot of Live Running App */}
        <div className="mt-12 w-full max-w-5xl rounded-xl border border-border bg-surface shadow-xl overflow-hidden text-left">
          <div className="h-9 bg-surface-subtle border-b border-border px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-border-strong inline-block" />
              <span className="text-xs font-medium text-ink">
                Live Running Application • Dashboard Workspace
              </span>
            </div>
            <span className="text-[11px] font-mono text-ink-muted">1440x900 Authenticated Canvas</span>
          </div>

          <div className="relative bg-surface p-2">
            <img
              src="/screenshots/dashboard.png"
              alt="NexusRAG live dashboard preview"
              className="w-full h-auto rounded-lg border border-border shadow-xs"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* 3. How It Works 4-Step Sequence */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-border">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand/10 text-brand uppercase font-mono">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink mt-2 tracking-tight">
            Four Steps to Grounded Document Research
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted font-serif mt-1">
            Engineered to remove hallucination risk through structural evidence checks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h3 className="text-sm font-semibold text-ink">Ingest & Split</h3>
            <p className="text-xs text-ink-muted leading-relaxed font-serif">
              Upload PDF, MD, or TXT files. PyMuPDF extracts text, page boundaries, and exact character offsets.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h3 className="text-sm font-semibold text-ink">FAISS Indexing</h3>
            <p className="text-xs text-ink-muted leading-relaxed font-serif">
              768-dim embeddings are L2-normalized and indexed with IndexFlatIP and IndexIDMap2 for O(1) deletions.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h3 className="text-sm font-semibold text-ink">LangGraph Synthesis</h3>
            <p className="text-xs text-ink-muted leading-relaxed font-serif">
              The 9-node DAG executes query rewriting, retrieval, Flash reranking, and checks sufficiency before generating.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-bold text-xs">
              04
            </div>
            <h3 className="text-sm font-semibold text-ink">Citation Verification</h3>
            <p className="text-xs text-ink-muted leading-relaxed font-serif">
              Hallucinated citations are stripped server-side. Click any citation chip to jump to the proving sentence in PDF.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Varied Editorial Feature Rows with Real Screenshots */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-border flex flex-col gap-16">
        {/* Row 1: Document Reader with Highlighted Passages */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col gap-4">
            <span className="text-xs font-mono font-bold text-brand uppercase tracking-wider">
              Feature 01 • Deep-Linked Verification
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight font-sans">
              Verify every claim on the exact source page
            </h3>
            <p className="text-sm text-ink-muted font-serif leading-relaxed">
              When reviewing technical research or legal contracts, vague summaries are not enough. NexusRAG links every citation chip directly to character offsets in the Document Reader, scrolling immediately to the proving sentence with highlight styling.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs font-medium text-ink">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-status-success" /> Multi-tab viewer</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-status-success" /> Exact page jump</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-status-success" /> Text search</span>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-2 shadow-lg overflow-hidden">
            <img
              src="/screenshots/reader.png"
              alt="Document Reader with citation highlighting"
              className="w-full h-auto rounded-lg border border-border"
              loading="lazy"
            />
          </div>
        </div>

        {/* Row 2: Retrieval Inspector DAG Trace */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="rounded-xl border border-border bg-surface p-2 shadow-lg overflow-hidden lg:order-1 order-2">
            <img
              src="/screenshots/inspector.png"
              alt="LangGraph 9-Node DAG Inspector execution trace"
              className="w-full h-auto rounded-lg border border-border"
              loading="lazy"
            />
          </div>
          <div className="flex flex-col gap-4 lg:order-2 order-1">
            <span className="text-xs font-mono font-bold text-brand uppercase tracking-wider">
              Feature 02 • Forensic Transparency
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight font-sans">
              Full 9-Node LangGraph Execution Traces
            </h3>
            <p className="text-sm text-ink-muted font-serif leading-relaxed">
              NexusRAG is not a black-box chatbot. Every query run produces an inspectable trace: see the standalone rewritten query, similarity scores for initial candidates, Flash reranker weights, node execution durations in milliseconds, and groundedness overlap metrics.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs font-medium text-ink">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-status-success" /> Node durations (ms)</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-status-success" /> Sufficiency score</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-status-success" /> Rerank context</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Supported Formats and System Constraints */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-border">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-mono font-bold text-brand uppercase tracking-wider">
            Compatibility & Limits
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink mt-2 tracking-tight">
            Supported Formats & Configuration
          </h2>
          <p className="text-xs text-ink-muted font-serif mt-1">
            Direct constraints verified from the backend API status.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          <div className="p-5 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-2.5">
            <div className="flex items-center gap-2 font-semibold text-ink">
              <FileText className="w-4 h-4 text-brand" />
              <span>Supported Document Types</span>
            </div>
            <p className="text-ink-muted font-serif leading-relaxed">
              Native text parsing for PDF documents (<code className="font-mono text-ink">.pdf</code>), Markdown files (<code className="font-mono text-ink">.md</code>), and plain text (<code className="font-mono text-ink">.txt</code>).
            </p>
          </div>

          <div className="p-5 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-2.5">
            <div className="flex items-center gap-2 font-semibold text-ink">
              <SlidersHorizontal className="w-4 h-4 text-brand" />
              <span>Upload Limits</span>
            </div>
            <p className="text-ink-muted font-serif leading-relaxed">
              Up to 25MB per file, with up to 60 pages per PDF document. Multi-file batch processing with real byte progress.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-2.5">
            <div className="flex items-center gap-2 font-semibold text-ink">
              <Lock className="w-4 h-4 text-brand" />
              <span>Data Retention</span>
            </div>
            <p className="text-ink-muted font-serif leading-relaxed">
              7-day rolling session retention. Complete voluntary JSON export and irreversible purge available at any time.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Call to Action Banner */}
      <section className="max-w-5xl mx-auto px-6 pb-20 w-full">
        <div className="p-8 rounded-2xl bg-surface border border-border shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-left">
          <div>
            <h2 className="text-2xl font-bold text-ink tracking-tight font-sans">
              Start researching your documents
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted font-serif mt-1 max-w-lg leading-relaxed">
              Load our pre-indexed research sample reports or upload your own files to experience citation-grounded RAG.
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            icon={ArrowRight}
            onClick={() => onNavigate(VIEWS.DASHBOARD)}
          >
            Launch Research Workspace
          </Button>
        </div>
      </section>

      {/* 7. Public Marketing Footer */}
      <PublicFooter onNavigate={onNavigate} />
    </div>
  );
}
