import { Card, CardBody } from 'react-bootstrap'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { useAuthContext } from '@/context/useAuthContext'
import RoleCheck from '@/components/auth/RoleCheck'

interface ActivityItem {
  id: string
  type: 'application' | 'control' | 'review' | 'approval' | 'document'
  title: string
  description: string
  time: string
  icon: string
  color: string
  roles: string[]
}

const RecentActivities = () => {
  const { roles } = useAuthContext()
  
  // Get primary role for filtering
  const getUserRole = () => {
    if (!roles || roles.length === 0) return null
    const primaryRole = roles.find(r => r.is_active)
    return primaryRole?.role || null
  }
  
  const userRole = getUserRole()

  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'application',
      title: 'New Application Submitted',
      description: 'Application #BSS-2024-0156 submitted by Maria Santos',
      time: '5 minutes ago',
      icon: 'solar:document-add-broken',
      color: 'primary',
      roles: ['admin', 'it', 'staff', 'front_office']
    },
    {
      id: '2',
      type: 'control',
      title: 'Control Visit Completed',
      description: 'Site visit completed for Application #BSS-2024-0145',
      time: '1 hour ago',
      icon: 'solar:home-2-broken',
      color: 'info',
      roles: ['admin', 'it', 'control', 'staff']
    },
    {
      id: '3',
      type: 'review',
      title: 'Technical Review Approved',
      description: 'Technical assessment completed for Application #BSS-2024-0134',
      time: '2 hours ago',
      icon: 'solar:clipboard-check-broken',
      color: 'success',
      roles: ['admin', 'it', 'staff', 'director']
    },
    {
      id: '4',
      type: 'approval',
      title: 'Director Recommendation',
      description: 'Application #BSS-2024-0123 recommended for approval',
      time: '4 hours ago',
      icon: 'solar:check-circle-broken',
      color: 'warning',
      roles: ['admin', 'it', 'director', 'minister']
    },
    {
      id: '5',
      type: 'document',
      title: 'Document Uploaded',
      description: 'Additional documents uploaded for Application #BSS-2024-0112',
      time: '6 hours ago',
      icon: 'solar:upload-broken',
      color: 'secondary',
      roles: ['admin', 'it', 'staff', 'front_office']
    },
    {
      id: '6',
      type: 'approval',
      title: 'Final Approval Granted',
      description: 'Application #BSS-2024-0098 approved by Minister',
      time: '1 day ago',
      icon: 'solar:star-circle-broken',
      color: 'success',
      roles: ['admin', 'it', 'minister', 'staff']
    }
  ]

  const visibleActivities = activities.filter(activity => 
    userRole && activity.roles.includes(userRole)
  ).slice(0, 5)

  return (
    <Card>
      <CardBody>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="card-title mb-0">Recent Activities</h5>
          <div className="dropdown">
            <button 
              className="btn btn-ghost-secondary btn-sm dropdown-toggle" 
              type="button" 
              data-bs-toggle="dropdown"
            >
              <IconifyIcon icon="solar:menu-dots-bold" />
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li><a className="dropdown-item" href="#">View All</a></li>
              <li><a className="dropdown-item" href="#">Filter</a></li>
              <li><a className="dropdown-item" href="#">Export</a></li>
            </ul>
          </div>
        </div>

        <div className="activity-timeline">
          {visibleActivities.map((activity, index) => (
            <RoleCheck key={activity.id} allowedRoles={activity.roles}>
              <div className="activity-item d-flex">
                <div className="flex-shrink-0">
                  <div className={`avatar-xs bg-soft-${activity.color}`}>
                    <div className={`avatar-title text-${activity.color} rounded-circle fs-16`}>
                      <IconifyIcon icon={activity.icon} />
                    </div>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-1 fs-14">{activity.title}</h6>
                  <p className="text-muted mb-1 fs-12">{activity.description}</p>
                  <small className="text-muted">{activity.time}</small>
                </div>
              </div>
              {index < visibleActivities.length - 1 && (
                <div className="activity-connector"></div>
              )}
            </RoleCheck>
          ))}
        </div>

        <div className="text-center mt-3">
          <button className="btn btn-soft-primary btn-sm">
            <IconifyIcon icon="solar:eye-broken" className="me-1" />
            View All Activities
          </button>
        </div>
      </CardBody>
    </Card>
  )
}

export default RecentActivities