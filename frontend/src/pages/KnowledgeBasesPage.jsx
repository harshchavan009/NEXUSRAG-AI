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
  ChevronDown,
  Plus,
  Pencil,
  Sparkles,
  CheckSquare,
  Square,
  Info
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { StatusDot } from '../components/common/StatusDot';
import { UploadTray } from '../components/upload/UploadTray';
import { Modal } from '../components/common/Modal';
import { SampleAttributionModal } from '../components/common/SampleAttributionModal';
import { SAMPLE_DOCUMENTS_DESCRIPTION } from '../constants/sampleDocuments';
import {
  useDocuments,
  useCollections,
  useCreateCollection,
  useUpdateCollection,
  useDeleteCollection,
  useDeleteDocument,
  useUpdateDocument,
  useBulkMoveDocuments,
  useReindexDocument,
  useLoadSampleDocuments
} from '../api/queries';
import { useToast } from '../components/common/Toast';
import clsx from 'clsx';

export function KnowledgeBasesPage({ onOpenDocument }) {
  const [activeCollectionId, setActiveCollectionId] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedFileType, setSelectedFileType] = useState('all');
  const [isNewCollectionOpen, setIsNewCollectionOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isAttributionModalOpen, setIsAttributionModalOpen] = useState(false);

  // Collection rename modal state
  const [editingCollection, setEditingCollection] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  // Bulk selection state
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [isSampleLoading, setIsSampleLoading] = useState(false);

  const toast = useToast();
  const collsQuery = useCollections();
  const docsQuery = useDocuments(activeCollectionId);
  const collections = Array.isArray(collsQuery.data) ? collsQuery.data : (collsQuery.data?.collections || []);
  const documents = Array.isArray(docsQuery.data) ? docsQuery.data : (docsQuery.data?.documents || []);
  const docsLoading = docsQuery.isLoading;

  const createCollMutation = useCreateCollection();
  const updateCollMutation = useUpdateCollection();
  const deleteCollMutation = useDeleteCollection();
  const deleteDocMutation = useDeleteDocument();
  const updateDocMutation = useUpdateDocument();
  const bulkMoveMutation = useBulkMoveDocuments();
  const reindexDocMutation = useReindexDocument();
  const loadSamplesMutation = useLoadSampleDocuments();

  const handleBulkMove = async (targetColId) => {
    if (selectedDocIds.length === 0 || !targetColId) return;
    const colId = targetColId === 'none' ? null : targetColId;
    try {
      await bulkMoveMutation.mutateAsync({
        document_ids: selectedDocIds,
        collection_id: colId,
      });
      toast.success(`Moved ${selectedDocIds.length} documents.`);
      setSelectedDocIds([]);
    } catch (err) {
      toast.error('Failed to move documents.');
    }
  };

  const handleMoveSingleDoc = async (docId, targetColId) => {
    const colId = targetColId === 'none' ? null : targetColId;
    try {
      await updateDocMutation.mutateAsync({
        id: docId,
        collection_id: colId,
      });
      toast.success('Document collection updated.');
    } catch (err) {
      toast.error('Failed to update document collection.');
    }
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    try {
      await createCollMutation.mutateAsync({ name: newCollectionName.trim() });
      toast.success(`Collection '${newCollectionName.trim()}' created.`);
      setNewCollectionName('');
      setIsNewCollectionOpen(false);
    } catch (err) {
      toast.error('Failed to create collection.');
    }
  };

  const handleOpenRename = (coll) => {
    setEditingCollection(coll);
    setRenameValue(coll.name);
  };

  const handleRenameCollection = async (e) => {
    e.preventDefault();
    if (!renameValue.trim() || !editingCollection) return;
    try {
      await updateCollMutation.mutateAsync({
        id: editingCollection.id,
        name: renameValue.trim(),
      });
      toast.success(`Collection renamed to '${renameValue.trim()}'.`);
      setEditingCollection(null);
    } catch (err) {
      toast.error('Failed to rename collection.');
    }
  };

  const handleDeleteCollection = async (coll) => {
    try {
      await deleteCollMutation.mutateAsync(coll.id);
      if (activeCollectionId === coll.id) {
        setActiveCollectionId(null);
      }
      toast.success(`Collection '${coll.name}' deleted.`);
    } catch (err) {
      toast.error('Failed to delete collection.');
    }
  };

  const handleDeleteDoc = async (doc) => {
    try {
      await deleteDocMutation.mutateAsync(doc.id);
      setSelectedDocIds((prev) => prev.filter((id) => id !== doc.id));
      toast.success(`Document '${doc.original_filename || doc.filename}' deleted.`);
    } catch (err) {
      toast.error('Failed to delete document.');
    }
  };

  const handleReindexDoc = async (doc) => {
    try {
      await reindexDocMutation.mutateAsync(doc.id);
      toast.info(`Queued '${doc.original_filename || doc.filename}' for reindexing.`);
    } catch (err) {
      toast.error('Failed to reindex document.');
    }
  };

  const handleLoadSamples = async () => {
    setIsSampleLoading(true);
    try {
      toast.info('Ingesting 4 verified research papers in background...');
      await loadSamplesMutation.mutateAsync();
      toast.success('Sample documents ingested into FAISS vector store.');
    } catch (err) {
      toast.error('Failed to load sample documents.');
    } finally {
      setIsSampleLoading(false);
    }
  };

  // Bulk actions
  const handleToggleSelectDoc = (docId) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocIds.length === filteredDocs.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(filteredDocs.map((d) => d.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDocIds.length === 0) return;
    const count = selectedDocIds.length;
    try {
      for (const id of selectedDocIds) {
        await deleteDocMutation.mutateAsync(id);
      }
      setSelectedDocIds([]);
      toast.success(`Deleted ${count} documents and removed their FAISS vectors.`);
    } catch (err) {
      toast.error('Failed to delete selected documents.');
    }
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
      {/* Left Collections Tree Rail */}
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

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpenRename(coll)}
                  className="p-1 text-ink-faint hover:text-ink transition-colors"
                  title="Rename collection"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDeleteCollection(coll)}
                  className="p-1 text-ink-faint hover:text-status-error transition-colors"
                  title="Delete collection"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Center Main Documents Table */}
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
              <option value="all">Document Type</option>
              <option value="pdf">PDF Files</option>
              <option value="txt">Text Files</option>
              <option value="md">Markdown</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAttributionModalOpen(true)}
              className="text-xs text-brand hover:underline font-sans font-medium flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-subtle transition-colors shadow-2xs cursor-pointer"
              title="View benchmark document licences and attribution"
            >
              <Info className="w-3.5 h-3.5 text-brand" />
              <span>Sample Attribution</span>
            </button>

            {selectedDocIds.length > 0 && (
              <div className="flex items-center gap-2 bg-surface border border-border px-3 py-1 rounded-lg text-xs">
                <span className="font-semibold text-brand">{selectedDocIds.length} selected</span>
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkMove(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="bg-surface-subtle border border-border rounded px-2 py-0.5 text-xs text-ink focus:outline-none focus:border-brand cursor-pointer"
                >
                  <option value="" disabled>Move to...</option>
                  <option value="none">Unassigned</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button
                  onClick={handleBulkDelete}
                  className="text-status-error hover:underline font-medium ml-1"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedDocIds([])}
                  className="text-ink-muted hover:text-ink ml-1"
                >
                  Clear
                </button>
              </div>
            )}

            <span className="text-xs text-ink-muted">
              {filteredDocs.length} files available
            </span>
          </div>
        </div>

        {/* View Layout: List or Grid */}
        {viewMode === 'list' ? (
          <div className="bg-surface border border-border rounded-xl shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle/80 border-b border-border text-ink-muted font-medium select-none">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <button
                      onClick={handleSelectAll}
                      className="text-ink-muted hover:text-ink focus:outline-none"
                      title={selectedDocIds.length === filteredDocs.length && filteredDocs.length > 0 ? "Deselect all" : "Select all"}
                    >
                      {selectedDocIds.length === filteredDocs.length && filteredDocs.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-brand" />
                      ) : (
                        <Square className="w-4 h-4 text-ink-faint" />
                      )}
                    </button>
                  </th>
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
                    <td colSpan={7} className="py-8 text-center text-ink-muted">
                      Loading files...
                    </td>
                  </tr>
                ) : filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-ink-muted">
                      <div className="flex flex-col items-center gap-3 max-w-sm mx-auto">
                        <p>No documents found in this workspace view.</p>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Sparkles}
                          disabled={isSampleLoading}
                          onClick={handleLoadSamples}
                        >
                          {isSampleLoading ? 'Ingesting Samples...' : 'Load Sample Documents'}
                        </Button>
                        <p className="text-[11px] text-ink-muted leading-relaxed font-serif max-w-md mx-auto">
                          {SAMPLE_DOCUMENTS_DESCRIPTION}
                        </p>
                        <button
                          onClick={() => setIsAttributionModalOpen(true)}
                          className="text-[11px] text-brand hover:underline font-sans font-medium cursor-pointer"
                        >
                          View demo document licences & attribution
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => {
                    const badge = getFileBadge(doc.original_filename || doc.filename, doc.file_type);
                    const isSelected = selectedDocIds.includes(doc.id);
                    return (
                      <tr
                        key={doc.id}
                        className={clsx(
                          'hover:bg-surface-subtle/60 transition-colors group cursor-pointer',
                          isSelected && 'bg-brand/5'
                        )}
                        onClick={() => onOpenDocument(doc)}
                      >
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleToggleSelectDoc(doc.id)}
                            className="text-ink-muted hover:text-ink focus:outline-none"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-brand" />
                            ) : (
                              <Square className="w-4 h-4 text-ink-faint" />
                            )}
                          </button>
                        </td>

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

                        <td className="py-3 px-4 text-xs text-ink-muted" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={doc.collection_id || 'none'}
                            onChange={(e) => handleMoveSingleDoc(doc.id, e.target.value)}
                            className="bg-transparent hover:bg-surface-subtle border border-transparent hover:border-border rounded px-1.5 py-0.5 text-xs text-ink cursor-pointer focus:outline-none focus:border-brand transition-colors"
                            title="Assign to collection"
                          >
                            <option value="none">Unassigned</option>
                            {collections.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
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
                              onClick={() => handleReindexDoc(doc)}
                              className="p-1 text-ink-muted hover:text-brand rounded hover:bg-surface-subtle"
                              title="Reindex document in FAISS"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onOpenDocument(doc)}
                              className="p-1 text-ink-muted hover:text-brand rounded hover:bg-surface-subtle"
                              title="Open in Document Reader"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteDoc(doc)}
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
              const isSelected = selectedDocIds.includes(doc.id);
              return (
                <div
                  key={doc.id}
                  className={clsx(
                    'bg-surface border rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-brand transition-colors group cursor-pointer shadow-2xs',
                    isSelected ? 'border-brand ring-2 ring-brand/20' : 'border-border'
                  )}
                  onClick={() => onOpenDocument(doc)}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={clsx('px-1.5 py-0.5 rounded text-[10px] font-bold border font-mono', badge.color)}>
                        {badge.label}
                      </span>
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <StatusDot status={doc.status} />
                        <button
                          onClick={() => handleToggleSelectDoc(doc.id)}
                          className="text-ink-muted hover:text-ink focus:outline-none ml-1"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-brand" />
                          ) : (
                            <Square className="w-4 h-4 text-ink-faint" />
                          )}
                        </button>
                      </div>
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

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleReindexDoc(doc)}
                        className="p-1 text-ink-muted hover:text-brand rounded"
                        title="Reindex in FAISS"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDoc(doc)}
                        className="p-1 text-ink-muted hover:text-status-error rounded"
                        title="Delete file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Right Upload Tray */}
      <aside className="w-80 bg-surface border-l border-border p-5 flex flex-col flex-shrink-0 overflow-y-auto">
        <UploadTray
          collections={collections}
          defaultCollectionId={activeCollectionId}
          onUploadComplete={() => {
            toast.success('Files uploaded and processed successfully.');
          }}
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

      {/* Rename Collection Modal */}
      <Modal
        isOpen={!!editingCollection}
        onClose={() => setEditingCollection(null)}
        title="Rename Knowledge Base Collection"
      >
        <form onSubmit={handleRenameCollection} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-ink-muted mb-1.5">
              New Collection Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Financial Reports 2024"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-brand"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setEditingCollection(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={updateCollMutation.isPending}>
              Save Name
            </Button>
          </div>
        </form>
      </Modal>

      {/* Sample Document Licences and Attribution Modal */}
      <SampleAttributionModal
        isOpen={isAttributionModalOpen}
        onClose={() => setIsAttributionModalOpen(false)}
      />
    </div>
  );
}
