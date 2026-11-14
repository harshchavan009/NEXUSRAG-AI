import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  BookOpen,
  Folder,
  MessageSquare,
  FileText,
  SlidersHorizontal,
  Settings,
  Upload,
  Plus,
  ExternalLink,
  Trash2,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { VIEWS } from '../layout/RailNav';
import { useDocuments, useCollections, useSessions, useLoadSampleDocuments } from '../../api/queries';
import { useToast } from './Toast';
import clsx from 'clsx';

export function CommandPalette({ isOpen, onClose, onNavigate, onOpenDocument }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const docsQuery = useDocuments();
  const collsQuery = useCollections();
  const sessionsQuery = useSessions();
  const loadSamplesMutation = useLoadSampleDocuments();
  const toast = useToast();

  const documents = Array.isArray(docsQuery.data) ? docsQuery.data : (docsQuery.data?.documents || []);
  const collections = Array.isArray(collsQuery.data) ? collsQuery.data : (collsQuery.data?.collections || []);
  const sessions = Array.isArray(sessionsQuery.data) ? sessionsQuery.data : (sessionsQuery.data?.sessions || []);

  // Reset query and selected index on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Static Navigation items
  const navItems = [
    { id: 'nav-dash', category: 'Navigation', label: 'Go to Dashboard', icon: BookOpen, action: () => onNavigate(VIEWS.DASHBOARD) },
    { id: 'nav-kb', category: 'Navigation', label: 'Go to Knowledge Bases', icon: Folder, action: () => onNavigate(VIEWS.LIBRARY) },
    { id: 'nav-desk', category: 'Navigation', label: 'Go to Research Desk', icon: MessageSquare, action: () => onNavigate(VIEWS.RESEARCH) },
    { id: 'nav-reader', category: 'Navigation', label: 'Go to Document Reader', icon: FileText, action: () => onNavigate(VIEWS.READER) },
    { id: 'nav-insp', category: 'Navigation', label: 'Go to Retrieval Inspector', icon: SlidersHorizontal, action: () => onNavigate(VIEWS.INSPECTOR) },
    { id: 'nav-sett', category: 'Navigation', label: 'Go to System Settings', icon: Settings, action: () => onNavigate(VIEWS.SETTINGS) },
    { id: 'nav-pub', category: 'Navigation', label: 'View Public Landing Page', icon: ExternalLink, action: () => onNavigate(VIEWS.LANDING) },
  ];

  // Action items
  const actionItems = [
    {
      id: 'act-sample',
      category: 'Actions',
      label: 'Add Sample Documents (4 benchmark documents)',
      icon: Sparkles,
      action: async () => {
        try {
          toast.info('Ingesting sample research documents in background...');
          await loadSamplesMutation.mutateAsync();
          toast.success('Sample documents ingested into FAISS vector store.');
        } catch (err) {
          toast.error('Failed to ingest sample documents.');
        }
      }
    },
    {
      id: 'act-new-session',
      category: 'Actions',
      label: 'Create New Research Thread',
      icon: Plus,
      action: () => {
        onNavigate(VIEWS.RESEARCH);
      }
    },
  ];

  // Ingested Documents
  const documentItems = useMemo(() => {
    return documents.slice(0, 10).map((doc) => ({
      id: `doc-${doc.id}`,
      category: 'Documents',
      label: doc.original_filename || doc.filename,
      icon: FileText,
      detail: `${doc.file_type?.toUpperCase() || 'PDF'} • ${doc.chunk_count || 0} chunks`,
      action: () => {
        onOpenDocument(doc);
        onNavigate(VIEWS.READER);
      }
    }));
  }, [documents, onOpenDocument, onNavigate]);

  // Combine and filter
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = [...navItems, ...actionItems, ...documentItems];
    if (!q) return all;
    return all.filter((item) =>
      item.label.toLowerCase().includes(q) ||
      (item.category && item.category.toLowerCase().includes(q))
    );
  }, [query, documentItems]);

  // Clamp selected index
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (filteredItems.length || 1)) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredItems[selectedIndex];
      if (selected) {
        selected.action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-xs select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-surface border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col font-sans animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-surface-subtle/40">
          <Search className="w-4 h-4 text-ink-muted flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, page name, or search documents..."
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
          />
          <kbd className="hidden sm:inline-block font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-ink-muted">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="max-h-80 overflow-y-auto p-2 flex flex-col gap-0.5 text-xs">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-ink-muted">
              No commands or documents found matching "{query}"
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={clsx(
                    'flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors',
                    isSelected ? 'bg-brand/10 text-brand' : 'text-ink hover:bg-surface-subtle'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={clsx('w-4 h-4 flex-shrink-0', isSelected ? 'text-brand' : 'text-ink-muted')} />
                    <span className="font-medium truncate">{item.label}</span>
                    {item.detail && (
                      <span className="text-[11px] text-ink-muted truncate">• {item.detail}</span>
                    )}
                  </div>
                  <span className="text-[10px] text-ink-faint font-mono uppercase ml-2 flex-shrink-0">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-surface-subtle/50 text-[10px] text-ink-muted font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>NexusRAG Quick Actions</span>
        </div>
      </div>
    </div>
  );
}

