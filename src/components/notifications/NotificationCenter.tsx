import React, { useState, useEffect, useCallback } from 'react'
import { Card, Row, Col, Button, Badge, Alert, Form } from 'react-bootstrap'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'react-toastify'
import { formatDistanceToNow } from 'date-fns'
import IconifyIcon from '@/components/wrapper/IconifyIcon'

interface NotificationCenter {
  id: string
  title: string
  message: string
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
  category: 'APPLICATION' | 'SYSTEM' | 'REMINDER' | 'DECISION'
  read_at: string | null
  created_at: string
  metadata?: any
  application_id?: string
}

interface NotificationCenterProps {
  applicationId?: string
  compact?: boolean
}

interface NotificationFilters {
  type?: string
  category?: string
  read?: boolean
  dateRange?: string
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  applicationId,
  compact = false
}) => {
  const [notifications, setNotifications] = useState<NotificationCenter[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<NotificationFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState<'read' | 'unread' | 'delete' | null>(null)
  const [processingBulk, setProcessingBulk] = useState(false)

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(compact ? 10 : 50)

      // Apply filters
      if (applicationId) {
        query = query.eq('application_id', applicationId)
      }
      
      if (filters.type) {
        query = query.eq('type', filters.type)
      }
      
      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      
      if (filters.read !== undefined) {
        if (filters.read) {
          query = query.not('read_at', 'is', null)
        } else {
          query = query.is('read_at', null)
        }
      }

      const { data, error } = await query

      if (error) throw error
      setNotifications((data || []) as NotificationCenter[])
    } catch (error) {
      console.error('Failed to load notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [applicationId, compact, filters])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: applicationId ? `application_id=eq.${applicationId}` : undefined
        },
        (payload) => {
          const newNotification = payload.new as NotificationCenter
          setNotifications(prev => [newNotification, ...prev])
          
          // Show toast for new notifications
          toast.info(newNotification.title, {
            icon: <IconifyIcon icon="bx:bell" />
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [applicationId])

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .in('id', notificationIds)

      if (error) throw error

      setNotifications(prev =>
        prev.map(notif =>
          notificationIds.includes(notif.id)
            ? { ...notif, read_at: new Date().toISOString() }
            : notif
        )
      )
    } catch (error) {
      console.error('Failed to mark notifications as read:', error)
      toast.error('Failed to update notifications')
    }
  }

  const markAsUnread = async (notificationIds: string[]) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: null })
        .in('id', notificationIds)

      if (error) throw error

      setNotifications(prev =>
        prev.map(notif =>
          notificationIds.includes(notif.id)
            ? { ...notif, read_at: null }
            : notif
        )
      )
    } catch (error) {
      console.error('Failed to mark notifications as unread:', error)
      toast.error('Failed to update notifications')
    }
  }

  const deleteNotifications = async (notificationIds: string[]) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .in('id', notificationIds)

      if (error) throw error

      setNotifications(prev =>
        prev.filter(notif => !notificationIds.includes(notif.id))
      )

      toast.success(`${notificationIds.length} notification(s) deleted`)
    } catch (error) {
      console.error('Failed to delete notifications:', error)
      toast.error('Failed to delete notifications')
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedNotifications.size === 0) return

    setProcessingBulk(true)
    try {
      const notificationIds = Array.from(selectedNotifications)

      switch (bulkAction) {
        case 'read':
          await markAsRead(notificationIds)
          break
        case 'unread':
          await markAsUnread(notificationIds)
          break
        case 'delete':
          if (window.confirm(`Delete ${notificationIds.length} notification(s)?`)) {
            await deleteNotifications(notificationIds)
          }
          break
      }

      setSelectedNotifications(new Set())
      setBulkAction(null)
    } catch (error) {
      // Error handling is done in individual functions
    } finally {
      setProcessingBulk(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return 'bx:check-circle'
      case 'WARNING': return 'bx:error-circle'
      case 'ERROR': return 'bx:x-circle'
      default: return 'bx:info-circle'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'SUCCESS': return 'success'
      case 'WARNING': return 'warning'
      case 'ERROR': return 'danger'
      default: return 'info'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'APPLICATION': return 'bx:file'
      case 'SYSTEM': return 'bx:cog'
      case 'REMINDER': return 'bx:time'
      case 'DECISION': return 'bx:check-double'
      default: return 'bx:bell'
    }
  }

  const unreadCount = notifications.filter(n => !n.read_at).length

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (compact) {
    return (
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">
              <IconifyIcon icon="bx:bell" className="me-2" />
              Recent Notifications
            </h6>
            {unreadCount > 0 && (
              <Badge bg="danger">{unreadCount}</Badge>
            )}
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {notifications.length === 0 ? (
            <div className="text-center py-4">
              <IconifyIcon icon="bx:bell-off" style={{ fontSize: '2rem' }} className="text-muted mb-2" />
              <p className="text-muted mb-0">No notifications</p>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={`list-group-item ${!notification.read_at ? 'bg-light' : ''}`}
                >
                  <div className="d-flex align-items-start">
                    <IconifyIcon
                      icon={getNotificationIcon(notification.type)}
                      className={`text-${getNotificationColor(notification.type)} me-2 mt-1`}
                    />
                    <div className="flex-grow-1">
                      <h6 className="mb-1 small">{notification.title}</h6>
                      <p className="mb-1 small text-muted">{notification.message}</p>
                      <small className="text-muted">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    )
  }

  return (
    <div>
      {/* Header with Controls */}
      <Card className="mb-3">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              <IconifyIcon icon="bx:bell" className="me-2" />
              Notification Center
              {unreadCount > 0 && (
                <Badge bg="danger" className="ms-2">{unreadCount} unread</Badge>
              )}
            </h5>
            <div className="d-flex gap-2">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <IconifyIcon icon="bx:filter" className="me-1" />
                Filters
              </Button>
              {unreadCount > 0 && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => markAsRead(notifications.filter(n => !n.read_at).map(n => n.id))}
                >
                  <IconifyIcon icon="bx:check-double" className="me-1" />
                  Mark All Read
                </Button>
              )}
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedNotifications.size > 0 && (
            <Alert variant="info" className="d-flex justify-content-between align-items-center">
              <span>{selectedNotifications.size} notification(s) selected</span>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => setBulkAction('read')}
                  disabled={processingBulk}
                >
                  Mark Read
                </Button>
                <Button
                  variant="outline-warning"
                  size="sm"
                  onClick={() => setBulkAction('unread')}
                  disabled={processingBulk}
                >
                  Mark Unread
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => setBulkAction('delete')}
                  disabled={processingBulk}
                >
                  Delete
                </Button>
                {bulkAction && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleBulkAction}
                    disabled={processingBulk}
                  >
                    {processingBulk ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      'Apply'
                    )}
                  </Button>
                )}
              </div>
            </Alert>
          )}

          {/* Filters */}
          {showFilters && (
            <Row>
              <Col md={3}>
                <Form.Select
                  size="sm"
                  value={filters.type || ''}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value || undefined })}
                >
                  <option value="">All Types</option>
                  <option value="INFO">Info</option>
                  <option value="SUCCESS">Success</option>
                  <option value="WARNING">Warning</option>
                  <option value="ERROR">Error</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Select
                  size="sm"
                  value={filters.category || ''}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
                >
                  <option value="">All Categories</option>
                  <option value="APPLICATION">Application</option>
                  <option value="SYSTEM">System</option>
                  <option value="REMINDER">Reminder</option>
                  <option value="DECISION">Decision</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Select
                  size="sm"
                  value={filters.read === undefined ? '' : filters.read.toString()}
                  onChange={(e) => {
                    const value = e.target.value
                    setFilters({ 
                      ...filters, 
                      read: value === '' ? undefined : value === 'true'
                    })
                  }}
                >
                  <option value="">All Status</option>
                  <option value="false">Unread</option>
                  <option value="true">Read</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setFilters({})}
                  className="w-100"
                >
                  Clear Filters
                </Button>
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>

      {/* Notifications List */}
      <Card>
        <Card.Body className="p-0">
          {notifications.length === 0 ? (
            <div className="text-center py-5">
              <IconifyIcon icon="bx:bell-off" style={{ fontSize: '3rem' }} className="text-muted mb-3" />
              <p className="text-muted">No notifications found</p>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`list-group-item ${!notification.read_at ? 'border-start border-primary border-3' : ''}`}
                >
                  <div className="d-flex align-items-start">
                    <Form.Check
                      type="checkbox"
                      className="me-3 mt-1"
                      checked={selectedNotifications.has(notification.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedNotifications)
                        if (e.target.checked) {
                          newSelected.add(notification.id)
                        } else {
                          newSelected.delete(notification.id)
                        }
                        setSelectedNotifications(newSelected)
                      }}
                    />
                    
                    <div className="me-3 mt-1">
                      <IconifyIcon
                        icon={getNotificationIcon(notification.type)}
                        className={`text-${getNotificationColor(notification.type)}`}
                        style={{ fontSize: '1.2rem' }}
                      />
                    </div>

                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h6 className={`mb-0 ${!notification.read_at ? 'fw-bold' : ''}`}>
                          {notification.title}
                        </h6>
                        <div className="d-flex align-items-center gap-2">
                          <Badge bg="secondary">
                            <IconifyIcon icon={getCategoryIcon(notification.category)} className="me-1" />
                            {notification.category}
                          </Badge>
                          <small className="text-muted">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </small>
                        </div>
                      </div>
                      
                      <p className="mb-2 text-muted">{notification.message}</p>
                      
                      {notification.metadata && (
                        <div className="mb-2">
                          <small className="text-muted">
                            Additional Info: {JSON.stringify(notification.metadata)}
                          </small>
                        </div>
                      )}

                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          {notification.application_id && (
                            <Badge bg="info" className="me-2">
                              App: {notification.application_id.slice(0, 8)}...
                            </Badge>
                          )}
                        </div>
                        
                        <div className="d-flex gap-1">
                          {!notification.read_at ? (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => markAsRead([notification.id])}
                            >
                              <IconifyIcon icon="bx:check" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => markAsUnread([notification.id])}
                            >
                              <IconifyIcon icon="bx:envelope" />
                            </Button>
                          )}
                          
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => deleteNotifications([notification.id])}
                          >
                            <IconifyIcon icon="bx:trash" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}

export default NotificationCenter