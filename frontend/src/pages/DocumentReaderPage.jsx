import React, { useState, useEffect } from 'react';
import { X, FileText, ExternalLink, Plus } from 'lucide-react';
import { PDFViewer } from '../components/reader/PDFViewer';
import { useDocuments } from '../api/queries';
import clsx from 'clsx';

export function DocumentReaderPage({ initialDocument = null, initialCitation = null }) {
  const { data: documents = [] } = useDocuments();
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [readerRightTab, setReaderRightTab] = useState('passage');

  // Handle incoming document or citation
  useEffect(() => {
    if (initialDocument) {
      openDocumentInTab(initialDocument, initialCitation);
    } else if (documents.length > 0 && openTabs.length === 0) {
      // Default to opening the first available document
      openDocumentInTab(documents[0]);
    }
  }, [initialDocument, initialCitation, documents]);

  const openDocumentInTab = (doc, citation = null) => {
    if (!doc) return;

    setOpenTabs((prev) => {
      const exists = prev.find((t) => t.id === doc.id);
      if (exists) {
        return prev.map((t) =>
          t.id === doc.id
            ? {
                ...t,
                highlightPage: citation ? citation.page_number : t.highlightPage,
                highlightExcerpt: citation ? citation.excerpt : t.highlightExcerpt,
              }
            : t
        );
      }
      return [
        ...prev,
        {
          id: doc.id,
          title: doc.original_filename,
          doc,
          highlightPage: citation ? citation.page_number : 1,
          highlightExcerpt: citation ? citation.excerpt : '',
        },
      ];
    });

    setActiveTabId(doc.id);
  };

  const closeTab = (tabId, e) => {
    e.stopPropagation();
    const remaining = openTabs.filter((t) => t.id !== tabId);
    setOpenTabs(remaining);
    if (activeTabId === tabId) {
      setActiveTabId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const currentTab = openTabs.find((t) => t.id === activeTabId);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-canvas">
      {/* Multi-Document Tabs Bar (Design Reference 2) */}
      <div className="h-10 bg-surface border-b border-border flex items-center px-2 gap-1 overflow-x-auto flex-shrink-0 select-none">
        {openTabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={clsx(
                'group flex items-center gap-2 px-3 py-1.5 rounded-t text-xs cursor-pointer border-t-2 transition-colors max-w-xs',
                isActive
                  ? 'bg-canvas-subtle border-brand font-medium text-ink'
                  : 'bg-surface border-transparent text-ink-muted hover:text-ink hover:bg-surface-subtle'
              )}
            >
              <FileText className="w-3.5 h-3.5 text-brand flex-shrink-0" />
              <span className="truncate">{tab.title}</span>
              <button
                onClick={(e) => closeTab(tab.id, e)}
                className="p-0.5 rounded hover:bg-border text-ink-faint hover:text-ink"
                title="Close tab"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {/* Quick Open Dropdown for Other Indexed Documents */}
        {documents.length > openTabs.length && (
          <select
            onChange={(e) => {
              const doc = documents.find((d) => d.id === e.target.value);
              if (doc) openDocumentInTab(doc);
              e.target.value = '';
            }}
            value=""
            className="text-[11px] bg-surface-subtle border border-border rounded px-2 py-1 text-ink-muted focus:outline-none ml-2"
          >
            <option value="" disabled>+ Open Document...</option>
            {documents
              .filter((d) => !openTabs.some((t) => t.id === d.id))
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.original_filename}
                </option>
              ))}
          </select>
        )}
      </div>

      {/* Reader Body */}
      <div className="flex-1 flex overflow-hidden">
        {currentTab ? (
          <PDFViewer
            fileUrl={`/api/v1/documents/${currentTab.id}/export`}
            filename={currentTab.title}
            highlightPage={currentTab.highlightPage}
            highlightExcerpt={currentTab.highlightExcerpt}
            activeTab={readerRightTab}
            onTabChange={setReaderRightTab}
            documentMetadata={currentTab.doc}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-xs text-ink-muted p-8 gap-3">
            <FileText className="w-8 h-8 text-ink-faint" />
            <p className="font-semibold text-ink">No Document Open</p>
            <p className="italic">Select a document from your library or click on a citation chip to view.</p>
          </div>
        )}
      </div>
    </div>
  );
}

