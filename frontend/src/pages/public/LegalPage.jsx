import React, { useState } from 'react';
import { PublicHeader } from '../../components/public/PublicHeader';
import { PublicFooter } from '../../components/public/PublicFooter';
import { VIEWS } from '../../components/layout/RailNav';
import clsx from 'clsx';

export function LegalPage({ initialTab = 'privacy', onNavigate }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'privacy' or 'terms'

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans flex flex-col">
      <PublicHeader currentView={activeTab === 'privacy' ? VIEWS.PRIVACY : VIEWS.TERMS} onNavigate={onNavigate} />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full flex flex-col gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand/10 text-brand uppercase font-mono">
              Legal & Compliance
            </span>
            <span className="text-xs text-ink-muted">• Review Draft</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink font-sans">
            {activeTab === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
          </h1>
          <p className="mt-2 text-sm text-ink-muted font-serif max-w-xl leading-relaxed">
            Effective Date: November 11, 2026. Plain-language commitments regarding data processing, API handling, and retention.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-border text-xs font-medium">
          <button
            onClick={() => setActiveTab('privacy')}
            className={clsx(
              'pb-3 px-3 transition-colors border-b-2',
              activeTab === 'privacy' ? 'border-brand text-brand font-semibold' : 'border-transparent text-ink-muted hover:text-ink'
            )}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={clsx(
              'pb-3 px-3 transition-colors border-b-2',
              activeTab === 'terms' ? 'border-brand text-brand font-semibold' : 'border-transparent text-ink-muted hover:text-ink'
            )}
          >
            Terms of Service
          </button>
        </div>

        {/* Content */}
        <div className="p-6 rounded-xl bg-surface border border-border shadow-xs text-xs leading-relaxed text-ink space-y-6">
          {activeTab === 'privacy' ? (
            <>
              <section>
                <h2 className="text-sm font-semibold text-ink mb-1">1. Core Privacy Commitments</h2>
                <p className="text-ink-muted font-serif">
                  NexusRAG is architected for zero tracking. We do not use marketing trackers or analytics beacons. All documents, vectors, and messages are strictly isolated per visitor session.
                </p>
              </section>

              <section>
                <h2 className="text-sm font-semibold text-ink mb-1">2. Information We Process</h2>
                <p className="text-ink-muted font-serif">
                  When you upload files, text is extracted locally using PyMuPDF and embedded into FAISS. Only the retrieved text chunks relevant to your query are transmitted to the configured AI API (Google Gemini) to generate grounded answers.
                </p>
              </section>

              <section>
                <h2 className="text-sm font-semibold text-ink mb-1">3. AI Provider Disclosures</h2>
                <p className="text-ink-muted font-serif">
                  Under standard commercial API terms for direct developer accounts, customer data submitted to the Google Gemini API is ephemeral and is not used to train or fine-tune foundation models.
                </p>
              </section>

              <section>
                <h2 className="text-sm font-semibold text-ink mb-1">4. Data Retention & Permanent Purge</h2>
                <p className="text-ink-muted font-serif">
                  You can permanently purge all uploaded files, database records, and FAISS vectors at any time from the Settings view. Workspaces inactive for more than 7 days are automatically removed by our retention cleanup routine.
                </p>
              </section>
            </>
          ) : (
            <>
              <section>
                <h2 className="text-sm font-semibold text-ink mb-1">1. Acceptance of Terms</h2>
                <p className="text-ink-muted font-serif">
                  By accessing NexusRAG, you agree to these terms. NexusRAG is provided for document intelligence, research synthesis, and reference verification.
                </p>
              </section>

              <section>
                <h2 className="text-sm font-semibold text-ink mb-1">2. Acceptable Use Policy</h2>
                <p className="text-ink-muted font-serif">
                  You agree not to upload copyrighted content you do not possess rights to analyze, malicious files, or materials intended to exploit, abuse, or bypass application security boundaries.
                </p>
              </section>

              <section>
                <h2 className="text-sm font-semibold text-ink mb-1">3. Generative AI Disclaimer</h2>
                <p className="text-ink-muted font-serif">
                  NexusRAG synthesizes answers using large language models. While grounded citations link to source passages, users must verify critical findings against original documents before taking legal, medical, or financial action.
                </p>
              </section>

              <section>
                <h2 className="text-sm font-semibold text-ink mb-1">4. Limitation of Liability</h2>
                <p className="text-ink-muted font-serif">
                  NexusRAG is open-source research software provided "as is", without warranty of any kind, express or implied.
                </p>
              </section>
            </>
          )}
        </div>
      </main>

      <PublicFooter onNavigate={onNavigate} />
    </div>
  );
}

