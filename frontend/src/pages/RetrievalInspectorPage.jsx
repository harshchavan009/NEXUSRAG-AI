import React, { useState, useEffect } from 'react';
import {
  Activity,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Layers,
  ArrowRight
} from 'lucide-react';
import { StatusDot } from '../components/common/StatusDot';
import { DAGTraceTimeline } from '../components/inspector/DAGTraceTimeline';
import { useInspectorRuns, useInspectorRunDetail } from '../api/queries';
import clsx from 'clsx';

export function RetrievalInspectorPage({ initialRunId = null }) {
  const { data: runs = [], isLoading: runsLoading } = useInspectorRuns();
  const [selectedRunId, setSelectedRunId] = useState(initialRunId);

  useEffect(() => {
    if (initialRunId) {
      setSelectedRunId(initialRunId);
    } else if (!selectedRunId && runs.length > 0) {
      setSelectedRunId(runs[0].id);
    }
  }, [initialRunId, runs, selectedRunId]);

  const { data: selectedRun, isLoading: runLoading } = useInspectorRunDetail(selectedRunId);

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-canvas">
      {/* Left Runs List (Recent Traces) */}
      <aside className="w-72 bg-surface border-r border-border flex flex-col flex-shrink-0 select-none">
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
                  onClick={() => setSelectedRunId(r.id)}
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
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-xs font-mono font-bold text-brand">
                  {selectedRun.id}
                </span>
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

            {/* Reranked Results Table */}
            <div className="p-4 rounded-md bg-surface border border-border shadow-xs flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-ink uppercase tracking-wide">
                Final Context Pool (Top-4 Reranked Chunks)
              </h3>

              {selectedRun.reranked_results?.length === 0 ? (
                <p className="text-xs text-ink-muted italic">No candidates reranked.</p>
              ) : (
                <div className="divide-y divide-border">
                  {selectedRun.reranked_results.map((chunk, idx) => (
                    <div key={idx} className="py-3 flex flex-col gap-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-ink">
                          [Source {idx + 1}] {chunk.filename} (p. {chunk.page_number})
                        </span>
                        <span className="font-mono text-status-success font-semibold text-[11px]">
                          score: {chunk.rerank_score?.toFixed(3)}
                        </span>
                      </div>
                      <p className="font-serif text-ink leading-relaxed bg-surface-subtle p-2.5 rounded border border-border">
                        "{chunk.content}"
                      </p>
                      <p className="text-[11px] font-mono text-ink-muted">
                        Rationale: {chunk.rationale}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
