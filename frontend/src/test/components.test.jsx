import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { StatusDot } from '../components/common/StatusDot';
import { Modal } from '../components/common/Modal';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { getUIState, setUIState, resetLocalUIView, UI_STATE_KEYS } from '../utils/storage';

describe('Frontend Design System Tokens & Accessibility Suite', () => {
  describe('Button Component', () => {
    it('enforces disciplined corners and strictly forbids pill-shaped styling', () => {
      const { container } = render(<Button variant="primary">Submit Query</Button>);
      const btn = screen.getByRole('button', { name: /Submit Query/i });
      expect(btn).toBeInTheDocument();
      // Must NOT use rounded-full anywhere in its classes
      expect(btn.className).not.toContain('rounded-full');
      expect(btn.className).toContain('rounded');
    });

    it('renders secondary, outline, and danger variants properly', () => {
      const { rerender } = render(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-surface-subtle');

      rerender(<Button variant="danger">Delete Document</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-status-error');

      rerender(<Button variant="outline">Explore</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-transparent');
    });

    it('fires onClick callback and disables interaction when disabled or loading', () => {
      const handleClick = vi.fn();
      const { rerender } = render(<Button onClick={handleClick}>Clickable</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);

      rerender(<Button onClick={handleClick} disabled>Disabled</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1); // Not incremented

      rerender(<Button onClick={handleClick} loading>Loading</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1); // Not incremented
    });
  });

  describe('Input Component', () => {
    it('binds label htmlFor to input id for WCAG screen reader accessibility', () => {
      render(<Input label="Collection Name" helper="Choose a distinct title" />);
      const input = screen.getByLabelText(/Collection Name/i);
      expect(input).toBeInTheDocument();
      expect(input.id).toBe('collection-name');
      expect(screen.getByText('Choose a distinct title')).toBeInTheDocument();
    });

    it('renders validation error state with accessible styling', () => {
      render(<Input label="API Key" error="Key is required for external queries" />);
      const errorMsg = screen.getByText('Key is required for external queries');
      expect(errorMsg).toBeInTheDocument();
      expect(errorMsg).toHaveClass('text-status-error');
    });

    it('handles typing events accurately', () => {
      const handleChange = vi.fn();
      render(<Input placeholder="Search documents..." onChange={handleChange} />);
      const input = screen.getByPlaceholderText('Search documents...');
      fireEvent.change(input, { target: { value: 'Energy report' } });
      expect(handleChange).toHaveBeenCalled();
      expect(input.value).toBe('Energy report');
    });
  });

  describe('StatusDot Component', () => {
    it('renders a discrete color dot indicator and never a pill badge', () => {
      const { container } = render(<StatusDot status="indexed" />);
      expect(screen.getByText('Indexed')).toBeInTheDocument();
      const dot = container.querySelector('span > span');
      expect(dot).toBeInTheDocument();
      expect(dot.className).toContain('rounded-full'); // the dot itself is circular
      expect(container.firstChild.className).not.toContain('rounded-full'); // container is not a pill
    });

    it('applies pulse animation on in-progress stages', () => {
      const { container } = render(<StatusDot status="indexing" />);
      expect(screen.getByText('Indexing')).toBeInTheDocument();
      const dot = container.querySelector('span > span');
      expect(dot.className).toContain('animate-pulse');
    });

    it('applies error styling on failure statuses', () => {
      render(<StatusDot status="failed" label="Extraction Failed" />);
      const label = screen.getByText('Extraction Failed');
      expect(label.parentElement).toHaveClass('text-status-error');
    });
  });

  describe('Modal Component', () => {
    it('adheres to WCAG dialog semantics with role=dialog and aria-modal=true', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Purge Workspace Data">
          <p>Irreversible deletion confirmed.</p>
        </Modal>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(screen.getByText('Purge Workspace Data')).toBeInTheDocument();
      expect(screen.getByText('Irreversible deletion confirmed.')).toBeInTheDocument();
    });

    it('triggers onClose when Escape key is pressed', () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Dismissable Dialog">
          <p>Press Escape to exit.</p>
        </Modal>
      );
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('returns null and renders nothing when isOpen is false', () => {
      const { container } = render(
        <Modal isOpen={false} onClose={vi.fn()} title="Closed Dialog">
          <p>Should not exist</p>
        </Modal>
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('ErrorBoundary Component', () => {
    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Healthy View Content</div>
        </ErrorBoundary>
      );
      expect(screen.getByText('Healthy View Content')).toBeInTheDocument();
    });

    it('catches render error, displays plain message with diagnostic ID and Try Again action', () => {
      const ProblemComponent = () => {
        throw new Error('Test component render explosion');
      };
      // Suppress console.error during expected throw
      const originalError = console.error;
      console.error = vi.fn();

      render(
        <ErrorBoundary>
          <ProblemComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Application View Recovery')).toBeInTheDocument();
      expect(screen.getByText(/Your indexed documents, collections, and workspace sessions are completely safe/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reset Local View/i })).toBeInTheDocument();

      // Click Reset Local View to show confirmation
      fireEvent.click(screen.getByRole('button', { name: /Reset Local View/i }));
      expect(screen.getByText(/Your documents, vector index, and chat history will not be affected/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Confirm & Reload/i })).toBeInTheDocument();

      console.error = originalError;
    });
  });

  describe('Storage Utility & Safe State Recovery', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('returns default value when key does not exist', () => {
      const val = getUIState('non_existent_key', 'default_value');
      expect(val).toBe('default_value');
    });

    it('safely parses JSON values and writes with setUIState', () => {
      setUIState(UI_STATE_KEYS.RETRIEVAL_PARAMS, { topK: 5, rerankWeight: 0.6 });
      const read = getUIState(UI_STATE_KEYS.RETRIEVAL_PARAMS, null);
      expect(read).toEqual({ topK: 5, rerankWeight: 0.6 });
    });

    it('discards corrupted JSON key without throwing error or wiping other keys', () => {
      localStorage.setItem('valid_key', 'valid_data');
      localStorage.setItem('corrupted_key', '{ invalid json ...');
      const val = getUIState('corrupted_key', 'fallback_val', (data) => typeof data === 'object');
      expect(val).toBe('fallback_val');
      // Other keys remain intact
      expect(localStorage.getItem('valid_key')).toBe('valid_data');
    });

    it('resets only UI state keys and preserves visitor token or custom data', () => {
      setUIState(UI_STATE_KEYS.THEME, 'dark');
      setUIState(UI_STATE_KEYS.RAIL_EXPANDED, false);
      localStorage.setItem('custom_visitor_token', 'token_12345');

      resetLocalUIView();

      expect(localStorage.getItem(UI_STATE_KEYS.THEME)).toBeNull();
      expect(localStorage.getItem(UI_STATE_KEYS.RAIL_EXPANDED)).toBeNull();
      // Custom visitor data is preserved
      expect(localStorage.getItem('custom_visitor_token')).toBe('token_12345');
    });
  });
});
