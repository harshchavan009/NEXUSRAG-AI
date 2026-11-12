import React from 'react';
import { Modal } from './Modal';
import { Command, Keyboard, Search, Upload, MessageSquare, CornerDownLeft, X } from 'lucide-react';

export function ShortcutsModal({ isOpen, onClose }) {
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const mod = isMac ? '⌘' : 'Ctrl';

  const shortcuts = [
    {
      keys: [`${mod}`, 'K'],
      label: 'Open Global Command Palette',
      description: 'Quickly search documents, switch views, or run actions from anywhere',
      category: 'Navigation',
    },
    {
      keys: ['?'],
      label: 'Open Keyboard Shortcuts',
      description: 'Display this keyboard reference cheat sheet',
      category: 'Navigation',
    },
    {
      keys: ['Esc'],
      label: 'Close Modal or Cancel Drawer',
      description: 'Dismiss any open modal dialog or slide-over drawer',
      category: 'Navigation',
    },
    {
      keys: ['Enter'],
      label: 'Submit Research Inquiry',
      description: 'Execute RAG synthesis from the composer or search input',
      category: 'Research Desk',
    },
    {
      keys: ['[1]', '[2]'],
      label: 'Focus Citation Passage',
      description: 'Click any numbered chip to open source evidence in the Document Reader',
      category: 'Research Desk',
    },
    {
      keys: ['←', '→'],
      label: 'Previous / Next Page',
      description: 'Navigate pages in the active document viewer',
      category: 'Document Reader',
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" maxWidth="max-w-lg">
      <div className="flex flex-col gap-5 text-xs text-ink font-sans">
        <p className="text-ink-muted text-xs font-serif leading-relaxed">
          Navigate and operate NexusRAG using standard keyboard shortcuts on {isMac ? 'macOS' : 'Windows/Linux'}.
        </p>

        <div className="flex flex-col gap-2">
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-lg bg-surface-subtle border border-border"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-ink text-xs">{sc.label}</span>
                <span className="text-[11px] text-ink-muted font-serif">{sc.description}</span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                {sc.keys.map((k, kidx) => (
                  <kbd
                    key={kidx}
                    className="font-mono text-[11px] font-semibold bg-surface border border-border rounded px-2 py-0.5 text-ink shadow-2xs min-w-[24px] text-center"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-border flex justify-between items-center text-[11px] text-ink-muted">
          <span>Press <kbd className="font-mono px-1 rounded bg-surface border border-border">Esc</kbd> to dismiss</span>
          <span className="font-mono text-brand">NexusRAG v1.0.0</span>
        </div>
      </div>
    </Modal>
  );
}

