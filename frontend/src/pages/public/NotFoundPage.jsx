import React from 'react';
import { PublicHeader } from '../../components/public/PublicHeader';
import { PublicFooter } from '../../components/public/PublicFooter';
import { VIEWS } from '../../components/layout/RailNav';
import { Button } from '../../components/common/Button';
import { Home, ArrowRight, FileQuestion } from 'lucide-react';

export function NotFoundPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-canvas text-ink font-sans flex flex-col">
      <PublicHeader currentView={VIEWS.NOT_FOUND} onNavigate={onNavigate} />

      <main className="flex-1 max-w-xl mx-auto px-6 py-20 w-full flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface-subtle border border-border flex items-center justify-center text-brand mb-4 shadow-sm">
          <FileQuestion className="w-8 h-8" />
        </div>

        <span className="text-xs font-mono font-bold text-brand uppercase tracking-wider">
          404 Not Found
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-ink mt-2">
          Page Does Not Exist
        </h1>
        <p className="mt-3 text-sm text-ink-muted font-serif leading-relaxed">
          The requested page could not be located. You may return to the public overview or launch your authenticated research workspace.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="outline"
            size="md"
            icon={Home}
            onClick={() => onNavigate(VIEWS.LANDING)}
          >
            Public Home
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={ArrowRight}
            onClick={() => onNavigate(VIEWS.DASHBOARD)}
          >
            Open Workspace
          </Button>
        </div>
      </main>

      <PublicFooter onNavigate={onNavigate} />
    </div>
  );
}

