import React, { useState } from 'react';
import {
  ShieldCheck,
  Database,
  HardDrive,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
  FileCode
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { StatusDot } from '../components/common/StatusDot';
import { Modal } from '../components/common/Modal';
import { useSystemStatus, useCurrentWorkspace, usePurgeWorkspace } from '../api/queries';

export function SettingsPage() {
  const { data: statusData } = useSystemStatus();
  const { data: workspaceData } = useCurrentWorkspace();
  const purgeMutation = usePurgeWorkspace();
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);

  const handleExportData = () => {
    window.location.href = '/api/v1/user/export';
  };

  const handleConfirmPurge = async () => {
    await purgeMutation.mutateAsync();
  };

  return (
    <div className="flex-1 overflow-y-auto bg-canvas p-6 max-w-4xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">System & Workspace Settings</h1>
        <p className="text-xs text-ink-muted mt-1 font-serif">
          Inspect backend persistence, FAISS index health, visitor tenant isolation, and manage your data.
        </p>
      </div>

      {/* Relational Database & Vector Store Health */}
      <section className="p-5 rounded-md bg-surface border border-border shadow-xs flex flex-col gap-4">
        <h2 className="text-xs font-semibold text-ink uppercase tracking-wide flex items-center gap-2">
          <Database className="w-4 h-4 text-brand" />
          <span>Storage & Health Telemetry</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3 rounded bg-surface-subtle border border-border flex flex-col gap-1">
            <span className="text-ink-muted text-[10px] uppercase">Relational Database</span>
            <span className="text-ink font-bold text-sm">{statusData?.database_type || 'SQLite 3'}</span>
            <span className="text-status-success text-[10px] mt-0.5">• Active connection</span>
          </div>

          <div className="p-3 rounded bg-surface-subtle border border-border flex flex-col gap-1">
            <span className="text-ink-muted text-[10px] uppercase">FAISS Vectors</span>
            <span className="text-ink font-bold text-sm">{statusData?.faiss_vectors ?? 0}</span>
            <span className="text-ink-muted text-[10px] mt-0.5">Dimension 768 • FlatIP</span>
          </div>

          <div className="p-3 rounded bg-surface-subtle border border-border flex flex-col gap-1">
            <span className="text-ink-muted text-[10px] uppercase">Indexed Chunks</span>
            <span className="text-ink font-bold text-sm">{statusData?.indexed_chunks ?? 0}</span>
            <span className="text-ink-muted text-[10px] mt-0.5">Token chunker</span>
          </div>
        </div>
      </section>

      {/* Workspace Isolation & Security */}
      <section className="p-5 rounded-md bg-surface border border-border shadow-xs flex flex-col gap-4">
        <h2 className="text-xs font-semibold text-ink uppercase tracking-wide flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand" />
          <span>Workspace Isolation & Privacy</span>
        </h2>

        <div className="flex flex-col gap-3 text-xs">
          <div className="p-3 rounded bg-surface-subtle border border-border flex items-center justify-between">
            <div>
              <span className="text-ink-muted block text-[10px] uppercase font-medium">Workspace State</span>
              <span className="text-ink font-semibold">
                {workspaceData ? 'Active Isolated Session' : 'Initializing...'}
              </span>
            </div>
            <span className="text-[11px] text-status-success flex items-center gap-1 font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Isolated</span>
            </span>
          </div>

          <p className="text-ink-muted text-xs leading-relaxed">
            Workspace sessions are isolated using encrypted HTTP-only session cookies and double-submit CSRF headers. Documents, FAISS vector indices, and research sessions are strictly partitioned per workspace.
          </p>
        </div>
      </section>

      {/* Data Management Actions */}
      <section className="p-5 rounded-md bg-surface border border-border shadow-xs flex flex-col gap-4">
        <h2 className="text-xs font-semibold text-ink uppercase tracking-wide">
          Data Portability & Purge
        </h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            size="md"
            icon={Download}
            onClick={handleExportData}
          >
            Export Workspace JSON
          </Button>

          <Button
            variant="danger"
            size="md"
            icon={Trash2}
            onClick={() => setIsPurgeModalOpen(true)}
          >
            Purge All Workspace Data
          </Button>
        </div>
      </section>

      {/* Retrieval Engine & Pipeline Configuration */}
      <section className="p-5 rounded-md bg-surface border border-border shadow-xs flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-ink uppercase tracking-wide flex items-center gap-2">
          <FileCode className="w-4 h-4 text-brand" />
          <span>Retrieval Engine & Pipeline Telemetry</span>
        </h2>
        <p className="text-xs text-ink-muted">
          Active RAG pipeline parameters and live runtime metrics reported by the backend:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-surface-subtle border-b border-border text-ink-muted">
              <tr>
                <th className="py-2 px-3">Component</th>
                <th className="py-2 px-3">Active Configuration</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-[11px]">
              <tr>
                <td className="py-2 px-3 text-ink font-medium">FAISS Vector Store</td>
                <td className="py-2 px-3 text-brand font-bold">{statusData?.faiss_vectors ?? 0} vectors indexed</td>
                <td className="py-2 px-3 text-status-success">Online (IndexIDMap2)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-ink font-medium">Ingested Chunks</td>
                <td className="py-2 px-3 text-brand font-bold">{statusData?.indexed_chunks ?? 0} chunks</td>
                <td className="py-2 px-3 text-status-success">Token Splitter (700 tok)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-ink font-medium">Generation Model</td>
                <td className="py-2 px-3 text-brand font-bold">{statusData?.generation_model || 'gemini-2.5-flash'}</td>
                <td className="py-2 px-3 text-status-success">Google Gemini API</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-ink font-medium">Database Dialect</td>
                <td className="py-2 px-3 text-brand font-bold uppercase">{statusData?.database_type || 'sqlite'}</td>
                <td className="py-2 px-3 text-status-success">SQLAlchemy Dialect-Agnostic</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-ink font-medium">Sufficiency Threshold</td>
                <td className="py-2 px-3 text-brand font-bold">0.650 / 1.000</td>
                <td className="py-2 px-3 text-status-success">Calibrated Evidence Gate</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Purge Modal */}
      <Modal
        isOpen={isPurgeModalOpen}
        onClose={() => setIsPurgeModalOpen(false)}
        title="Purge All Workspace Data"
      >
        <div className="flex flex-col gap-4 text-xs">
          <div className="flex items-start gap-3 p-3 rounded bg-status-error/10 border border-status-error/30 text-status-error">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Irreversible Action</p>
              <p className="mt-1 leading-relaxed">
                This will permanently delete all uploaded files from disk, remove all chunk vectors from the FAISS index, delete all research sessions and messages, and reset your workspace session cookie.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setIsPurgeModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={purgeMutation.isPending}
              onClick={handleConfirmPurge}
            >
              Confirm and Purge Everything
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

