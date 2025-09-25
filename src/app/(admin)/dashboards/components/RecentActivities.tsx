import { Card, CardBody } from 'react-bootstrap'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { useAuthContext } from '@/context/useAuthContext'
import RoleCheck from '@/components/auth/RoleCheck'
import { LoadingSpinner } from '@/components/ui/LoadingStates'
import { useRecentActivities } from '@/hooks/useRecentActivities'

const RecentActivities = () => {
  const { roles } = useAuthContext()
  const { activities, isLoading, error } = useRecentActivities(6)
  
  // Get primary role for filtering
  const getUserRole = () => {
    if (!roles || roles.length === 0) return null
    const primaryRole = roles.find(r => r.is_active)
    return primaryRole?.role || null
  }
  
  const userRole = getUserRole()

  // Define role access for each activity type
  const getActivityRoles = (type: string): string[] => {
    switch (type) {
      case 'application':
        return ['admin', 'it', 'staff', 'front_office']
      case 'control':
        return ['admin', 'it', 'control', 'staff']
      case 'review':
        return ['admin', 'it', 'staff', 'director']
      case 'approval':
        return ['admin', 'it', 'director', 'minister']
      case 'document':
        return ['admin', 'it', 'staff', 'front_office']
      default:
        return ['admin', 'it']
    }
  }

  const visibleActivities = activities.filter(activity => {
    const allowedRoles = getActivityRoles(activity.type)
    return userRole && allowedRoles.includes(userRole)
  }).slice(0, 5)

  if (isLoading) {
    return (
      <Card>
        <CardBody className="text-center py-5">
          <LoadingSpinner />
          <p className="text-muted mt-2">Loading recent activities...</p>
        </CardBody>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <div className="alert alert-warning">
            <strong>Warning:</strong> {error}
          </div>
        </CardBody>
      </Card>
    )
  }

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
          {visibleActivities.length === 0 ? (
            <div className="text-center py-4">
              <IconifyIcon icon="solar:inbox-broken" className="fs-1 text-muted" />
              <p className="text-muted mt-2">No recent activities found</p>
            </div>
          ) : (
            visibleActivities.map((activity, index) => (
              <RoleCheck key={activity.id} allowedRoles={getActivityRoles(activity.type)}>
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
            ))
          )}
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