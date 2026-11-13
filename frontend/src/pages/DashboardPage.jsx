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
  Database,
  AlertTriangle,
  CheckCircle,
  Circle,
  RefreshCw,
  Info,
  X
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { StatusDot } from '../components/common/StatusDot';
import { Modal } from '../components/common/Modal';
import { UploadTray } from '../components/upload/UploadTray';
import { SampleAttributionModal } from '../components/common/SampleAttributionModal';
import {
  useDocuments,
  useCollections,
  useSessions,
  useCreateCollection,
  useCreateSession,
  useDeleteDocument,
  useLoadSampleDocuments,
  useSystemStatus,
  useHealthCheck,
  useProviderProbe
} from '../api/queries';
import { VIEWS } from '../components/layout/RailNav';
import clsx from 'clsx';

export function DashboardPage({ onNavigate, onStartQuery, onOpenDocument }) {
  const [askQuery, setAskQuery] = useState('');
  const [selectedScope, setSelectedScope] = useState('all');
  const [selectedModel, setSelectedModel] = useState('Gemini 3.5 Flash-Lite');
  const [selectedLength, setSelectedLength] = useState('250 words');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [filterQuery, setFilterQuery] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [showSummaryColumn, setShowSummaryColumn] = useState(true);
  const [isSampleLoading, setIsSampleLoading] = useState(false);
  const [isAttributionModalOpen, setIsAttributionModalOpen] = useState(false);
  const [isOnboardingDismissed, setIsOnboardingDismissed] = useState(() => {
    return localStorage.getItem('nexusrag_onboarding_dismissed') === 'true';
  });

  const docsQuery = useDocuments();
  const collsQuery = useCollections();
  const sessionsQuery = useSessions();
  const systemStatusQuery = useSystemStatus();
  const healthQuery = useHealthCheck();
  const probeQuery = useProviderProbe();

  const documents = Array.isArray(docsQuery.data) ? docsQuery.data : (docsQuery.data?.documents || []);
  const collections = Array.isArray(collsQuery.data) ? collsQuery.data : (collsQuery.data?.collections || []);
  const sessions = Array.isArray(sessionsQuery.data) ? sessionsQuery.data : (sessionsQuery.data?.sessions || []);
  const statusData = systemStatusQuery.data;
  const isOperational = healthQuery.data?.status === 'ok';
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

  const getAdaptivePlaceholder = () => {
    if (documents.length === 0) {
      return "Ask a research question about your uploaded documents, e.g. 'What are the main conclusions?'";
    }
    const cleanEnergyDoc = documents.find((d) => (d.original_filename || d.filename || '').toLowerCase().includes('energy'));
    if (cleanEnergyDoc) {
      return "Ask a question about your documents, e.g. 'What were the key findings in the clean energy report?'";
    }
    const firstDoc = documents[0].original_filename || documents[0].filename;
    return `Ask a question about your documents, e.g. 'Summarize the primary thesis in ${firstDoc}'`;
  };

  const totalChunks = statusData?.faiss_vectors ?? documents.reduce((sum, d) => sum + (d.chunk_count || 0), 0);
  const totalPages = documents.reduce((sum, d) => sum + (d.page_count || 1), 0);

  const step1Done = documents.length > 0;
  const step2Done = sessions.length > 0;
  const step3Done = Boolean(typeof window !== 'undefined' && (localStorage.getItem('nexusrag_citation_verified') === 'true' || sessions.some((s) => s.message_count > 1)));
  const step4Done = Boolean(typeof window !== 'undefined' && localStorage.getItem('nexusrag_inspector_visited') === 'true');
  const completedSteps = [step1Done, step2Done, step3Done, step4Done].filter(Boolean).length;

  return (
    <main className="flex-1 flex flex-col h-full overflow-y-auto bg-canvas p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* 1. Header Bar with Overview and Quick CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-ink font-sans">
              Research Workspace
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-brand font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
              <span>Workspace Active</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Query your indexed collections with grounded citations and transparent retrieval traces
          </p>
        </div>
        <div className="flex flex-col sm:items-end gap-1.5">
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
          <button
            onClick={() => setIsAttributionModalOpen(true)}
            className="text-[11px] text-ink-muted hover:text-brand font-mono underline cursor-pointer self-start sm:self-end"
          >
            Sample Paper Licences & Attribution
          </button>
        </div>
      </div>

      {/* Designed Error State: Missing Google Gemini API Key */}
      {probeQuery.data?.status === 'missing_key' && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-ink flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-ink text-sm">Google Gemini API Key Not Configured</h3>
              <p className="text-ink-muted mt-0.5 font-serif leading-relaxed">
                Vector embeddings and LangGraph synthesis require a valid <code className="font-mono text-ink">GEMINI_API_KEY</code>. Add your key to <code className="font-mono text-ink">.env</code> in the project root to enable live retrieval and inference.
              </p>
            </div>
          </div>
          <div className="flex-shrink-0 flex items-center">
            <code className="text-[11px] font-mono bg-amber-500/15 text-amber-700 dark:text-amber-300 px-2.5 py-1.5 rounded border border-amber-500/30">
              export GEMINI_API_KEY="..."
            </code>
          </div>
        </div>
      )}

      {/* Designed Error State: Backend Offline */}
      {(healthQuery.isError || systemStatusQuery.isError) && (
        <div className="p-4 rounded-xl bg-status-error/10 border border-status-error/30 text-ink flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-status-error flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-status-error text-sm">Backend Service Offline</h3>
              <p className="text-ink-muted mt-0.5 font-serif leading-relaxed">
                Unable to establish HTTP connection to the FastAPI server at <code className="font-mono text-ink">http://localhost:8000</code>. Verify the backend daemon is running.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => {
              healthQuery.refetch();
              systemStatusQuery.refetch();
            }}
          >
            Retry Connection
          </Button>
        </div>
      )}

      {/* First-Run Onboarding Checklist Widget */}
      {!isOnboardingDismissed && (
        <div className="p-4 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-ink uppercase tracking-wider font-mono">
                First-Run Onboarding Checklist
              </span>
              <span className="font-mono text-[10px] bg-brand/10 text-brand px-2 py-0.5 rounded font-bold">
                {completedSteps} of 4 Complete
              </span>
            </div>
            <button
              onClick={() => {
                setIsOnboardingDismissed(true);
                localStorage.setItem('nexusrag_onboarding_dismissed', 'true');
              }}
              className="text-ink-muted hover:text-ink text-[11px] flex items-center gap-1 cursor-pointer"
              title="Dismiss onboarding checklist"
            >
              <span>Dismiss</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-surface-subtle h-1.5 rounded-full overflow-hidden border border-border">
            <div
              className="bg-brand h-full transition-all duration-300 rounded-full"
              style={{ width: `${(completedSteps / 4) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1">
            {/* Step 1: Ingest */}
            <div className={clsx('p-3 rounded-lg border flex flex-col justify-between gap-2', step1Done ? 'bg-surface-subtle border-border' : 'bg-surface border-brand/40')}>
              <div className="flex items-start gap-2">
                {step1Done ? <CheckCircle className="w-4 h-4 text-status-success flex-shrink-0 mt-0.5" /> : <Circle className="w-4 h-4 text-ink-muted flex-shrink-0 mt-0.5" />}
                <div>
                  <span className="font-semibold text-ink block">1. Ingest Documents</span>
                  <span className="text-[11px] text-ink-muted font-serif">Upload your files or load 4 benchmark documents.</span>
                </div>
              </div>
              {!step1Done && (
                <Button variant="outline" size="sm" onClick={handleLoadSamples} disabled={isSampleLoading} className="w-full justify-center">
                  Load Samples
                </Button>
              )}
            </div>

            {/* Step 2: Query */}
            <div className={clsx('p-3 rounded-lg border flex flex-col justify-between gap-2', step2Done ? 'bg-surface-subtle border-border' : 'bg-surface border-border')}>
              <div className="flex items-start gap-2">
                {step2Done ? <CheckCircle className="w-4 h-4 text-status-success flex-shrink-0 mt-0.5" /> : <Circle className="w-4 h-4 text-ink-muted flex-shrink-0 mt-0.5" />}
                <div>
                  <span className="font-semibold text-ink block">2. Research Query</span>
                  <span className="text-[11px] text-ink-muted font-serif">Synthesize facts across indexed materials.</span>
                </div>
              </div>
              {!step2Done && (
                <Button variant="outline" size="sm" onClick={() => onNavigate(VIEWS.RESEARCH)} className="w-full justify-center">
                  Open Research Desk
                </Button>
              )}
            </div>

            {/* Step 3: Verify Citation */}
            <div className={clsx('p-3 rounded-lg border flex flex-col justify-between gap-2', step3Done ? 'bg-surface-subtle border-border' : 'bg-surface border-border')}>
              <div className="flex items-start gap-2">
                {step3Done ? <CheckCircle className="w-4 h-4 text-status-success flex-shrink-0 mt-0.5" /> : <Circle className="w-4 h-4 text-ink-muted flex-shrink-0 mt-0.5" />}
                <div>
                  <span className="font-semibold text-ink block">3. Verify Proving Citation</span>
                  <span className="text-[11px] text-ink-muted font-serif">Jump to highlighted character offsets.</span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => onNavigate(VIEWS.READER)} className="w-full justify-center">
                Open Reader
              </Button>
            </div>

            {/* Step 4: Audit DAG */}
            <div className={clsx('p-3 rounded-lg border flex flex-col justify-between gap-2', step4Done ? 'bg-surface-subtle border-border' : 'bg-surface border-border')}>
              <div className="flex items-start gap-2">
                {step4Done ? <CheckCircle className="w-4 h-4 text-status-success flex-shrink-0 mt-0.5" /> : <Circle className="w-4 h-4 text-ink-muted flex-shrink-0 mt-0.5" />}
                <div>
                  <span className="font-semibold text-ink block">4. Audit LangGraph DAG</span>
                  <span className="text-[11px] text-ink-muted font-serif">Inspect 9-node execution waterfall.</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  localStorage.setItem('nexusrag_inspector_visited', 'true');
                  onNavigate(VIEWS.INSPECTOR);
                }}
                className="w-full justify-center"
              >
                Open Inspector
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Varied-Layout Aggregate Metrics (Zero Static Data Compliant) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Documents - Featured Primary Metric */}
        <div className="p-4 rounded-xl bg-surface border-2 border-brand/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand uppercase tracking-wider">Total Documents</span>
            <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-ink tracking-tight font-sans">{documents.length}</div>
            <div className="text-[11px] text-ink-muted mt-1 flex items-center gap-1.5">
              <span className="font-medium text-ink">{documents.filter((d) => d.status === 'indexed').length} ready</span>
              <span>•</span>
              <span>{totalPages} {totalPages === 1 ? 'page' : 'pages'}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Knowledge Collections */}
        <div className="p-4 rounded-xl bg-surface border border-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Collections</span>
            <Folder className="w-4 h-4 text-ink-muted" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-ink tracking-tight">{collections.length}</div>
            <p className="text-[11px] text-ink-muted mt-1">
              {collections.length === 0 ? 'No custom collections' : `${collections.length} organized namespaces`}
            </p>
          </div>
        </div>

        {/* Card 3: Vector Chunks & Embeddings */}
        <div className="p-4 rounded-xl bg-surface border border-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Vector Chunks</span>
            <Sparkles className="w-4 h-4 text-ink-muted" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-ink tracking-tight font-mono">{totalChunks}</div>
            <p className="text-[11px] text-ink-muted mt-1">
              {totalChunks === 0 ? 'No indexed chunks' : `${totalChunks} searchable passages`}
            </p>
          </div>
        </div>

        {/* Card 4: Research Sessions */}
        <div className="p-4 rounded-xl bg-surface border border-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Active Sessions</span>
            <MessageSquare className="w-4 h-4 text-ink-muted" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-ink tracking-tight">{sessions.length}</div>
            <button
              onClick={handleCreateNewSession}
              className="text-[11px] text-brand hover:underline font-medium mt-1 text-left"
            >
              + New research session
            </button>
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
              placeholder={getAdaptivePlaceholder()}
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
                <option value="Gemini 3.5 Flash-Lite">Gemini 3.5 Flash-Lite (Fast, Grounded)</option>
                <option value="Gemini 3.8 Flash">Gemini 3.8 Flash (Deep Reasoning)</option>
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
              <div className="text-[10px] text-ink-muted truncate">PDF, MD, TXT (up to 25MB)</div>
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

          {/* Processing Activity Feed */}
          <div className="p-4 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                <Activity className="w-4 h-4 text-brand" />
                <span>Processing Activity</span>
              </div>
              <span className="text-[10px] text-ink-muted">
                {documents.length > 0 ? 'Live pipeline' : 'Idle'}
              </span>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              {documents.length === 0 ? (
                <p className="py-3 text-center text-ink-muted text-xs italic">
                  No ingestion activity recorded yet.
                </p>
              ) : (
                documents.slice(0, 3).map((doc) => (
                  <div key={doc.id} className="flex items-start gap-2.5 p-2 rounded-lg bg-surface-subtle/60 border border-border/60">
                    <StatusDot status={doc.status} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-medium text-ink truncate text-[11px]" title={doc.original_filename || doc.filename}>
                          {doc.original_filename || doc.filename}
                        </span>
                        <span className="text-[10px] text-ink-muted whitespace-nowrap">
                          {doc.created_at ? new Date(doc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                        </span>
                      </div>
                      <p className="text-[10px] text-ink-muted font-mono mt-0.5 truncate">
                        {doc.status === 'indexed'
                          ? `Indexed • ${doc.chunk_count || 0} chunks in FAISS`
                          : doc.status === 'processing'
                          ? 'Extracting text & generating embeddings...'
                          : 'Uploaded to workspace'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Engine & Pipeline Health Card */}
          <div className="p-4 rounded-xl bg-surface border border-border shadow-xs flex flex-col gap-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-ink">Pipeline Status</span>
              <StatusDot
                status={isOperational ? 'ready' : 'degraded'}
                text={isOperational ? 'Operational' : 'Degraded'}
              />
            </div>

            {!isOperational && healthQuery.data && (
              <div className="p-2 rounded bg-status-error/10 border border-status-error/20 text-[11px] text-status-error">
                {healthQuery.data?.database !== 'connected'
                  ? `Database issue: ${healthQuery.data.database}. Verify database service.`
                  : 'Backend service reporting degraded state.'}
              </div>
            )}

            <div className="space-y-1.5 pt-1 text-[11px] text-ink-muted border-t border-border">
              <div className="flex justify-between items-center">
                <span>Vector Store:</span>
                <span className="font-mono text-ink">FAISS IndexIDMap2</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Embedding Model:</span>
                <span className="font-mono text-ink text-[10px]">gemini-embedding-2</span>
              </div>
              <div className="flex justify-between items-center">
                <span>AI Provider Probe:</span>
                <span className={clsx(
                  "font-mono text-[10px] px-1.5 py-0.5 rounded",
                  probeQuery.data?.status === 'online' && "bg-status-success/15 text-status-success",
                  probeQuery.data?.status === 'missing_key' && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                  probeQuery.data?.status === 'error' && "bg-status-error/15 text-status-error",
                  !probeQuery.data && "text-ink-muted"
                )}>
                  {probeQuery.data?.status === 'online' ? 'Online' : probeQuery.data?.status === 'missing_key' ? 'Key Needed' : probeQuery.data?.status === 'error' ? 'Error' : 'Probing...'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Relational State:</span>
                <span className="font-mono text-ink capitalize">{healthQuery.data?.database || 'Connected'}</span>
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

      {/* Sample Document Licences and Attribution Modal */}
      <SampleAttributionModal
        isOpen={isAttributionModalOpen}
        onClose={() => setIsAttributionModalOpen(false)}
      />
    </main>
  );
}
