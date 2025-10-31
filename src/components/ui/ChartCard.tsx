import React from 'react';
import { Card } from 'react-bootstrap';
import { LoadingSpinner } from '@/components/ui/LoadingStates';
import IconifyIcon from '@/components/wrapper/IconifyIcon';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  borderColor?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  icon?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  borderColor = 'primary',
  icon,
  children,
  actions,
  loading = false,
  className = '',
}) => {
  return (
    <Card className={`chart-card border-${borderColor} ${className}`}>
      <Card.Header className="chart-card-header">
        <div className="d-flex align-items-center gap-2 flex-grow-1">
          {icon && (
            <div className={`chart-card-icon bg-${borderColor}-subtle text-${borderColor}`}>
              <IconifyIcon icon={icon} />
            </div>
          )}
          <div>
            <h6 className="mb-0">{title}</h6>
            {subtitle && (
              <small className="text-muted">{subtitle}</small>
            )}
          </div>
        </div>
        {actions && (
          <div className="chart-card-actions">
            {actions}
          </div>
        )}
      </Card.Header>
      <Card.Body className="chart-card-body">
        {loading ? (
          <div className="text-center py-5">
            <LoadingSpinner />
          </div>
        ) : (
          children
        )}
      </Card.Body>
    </Card>
  );
};
