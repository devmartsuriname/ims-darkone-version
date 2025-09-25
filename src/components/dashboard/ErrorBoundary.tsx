import React from 'react';
import { Alert, Button } from 'react-bootstrap';
import IconifyIcon from '@/components/wrapper/IconifyIcon';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard Error Boundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} retry={this.handleRetry} />;
      }

      return (
        <Alert variant="danger" className="m-3">
          <Alert.Heading className="d-flex align-items-center gap-2">
            <IconifyIcon icon="solar:danger-triangle-bold" />
            Dashboard Error
          </Alert.Heading>
          <p className="mb-3">
            Something went wrong while loading this dashboard component. This error has been logged for investigation.
          </p>
          <div className="d-flex gap-2">
            <Button variant="outline-danger" size="sm" onClick={this.handleRetry}>
              <IconifyIcon icon="solar:refresh-bold" className="me-1" />
              Try Again
            </Button>
            <Button variant="outline-secondary" size="sm" onClick={() => window.location.reload()}>
              <IconifyIcon icon="solar:reload-bold" className="me-1" />
              Reload Page
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-3">
              <summary className="text-muted">Error Details (Development Only)</summary>
              <pre className="mt-2 p-2 bg-light border rounded small">
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </Alert>
      );
    }

    return this.props.children;
  }
}

export const DashboardErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({ retry }) => (
  <div className="card border-danger">
    <div className="card-body text-center">
      <IconifyIcon icon="solar:danger-triangle-bold" className="text-danger fs-1 mb-3" />
      <h5 className="text-danger">Component Error</h5>
      <p className="text-muted mb-3">This dashboard component encountered an error and couldn't load.</p>
      <Button variant="outline-danger" size="sm" onClick={retry}>
        <IconifyIcon icon="solar:refresh-bold" className="me-1" />
        Retry
      </Button>
    </div>
  </div>
);