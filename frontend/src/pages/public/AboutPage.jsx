import React from 'react';
import { PublicHeader } from '../../components/public/PublicHeader';
import { PublicFooter } from '../../components/public/PublicFooter';
import { VIEWS } from '../../components/layout/RailNav';
import { Button } from '../../components/common/Button';
import { ArrowRight, BookOpen, Compass, CheckCircle2, Shield } from 'lucide-react';

export function AboutPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-canvas text-ink font-sans flex flex-col">
      <PublicHeader currentView={VIEWS.ABOUT} onNavigate={onNavigate} />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full flex flex-col gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand/10 text-brand uppercase font-mono">
              About
            </span>
            <span className="text-xs text-ink-muted">• Mission & Philosophy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink font-sans">
            Verifiable Document Intelligence
          </h1>
          <p className="mt-2 text-sm sm:text-base text-ink-muted font-serif max-w-2xl leading-relaxed">
            NexusRAG was conceived to replace black-box chatbots with verifiable, source-anchored research workflows.
          </p>
        </div>

        {/* Narrative Section */}
        <section className="p-6 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-4 text-xs leading-relaxed text-ink">
          <h2 className="text-sm font-semibold text-ink">The Problem: Unverifiable Generative Answers</h2>
          <p className="text-ink-muted font-serif text-sm">
            Standard conversational AI systems produce fluent, persuasive answers that frequently hallucinate facts, invent statistics, or misattribute source material. In mission-critical research - such as technical auditing, legal analysis, or financial due diligence - an unverifiable answer is worse than no answer at all.
          </p>

          <h2 className="text-sm font-semibold text-ink pt-2">Our Solution: Groundedness by Architecture</h2>
          <p className="text-ink-muted font-serif text-sm">
            NexusRAG enforces transparency at every tier:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-ink-muted">
            <li>
              <strong className="text-ink">Sentence-Level Citation Mapping:</strong> Every assertion links to character offsets in the original PDF, allowing single-click verification.
            </li>
            <li>
              <strong className="text-ink">Calibrated Evidence Gating:</strong> If retrieved documents lack sufficient evidence ($&lt;0.650$), the system abstains rather than inventing plausible text.
            </li>
            <li>
              <strong className="text-ink">Inspectable Retrieval DAG:</strong> Every step of the 9-node LangGraph pipeline is captured, allowing full forensic review of rewritten queries, similarity scores, and execution durations.
            </li>
          </ul>
        </section>

        {/* Call to action */}
        <div className="p-6 rounded-xl bg-surface-subtle border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-ink">Explore the Open Source Workspace</h3>
            <p className="text-xs text-ink-muted font-serif mt-0.5">
              NexusRAG is freely available for evaluation and research synthesis.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={ArrowRight}
            onClick={() => onNavigate(VIEWS.DASHBOARD)}
          >
            Launch Research Workspace
          </Button>
        </div>
      </main>

      <PublicFooter onNavigate={onNavigate} />
    </div>
  );
}

