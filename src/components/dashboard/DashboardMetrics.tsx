import React, { memo, useMemo } from 'react';
import { Row, Col } from 'react-bootstrap';
import { StatCard } from '@/components/ui/EnhancedCards';
import { Skeleton } from '@/components/ui/LoadingStates';
import { ErrorBoundary, DashboardErrorFallback } from './ErrorBoundary';
import { useRealTimeApplicationStats } from '@/hooks/useRealTimeData';
import { useAuthContext } from '@/context/useAuthContext';
import RoleCheck from '@/components/auth/RoleCheck';
import IconifyIcon from '@/components/wrapper/IconifyIcon';

interface MetricCardProps {
  title: string;
  count: string | number;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
  trend?: number;
  trendUp?: boolean;
  description?: string;
  roles: string[];
  isLoading?: boolean;
}

const MetricCard = memo<MetricCardProps>(({ 
  title, count, icon, color, trend, trendUp, isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="card h-100 animate-fade-in">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <div className="flex-grow-1">
              <Skeleton height="1.2rem" width="70%" className="mb-2" />
              <Skeleton height="2rem" width="50%" className="mb-1" />
              <Skeleton height="0.9rem" width="80%" />
            </div>
            <div className="flex-shrink-0">
              <Skeleton height="3rem" width="3rem" rounded />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <StatCard
      title={title}
      value={count}
      change={trend ? {
        value: trend,
        type: trendUp ? 'increase' : 'decrease'
      } : undefined}
      icon={icon}
      color={color}
      className="h-100 animate-fade-in"
    />
  );
});

MetricCard.displayName = 'MetricCard';

interface ConnectionStatusProps {
  isConnected: boolean;
  lastUpdated: Date | null;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = memo(({ isConnected, lastUpdated }) => {
  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'never';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  return (
    <div className="d-flex align-items-center gap-2 small text-muted">
      <div className={`rounded-circle ${isConnected ? 'bg-success' : 'bg-warning'}`} 
           style={{ width: '8px', height: '8px' }} />
      <span>
        {isConnected ? 'Live' : 'Offline'} • Updated {formatLastUpdated(lastUpdated)}
      </span>
    </div>
  );
});

ConnectionStatus.displayName = 'ConnectionStatus';

export const DashboardMetrics: React.FC = memo(() => {
  const { roles } = useAuthContext();
  
  const getUserRole = () => {
    if (!roles || roles.length === 0) return null;
    const primaryRole = roles.find(r => r.is_active);
    return primaryRole?.role || null;
  };
  
  const userRole = getUserRole();
  const { data: stats, isLoading, error, lastUpdated, isConnected } = useRealTimeApplicationStats();

  const metricsConfig = useMemo(() => [
    {
      title: 'Total Applications',
      count: stats?.total || 0,
      icon: 'solar:document-text-broken',
      color: 'primary' as const,
      description: 'All time applications',
      roles: ['admin', 'it', 'staff', 'front_office']
    },
    {
      title: 'Pending Reviews',
      count: stats?.pending || 0,
      icon: 'solar:clock-circle-broken',
      color: 'warning' as const,
      description: 'Awaiting processing',
      roles: ['admin', 'it', 'staff', 'director', 'minister']
    },
    {
      title: 'Control Visits',
      count: stats?.controlVisits || 0,
      icon: 'solar:home-2-broken',
      color: 'info' as const,
      description: 'Scheduled visits',
      roles: ['admin', 'it', 'control', 'staff']
    },
    {
      title: 'Approved',
      count: stats?.approved || 0,
      icon: 'solar:check-circle-broken',
      color: 'success' as const,
      description: 'Final approvals',
      roles: ['admin', 'it', 'director', 'minister', 'staff']
    },
    {
      title: 'SLA Violations',
      count: stats?.slaViolations || 0,
      icon: 'solar:danger-circle-broken',
      color: 'danger' as const,
      description: 'Overdue applications',
      roles: ['admin', 'it', 'staff']
    },
    {
      title: 'My Queue',
      count: stats?.myQueue || 0,
      icon: 'solar:user-circle-broken',
      color: 'secondary' as const,
      description: 'Assigned to me',
      roles: ['control', 'staff', 'director', 'minister']
    }
  ], [stats]);

  const visibleMetrics = useMemo(() => 
    metricsConfig.filter(metric => 
      userRole && metric.roles.includes(userRole)
    ), [metricsConfig, userRole]
  );

  if (error) {
    return (
      <div className="alert alert-danger d-flex align-items-center">
        <IconifyIcon icon="solar:danger-triangle-bold" className="me-2" />
        <div>
          <strong>Error loading metrics:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={DashboardErrorFallback}>
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Performance Metrics</h5>
          <ConnectionStatus isConnected={isConnected} lastUpdated={lastUpdated} />
        </div>
        
        <Row className="g-3">
          {visibleMetrics.map((metric, idx) => (
            <Col xxl={2} xl={3} lg={4} md={6} sm={6} xs={12} key={`${metric.title}-${idx}`}>
              <RoleCheck allowedRoles={metric.roles}>
                <MetricCard 
                  {...metric} 
                  isLoading={isLoading}
                />
              </RoleCheck>
            </Col>
          ))}
        </Row>
      </div>
    </ErrorBoundary>
  );
});

DashboardMetrics.displayName = 'DashboardMetrics';