import React from 'react';
import { PublicHeader } from '../../components/public/PublicHeader';
import { PublicFooter } from '../../components/public/PublicFooter';
import { VIEWS } from '../../components/layout/RailNav';
import { ShieldCheck, Lock, Database, Trash2, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';

export function SecurityPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-canvas text-ink font-sans flex flex-col">
      <PublicHeader currentView={VIEWS.SECURITY} onNavigate={onNavigate} />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full flex flex-col gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand/10 text-brand uppercase font-mono">
              Trust & Security
            </span>
            <span className="text-xs text-ink-muted">• Security Disclosures</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink font-sans">
            Calibrated Security & Tenant Isolation
          </h1>
          <p className="mt-2 text-sm sm:text-base text-ink-muted font-serif max-w-2xl leading-relaxed">
            Transparent breakdown of our security controls, cryptographic session scoping, prompt injection defenses, and vulnerability reporting procedures.
          </p>
        </div>

        {/* Core Security Guarantees Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-5 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-brand font-semibold text-sm">
              <Lock className="w-4 h-4 text-brand" />
              <h3>Cryptographic Session Isolation</h3>
            </div>
            <p className="text-ink-muted leading-relaxed">
              Every visitor receives an isolated workspace anchored to an encrypted, random 256-bit session token stored in an <code className="font-mono text-ink">httpOnly</code>, <code className="font-mono text-ink">SameSite=Lax</code> cookie.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-brand font-semibold text-sm">
              <ShieldCheck className="w-4 h-4 text-brand" />
              <h3>Double-Submit CSRF Defense</h3>
            </div>
            <p className="text-ink-muted leading-relaxed">
              All state-modifying requests (<code className="font-mono text-ink">POST</code>, <code className="font-mono text-ink">PUT</code>, <code className="font-mono text-ink">DELETE</code>) require a cryptographic <code className="font-mono text-ink">X-CSRF-Token</code> matching the session cookie to prevent cross-site request forgery.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-brand font-semibold text-sm">
              <Database className="w-4 h-4 text-brand" />
              <h3>Tenant-Partitioned Data Layer</h3>
            </div>
            <p className="text-ink-muted leading-relaxed">
              Every relational query strictly enforces <code className="font-mono text-ink">WHERE workspace_id = current_workspace</code>. Physical files and FAISS indices are partitioned in isolated directories per tenant.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-brand font-semibold text-sm">
              <Trash2 className="w-4 h-4 text-brand" />
              <h3>Verifiable Permanent Purge</h3>
            </div>
            <p className="text-ink-muted leading-relaxed">
              Purging a workspace executes an immediate, irreversible wipe: physical files are unlinked from disk, rows are dropped from the database, and FAISS vectors are removed with $O(1)$ ID deletion.
            </p>
          </div>
        </div>

        {/* Prompt Injection Defense */}
        <section className="p-6 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-3 text-xs">
          <h2 className="text-sm font-semibold text-ink">Prompt Injection & Content Quarantining</h2>
          <p className="text-ink-muted leading-relaxed">
            NexusRAG treats all ingested document content as strictly untrusted text. In prompts delivered to the generation model, document passages are placed inside dedicated non-evaluating quarantine boundaries:
          </p>
          <div className="p-3 rounded-lg bg-surface-subtle font-mono text-[11px] text-ink-muted border border-border">
            &lt;&lt;&lt;UNTRUSTED_DOCUMENT_CONTENT [Doc: filename.pdf, Page: 2]&gt;&gt;&gt;<br />
            ... extracted text chunks ...<br />
            &lt;&lt;&lt;END_UNTRUSTED_CONTENT&gt;&gt;&gt;
          </div>
          <p className="text-ink-muted leading-relaxed">
            System prompts explicitly direct the model to treat all text within delimiters as passive reference material and ignore any imperative commands embedded therein.
          </p>
        </section>

        {/* Vulnerability Reporting Channel */}
        <section className="p-6 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-3 text-xs">
          <div className="flex items-center gap-2 text-ink font-semibold text-sm">
            <Mail className="w-4 h-4 text-brand" />
            <h2>Vulnerability Disclosure Program</h2>
          </div>
          <p className="text-ink-muted leading-relaxed">
            We welcome vulnerability disclosures from security researchers. If you discover a potential vulnerability or isolation flaw, please report it directly:
          </p>
          <div className="p-3 rounded-lg bg-surface-subtle border border-border font-mono text-xs flex items-center justify-between">
            <span className="text-ink font-medium">security@nexusrag.internal</span>
            <span className="text-ink-muted text-[11px] font-sans">PGP Key available upon request</span>
          </div>
          <p className="text-[11px] text-ink-muted font-serif italic">
            Please allow up to 48 hours for an acknowledgment and coordinate disclosure before publishing details.
          </p>
        </section>
      </main>

      <PublicFooter onNavigate={onNavigate} />
    </div>
  );
}

