import React, { ReactNode } from 'react'
import { Card, CardBody, CardHeader } from 'react-bootstrap'
import { LoadingSpinner } from './LoadingStates'
import IconifyIcon from '@/components/wrapper/IconifyIcon'

interface EnhancedCardProps {
  title?: string
  subtitle?: string
  children: ReactNode
  loading?: boolean
  error?: string
  actions?: ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient'
  size?: 'sm' | 'md' | 'lg'
  hoverable?: boolean
  animated?: boolean
}

export const EnhancedCard: React.FC<EnhancedCardProps> = ({
  title,
  subtitle,
  children,
  loading = false,
  error,
  actions,
  className = '',
  variant = 'default',
  size = 'md',
  hoverable = false,
  animated = true
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'elevated':
        return 'shadow-lg border-0'
      case 'outlined':
        return 'border-2 shadow-none'
      case 'gradient':
        return 'bg-gradient border-0 shadow-lg text-white'
      default:
        return 'shadow-sm'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-3'
      case 'lg':
        return 'p-5'
      default:
        return 'p-4'
    }
  }

  const cardClasses = [
    'h-100',
    getVariantClasses(),
    hoverable ? 'card-hoverable' : '',
    animated ? 'animate__animated animate__fadeIn' : '',
    className
  ].filter(Boolean).join(' ')

  if (loading) {
    return (
      <Card className={cardClasses}>
        <CardBody className={`d-flex align-items-center justify-content-center ${getSizeClasses()}`}>
          <LoadingSpinner text="Loading..." />
        </CardBody>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`${cardClasses} border-danger`}>
        <CardBody className={getSizeClasses()}>
          <div className="text-center text-danger">
            <i className="bi bi-exclamation-triangle fs-2 mb-2"></i>
            <p className="mb-0">{error}</p>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className={cardClasses}>
      {(title || subtitle || actions) && (
        <CardHeader className="border-0 bg-transparent d-flex align-items-center justify-content-between">
          <div>
            {title && <h5 className="card-title mb-0">{title}</h5>}
            {subtitle && <p className="card-subtitle text-muted mt-1 mb-0">{subtitle}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </CardHeader>
      )}
      <CardBody className={getSizeClasses()}>
        {children}
      </CardBody>
    </Card>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease' | 'neutral'
  }
  icon?: string
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'
  loading?: boolean
  className?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  color = 'primary',
  loading = false,
  className = ''
}) => {
  const getChangeIcon = () => {
    switch (change?.type) {
      case 'increase':
        return '↗'
      case 'decrease':
        return '↘'
      default:
        return '→'
    }
  }

  const getChangeColor = () => {
    switch (change?.type) {
      case 'increase':
        return 'text-success'
      case 'decrease':
        return 'text-danger'
      default:
        return 'text-muted'
    }
  }

  if (loading) {
    return (
      <Card className={`h-100 stat-card border-${color} card-animate ${className}`}>
        <CardBody className="d-flex align-items-center justify-content-center">
          <LoadingSpinner text="Loading..." />
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className={`h-100 stat-card border-${color} card-animate ${className}`}>
      <CardBody className="p-3">
        <div className="d-flex align-items-start justify-content-between">
          <div className="flex-grow-1">
            <p className="text-uppercase text-muted fw-semibold mb-2 small">
              {title}
            </p>
            <h3 className="mb-1 fw-bold">{value}</h3>
            {change && (
              <p className={`small mb-0 ${getChangeColor()}`}>
                <span className="me-1">{getChangeIcon()}</span>
                {Math.abs(change.value)}% from last period
              </p>
            )}
          </div>
          {icon && (
            <div className="flex-shrink-0 ms-3">
              <div className={`stat-card-icon bg-${color}-subtle text-${color}`}>
                <IconifyIcon icon={icon} />
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  )
}

interface ActionCardProps {
  title: string
  description: string
  icon?: string
  badge?: {
    text: string
    variant: string
  }
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon,
  badge,
  onClick,
  disabled = false,
  className = ''
}) => {
  const cardClasses = [
    'action-card',
    disabled ? 'disabled' : 'cursor-pointer',
    className
  ].filter(Boolean).join(' ')

  return (
    <EnhancedCard
      className={cardClasses}
      variant="outlined"
      hoverable={!disabled}
      animated
    >
      <div 
        className="text-center"
        onClick={disabled ? undefined : onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick && !disabled ? 0 : undefined}
      >
        {icon && (
          <div className="mb-3">
            <i className={`${icon} fs-1 text-primary`}></i>
          </div>
        )}
        <h6 className="fw-bold mb-2">{title}</h6>
        <p className="text-muted small mb-0">{description}</p>
        {badge && (
          <span className={`badge bg-${badge.variant} mt-2`}>
            {badge.text}
          </span>
        )}
      </div>
    </EnhancedCard>
  )
}

interface TimelineCardProps {
  items: Array<{
    title: string
    description: string
    time: string
    status: 'completed' | 'active' | 'pending'
    icon?: string
  }>
  className?: string
}

export const TimelineCard: React.FC<TimelineCardProps> = ({
  items,
  className = ''
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'active':
        return 'primary'
      default:
        return 'muted'
    }
  }

  return (
    <EnhancedCard title="Timeline" className={className}>
      <div className="timeline">
        {items.map((item, index) => (
          <div key={index} className={`timeline-item ${item.status}`}>
            <div className="timeline-marker">
              <div className={`timeline-marker-dot bg-${getStatusColor(item.status)}`}>
                {item.icon && <i className={item.icon}></i>}
              </div>
              {index < items.length - 1 && (
                <div className="timeline-marker-line"></div>
              )}
            </div>
            <div className="timeline-content ms-3">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <h6 className="timeline-title mb-1">{item.title}</h6>
                  <p className="timeline-description text-muted mb-0 small">
                    {item.description}
                  </p>
                </div>
                <small className="text-muted">{item.time}</small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </EnhancedCard>
  )
}