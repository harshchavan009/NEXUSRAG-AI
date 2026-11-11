import React, { useState } from 'react';
import { PublicHeader } from '../../components/public/PublicHeader';
import { PublicFooter } from '../../components/public/PublicFooter';
import { VIEWS } from '../../components/layout/RailNav';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';

export function FAQPage({ onNavigate }) {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'How does citation grounding work in NexusRAG?',
      a: 'During document ingestion, text is extracted alongside exact page numbers and character offsets. When an answer is synthesized, the model generates numerical citation brackets like [1], [2]. The server-side validate_citations node verifies each bracket against the retrieved context before delivery, and clicking a citation badge jumps directly to the highlighted sentence in the PDF Reader.'
    },
    {
      q: 'What happens when a query has no relevant evidence in the documents?',
      a: 'NexusRAG features an explicit check_evidence gate in the LangGraph workflow. If the semantic similarity score of the top retrieved chunks falls below 0.650, the pipeline abstains with a clear message rather than fabricating an answer.'
    },
    {
      q: 'Which file formats and size constraints are supported?',
      a: 'NexusRAG natively parses PDF documents, Markdown files (.md), and plain text files (.txt). The maximum file size is 25MB, and PDF documents support up to 60 pages per upload. Scanned image-only PDFs currently require OCR pre-processing.'
    },
    {
      q: 'Are my uploaded documents used to train AI models?',
      a: 'No. NexusRAG interacts with Google Gemini via standard commercial API endpoints. Under Google API terms for direct developer accounts, customer data submitted via API calls is ephemeral and is not used to train or fine-tune foundation models.'
    },
    {
      q: 'How does NexusRAG prevent cross-tenant data leaks?',
      a: 'Every user is partitioned by an encrypted session cookie and double-submit CSRF token. All SQL queries enforce WHERE workspace_id = current_session. Physical files and FAISS indices are stored in dedicated isolated subdirectories on disk.'
    },
    {
      q: 'What is the difference between SQLite and PostgreSQL in NexusRAG?',
      a: 'NexusRAG models are written in pure SQLAlchemy 2.0 with dialect-agnostic types. SQLite with Write-Ahead Logging (WAL) is enabled for zero-dependency local development, while PostgreSQL 16 is provisioned in docker-compose.yml with Alembic schema migrations for multi-worker container deployments.'
    },
    {
      q: 'What happens when I click "Purge All Workspace Data"?',
      a: 'A confirmed purge sends an immediate delete call that unlinks all uploaded files from physical storage, deletes all rows for documents, chunks, and sessions from the relational database, and removes all vectors from the FAISS index with O(1) ID deletion.'
    },
    {
      q: 'Can I inspect the full retrieval workflow and durations?',
      a: 'Yes. The Retrieval Inspector visualizes every run of the 9-node LangGraph execution trace, showing node durations, rewritten queries, candidate similarity scores, and groundedness ratings.'
    }
  ];

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans flex flex-col">
      <PublicHeader currentView={VIEWS.FAQ} onNavigate={onNavigate} />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-12 w-full flex flex-col gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand/10 text-brand uppercase font-mono">
              FAQ
            </span>
            <span className="text-xs text-ink-muted">• Common Questions</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink font-sans">
            Frequently Asked Questions
          </h1>
          <p className="mt-2 text-sm sm:text-base text-ink-muted font-serif max-w-xl leading-relaxed">
            Direct, plain-language answers about citation integrity, data isolation, model providers, and system constraints.
          </p>
        </div>

        {/* Accordion List */}
        <div className="flex flex-col gap-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-surface border border-border rounded-xl overflow-hidden transition-colors shadow-2xs"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-medium text-xs sm:text-sm text-ink hover:text-brand transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-brand flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-ink-muted flex-shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-border/40 text-xs text-ink-muted font-serif leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      <PublicFooter onNavigate={onNavigate} />
    </div>
  );
}
