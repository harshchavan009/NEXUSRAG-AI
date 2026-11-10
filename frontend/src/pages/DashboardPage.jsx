import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
  FolderPlus,
  BookOpen,
  Search,
  Filter,
  ArrowUpDown,
  FileText,
  Trash2,
  ExternalLink,
  ChevronRight,
  Folder,
  MessageSquare,
  ArrowUp,
  SlidersHorizontal,
  Plus,
  HelpCircle,
  MessageCircle,
  Info,
  ChevronDown
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { StatusDot } from '../components/common/StatusDot';
import { Modal } from '../components/common/Modal';
import { UploadTray } from '../components/upload/UploadTray';
import {
  useDocuments,
  useCollections,
  useSessions,
  useCreateCollection,
  useCreateSession,
  useDeleteDocument,
  useSystemStatus
} from '../api/queries';
import { VIEWS } from '../components/layout/RailNav';
import clsx from 'clsx';

export function DashboardPage({ onNavigate, onStartQuery, onOpenDocument }) {
  const [askQuery, setAskQuery] = useState('');
  const [selectedScope, setSelectedScope] = useState('all');
  const [selectedModel, setSelectedModel] = useState('Gemini 2.5 Flash');
  const [selectedLength, setSelectedLength] = useState('250 words');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [filterQuery, setFilterQuery] = useState('');
  const [activeFolderFilter, setActiveFolderFilter] = useState(null);

  const docsQuery = useDocuments();
  const collsQuery = useCollections();
  const sessionsQuery = useSessions();
  const systemStatusQuery = useSystemStatus();

  const documents = Array.isArray(docsQuery.data) ? docsQuery.data : (docsQuery.data?.documents || []);
  const collections = Array.isArray(collsQuery.data) ? collsQuery.data : (collsQuery.data?.collections || []);
  const sessions = Array.isArray(sessionsQuery.data) ? sessionsQuery.data : (sessionsQuery.data?.sessions || []);
  const statusData = systemStatusQuery.data;
  const docsLoading = docsQuery.isLoading;

  const createCollectionMutation = useCreateCollection();
  const createSessionMutation = useCreateSession();
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

  const handleCreateNewSession = async () => {
    const res = await createSessionMutation.mutateAsync('Research Session');
    onNavigate(VIEWS.RESEARCH);
  };

  // Filter documents by search string & optional folder selection
  const filteredDocs = documents.filter((doc) => {
    const name = (doc.original_filename || doc.filename || '').toLowerCase();
    const summary = (doc.summary || '').toLowerCase();
    const query = filterQuery.toLowerCase();
    const matchesSearch = name.includes(query) || summary.includes(query);
    const matchesFolder = activeFolderFilter ? doc.collection_id === activeFolderFilter : true;
    return matchesSearch && matchesFolder;
  });

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-canvas">
      {/* Left Sub-Navigation Rail (Design Reference 4 Layout) */}
      <aside className="w-56 bg-surface border-r border-border hidden md:flex flex-col justify-between flex-shrink-0 select-none">
        <div className="flex flex-col overflow-y-auto p-3 gap-5">
          {/* Workspace Switcher */}
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <button className="flex items-center gap-1.5 text-xs font-semibold text-ink hover:text-brand transition-colors">
              <span className="truncate max-w-[120px]">Workspace 1</span>
              <ChevronDown className="w-3.5 h-3.5 text-ink-muted" />
            </button>
            <button
              onClick={() => setIsCollectionModalOpen(true)}
              className="p-1 rounded hover:bg-surface-subtle text-ink-muted hover:text-ink transition-colors"
              title="New Collection"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Core Navigation Links */}
          <nav className="flex flex-col gap-1 text-xs">
            <button
              onClick={() => {
                setActiveFolderFilter(null);
                setFilterQuery('');
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md font-medium bg-brand/10 text-brand dark:bg-brand/20 transition-colors text-left"
            >
              <BookOpen className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('search-library-input');
                if (el) el.focus();
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-ink-muted hover:text-ink hover:bg-surface-subtle transition-colors text-left"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </nav>

          {/* Chats Section */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between px-2 text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
              <span>Chats</span>
              <span className="font-mono text-[10px]">{sessions.length}</span>
            </div>
            <div className="flex flex-col gap-0.5 text-xs">
              {sessions.length === 0 ? (
                <span className="px-2 py-1 text-[11px] text-ink-faint italic">No active chats</span>
              ) : (
                sessions.slice(0, 5).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onNavigate(VIEWS.RESEARCH)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded text-ink-muted hover:text-ink hover:bg-surface-subtle transition-colors text-left truncate"
                  >
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-ink-faint" />
                    <span className="truncate">{s.title || 'Untitled Session'}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Folders Section */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between px-2 text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
              <span>Folders</span>
              <button
                onClick={() => setIsCollectionModalOpen(true)}
                className="text-ink-faint hover:text-brand"
                title="Create Folder"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <div className="flex flex-col gap-0.5 text-xs">
              {collections.length === 0 ? (
                <span className="px-2 py-1 text-[11px] text-ink-faint italic">No folders yet</span>
              ) : (
                collections.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveFolderFilter(activeFolderFilter === c.id ? null : c.id)}
                    className={clsx(
                      'flex items-center gap-2 px-2 py-1.5 rounded transition-colors text-left truncate',
                      activeFolderFilter === c.id
                        ? 'bg-surface-subtle text-brand font-medium'
                        : 'text-ink-muted hover:text-ink hover:bg-surface-subtle'
                    )}
                  >
                    <Folder className="w-3.5 h-3.5 flex-shrink-0 text-brand/70" />
                    <span className="truncate">{c.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Bottom Status Card (Zero Static Data Compliant) */}
        <div className="p-3 border-t border-border flex flex-col gap-2 bg-surface-subtle/40 text-xs">
          <div className="p-2 rounded bg-surface border border-border flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-ink">Live Index</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-brand/10 text-brand">Active</span>
            </div>
            <p className="text-[11px] font-mono text-ink-muted">
              {statusData?.faiss_vectors ?? documents.length} vectors • {documents.length} docs
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-ink-muted pt-1 px-1">
            <button onClick={() => onNavigate(VIEWS.LANDING)} className="hover:text-ink transition-colors">Guide</button>
            <span>•</span>
            <button onClick={() => onNavigate(VIEWS.SETTINGS)} className="hover:text-ink transition-colors">Settings</button>
            <span>•</span>
            <button onClick={() => onNavigate(VIEWS.INSPECTOR)} className="hover:text-ink transition-colors">Traces</button>
          </div>
        </div>
      </aside>

      {/* Main Home Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-8 max-w-5xl mx-auto w-full">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-ink-muted tracking-wide uppercase">Home</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateNewSession}
            icon={Plus}
          >
            New Session
          </Button>
        </div>

        {/* Ask-First Composer Section (Design Reference 4) */}
        <section className="flex flex-col items-center text-center max-w-3xl mx-auto w-full">
          <h1 className="text-3xl sm:text-4xl font-semibold text-ink tracking-tight font-sans">
            <span className="sr-only">Welcome. What will you discover today?</span>
            <span aria-hidden="true" className="block text-3xl sm:text-4xl font-semibold text-ink">Welcome</span>
            <span aria-hidden="true" className="block text-xl sm:text-2xl text-ink-muted mt-1 font-normal">
              What will you discover today?
            </span>
          </h1>

          {/* Large Ask Box Container */}
          <form
            onSubmit={handleAskSubmit}
            className="w-full mt-6 bg-surface border border-border rounded-xl shadow-xs p-4 flex flex-col gap-3 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20 transition-all text-left"
          >
            <div className="flex items-start gap-3">
              <textarea
                value={askQuery}
                onChange={(e) => setAskQuery(e.target.value)}
                placeholder="Ask a question about your documents, e.g. 'What were the Q3 operating expenses?'"
                rows={3}
                className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none resize-none font-sans leading-relaxed"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAskSubmit(e);
                  }
                }}
              />
            </div>

            {/* Bottom Inner Composer Controls Bar */}
            <div className="flex flex-wrap items-center justify-between border-t border-border pt-3 gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                {/* Model Selector Chip */}
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="bg-surface-subtle hover:bg-surface border border-border rounded-md px-2.5 py-1 text-ink focus:outline-none focus:border-brand font-medium text-xs cursor-pointer"
                >
                  <option value="Gemini 2.5 Flash">Gemini 2.5 Flash</option>
                  <option value="Gemini 2.0 Flash">Gemini 2.0 Flash</option>
                </select>

                {/* Length Selector Chip */}
                <select
                  value={selectedLength}
                  onChange={(e) => setSelectedLength(e.target.value)}
                  className="bg-surface-subtle hover:bg-surface border border-border rounded-md px-2.5 py-1 text-ink focus:outline-none focus:border-brand font-medium text-xs cursor-pointer"
                >
                  <option value="250 words">250 words</option>
                  <option value="Brief Summary">Brief Summary</option>
                  <option value="Comprehensive">Comprehensive</option>
                </select>

                {/* Scope Selector Chip */}
                <select
                  value={selectedScope}
                  onChange={(e) => setSelectedScope(e.target.value)}
                  className="bg-surface-subtle hover:bg-surface border border-border rounded-md px-2.5 py-1 text-ink focus:outline-none focus:border-brand font-medium text-xs cursor-pointer"
                >
                  <option value="all">All Documents ({documents.length})</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Up-Arrow Submit Button (Reference 4 Style) */}
              <button
                type="submit"
                disabled={!askQuery.trim()}
                className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-all focus:outline-none',
                  askQuery.trim()
                    ? 'bg-[#B84A28] text-white hover:bg-[#9E3E20] shadow-sm cursor-pointer'
                    : 'bg-surface-subtle text-ink-faint border border-border cursor-not-allowed'
                )}
                title="Ask Documents"
                aria-label="Ask Documents"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* 4 Quick Action Tiles (Reference 4 Grid) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mt-4">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-surface border border-border hover:border-brand hover:bg-surface-subtle/80 transition-all text-center group shadow-2xs"
            >
              <div className="w-8 h-8 rounded-lg bg-surface-subtle group-hover:bg-brand/10 text-brand flex items-center justify-center transition-colors mb-1.5">
                <Upload className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-ink">Upload</span>
            </button>

            <button
              onClick={() => onNavigate(VIEWS.LIBRARY)}
              className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-surface border border-border hover:border-brand hover:bg-surface-subtle/80 transition-all text-center group shadow-2xs"
            >
              <div className="w-8 h-8 rounded-lg bg-surface-subtle group-hover:bg-brand/10 text-brand flex items-center justify-center transition-colors mb-1.5">
                <Folder className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-ink">Import</span>
            </button>

            <button
              onClick={handleCreateNewSession}
              className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-surface border border-border hover:border-brand hover:bg-surface-subtle/80 transition-all text-center group shadow-2xs"
            >
              <div className="w-8 h-8 rounded-lg bg-surface-subtle group-hover:bg-brand/10 text-brand flex items-center justify-center transition-colors mb-1.5">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-ink">Create</span>
            </button>

            <button
              onClick={() => onNavigate(VIEWS.LANDING)}
              className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-surface border border-border hover:border-brand hover:bg-surface-subtle/80 transition-all text-center group shadow-2xs"
            >
              <div className="w-8 h-8 rounded-lg bg-surface-subtle group-hover:bg-brand/10 text-brand flex items-center justify-center transition-colors mb-1.5">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-ink">Learn</span>
            </button>
          </div>
        </section>

        {/* Document Library Table (Reference 4 Table Layout) */}
        <section className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* View Settings, Sort, Filter Controls */}
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-surface text-xs font-medium text-ink hover:bg-surface-subtle transition-colors">
                <SlidersHorizontal className="w-3.5 h-3.5 text-ink-muted" />
                <span>View settings</span>
              </button>

              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-surface text-xs font-medium text-ink hover:bg-surface-subtle transition-colors">
                <ArrowUpDown className="w-3.5 h-3.5 text-ink-muted" />
                <span>Sort</span>
              </button>

              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-surface text-xs font-medium text-ink hover:bg-surface-subtle transition-colors">
                <Filter className="w-3.5 h-3.5 text-ink-muted" />
                <span>Filter</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-ink-faint absolute left-2.5 top-2.5" />
                <input
                  id="search-library-input"
                  type="text"
                  placeholder="Filter by title or summary..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-surface border border-border rounded-md text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand w-48 sm:w-60"
                />
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsUploadModalOpen(true)}
                icon={Plus}
              >
                Add or create
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-surface border border-border rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-subtle/80 border-b border-border text-ink-muted font-medium select-none">
                  <tr>
                    <th className="py-2.5 px-3 w-8">
                      <input type="checkbox" className="rounded border-border" disabled />
                    </th>
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3">Authors / Source</th>
                    <th className="py-2.5 px-3">Added</th>
                    <th className="py-2.5 px-3">Viewed</th>
                    <th className="py-2.5 px-3">File type</th>
                    <th className="py-2.5 px-3 w-2/5">Summary</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {docsLoading ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-ink-muted">
                        Loading indexed documents...
                      </td>
                    </tr>
                  ) : filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-ink-muted">
                        {documents.length === 0
                          ? 'No documents indexed yet. Upload a PDF, Markdown, or TXT file to begin.'
                          : 'No documents match the search filter.'}
                      </td>
                    </tr>
                  ) : (
                    filteredDocs.map((doc) => (
                      <tr
                        key={doc.id}
                        className="hover:bg-surface-subtle/50 transition-colors group cursor-pointer"
                        onClick={() => onOpenDocument(doc)}
                      >
                        <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" className="rounded border-border text-brand focus:ring-brand/30" />
                        </td>

                        <td className="py-3 px-3 font-medium text-ink flex items-center gap-2">
                          <FileText className="w-4 h-4 text-brand flex-shrink-0" />
                          <span className="truncate max-w-[200px]" title={doc.original_filename || doc.filename}>
                            {doc.original_filename || doc.filename}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-ink-muted truncate max-w-[120px]">
                          {doc.collection_id
                            ? collections.find((c) => c.id === doc.collection_id)?.name || 'General'
                            : 'Library Inquiry'}
                        </td>

                        <td className="py-3 px-3 text-ink-muted whitespace-nowrap">
                          Today
                        </td>

                        <td className="py-3 px-3 text-ink-muted whitespace-nowrap">
                          {doc.page_count} p • {doc.chunk_count} ch
                        </td>

                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-surface-subtle border border-border text-ink-muted uppercase">
                            {doc.file_type || 'Document'}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-serif text-[11px] text-ink-muted leading-relaxed line-clamp-2">
                          {doc.summary || (
                            <span className="italic text-ink-faint">Summary generated upon ingestion...</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
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
            onUploadComplete={() => setIsUploadModalOpen(false)}
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
      </main>
    </div>
  );
}
