import { Col, Row } from 'react-bootstrap'
import { useAuthContext } from '@/context/useAuthContext'
import RoleCheck from '@/components/auth/RoleCheck'
import { StatCard } from '@/components/ui/EnhancedCards'

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
  
  const imsCardsData: IMSCardType[] = [
    // Admin & IT can see all metrics
    {
      title: 'Total Applications',
      count: 1247,
      icon: 'solar:document-text-broken',
      color: 'primary',
      trend: 12,
      trendUp: true,
      description: 'All time applications',
      roles: ['admin', 'it', 'staff', 'front_office']
    },
    {
      title: 'Pending Reviews',
      count: 89,
      icon: 'solar:clock-circle-broken',
      color: 'warning',
      trend: -5,
      trendUp: false,
      description: 'Awaiting processing',
      roles: ['admin', 'it', 'staff', 'director', 'minister']
    },
    {
      title: 'Control Visits',
      count: 23,
      icon: 'solar:home-2-broken',
      color: 'info',
      trend: 8,
      trendUp: true,
      description: 'Scheduled this week',
      roles: ['admin', 'it', 'control', 'staff']
    },
    {
      title: 'Approved Today',
      count: 15,
      icon: 'solar:check-circle-broken',
      color: 'success',
      trend: 18,
      trendUp: true,
      description: 'Final approvals',
      roles: ['admin', 'it', 'director', 'minister', 'staff']
    },
    {
      title: 'SLA Violations',
      count: 7,
      icon: 'solar:danger-circle-broken',
      color: 'danger',
      trend: -15,
      trendUp: false,
      description: 'Overdue applications',
      roles: ['admin', 'it', 'staff']
    },
    {
      title: 'My Queue',
      count: 12,
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