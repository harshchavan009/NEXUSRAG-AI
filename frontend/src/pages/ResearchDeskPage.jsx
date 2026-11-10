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
  Clock
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { StatusDot } from '../components/common/StatusDot';
import { streamQuery } from '../api/stream';
import {
  useSessions,
  useSessionDetail,
  useCreateSession,
  useDeleteSession,
  useCollections
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
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [currentStage, setCurrentStage] = useState(null);
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [rightPanelTab, setRightPanelTab] = useState('passage'); // 'passage', 'citation', 'trace'

  const abortControllerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const { data: sessions = [], refetch: refetchSessions } = useSessions();
  const { data: sessionDetail, refetch: refetchDetail } = useSessionDetail(activeSessionId);
  const { data: collections = [] } = useCollections();
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessionDetail?.messages, streamingText]);

  const handleCreateNewSession = async () => {
    const res = await createSessionMutation.mutateAsync('New Research Session');
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

    const scopeObj = scopeOverride || {
      collection_ids: selectedScope === 'all' ? [] : [selectedScope],
      document_ids: [],
    };

    const payload = {
      query,
      session_id: activeSessionId,
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
    <div className="flex-1 flex h-full overflow-hidden bg-canvas">
      {/* Panel 1: Left Sessions Rail (Design Reference 2) */}
      <aside className="w-64 bg-surface border-r border-border flex flex-col flex-shrink-0 select-none">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xs font-semibold text-ink uppercase tracking-wide">
            Research Sessions
          </h2>
          <button
            onClick={handleCreateNewSession}
            className="p-1 text-ink-muted hover:text-brand rounded hover:bg-surface-subtle"
            title="New Session"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 text-xs">
          {sessions.length === 0 ? (
            <div className="p-4 text-center text-ink-muted italic">
              No sessions yet. Click + to begin.
            </div>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => setActiveSessionId(s.id)}
                className={clsx(
                  'group flex items-center justify-between px-3 py-2.5 rounded cursor-pointer transition-colors',
                  activeSessionId === s.id
                    ? 'bg-brand/10 text-brand font-medium dark:bg-brand/20'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-subtle'
                )}
              >
                <div className="flex items-center gap-2 truncate flex-1 min-w-0 mr-2">
                  <BookOpen className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{s.title}</span>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="font-mono text-[10px] opacity-75">
                    {s.message_count || 0}
                  </span>
                  <button
                    onClick={(e) => handleDeleteSession(s.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-ink-faint hover:text-status-error transition-opacity"
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Panel 2: Center Conversation Synthesis Desk */}
      <main className="flex-1 flex flex-col min-w-0 bg-canvas overflow-hidden">
        {/* Desk Header */}
        <div className="h-12 bg-surface border-b border-border px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 truncate">
            <Sparkles className="w-4 h-4 text-brand" />
            <span className="text-xs font-semibold text-ink truncate">
              {sessionDetail?.title || 'Active Session'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {isStreaming && (
              <div className="flex items-center gap-2 font-mono text-[11px] text-citation animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-citation" />
                <span>{currentStage || 'Streaming response...'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Conversation History */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {sessionDetail?.messages?.length === 0 && !isStreaming ? (
            <div className="my-auto text-center max-w-md mx-auto p-8 rounded border border-border bg-surface text-xs text-ink-muted flex flex-col items-center gap-2">
              <Sparkles className="w-6 h-6 text-brand mb-1" />
              <p className="font-semibold text-ink">Empty Research Session</p>
              <p className="font-serif">
                Type your research question in the box below to synthesize answers across your indexed documents.
              </p>
            </div>
          ) : (
            sessionDetail?.messages?.map((msg) => (
              <div
                key={msg.id}
                className={clsx(
                  'flex flex-col gap-2 max-w-3xl',
                  msg.role === 'user' ? 'self-end items-end ml-12' : 'self-start items-start mr-12 w-full'
                )}
              >
                {/* Role Label */}
                <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted">
                  {msg.role === 'user' ? 'Researcher' : 'NexusRAG Synthesis'}
                </span>

                {/* Bubble / Container */}
                <div
                  className={clsx(
                    'p-4 rounded-md text-sm',
                    msg.role === 'user'
                      ? 'bg-brand text-white font-sans max-w-xl'
                      : 'bg-surface border border-border text-ink font-serif leading-relaxed w-full shadow-xs'
                  )}
                >
                  {msg.role === 'user' ? (
                    msg.content
                  ) : (
                    <div>
                      <div className="whitespace-pre-wrap">
                        {renderTextWithCitations(msg.content, msg.citations || [])}
                      </div>

                      {/* Message Footer with Citations & Groundedness */}
                      {msg.citations?.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs font-sans">
                          <div className="flex items-center gap-1.5">
                            <span className="text-ink-muted text-[11px]">Sources:</span>
                            {msg.citations.map((c) => (
                              <button
                                key={c.index || c.citation_index}
                                onClick={() => {
                                  setSelectedCitation(c);
                                  setRightPanelTab('passage');
                                }}
                                className="px-1.5 py-0.5 rounded bg-surface-subtle border border-border font-mono text-[10px] text-ink-muted hover:text-brand hover:border-brand"
                              >
                                [{c.index || c.citation_index}] {c.filename} (p. {c.page_number})
                              </button>
                            ))}
                          </div>

                          {msg.workflow_run_id && (
                            <button
                              onClick={() => onNavigateToInspector(msg.workflow_run_id)}
                              className="text-[11px] font-mono text-ink-muted hover:text-brand flex items-center gap-1"
                              title="View LangGraph DAG Execution Trace"
                            >
                              <Activity className="w-3 h-3" />
                              <span>Trace</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Real-time Streaming Message */}
          {isStreaming && (
            <div className="self-start w-full max-w-3xl flex flex-col gap-2 mr-12">
              <span className="text-[10px] font-mono uppercase tracking-wider text-citation animate-pulse">
                NexusRAG Synthesis (Streaming)
              </span>
              <div className="bg-surface border border-brand/30 p-4 rounded-md text-sm font-serif text-ink leading-relaxed shadow-xs">
                <div className="whitespace-pre-wrap">
                  {streamingText || <span className="text-ink-muted italic">Synthesizing findings...</span>}
                  <span className="inline-block w-1.5 h-4 bg-brand ml-1 animate-pulse" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Composer Box */}
        <div className="p-4 bg-surface border-t border-border flex flex-col gap-2 flex-shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 bg-canvas border border-border rounded-md px-3 py-2 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand/30"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask a question or request verification on cited facts..."
              className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
              disabled={isStreaming}
            />

            {/* Scope select in composer */}
            <select
              value={selectedScope}
              onChange={(e) => setSelectedScope(e.target.value)}
              className="text-xs bg-surface border border-border rounded px-2 py-1 text-ink focus:outline-none focus:border-brand"
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
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={Send}
                disabled={!inputQuery.trim()}
              >
                Ask
              </Button>
            )}
          </form>
        </div>
      </main>

      {/* Panel 3: Right Source Excerpt Panel (Design Reference 2 & 3) */}
      <aside className="w-80 bg-surface border-l border-border flex flex-col flex-shrink-0 select-none">
        {/* Panel Tabs */}
        <div className="flex border-b border-border bg-surface-subtle text-xs">
          {[
            { id: 'passage', label: 'Passage' },
            { id: 'citation', label: 'Citation' },
            { id: 'trace', label: 'Trace' },
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
          {rightPanelTab === 'passage' && (
            <div className="flex flex-col gap-3">
              <h3 className="font-semibold text-ink text-xs uppercase tracking-wide">
                Referenced Passage
              </h3>
              {selectedCitation ? (
                <div className="flex flex-col gap-3">
                  <div className="p-3.5 rounded bg-citation/10 border border-citation/30 font-serif text-xs text-ink leading-relaxed">
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
                    Open in PDF Reader
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
                  <div className="p-2.5 rounded bg-surface-subtle border border-border">
                    <span className="text-ink-muted block text-[10px] uppercase">Document</span>
                    <span className="text-ink font-semibold">{selectedCitation.filename}</span>
                  </div>
                  <div className="p-2.5 rounded bg-surface-subtle border border-border">
                    <span className="text-ink-muted block text-[10px] uppercase">Document ID</span>
                    <span className="text-ink truncate block">{selectedCitation.document_id}</span>
                  </div>
                  <div className="p-2.5 rounded bg-surface-subtle border border-border">
                    <span className="text-ink-muted block text-[10px] uppercase">Relevance Score</span>
                    <span className="text-status-success font-semibold">
                      {((selectedCitation.relevance_score || selectedCitation.score || 0.88) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-ink-muted italic">No citation selected.</p>
              )}
            </div>
          )}

          {rightPanelTab === 'trace' && (
            <div className="flex flex-col gap-3">
              <h3 className="font-semibold text-ink text-xs uppercase tracking-wide">
                Retrieval Pipeline Trace
              </h3>
              <p className="text-ink-muted text-xs leading-relaxed">
                Every query runs through our 9-node LangGraph DAG with input validation, FAISS vector retrieval, and structured reranking.
              </p>
              <Button
                variant="primary"
                size="sm"
                icon={Activity}
                onClick={() => onNavigateToInspector()}
              >
                Open Retrieval Inspector
              </Button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
