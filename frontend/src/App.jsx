import React, { useState, useEffect } from 'react';
import { RailNav, VIEWS } from './components/layout/RailNav';
import { TopBar } from './components/layout/TopBar';
import { ToastProvider } from './components/common/Toast';
import { CommandPalette } from './components/common/CommandPalette';
import { FeedbackModal } from './components/common/FeedbackModal';

import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { KnowledgeBasesPage } from './pages/KnowledgeBasesPage';
import { ResearchDeskPage } from './pages/ResearchDeskPage';
import { DocumentReaderPage } from './pages/DocumentReaderPage';
import { RetrievalInspectorPage } from './pages/RetrievalInspectorPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/' || path === '') return VIEWS.LANDING;
      if (path.includes('knowledge') || path.includes('library')) return VIEWS.LIBRARY;
      if (path.includes('research')) return VIEWS.RESEARCH;
      if (path.includes('reader')) return VIEWS.READER;
      if (path.includes('inspector')) return VIEWS.INSPECTOR;
      if (path.includes('settings')) return VIEWS.SETTINGS;
      if (path.includes('dashboard') || path.includes('app')) return VIEWS.DASHBOARD;
    }
    return VIEWS.DASHBOARD;
  });

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('nexusrag_theme') === 'dark';
  });

  // Global modals
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Cross-page state transfers
  const [pendingQuery, setPendingQuery] = useState('');
  const [pendingScope, setPendingScope] = useState(null);
  const [targetDocument, setTargetDocument] = useState(null);
  const [targetCitation, setTargetCitation] = useState(null);
  const [targetRunId, setTargetRunId] = useState(null);

  // Global Command Palette shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync route with browser history
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathToView = {
        [VIEWS.LANDING]: '/',
        [VIEWS.DASHBOARD]: '/app/dashboard',
        [VIEWS.LIBRARY]: '/app/knowledge',
        [VIEWS.RESEARCH]: '/app/research',
        [VIEWS.READER]: '/app/reader',
        [VIEWS.INSPECTOR]: '/app/inspector',
        [VIEWS.SETTINGS]: '/app/settings',
      };
      const targetPath = pathToView[currentView] || '/app/dashboard';
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ view: currentView }, '', targetPath);
      }
    }
  }, [currentView]);

  // Handle browser back/forward buttons (popstate)
  useEffect(() => {
    const handlePopState = (e) => {
      if (e.state?.view) {
        setCurrentView(e.state.view);
      } else if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path === '/' || path === '') setCurrentView(VIEWS.LANDING);
        else if (path.includes('knowledge') || path.includes('library')) setCurrentView(VIEWS.LIBRARY);
        else if (path.includes('research')) setCurrentView(VIEWS.RESEARCH);
        else if (path.includes('reader')) setCurrentView(VIEWS.READER);
        else if (path.includes('inspector')) setCurrentView(VIEWS.INSPECTOR);
        else if (path.includes('settings')) setCurrentView(VIEWS.SETTINGS);
        else setCurrentView(VIEWS.DASHBOARD);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Apply dark mode class to root HTML
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('nexusrag_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('nexusrag_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Handlers for cross-page interactions
  const handleStartQuery = (query, scope) => {
    setPendingQuery(query);
    setPendingScope(scope);
    setCurrentView(VIEWS.RESEARCH);
  };

  const handleOpenDocument = (doc) => {
    setTargetDocument(doc);
    setTargetCitation(null);
    setCurrentView(VIEWS.READER);
  };

  const handleOpenCitation = (citation) => {
    setTargetCitation(citation);
    setTargetDocument({ id: citation.document_id, original_filename: citation.filename });
    setCurrentView(VIEWS.READER);
  };

  const handleNavigateToInspector = (runId = null) => {
    setTargetRunId(runId);
    setCurrentView(VIEWS.INSPECTOR);
  };

  // View Title and Subtitle Mapping
  const viewMeta = {
    [VIEWS.LANDING]: { title: 'Overview', subtitle: 'Verifiable Document Research Workspace' },
    [VIEWS.DASHBOARD]: { title: 'Research Workspace', subtitle: 'Live overview and grounded composer across collections' },
    [VIEWS.LIBRARY]: { title: 'Knowledge Bases', subtitle: 'Document collections and real-time ingestion' },
    [VIEWS.RESEARCH]: { title: 'Research Desk', subtitle: '3-Panel grounded synthesis and evidence' },
    [VIEWS.READER]: { title: 'Document Reader', subtitle: 'Multi-tab PDF viewer with citation highlights' },
    [VIEWS.INSPECTOR]: { title: 'Retrieval Inspector', subtitle: 'LangGraph 9-Node DAG execution trace' },
    [VIEWS.SETTINGS]: { title: 'System Settings', subtitle: 'AI parameters, database architecture, and session isolation' },
  };

  const currentMeta = viewMeta[currentView] || { title: 'NexusRAG', subtitle: '' };

  // If user is on the Public Landing Page, render the dedicated Public Website Layout
  if (currentView === VIEWS.LANDING) {
    return (
      <ToastProvider>
        <div className="min-h-screen w-screen bg-canvas text-ink font-sans flex flex-col">
          <LandingPage onNavigate={setCurrentView} />
        </div>
      </ToastProvider>
    );
  }

  // Otherwise render the Authenticated Application Shell
  return (
    <ToastProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-canvas text-ink font-sans">
        {/* 1. Left Expandable Rail Navigation */}
        <RailNav
          currentView={currentView}
          onViewChange={setCurrentView}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />

        {/* 2. Main Workspace Column */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Top Header Bar */}
          <TopBar
            title={currentMeta.title}
            subtitle={currentMeta.subtitle}
            onSearchClick={() => setIsCommandPaletteOpen(true)}
            onFeedbackClick={() => setIsFeedbackModalOpen(true)}
          />

          {/* View Surface */}
          <div className="flex-1 flex overflow-hidden">
            {currentView === VIEWS.DASHBOARD && (
              <DashboardPage
                onNavigate={setCurrentView}
                onStartQuery={handleStartQuery}
                onOpenDocument={handleOpenDocument}
              />
            )}

            {currentView === VIEWS.LIBRARY && (
              <KnowledgeBasesPage onOpenDocument={handleOpenDocument} />
            )}

            {currentView === VIEWS.RESEARCH && (
              <ResearchDeskPage
                initialQuery={pendingQuery}
                initialScope={pendingScope}
                onOpenDocumentReader={handleOpenCitation}
                onNavigateToInspector={handleNavigateToInspector}
              />
            )}

            {currentView === VIEWS.READER && (
              <DocumentReaderPage
                initialDocument={targetDocument}
                initialCitation={targetCitation}
              />
            )}

            {currentView === VIEWS.INSPECTOR && (
              <RetrievalInspectorPage initialRunId={targetRunId} />
            )}

            {currentView === VIEWS.SETTINGS && (
              <SettingsPage />
            )}
          </div>
        </div>

        {/* Global Command Palette */}
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onNavigate={setCurrentView}
          onOpenDocument={handleOpenDocument}
        />

        {/* Global Feedback Modal */}
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
        />
      </div>
    </ToastProvider>
  );
}

export default App;
