import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Toast, ToastContainer } from 'react-bootstrap'

interface ToastNotification {
  id: string
  title: string
  message: string
  variant: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  duration?: number
  timestamp: Date
}

interface NotificationContextType {
  notifications: ToastNotification[]
  addNotification: (notification: Omit<ToastNotification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<ToastNotification[]>([])

  const addNotification = (notification: Omit<ToastNotification, 'id' | 'timestamp'>) => {
    const newNotification: ToastNotification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    }

    setNotifications(prev => [...prev, newNotification])

    // Auto-remove notification after duration
    const duration = notification.duration || 5000
    setTimeout(() => {
      removeNotification(newNotification.id)
    }, duration)
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearAll }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  )
}

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications()

  const getVariantIcon = (variant: string) => {
    switch (variant) {
      case 'success': return 'bi bi-check-circle-fill'
      case 'warning': return 'bi bi-exclamation-triangle-fill'
      case 'danger': return 'bi bi-x-circle-fill'
      case 'info': return 'bi bi-info-circle-fill'
      default: return 'bi bi-bell-fill'
    }
  }

  const getVariantColor = (variant: string) => {
    switch (variant) {
      case 'success': return 'text-success'
      case 'warning': return 'text-warning'
      case 'danger': return 'text-danger'
      case 'info': return 'text-info'
      default: return 'text-primary'
    }
  }

  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1060 }}>
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          onClose={() => removeNotification(notification.id)}
          show={true}
          delay={notification.duration || 5000}
          autohide
          className="animate__animated animate__slideInRight"
        >
          <Toast.Header>
            <i className={`${getVariantIcon(notification.variant)} ${getVariantColor(notification.variant)} me-2`}></i>
            <strong className="me-auto">{notification.title}</strong>
            <small className="text-muted">
              {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </small>
          </Toast.Header>
          <Toast.Body>
            {notification.message}
          </Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  )
}

// Helper hooks for specific notification types
export const useSuccessNotification = () => {
  const { addNotification } = useNotifications()
  
  return (title: string, message: string, duration?: number) => {
    addNotification({
      title,
      message,
      variant: 'success',
      duration
    })
  }
}

export const useErrorNotification = () => {
  const { addNotification } = useNotifications()
  
  return (title: string, message: string, duration?: number) => {
    addNotification({
      title,
      message,
      variant: 'danger',
      duration
    })
  }
}

export const useWarningNotification = () => {
  const { addNotification } = useNotifications()
  
  return (title: string, message: string, duration?: number) => {
    addNotification({
      title,
      message,
      variant: 'warning',
      duration
    })
  }
}

export const useInfoNotification = () => {
  const { addNotification } = useNotifications()
  
  return (title: string, message: string, duration?: number) => {
    addNotification({
      title,
      message,
      variant: 'info',
      duration
    })
  }
}