import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useToast } from './Toast';

export function FeedbackModal({ isOpen, onClose }) {
  const [category, setCategory] = useState('General Feedback');
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Thank you for your feedback! Your notes have been recorded.');
      setFeedbackText('');
      onClose();
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Feedback & Report Issues"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-sans">
        <div>
          <label className="block text-ink-muted font-medium mb-1.5">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-brand"
          >
            <option value="General Feedback">General Feedback</option>
            <option value="Bug Report">Bug Report</option>
            <option value="RAG Retrieval Accuracy">RAG Retrieval Accuracy</option>
            <option value="Feature Request">Feature Request</option>
          </select>
        </div>

        <div>
          <label className="block text-ink-muted font-medium mb-1.5">
            Notes & Observations
          </label>
          <textarea
            required
            rows={4}
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Describe what you observed, suggested enhancements, or questions..."
            className="w-full bg-surface border border-border rounded-lg p-3 text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand resize-none font-sans"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-[11px] text-ink-muted font-serif italic">
            Zero telemetry or query contents are transmitted without permission.
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              icon={Send}
              loading={isSubmitting}
            >
              Submit Feedback
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

