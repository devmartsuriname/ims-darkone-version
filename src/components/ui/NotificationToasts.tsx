import React, { useEffect, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import IconifyIcon from '@/components/wrapper/IconifyIcon';

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationToastsProps {
  notifications: ToastNotification[];
  onRemove: (id: string) => void;
  position?: 'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end';
}

const getToastVariant = (type: ToastNotification['type']) => {
  switch (type) {
    case 'success': return 'success';
    case 'error': return 'danger';
    case 'warning': return 'warning';
    case 'info': return 'info';
    default: return 'primary';
  }
};

const getToastIcon = (type: ToastNotification['type']) => {
  switch (type) {
    case 'success': return 'solar:check-circle-bold';
    case 'error': return 'solar:danger-circle-bold';
    case 'warning': return 'solar:danger-triangle-bold';
    case 'info': return 'solar:info-circle-bold';
    default: return 'solar:bell-bold';
  }
};

export const NotificationToasts: React.FC<NotificationToastsProps> = ({
  notifications,
  onRemove,
  position = 'top-end'
}) => {
  return (
    <ToastContainer position={position} className="p-3" style={{ zIndex: 1050 }}>
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </ToastContainer>
  );
};

interface NotificationToastProps {
  notification: ToastNotification;
  onRemove: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onRemove }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        setShow(false);
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.duration]);

  const handleClose = () => {
    setShow(false);
  };

  const handleExited = () => {
    onRemove(notification.id);
  };

  const variant = getToastVariant(notification.type);
  const icon = getToastIcon(notification.type);

  return (
    <Toast
      show={show}
      onClose={handleClose}
      onExited={handleExited}
      className={`border-${variant} animate-fade-in`}
      style={{ minWidth: '300px' }}
    >
      <Toast.Header className={`bg-${variant} text-white`}>
        <IconifyIcon icon={icon} className="me-2" />
        <strong className="me-auto">{notification.title}</strong>
      </Toast.Header>
      <Toast.Body>
        <p className="mb-2">{notification.message}</p>
        {notification.action && (
          <div className="d-flex justify-content-end">
            <button
              type="button"
              className={`btn btn-outline-${variant} btn-sm`}
              onClick={() => {
                notification.action!.onClick();
                handleClose();
              }}
            >
              {notification.action.label}
            </button>
          </div>
        )}
      </Toast.Body>
    </Toast>
  );
};

// Hook for managing toast notifications
export const useToastNotifications = () => {
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  const addNotification = (notification: Omit<ToastNotification, 'id'>) => {
    const newNotification: ToastNotification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36),
      duration: notification.duration ?? 5000
    };

    setNotifications(prev => [...prev, newNotification]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Convenience methods
  const success = (title: string, message: string, options?: Partial<ToastNotification>) => {
    addNotification({ ...options, title, message, type: 'success' });
  };

  const error = (title: string, message: string, options?: Partial<ToastNotification>) => {
    addNotification({ ...options, title, message, type: 'error' });
  };

  const warning = (title: string, message: string, options?: Partial<ToastNotification>) => {
    addNotification({ ...options, title, message, type: 'warning' });
  };

  const info = (title: string, message: string, options?: Partial<ToastNotification>) => {
    addNotification({ ...options, title, message, type: 'info' });
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    success,
    error,
    warning,
    info
  };
};