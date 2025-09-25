import React, { useEffect, useState } from 'react'
import IconifyIcon from '@/components/wrapper/IconifyIcon'

interface RefreshButtonProps {
  onRefresh: () => void
  isLoading?: boolean
  lastUpdated?: Date
  autoRefreshInterval?: number // in seconds
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({
  onRefresh,
  isLoading = false,
  lastUpdated,
  autoRefreshInterval
}) => {
  const [countdown, setCountdown] = useState(autoRefreshInterval || 0)

  useEffect(() => {
    if (!autoRefreshInterval) return

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          onRefresh()
          return autoRefreshInterval
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [autoRefreshInterval, onRefresh])

  useEffect(() => {
    if (autoRefreshInterval) {
      setCountdown(autoRefreshInterval)
    }
  }, [lastUpdated, autoRefreshInterval])

  const formatLastUpdated = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="d-flex align-items-center gap-2">
      {lastUpdated && (
        <small className="text-muted">
          Updated: {formatLastUpdated(lastUpdated)}
        </small>
      )}
      
      <button
        className="btn btn-outline-primary btn-sm"
        onClick={onRefresh}
        disabled={isLoading}
      >
        <IconifyIcon 
          icon="solar:refresh-bold" 
          className={`me-1 ${isLoading ? 'spinning' : ''}`}
        />
        {isLoading ? 'Refreshing...' : 'Refresh'}
      </button>

      {autoRefreshInterval && countdown > 0 && (
        <small className="text-muted">
          Auto-refresh in {countdown}s
        </small>
      )}
    </div>
  )
}