import React from 'react';
import clsx from 'clsx';

/**
 * NexusRAG Button Component
 * Enforces Option 1 visual identity: disciplined corners (no pills), high contrast, purposeful motion.
 */
export function Button({
  children,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'ghost', 'danger'
  size = 'md', // 'sm', 'md', 'lg'
  icon: Icon,
  disabled = false,
  loading = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:ring-offset-1 select-none disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 rounded-xs gap-1.5',
    md: 'text-sm px-3.5 py-2 rounded gap-2',
    lg: 'text-base px-4 py-2.5 rounded-md gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-brand text-white hover:bg-brand-hover shadow-xs active:translate-y-px',
    secondary: 'bg-surface-subtle text-ink hover:bg-border/60 border border-border',
    outline: 'bg-transparent text-ink border border-border hover:bg-surface-subtle hover:border-border-strong',
    ghost: 'bg-transparent text-ink-muted hover:text-ink hover:bg-surface-subtle',
    danger: 'bg-status-error text-white hover:opacity-90 shadow-xs',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={clsx(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon ? (
        <Icon className={clsx(size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
