import React from 'react';
import clsx from 'clsx';

export function Input({
  label,
  helper,
  error,
  icon: Icon,
  className = '',
  id,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-ink-muted mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-faint">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          className={clsx(
            'w-full bg-surface text-ink text-sm rounded border border-border px-3 py-2 transition-colors duration-150',
            'placeholder:text-ink-faint focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30',
            Icon && 'pl-9',
            error && 'border-status-error focus:border-status-error focus:ring-status-error/30',
            className
          )}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1 text-xs text-status-error font-medium">{error}</p>
      ) : helper ? (
        <p className="mt-1 text-xs text-ink-muted">{helper}</p>
      ) : null}
    </div>
  );
}

