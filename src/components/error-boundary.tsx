'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className='flex min-h-screen items-center justify-center'>
            <div className='text-center'>
              <h2 className='text-2xl font-bold'>Something went wrong</h2>
              <p className='mt-2 text-gray-600'>
                Please refresh the page or try again later.
              </p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className='mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
              >
                Try again
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
