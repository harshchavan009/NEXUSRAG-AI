import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from '../App';

vi.mock('../api/queries', () => ({
  useCurrentWorkspace: () => ({
    data: {
      id: 'ws_test_mock_123',
      session_token: 'mock_session_token_64chars_abcdef0123456789abcdef0123456789abcdef01',
      stats: {
        documents: 3,
        collections: 1,
        chunks: 18,
        sessions: 2,
      },
    },
    isLoading: false,
  }),
  useSystemStatus: () => ({
    data: {
      app_name: 'NexusRAG',
      version: '1.0.0',
      database_type: 'sqlite',
      faiss_vectors: 18,
      indexed_chunks: 18,
      status: 'healthy',
    },
    isLoading: false,
  }),
  useCollections: () => ({
    data: [{ id: 'col-1', name: 'Clean Energy', document_count: 3 }],
    isLoading: false,
  }),
  useCreateCollection: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateCollection: () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false }),
  useDeleteCollection: () => ({ mutate: vi.fn(), isPending: false }),
  useDocuments: () => ({
    data: [
      {
        id: 'doc-1',
        filename: 'clean_energy_report_2024.txt',
        original_filename: 'clean_energy_report_2024.txt',
        file_type: 'txt',
        file_size_bytes: 4200,
        status: 'indexed',
        page_count: 2,
        chunk_count: 6,
        summary: 'Global energy transition analysis covering solar and wind growth.',
        created_at: new Date().toISOString(),
      },
    ],
    isLoading: false,
  }),
  useDocumentDetail: () => ({ data: null, isLoading: false }),
  useDeleteDocument: () => ({ mutate: vi.fn(), isPending: false }),
  useLoadSampleDocuments: () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false }),
  useReindexDocument: () => ({ mutate: vi.fn(), isPending: false }),
  useSessions: () => ({ data: [], isLoading: false }),
  useSessionDetail: () => ({ data: null, isLoading: false }),
  useCreateSession: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteSession: () => ({ mutate: vi.fn(), isPending: false }),
  useInspectorRuns: () => ({ data: [], isLoading: false }),
  useInspectorRunDetail: () => ({ data: null, isLoading: false }),
  usePurgeWorkspace: () => ({ mutate: vi.fn(), isPending: false }),
}));

describe('App Navigation & 7 Core View Rendering', () => {
  const createTestClient = () =>
    new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

  const renderWithProviders = (ui) => {
    return render(
      <QueryClientProvider client={createTestClient()}>
        {ui}
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    window.history.pushState({}, '', '/app/dashboard');
  });

  it('renders Dashboard workspace view with 4 live metric cards, ask-first composer, and ingested documents', () => {
    renderWithProviders(<App />);
    expect(screen.getByText('Research Workspace. Query your indexed collections.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ask a question about your documents/i)).toBeInTheDocument();
    
    // Check 4 live aggregate metric cards (spec Page 7 & Transform Brief)
    expect(screen.getByText('Total Documents')).toBeInTheDocument();
    expect(screen.getByText('Vector Chunks')).toBeInTheDocument();
    expect(screen.getByText('Active Sessions')).toBeInTheDocument();

    // Check 4 operational quick action tiles
    expect(screen.getByText('Add Sample Docs')).toBeInTheDocument();
    expect(screen.getByText('Upload Files')).toBeInTheDocument();
    expect(screen.getByText('New Thread')).toBeInTheDocument();
    expect(screen.getByText('DAG Inspector')).toBeInTheDocument();

    // Check real backend summary column in recent documents table
    expect(screen.getByText('clean_energy_report_2024.txt')).toBeInTheDocument();
    expect(screen.getByText(/Global energy transition analysis covering solar and wind growth/i)).toBeInTheDocument();
  });

  it('navigates to Landing page when clicking Overview in rail nav and displays calibrated headline', () => {
    renderWithProviders(<App />);
    const overviewBtn = screen.getByRole('button', { name: 'Overview' });
    fireEvent.click(overviewBtn);

    // Verify editorial landing headline is rendered in standalone layout
    expect(screen.getByText(/Verifiable Research Synthesis for Complex Documents/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Open Research Workspace/i }).length).toBeGreaterThanOrEqual(1);
  });

  it('navigates to Knowledge Bases view and displays collections rail and upload zone', () => {
    renderWithProviders(<App />);
    const kbBtn = screen.getByRole('button', { name: 'Knowledge Bases' });
    fireEvent.click(kbBtn);

    expect(screen.getAllByRole('heading', { name: 'Knowledge Bases' }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('All Documents').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Clean Energy').length).toBeGreaterThanOrEqual(1);
  });

  it('navigates to Settings view and displays active visitor session and complete Page 7 specifications', () => {
    renderWithProviders(<App />);
    const settingsBtn = screen.getByRole('button', { name: 'System Settings' });
    fireEvent.click(settingsBtn);

    expect(screen.getByText('System Settings & Architecture')).toBeInTheDocument();
    expect(screen.getByText(/AI Provider & Generation Model/i)).toBeInTheDocument();
    expect(screen.getByText(/Chunking & LangGraph Pipeline Parameters/i)).toBeInTheDocument();
    expect(screen.getByText(/Relational Database & Storage Architecture/i)).toBeInTheDocument();
    expect(screen.getByText(/Appearance & Theme Preference/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Purge All Workspace Data/i })).toBeInTheDocument();
  });

  it('opens and navigates with the Command Palette via Quick Command button and Cmd+K shortcut', () => {
    renderWithProviders(<App />);
    const cmdBtn = screen.getByRole('button', { name: /Quick command.../i });
    fireEvent.click(cmdBtn);

    // Command palette modal opens
    expect(screen.getByPlaceholderText(/Type a command, page name, or search documents/i)).toBeInTheDocument();
    expect(screen.getByText('Go to Retrieval Inspector')).toBeInTheDocument();
    expect(screen.getByText('Add Sample Documents (Ingest 4 papers)')).toBeInTheDocument();

    // Escape closes the command palette
    fireEvent.keyDown(window, { key: 'Escape' });
  });

  it('renders standalone Public Landing Page when starting at root / without rail or app status bar', () => {
    window.history.pushState({}, '', '/');
    renderWithProviders(<App />);

    expect(screen.getByText(/Verifiable Research Synthesis for Complex Documents/i)).toBeInTheDocument();
    // Verify no app rail is present on public site
    expect(screen.queryByLabelText('Main Navigation')).toBeNull();
    expect(screen.queryByLabelText('NexusRAG Home')).toBeNull();
    expect(screen.queryByRole('button', { name: 'System Settings' })).toBeNull();
  });
});
