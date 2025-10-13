import { useState } from 'react'
import { Row, Col, Card, Button, Alert, ProgressBar } from 'react-bootstrap'
import { toast } from 'react-toastify'

const DatabaseMaintenance = () => {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)

  const runMaintenance = async (taskName: string) => {
    try {
      setIsRunning(true)
      setProgress(0)
      
      // Simulate maintenance task
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200))
        setProgress(i)
      }
      
      toast.success(`${taskName} completed successfully`)
    } catch (error: any) {
      toast.error(`${taskName} failed: ${error.message}`)
    } finally {
      setIsRunning(false)
      setProgress(0)
    }
  }

  const maintenanceTasks = [
    {
      title: 'Clean Audit Logs',
      description: 'Remove audit logs older than 90 days',
      icon: 'mdi-delete-sweep',
      action: () => runMaintenance('Audit log cleanup'),
    },
    {
      title: 'Archive Old Applications',
      description: 'Archive completed applications older than 1 year',
      icon: 'mdi-archive',
      action: () => runMaintenance('Application archiving'),
    },
    {
      title: 'Optimize Database',
      description: 'Run vacuum and analyze on all tables',
      icon: 'mdi-database-refresh',
      action: () => runMaintenance('Database optimization'),
    },
    {
      title: 'Clean Orphaned Files',
      description: 'Remove files without database references',
      icon: 'mdi-file-remove',
      action: () => runMaintenance('Orphaned file cleanup'),
    },
    {
      title: 'Rebuild Indexes',
      description: 'Rebuild database indexes for better performance',
      icon: 'mdi-database-sync',
      action: () => runMaintenance('Index rebuild'),
    },
    {
      title: 'Generate Statistics',
      description: 'Update database statistics for query optimization',
      icon: 'mdi-chart-line',
      action: () => runMaintenance('Statistics generation'),
    },
  ]

  return (
    <div>
      <Alert variant="warning" className="mb-4">
        <i className="mdi mdi-alert me-2"></i>
        <strong>Warning:</strong> Database maintenance tasks may temporarily affect system performance. 
        It is recommended to run these tasks during off-peak hours.
      </Alert>

      {isRunning && (
        <Alert variant="info" className="mb-4">
          <div className="mb-2">Running maintenance task...</div>
          <ProgressBar now={progress} label={`${progress}%`} animated />
        </Alert>
      )}

      <Row>
        {maintenanceTasks.map((task, index) => (
          <Col md={6} lg={4} key={index} className="mb-3">
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <div className="flex-shrink-0">
                    <div className="avatar-sm">
                      <span className="avatar-title bg-primary-subtle text-primary rounded">
                        <i className={`mdi ${task.icon} font-20`}></i>
                      </span>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h5 className="mb-1">{task.title}</h5>
                  </div>
                </div>
                <p className="text-muted mb-3">{task.description}</p>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={task.action}
                  disabled={isRunning}
                  className="w-100"
                >
                  {isRunning ? 'Running...' : 'Run Task'}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="mt-4">
        <Card.Header>
          <h5 className="card-title mb-0">Scheduled Maintenance</h5>
        </Card.Header>
        <Card.Body>
          <Alert variant="info" className="mb-0">
            <i className="mdi mdi-calendar-clock me-2"></i>
            Automatic maintenance tasks are scheduled to run weekly on Sundays at 2:00 AM.
            <div className="mt-2">
              <strong>Next scheduled run:</strong> Sunday, October 20, 2025 at 02:00
            </div>
          </Alert>
        </Card.Body>
      </Card>
    </div>
  )
}

export default DatabaseMaintenance
