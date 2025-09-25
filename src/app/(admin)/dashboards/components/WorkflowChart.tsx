import { ApexOptions } from 'apexcharts'
import ReactApexChart from 'react-apexcharts'
import { Card, CardBody } from 'react-bootstrap'
import { LoadingSpinner } from '@/components/ui/LoadingStates'
import { useWorkflowData } from '@/hooks/useWorkflowData'

const WorkflowChart = () => {
  const { data, isLoading, error } = useWorkflowData()

  if (isLoading) {
    return (
      <Card>
        <CardBody className="text-center py-5">
          <LoadingSpinner />
          <p className="text-muted mt-2">Loading workflow data...</p>
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

  if (!data || data.stages.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-5">
          <p className="text-muted">No workflow data available</p>
        </CardBody>
      </Card>
    )
  }

  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        dataLabels: {
          position: 'center',
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}`,
      style: {
        colors: ['#fff'],
        fontSize: '12px',
        fontWeight: 'bold',
      },
    },
    series: [
      {
        name: 'Applications',
        data: data.stages.map(item => ({
          x: item.name,
          y: item.count,
          fillColor: item.color,
        })),
      },
    ],
    colors: data.stages.map(item => item.color),
    xaxis: {
      type: 'category',
      labels: {
        style: {
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '11px',
        },
      },
    },
    grid: {
      borderColor: '#e7eef7',
      strokeDashArray: 4,
    },
    legend: {
      show: false,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} applications`,
      },
    },
  }

  return (
    <Card>
      <CardBody>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="card-title mb-0">Application Workflow Pipeline</h5>
          <div className="d-flex align-items-center">
            <span className="badge badge-soft-primary">Live Data</span>
          </div>
        </div>
        <p className="text-muted mb-3">
          Current distribution of applications across workflow stages
        </p>
        <ReactApexChart
          options={chartOptions}
          series={chartOptions.series}
          type="bar"
          height={350}
        />
        <div className="mt-3">
          <div className="row">
            <div className="col-sm-6">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="avatar-xs">
                    <div className="avatar-title bg-soft-success text-success rounded-circle fs-16">
                      <i className="bx bx-trending-up"></i>
                    </div>
                  </div>
                </div>
                <div className="flex-grow-1 ms-2">
                  <p className="text-muted mb-0">Avg. Processing Time</p>
                  <h6 className="mb-0">{data.avgProcessingTime} days</h6>
                </div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="avatar-xs">
                    <div className="avatar-title bg-soft-warning text-warning rounded-circle fs-16">
                      <i className="bx bx-time"></i>
                    </div>
                  </div>
                </div>
                <div className="flex-grow-1 ms-2">
                  <p className="text-muted mb-0">SLA Compliance</p>
                  <h6 className="mb-0">{data.slaCompliance}%</h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

export default WorkflowChart