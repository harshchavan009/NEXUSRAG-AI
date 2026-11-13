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
        {/* Hero Editorial Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-ink tracking-tight max-w-4xl leading-[1.14] font-sans">
          Verifiable Research Synthesis for Complex Documents
        </h1>

        <p className="mt-6 text-base sm:text-lg text-ink-muted max-w-2xl font-serif leading-relaxed">
          NexusRAG analyzes PDFs, Markdown files, and plain text documents with sentence-level citations, verified evidence checks, and complete retrieval transparency.
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
            icon={Sparkles}
            onClick={() => onNavigate(VIEWS.RESEARCH)}
          >
            Try Sample Research
          </Button>
        </div>

        {/* Real Product Proof Preview: Captured Screenshot of Live Running App */}
        <div className="mt-12 w-full max-w-5xl rounded-xl border border-border bg-surface shadow-xl overflow-hidden text-left">
          <div className="h-9 bg-surface-subtle border-b border-border px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-border-strong inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-border-strong/60 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-border-strong/40 inline-block" />
              <span className="text-xs font-mono text-ink-muted ml-2">
                nexusrag.app/dashboard
              </span>
            </div>
            <span className="text-[11px] font-sans text-ink-muted">Research Dashboard Preview</span>
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
            Engineered to reduce hallucination risk through structural evidence gates and calibrated abstention.
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
              768-dim embeddings from gemini-embedding-2 are indexed with IndexFlatIP and IndexIDMap2 for ID-mapped vector removal without full index rebuilds.
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
              Feature 01: Passage Highlighting
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
              Feature 02: Pipeline Inspection
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight font-sans">
              Inspect the full 9-node execution path
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

        {/* Row 3: Scoped Multi-Document Research Desk */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col gap-4">
            <span className="text-xs font-mono font-bold text-brand uppercase tracking-wider">
              Feature 03: Scoped Retrieval
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight font-sans">
              Search across individual files or entire collections
            </h3>
            <p className="text-sm text-ink-muted font-serif leading-relaxed">
              Target inquiries across individual files, collections, or entire knowledge bases. NexusRAG generates suggested inquiries directly from your uploaded materials, displays inline sentence-level citations with similarity confidence, and provides one-click exports.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs font-medium text-ink">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-status-success" /> Scope filters</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-status-success" /> Sentence-level chips</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-status-success" /> Markdown export</span>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-2 shadow-lg overflow-hidden">
            <img
              src="/screenshots/research.png"
              alt="Research Desk with scoped synthesis and interactive citations"
              className="w-full h-auto rounded-lg border border-border"
              loading="lazy"
            />
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Card 1: Featured Supported Document Formats */}
          <div className="md:col-span-2 p-6 rounded-xl bg-surface border-2 border-brand/20 shadow-xs flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-brand uppercase tracking-wider">Accepted File Formats</span>
                <span className="text-[10px] font-mono text-ink-muted">Native PyMuPDF & UTF-8 Extractors</span>
              </div>
              <h3 className="text-base font-bold text-ink">Strict Structural Integrity Checks</h3>
              <p className="text-ink-muted font-serif leading-relaxed mt-1">
                Full text extraction and exact character offset mapping for PDF documents (<code className="font-mono text-ink">.pdf</code>), Markdown specifications (<code className="font-mono text-ink">.md</code>, <code className="font-mono text-ink">.markdown</code>), and plain text reports (<code className="font-mono text-ink">.txt</code>). Magic bytes verification prevents extension spoofing.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-red-200 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 font-mono">PDF • PyMuPDF</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 font-mono">MD • Markdown AST</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 font-mono">TXT • Clean UTF-8</span>
            </div>
          </div>

          {/* Column 2: Upload Boundaries & Session Lifespan stacked */}
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-2">
              <div className="flex items-center gap-2 font-semibold text-ink">
                <SlidersHorizontal className="w-4 h-4 text-brand" />
                <span>Upload Boundaries</span>
              </div>
              <p className="text-ink-muted font-serif text-[11px] leading-relaxed">
                25MB cap per file. Up to 60 pages per PDF document. Multi-file batch queue with client-side cancellation.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-2">
              <div className="flex items-center gap-2 font-semibold text-ink">
                <Lock className="w-4 h-4 text-brand" />
                <span>Session Retention</span>
              </div>
              <p className="text-ink-muted font-serif text-[11px] leading-relaxed">
                7-day rolling cookie session. Complete voluntary JSON workspace export and irreversible purge available.
              </p>
            </div>
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
              Load benchmark documents or upload your own files to experience verifiable, citation-grounded research.
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
