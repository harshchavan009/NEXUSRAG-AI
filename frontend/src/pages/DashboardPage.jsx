import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
  FolderPlus,
  BookOpen,
  Search,
  Filter,
  FileText,
  Trash2,
  ExternalLink,
  ChevronRight,
  Database
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { StatusDot } from '../components/common/StatusDot';
import { Modal } from '../components/common/Modal';
import { UploadTray } from '../components/upload/UploadTray';
import {
  useDocuments,
  useCollections,
  useCreateCollection,
  useDeleteDocument
} from '../api/queries';
import { VIEWS } from '../components/layout/RailNav';
import clsx from 'clsx';

export function DashboardPage({ onNavigate, onStartQuery, onOpenDocument }) {
  const [askQuery, setAskQuery] = useState('');
  const [selectedScope, setSelectedScope] = useState('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [filterQuery, setFilterQuery] = useState('');

  const docsQuery = useDocuments();
  const collsQuery = useCollections();
  const documents = Array.isArray(docsQuery.data) ? docsQuery.data : (docsQuery.data?.documents || []);
  const collections = Array.isArray(collsQuery.data) ? collsQuery.data : (collsQuery.data?.collections || []);
  const docsLoading = docsQuery.isLoading;
  const createCollectionMutation = useCreateCollection();
  const deleteDocMutation = useDeleteDocument();

  const handleAskSubmit = (e) => {
    e.preventDefault();
    if (!askQuery.trim()) return;

    const scopeObj = {
      collection_ids: selectedScope === 'all' ? [] : [selectedScope],
      document_ids: [],
    };

    onStartQuery(askQuery.trim(), scopeObj);
    onNavigate(VIEWS.RESEARCH);
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    await createCollectionMutation.mutateAsync({ name: newCollectionName.trim() });
    setNewCollectionName('');
    setIsCollectionModalOpen(false);
  };

  // Filter documents by search string
  const filteredDocs = documents.filter((doc) => {
    const name = (doc.original_filename || doc.filename || '').toLowerCase();
    const summary = (doc.summary || '').toLowerCase();
    const query = filterQuery.toLowerCase();
    return name.includes(query) || summary.includes(query);
  });

  return (
    <div className="flex-1 overflow-y-auto bg-canvas p-6 max-w-6xl mx-auto flex flex-col gap-8">
      {/* Ask-First Composer Hero (Design Reference 4) */}
      <section className="flex flex-col items-center text-center max-w-3xl mx-auto w-full pt-4">
        <h2 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
          Welcome. What will you discover today?
        </h2>
        <p className="text-sm text-ink-muted mt-1 font-serif">
          Ask questions across all indexed collections. Answers are synthesized with verified citations.
        </p>

        {/* Large Ask Composer Box */}
        <form
          onSubmit={handleAskSubmit}
          className="w-full mt-6 bg-surface border border-border rounded-md shadow-sm p-3 flex flex-col gap-3 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand/30 transition-all"
        >
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-5 h-5 text-brand flex-shrink-0 mt-1" />
            <textarea
              value={askQuery}
              onChange={(e) => setAskQuery(e.target.value)}
              placeholder="Ask a question about your documents, e.g. 'What were the Q3 operating expenses?'"
              rows={2}
              className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none resize-none font-sans"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAskSubmit(e);
                }
              }}
            />
          </div>

          <div className="flex items-center justify-between border-t border-border pt-2.5 text-xs">
            {/* Scope Selector */}
            <div className="flex items-center gap-2">
              <span className="text-ink-muted">Scope:</span>
              <select
                value={selectedScope}
                onChange={(e) => setSelectedScope(e.target.value)}
                className="bg-surface-subtle border border-border rounded px-2.5 py-1 text-ink focus:outline-none focus:border-brand font-medium"
              >
                <option value="all">All Documents ({documents.length})</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!askQuery.trim()}
              icon={ChevronRight}
            >
              Ask Documents
            </Button>
          </div>
        </form>

        {/* 3 Quick Action Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mt-4">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-3 p-3 rounded bg-surface border border-border hover:border-brand hover:bg-surface-subtle transition-colors text-left"
          >
            <div className="w-8 h-8 rounded bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-ink">Upload Documents</span>
              <span className="block text-[11px] text-ink-muted">PDF, TXT, Markdown</span>
            </div>
          </button>

          <button
            onClick={() => setIsCollectionModalOpen(true)}
            className="flex items-center gap-3 p-3 rounded bg-surface border border-border hover:border-brand hover:bg-surface-subtle transition-colors text-left"
          >
            <div className="w-8 h-8 rounded bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-ink">New Collection</span>
              <span className="block text-[11px] text-ink-muted">Group into knowledge bases</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate(VIEWS.RESEARCH)}
            className="flex items-center gap-3 p-3 rounded bg-surface border border-border hover:border-brand hover:bg-surface-subtle transition-colors text-left"
          >
            <div className="w-8 h-8 rounded bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-ink">Research Desk</span>
              <span className="block text-[11px] text-ink-muted">3-panel synthesis view</span>
            </div>
          </button>
        </div>
      </section>

      {/* Document Library Table with Real Summary Column (Design Reference 4) */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-ink">Document Library</h3>
            <span className="text-xs font-mono text-ink-muted bg-surface px-2 py-0.5 rounded border border-border">
              {documents.length} indexed
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-ink-faint absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filter by title or summary..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-surface border border-border rounded text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand w-48 sm:w-64"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface border border-border rounded-md shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle border-b border-border text-ink-muted font-medium">
                <tr>
                  <th className="py-2.5 px-4">Title</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Pages / Chunks</th>
                  <th className="py-2.5 px-4 w-1/3">Extracted Summary</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {docsLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-ink-muted">
                      Loading indexed documents...
                    </td>
                  </tr>
                ) : filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-ink-muted">
                      {documents.length === 0
                        ? 'No documents indexed yet. Upload a PDF, Markdown, or TXT file to begin.'
                        : 'No documents match the search filter.'}
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => (
                    <tr
                      key={doc.id}
                      className="hover:bg-surface-subtle/60 transition-colors group"
                    >
                      <td className="py-3 px-4 font-medium text-ink flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand flex-shrink-0" />
                        <span className="truncate max-w-xs" title={doc.original_filename}>
                          {doc.original_filename}
                        </span>
                      </td>

                      <td className="py-3 px-4 uppercase font-mono text-[11px] text-ink-muted">
                        {doc.file_type}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-ink-muted">
                        {doc.page_count} p • {doc.chunk_count} ch
                      </td>

                      <td className="py-3 px-4 font-serif text-[11px] text-ink-muted leading-relaxed line-clamp-2">
                        {doc.summary || (
                          <span className="italic text-ink-faint">Summary generating...</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <StatusDot status={doc.status} />
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={() => onOpenDocument(doc)}
                            className="p-1 text-ink-muted hover:text-brand rounded hover:bg-surface-subtle"
                            title="Open in Document Reader"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteDocMutation.mutate(doc.id)}
                            className="p-1 text-ink-muted hover:text-status-error rounded hover:bg-surface-subtle"
                            title="Delete document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Documents to Workspace"
        maxWidth="max-w-xl"
      >
        <UploadTray
          collections={collections}
          onUploadComplete={() => {}}
        />
      </Modal>

      {/* Create Collection Modal */}
      <Modal
        isOpen={isCollectionModalOpen}
        onClose={() => setIsCollectionModalOpen(false)}
        title="Create Knowledge Base Collection"
      >
        <form onSubmit={handleCreateCollection} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-ink-muted mb-1.5">
              Collection Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Financial Reports 2024"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-ink focus:outline-none focus:border-brand"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setIsCollectionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={createCollectionMutation.isPending}>
              Create Collection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

