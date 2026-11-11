import React, { useState } from 'react';
import {
  Folder,
  FolderPlus,
  FileText,
  Trash2,
  RefreshCw,
  ExternalLink,
  Search,
  LayoutList,
  LayoutGrid,
  Bell,
  User,
  ChevronDown,
  Plus
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { StatusDot } from '../components/common/StatusDot';
import { UploadTray } from '../components/upload/UploadTray';
import { Modal } from '../components/common/Modal';
import {
  useDocuments,
  useCollections,
  useCreateCollection,
  useDeleteCollection,
  useDeleteDocument,
  useReindexDocument
} from '../api/queries';
import clsx from 'clsx';

export function KnowledgeBasesPage({ onOpenDocument }) {
  const [activeCollectionId, setActiveCollectionId] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedFileType, setSelectedFileType] = useState('all');
  const [isNewCollectionOpen, setIsNewCollectionOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  const collsQuery = useCollections();
  const docsQuery = useDocuments(activeCollectionId);
  const collections = Array.isArray(collsQuery.data) ? collsQuery.data : (collsQuery.data?.collections || []);
  const documents = Array.isArray(docsQuery.data) ? docsQuery.data : (docsQuery.data?.documents || []);
  const docsLoading = docsQuery.isLoading;
  const createCollMutation = useCreateCollection();
  const deleteCollMutation = useDeleteCollection();
  const deleteDocMutation = useDeleteDocument();
  const reindexDocMutation = useReindexDocument();

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    await createCollMutation.mutateAsync({ name: newCollectionName.trim() });
    setNewCollectionName('');
    setIsNewCollectionOpen(false);
  };

  const filteredDocs = documents.filter((doc) => {
    const filename = (doc.original_filename || doc.filename || '').toLowerCase();
    const matchesSearch = filename.includes(searchFilter.toLowerCase());
    const matchesType = selectedFileType === 'all' ? true : (doc.file_type || '').toLowerCase() === selectedFileType.toLowerCase();
    return matchesSearch && matchesType;
  });

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} kb`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileBadge = (filename, type) => {
    const ext = (type || filename.split('.').pop() || '').toLowerCase();
    if (ext === 'pdf') return { label: 'PDF', color: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950 dark:text-red-400' };
    if (ext === 'txt') return { label: 'TXT', color: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950 dark:text-amber-400' };
    return { label: 'MD', color: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950 dark:text-blue-400' };
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-canvas">
      {/* Left Collections Tree Rail (Reference 1 & 2) */}
      <aside className="w-60 bg-surface border-r border-border flex flex-col flex-shrink-0 select-none">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xs font-semibold text-ink uppercase tracking-wider">
            Knowledge Bases
          </h2>
          <button
            onClick={() => setIsNewCollectionOpen(true)}
            className="p-1 text-ink-muted hover:text-brand rounded-md hover:bg-surface-subtle transition-colors"
            title="Create Collection"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>

        {/* Tree List */}
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 text-xs">
          <button
            onClick={() => setActiveCollectionId(null)}
            className={clsx(
              'flex items-center justify-between px-3 py-2 rounded-lg font-medium text-left transition-colors',
              activeCollectionId === null
                ? 'bg-brand/10 text-brand dark:bg-brand/20'
                : 'text-ink-muted hover:text-ink hover:bg-surface-subtle'
            )}
          >
            <div className="flex items-center gap-2 truncate">
              <Folder className="w-4 h-4 flex-shrink-0" />
              <span>All Documents</span>
            </div>
            <span className="font-mono text-[11px] opacity-75">{documents.length}</span>
          </button>

          <div className="my-1 border-t border-border/60" />

          {collections.map((coll) => (
            <div
              key={coll.id}
              className={clsx(
                'group flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors',
                activeCollectionId === coll.id
                  ? 'bg-brand/10 text-brand font-medium dark:bg-brand/20'
                  : 'text-ink-muted hover:text-ink hover:bg-surface-subtle'
              )}
            >
              <button
                onClick={() => setActiveCollectionId(coll.id)}
                className="flex items-center gap-2 truncate flex-1 text-left"
              >
                <Folder className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{coll.name}</span>
              </button>

              <button
                onClick={() => deleteCollMutation.mutate(coll.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-ink-faint hover:text-status-error transition-opacity"
                title="Delete collection"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Center Main Documents Table (Design Reference 1 Layout) */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 gap-6">
        {/* Top Search, View Switcher & Action Rail */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Find Documents Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-ink-faint absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Find Documents"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-surface border border-border rounded-xl text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggle (Grid / List) */}
            <div className="flex items-center gap-1.5 text-xs text-ink-muted">
              <span>View:</span>
              <div className="flex items-center rounded-lg border border-border bg-surface p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={clsx(
                    'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                    viewMode === 'grid' ? 'bg-[#20272F] text-white' : 'text-ink-muted hover:text-ink'
                  )}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={clsx(
                    'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                    viewMode === 'list' ? 'bg-[#20272F] text-white' : 'text-ink-muted hover:text-ink'
                  )}
                >
                  <LayoutList className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Title & Filter Dropdowns Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-ink tracking-tight font-sans">
              Documents
            </h1>

            {/* Dropdown 1: Collections */}
            <select
              value={activeCollectionId || 'all'}
              onChange={(e) => setActiveCollectionId(e.target.value === 'all' ? null : e.target.value)}
              className="bg-surface-subtle hover:bg-surface border border-border rounded-lg px-3 py-1.5 text-ink text-xs font-medium focus:outline-none focus:border-brand cursor-pointer"
            >
              <option value="all">All Documents</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Dropdown 2: Document Type */}
            <select
              value={selectedFileType}
              onChange={(e) => setSelectedFileType(e.target.value)}
              className="bg-surface-subtle hover:bg-surface border border-border rounded-lg px-3 py-1.5 text-ink text-xs font-medium focus:outline-none focus:border-brand cursor-pointer"
            >
              <option value="all">Documents Type</option>
              <option value="pdf">PDF Files</option>
              <option value="txt">Text Files</option>
              <option value="md">Markdown</option>
            </select>
          </div>

          <span className="text-xs font-mono text-ink-muted">
            {filteredDocs.length} files available
          </span>
        </div>

        {/* View Layout: List or Grid */}
        {viewMode === 'list' ? (
          <div className="bg-surface border border-border rounded-xl shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle/80 border-b border-border text-ink-muted font-medium select-none">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Collection</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {docsLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-ink-muted">
                      Loading files...
                    </td>
                  </tr>
                ) : filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-ink-muted">
                      No documents found. Drag and drop files into the upload tray on the right.
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => {
                    const badge = getFileBadge(doc.original_filename || doc.filename, doc.file_type);
                    return (
                      <tr
                        key={doc.id}
                        className="hover:bg-surface-subtle/60 transition-colors group cursor-pointer"
                        onClick={() => onOpenDocument(doc)}
                      >
                        <td className="py-3 px-4 font-medium text-ink flex items-center gap-3">
                          <span className={clsx('px-1.5 py-0.5 rounded text-[10px] font-bold border font-mono', badge.color)}>
                            {badge.label}
                          </span>
                          <span className="truncate max-w-sm text-xs" title={doc.original_filename || doc.filename}>
                            {doc.original_filename || doc.filename}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono text-xs text-ink-muted">
                          {formatBytes(doc.file_size_bytes)}
                        </td>

                        <td className="py-3 px-4 text-xs text-ink-muted">
                          {doc.collection_name ||
                            (doc.collection_id
                              ? collections.find((c) => c.id === doc.collection_id)?.name
                              : null) ||
                            'Unassigned'}
                        </td>

                        <td className="py-3 px-4 text-xs text-ink-muted capitalize">
                          {doc.file_type ? `${doc.file_type.toUpperCase()} File` : 'File'}
                        </td>

                        <td className="py-3 px-4 text-xs text-ink-muted whitespace-nowrap">
                          {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Recent'}
                        </td>

                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
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
                              title="Delete file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid View Mode */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((doc) => {
              const badge = getFileBadge(doc.original_filename || doc.filename, doc.file_type);
              return (
                <div
                  key={doc.id}
                  className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-brand transition-colors group cursor-pointer shadow-2xs"
                  onClick={() => onOpenDocument(doc)}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={clsx('px-1.5 py-0.5 rounded text-[10px] font-bold border font-mono', badge.color)}>
                        {badge.label}
                      </span>
                      <StatusDot status={doc.status} />
                    </div>
                    <h4 className="text-xs font-semibold text-ink truncate" title={doc.original_filename || doc.filename}>
                      {doc.original_filename || doc.filename}
                    </h4>
                    <p className="text-[11px] font-mono text-ink-muted mt-1">
                      {formatBytes(doc.file_size_bytes)} • {doc.page_count} p • {doc.chunk_count} ch
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border text-xs" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onOpenDocument(doc)}
                      className="text-brand hover:underline font-medium text-[11px] flex items-center gap-1"
                    >
                      <span>Read</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => deleteDocMutation.mutate(doc.id)}
                      className="text-ink-muted hover:text-status-error"
                      title="Delete file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Right Upload Tray (Design Reference 1 Layout) */}
      <aside className="w-80 bg-surface border-l border-border p-5 flex flex-col flex-shrink-0 overflow-y-auto">
        <UploadTray
          collections={collections}
          defaultCollectionId={activeCollectionId}
          onUploadComplete={() => {}}
        />
      </aside>

      {/* New Collection Modal */}
      <Modal
        isOpen={isNewCollectionOpen}
        onClose={() => setIsNewCollectionOpen(false)}
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
              placeholder="e.g. Legal Agreements"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-brand"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setIsNewCollectionOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={createCollMutation.isPending}>
              Create Collection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
