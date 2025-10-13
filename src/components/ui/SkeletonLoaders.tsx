import { memo } from 'react'
import { Card, Placeholder } from 'react-bootstrap'

export const CardSkeleton = memo(() => (
  <Card className="animate-pulse">
    <Card.Body>
      <Placeholder as="div" animation="glow">
        <Placeholder xs={7} size="lg" className="mb-3" />
        <Placeholder xs={4} className="mb-2" />
        <Placeholder xs={6} className="mb-2" />
        <Placeholder xs={8} />
      </Placeholder>
    </Card.Body>
  </Card>
))

CardSkeleton.displayName = 'CardSkeleton'

export const StatCardSkeleton = memo(() => (
  <Card className="animate-pulse">
    <Card.Body>
      <div className="d-flex align-items-center">
        <div className="flex-shrink-0">
          <Placeholder.Button variant="primary" xs={2} style={{ width: '48px', height: '48px' }} />
        </div>
        <div className="flex-grow-1 ms-3">
          <Placeholder as="div" animation="glow">
            <Placeholder xs={6} size="sm" className="mb-2" />
            <Placeholder xs={4} size="lg" />
          </Placeholder>
        </div>
      </div>
    </Card.Body>
  </Card>
))

StatCardSkeleton.displayName = 'StatCardSkeleton'

export const TableRowSkeleton = memo(({ columns = 5 }: { columns?: number }) => (
  <tr>
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i}>
        <Placeholder as="div" animation="glow">
          <Placeholder xs={Math.floor(Math.random() * 4) + 7} />
        </Placeholder>
      </td>
    ))}
  </tr>
))

TableRowSkeleton.displayName = 'TableRowSkeleton'

export const ChartSkeleton = memo(() => (
  <Card className="card-height-100">
    <Card.Header>
      <Placeholder as="div" animation="glow">
        <Placeholder xs={6} size="lg" />
      </Placeholder>
    </Card.Header>
    <Card.Body>
      <div className="d-flex align-items-end justify-content-between" style={{ height: '313px' }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="bg-muted rounded"
            style={{
              width: '6%',
              height: `${Math.random() * 100}%`,
              opacity: 0.3,
            }}
          />
        ))}
      </div>
    </Card.Body>
  </Card>
))

ChartSkeleton.displayName = 'ChartSkeleton'

export const FormSkeleton = memo(() => (
  <Card>
    <Card.Body>
      <Placeholder as="div" animation="glow">
        <Placeholder xs={4} size="sm" className="mb-2" />
        <Placeholder xs={12} size="lg" className="mb-3" />
        <Placeholder xs={4} size="sm" className="mb-2" />
        <Placeholder xs={12} size="lg" className="mb-3" />
        <Placeholder xs={4} size="sm" className="mb-2" />
        <Placeholder xs={12} size="lg" className="mb-4" />
        <Placeholder.Button variant="primary" xs={3} />
      </Placeholder>
    </Card.Body>
  </Card>
))

FormSkeleton.displayName = 'FormSkeleton'

export const ListSkeleton = memo(({ items = 5 }: { items?: number }) => (
  <div className="d-flex flex-column gap-2">
    {Array.from({ length: items }).map((_, i) => (
      <Card key={i} className="animate-pulse">
        <Card.Body className="py-2">
          <div className="d-flex align-items-center">
            <Placeholder.Button variant="secondary" xs={1} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
            <div className="flex-grow-1 ms-3">
              <Placeholder as="div" animation="glow">
                <Placeholder xs={8} className="mb-1" />
                <Placeholder xs={5} size="sm" />
              </Placeholder>
            </div>
          </div>
        </Card.Body>
      </Card>
    ))}
  </div>
))

ListSkeleton.displayName = 'ListSkeleton'

export const DashboardSkeleton = memo(() => (
  <div>
    <div className="row mb-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="col-md-6 col-xl-3 mb-3">
          <StatCardSkeleton />
        </div>
      ))}
    </div>
    <div className="row">
      <div className="col-12">
        <ChartSkeleton />
      </div>
    </div>
  </div>
))

DashboardSkeleton.displayName = 'DashboardSkeleton'
