import React, { useState } from 'react';
import { PublicHeader } from '../../components/public/PublicHeader';
import { PublicFooter } from '../../components/public/PublicFooter';
import { VIEWS } from '../../components/layout/RailNav';
import {
  BookOpen,
  FileText,
  Search,
  Sparkles,
  Layers,
  Shield,
  SlidersHorizontal,
  Code2,
  Terminal,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import clsx from 'clsx';

export function DocumentationPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('user-guide'); // 'user-guide', 'technical', 'api'

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans flex flex-col">
      <PublicHeader currentView={VIEWS.DOCS} onNavigate={onNavigate} />

      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full flex flex-col gap-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand/10 text-brand uppercase font-mono">
              Documentation
            </span>
            <span className="text-xs text-ink-muted">• Knowledge Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink font-sans">
            NexusRAG User Guides & Architecture
          </h1>
          <p className="mt-2 text-sm sm:text-base text-ink-muted font-serif max-w-2xl leading-relaxed">
            Everything you need to ingest documents, configure retrieval parameters, execute grounded research queries, and inspect LangGraph execution traces.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-border text-xs font-medium">
          <button
            onClick={() => setActiveTab('user-guide')}
            className={clsx(
              'pb-3 px-3 transition-colors border-b-2',
              activeTab === 'user-guide' ? 'border-brand text-brand font-semibold' : 'border-transparent text-ink-muted hover:text-ink'
            )}
          >
            User Guide & Workflow
          </button>
          <button
            onClick={() => setActiveTab('technical')}
            className={clsx(
              'pb-3 px-3 transition-colors border-b-2',
              activeTab === 'technical' ? 'border-brand text-brand font-semibold' : 'border-transparent text-ink-muted hover:text-ink'
            )}
          >
            Technical Architecture & DAG
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={clsx(
              'pb-3 px-3 transition-colors border-b-2',
              activeTab === 'api' ? 'border-brand text-brand font-semibold' : 'border-transparent text-ink-muted hover:text-ink'
            )}
          >
            REST API Reference
          </button>
        </div>

        {/* Tab Content: User Guide */}
        {activeTab === 'user-guide' && (
          <div className="flex flex-col gap-8 text-xs leading-relaxed text-ink">
            {/* Step 1 */}
            <section className="p-6 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-3">
              <div className="flex items-center gap-2 text-brand font-semibold text-sm">
                <span className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center text-xs">1</span>
                <h3>Ingesting Documents & Namespaces</h3>
              </div>
              <p className="text-ink-muted">
                NexusRAG supports PDF files, Markdown files (<code className="font-mono text-ink">.md</code>), and plain text files (<code className="font-mono text-ink">.txt</code>) up to 25MB per document. You can organize documents into domain-isolated Knowledge Base collections (e.g. "Q3 Financials", "Engineering Whitepapers").
              </p>
              <div className="p-3 bg-surface-subtle border border-border rounded-lg text-[11px] text-ink-muted">
                <strong className="text-ink">Quick Onboarding Tip:</strong> Click the "Add Sample Docs" button on the dashboard to ingest 4 authentic verified research papers with a single click.
              </div>
            </section>

            {/* Step 2 */}
            <section className="p-6 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-3">
              <div className="flex items-center gap-2 text-brand font-semibold text-sm">
                <span className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center text-xs">2</span>
                <h3>Querying With Grounded Citations</h3>
              </div>
              <p className="text-ink-muted">
                When you ask a question in the Research Desk, NexusRAG executes a multi-stage retrieval workflow:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-ink-muted">
                <li><strong className="text-ink">Query Rewriting:</strong> Standalone query formulation preserving conversation history.</li>
                <li><strong className="text-ink">Semantic Retrieval:</strong> FAISS searches inner-product normalized vectors (Top-8 chunks).</li>
                <li><strong className="text-ink">Relevance Reranking:</strong> Flash-reranking filters the top 4 most relevant chunks.</li>
                <li><strong className="text-ink">Grounded Synthesis:</strong> The model generates the answer citing exact brackets like <code className="font-mono text-ink">[1]</code>, <code className="font-mono text-ink">[2]</code>.</li>
              </ul>
            </section>

            {/* Step 3 */}
            <section className="p-6 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-3">
              <div className="flex items-center gap-2 text-brand font-semibold text-sm">
                <span className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center text-xs">3</span>
                <h3>Verifying Excerpts in Document Reader</h3>
              </div>
              <p className="text-ink-muted">
                Clicking any citation badge in an answer instantly launches the Document Reader at the exact PDF page, automatically highlighting the passage that proves the claim.
              </p>
            </section>

            {/* Step 4 */}
            <section className="p-6 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-3">
              <div className="flex items-center gap-2 text-brand font-semibold text-sm">
                <span className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center text-xs">4</span>
                <h3>Auditing Runs in Retrieval Inspector</h3>
              </div>
              <p className="text-ink-muted">
                Every query execution is saved as an inspectable trace. The Retrieval Inspector visualizes the full 9-node LangGraph execution timeline, candidate similarity scores, evidence sufficiency gate (<code className="font-mono text-ink">0.650</code>), and groundedness verification score (<code className="font-mono text-ink">0.700</code>).
              </p>
            </section>
          </div>
        )}

        {/* Tab Content: Technical Architecture */}
        {activeTab === 'technical' && (
          <div className="flex flex-col gap-8 text-xs leading-relaxed text-ink">
            <section className="p-6 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-ink">LangGraph 9-Node State Machine</h3>
              <p className="text-ink-muted">
                The core retrieval pipeline is compiled as an agentic LangGraph state machine:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px]">
                <div className="p-3 rounded-lg bg-surface-subtle border border-border">
                  <span className="font-bold text-ink">1. validate_input</span>
                  <p className="text-ink-muted text-[10px] mt-1">Prunes cross-tenant scopes and sanitizes input.</p>
                </div>
                <div className="p-3 rounded-lg bg-surface-subtle border border-border">
                  <span className="font-bold text-ink">2. rewrite_query</span>
                  <p className="text-ink-muted text-[10px] mt-1">Extracts standalone question from context.</p>
                </div>
                <div className="p-3 rounded-lg bg-surface-subtle border border-border">
                  <span className="font-bold text-ink">3. retrieve</span>
                  <p className="text-ink-muted text-[10px] mt-1">FAISS IndexFlatIP cosine similarity query.</p>
                </div>
                <div className="p-3 rounded-lg bg-surface-subtle border border-border">
                  <span className="font-bold text-ink">4. rerank</span>
                  <p className="text-ink-muted text-[10px] mt-1">Cross-attention scoring and sorting.</p>
                </div>
                <div className="p-3 rounded-lg bg-surface-subtle border border-border">
                  <span className="font-bold text-ink">5. check_evidence</span>
                  <p className="text-ink-muted text-[10px] mt-1">Sufficiency threshold gate (0.650).</p>
                </div>
                <div className="p-3 rounded-lg bg-surface-subtle border border-border">
                  <span className="font-bold text-ink">6. abstain</span>
                  <p className="text-ink-muted text-[10px] mt-1">Honest refusal if evidence is insufficient.</p>
                </div>
                <div className="p-3 rounded-lg bg-surface-subtle border border-border">
                  <span className="font-bold text-ink">7. generate</span>
                  <p className="text-ink-muted text-[10px] mt-1">Grounded synthesis using Google Gemini.</p>
                </div>
                <div className="p-3 rounded-lg bg-surface-subtle border border-border">
                  <span className="font-bold text-ink">8. validate_citations</span>
                  <p className="text-ink-muted text-[10px] mt-1">Strips unreferenced citation brackets.</p>
                </div>
                <div className="p-3 rounded-lg bg-surface-subtle border border-border">
                  <span className="font-bold text-ink">9. validate_groundedness</span>
                  <p className="text-ink-muted text-[10px] mt-1">Computes token overlap against passages.</p>
                </div>
              </div>
            </section>

            <section className="p-6 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-ink">Dual-Dialect Relational Persistence</h3>
              <p className="text-ink-muted">
                NexusRAG uses SQLAlchemy 2.0 with dialect-agnostic models. SQLite with Write-Ahead Logging (WAL) is utilized for instant local execution, while PostgreSQL 16 with Alembic migrations is provisioned for containerized multi-worker deployments.
              </p>
            </section>
          </div>
        )}

        {/* Tab Content: REST API Reference */}
        {activeTab === 'api' && (
          <div className="flex flex-col gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-surface border border-border flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold text-[10px]">GET</span>
                <span className="ml-3 font-semibold text-ink">/api/v1/system/status</span>
              </div>
              <span className="text-ink-muted text-[11px] font-sans">Returns system limits, vector counts, and health</span>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px]">POST</span>
                <span className="ml-3 font-semibold text-ink">/api/v1/documents/upload</span>
              </div>
              <span className="text-ink-muted text-[11px] font-sans">Multipart file upload for PDF, Markdown, and TXT</span>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px]">POST</span>
                <span className="ml-3 font-semibold text-ink">/api/v1/documents/sample</span>
              </div>
              <span className="text-ink-muted text-[11px] font-sans">One-click background ingestion of 4 sample papers</span>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px]">POST</span>
                <span className="ml-3 font-semibold text-ink">/api/v1/query/stream</span>
              </div>
              <span className="text-ink-muted text-[11px] font-sans">SSE stream for grounded synthesis tokens and citations</span>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px]">DELETE</span>
                <span className="ml-3 font-semibold text-ink">/api/v1/user/purge</span>
              </div>
              <span className="text-ink-muted text-[11px] font-sans">Wipes all visitor documents, vectors, and traces</span>
            </div>
          </div>
        )}

        {/* CTA Card */}
        <div className="p-6 rounded-xl bg-surface-subtle border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
          <div>
            <h4 className="text-sm font-semibold text-ink">Ready to explore NexusRAG?</h4>
            <p className="text-xs text-ink-muted mt-0.5 font-serif">
              Upload documents or ingest sample reports to start asking questions.
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

