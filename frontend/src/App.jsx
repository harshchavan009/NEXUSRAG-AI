import React, { useState, useEffect } from 'react';
import { RailNav, VIEWS } from './components/layout/RailNav';
import { TopBar } from './components/layout/TopBar';
import { StatusBar } from './components/layout/StatusBar';

import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { KnowledgeBasesPage } from './pages/KnowledgeBasesPage';
import { ResearchDeskPage } from './pages/ResearchDeskPage';
import { DocumentReaderPage } from './pages/DocumentReaderPage';
import { RetrievalInspectorPage } from './pages/RetrievalInspectorPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  const [currentView, setCurrentView] = useState(VIEWS.DASHBOARD);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('nexusrag_theme') === 'dark';
  });

  // Cross-page state transfers
  const [pendingQuery, setPendingQuery] = useState('');
  const [pendingScope, setPendingScope] = useState(null);
  const [targetDocument, setTargetDocument] = useState(null);
  const [targetCitation, setTargetCitation] = useState(null);
  const [targetRunId, setTargetRunId] = useState(null);

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
    [VIEWS.DASHBOARD]: { title: 'Ask-First Desk', subtitle: 'Unified research composer across collections' },
    [VIEWS.LIBRARY]: { title: 'Knowledge Bases', subtitle: 'Document library and real-time ingestion' },
    [VIEWS.RESEARCH]: { title: 'Research Desk', subtitle: '3-Panel grounded synthesis and evidence' },
    [VIEWS.READER]: { title: 'Document Reader', subtitle: 'Multi-tab PDF viewer with citation highlights' },
    [VIEWS.INSPECTOR]: { title: 'Retrieval Inspector', subtitle: 'LangGraph 9-Node DAG execution trace' },
    [VIEWS.SETTINGS]: { title: 'System Settings', subtitle: 'FAISS index metrics and visitor tenant isolation' },
  };

  const currentMeta = viewMeta[currentView] || { title: 'NexusRAG', subtitle: '' };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas text-ink font-sans">
      {/* 1. Left Icon Rail (Reference 1 & 4) */}
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
          onSearchClick={() => setCurrentView(VIEWS.LIBRARY)}
        />

        {/* View Surface */}
        <div className="flex-1 flex overflow-hidden">
          {currentView === VIEWS.LANDING && (
            <LandingPage onNavigate={setCurrentView} />
          )}

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

        {/* Persistent Bottom Status Bar (Zero Static Data Rule) */}
        <StatusBar />
      </div>
    </div>
  );
}

export default App;

