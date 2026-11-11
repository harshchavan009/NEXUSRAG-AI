import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
  Share2
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { getCsrfToken } from '../../api/client';
import { useSystemStatus } from '../../api/queries';
import { Button } from '../common/Button';
import clsx from 'clsx';

export function UploadTray({ collections = [], defaultCollectionId = null, onUploadComplete }) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState(defaultCollectionId || '');
  const [filesQueue, setFilesQueue] = useState([]);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();
  const { data: statusData } = useSystemStatus();
  const maxMb = statusData?.max_file_size_mb || 25;

  const handleFiles = (incomingFiles) => {
    const newItems = Array.from(incomingFiles).map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'pending', // 'pending', 'uploading', 'completed', 'error', 'aborted'
      error: null,
      xhr: null,
    }));

    setFilesQueue((prev) => [...prev, ...newItems]);
    newItems.forEach((item) => uploadFileItem(item));
  };

  const uploadFileItem = async (item) => {
    const csrfToken = await getCsrfToken();
    const formData = new FormData();
    formData.append('files', item.file);
    if (selectedCollectionId) {
      formData.append('collection_id', selectedCollectionId);
    }

    const xhr = new XMLHttpRequest();
    item.xhr = xhr;

    // Track real byte progress
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        setFilesQueue((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, progress: percent, status: 'uploading' } : f))
        );
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setFilesQueue((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, progress: 100, status: 'completed' } : f))
        );
        queryClient.invalidateQueries({ queryKey: ['documents'] });
        queryClient.invalidateQueries({ queryKey: ['system-status'] });
        if (onUploadComplete) onUploadComplete();
      } else {
        let errMsg = `Upload failed (${xhr.status})`;
        try {
          const res = JSON.parse(xhr.responseText);
          errMsg = res?.error?.message || errMsg;
        } catch (_) {}
        setFilesQueue((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, status: 'error', error: errMsg } : f))
        );
      }
    };

    xhr.onerror = () => {
      setFilesQueue((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: 'error', error: 'Network error occurred during upload' } : f))
      );
    };

    xhr.onabort = () => {
      setFilesQueue((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: 'aborted' } : f))
      );
    };

    xhr.open('POST', '/api/v1/documents/upload');
    xhr.withCredentials = true;
    if (csrfToken) {
      xhr.setRequestHeader('X-CSRF-Token', csrfToken);
    }
    xhr.send(formData);
  };

  const cancelUpload = (itemId) => {
    setFilesQueue((prev) =>
      prev.map((f) => {
        if (f.id === itemId && f.xhr && f.status === 'uploading') {
          f.xhr.abort();
          return { ...f, status: 'aborted' };
        }
        return f;
      })
    );
  };

  const removeQueueItem = (itemId) => {
    setFilesQueue((prev) => prev.filter((f) => f.id !== itemId));
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} kb`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileBadge = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'pdf') return { label: 'PDF', color: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950 dark:text-red-400' };
    if (ext === 'txt') return { label: 'TXT', color: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950 dark:text-amber-400' };
    return { label: 'MD', color: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950 dark:text-blue-400' };
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Target Collection Switcher */}
      {collections.length > 0 && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-ink-muted font-medium">Target Collection:</span>
          <select
            value={selectedCollectionId}
            onChange={(e) => setSelectedCollectionId(e.target.value)}
            className="text-xs bg-surface-subtle border border-border rounded-md px-2.5 py-1 text-ink focus:outline-none focus:border-brand font-medium"
          >
            <option value="">Root (All Documents)</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Drag & Drop Target Zone (Reference 1 Style) */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.length) {
            handleFiles(e.dataTransfer.files);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={clsx(
          'border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center gap-3',
          dragOver
            ? 'border-brand bg-brand/5'
            : 'border-border-strong hover:border-brand hover:bg-surface-subtle bg-surface'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.txt,.md,.markdown"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) {
              handleFiles(e.target.files);
            }
          }}
        />
        <div className="w-12 h-12 rounded-full bg-surface-subtle border border-border flex items-center justify-center text-ink-muted">
          <UploadCloud className="w-6 h-6 text-brand" />
        </div>
        <div>
          <p className="text-xs font-semibold text-ink">
            Drag And Drop Your Files Here
          </p>
          <p className="text-[11px] text-ink-muted mt-0.5">
            PDF, Markdown, or TXT up to {maxMb}MB
          </p>
        </div>
        <button
          type="button"
          className="px-4 py-1.5 rounded-lg bg-[#20272F] text-white hover:bg-[#2C3642] text-xs font-medium transition-colors shadow-xs"
        >
          Upload file
        </button>

        <p className="text-[10px] text-ink-faint text-center">
          Files are processed in an isolated visitor session. By uploading, you agree to our{' '}
          <a href="/terms" target="_blank" rel="noreferrer" className="underline hover:text-ink">Terms</a>{' '}
          and{' '}
          <a href="/privacy" target="_blank" rel="noreferrer" className="underline hover:text-ink">Privacy Policy</a>.
        </p>
      </div>

      {/* Active Uploads / Processing Queue (Reference 1 Style) */}
      {filesQueue.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider px-1">
            Active Uploads ({filesQueue.filter(f => f.status === 'uploading').length})
          </span>

          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
            {filesQueue.map((item) => {
              const badge = getFileBadge(item.name);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-xs p-3 rounded-xl bg-surface border border-border shadow-2xs"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0 mr-3">
                    <span className={clsx('px-1.5 py-0.5 rounded text-[10px] font-bold border font-mono', badge.color)}>
                      {badge.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-medium text-ink truncate text-xs">{item.name}</span>
                        <span className="text-[10px] font-mono text-ink-muted ml-2">
                          {item.status === 'uploading' ? `${item.progress}%` : formatBytes(item.size)}
                        </span>
                      </div>

                      {/* Byte Progress Bar */}
                      {item.status === 'uploading' && (
                        <div className="w-full bg-surface-subtle rounded-full h-1.5 overflow-hidden border border-border/40">
                          <div
                            className="bg-[#20272F] dark:bg-brand h-full transition-all duration-150 rounded-full"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      )}

                      {item.status === 'completed' && (
                        <span className="text-[10px] text-status-success font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Indexed into FAISS
                        </span>
                      )}

                      {item.status === 'error' && (
                        <span className="text-[10px] text-status-error truncate block" title={item.error}>
                          {item.error}
                        </span>
                      )}

                      {item.status === 'aborted' && (
                        <span className="text-[10px] text-ink-muted italic">Cancelled</span>
                      )}
                    </div>
                  </div>

                  {/* Cancel / Dismiss Button */}
                  <div>
                    {item.status === 'uploading' ? (
                      <button
                        onClick={() => cancelUpload(item.id)}
                        className="p-1 rounded-full text-ink-muted hover:text-ink hover:bg-surface-subtle transition-colors"
                        title="Cancel upload"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => removeQueueItem(item.id)}
                        className="p-1 rounded-full text-ink-faint hover:text-ink transition-colors"
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
