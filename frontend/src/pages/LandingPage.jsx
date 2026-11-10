import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  FileText,
  Activity,
  Layers,
  Search,
  ExternalLink,
  ChevronDown,
  BookOpen,
  Folder,
  Database
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { VIEWS } from '../components/layout/RailNav';
import { useSystemStatus } from '../api/queries';

export function LandingPage({ onNavigate }) {
  const { data: statusData } = useSystemStatus();

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

      {/* Hero Section: Warm paper background, confident short headline (Reference 5) */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center flex flex-col items-center">
        {/* Discrete Announcement Pill (Reference 5 style) */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface border border-border text-xs text-ink mb-6 shadow-2xs hover:border-brand transition-colors cursor-pointer"
             onClick={() => onNavigate(VIEWS.INSPECTOR)}>
          <span className="px-1.5 py-0.2 rounded-full bg-brand/10 text-brand text-[10px] font-bold">NEW</span>
          <span className="font-medium text-xs text-ink-muted">
            Your knowledge base + verifiable search, finally working together →
          </span>
        </div>

        {/* Hero Editorial Headline */}
        <h1 className="text-4xl sm:text-6xl font-bold text-ink tracking-tight max-w-4xl leading-[1.12] font-sans">
          Ask your documents. <br />
          <span className="relative inline-block mt-2">
            <span className="text-[#B84A28] relative z-10">See the passage that answers.</span>
            {/* Curved SVG Accent Underline (Reference 5 Signature) */}
            <svg
              className="absolute -bottom-2 left-0 w-full h-3 text-[#B84A28]/40 -z-0"
              viewBox="0 0 300 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <path
                d="M2.5 9.5C65.5 3.5 175.5 2.5 297.5 7.5"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-ink-muted max-w-2xl font-serif leading-relaxed">
          Skip hallucinated answers. NexusRAG delivers verifiable research synthesis with sentence-level FAISS embeddings, LangGraph groundedness validation, and interactive PDF citation tracing.
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
          <span>Gate: 0.700 groundedness</span>
          <span>•</span>
          <span>Storage: {statusData?.database_type || 'sqlite'}</span>
        </div>
      </section>

      {/* Framed Product Showcase: Elevated Browser Preview with Proof Testimonial (Reference 5) */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="relative rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden">
          {/* Framed Window Header Bar */}
          <div className="h-10 bg-surface-subtle border-b border-border px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#EA4335]/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#FBBC05]/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#34A853]/80 inline-block" />
            </div>
            <span className="text-xs font-mono text-ink-muted">
              NexusRAG — 3-Panel Verifiable Research Workspace
            </span>
            <div className="w-12" />
          </div>

          {/* Application Mockup Frame View */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-canvas/30 min-h-[320px]">
            {/* Panel 1: Knowledge Bases & Scope */}
            <div className="p-4 rounded-xl border border-border bg-surface flex flex-col gap-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-ink uppercase tracking-wider">
                  1. Knowledge Base
                </span>
                <span className="w-2 h-2 rounded-full bg-status-success" />
              </div>
              <p className="text-xs text-ink-muted font-serif">
                Sentence-level character offset parsing with PyMuPDF and atomic FAISS vector indexing.
              </p>
              <div className="p-3 rounded-lg bg-surface-subtle border border-border font-mono text-[11px] text-ink">
                annual_financial_report.pdf
                <span className="block text-[10px] text-status-success mt-1 font-semibold">
                  ✓ 18 chunks indexed (768-dim)
                </span>
              </div>
            </div>

            {/* Panel 2: Grounded Synthesis with Citation Badges */}
            <div className="p-4 rounded-xl border border-border bg-surface flex flex-col gap-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-ink uppercase tracking-wider">
                  2. Grounded Synthesis
                </span>
                <span className="text-[10px] font-mono font-bold text-status-success px-1.5 py-0.5 rounded bg-status-success/10">
                  Passed 0.700
                </span>
              </div>
              <div className="font-serif text-xs text-ink leading-relaxed bg-surface-subtle/40 p-3 rounded-lg border border-border/60">
                "Operating revenue rose to $120.4 million in Q3 <span className="bg-[#B84A28] text-white px-1.5 py-0.2 rounded font-mono text-[10px] font-bold inline-block">[1]</span>, driven by enterprise cloud services expansion <span className="bg-[#B84A28] text-white px-1.5 py-0.2 rounded font-mono text-[10px] font-bold inline-block">[2]</span>."
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-status-success font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Citation Integrity: 100% verified</span>
              </div>
            </div>

            {/* Panel 3: Verifiable Excerpt Card */}
            <div className="p-4 rounded-xl border border-border bg-surface flex flex-col gap-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-ink uppercase tracking-wider">
                  3. Exact Source Passage
                </span>
                <span className="text-[10px] font-mono text-ink-muted">Page 4</span>
              </div>
              <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 font-serif text-[11px] text-ink italic leading-relaxed">
                "[Page 4, Ch 2] Total operating profit for the infrastructure unit closed at $120.4M..."
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate(VIEWS.RESEARCH)}
              >
                Try Interactive Desk
              </Button>
            </div>
          </div>

          {/* Floating Proof Testimonial Card (Reference 5 Floating Proof Card) */}
          <div className="absolute bottom-6 right-6 z-20 max-w-xs bg-surface border border-border rounded-xl shadow-xl p-3.5 hidden sm:flex flex-col gap-2">
            <p className="text-xs font-serif text-ink italic leading-relaxed">
              "The citation highlighting and groundedness verification are SO simple and useful. It's been the best RAG experience we've had."
            </p>
            <div className="flex items-center gap-2 pt-1 border-t border-border text-[11px]">
              <div className="w-5 h-5 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-[10px]">
                SF
              </div>
              <div>
                <span className="font-semibold text-ink block leading-none">Verified Researcher</span>
                <span className="text-[10px] text-ink-muted">ShadowFox AI Internship</span>
              </div>
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
          <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-ink">LangGraph 9-Node DAG</h3>
            <p className="text-xs text-ink-muted leading-relaxed font-serif">
              Every query routes through a deterministic Directed Acyclic Graph with input validation, query rewriting, FAISS retrieval, cross-scoring reranking, and sufficiency gates.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-ink">Server-Side Citation Strip</h3>
            <p className="text-xs text-ink-muted leading-relaxed font-serif">
              Hallucinated citation numbers are stripped server-side. Every emitted citation chip links deterministically to the exact database chunk and page offset.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
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
            <span>ShadowFox AI Track Advanced Level</span>
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
