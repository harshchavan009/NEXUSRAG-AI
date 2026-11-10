import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('NexusRAG Caught UI Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F6F2] text-[#18191B] flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md p-6 bg-white border border-[#E3E1DA] rounded-md shadow-sm flex flex-col gap-4">
            <h1 className="text-lg font-semibold text-[#B84A28]">Workspace Initialization Notice</h1>
            <p className="text-xs text-[#6E6D68] leading-relaxed">
              An unexpected render exception occurred while restoring the workspace session:
            </p>
            <pre className="text-[11px] font-mono bg-[#F7F6F2] p-3 rounded text-left overflow-x-auto text-[#B84A28]">
              {this.state.error?.message || 'Unknown error'}
            </pre>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="px-4 py-2 bg-[#B84A28] text-white text-xs font-medium rounded hover:opacity-90 transition-opacity"
            >
              Reset Session & Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5000,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
