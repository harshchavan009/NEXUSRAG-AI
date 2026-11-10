import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { getCsrfToken } from '../../api/client';
import { Button } from '../common/Button';
import clsx from 'clsx';

export function UploadTray({ collections = [], defaultCollectionId = null, onUploadComplete }) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState(defaultCollectionId || '');
  const [filesQueue, setFilesQueue] = useState([]);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

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
    formData.append('file', item.file);
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
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-surface border border-border rounded-md p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">Upload Documents</h3>
        {collections.length > 0 && (
          <select
            value={selectedCollectionId}
            onChange={(e) => setSelectedCollectionId(e.target.value)}
            className="text-xs bg-surface-subtle border border-border rounded px-2.5 py-1 text-ink focus:outline-none focus:border-brand"
          >
            <option value="">No Collection (Root)</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Drag & Drop Target Zone */}
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
          'border border-dashed rounded p-6 text-center cursor-pointer transition-colors duration-150',
          dragOver
            ? 'border-brand bg-brand/5'
            : 'border-border hover:border-border-strong hover:bg-surface-subtle'
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
        <Upload className="w-6 h-6 mx-auto mb-2 text-brand" />
        <p className="text-xs font-medium text-ink">
          Drag and drop files here, or <span className="text-brand underline">browse</span>
        </p>
        <p className="text-[11px] text-ink-muted mt-1">
          PDF, Markdown, or TXT up to 25MB (max 60 pages for PDF)
        </p>
      </div>

      {/* Per-File Progress Queue */}
      {filesQueue.length > 0 && (
        <div className="flex flex-col gap-2 mt-1">
          {filesQueue.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between text-xs p-2.5 rounded bg-surface-subtle border border-border"
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0 mr-3">
                <FileText className="w-4 h-4 text-ink-faint flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-ink truncate">{item.name}</span>
                    <span className="text-[11px] font-mono text-ink-muted ml-2">
                      {item.status === 'uploading'
                        ? `${item.progress}%`
                        : formatBytes(item.size)}
                    </span>
                  </div>

                  {/* Byte Progress Bar */}
                  {item.status === 'uploading' && (
                    <div className="w-full bg-border rounded-full h-1 overflow-hidden">
                      <div
                        className="bg-brand h-1 transition-all duration-150"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}

                  {item.status === 'error' && (
                    <p className="text-[11px] text-status-error">{item.error}</p>
                  )}
                  {item.status === 'aborted' && (
                    <p className="text-[11px] text-ink-muted">Upload cancelled</p>
                  )}
                </div>
              </div>

              {/* Status or Cancel Action */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {item.status === 'uploading' && (
                  <button
                    onClick={() => cancelUpload(item.id)}
                    className="p-1 text-ink-muted hover:text-status-error rounded hover:bg-surface transition-colors"
                    title="Cancel upload"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                {item.status === 'completed' && (
                  <CheckCircle className="w-4 h-4 text-status-success" />
                )}
                {item.status === 'error' && (
                  <AlertCircle className="w-4 h-4 text-status-error" />
                )}
                {['completed', 'error', 'aborted'].includes(item.status) && (
                  <button
                    onClick={() => removeQueueItem(item.id)}
                    className="p-1 text-ink-faint hover:text-ink rounded hover:bg-surface transition-colors"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

