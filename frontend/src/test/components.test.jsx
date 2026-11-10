import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { StatusDot } from '../components/common/StatusDot';
import { Modal } from '../components/common/Modal';

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
});
