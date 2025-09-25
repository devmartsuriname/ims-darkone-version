import { Col, Row } from 'react-bootstrap'
import { useAuthContext } from '@/context/useAuthContext'
import RoleCheck from '@/components/auth/RoleCheck'
import { StatCard } from '@/components/ui/EnhancedCards'
import { LoadingSpinner } from '@/components/ui/LoadingStates'
import { useApplicationStats } from '@/hooks/useApplicationStats'

interface IMSCardType {
  title: string
  count: string | number
  icon: string
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'
  trend?: number
  trendUp?: boolean
  description?: string
  roles: string[]
}

const IMSStatCard = ({ count, icon, title, color, trend, trendUp }: Omit<IMSCardType, 'roles'>) => {
  return (
    <StatCard
      title={title}
      value={count}
      change={trend ? {
        value: trend,
        type: trendUp ? 'increase' : 'decrease'
      } : undefined}
      icon={icon}
      color={color}
      className="animate__animated animate__fadeInUp"
    />
  )
}

const IMSCards = () => {
  const { roles } = useAuthContext()
  
  // Get primary role for filtering
  const getUserRole = () => {
    if (!roles || roles.length === 0) return null
    const primaryRole = roles.find(r => r.is_active)
    return primaryRole?.role || null
  }
  
  const userRole = getUserRole()
  const { stats, isLoading, error } = useApplicationStats(userRole || undefined)

  if (isLoading) {
    return (
      <Row>
        <Col xl={12} className="text-center py-4">
          <LoadingSpinner />
          <p className="text-muted mt-2">Loading application statistics...</p>
        </Col>
      </Row>
    )
  }

  if (error) {
    return (
      <Row>
        <Col xl={12}>
          <div className="alert alert-warning">
            <strong>Warning:</strong> {error}
          </div>
        </Col>
      </Row>
    )
  }

  if (!stats) return null
  
  const imsCardsData: IMSCardType[] = [
    {
      title: 'Total Applications',
      count: stats.total,
      icon: 'solar:document-text-broken',
      color: 'primary',
      description: 'All time applications',
      roles: ['admin', 'it', 'staff', 'front_office']
    },
    {
      title: 'Pending Reviews',
      count: stats.pending,
      icon: 'solar:clock-circle-broken',
      color: 'warning',
      description: 'Awaiting processing',
      roles: ['admin', 'it', 'staff', 'director', 'minister']
    },
    {
      title: 'Control Visits',
      count: stats.controlVisits,
      icon: 'solar:home-2-broken',
      color: 'info',
      description: 'Scheduled visits',
      roles: ['admin', 'it', 'control', 'staff']
    },
    {
      title: 'Approved',
      count: stats.approved,
      icon: 'solar:check-circle-broken',
      color: 'success',
      description: 'Final approvals',
      roles: ['admin', 'it', 'director', 'minister', 'staff']
    },
    {
      title: 'SLA Violations',
      count: stats.slaViolations,
      icon: 'solar:danger-circle-broken',
      color: 'danger',
      description: 'Overdue applications',
      roles: ['admin', 'it', 'staff']
    },
    {
      title: 'My Queue',
      count: stats.myQueue,
      icon: 'solar:user-circle-broken',
      color: 'secondary',
      description: 'Assigned to me',
      roles: ['control', 'staff', 'director', 'minister']
    }
  ]

  const visibleCards = imsCardsData.filter(card => 
    userRole && card.roles.includes(userRole)
  )

  return (
    <Row>
      {visibleCards.map((card, idx) => (
        <Col xl={2} md={4} sm={6} key={idx} className="mb-3">
          <RoleCheck allowedRoles={card.roles}>
            <IMSStatCard {...card} />
          </RoleCheck>
        </Col>
      ))}
    </Row>
  )
}

export default IMSCards