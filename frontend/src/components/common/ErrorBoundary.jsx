import React from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';
import { resetLocalUIView } from '../../utils/storage';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
      showResetConfirm: false,
    };
  }

  static getDerivedStateFromError(error) {
    const errorId = `err_${Math.random().toString(36).substring(2, 10)}`;
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error, errorInfo) {
    const errorId = this.state.errorId || 'err_unknown';
    // Log structured error without sensitive document content
    console.error(`[NexusRAG Error ${errorId}]`, {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
    });
  }

  handleTryAgain = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
      showResetConfirm: false,
    });
  };

  handleResetLocalView = () => {
    resetLocalUIView();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-canvas text-ink flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full p-6 bg-surface border border-border rounded-xl shadow-md flex flex-col gap-5 text-left">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand/10 text-brand flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-ink">Application View Recovery</h1>
                <p className="text-xs text-ink-muted mt-1 font-serif leading-relaxed">
                  An unexpected client-side error occurred while rendering this view. Your indexed documents, collections, and workspace sessions are completely safe.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface-subtle border border-border text-xs flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-ink-muted">
                <span>Diagnostic Reference:</span>
                <span className="font-semibold text-ink">{this.state.errorId}</span>
              </div>
              <p className="text-[11px] text-ink-muted font-serif">
                Details have been recorded in the developer console under this reference ID.
              </p>
            </div>

            {this.state.showResetConfirm ? (
              <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex flex-col gap-3">
                <p className="text-xs text-ink leading-relaxed font-serif">
                  <strong>Reset Local View:</strong> This will reset client display preferences (expanded sidebar state, active filters, and custom sliders) to their defaults. Your documents, vector index, and chat history will not be affected.
                </p>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => this.setState({ showResetConfirm: false })}
                    className="px-3 py-1.5 rounded text-xs text-ink hover:bg-surface border border-border transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={this.handleResetLocalView}
                    className="px-3 py-1.5 rounded text-xs bg-brand text-white font-medium hover:bg-brand/90 transition-colors cursor-pointer"
                  >
                    Confirm & Reload
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-border">
                <button
                  onClick={this.handleTryAgain}
                  className="w-full sm:w-auto flex-1 px-4 py-2 bg-brand text-white text-xs font-medium rounded-lg hover:bg-brand/90 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Try Again
                </button>
                <button
                  onClick={() => this.setState({ showResetConfirm: true })}
                  className="w-full sm:w-auto px-4 py-2 bg-surface text-ink-muted hover:text-ink text-xs font-medium rounded-lg border border-border hover:bg-surface-subtle transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Local View...
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

