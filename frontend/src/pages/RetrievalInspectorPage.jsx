import React, { useState, useEffect } from 'react';
import {
  Activity,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Layers,
  ArrowRight,
  Copy,
  Check,
  Download
} from 'lucide-react';
import { StatusDot } from '../components/common/StatusDot';
import { DAGTraceTimeline } from '../components/inspector/DAGTraceTimeline';
import { useInspectorRuns, useInspectorRunDetail } from '../api/queries';
import clsx from 'clsx';

export function RetrievalInspectorPage({ initialRunId = null }) {
  const { data: runs = [], isLoading: runsLoading } = useInspectorRuns();
  const [selectedRunId, setSelectedRunId] = useState(initialRunId);
  const [copiedId, setCopiedId] = useState(false);
  const [candidateViewTab, setCandidateViewTab] = useState('reranked'); // 'reranked' or 'candidates'
  const [isMobileRunSelectorOpen, setIsMobileRunSelectorOpen] = useState(false);

  useEffect(() => {
    if (initialRunId) {
      setSelectedRunId(initialRunId);
    } else if (!selectedRunId && runs.length > 0) {
      setSelectedRunId(runs[0].id);
    }
  }, [initialRunId, runs, selectedRunId]);

  const { data: selectedRun, isLoading: runLoading } = useInspectorRunDetail(selectedRunId);

  const handleCopyRunId = () => {
    if (!selectedRun?.id) return;
    navigator.clipboard.writeText(selectedRun.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleExportTraceJson = () => {
    if (!selectedRun) return;
    const jsonStr = JSON.stringify(selectedRun, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nexusrag-trace-${selectedRun.id.slice(0, 8)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-canvas relative">
      {/* Mobile Backdrop */}
      {isMobileRunSelectorOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-30 md:hidden"
          onClick={() => setIsMobileRunSelectorOpen(false)}
        />
      )}

      {/* Left Runs List (Recent Traces) */}
      <aside
        className={clsx(
          'w-72 bg-surface border-r border-border flex flex-col flex-shrink-0 select-none transition-all duration-200',
          isMobileRunSelectorOpen ? 'fixed inset-y-0 left-0 z-40 shadow-2xl h-full' : 'hidden md:flex'
        )}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand" />
            <h2 className="text-xs font-semibold text-ink uppercase tracking-wide">
              Trace Executions
            </h2>
          </div>
          <span className="font-mono text-[10px] text-ink-muted bg-surface-subtle px-1.5 py-0.5 rounded border border-border">
            {runs.length} runs
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 text-xs">
          {runsLoading ? (
            <div className="p-4 text-center text-ink-muted">Loading trace runs...</div>
          ) : runs.length === 0 ? (
            <div className="p-4 text-center text-ink-muted italic">
              No workflow runs recorded yet. Issue a question in the Research Desk to generate telemetry.
            </div>
          ) : (
            runs.map((r) => {
              const isActive = selectedRunId === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => {
                    setSelectedRunId(r.id);
                    setIsMobileRunSelectorOpen(false);
                  }}
                  className={clsx(
                    'p-2.5 rounded cursor-pointer transition-colors border flex flex-col gap-1.5',
                    isActive
                      ? 'bg-brand/10 border-brand/30 dark:bg-brand/20'
                      : 'bg-surface border-border hover:bg-surface-subtle'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-ink-muted">
                      {r.id.slice(0, 14)}...
                    </span>
                    <StatusDot status={r.status} />
                  </div>

                  <p className="font-medium text-ink text-xs line-clamp-1" title={r.query}>
                    {r.query}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-ink-muted pt-1 border-t border-border/50">
                    <span>{r.stage_durations?.total || 0} ms</span>
                    <span>Suff: {r.sufficiency_score?.toFixed(2)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Selected Run Inspector Details */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 gap-6">
        {runLoading ? (
          <div className="p-12 text-center text-ink-muted text-xs">
            Loading trace execution telemetry...
          </div>
        ) : !selectedRun ? (
          <div className="p-12 text-center text-ink-muted text-xs">
            Select a trace from the left panel to inspect its LangGraph execution DAG.
          </div>
        ) : (
          <>
            {/* Header / Query Card */}
            <div className="p-4 rounded-md bg-surface border border-border flex flex-col gap-3 shadow-xs">
              <div className="flex flex-wrap items-center justify-between border-b border-border pb-2.5 gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMobileRunSelectorOpen(true)}
                    className="md:hidden flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border border-border bg-surface-subtle text-ink font-medium"
                    title="Select a trace execution"
                  >
                    <Activity className="w-3 h-3 text-brand" />
                    <span>Runs ({runs.length})</span>
                  </button>
                  <span className="text-xs font-mono font-bold text-brand truncate max-w-[140px] sm:max-w-none">
                    {selectedRun.id}
                  </span>
                  <button
                    onClick={handleCopyRunId}
                    className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border border-border bg-surface-subtle hover:bg-surface text-ink-muted hover:text-ink transition-colors"
                    title="Copy Trace Run ID"
                  >
                    {copiedId ? <Check className="w-3 h-3 text-status-success" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId ? 'Copied' : 'Copy ID'}</span>
                  </button>
                  <button
                    onClick={handleExportTraceJson}
                    className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border border-border bg-surface-subtle hover:bg-surface text-ink-muted hover:text-ink transition-colors"
                    title="Export Trace JSON"
                  >
                    <Download className="w-3 h-3 text-brand" />
                    <span>Export JSON</span>
                  </button>
                </div>
                <StatusDot status={selectedRun.status} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-ink-muted block text-[10px] uppercase font-semibold">
                    Original Query
                  </span>
                  <p className="font-medium text-ink mt-0.5">{selectedRun.query}</p>
                </div>

                <div>
                  <span className="text-ink-muted block text-[10px] uppercase font-semibold">
                    Rewritten Standalone Query
                  </span>
                  <p className="font-medium text-ink mt-0.5 font-mono text-[11px]">
                    {selectedRun.rewritten_query || selectedRun.query}
                  </p>
                </div>
              </div>
            </div>

            {/* Score Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Sufficiency Card */}
              <div className="p-4 rounded-md bg-surface border border-border shadow-xs flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-ink-muted uppercase">
                  Evidence Sufficiency
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold font-mono text-ink">
                    {selectedRun.sufficiency_score?.toFixed(3)}
                  </span>
                  <span className="text-xs text-ink-muted font-mono">/ 1.000</span>
                </div>
                <span className="text-[10px] font-mono text-ink-muted mt-1">
                  Gate Threshold: 0.650 ({selectedRun.sufficiency_score >= 0.65 ? 'Passed' : 'Abstained'})
                </span>
              </div>

              {/* Groundedness Card */}
              <div className="p-4 rounded-md bg-surface border border-border shadow-xs flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-ink-muted uppercase">
                  Faithful Groundedness
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold font-mono text-status-success">
                    {selectedRun.groundedness_score?.toFixed(2)}
                  </span>
                  <span className="text-xs text-ink-muted font-mono">/ 1.00</span>
                </div>
                <span className="text-[10px] font-mono text-ink-muted mt-1">
                  Target Threshold: 0.70 (Verified)
                </span>
              </div>

              {/* Total Latency Card */}
              <div className="p-4 rounded-md bg-surface border border-border shadow-xs flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-ink-muted uppercase">
                  Total Workflow Duration
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold font-mono text-brand">
                    {selectedRun.stage_durations?.total || 0}
                  </span>
                  <span className="text-xs text-ink-muted font-mono">ms</span>
                </div>
                <span className="text-[10px] font-mono text-ink-muted mt-1">
                  9-Node DAG Execution
                </span>
              </div>
            </div>

            {/* DAG Execution Timeline */}
            <div className="p-4 rounded-md bg-surface border border-border shadow-xs">
              <DAGTraceTimeline run={selectedRun} />
            </div>

            {/* Reranked vs Initial Candidates Chunk Inspection */}
            <div className="p-4 rounded-md bg-surface border border-border shadow-xs flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between border-b border-border pb-2.5 gap-2">
                <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-subtle p-0.5 text-xs">
                  <button
                    onClick={() => setCandidateViewTab('reranked')}
                    className={clsx(
                      'px-2.5 py-1 rounded-md font-medium transition-colors',
                      candidateViewTab === 'reranked'
                        ? 'bg-surface text-brand shadow-2xs font-semibold'
                        : 'text-ink-muted hover:text-ink'
                    )}
                  >
                    Reranked Context ({selectedRun.reranked_results?.length || 0})
                  </button>
                  <button
                    onClick={() => setCandidateViewTab('candidates')}
                    className={clsx(
                      'px-2.5 py-1 rounded-md font-medium transition-colors',
                      candidateViewTab === 'candidates'
                        ? 'bg-surface text-brand shadow-2xs font-semibold'
                        : 'text-ink-muted hover:text-ink'
                    )}
                  >
                    Initial Retrieved Candidates ({selectedRun.retrieved_candidates?.length || 0})
                  </button>
                </div>

                <span className="text-[11px] font-mono text-ink-muted">
                  {candidateViewTab === 'reranked' ? 'Cross-Encoder Scoring' : 'FAISS Cosine Similarity'}
                </span>
              </div>

              {candidateViewTab === 'reranked' ? (
                selectedRun.reranked_results?.length === 0 ? (
                  <p className="text-xs text-ink-muted italic py-4 text-center">No candidates reranked.</p>
                ) : (
                  <div className="divide-y divide-border">
                    {selectedRun.reranked_results.map((chunk, idx) => (
                      <div key={idx} className="py-3 flex flex-col gap-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-ink">
                            [Context {idx + 1}] {chunk.filename} (p. {chunk.page_number})
                          </span>
                          <span className="font-mono text-status-success font-semibold text-[11px]">
                            rerank score: {chunk.rerank_score?.toFixed(3)}
                          </span>
                        </div>
                        <p className="font-serif text-ink leading-relaxed bg-surface-subtle p-2.5 rounded border border-border">
                          "{chunk.content}"
                        </p>
                        {chunk.rationale && (
                          <p className="text-[11px] font-mono text-ink-muted">
                            Rationale: {chunk.rationale}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )
              ) : (
                selectedRun.retrieved_candidates?.length === 0 ? (
                  <p className="text-xs text-ink-muted italic py-4 text-center">No initial candidates recorded.</p>
                ) : (
                  <div className="divide-y divide-border">
                    {selectedRun.retrieved_candidates.map((chunk, idx) => (
                      <div key={idx} className="py-3 flex flex-col gap-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-ink">
                            [Candidate {idx + 1}] {chunk.filename} (p. {chunk.page_number})
                          </span>
                          <span className="font-mono text-brand font-semibold text-[11px]">
                            similarity: {chunk.similarity_score?.toFixed(3)}
                          </span>
                        </div>
                        <p className="font-serif text-ink leading-relaxed bg-surface-subtle p-2.5 rounded border border-border">
                          "{chunk.content}"
                        </p>
                        <div className="flex items-center justify-between text-[11px] font-mono text-ink-muted">
                          <span>Chunk ID: {chunk.chunk_id?.slice(0, 12)}...</span>
                          <span>Chars {chunk.char_start} - {chunk.char_end}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

