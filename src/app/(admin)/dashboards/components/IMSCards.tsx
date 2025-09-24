import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { ApexOptions } from 'apexcharts'
import ReactApexChart from 'react-apexcharts'
import { Card, CardBody, Col, Row } from 'react-bootstrap'
import { useAuthContext } from '@/context/useAuthContext'
import RoleCheck from '@/components/auth/RoleCheck'

interface IMSCardType {
  title: string
  count: string | number
  icon: string
  color: string
  trend?: number
  trendUp?: boolean
  description?: string
  roles: string[]
}

const IMSStatCard = ({ count, icon, title, color, trend, trendUp, description }: Omit<IMSCardType, 'roles'>) => {
  const trendChart: ApexOptions = {
    chart: {
      type: 'line',
      height: 40,
      sparkline: {
        enabled: true,
      },
    },
    series: [
      {
        data: trend ? [trend - 10, trend - 5, trend, trend + 5, trend + 2] : [25, 28, 32, 38, 43],
      },
    ],
    stroke: {
      width: 2,
      curve: 'smooth',
    },
    markers: {
      size: 0,
    },
    colors: [color],
    tooltip: {
      fixed: {
        enabled: false,
      },
      x: {
        show: false,
      },
      y: {
        title: {
          formatter: () => '',
        },
      },
      marker: {
        show: false,
      },
    },
  }

  return (
    <Card className="h-100">
      <CardBody>
        <Row className="align-items-center">
          <Col xs={8}>
            <p className="text-muted mb-1 text-truncate fs-14">{title}</p>
            <h3 className="text-dark mt-1 mb-0 fw-bold">{count}</h3>
            {description && (
              <p className="text-muted mb-0 fs-12">{description}</p>
            )}
          </Col>
          <Col xs={4}>
            <div className="d-flex align-items-center justify-content-end">
              <div className={`avatar-sm rounded-circle bg-soft-${color.replace('#', '')} d-flex align-items-center justify-content-center`}>
                <IconifyIcon icon={icon} className={`fs-20 text-${color.replace('#', '')}`} />
              </div>
            </div>
          </Col>
        </Row>
        {trend && (
          <div className="mt-2">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <span className={`badge badge-soft-${trendUp ? 'success' : 'danger'} me-1`}>
                  <IconifyIcon icon={trendUp ? 'solar:arrow-up-linear' : 'solar:arrow-down-linear'} className="me-1" />
                  {Math.abs(trend)}%
                </span>
                <span className="text-muted fs-12">vs last month</span>
              </div>
              <div style={{ width: '60px' }}>
                <ReactApexChart options={trendChart} series={trendChart.series} height={40} type="line" />
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
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