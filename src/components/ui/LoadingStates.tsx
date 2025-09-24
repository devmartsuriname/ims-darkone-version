import React from 'react'
import { Spinner } from 'react-bootstrap'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'light'
  text?: string
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  text,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg'
  }

  return (
    <div className={`d-flex align-items-center gap-2 ${className}`}>
      <Spinner 
        animation="border" 
        variant={variant}
        size={size === 'sm' ? 'sm' : undefined}
        className={sizeClasses[size]}
      />
      {text && <span className="text-muted">{text}</span>}
    </div>
  )
}

interface SkeletonProps {
  height?: string
  width?: string
  className?: string
  rounded?: boolean
}

export const Skeleton: React.FC<SkeletonProps> = ({
  height = '1rem',
  width = '100%',
  className = '',
  rounded = false
}) => {
  return (
    <div 
      className={`placeholder-glow ${className}`}
      style={{ height, width }}
    >
      <span 
        className={`placeholder ${rounded ? 'rounded-pill' : 'rounded'} w-100 h-100`}
        style={{ display: 'block' }}
      />
    </div>
  )
}

interface CardSkeletonProps {
  showImage?: boolean
  lines?: number
  className?: string
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  showImage = false,
  lines = 3,
  className = ''
}) => {
  return (
    <div className={`card ${className}`}>
      <div className="card-body">
        {showImage && (
          <Skeleton height="200px" className="mb-3" rounded />
        )}
        <Skeleton height="1.5rem" width="75%" className="mb-2" />
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton 
            key={index}
            height="1rem" 
            width={`${Math.random() * 40 + 60}%`}
            className="mb-2" 
          />
        ))}
        <div className="d-flex gap-2 mt-3">
          <Skeleton height="2rem" width="80px" rounded />
          <Skeleton height="2rem" width="100px" rounded />
        </div>
      </div>
    </div>
  )
}

interface TableSkeletonProps {
  rows?: number
  columns?: number
  className?: string
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4,
  className = ''
}) => {
  return (
    <div className={`table-responsive ${className}`}>
      <table className="table">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index}>
                <Skeleton height="1.2rem" width="80%" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex}>
                  <Skeleton height="1rem" width={`${Math.random() * 30 + 70}%`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface ProgressBarProps {
  progress: number
  variant?: 'primary' | 'success' | 'warning' | 'danger'
  striped?: boolean
  animated?: boolean
  showLabel?: boolean
  height?: string
  className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  variant = 'primary',
  striped = false,
  animated = false,
  showLabel = false,
  height = '0.5rem',
  className = ''
}) => {
  return (
    <div className={`progress ${className}`} style={{ height }}>
      <div
        className={`progress-bar ${striped ? 'progress-bar-striped' : ''} ${animated ? 'progress-bar-animated' : ''} bg-${variant}`}
        role="progressbar"
        style={{ width: `${progress}%` }}
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {showLabel && `${progress}%`}
      </div>
    </div>
  )
}

interface FileUploadProgressProps {
  filename: string
  progress: number
  status: 'uploading' | 'success' | 'error'
  onCancel?: () => void
  className?: string
}

export const FileUploadProgress: React.FC<FileUploadProgressProps> = ({
  filename,
  progress,
  status,
  onCancel,
  className = ''
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'success'
      case 'error': return 'danger'
      default: return 'primary'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'success': return '✓'
      case 'error': return '✗'
      default: return ''
    }
  }

  return (
    <div className={`d-flex align-items-center gap-3 p-3 border rounded ${className}`}>
      <div className="flex-shrink-0">
        {status === 'uploading' ? (
          <LoadingSpinner size="sm" />
        ) : (
          <span className={`badge bg-${getStatusColor()}`}>
            {getStatusIcon()}
          </span>
        )}
      </div>
      <div className="flex-grow-1">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span className="fw-medium text-truncate">{filename}</span>
          {onCancel && status === 'uploading' && (
            <button 
              type="button" 
              className="btn-close btn-close-sm"
              onClick={onCancel}
              aria-label="Cancel upload"
            />
          )}
        </div>
        <ProgressBar 
          progress={progress}
          variant={getStatusColor()}
          height="4px"
          striped={status === 'uploading'}
          animated={status === 'uploading'}
        />
      </div>
    </div>
  )
}