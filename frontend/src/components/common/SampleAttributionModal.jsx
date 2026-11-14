import React from 'react';
import { Modal } from './Modal';
import { ExternalLink, ShieldCheck, FileText, CheckCircle } from 'lucide-react';
import {
  SAMPLE_DOCUMENTS,
  SAMPLE_DOCUMENTS_SUMMARY_NOTE,
  SAMPLE_DOCUMENTS_MODAL_TITLE,
} from '../../constants/sampleDocuments';

export function SampleAttributionModal({ isOpen, onClose }) {
  const samplePapers = SAMPLE_DOCUMENTS;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={SAMPLE_DOCUMENTS_MODAL_TITLE} maxWidth="max-w-2xl">
      <div className="flex flex-col gap-4 text-xs text-ink font-sans">
        <p className="text-ink-muted leading-relaxed font-serif">
          {SAMPLE_DOCUMENTS_SUMMARY_NOTE}
        </p>

        <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {samplePapers.map((paper, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-surface-subtle border border-border flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-brand flex-shrink-0" />
                    <h3 className="font-semibold text-ink text-xs">{paper.title}</h3>
                  </div>
                  <p className="text-[11px] text-ink-muted mt-0.5">{paper.authors}</p>
                </div>
                <span className="font-mono text-[10px] bg-brand/10 text-brand px-2 py-0.5 rounded font-medium flex-shrink-0">
                  {paper.licenseType}
                </span>
              </div>

              <p className="text-[11px] text-ink-muted font-serif leading-relaxed">
                {paper.attributionNotes}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60 text-[10px] font-mono text-ink-muted">
                <span>File: <code className="text-ink font-semibold">{paper.filename}</code> ({paper.format})</span>
                <a
                  href={paper.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand hover:underline flex items-center gap-1 font-sans font-medium"
                >
                  <span>Repository Source File</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-ink-muted">
          <div className="flex items-center gap-1.5 text-status-success font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>100% Transparent Attribution: CC BY 4.0 Benchmark Dataset</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-surface border border-border rounded-lg text-xs text-ink hover:bg-surface-subtle"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

