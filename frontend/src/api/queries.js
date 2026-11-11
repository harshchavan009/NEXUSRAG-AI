import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './client';

// --- System & Workspace ---
export function useSystemStatus() {
  return useQuery({
    queryKey: ['system-status'],
    queryFn: () => apiRequest('/api/v1/system/status'),
    refetchInterval: 30000,
  });
}

export function useCurrentWorkspace() {
  return useQuery({
    queryKey: ['current-workspace'],
    queryFn: () => apiRequest('/api/v1/workspaces/current'),
  });
}

// --- Collections ---
export function useCollections() {
  return useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const res = await apiRequest('/api/v1/collections');
      return Array.isArray(res) ? res : (res?.collections || []);
    },
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiRequest('/api/v1/collections', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (collectionId) => apiRequest(`/api/v1/collections/${collectionId}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useUpdateCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name, description }) => apiRequest(`/api/v1/collections/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, description }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

// --- Documents ---
export function useDocuments(collectionId = null) {
  return useQuery({
    queryKey: ['documents', collectionId],
    queryFn: async () => {
      const url = collectionId
        ? `/api/v1/documents?collection_id=${encodeURIComponent(collectionId)}`
        : '/api/v1/documents';
      const res = await apiRequest(url);
      return Array.isArray(res) ? res : (res?.documents || []);
    },
    refetchInterval: 5000, // Refresh status while indexing
  });
}

export function useDocumentDetail(documentId) {
  return useQuery({
    queryKey: ['document', documentId],
    queryFn: () => apiRequest(`/api/v1/documents/${documentId}`),
    enabled: !!documentId,
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId) => apiRequest(`/api/v1/documents/${documentId}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['system-status'] });
    },
  });
}

export function useLoadSampleDocuments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest('/api/v1/documents/sample', {
      method: 'POST',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['system-status'] });
      queryClient.invalidateQueries({ queryKey: ['current-workspace'] });
    },
  });
}

export function useReindexDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId) => apiRequest(`/api/v1/documents/${documentId}/reindex`, {
      method: 'POST',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

// --- Sessions & Chat ---
export function useSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const res = await apiRequest('/api/v1/sessions');
      return Array.isArray(res) ? res : (res?.sessions || []);
    },
  });
}

export function useSessionDetail(sessionId) {
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => apiRequest(`/api/v1/sessions/${sessionId}`),
    enabled: !!sessionId,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (title = 'New Research Session') => apiRequest('/api/v1/sessions', {
      method: 'POST',
      body: JSON.stringify({ title }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId) => apiRequest(`/api/v1/sessions/${sessionId}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

// --- Inspector Runs ---
export function useInspectorRuns() {
  return useQuery({
    queryKey: ['inspector-runs'],
    queryFn: async () => {
      const res = await apiRequest('/api/v1/inspector/runs');
      return Array.isArray(res) ? res : (res?.runs || []);
    },
  });
}

export function useInspectorRunDetail(runId) {
  return useQuery({
    queryKey: ['inspector-run', runId],
    queryFn: () => apiRequest(`/api/v1/inspector/runs/${runId}`),
    enabled: !!runId,
  });
}

// --- Purge Workspace ---
export function usePurgeWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest('/api/v1/user/purge', {
      method: 'POST',
    }),
    onSuccess: () => {
      queryClient.clear();
      window.location.reload();
    },
  });
}

