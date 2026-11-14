/**
 * NexusRAG Sample Benchmark Documents - Single Source of Truth
 * All four documents were authored specifically for NexusRAG technical evaluation
 * under Creative Commons Attribution 4.0 International (CC BY 4.0).
 */

export const SAMPLE_DOCUMENTS_DESCRIPTION =
  'Loads 4 benchmark documents written for NexusRAG under CC BY 4.0 (10-page architecture PDF, 26-section clean energy report, 27-section governance report, and 22-section consensus brief).';

export const SAMPLE_DOCUMENTS_SHORT_DESC = 'Load 4 benchmark documents';

export const SAMPLE_DOCUMENTS_TILE_LABEL = 'Load Sample Documents';

export const SAMPLE_DOCUMENTS_TILE_SUBTITLE = '4 demo documents (PDF, TXT, MD)';

export const SAMPLE_DOCUMENTS_MODAL_TITLE = 'Sample Benchmark Materials & Attribution';

export const SAMPLE_DOCUMENTS_SUMMARY_NOTE =
  'NexusRAG includes four comprehensive benchmark documents written for NexusRAG (one 10-page PDF, one Markdown specification, and two plain text reports) created specifically for rigorous, transparent evaluation of multi-stage RAG ingestion, chunking, reranking, and citation verification under Creative Commons Attribution 4.0 International (CC BY 4.0).';

export const SAMPLE_DOCUMENTS = [
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

