import React from 'react';
import { CheckCircle2, AlertTriangle, Clock, ArrowRight, CornerDownRight } from 'lucide-react';
import clsx from 'clsx';

export function DAGTraceTimeline({ run }) {
  if (!run) {
    return (
      <div className="p-8 text-center text-xs text-ink-muted">
        Select a trace execution to view the LangGraph execution flow.
      </div>
    );
  }

  const stageDurations = run.stage_durations || {};
  const isAbstention = run.status === 'abstained';

  const nodes = [
    { id: 'validate_input', name: '1. validate_input', desc: 'Length & scope boundaries' },
    { id: 'rewrite_query', name: '2. rewrite_query', desc: 'Conversational contextualization' },
    { id: 'retrieve', name: '3. retrieve', desc: 'FAISS IndexIDMap2 + FlatIP' },
    { id: 'rerank', name: '4. rerank', desc: 'Relevance scoring & top-4 prune' },
    { id: 'check_evidence', name: '5. check_evidence', desc: 'Sufficiency gate (0.65 threshold)' },
    ...(isAbstention
      ? [{ id: 'abstain', name: '6. abstain', desc: 'Calibrated honest refusal' }]
      : [
          { id: 'generate', name: '7. generate', desc: 'Grounded synthesis token stream' },
          { id: 'validate_citations', name: '8. validate_citations', desc: 'Server-side hallucination strip' },
          { id: 'validate_groundedness', name: '9. validate_groundedness', desc: 'Faithfulness judge' },
        ]),
    { id: 'finalise', name: '10. finalise', desc: 'PostgreSQL trace & citations commit' },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <h4 className="text-xs font-semibold text-ink uppercase tracking-wide">
          LangGraph 9-Node Execution Path
        </h4>
        <div className="flex items-center gap-2 text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-ink-muted" />
          <span className="font-semibold text-ink">{stageDurations.total || 0} ms total</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {nodes.map((node, index) => {
          const duration = stageDurations[node.id];
          const isNodeActive = duration !== undefined;

          return (
            <div
              key={node.id}
              className={clsx(
                'flex items-center justify-between p-3 rounded border text-xs transition-colors',
                isNodeActive
                  ? 'bg-surface border-border shadow-xs'
                  : 'bg-surface-subtle/50 border-border/50 opacity-60'
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={clsx(
                    'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold',
                    isNodeActive
                      ? 'bg-brand/10 text-brand dark:bg-brand/20'
                      : 'bg-surface-subtle text-ink-faint'
                  )}
                >
                  {index + 1}
                </span>

                <div>
                  <div className="font-medium text-ink flex items-center gap-2">
                    <span>{node.name}</span>
                    {node.id === 'check_evidence' && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-subtle border border-border text-ink-muted">
                        score: {run.sufficiency_score?.toFixed(3)}
                      </span>
                    )}
                    {node.id === 'validate_groundedness' && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-subtle border border-border text-status-success font-semibold">
                        faithfulness: {run.groundedness_score?.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-ink-muted">{node.desc}</p>
                </div>
              </div>

              {/* Timing */}
              <div className="flex items-center gap-2 font-mono text-[11px] text-ink-muted">
                {duration !== undefined ? (
                  <>
                    <span className="font-medium text-ink">{duration} ms</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                  </>
                ) : (
                  <span>skipped</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

