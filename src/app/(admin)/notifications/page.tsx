import React from 'react'
import { Card, Row, Col, Badge, Button, Form, InputGroup } from 'react-bootstrap'
import { useNotifications } from '@/components/notifications/NotificationService'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { formatDistanceToNow } from 'date-fns'
import ComponentContainerCard from '@/components/ComponentContainerCard'

const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, refreshNotifications } = useNotifications()
  const [filterType, setFilterType] = React.useState<string>('all')
  const [searchTerm, setSearchTerm] = React.useState('')

  const filteredNotifications = React.useMemo(() => {
    let filtered = notifications;
    
    // Filter by type
    if (filterType !== 'all') {
      if (filterType === 'unread') {
        filtered = filtered.filter(n => !n.read_at);
      } else {
        filtered = filtered.filter(n => n.type === filterType);
      }
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [notifications, filterType, searchTerm]);

  const getIconByType = (type: string) => {
    switch (type) {
      case 'SUCCESS': return { icon: 'solar:check-circle-bold', color: 'text-success' }
      case 'WARNING': return { icon: 'solar:danger-triangle-bold', color: 'text-warning' }
      case 'ERROR': return { icon: 'solar:close-circle-bold', color: 'text-danger' }
      default: return { icon: 'solar:bell-bing-bold', color: 'text-info' }
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'APPLICATION': return 'primary'
      case 'DECISION': return 'success'
      case 'REMINDER': return 'warning'
      case 'SYSTEM': return 'secondary'
      default: return 'info'
    }
  }

  return (
    <div className="container-fluid">
      <PageTitle 
        title="Notifications" 
        subName="All Notifications"
      />

      <Row>
        <Col>
          <ComponentContainerCard id="notifications-list" title={`Notifications (${notifications.length})`}>
            {/* Controls */}
            <Row className="mb-4">
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text>
                    <IconifyIcon icon="solar:magnifer-linear" />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={4}>
                <Form.Select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Notifications</option>
                  <option value="unread">Unread Only ({unreadCount})</option>
                  <option value="INFO">Info</option>
                  <option value="SUCCESS">Success</option>
                  <option value="WARNING">Warning</option>
                  <option value="ERROR">Error</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={refreshNotifications}
                  >
                    <IconifyIcon icon="solar:refresh-linear" className="me-1" />
                    Refresh
                  </Button>
                  {unreadCount > 0 && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={markAllAsRead}
                    >
                      Mark All Read
                    </Button>
                  )}
                </div>
              </Col>
            </Row>

            {/* Notifications List */}
            <div className="notification-list" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => {
                  const iconInfo = getIconByType(notification.type);
                  return (
                    <Card 
                      key={notification.id} 
                      className={`mb-3 border-start-0 border-end-0 border-top-0 ${!notification.read_at ? 'bg-light' : ''}`}
                      style={{ borderLeftWidth: '4px', borderLeftStyle: 'solid', borderLeftColor: `var(--bs-${getCategoryColor(notification.category)})` }}
                    >
                      <Card.Body>
                        <Row>
                          <Col xs="auto">
                            <div className={`fs-24 ${iconInfo.color}`}>
                              <IconifyIcon icon={iconInfo.icon} />
                            </div>
                          </Col>
                          <Col>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <h6 className="mb-1 fw-semibold">
                                  {notification.title}
                                  {!notification.read_at && (
                                    <Badge bg="primary" className="ms-2">New</Badge>
                                  )}
                                </h6>
                                <Badge bg={getCategoryColor(notification.category)} className="me-2">
                                  {notification.category}
                                </Badge>
                                <small className="text-muted">
                                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </small>
                              </div>
                              {!notification.read_at && (
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  Mark as Read
                                </Button>
                              )}
                            </div>
                            <p className="mb-2 text-muted">{notification.message}</p>
                            {notification.application_id && (
                              <small className="text-muted">
                                <IconifyIcon icon="solar:document-linear" className="me-1" />
                                Application ID: {notification.application_id}
                              </small>
                            )}
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  );
                })
              ) : (
                <div className="text-center py-5">
                  <IconifyIcon icon="solar:bell-off-outline" className="fs-48 text-muted mb-3" />
                  <h5 className="text-muted">No notifications found</h5>
                  <p className="text-muted">
                    {searchTerm || filterType !== 'all' 
                      ? 'Try adjusting your search or filter criteria.' 
                      : 'You have no notifications at this time.'
                    }
                  </p>
                </div>
              )}
            </div>
          </ComponentContainerCard>
        </Col>
      </Row>
    </div>
  )
}

export default NotificationsPage