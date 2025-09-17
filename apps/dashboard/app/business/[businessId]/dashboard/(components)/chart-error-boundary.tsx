"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

interface ErrorInfo {
  componentStack: string;
}

export class ChartErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Chart Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="w-full h-80 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Chart Error
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Terjadi kesalahan saat memuat chart
              </p>
              <button
                onClick={() => this.setState({ hasError: false, error: undefined })}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
