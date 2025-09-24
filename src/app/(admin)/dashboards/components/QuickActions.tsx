import { Card, CardBody, Row, Col } from 'react-bootstrap'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { useAuthContext } from '@/context/useAuthContext'
import RoleCheck from '@/components/auth/RoleCheck'
import { useNavigate } from 'react-router-dom'

interface QuickActionItem {
  title: string
  description: string
  icon: string
  color: string
  url: string
  roles: string[]
  badge?: string
}

const QuickActions = () => {
  const { roles } = useAuthContext()
  const navigate = useNavigate()
  
  // Get primary role for filtering
  const getUserRole = () => {
    if (!roles || roles.length === 0) return null
    const primaryRole = roles.find(r => r.is_active)
    return primaryRole?.role || null
  }
  
  const userRole = getUserRole()

  const quickActions: QuickActionItem[] = [
    {
      title: 'New Application',
      description: 'Create a new subsidy application',
      icon: 'solar:document-add-broken',
      color: 'primary',
      url: '/applications/intake',
      roles: ['admin', 'it', 'staff', 'front_office']
    },
    {
      title: 'Schedule Visit',
      description: 'Schedule a control site visit',
      icon: 'solar:calendar-add-broken',
      color: 'info',
      url: '/control/visits',
      roles: ['admin', 'it', 'control']
    },
    {
      title: 'Review Queue',
      description: 'Process pending reviews',
      icon: 'solar:clipboard-list-broken',
      color: 'warning',
      url: '/reviews/director',
      roles: ['admin', 'it', 'director', 'staff'],
      badge: '12'
    },
    {
      title: 'User Management',
      description: 'Manage system users',
      icon: 'solar:users-group-rounded-broken',
      color: 'success',
      url: '/admin/users',
      roles: ['admin', 'it']
    },
    {
      title: 'Generate Report',
      description: 'Create performance reports',
      icon: 'solar:chart-square-broken',
      color: 'secondary',
      url: '/reports/performance',
      roles: ['admin', 'it', 'director', 'minister']
    },
    {
      title: 'Control Queue',
      description: 'View assigned control tasks',
      icon: 'solar:home-2-broken',
      color: 'danger',
      url: '/control/queue',
      roles: ['admin', 'it', 'control'],
      badge: '5'
    }
  ]

  const visibleActions = quickActions.filter(action => 
    userRole && action.roles.includes(userRole)
  )

  const handleActionClick = (url: string) => {
    navigate(url)
  }

  return (
    <Card>
      <CardBody>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="card-title mb-0">Quick Actions</h5>
          <span className="text-muted fs-12">Click to navigate</span>
        </div>

        <Row>
          {visibleActions.map((action, index) => (
            <Col md={6} key={index} className="mb-3">
              <RoleCheck allowedRoles={action.roles}>
                <div 
                  className="quick-action-item p-3 border rounded cursor-pointer hover-lift"
                  onClick={() => handleActionClick(action.url)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bs-gray-50)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div className="d-flex align-items-start">
                    <div className="flex-shrink-0">
                      <div className={`avatar-sm bg-soft-${action.color}`}>
                        <div className={`avatar-title text-${action.color} rounded fs-18`}>
                          <IconifyIcon icon={action.icon} />
                        </div>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <div className="d-flex align-items-center justify-content-between">
                        <h6 className="mb-1 fs-14">{action.title}</h6>
                        {action.badge && (
                          <span className={`badge badge-soft-${action.color} rounded-pill`}>
                            {action.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-muted mb-0 fs-12">{action.description}</p>
                    </div>
                  </div>
                </div>
              </RoleCheck>
            </Col>
          ))}
        </Row>

        {visibleActions.length === 0 && (
          <div className="text-center py-4">
            <IconifyIcon icon="solar:box-minimalistic-broken" className="fs-48 text-muted mb-2" />
            <p className="text-muted">No quick actions available for your role</p>
          </div>
        )}
      </CardBody>
    </Card>
  )
}

export default QuickActions