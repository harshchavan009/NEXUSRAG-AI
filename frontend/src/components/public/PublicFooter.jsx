import React from 'react';
import { VIEWS } from '../layout/RailNav';

export function PublicFooter({ onNavigate }) {
  return (
    <footer className="border-t border-border/50 bg-surface/50 py-12 px-6 text-xs text-ink-muted select-none">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
        {/* Brand Column */}
        <div className="col-span-2 flex flex-col gap-3">
          <div className="flex items-center gap-2 font-bold text-sm tracking-tight text-ink">
            <div className="w-6 h-6 rounded bg-[#B84A28] flex items-center justify-center text-white">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 32 32">
                <path d="M8 10h6a4 4 0 0 1 4 4v10a4 4 0 0 0-4-4H8V10zm16 0h-6a4 4 0 0 0-4 4v10a4 4 0 0 1 4-4h6V10z" fill="currentColor"/>
                <circle cx="16" cy="14" r="2" fill="#F7F6F2"/>
              </svg>
            </div>
            <span>nexus<span className="text-[#B84A28]">rag</span></span>
          </div>
          <p className="text-xs text-ink-muted font-serif leading-relaxed max-w-sm">
            Trace every answer to the sentence that proves it. Reference-driven research workspace with sentence-level citations and inspectable retrieval graphs.
          </p>
          <p className="text-[11px] font-mono text-ink-faint">
            Open Source Research Engine • v1.0.0
          </p>
        </div>

        {/* Product Column */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-semibold text-ink uppercase tracking-wider">Product</span>
          <button onClick={() => onNavigate(VIEWS.DASHBOARD)} className="text-left hover:text-ink transition-colors">Workspace</button>
          <button onClick={() => onNavigate(VIEWS.LIBRARY)} className="text-left hover:text-ink transition-colors">Knowledge Bases</button>
          <button onClick={() => onNavigate(VIEWS.RESEARCH)} className="text-left hover:text-ink transition-colors">Research Desk</button>
          <button onClick={() => onNavigate(VIEWS.INSPECTOR)} className="text-left hover:text-ink transition-colors">LangGraph Traces</button>
        </div>

        {/* Resources Column */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-semibold text-ink uppercase tracking-wider">Resources</span>
          <button onClick={() => onNavigate(VIEWS.DOCS)} className="text-left hover:text-ink transition-colors">Documentation</button>
          <button onClick={() => onNavigate(VIEWS.FAQ)} className="text-left hover:text-ink transition-colors">FAQ</button>
          <button onClick={() => onNavigate(VIEWS.STATUS)} className="text-left hover:text-ink transition-colors">System Status</button>
          <a href="/api/v1/system/status" target="_blank" rel="noreferrer" className="text-left hover:text-ink transition-colors">API Endpoint</a>
        </div>

        {/* Trust & Legal Column */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-semibold text-ink uppercase tracking-wider">Trust & Legal</span>
          <button onClick={() => onNavigate(VIEWS.SECURITY)} className="text-left hover:text-ink transition-colors">Security Disclosure</button>
          <button onClick={() => onNavigate(VIEWS.PRIVACY)} className="text-left hover:text-ink transition-colors">Privacy Policy</button>
          <button onClick={() => onNavigate(VIEWS.TERMS)} className="text-left hover:text-ink transition-colors">Terms of Service</button>
          <button onClick={() => onNavigate(VIEWS.ABOUT)} className="text-left hover:text-ink transition-colors">About NexusRAG</button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-ink-muted">
        <div>
          © 2026 NexusRAG Project. Released under permissive research license.
        </div>
        <div className="flex items-center gap-4">
          <span>Zero third-party trackers</span>
          <span>•</span>
          <span>Session-isolated storage</span>
          <span>•</span>
          <a href="https://github.com/harshchavan009/NEXUSRAG-AI" target="_blank" rel="noreferrer" className="text-brand hover:underline">
            GitHub Repository
          </a>
        </div>
      </div>
    </footer>
  );
}

