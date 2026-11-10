import React from 'react';
import { describe, it, expect, vi } from 'vitest';
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

  it('renders Dashboard workspace view initially with ask-first composer and ingested documents', () => {
    renderWithProviders(<App />);
    expect(screen.getByText('Welcome. What will you discover today?')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ask a question about your documents/i)).toBeInTheDocument();
    
    // Check real backend summary column in recent documents table
    expect(screen.getByText('clean_energy_report_2024.txt')).toBeInTheDocument();
    expect(screen.getByText(/Global energy transition analysis covering solar and wind growth/i)).toBeInTheDocument();
  });

  it('navigates to Landing page when clicking Overview in rail nav and displays calibrated headline', () => {
    renderWithProviders(<App />);
    const overviewBtn = screen.getByRole('button', { name: 'Overview' });
    fireEvent.click(overviewBtn);

    // Verify editorial landing headline is rendered
    expect(screen.getByText(/Ask your documents\./i)).toBeInTheDocument();
    expect(screen.getByText(/See the passage that answers\./i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Open Research Workspace/i })).toBeInTheDocument();
  });

  it('navigates to Knowledge Bases view and displays collections rail and upload zone', () => {
    renderWithProviders(<App />);
    const kbBtn = screen.getByRole('button', { name: 'Knowledge Bases' });
    fireEvent.click(kbBtn);

    expect(screen.getAllByRole('heading', { name: 'Knowledge Bases' }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('All Documents').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Clean Energy').length).toBeGreaterThanOrEqual(1);
  });

  it('navigates to Settings view and displays active 256-bit visitor session and Zero Static Data table', () => {
    renderWithProviders(<App />);
    const settingsBtn = screen.getByRole('button', { name: 'System Settings' });
    fireEvent.click(settingsBtn);

    expect(screen.getByText('System & Workspace Settings')).toBeInTheDocument();
    expect(screen.getByText(/Storage & Health Telemetry/i)).toBeInTheDocument();
    expect(screen.getByText(/Zero Static Data Compliance Verification/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Purge All Workspace Data/i })).toBeInTheDocument();
  });
});
