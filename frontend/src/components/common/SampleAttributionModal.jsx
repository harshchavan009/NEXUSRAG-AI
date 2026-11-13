import React from 'react';
import { Modal } from './Modal';
import { ExternalLink, ShieldCheck, FileText, CheckCircle } from 'lucide-react';

export function SampleAttributionModal({ isOpen, onClose }) {
  const samplePapers = [
    {
      title: 'NexusRAG: Architectural Foundations of Auditable RAG',
      authors: 'NexusRAG Systems Engineering Group (2026)',
      filename: 'ai_system_architecture_whitepaper.pdf',
      format: 'PDF (10 Pages, 10 Chunks)',
      sourceUrl: 'https://github.com/harshchavan009/NEXUSRAG-AI/blob/main/data/sample_documents/ai_system_architecture_whitepaper.pdf',
      license: 'Creative Commons Attribution 4.0 International (CC BY 4.0)',
      licenseType: 'CC BY 4.0 Technical Specification',
      attributionNotes: 'Authentic 10-page architecture whitepaper specifying multi-format ingestion, FAISS IndexIDMap2 vector indexing, 9-node LangGraph orchestration, and server-side citation validation.',
    },
    {
      title: 'Clean Energy & Photovoltaic Infrastructure Assessment (2024)',
      authors: 'NexusRAG Engineering Benchmarks Team (2024)',
      filename: 'clean_energy_report_2024.txt',
      format: 'Plain Text (26 Sections, 6 Chunks)',
      sourceUrl: 'https://github.com/harshchavan009/NEXUSRAG-AI/blob/main/data/sample_documents/clean_energy_report_2024.txt',
      license: 'Creative Commons Attribution 4.0 International (CC BY 4.0)',
      licenseType: 'CC BY 4.0 Synthetic Benchmark',
      attributionNotes: 'Comprehensive synthetic technical benchmark detailing LFP battery storage market dynamics (82% share), photovoltaic conversion efficiencies (22.8%), and levelized cost of energy ($36/MWh).',
    },
    {
      title: 'Corporate Governance, Risk Oversight & Materiality Statement (2024)',
      authors: 'NexusRAG Engineering Benchmarks Team (2024)',
      filename: 'corporate_governance_report.txt',
      format: 'Plain Text (27 Sections, 5 Chunks)',
      sourceUrl: 'https://github.com/harshchavan009/NEXUSRAG-AI/blob/main/data/sample_documents/corporate_governance_report.txt',
      license: 'Creative Commons Attribution 4.0 International (CC BY 4.0)',
      licenseType: 'CC BY 4.0 Synthetic Benchmark',
      attributionNotes: 'Synthetic governance charter specifying board committee independence (77.8%), mandatory executive clawback mandates under SEC Rule 10D-1, voting thresholds, and disaster recovery RTO/RPO targets.',
    },
    {
      title: 'Principles of Distributed Consensus and Fault-Tolerant State Machines',
      authors: 'NexusRAG Systems Architecture Group (2024)',
      filename: 'distributed_systems_consensus_brief.md',
      format: 'Markdown (22 Sections, 5 Chunks)',
      sourceUrl: 'https://github.com/harshchavan009/NEXUSRAG-AI/blob/main/data/sample_documents/distributed_systems_consensus_brief.md',
      license: 'Creative Commons Attribution 4.0 International (CC BY 4.0)',
      licenseType: 'CC BY 4.0 Technical Specification',
      attributionNotes: 'Synthetic distributed systems specification detailing Raft election timeouts (150ms-300ms), Byzantine Fault Tolerance bounds (N >= 3f + 1), and Multi-Paxos single-round-trip invariants.',
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sample Benchmark Materials & Attribution" maxWidth="max-w-2xl">
      <div className="flex flex-col gap-4 text-xs text-ink font-sans">
        <p className="text-ink-muted leading-relaxed font-serif">
          NexusRAG includes four comprehensive synthetic benchmark documents (one 10-page PDF, one Markdown specification, and two plain text reports) created specifically for rigorous, transparent evaluation of multi-stage RAG ingestion, chunking, reranking, and citation verification under Creative Commons Attribution 4.0.
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

