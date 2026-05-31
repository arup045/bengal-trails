import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { reportError } from '../utils/errorReporter';

interface Props {
  children: ReactNode;
  /** When true, renders a compact inline fallback instead of a full-page one. */
  inline?: boolean;
  /** When true, renders nothing on error (the section just disappears). Still
   *  reports the error server-side. Use for non-critical data carousels. */
  silent?: boolean;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log full detail server-side only; never surface error.message to users
    // (could leak stack traces, file paths, or internal identifiers).
    reportError(error, { componentStack: errorInfo?.componentStack });
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false });
    window.location.hash = '#/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.silent) {
        return null;
      }
      if (this.props.inline) {
        return (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <AlertTriangle className="w-10 h-10 text-red-400 mb-3" />
            <p className="text-gray-700 font-medium mb-1">Something went wrong</p>
            <p className="text-gray-500 text-sm mb-4">This section failed to load.</p>
            <button
              onClick={this.handleReset}
              className="text-purple-600 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        );
      }

      return (
        <div className="min-h-[60vh] bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>

            <h1 className="text-3xl mb-3 text-gray-900">Oops! Something went wrong</h1>

            <p className="text-gray-600 mb-6">
              We're sorry — something unexpected happened. Your data is safe. Please try again or go back home.
            </p>

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 404 Not Found Page
export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="text-8xl mb-4">🗺️</div>
        
        <h1 className="text-4xl mb-3 text-gray-900">404</h1>
        <h2 className="text-2xl mb-3 text-gray-700">Destination Not Found</h2>
        
        <p className="text-gray-600 mb-8">
          Looks like this destination doesn't exist. Let's get you back on track!
        </p>

        <div className="flex gap-3">
          <a
            href="/"
            className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </a>
          
          <a
            href="/explore"
            className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Explore Destinations
          </a>
        </div>
      </div>
    </div>
  );
}

// Offline Error Page
export function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="text-8xl mb-4">📡</div>
        
        <h1 className="text-3xl mb-3 text-gray-900">You're Offline</h1>
        
        <p className="text-gray-600 mb-8">
          Looks like you've lost your internet connection. Please check your network and try again.
        </p>

        <button
          onClick={handleRetry}
          className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>
      </div>
    </div>
  );
}
