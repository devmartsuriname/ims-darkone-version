import React, { Suspense, memo } from 'react';
import { Row, Col } from 'react-bootstrap';
import { ErrorBoundary, DashboardErrorFallback } from './ErrorBoundary';
import { LoadingSpinner, CardSkeleton } from '@/components/ui/LoadingStates';
import PageTitle from '@/components/PageTitle';
import { RefreshButton } from '@/components/ui/RefreshButton';

interface DashboardLayoutProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  lastUpdated?: Date;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  autoRefreshInterval?: number;
}

const DashboardSuspenseFallback = memo(() => (
  <Row className="g-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <Col xxl={2} xl={3} lg={4} md={6} sm={6} xs={12} key={index}>
        <CardSkeleton />
      </Col>
    ))}
  </Row>
));

DashboardSuspenseFallback.displayName = 'DashboardSuspenseFallback';

export const DashboardLayout: React.FC<DashboardLayoutProps> = memo(({
  title = "Dashboard",
  subtitle = "IMS",
  children,
  actions,
  lastUpdated,
  onRefresh,
  isRefreshing = false,
  autoRefreshInterval
}) => {
  return (
    <div className="dashboard-layout">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-column flex-md-row gap-3">
        <PageTitle subName={subtitle} title={title} />
        <div className="d-flex align-items-center gap-2">
          {actions}
          {onRefresh && (
            <RefreshButton 
              onRefresh={onRefresh}
              isLoading={isRefreshing}
              lastUpdated={lastUpdated}
              autoRefreshInterval={autoRefreshInterval}
            />
          )}
        </div>
      </div>

      {/* Content */}
      <ErrorBoundary fallback={DashboardErrorFallback}>
        <Suspense fallback={<DashboardSuspenseFallback />}>
          {children}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
});

DashboardLayout.displayName = 'DashboardLayout';

interface DashboardSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const DashboardSection: React.FC<DashboardSectionProps> = memo(({
  title,
  children,
  className = '',
  loading = false,
  error = null,
  onRetry
}) => {
  if (loading) {
    return (
      <div className={`dashboard-section ${className}`}>
        {title && <h5 className="mb-3">{title}</h5>}
        <div className="text-center py-5">
          <LoadingSpinner text="Loading section..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`dashboard-section ${className}`}>
        {title && <h5 className="mb-3">{title}</h5>}
        <div className="alert alert-warning">
          <p className="mb-2">Failed to load this section: {error}</p>
          {onRetry && (
            <button className="btn btn-outline-warning btn-sm" onClick={onRetry}>
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={DashboardErrorFallback}>
      <div className={`dashboard-section ${className}`}>
        {title && <h5 className="mb-3">{title}</h5>}
        {children}
      </div>
    </ErrorBoundary>
  );
});

DashboardSection.displayName = 'DashboardSection';

interface DashboardGridProps {
  children: React.ReactNode;
  spacing?: 3 | 4;
  className?: string;
}

export const DashboardGrid: React.FC<DashboardGridProps> = memo(({
  children,
  spacing = 3,
  className = ''
}) => {
  return (
    <Row className={`g-${spacing} ${className}`}>
      {children}
    </Row>
  );
});

DashboardGrid.displayName = 'DashboardGrid';