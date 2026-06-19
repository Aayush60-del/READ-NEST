import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0f1419] flex items-center justify-center p-6 text-white font-sans">
          <div className="max-w-md w-full bg-[#161d27] rounded-2xl p-8 border border-white/10 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="font-serif text-3xl font-bold mb-4">Something went wrong</h1>
            <p className="text-white/60 mb-8 text-sm">
              We encountered an unexpected error. Our team has been notified. Please try refreshing the page or returning to the dashboard.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-[#c97b6b] text-black font-bold tracking-widest uppercase text-xs rounded-xl hover:bg-[#b8695c] transition-colors"
              >
                Refresh Page
              </button>
              <a 
                href="/overview"
                className="w-full py-3 bg-white/5 text-white font-bold tracking-widest uppercase text-xs rounded-xl hover:bg-white/10 transition-colors inline-block"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;

