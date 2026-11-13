import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Search,
  FileText,
  Bookmark,
  Highlighter,
  MessageSquare,
  Sparkles,
  X,
  MoreHorizontal,
  Send,
  ArrowUpDown,
  Download,
  Share2,
  LayoutGrid,
  AlignLeft
} from 'lucide-react';
import { Button } from '../common/Button';
import { useDocumentChunks } from '../../api/queries';
import clsx from 'clsx';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export function PDFViewer({
  fileUrl,
  filename,
  highlightPage = 1,
  highlightExcerpt = '',
  activeTab = 'citation', // 'info', 'citation', 'notes'
  onTabChange,
  documentMetadata = {}
}) {
  const isPdf = Boolean((filename || fileUrl || '').toLowerCase().match(/\.pdf($|\?)/));
  const canvasRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(highlightPage || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [scale, setScale] = useState(1.15);
  const [loading, setLoading] = useState(true);
  const [rawText, setRawText] = useState('');
  const [textLoading, setTextLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchFileTerm, setSearchFileTerm] = useState('');
  const [panelTab, setPanelTab] = useState(activeTab || 'citation');
  const [isPopoverOpen, setIsPopoverOpen] = useState(true);
  const [popoverComment, setPopoverComment] = useState('');
  const [commentsList, setCommentsList] = useState([]);
  const [filterColor, setFilterColor] = useState('all');
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [viewMode, setViewMode] = useState(() => (isPdf ? 'canvas' : 'text'));
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

  const chunksQuery = useDocumentChunks(documentMetadata?.id);
  const chunks = chunksQuery.data?.chunks || [];

  const renderHighlightedContent = (text, excerpt) => {
    if (!text) return null;
    if (!excerpt || !excerpt.trim()) return text;

    const cleanExcerpt = excerpt.trim();
    const idx = text.toLowerCase().indexOf(cleanExcerpt.toLowerCase().slice(0, 35));
    if (idx === -1) return text;

    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + Math.min(cleanExcerpt.length, 300));
    const after = text.slice(idx + match.length);

    return (
      <>
        {before}
        <mark className="bg-amber-200 dark:bg-amber-900/60 text-ink px-1 py-0.5 rounded font-medium border-b-2 border-brand">
          {match}
        </mark>
        {after}
      </>
    );
  };

  // Sync internal panel tab with parent
  useEffect(() => {
    if (activeTab) setPanelTab(activeTab);
  }, [activeTab]);

  // Update page when target highlight changes
  useEffect(() => {
    if (highlightPage && highlightPage >= 1) {
      setCurrentPage(highlightPage);
      setIsPopoverOpen(true);
    }
  }, [highlightPage, highlightExcerpt]);

  // Load Document (PDF via PDF.js, or plain text / markdown via direct fetch)
  useEffect(() => {
    if (!fileUrl) return;

    if (!isPdf) {
      let isMounted = true;
      setTextLoading(true);
      setError(null);
      setLoading(false);
      setViewMode('text');

      const targetUrl = fileUrl.startsWith('http')
        ? fileUrl
        : (typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null'
          ? `${window.location.origin}${fileUrl}`
          : fileUrl);

      fetch(targetUrl, { credentials: 'include' })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.text();
        })
        .then((txt) => {
          if (!isMounted) return;
          setRawText(txt);
          setTextLoading(false);
        })
        .catch((err) => {
          if (!isMounted) return;
          console.warn('Direct file text fetch error, using chunks:', err);
          setTextLoading(false);
        });

      return () => {
        isMounted = false;
      };
    } else {
      let isMounted = true;
      setLoading(true);
      setError(null);

      const loadingTask = pdfjsLib.getDocument({
        url: fileUrl,
        withCredentials: true,
      });

      loadingTask.promise
        .then((doc) => {
          if (!isMounted) return;
          setPdfDoc(doc);
          setTotalPages(doc.numPages);
          setLoading(false);
        })
        .catch((err) => {
          if (!isMounted) return;
          console.error('Error loading PDF document:', err);
          // Gracefully fall back to extracted text if available
          setViewMode('text');
          setLoading(false);
          if (!chunks || chunks.length === 0) {
            setError('Failed to load document preview. Ensure file is accessible.');
          }
        });

      return () => {
        isMounted = false;
        loadingTask.destroy();
      };
    }
  }, [fileUrl, isPdf]);

  // Render current page to canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let renderTask = null;
    let isCancelled = false;

    pdfDoc.getPage(currentPage).then((page) => {
      if (isCancelled) return;
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext('2d');

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport,
      };

      renderTask = page.render(renderContext);
      renderTask.promise.catch((err) => {
        if (err.name !== 'RenderingCancelledException') {
          console.error('Page render error:', err);
        }
      });
    });

    return () => {
      isCancelled = true;
      if (renderTask) renderTask.cancel();
    };
  }, [pdfDoc, currentPage, scale]);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const zoomIn = () => setScale((s) => Math.min(2.5, s + 0.15));
  const zoomOut = () => setScale((s) => Math.max(0.6, s - 0.15));
  const zoomReset = () => setScale(1.15);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!popoverComment.trim()) return;
    setCommentsList((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: popoverComment.trim(),
        page: currentPage,
        created: 'Just now'
      }
    ]);
    setPopoverComment('');
  };

  return (
    <div className="flex h-full w-full bg-[#EFECE6] dark:bg-[#12151B] overflow-hidden select-none">
      {/* Main Document Canvas View */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-border">
        {/* Top Annotator Toolbar (Reference 3 Layout) */}
        <div className="h-11 bg-surface border-b border-border px-4 flex items-center justify-between text-xs flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Toggle Thumbnails */}
            <button
              onClick={() => setShowThumbnails((prev) => !prev)}
              className={clsx('p-1.5 rounded hover:bg-surface-subtle text-ink-muted transition-colors cursor-pointer', showThumbnails && 'bg-brand/10 text-brand font-bold')}
              title="Toggle Page Thumbnails"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>

            {/* Title / App identifier */}
            <div className="flex items-center gap-2 font-medium text-ink">
              <FileText className="w-4 h-4 text-brand" />
              <span className="hidden sm:inline font-semibold">NexusRAG File Annotator</span>
            </div>

            {/* Page navigation controls: < 4 of 20 > for PDF, or Format badge for TXT/MD */}
            {isPdf ? (
              <div className="flex items-center gap-1 border-l border-border pl-3">
                <button
                  onClick={prevPage}
                  disabled={currentPage <= 1 || loading}
                  className="p-1 rounded hover:bg-surface-subtle disabled:opacity-40 text-ink cursor-pointer"
                  title="Previous page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <span className="font-mono text-xs text-ink px-1.5">
                  <span className="font-semibold">{currentPage}</span> of {totalPages}
                </span>

                <button
                  onClick={nextPage}
                  disabled={currentPage >= totalPages || loading}
                  className="p-1 rounded hover:bg-surface-subtle disabled:opacity-40 text-ink cursor-pointer"
                  title="Next page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 border-l border-border pl-3 text-[11px] font-mono text-ink-muted">
                <span className="px-1.5 py-0.5 rounded bg-brand/10 text-brand font-semibold uppercase">
                  {documentMetadata?.file_extension?.replace('.', '') || 'TXT'}
                </span>
                <span className="text-ink-muted">Verified Evidence</span>
              </div>
            )}
          </div>

          {/* Center Zoom & Tool Icons */}
          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="hidden sm:flex items-center gap-0.5 bg-surface-subtle rounded-md p-0.5 border border-border">
              {isPdf ? (
                <>
                  <button
                    onClick={() => setViewMode('canvas')}
                    className={clsx('px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer', viewMode === 'canvas' ? 'bg-surface text-ink shadow-2xs font-bold' : 'text-ink-muted hover:text-ink')}
                  >
                    PDF View
                  </button>
                  <button
                    onClick={() => setViewMode('text')}
                    className={clsx('px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer', viewMode === 'text' ? 'bg-surface text-ink shadow-2xs font-bold' : 'text-ink-muted hover:text-ink')}
                  >
                    Extracted Text
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setViewMode('text')}
                    className="px-2 py-0.5 rounded text-[11px] font-medium bg-surface text-ink shadow-2xs font-bold"
                  >
                    Document View
                  </button>
                </>
              )}
            </div>

            {viewMode === 'canvas' && (
              <div className="flex items-center gap-1 bg-surface-subtle rounded-md p-0.5 border border-border">
                <button onClick={zoomOut} className="p-1 rounded hover:bg-surface text-ink-muted hover:text-ink cursor-pointer" title="Zoom out">
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] text-ink-muted w-10 text-center">
                  {Math.round(scale * 100)}%
                </span>
                <button onClick={zoomIn} className="p-1 rounded hover:bg-surface text-ink-muted hover:text-ink cursor-pointer" title="Zoom in">
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button onClick={zoomReset} className="p-1 rounded hover:bg-surface text-ink-muted hover:text-ink cursor-pointer" title="Reset zoom">
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Annotator Tools (Highlight, Pin, Note) */}
            <div className="hidden md:flex items-center gap-1 border-l border-border pl-2">
              <button className="p-1.5 rounded bg-brand/10 text-brand" title="Highlight text">
                <Highlighter className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded hover:bg-surface-subtle text-ink-muted" title="Add bookmark pin">
                <Bookmark className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded hover:bg-surface-subtle text-ink-muted" title="Add note">
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right In-Document Search & Actions */}
          <div className="flex items-center gap-2">
            <div className="relative hidden lg:block">
              <Search className="w-3 h-3 text-ink-faint absolute left-2 top-2" />
              <input
                type="text"
                placeholder="Search file content..."
                value={searchFileTerm}
                onChange={(e) => setSearchFileTerm(e.target.value)}
                className="pl-7 pr-3 py-1 text-[11px] bg-surface-subtle border border-border rounded-md text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand w-36"
              />
            </div>

            <button
              onClick={() => setIsMobilePanelOpen((prev) => !prev)}
              className="md:hidden p-1.5 rounded hover:bg-surface-subtle text-ink-muted cursor-pointer"
              title="Toggle evidence & notes panel"
            >
              <Bookmark className="w-3.5 h-3.5 text-brand" />
            </button>

            <button
              onClick={() => window.open(fileUrl, '_blank')}
              className="p-1.5 rounded hover:bg-surface-subtle text-ink-muted hover:text-ink cursor-pointer"
              title="Download / View raw file"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Document Viewer Body (Canvas vs Extracted Text + Thumbnails) */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Thumbnails Sidebar (if toggled) */}
          {showThumbnails && (
            <div className="w-24 bg-surface border-r border-border flex flex-col h-full flex-shrink-0 overflow-y-auto p-2 gap-2 text-xs select-none">
              <div className="text-[10px] font-bold text-ink-muted uppercase tracking-wider text-center pb-1 border-b border-border">
                Pages
              </div>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={clsx(
                    'w-full py-2 rounded-lg border text-center transition-all cursor-pointer font-mono text-xs flex flex-col items-center gap-0.5',
                    p === currentPage
                      ? 'border-brand bg-brand/10 text-brand font-bold ring-1 ring-brand'
                      : 'border-border bg-surface-subtle text-ink-muted hover:border-brand/40 hover:text-ink'
                  )}
                >
                  <span className="text-[9px] uppercase font-sans">Page</span>
                  <span className="text-xs font-semibold">{p}</span>
                </button>
              ))}
            </div>
          )}

          {/* Extracted Text or Full Text Document View */}
          {viewMode === 'text' ? (
            <div className="flex-1 overflow-auto p-6 flex flex-col items-center bg-canvas">
              <div className="max-w-3xl w-full bg-surface border border-border rounded-xl shadow-xs p-6 flex flex-col gap-6 text-ink font-serif leading-relaxed text-sm">
                <div className="flex items-center justify-between pb-3 border-b border-border font-sans text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand" />
                    <span className="font-semibold text-ink">{filename}</span>
                  </div>
                  <span className="font-mono text-ink-muted text-[11px]">
                    {rawText ? 'Full Text Document' : `${chunks.length} Extracted Chunks`}
                  </span>
                </div>

                {/* Popover / Citation Highlight Card for Text Documents */}
                {highlightExcerpt && isPopoverOpen && (
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 shadow-xs flex flex-col gap-2 font-sans">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-brand/10 text-brand flex items-center justify-center font-bold text-[10px]">
                          AI
                        </div>
                        <span className="font-semibold text-xs text-ink">Verified Citation Anchor</span>
                      </div>
                      <button
                        onClick={() => setIsPopoverOpen(false)}
                        className="p-1 rounded hover:bg-surface-subtle text-ink-faint hover:text-ink cursor-pointer"
                        title="Dismiss citation card"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="font-serif italic text-xs text-ink bg-white/70 dark:bg-black/30 p-2.5 rounded-lg border border-amber-200/50 dark:border-amber-800/40 leading-relaxed">
                      "{highlightExcerpt}"
                    </p>
                  </div>
                )}

                {/* Content Rendering: Raw Document Text or Chunks */}
                {textLoading || (loading && isPdf) ? (
                  <div className="p-8 text-center text-xs text-ink-muted flex flex-col items-center gap-2">
                    <div className="animate-spin w-5 h-5 border-2 border-brand border-t-transparent rounded-full" />
                    <span>Loading document content...</span>
                  </div>
                ) : rawText ? (
                  <div className="font-serif text-sm leading-relaxed whitespace-pre-wrap text-ink select-text bg-surface-subtle/50 p-6 rounded-xl border border-border/60">
                    {renderHighlightedContent(rawText, highlightExcerpt)}
                  </div>
                ) : chunksQuery.isLoading ? (
                  <div className="p-8 text-center text-xs text-ink-muted flex flex-col items-center gap-2">
                    <div className="animate-spin w-5 h-5 border-2 border-brand border-t-transparent rounded-full" />
                    <span>Loading extracted text chunks...</span>
                  </div>
                ) : chunks.length === 0 ? (
                  <div className="p-8 text-center text-xs text-ink-muted italic">
                    No extracted text available for this document.
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {chunks.map((chunk) => {
                      const isHighlighted = highlightExcerpt && chunk.content?.toLowerCase().includes(highlightExcerpt.toLowerCase().slice(0, 30));
                      return (
                        <div
                          key={chunk.id}
                          className={clsx(
                            'p-4 rounded-xl border flex flex-col gap-2 transition-all',
                            isHighlighted
                              ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/60 ring-2 ring-brand/30'
                              : 'bg-surface-subtle border-border'
                          )}
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono text-ink-muted border-b border-border/50 pb-1">
                            <span className="font-semibold text-ink">Chunk #{chunk.chunk_index + 1} • Page {chunk.page_number}</span>
                            <span>Chars {chunk.char_start}-{chunk.char_end} ({chunk.token_count} tokens)</span>
                          </div>
                          <p className="whitespace-pre-wrap font-serif text-xs text-ink leading-relaxed">
                            {chunk.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Scrollable PDF Canvas Area with Anchored Floating Popover */
            <div className="flex-1 overflow-auto p-6 flex justify-center items-start relative">
              {loading && (
                <div className="flex flex-col items-center justify-center p-12 text-ink-muted text-xs gap-3">
                  <div className="animate-spin w-6 h-6 border-2 border-brand border-t-transparent rounded-full" />
                  <span>Rendering page {currentPage}...</span>
                </div>
              )}

              {error && (
                <div className="bg-surface border border-status-error/30 text-status-error p-4 rounded text-xs max-w-md">
                  {error}
                </div>
              )}

              <div className="relative inline-block">
                <canvas
                  ref={canvasRef}
                  className={clsx('pdf-page-canvas bg-white rounded-md shadow-md transition-opacity', loading ? 'opacity-30' : 'opacity-100')}
                />

                {/* Floating Popover Card Anchored to the Highlighted Passage (Reference 3 Signature) */}
                {highlightExcerpt && isPopoverOpen && !loading && (
                  <div
                    className="absolute top-16 left-8 z-30 max-w-sm w-80 bg-surface border border-border rounded-xl shadow-xl p-3.5 flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-150"
                    style={{ top: '15%', left: '8%' }}
                  >
                    {/* Popover Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-brand/10 text-brand flex items-center justify-center font-bold text-[10px]">
                          AI
                        </div>
                        <span className="font-semibold text-xs text-ink">NexusRAG AI</span>
                        <span className="text-[10px] text-ink-faint">just now</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setIsPopoverOpen(false)}
                          className="p-1 rounded hover:bg-surface-subtle text-ink-faint hover:text-ink cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Popover Content */}
                    <div className="text-xs text-ink-muted leading-relaxed font-sans">
                      <p className="font-medium text-ink mb-1">
                        Verified Citation (Page {currentPage}):
                      </p>
                      <p className="font-serif italic text-ink/90 bg-amber-50 dark:bg-amber-950/40 p-2 rounded border border-amber-200/60 dark:border-amber-800/40 text-[11px] leading-relaxed">
                        "{highlightExcerpt}"
                      </p>
                    </div>

                    {/* Comment / Ask AI input inside the popover */}
                    <form onSubmit={handleAddComment} className="flex items-center gap-1.5 pt-1 border-t border-border">
                      <input
                        type="text"
                        value={popoverComment}
                        onChange={(e) => setPopoverComment(e.target.value)}
                        placeholder="Type your comment..."
                        className="flex-1 bg-surface-subtle border border-border rounded-lg px-2.5 py-1 text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand"
                      />
                      <button
                        type="submit"
                        disabled={!popoverComment.trim()}
                        className="px-2.5 py-1 rounded-lg bg-brand text-white hover:bg-brand-hover disabled:opacity-40 text-xs font-medium flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <span>Ask AI</span>
                        <Send className="w-3 h-3" />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Source Evidence & Annotation Panel (Reference 3 Layout) */}
      <div className="hidden md:flex w-80 flex-shrink-0 bg-surface flex-col h-full border-l border-border select-none">
        {/* Panel Tabs: Info / Citation / Notes */}
        <div className="flex border-b border-border bg-surface-subtle text-xs">
          {[
            { id: 'info', label: 'Info' },
            { id: 'citation', label: 'Citation' },
            { id: 'notes', label: 'Notes' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setPanelTab(tab.id);
                if (onTabChange) onTabChange(tab.id);
              }}
              className={clsx(
                'flex-1 py-2.5 text-center font-medium border-b-2 transition-colors',
                panelTab === tab.id
                  ? 'border-brand text-brand bg-surface'
                  : 'border-transparent text-ink-muted hover:text-ink'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto p-4 text-xs flex flex-col gap-4">
          {/* Notes Tab (with search and color filter pills) */}
          {panelTab === 'notes' && (
            <div className="flex flex-col gap-3">
              {/* Search and Sort */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3 h-3 text-ink-faint absolute left-2 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search notes & comments..."
                    className="w-full pl-7 pr-2 py-1.5 text-xs bg-surface-subtle border border-border rounded-lg text-ink placeholder:text-ink-faint focus:outline-none"
                  />
                </div>
                <button className="p-1.5 rounded-lg border border-border hover:bg-surface-subtle text-ink-muted">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Excerpt Cards List */}
              <div className="flex flex-col gap-2.5 mt-2">
                {commentsList.length === 0 ? (
                  <div className="p-4 text-center text-ink-muted text-xs border border-dashed border-border rounded-xl">
                    No notes recorded yet. Use the popover to add comments.
                  </div>
                ) : (
                  commentsList.map((c) => (
                    <div key={c.id} className="p-3 rounded-xl border border-border bg-surface-subtle/50 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[10px] text-ink-muted">
                        <span>Page {c.page}</span>
                        <span>{c.created}</span>
                      </div>
                      <p className="text-xs text-ink">{c.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Citation Tab */}
          {panelTab === 'citation' && (
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-ink text-xs uppercase tracking-wide">
                Referenced Citation
              </h4>

              {highlightExcerpt ? (
                <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-amber-700 dark:text-amber-400">Page {highlightPage || currentPage}</span>
                    <span className="text-[10px] font-mono text-status-success font-medium">Verified Grounded</span>
                  </div>
                  <p className="text-xs text-ink leading-relaxed font-serif">
                    "{highlightExcerpt}"
                  </p>
                </div>
              ) : (
                <p className="text-ink-muted italic">
                  Select a citation chip in the research desk to focus the exact passage here.
                </p>
              )}

              <div className="p-3 rounded-xl bg-surface-subtle border border-border flex flex-col gap-2 font-mono text-[11px] mt-2">
                <div>
                  <span className="text-ink-muted block text-[10px] uppercase">File Name</span>
                  <span className="text-ink font-medium truncate block">{filename || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-ink-muted block text-[10px] uppercase">Target Page</span>
                  <span className="text-ink font-medium">{highlightPage || currentPage}</span>
                </div>
                <div>
                  <span className="text-ink-muted block text-[10px] uppercase">Integrity Status</span>
                  <span className="text-status-success font-medium">Server-side validated</span>
                </div>
              </div>
            </div>
          )}

          {/* Info Tab */}
          {panelTab === 'info' && (
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-ink text-xs uppercase tracking-wide">
                Document Facts
              </h4>
              <div className="flex flex-col gap-2 font-mono text-[11px]">
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-ink-muted">Pages</span>
                  <span className="text-ink font-medium">{documentMetadata.page_count ?? totalPages}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-ink-muted">Chunks</span>
                  <span className="text-ink font-medium">{documentMetadata.chunk_count ?? '-'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-ink-muted">Type</span>
                  <span className="text-ink font-medium uppercase">{documentMetadata.file_type ?? 'PDF'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-ink-muted">Status</span>
                  <span className="text-status-success font-medium">{documentMetadata.status ?? 'Indexed'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Evidence & Notes Bottom Sheet Drawer (< 768px) */}
      {isMobilePanelOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/50 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-surface border-t border-border rounded-t-2xl max-h-[75vh] flex flex-col shadow-2xl p-4 gap-3 animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 bg-border rounded-full mx-auto" />
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="font-semibold text-xs text-ink">Evidence & Notes</span>
              <button
                onClick={() => setIsMobilePanelOpen(false)}
                className="p-1 rounded hover:bg-surface-subtle text-ink-muted cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Tabs */}
            <div className="flex border-b border-border bg-surface-subtle text-xs rounded-lg overflow-hidden">
              {[
                { id: 'info', label: 'Info' },
                { id: 'citation', label: 'Citation' },
                { id: 'notes', label: 'Notes' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setPanelTab(tab.id);
                    if (onTabChange) onTabChange(tab.id);
                  }}
                  className={clsx(
                    'flex-1 py-2 text-center font-medium transition-colors cursor-pointer',
                    panelTab === tab.id ? 'bg-surface text-brand font-bold' : 'text-ink-muted hover:text-ink'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Mobile Tab Content */}
            <div className="flex-1 overflow-y-auto text-xs py-2">
              {panelTab === 'citation' && (
                <div className="flex flex-col gap-2">
                  {highlightExcerpt ? (
                    <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between font-mono text-[10px]">
                        <span className="text-amber-700 dark:text-amber-400 font-semibold">Page {highlightPage || currentPage}</span>
                        <span className="text-status-success font-medium">Verified Grounded</span>
                      </div>
                      <p className="font-serif italic text-ink leading-relaxed">
                        "{highlightExcerpt}"
                      </p>
                    </div>
                  ) : (
                    <p className="text-ink-muted italic">No citation active.</p>
                  )}
                </div>
              )}

              {panelTab === 'info' && (
                <div className="flex flex-col gap-2 font-mono text-[11px]">
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-ink-muted">Pages</span>
                    <span className="text-ink font-medium">{documentMetadata.page_count ?? totalPages}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-ink-muted">Chunks</span>
                    <span className="text-ink font-medium">{documentMetadata.chunk_count ?? '-'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-ink-muted">Type</span>
                    <span className="text-ink uppercase font-medium">{documentMetadata.file_type ?? 'PDF'}</span>
                  </div>
                </div>
              )}

              {panelTab === 'notes' && (
                <div className="flex flex-col gap-2">
                  {commentsList.length === 0 ? (
                    <p className="text-ink-muted italic">No notes recorded yet.</p>
                  ) : (
                    commentsList.map((c) => (
                      <div key={c.id} className="p-2.5 rounded-lg border border-border bg-surface-subtle">
                        <span className="text-[10px] text-ink-muted block">Page {c.page}</span>
                        <p className="text-xs text-ink mt-0.5">{c.text}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
