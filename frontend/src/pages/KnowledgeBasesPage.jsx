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
  UploadCloud
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
  const [isNewCollectionOpen, setIsNewCollectionOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  const { data: collections = [] } = useCollections();
  const { data: documents = [], isLoading: docsLoading } = useDocuments(activeCollectionId);
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

  const filteredDocs = documents.filter((doc) =>
    doc.original_filename.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-canvas">
      {/* Left Collections Tree Rail (Design Reference 1 & 2) */}
      <aside className="w-64 bg-surface border-r border-border flex flex-col flex-shrink-0 select-none">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xs font-semibold text-ink uppercase tracking-wide">
            Knowledge Bases
          </h2>
          <button
            onClick={() => setIsNewCollectionOpen(true)}
            className="p-1 text-ink-muted hover:text-brand rounded hover:bg-surface-subtle"
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
              'flex items-center justify-between px-3 py-2 rounded font-medium text-left transition-colors',
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
                'group flex items-center justify-between px-3 py-2 rounded text-xs transition-colors',
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

      {/* Center Main Documents Table */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 gap-6">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-ink">
              {activeCollectionId
                ? collections.find((c) => c.id === activeCollectionId)?.name || 'Collection'
                : 'All Documents'}
            </h1>
            <p className="text-xs text-ink-muted">
              {filteredDocs.length} files available in this library
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-ink-faint absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-surface border border-border rounded text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand w-40 sm:w-56"
              />
            </div>

            <div className="flex items-center rounded border border-border bg-surface p-0.5">
              <button
                onClick={() => setViewMode('list')}
                className={clsx(
                  'p-1 rounded text-ink',
                  viewMode === 'list' ? 'bg-surface-subtle text-brand' : 'text-ink-muted hover:text-ink'
                )}
                title="List view"
              >
                <LayoutList className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={clsx(
                  'p-1 rounded text-ink',
                  viewMode === 'grid' ? 'bg-surface-subtle text-brand' : 'text-ink-muted hover:text-ink'
                )}
                title="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* View Layout: List or Grid */}
        {viewMode === 'list' ? (
          <div className="bg-surface border border-border rounded-md shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle border-b border-border text-ink-muted font-medium">
                <tr>
                  <th className="py-2.5 px-4">Name</th>
                  <th className="py-2.5 px-4">Size</th>
                  <th className="py-2.5 px-4">Pages</th>
                  <th className="py-2.5 px-4">Chunks</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
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
                  filteredDocs.map((doc) => (
                    <tr
                      key={doc.id}
                      className="hover:bg-surface-subtle/50 transition-colors group"
                    >
                      <td className="py-3 px-4 font-medium text-ink flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand flex-shrink-0" />
                        <span className="truncate max-w-sm" title={doc.original_filename}>
                          {doc.original_filename}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-ink-muted">
                        {formatBytes(doc.file_size_bytes)}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-ink-muted">
                        {doc.page_count}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-ink-muted">
                        {doc.chunk_count}
                      </td>

                      <td className="py-3 px-4">
                        <StatusDot status={doc.status} />
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={() => onOpenDocument(doc)}
                            className="p-1 text-ink-muted hover:text-brand rounded hover:bg-surface-subtle"
                            title="Open in Document Reader"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => reindexDocMutation.mutate(doc.id)}
                            className="p-1 text-ink-muted hover:text-brand rounded hover:bg-surface-subtle"
                            title="Reindex document"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-md bg-surface border border-border shadow-xs hover:border-brand transition-colors flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <FileText className="w-5 h-5 text-brand" />
                    <StatusDot status={doc.status} />
                  </div>
                  <h4 className="text-xs font-semibold text-ink truncate" title={doc.original_filename}>
                    {doc.original_filename}
                  </h4>
                  <p className="text-[11px] font-mono text-ink-muted mt-1">
                    {formatBytes(doc.file_size_bytes)} • {doc.page_count} p • {doc.chunk_count} ch
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
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
            ))}
          </div>
        )}
      </main>

      {/* Right Upload Tray (Design Reference 1) */}
      <aside className="w-80 bg-surface border-l border-border p-4 flex flex-col flex-shrink-0 overflow-y-auto">
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
              className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-ink focus:outline-none focus:border-brand"
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
