import IconifyIcon from '@/components/wrapper/IconifyIcon'
import SimplebarReactClient from '@/components/wrapper/SimplebarReactClient'
import { useNotifications } from '@/components/notifications/NotificationService'
import { Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'

interface NotificationItemType {
  id: string
  title: string
  message: string
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
  category: string
  created_at: string
  read_at?: string
  application_id?: string
}

const NotificationItem = ({ notification, onMarkAsRead }: { notification: NotificationItemType, onMarkAsRead: (id: string) => void }) => {
  const getIconByType = (type: string) => {
    switch (type) {
      case 'SUCCESS': return 'solar:check-circle-bold'
      case 'WARNING': return 'solar:danger-triangle-bold'
      case 'ERROR': return 'solar:close-circle-bold'
      default: return 'solar:bell-bing-bold'
    }
  }

  const getColorByType = (type: string) => {
    switch (type) {
      case 'SUCCESS': return 'text-success'
      case 'WARNING': return 'text-warning'
      case 'ERROR': return 'text-danger'
      default: return 'text-info'
    }
  }

  const handleClick = () => {
    if (!notification.read_at) {
      onMarkAsRead(notification.id)
    }
  }

  return (
    <DropdownItem 
      className={`py-3 border-bottom text-wrap ${!notification.read_at ? 'bg-light' : ''}`}
      onClick={handleClick}
    >
      <div className="d-flex">
        <div className="flex-shrink-0">
          <div className="avatar-sm me-2">
            <span className={`avatar-title ${getColorByType(notification.type)} fs-20 rounded-circle`}>
              <IconifyIcon icon={getIconByType(notification.type)} />
            </span>
          </div>
        </div>
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-start">
            <span className="mb-1 fw-semibold text-truncate">{notification.title}</span>
            {!notification.read_at && (
              <span className="badge bg-primary rounded-pill ms-2">New</span>
            )}
          </div>
          <p className="mb-1 text-muted small text-wrap">{notification.message}</p>
          <small className="text-muted">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </small>
        </div>
      </div>
    </DropdownItem>
  )
}

const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  return (
    <Dropdown className="topbar-item">
      <DropdownToggle
        as={'a'}
        type="button"
        className="topbar-button position-relative content-none"
        id="page-header-notifications-dropdown"
        data-bs-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false">
        <IconifyIcon icon="solar:bell-bing-outline" className="fs-22 align-middle" />
        {unreadCount > 0 && (
          <span className="position-absolute topbar-badge fs-10 translate-middle badge bg-danger rounded-pill">
            {unreadCount > 99 ? '99+' : unreadCount}
            <span className="visually-hidden">unread messages</span>
          </span>
        )}
      </DropdownToggle>
      <DropdownMenu className="py-0 dropdown-lg dropdown-menu-end" aria-labelledby="page-header-notifications-dropdown">
        <div className="p-3 border-top-0 border-start-0 border-end-0 border-dashed border">
          <Row className="align-items-center">
            <Col>
              <h6 className="m-0 fs-16 fw-semibold">
                Notifications ({notifications.length})
              </h6>
            </Col>
            <Col xs={'auto'}>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="btn btn-link text-decoration-underline p-0"
                  style={{ fontSize: '0.875rem' }}
                >
                  Mark All Read
                </button>
              )}
            </Col>
          </Row>
        </div>
        <SimplebarReactClient style={{ maxHeight: 400 }}>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem 
                key={notification.id} 
                notification={notification}
                onMarkAsRead={markAsRead}
              />
            ))
          ) : (
            <div className="text-center py-4">
              <IconifyIcon icon="solar:bell-off-outline" className="fs-48 text-muted mb-2" />
              <p className="text-muted">No notifications yet</p>
            </div>
          )}
        </SimplebarReactClient>
        {notifications.length > 0 && (
          <div className="text-center py-3">
            <Link to="/admin/notifications" className="btn btn-primary btn-sm">
              View All Notifications <IconifyIcon icon="bx:right-arrow-alt" className="ms-1" />
            </Link>
          </div>
        )}
      </DropdownMenu>
    </Dropdown>
  )
}

export default Notifications
