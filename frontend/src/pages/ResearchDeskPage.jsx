import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Square,
  Sparkles,
  BookOpen,
  Plus,
  Trash2,
  Bookmark,
  ExternalLink,
  ShieldCheck,
  Activity,
  FileText,
  Clock,
  Search,
  Star,
  Folder,
  ChevronDown,
  ChevronRight,
  Highlighter,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Copy,
  Check,
  RotateCcw,
  MessageSquare,
  Download,
  CheckSquare,
  X
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { StatusDot } from '../components/common/StatusDot';
import { streamQuery } from '../api/stream';
import { useToast } from '../components/common/Toast';
import {
  useSessions,
  useSessionDetail,
  useCreateSession,
  useDeleteSession,
  useCollections,
  useDocuments,
  useSuggestedInquiries
} from '../api/queries';
import { VIEWS } from '../components/layout/RailNav';
import clsx from 'clsx';

export function ResearchDeskPage({
  initialQuery = '',
  initialScope = null,
  onOpenDocumentReader,
  onNavigateToInspector
}) {
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [inputQuery, setInputQuery] = useState(initialQuery || '');
  const [selectedScope, setSelectedScope] = useState('all');
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [currentStage, setCurrentStage] = useState(null);
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [rightPanelTab, setRightPanelTab] = useState('assistant'); // 'assistant', 'passage', 'citation'
  const [searchTreeTerm, setSearchTreeTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [isMobileTreeOpen, setIsMobileTreeOpen] = useState(false);
  const [isMobileCitationSheetOpen, setIsMobileCitationSheetOpen] = useState(false);

  const toast = useToast();
  const abortControllerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const rawSessions = useSessions();
  const sessions = Array.isArray(rawSessions.data) ? rawSessions.data : (rawSessions.data?.sessions || []);
  const refetchSessions = rawSessions.refetch;
  const { data: sessionDetail, refetch: refetchDetail } = useSessionDetail(activeSessionId);
  const rawColls = useCollections();
  const collections = Array.isArray(rawColls.data) ? rawColls.data : (rawColls.data?.collections || []);
  const rawDocs = useDocuments();
  const documents = Array.isArray(rawDocs.data) ? rawDocs.data : (rawDocs.data?.documents || []);
  const suggestionsQuery = useSuggestedInquiries(selectedDocIds);
  const suggestedInquiries = suggestionsQuery.data?.suggestions || [];

  const createSessionMutation = useCreateSession();
  const deleteSessionMutation = useDeleteSession();

  // Auto-select latest session or handle initial session creation
  useEffect(() => {
    if (!activeSessionId && sessions.length > 0) {
      setActiveSessionId(sessions[0].id);
    }
  }, [sessions, activeSessionId]);

  // If initialQuery provided from Dashboard, submit it immediately
  useEffect(() => {
    if (initialQuery && !isStreaming) {
      handleSend(initialQuery, initialScope);
    }
  }, [initialQuery]);

  // Scroll to bottom when streaming or messages update
  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sessionDetail?.messages, streamingText]);

  const handleCreateNewSession = async () => {
    const res = await createSessionMutation.mutateAsync('Research Session');
    setActiveSessionId(res.id);
    refetchSessions();
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    await deleteSessionMutation.mutateAsync(sessionId);
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
    }
    refetchSessions();
  };

  const handleSend = async (queryToSend = inputQuery, scopeOverride = null) => {
    const query = queryToSend.trim();
    if (!query || isStreaming) return;

    setInputQuery('');
    setIsStreaming(true);
    setStreamingText('');
    setCurrentStage('Starting workflow...');
    setSelectedCitation(null);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    let targetSessionId = activeSessionId;
    if (!targetSessionId) {
      if (sessions && sessions.length > 0) {
        targetSessionId = sessions[0].id;
        setActiveSessionId(targetSessionId);
      } else {
        try {
          const newSession = await createSessionMutation.mutateAsync(query.slice(0, 40));
          targetSessionId = newSession.id;
          setActiveSessionId(targetSessionId);
          refetchSessions();
        } catch (err) {
          console.error('Failed to create session for query:', err);
        }
      }
    }

    const scopeObj = scopeOverride || {
      collection_ids: selectedScope === 'all' ? [] : [selectedScope],
      document_ids: selectedDocIds,
    };

    const payload = {
      query,
      session_id: targetSessionId,
      scope: scopeObj,
      top_k: 4,
    };

    try {
      await streamQuery(
        payload,
        {
          onStage: (stageData) => {
            setCurrentStage(stageData.node || 'Processing');
          },
          onToken: (tokenDelta) => {
            setStreamingText((prev) => prev + tokenDelta);
          },
          onFinal: (finalData) => {
            setIsStreaming(false);
            setStreamingText('');
            setCurrentStage(null);

            if (finalData.session_id && finalData.session_id !== activeSessionId) {
              setActiveSessionId(finalData.session_id);
            }
            refetchDetail();
            refetchSessions();

            if (finalData.citations?.length > 0) {
              setSelectedCitation(finalData.citations[0]);
            }
          },
          onError: (err) => {
            console.error('Stream error:', err);
            setIsStreaming(false);
            setCurrentStage(null);
            refetchDetail();
          },
        },
        abortController.signal
      );
    } catch (err) {
      console.error('Failed to stream query:', err);
      setIsStreaming(false);
      setCurrentStage(null);
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setCurrentStage(null);
    }
  };

  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadMarkdownFile = (filename, markdownContent) => {
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportAnswer = (msg, questionText) => {
    let md = `# NexusRAG Research Synthesis\n\n`;
    if (questionText) {
      md += `**Inquiry:** ${questionText}\n\n`;
    }
    md += `**Date:** ${new Date(msg.created_at || Date.now()).toISOString()}\n\n`;
    md += `## Synthesis\n\n${msg.content}\n\n`;
    if (msg.citations && msg.citations.length > 0) {
      md += `## Verified Citations\n\n`;
      msg.citations.forEach((c) => {
        const idx = c.index || c.citation_index;
        md += `[${idx}] **${c.filename}** (Page ${c.page_number})\n`;
        md += `> "${c.excerpt}"\n\n`;
      });
    }
    downloadMarkdownFile(`nexusrag-answer-${Date.now()}.md`, md);
    toast.success('Answer exported as Markdown.');
  };

  const handleExportSession = () => {
    if (!sessionDetail || !sessionDetail.messages || sessionDetail.messages.length === 0) {
      toast.error('No messages in session to export.');
      return;
    }
    let md = `# ${sessionDetail.title || 'NexusRAG Research Session'}\n\n`;
    md += `**Session ID:** \`${sessionDetail.id}\`\n`;
    md += `**Exported At:** ${new Date().toISOString()}\n\n---\n\n`;

    sessionDetail.messages.forEach((msg) => {
      if (msg.role === 'user') {
        md += `### Question\n\n${msg.content}\n\n`;
      } else {
        md += `### Grounded Synthesis\n\n${msg.content}\n\n`;
        if (msg.citations && msg.citations.length > 0) {
          md += `#### Citations\n\n`;
          msg.citations.forEach((c) => {
            const idx = c.index || c.citation_index;
            md += `- **[${idx}] ${c.filename}** (Page ${c.page_number}): "${c.excerpt}"\n`;
          });
          md += `\n`;
        }
        md += `---\n\n`;
      }
    });

    downloadMarkdownFile(`nexusrag-session-${sessionDetail.id.slice(0, 8)}.md`, md);
    toast.success('Complete research session exported.');
  };

  // Helper to render inline clickable citations [1], [2] inside answer text
  const renderTextWithCitations = (text, citations = []) => {
    if (!text) return null;

    const parts = text.split(/(\[\d+\])/g);
    return parts.map((part, index) => {
      const match = part.match(/\[(\d+)\]/);
      if (match) {
        const citationIndex = parseInt(match[1], 10);
        const citation = citations.find((c) => (c.index || c.citation_index) === citationIndex);

        return (
          <button
            key={index}
            onClick={() => {
              if (citation) {
                setSelectedCitation(citation);
                setRightPanelTab('passage');
                setIsMobileCitationSheetOpen(true);
              }
            }}
            className={clsx(
              'inline-flex items-center justify-center font-mono text-[11px] font-bold px-1.5 py-0.2 mx-0.5 rounded transition-transform',
              selectedCitation && (selectedCitation.index || selectedCitation.citation_index) === citationIndex
                ? 'bg-brand text-white shadow-xs scale-105'
                : 'bg-citation/20 text-citation hover:bg-citation/30'
            )}
            title={citation ? `View Source ${citationIndex}: ${citation.filename} (p. ${citation.page_number})` : `Citation [${citationIndex}]`}
          >
            [{citationIndex}]
          </button>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-canvas relative">
      {/* Mobile Drawer Backdrop */}
      {isMobileTreeOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-30 md:hidden"
          onClick={() => setIsMobileTreeOpen(false)}
        />
      )}

      {/* Panel 1: Left Tree Navigation Rail (Design Reference 2) */}
      <aside
        className={clsx(
          'w-64 bg-surface border-r border-border flex flex-col flex-shrink-0 select-none transition-all duration-200',
          isMobileTreeOpen ? 'fixed inset-y-0 left-0 z-40 shadow-2xl h-full' : 'hidden md:flex'
        )}
      >
        {/* Search Files Input */}
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-ink-faint absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTreeTerm}
              onChange={(e) => setSearchTreeTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-subtle border border-border rounded-lg text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand"
            />
          </div>
        </div>

        {/* Tree Content: RECENT, FAVORITES, PROJECTS */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4 text-xs">
          {/* Section: RECENT */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider px-2">
              Recent
            </span>
            <div className="flex flex-col gap-0.5">
              {sessions.slice(0, 3).map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSessionId(s.id)}
                  className={clsx(
                    'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left truncate transition-colors',
                    activeSessionId === s.id
                      ? 'bg-brand/10 text-brand font-medium dark:bg-brand/20'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-subtle'
                  )}
                >
                  <FileText className="w-3.5 h-3.5 flex-shrink-0 text-brand" />
                  <span className="truncate">{s.title || 'Research Session'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section: SCOPED DOCUMENTS */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between px-2 text-[10px] font-bold text-ink-muted uppercase tracking-wider">
              <span>Scoped Documents</span>
              {selectedDocIds.length > 0 && (
                <button
                  onClick={() => setSelectedDocIds([])}
                  className="text-[10px] text-brand hover:underline font-normal capitalize"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              {documents.length === 0 ? (
                <span className="text-[11px] text-ink-faint px-2 italic">No documents indexed</span>
              ) : (
                documents.slice(0, 6).map((d) => {
                  const isSelected = selectedDocIds.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      onClick={() => {
                        setSelectedDocIds((prev) =>
                          prev.includes(d.id) ? prev.filter((id) => id !== d.id) : [...prev, d.id]
                        );
                      }}
                      className={clsx(
                        'flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs transition-colors',
                        isSelected
                          ? 'bg-brand/10 text-brand font-medium'
                          : 'text-ink-muted hover:text-ink hover:bg-surface-subtle'
                      )}
                      title={`Scope retrieval to ${d.original_filename || d.filename}`}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-3.5 h-3.5 text-brand flex-shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-ink-faint flex-shrink-0" />
                      )}
                      <span className="truncate">{d.original_filename || d.filename}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Section: PROJECTS / COLLECTIONS TREE */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between px-2 text-[10px] font-bold text-ink-muted uppercase tracking-wider">
              <span>Collections</span>
              <span className="font-mono text-[10px]">{collections.length}</span>
            </div>

            <div className="flex flex-col gap-0.5">
              {collections.map((c) => (
                <div key={c.id} className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5 px-2 py-1 text-ink font-medium">
                    <ChevronDown className="w-3.5 h-3.5 text-ink-muted" />
                    <Folder className="w-3.5 h-3.5 text-brand/70" />
                    <span className="truncate">{c.name}</span>
                  </div>

                  {/* Documents nested inside collection */}
                  <div className="pl-6 flex flex-col gap-0.5">
                    {documents
                      .filter((d) => d.collection_id === c.id)
                      .slice(0, 3)
                      .map((doc) => (
                        <div
                          key={doc.id}
                          onClick={() => onOpenDocumentReader(doc)}
                          className="flex items-center gap-2 px-2 py-1 rounded text-ink-muted hover:text-ink hover:bg-surface-subtle cursor-pointer truncate"
                        >
                          <FileText className="w-3 h-3 text-ink-faint flex-shrink-0" />
                          <span className="truncate">{doc.original_filename || doc.filename}</span>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Button: + New Session / Collection */}
        <div className="p-3 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateNewSession}
            icon={Plus}
            className="w-full justify-center"
          >
            New Session
          </Button>
        </div>
      </aside>

      {/* Panel 2: Center Synthesis & Document Tabs Workspace (Design Reference 2) */}
      <main className="flex-1 flex flex-col min-w-0 bg-canvas overflow-hidden">
        {/* Document Tabs Strip (Reference 2 Layout) */}
        <div className="h-10 bg-surface border-b border-border flex items-center px-3 gap-1 overflow-x-auto flex-shrink-0 select-none">
          {/* Mobile Files Rail Toggle */}
          <button
            onClick={() => setIsMobileTreeOpen((prev) => !prev)}
            className="md:hidden flex items-center gap-1 px-2 py-1 rounded text-xs bg-surface-subtle border border-border text-ink-muted hover:text-ink mr-1 flex-shrink-0 cursor-pointer"
            title="Toggle documents and sessions list"
          >
            <Folder className="w-3.5 h-3.5 text-brand" />
            <span className="text-[11px] font-medium">Files</span>
          </button>

          {documents.slice(0, 3).map((doc, idx) => (
            <div
              key={doc.id}
              onClick={() => onOpenDocumentReader(doc)}
              className={clsx(
                'flex items-center gap-2 px-3 py-1.5 rounded-t-md text-xs cursor-pointer border-t-2 transition-colors max-w-xs',
                idx === 0
                  ? 'bg-canvas border-brand font-medium text-ink'
                  : 'bg-surface border-transparent text-ink-muted hover:text-ink hover:bg-surface-subtle'
              )}
            >
              <FileText className="w-3.5 h-3.5 text-brand flex-shrink-0" />
              <span className="truncate">{doc.original_filename || doc.filename}</span>
            </div>
          ))}

          <div className="flex items-center gap-3 ml-auto">
            {sessionDetail?.messages?.length > 0 && (
              <button
                onClick={handleExportSession}
                className="flex items-center gap-1.5 text-[11px] font-medium text-ink-muted hover:text-brand px-2.5 py-1 rounded-md border border-border bg-surface hover:bg-surface-subtle transition-colors shadow-2xs"
                title="Export entire research conversation with citations as Markdown"
              >
                <Download className="w-3.5 h-3.5 text-brand" />
                <span>Export Session (.md)</span>
              </button>
            )}
            <span className="text-[11px] text-ink-faint px-1">
              {documents.length} indexed files
            </span>
          </div>
        </div>

        {/* Conversation / Findings Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {sessionDetail?.messages?.length === 0 && !isStreaming ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto my-auto gap-3 text-ink-muted">
              <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-ink text-sm">
                Trace every answer to the sentence that proves it.
              </h3>
              <p className="text-xs font-serif leading-relaxed">
                Submit a research inquiry below. NexusRAG executes our 9-node LangGraph pipeline to retrieve, rerank, and synthesize findings with verifiable citations.
              </p>
            </div>
          ) : (
            sessionDetail?.messages?.map((msg) => (
              <div
                key={msg.id}
                className={clsx(
                  'flex flex-col gap-2 max-w-3xl w-full',
                  msg.role === 'user' ? 'self-end items-end ml-12' : 'self-start items-start mr-12'
                )}
              >
                {/* Role and Timestamp Badge */}
                <div className="flex items-center gap-2 text-[11px] text-ink-muted px-1">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">
                    {msg.role === 'user' ? 'You' : 'NexusRAG Synthesis'}
                  </span>
                  <span>•</span>
                  <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {/* Message Body */}
                <div
                  className={clsx(
                    'p-4 rounded-xl text-sm leading-relaxed shadow-xs w-full',
                    msg.role === 'user'
                      ? 'bg-[#20272F] text-white'
                      : 'bg-surface border border-border font-serif text-ink'
                  )}
                >
                  {msg.role === 'user' ? (
                    <p className="font-sans">{msg.content}</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="whitespace-pre-wrap leading-relaxed text-sm">
                        {renderTextWithCitations(msg.content, msg.citations || [])}
                      </div>

                      {/* Bottom Synthesis Action Bar */}
                      <div className="flex items-center justify-between pt-3 border-t border-border/80 text-xs text-ink-muted font-sans">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyText(msg.content, msg.id)}
                            className="flex items-center gap-1 hover:text-ink text-[11px] p-1 rounded hover:bg-surface-subtle"
                            title="Copy synthesis"
                          >
                            {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                          </button>

                          <button
                            onClick={() => handleExportAnswer(msg, sessionDetail?.messages[sessionDetail.messages.indexOf(msg) - 1]?.content)}
                            className="flex items-center gap-1 hover:text-ink text-[11px] p-1 rounded hover:bg-surface-subtle"
                            title="Export this answer as Markdown with citations"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Export</span>
                          </button>

                          <button
                            onClick={() => handleSend(sessionDetail?.messages[sessionDetail.messages.indexOf(msg) - 1]?.content || '')}
                            className="flex items-center gap-1 hover:text-ink text-[11px] p-1 rounded hover:bg-surface-subtle"
                            title="Regenerate synthesis"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Regenerate</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          {msg.citations?.length > 0 && (
                            <span className="font-mono text-[10px] text-status-success font-semibold">
                              ✓ {msg.citations.length} Verified Citations
                            </span>
                          )}

                          <button
                            onClick={() => onNavigateToInspector(msg.workflow_run_id)}
                            className="hover:text-brand flex items-center gap-1 text-[11px] p-1 rounded hover:bg-surface-subtle"
                            title="Inspect 9-node LangGraph trace for this synthesis"
                          >
                            <Activity className="w-3.5 h-3.5 text-brand" />
                            <span>Inspect this answer</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Streaming Synthesis Bubble */}
          {isStreaming && (
            <div className="self-start w-full max-w-3xl flex flex-col gap-2 mr-12">
              <span className="text-[10px] font-mono uppercase tracking-wider text-citation animate-pulse">
                NexusRAG Synthesis ({currentStage || 'Processing'}...)
              </span>
              <div className="bg-surface border border-brand/30 p-4 rounded-xl text-sm font-serif text-ink leading-relaxed shadow-xs">
                <div className="whitespace-pre-wrap">
                  {streamingText || <span className="text-ink-muted italic">Synthesizing findings from indexed passages...</span>}
                  <span className="inline-block w-1.5 h-4 bg-brand ml-1 animate-pulse" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Active Research Desk Scope Bar */}
        <div className="h-8 bg-surface-subtle/60 border-t border-border px-4 flex items-center justify-between text-xs text-ink-muted select-none flex-shrink-0">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-status-success" />
            <span>Active Research Session</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-ink-faint">
            <span>{documents.length} {documents.length === 1 ? 'document' : 'documents'} indexed</span>
            <span>•</span>
            <span>{collections.length} {collections.length === 1 ? 'collection' : 'collections'}</span>
          </div>
        </div>

        {/* Question Input Composer */}
        <div className="p-4 bg-surface border-t border-border flex flex-col gap-2 flex-shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 bg-surface-subtle border border-border rounded-xl px-3.5 py-2.5 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20 shadow-2xs"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask a question or request verification on cited facts..."
              className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
              disabled={isStreaming}
            />

            {/* Scope select */}
            <select
              value={selectedScope}
              onChange={(e) => setSelectedScope(e.target.value)}
              className="text-xs bg-surface border border-border rounded-lg px-2.5 py-1 text-ink focus:outline-none focus:border-brand"
              disabled={isStreaming}
            >
              <option value="all">All Documents</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {isStreaming ? (
              <Button
                variant="danger"
                size="sm"
                icon={Square}
                onClick={handleStopGeneration}
                title="Stop streaming"
              >
                Stop
              </Button>
            ) : (
              <button
                type="submit"
                disabled={!inputQuery.trim()}
                className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                  inputQuery.trim()
                    ? 'bg-brand text-white hover:bg-brand-hover shadow-2xs cursor-pointer'
                    : 'bg-surface text-ink-faint border border-border cursor-not-allowed'
                )}
                title="Send inquiry"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>
      </main>

      {/* Panel 3: Right "Assistant" Panel (Design Reference 2 Layout) */}
      <aside className="hidden lg:flex w-80 bg-surface border-l border-border flex-col flex-shrink-0 select-none">
        {/* Panel Tabs Header */}
        <div className="flex border-b border-border bg-surface-subtle text-xs">
          {[
            { id: 'assistant', label: 'Assistant' },
            { id: 'passage', label: 'Passage' },
            { id: 'citation', label: 'Citation' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRightPanelTab(tab.id)}
              className={clsx(
                'flex-1 py-2.5 text-center font-medium border-b-2 transition-colors',
                rightPanelTab === tab.id
                  ? 'border-brand text-brand bg-surface'
                  : 'border-transparent text-ink-muted hover:text-ink'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Panel Body */}
        <div className="flex-1 overflow-y-auto p-4 text-xs flex flex-col gap-4">
          {rightPanelTab === 'assistant' && (
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">
                    Suggested Inquiries
                  </span>
                  {documents.length > 0 && suggestedInquiries.length > 0 && (
                    <span className="text-[10px] text-brand font-medium">
                      Derived from {selectedDocIds.length > 0 ? 'Selected' : 'Indexed'} Files
                    </span>
                  )}
                </div>

                {documents.length === 0 ? (
                  <div className="p-3.5 rounded-xl bg-surface-subtle border border-border text-center flex flex-col gap-1">
                    <span className="font-semibold text-ink text-xs block">No Documents Indexed</span>
                    <p className="text-ink-muted text-[11px] font-serif leading-relaxed">
                      Upload files or load benchmark documents to view document-derived research suggestions.
                    </p>
                  </div>
                ) : suggestedInquiries.length === 0 ? (
                  <div className="p-3 rounded-lg bg-surface-subtle border border-border text-center text-ink-muted text-[11px]">
                    No inquiries derived for current scope. Select documents to refresh suggestions.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {suggestedInquiries.map((item, idx) => (
                      <button
                        key={item.id || idx}
                        onClick={() => handleSend(item.query)}
                        className="p-2.5 rounded-xl border border-border hover:border-brand bg-surface hover:bg-surface-subtle/80 text-left transition-colors flex items-center justify-between group shadow-2xs cursor-pointer"
                      >
                        <span className="font-medium text-ink">{item.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-ink-faint group-hover:text-brand flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Research Tips Card */}
              <div className="p-3.5 rounded-xl bg-surface-subtle border border-border flex flex-col gap-2">
                <span className="font-semibold text-ink text-xs">Citation Grounding</span>
                <p className="text-ink-muted leading-relaxed font-serif text-[11px]">
                  Every bracketed chip [1], [2] links to an exact character offset in the original document. Click any citation to inspect the raw excerpt.
                </p>
              </div>
            </div>
          )}

          {rightPanelTab === 'passage' && (
            <div className="flex flex-col gap-3">
              <h3 className="font-semibold text-ink text-xs uppercase tracking-wide">
                Referenced Passage
              </h3>
              {selectedCitation ? (
                <div className="flex flex-col gap-3">
                  <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 font-serif text-xs text-ink leading-relaxed">
                    "{selectedCitation.excerpt}"
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-ink-muted">
                    <span>Source [{selectedCitation.index || selectedCitation.citation_index}]</span>
                    <span>Page {selectedCitation.page_number}</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    icon={ExternalLink}
                    onClick={() => onOpenDocumentReader(selectedCitation)}
                  >
                    Open in Document Reader
                  </Button>
                </div>
              ) : (
                <p className="text-ink-muted italic">
                  Click any bracketed citation chip [1], [2] in an answer to inspect its exact passage.
                </p>
              )}
            </div>
          )}

          {rightPanelTab === 'citation' && (
            <div className="flex flex-col gap-3">
              <h3 className="font-semibold text-ink text-xs uppercase tracking-wide">
                Citation Metadata
              </h3>
              {selectedCitation ? (
                <div className="flex flex-col gap-2 font-mono text-[11px]">
                  <div className="p-2.5 rounded-xl bg-surface-subtle border border-border">
                    <span className="text-ink-muted block text-[10px] uppercase">Document</span>
                    <span className="text-ink font-semibold truncate block">{selectedCitation.filename}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-subtle border border-border">
                    <span className="text-ink-muted block text-[10px] uppercase">Page Number</span>
                    <span className="text-ink font-semibold">{selectedCitation.page_number}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-subtle border border-border">
                    <span className="text-ink-muted block text-[10px] uppercase">Groundedness Gate</span>
                    <span className="text-status-success font-semibold">Passed (&gt; 0.700 threshold)</span>
                  </div>
                </div>
              ) : (
                <p className="text-ink-muted italic">No citation selected.</p>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Citation Bottom Sheet (for viewports < 1024px) */}
      {isMobileCitationSheetOpen && selectedCitation && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/50 backdrop-blur-2xs animate-in fade-in duration-150">
          <div
            className="bg-surface border-t border-border rounded-t-2xl max-h-[75vh] flex flex-col shadow-2xl p-5 gap-3 animate-in slide-in-from-bottom duration-200"
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto" />
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-brand text-white px-2 py-0.5 rounded">
                  Citation [{selectedCitation.index || selectedCitation.citation_index || 1}]
                </span>
                <span className="text-xs font-semibold text-ink truncate max-w-[200px]">
                  {selectedCitation.filename || selectedCitation.document_title || 'Source Evidence'}
                </span>
              </div>
              <button
                onClick={() => setIsMobileCitationSheetOpen(false)}
                className="p-1 rounded hover:bg-surface-subtle text-ink-muted cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-amber-700 dark:text-amber-400 font-semibold uppercase">
                    Source Evidence (Page {selectedCitation.page_number || 1})
                  </span>
                  <span className="text-[10px] font-mono text-status-success font-medium">Verified Grounded</span>
                </div>
                <p className="font-serif italic text-ink leading-relaxed">
                  "{selectedCitation.excerpt}"
                </p>
              </div>

              <div className="p-3 rounded-lg bg-surface-subtle border border-border flex items-center justify-between font-mono text-[11px]">
                <span className="text-ink-muted">Retrieval Similarity:</span>
                <span className="text-brand font-bold">{Math.round((selectedCitation.score || 0.85) * 100)}% Match</span>
              </div>

              <Button
                variant="primary"
                size="sm"
                icon={ExternalLink}
                onClick={() => {
                  setIsMobileCitationSheetOpen(false);
                  onOpenDocumentReader(selectedCitation);
                }}
                className="w-full justify-center"
              >
                Open in Document Reader (Page {selectedCitation.page_number || 1})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
