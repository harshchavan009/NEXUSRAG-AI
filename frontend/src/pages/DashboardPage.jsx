import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
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
  Layers,
  Activity,
  CheckCircle2,
  Database
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
  useLoadSampleDocuments,
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
  const [sortAsc, setSortAsc] = useState(true);
  const [showSummaryColumn, setShowSummaryColumn] = useState(true);
  const [isSampleLoading, setIsSampleLoading] = useState(false);

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
  const loadSampleMutation = useLoadSampleDocuments();

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
    await createSessionMutation.mutateAsync('Research Session');
    onNavigate(VIEWS.RESEARCH);
  };

  const handleLoadSamples = async () => {
    setIsSampleLoading(true);
    try {
      await loadSampleMutation.mutateAsync();
    } catch (err) {
      console.error('Failed to load sample documents:', err);
    } finally {
      setIsSampleLoading(false);
    }
  };

  // Filter documents by search string
  const filteredDocs = documents.filter((doc) => {
    const name = (doc.original_filename || doc.filename || '').toLowerCase();
    const summary = (doc.summary || '').toLowerCase();
    const query = filterQuery.toLowerCase();
    return name.includes(query) || summary.includes(query);
  });

  const sortedDocs = [...filteredDocs].sort((a, b) => {
    const nameA = (a.original_filename || a.filename || '').toLowerCase();
    const nameB = (b.original_filename || b.filename || '').toLowerCase();
    return sortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
  });

  const totalChunks = statusData?.faiss_vectors ?? documents.reduce((sum, d) => sum + (d.chunk_count || 0), 0);
  const totalPages = documents.reduce((sum, d) => sum + (d.page_count || 1), 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-canvas p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* 1. Header Bar with Overview and Quick CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-ink font-sans">
              Research Workspace. Query your indexed collections.
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-brand/10 text-brand">
              Live Workspace
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Query your indexed collections with grounded citations and transparent retrieval traces
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadSamples}
            disabled={isSampleLoading}
            icon={FileText}
          >
            {isSampleLoading ? 'Loading Samples...' : 'Load Sample Docs'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            icon={Upload}
          >
            Upload Documents
          </Button>
        </div>
      </div>

      {/* 2. Live 4-Card Aggregate Metrics Grid (Zero Static Data Compliant) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Documents */}
        <div className="p-4 rounded-xl bg-surface border border-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Total Documents</span>
            <div className="w-8 h-8 rounded-lg bg-surface-subtle flex items-center justify-center text-brand">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-ink tracking-tight">{documents.length}</div>
            <p className="text-[11px] text-ink-muted mt-0.5 flex items-center gap-1">
              <span>{documents.filter((d) => d.status === 'indexed').length} indexed</span>
              <span>•</span>
              <span>{totalPages} {totalPages === 1 ? 'page' : 'pages'}</span>
            </p>
          </div>
        </div>

        {/* Card 2: Knowledge Collections */}
        <div className="p-4 rounded-xl bg-surface border border-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Collections</span>
            <div className="w-8 h-8 rounded-lg bg-surface-subtle flex items-center justify-center text-brand">
              <Folder className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-ink tracking-tight">{collections.length}</div>
            <p className="text-[11px] text-ink-muted mt-0.5">
              Domain-isolated namespaces
            </p>
          </div>
        </div>

        {/* Card 3: Vector Chunks */}
        <div className="p-4 rounded-xl bg-surface border border-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Vector Chunks</span>
            <div className="w-8 h-8 rounded-lg bg-surface-subtle flex items-center justify-center text-brand">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-ink tracking-tight">{totalChunks}</div>
            <p className="text-[11px] text-ink-muted mt-0.5">
              768-dim embeddings in FAISS
            </p>
          </div>
        </div>

        {/* Card 4: Research Sessions */}
        <div className="p-4 rounded-xl bg-surface border border-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Active Sessions</span>
            <div className="w-8 h-8 rounded-lg bg-surface-subtle flex items-center justify-center text-brand">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-ink tracking-tight">{sessions.length}</div>
            <p className="text-[11px] text-ink-muted mt-0.5">
              Multi-turn synthesis threads
            </p>
          </div>
        </div>
      </div>

      {/* 3. Ask-First Composer Section */}
      <section className="bg-surface border border-border rounded-xl shadow-xs p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand" />
            <h2 className="text-sm font-semibold text-ink">Ask Your Knowledge Base</h2>
          </div>
          <span className="text-[11px] text-ink-muted hidden sm:inline">
            LangGraph 9-node DAG retrieval with sentence citations
          </span>
        </div>

        <form onSubmit={handleAskSubmit} className="flex flex-col gap-3">
          <div className="relative">
            <textarea
              value={askQuery}
              onChange={(e) => setAskQuery(e.target.value)}
              placeholder="Ask a question about your documents, e.g. 'What were the key findings in the clean energy report?'"
              rows={3}
              className="w-full bg-canvas/60 border border-border rounded-lg p-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 resize-none font-sans leading-relaxed"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAskSubmit(e);
                }
              }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              {/* Model Selector */}
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-surface-subtle hover:bg-surface border border-border rounded-md px-2.5 py-1 text-ink focus:outline-none focus:border-brand font-medium text-xs cursor-pointer"
              >
                <option value="Gemini 2.5 Flash">Gemini 2.5 Flash</option>
                <option value="Gemini 2.0 Flash">Gemini 2.0 Flash</option>
              </select>

              {/* Length Selector */}
              <select
                value={selectedLength}
                onChange={(e) => setSelectedLength(e.target.value)}
                className="bg-surface-subtle hover:bg-surface border border-border rounded-md px-2.5 py-1 text-ink focus:outline-none focus:border-brand font-medium text-xs cursor-pointer"
              >
                <option value="250 words">250 words</option>
                <option value="Brief Summary">Brief Summary</option>
                <option value="Comprehensive">Comprehensive</option>
              </select>

              {/* Scope Selector */}
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

            <button
              type="submit"
              disabled={!askQuery.trim()}
              className={clsx(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-xs',
                askQuery.trim()
                  ? 'bg-brand text-white hover:bg-brand-hover cursor-pointer'
                  : 'bg-surface-subtle text-ink-faint border border-border cursor-not-allowed'
              )}
            >
              <span>Ask Documents</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* 4 Functional Quick Action Cards underneath */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-border/40">
          <button
            onClick={handleLoadSamples}
            disabled={isSampleLoading}
            className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-surface-subtle/50 hover:bg-surface hover:border-brand transition-all text-left group"
          >
            <FileText className="w-4 h-4 text-brand flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-medium text-ink truncate">Add Sample Docs</div>
              <div className="text-[10px] text-ink-muted truncate">Ingest 4 real papers</div>
            </div>
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-surface-subtle/50 hover:bg-surface hover:border-brand transition-all text-left group"
          >
            <Upload className="w-4 h-4 text-brand flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-medium text-ink truncate">Upload Files</div>
              <div className="text-[10px] text-ink-muted truncate">PDF, MD, TXT, DOCX</div>
            </div>
          </button>

          <button
            onClick={handleCreateNewSession}
            className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-surface-subtle/50 hover:bg-surface hover:border-brand transition-all text-left group"
          >
            <Plus className="w-4 h-4 text-brand flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-medium text-ink truncate">New Thread</div>
              <div className="text-[10px] text-ink-muted truncate">Multi-turn synthesis</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate(VIEWS.INSPECTOR)}
            className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-surface-subtle/50 hover:bg-surface hover:border-brand transition-all text-left group"
          >
            <SlidersHorizontal className="w-4 h-4 text-brand flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-medium text-ink truncate">DAG Inspector</div>
              <div className="text-[10px] text-ink-muted truncate">Trace retrieval nodes</div>
            </div>
          </button>
        </div>
      </section>

      {/* 4. Split Section: Left (Recent Ingested Documents Table) & Right (Recent Sessions + System Health) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols on lg): Ingested Documents Table */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-ink">Recent Ingested Documents</h3>
              <span className="text-xs text-ink-muted">({filteredDocs.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-ink-faint absolute left-2.5 top-2.5" />
                <input
                  id="search-library-input"
                  type="text"
                  placeholder="Search documents..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 text-xs bg-surface border border-border rounded-md text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand w-40 sm:w-52"
                />
              </div>
              <button
                onClick={() => setSortAsc((prev) => !prev)}
                className="p-1.5 border border-border bg-surface rounded-md text-ink-muted hover:text-ink transition-colors"
                title={`Sort (${sortAsc ? 'A-Z' : 'Z-A'})`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowSummaryColumn((prev) => !prev)}
                className={clsx(
                  'px-2 py-1 rounded-md border text-xs font-medium transition-colors',
                  showSummaryColumn
                    ? 'border-brand/40 bg-brand/5 text-brand'
                    : 'border-border bg-surface text-ink-muted hover:text-ink'
                )}
                title="Toggle generated summary column"
              >
                Summary
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-surface border border-border rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-subtle/80 border-b border-border text-ink-muted font-medium select-none">
                  <tr>
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3">Collection</th>
                    <th className="py-2.5 px-3">Scope</th>
                    <th className="py-2.5 px-3">Format</th>
                    {showSummaryColumn && <th className="py-2.5 px-3 w-1/3">Key Takeaway</th>}
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {docsLoading ? (
                    <tr>
                      <td colSpan={showSummaryColumn ? 6 : 5} className="py-8 text-center text-ink-muted">
                        Loading indexed documents...
                      </td>
                    </tr>
                  ) : sortedDocs.length === 0 ? (
                    <tr>
                      <td colSpan={showSummaryColumn ? 6 : 5} className="py-12 text-center text-ink-muted">
                        {documents.length === 0
                          ? 'No documents indexed yet. Click "Add Sample Docs" or upload a file to begin.'
                          : 'No documents match the search filter.'}
                      </td>
                    </tr>
                  ) : (
                    sortedDocs.map((doc) => (
                      <tr
                        key={doc.id}
                        className="hover:bg-surface-subtle/50 transition-colors group cursor-pointer"
                        onClick={() => onOpenDocument(doc)}
                      >
                        <td className="py-2.5 px-3 font-medium text-ink flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-brand flex-shrink-0" />
                          <span className="truncate max-w-[180px]" title={doc.original_filename || doc.filename}>
                            {doc.original_filename || doc.filename}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-ink-muted truncate max-w-[110px]">
                          {doc.collection_name ||
                            (doc.collection_id
                              ? collections.find((c) => c.id === doc.collection_id)?.name
                              : null) ||
                            'Unassigned'}
                        </td>
                        <td className="py-2.5 px-3 text-ink-muted whitespace-nowrap">
                          {doc.page_count ? `${doc.page_count} p` : '1 p'} • {doc.chunk_count || 0} ch
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-surface-subtle border border-border text-ink-muted uppercase">
                            {doc.file_type || 'Doc'}
                          </span>
                        </td>
                        {showSummaryColumn && (
                          <td className="py-2.5 px-3 font-serif text-[11px] text-ink-muted leading-relaxed line-clamp-2">
                            {doc.summary || (
                              <span className="italic text-ink-faint">Ingested and ready for research</span>
                            )}
                          </td>
                        )}
                        <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
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
        </div>

        {/* Right Column (1 Col on lg): Recent Sessions Feed & System Diagnostics */}
        <div className="flex flex-col gap-4">
          {/* Sessions Feed */}
          <div className="p-4 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                <MessageSquare className="w-4 h-4 text-brand" />
                <span>Recent Research Sessions</span>
              </div>
              <button
                onClick={handleCreateNewSession}
                className="p-1 rounded hover:bg-surface-subtle text-ink-muted hover:text-ink transition-colors"
                title="Start New Session"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-1 text-xs">
              {sessions.length === 0 ? (
                <div className="py-6 text-center text-ink-muted text-xs">
                  <p>No active sessions yet.</p>
                  <button
                    onClick={handleCreateNewSession}
                    className="mt-2 text-brand hover:underline font-medium text-[11px]"
                  >
                    + Start your first session
                  </button>
                </div>
              ) : (
                sessions.slice(0, 6).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onNavigate(VIEWS.RESEARCH)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-subtle transition-colors text-left group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MessageSquare className="w-3.5 h-3.5 text-ink-muted group-hover:text-brand flex-shrink-0" />
                      <span className="truncate text-ink font-medium text-xs">
                        {s.title || 'Untitled Session'}
                      </span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-ink-faint group-hover:text-ink flex-shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Engine & Pipeline Health Card */}
          <div className="p-4 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-ink">Pipeline Status</span>
              <StatusDot
                status={statusData?.status === 'healthy' ? 'ready' : 'degraded'}
                text={statusData?.status === 'healthy' ? 'Healthy' : 'Degraded'}
              />
            </div>

            <div className="space-y-1.5 pt-1 text-[11px] text-ink-muted border-t border-border">
              <div className="flex justify-between">
                <span>Vector Store:</span>
                <span className="font-mono text-ink">FAISS IndexFlatIP</span>
              </div>
              <div className="flex justify-between">
                <span>Dimensions:</span>
                <span className="font-mono text-ink">768-dim</span>
              </div>
              <div className="flex justify-between">
                <span>Metadata DB:</span>
                <span className="font-mono text-ink capitalize">{statusData?.database_type || 'SQLite'}</span>
              </div>
              <div className="flex justify-between">
                <span>Tenant Scope:</span>
                <span className="font-mono text-ink">Session-Scoped</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between text-[11px]">
              <button
                onClick={() => onNavigate(VIEWS.SETTINGS)}
                className="text-brand hover:underline font-medium"
              >
                View System Settings →
              </button>
              <button
                onClick={() => onNavigate(VIEWS.INSPECTOR)}
                className="text-ink-muted hover:text-ink"
              >
                View Traces →
              </button>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
}
