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
  ExternalLink
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { VIEWS } from '../components/layout/RailNav';
import { useSystemStatus } from '../api/queries';

export function LandingPage({ onNavigate }) {
  const { data: statusData } = useSystemStatus();

  return (
    <div className="flex-1 overflow-y-auto bg-canvas">
      {/* Hero Section: Warm paper background, confident short headline */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center flex flex-col items-center">
        {/* Discrete Architecture Indicator */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-surface border border-border text-xs text-ink mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-brand" />
          <span className="font-mono">LangGraph DAG • FAISS IndexIDMap2 • Server-Side Citations</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-semibold text-ink tracking-tight max-w-3xl leading-[1.15]">
          Ask your documents. <br />
          <span className="text-brand">See the passage that answers.</span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-ink-muted max-w-2xl font-serif leading-relaxed">
          NexusRAG is a reference-driven document research workspace. Every claim is strictly grounded
          in retrieved passages, verified against hallucinations, and inspectable through an execution trace timeline.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex items-center gap-3">
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
            Explore Retrieval Inspector
          </Button>
        </div>

        {/* Live System Stat Proof (Zero Static Data) */}
        <div className="mt-6 flex items-center gap-4 text-xs font-mono text-ink-muted">
          <span>Live Index: {statusData?.faiss_vectors ?? 0} vectors</span>
          <span>•</span>
          <span>Storage: {statusData?.database_type || 'sqlite'}</span>
          <span>•</span>
          <span>Status: {statusData?.status === 'healthy' ? 'Active' : 'Standby'}</span>
        </div>
      </section>

      {/* Product Proof Frame: Visual Interface Demonstration */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="rounded-md border border-border bg-surface shadow-md overflow-hidden">
          {/* Framed Window Header */}
          <div className="h-9 bg-surface-subtle border-b border-border px-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-border-strong inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-border inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-border inline-block" />
            </div>
            <span className="text-xs font-mono text-ink-muted">NexusRAG — 3-Panel Research Desk Preview</span>
            <div className="w-10" />
          </div>

          {/* Interactive Proof Preview */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-canvas/40">
            {/* Left Column: Scope & Library */}
            <div className="p-4 rounded border border-border bg-surface flex flex-col gap-3">
              <span className="text-[11px] font-semibold text-ink uppercase tracking-wide">
                1. Ingestion & Scoping
              </span>
              <p className="text-xs text-ink-muted">
                Parse PDFs with PyMuPDF, preserve sentence and page boundaries, and index vectors via FAISS FlatIP.
              </p>
              <div className="p-2.5 rounded bg-surface-subtle border border-border font-mono text-[11px] text-ink">
                annual_report_2024.pdf
                <span className="block text-[10px] text-status-success mt-0.5">• Indexed (12 chunks)</span>
              </div>
            </div>

            {/* Center Column: Grounded Answer Stream */}
            <div className="p-4 rounded border border-border bg-surface flex flex-col gap-3">
              <span className="text-[11px] font-semibold text-ink uppercase tracking-wide">
                2. Grounded Synthesis
              </span>
              <p className="font-serif text-xs text-ink leading-relaxed">
                "Cloud infrastructure division generated $120 million in profit <span className="bg-citation/20 text-citation px-1 rounded font-mono text-[10px] font-bold">[1]</span>, representing a 14% year-over-year revenue expansion <span className="bg-citation/20 text-citation px-1 rounded font-mono text-[10px] font-bold">[2]</span>."
              </p>
              <div className="flex items-center gap-2 text-[10px] font-mono text-status-success">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Groundedness: 0.94 / 1.00</span>
              </div>
            </div>

            {/* Right Column: Evidence & Inspector */}
            <div className="p-4 rounded border border-border bg-surface flex flex-col gap-3">
              <span className="text-[11px] font-semibold text-ink uppercase tracking-wide">
                3. Verifiable Passage
              </span>
              <div className="p-2.5 rounded bg-citation/10 border border-citation/30 font-serif text-[11px] text-ink italic leading-relaxed">
                "[Source 1, Page 12] Total operating profit for the infrastructure unit closed at $120.4M..."
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
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="max-w-5xl mx-auto px-6 py-12 border-t border-border">
        <h2 className="text-xl font-semibold text-ink text-center mb-8">
          Built for Verifiable Research, Not Guesswork
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded bg-surface border border-border flex flex-col gap-2">
            <Layers className="w-5 h-5 text-brand" />
            <h3 className="text-sm font-semibold text-ink">LangGraph 9-Node DAG</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Every query routes through a deterministic Directed Acyclic Graph with input validation, query contextualization, FAISS retrieval, cross-scoring reranker, and sufficiency gates.
            </p>
          </div>

          <div className="p-5 rounded bg-surface border border-border flex flex-col gap-2">
            <ShieldCheck className="w-5 h-5 text-brand" />
            <h3 className="text-sm font-semibold text-ink">Server-Side Citation Strip</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Hallucinated citation numbers are stripped server-side. Every emitted citation chip links deterministically to the exact database chunk and page offset.
            </p>
          </div>

          <div className="p-5 rounded bg-surface border border-border flex flex-col gap-2">
            <Activity className="w-5 h-5 text-brand" />
            <h3 className="text-sm font-semibold text-ink">Full Retrieval Inspector</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Inspect candidate pools, reranking rationales, node duration waterfalls in milliseconds, and sufficiency scores directly in the UI.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

