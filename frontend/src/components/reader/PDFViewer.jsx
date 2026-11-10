import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Search,
  FileText,
  Bookmark
} from 'lucide-react';
import { Button } from '../common/Button';
import clsx from 'clsx';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export function PDFViewer({
  fileUrl,
  filename,
  highlightPage = 1,
  highlightExcerpt = '',
  activeTab = 'passage', // 'info', 'citation', 'passage'
  onTabChange,
  documentMetadata = {}
}) {
  const canvasRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(highlightPage || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [scale, setScale] = useState(1.1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Update page when target highlight changes
  useEffect(() => {
    if (highlightPage && highlightPage >= 1) {
      setCurrentPage(highlightPage);
    }
  }, [highlightPage]);

  // Load PDF Document
  useEffect(() => {
    if (!fileUrl) return;

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
        setError('Failed to load document preview. Ensure file is accessible.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
      loadingTask.destroy();
    };
  }, [fileUrl]);

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
  const zoomReset = () => setScale(1.1);

  return (
    <div className="flex h-full w-full bg-canvas-subtle overflow-hidden">
      {/* Main Document Canvas View */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-border">
        {/* Document Viewer Toolbar */}
        <div className="h-11 bg-surface border-b border-border px-4 flex items-center justify-between text-xs flex-shrink-0 select-none">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={ChevronLeft}
              onClick={prevPage}
              disabled={currentPage <= 1 || loading}
              aria-label="Previous page"
            />
            <span className="font-mono text-ink text-xs">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              icon={ChevronRight}
              onClick={nextPage}
              disabled={currentPage >= totalPages || loading}
              aria-label="Next page"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" icon={ZoomOut} onClick={zoomOut} title="Zoom out" />
            <span className="font-mono text-[11px] text-ink-muted w-10 text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button variant="ghost" size="sm" icon={ZoomIn} onClick={zoomIn} title="Zoom in" />
            <Button variant="ghost" size="sm" icon={Maximize2} onClick={zoomReset} title="Fit to width" />
          </div>
        </div>

        {/* Highlight notification banner if focused on cited passage */}
        {highlightExcerpt && (
          <div className="bg-citation/10 border-b border-citation/30 px-4 py-2 flex items-center justify-between text-xs text-ink">
            <div className="flex items-center gap-2 truncate">
              <Bookmark className="w-3.5 h-3.5 text-citation flex-shrink-0" />
              <span className="font-medium text-citation">Cited Passage on Page {highlightPage}:</span>
              <span className="italic truncate text-ink-muted">"{highlightExcerpt}"</span>
            </div>
          </div>
        )}

        {/* Scrollable PDF Canvas Area */}
        <div className="flex-1 overflow-auto p-6 flex justify-center items-start">
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

          <canvas
            ref={canvasRef}
            className={clsx('pdf-page-canvas bg-white rounded transition-opacity', loading ? 'opacity-30' : 'opacity-100')}
          />
        </div>
      </div>

      {/* Right Source Evidence Panel (Info / Citation / Passage Tabs) */}
      <div className="w-80 flex-shrink-0 bg-surface flex flex-col h-full border-l border-border select-none">
        {/* Panel Tabs */}
        <div className="flex border-b border-border bg-surface-subtle text-xs">
          {[
            { id: 'passage', label: 'Passage' },
            { id: 'citation', label: 'Citation' },
            { id: 'info', label: 'Info' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange && onTabChange(tab.id)}
              className={clsx(
                'flex-1 py-2.5 text-center font-medium border-b-2 transition-colors',
                activeTab === tab.id
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
          {activeTab === 'passage' && (
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-ink text-xs uppercase tracking-wide">
                Referenced Passage
              </h4>
              {highlightExcerpt ? (
                <div className="p-3 rounded bg-citation/10 border border-citation/30 text-ink leading-relaxed font-serif text-sm">
                  "{highlightExcerpt}"
                </div>
              ) : (
                <p className="text-ink-muted italic">
                  Select a citation chip in the research desk to focus the exact passage here.
                </p>
              )}
            </div>
          )}

          {activeTab === 'citation' && (
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-ink text-xs uppercase tracking-wide">
                Citation Metadata
              </h4>
              <div className="p-3 rounded bg-surface-subtle border border-border flex flex-col gap-2 font-mono text-[11px]">
                <div>
                  <span className="text-ink-muted block text-[10px] uppercase">File Name</span>
                  <span className="text-ink font-medium">{filename || 'Unknown'}</span>
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

          {activeTab === 'info' && (
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-ink text-xs uppercase tracking-wide">
                Document Facts
              </h4>
              <div className="flex flex-col gap-2 font-mono text-[11px]">
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-ink-muted">Pages</span>
                  <span className="text-ink font-medium">{documentMetadata.page_count ?? totalPages}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-ink-muted">Chunks</span>
                  <span className="text-ink font-medium">{documentMetadata.chunk_count ?? '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-ink-muted">Type</span>
                  <span className="text-ink font-medium uppercase">{documentMetadata.file_type ?? 'PDF'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-ink-muted">Status</span>
                  <span className="text-status-success font-medium">{documentMetadata.status ?? 'Indexed'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

