import React from 'react';
import clsx from 'clsx';

/**
 * NexusRAG Status Indicator
 * Strict Rule: Status is a discrete colored dot plus text, never a pill badge.
 */
export function StatusDot({ status, label, className = '' }) {
  const normalized = (status || 'unknown').toLowerCase();

  const colorConfig = {
    indexed: { dot: 'bg-status-success', text: 'text-ink' },
    completed: { dot: 'bg-status-success', text: 'text-ink' },
    healthy: { dot: 'bg-status-success', text: 'text-ink' },
    
    uploading: { dot: 'bg-citation animate-pulse', text: 'text-ink' },
    validating: { dot: 'bg-citation animate-pulse', text: 'text-ink' },
    extracting: { dot: 'bg-citation animate-pulse', text: 'text-ink' },
    chunking: { dot: 'bg-citation animate-pulse', text: 'text-ink' },
    embedding: { dot: 'bg-citation animate-pulse', text: 'text-ink' },
    indexing: { dot: 'bg-citation animate-pulse', text: 'text-ink' },
    running: { dot: 'bg-citation animate-pulse', text: 'text-ink' },
    streaming: { dot: 'bg-citation animate-pulse', text: 'text-ink' },

    abstained: { dot: 'bg-status-warning', text: 'text-ink' },
    warning: { dot: 'bg-status-warning', text: 'text-ink' },

    failed: { dot: 'bg-status-error', text: 'text-status-error font-medium' },
    error: { dot: 'bg-status-error', text: 'text-status-error font-medium' },

    unknown: { dot: 'bg-ink-faint', text: 'text-ink-muted' },
  };

  const config = colorConfig[normalized] || colorConfig.unknown;
  const displayLabel = label || normalized.charAt(0).toUpperCase() + normalized.slice(1);

  return (
    <span className={clsx('inline-flex items-center gap-1.5 text-xs font-mono select-none', config.text, className)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full inline-block', config.dot)} aria-hidden="true" />
      <span>{displayLabel}</span>
    </span>
  );
}
