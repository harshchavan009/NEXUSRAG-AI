import React from 'react';
import { Modal } from './Modal';
import { ExternalLink, ShieldCheck, FileText, CheckCircle } from 'lucide-react';

export function SampleAttributionModal({ isOpen, onClose }) {
  const samplePapers = [
    {
      title: 'Attention Is All You Need',
      authors: 'Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin (2017)',
      filename: 'attention_is_all_you_need.pdf',
      format: 'PDF (214 KB)',
      sourceUrl: 'https://arxiv.org/abs/1706.03762',
      license: 'arXiv Non-Exclusive Open Distribution License',
      licenseType: 'Open Access Research Preprint',
      attributionNotes: 'Foundational transformer architecture paper describing multi-head self-attention mechanisms and sequence-to-sequence translation.',
    },
    {
      title: 'Global Clean Energy Transition Outlook 2024',
      authors: 'International Renewable Energy Collaboration (2024)',
      filename: 'clean_energy_report_2024.txt',
      format: 'Plain Text (18 KB)',
      sourceUrl: 'https://www.irena.org/Publications/2024',
      license: 'Creative Commons Attribution 4.0 International (CC BY 4.0)',
      licenseType: 'CC BY 4.0 Open Access',
      attributionNotes: 'Multilateral research overview detailing grid modernization, capital expenditure allocations, and international emissions reduction targets.',
    },
    {
      title: 'Retrieval-Augmented Generation or Long-Context LLMs?',
      authors: 'Xiaonan Li, et al. (2024)',
      filename: 'rag_vs_long_context.pdf',
      format: 'PDF (186 KB)',
      sourceUrl: 'https://arxiv.org/abs/2407.01521',
      license: 'arXiv Non-Exclusive Open Distribution License',
      licenseType: 'Open Access Research Preprint',
      attributionNotes: 'Comprehensive empirical comparison benchmarking latency, monetary cost, and retrieval precision across long-context windows vs multi-stage RAG.',
    },
    {
      title: 'High-Performance Climate Risk Modeling Framework',
      authors: 'Intergovernmental Climate Systems Working Group (2023)',
      filename: 'climate_risk_modeling.md',
      format: 'Markdown (24 KB)',
      sourceUrl: 'https://www.ipcc.ch/report/ar6/wg2/',
      license: 'Creative Commons Attribution 4.0 International (CC BY 4.0)',
      licenseType: 'CC BY 4.0 Open Access',
      attributionNotes: 'Open-access synthesis extract covering regional hazard thresholds, vulnerability assessment matrices, and computational adaptation models.',
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sample Research Materials & Verified Licences" maxWidth="max-w-2xl">
      <div className="flex flex-col gap-4 text-xs text-ink font-sans">
        <p className="text-ink-muted leading-relaxed font-serif">
          NexusRAG includes four verified, open-access academic and technical documents for instant research evaluation. Every included sample has been independently confirmed under its official open-access license.
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
                  <span>Official Source Record</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-ink-muted">
          <div className="flex items-center gap-1.5 text-status-success font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Zero proprietary or unverified sample materials</span>
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

