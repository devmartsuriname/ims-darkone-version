import { ApexOptions } from 'apexcharts'
import ReactApexChart from 'react-apexcharts'
import { Card, CardBody } from 'react-bootstrap'

const WorkflowChart = () => {

  // Workflow stages data
  const workflowData = [
    { name: 'Draft', count: 45, color: '#e9ecef' },
    { name: 'Intake Review', count: 32, color: '#ffc107' },
    { name: 'Control Assigned', count: 28, color: '#fd7e14' },
    { name: 'Control Visit', count: 23, color: '#0dcaf0' },
    { name: 'Technical Review', count: 18, color: '#6f42c1' },
    { name: 'Social Review', count: 15, color: '#d63384' },
    { name: 'Director Review', count: 12, color: '#198754' },
    { name: 'Minister Decision', count: 8, color: '#dc3545' },
    { name: 'Approved', count: 6, color: '#20c997' },
  ]

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
        data: workflowData.map(item => ({
          x: item.name,
          y: item.count,
          fillColor: item.color,
        })),
      },
    ],
    colors: workflowData.map(item => item.color),
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
                  <h6 className="mb-0">14.5 days</h6>
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
                  <h6 className="mb-0">89.3%</h6>
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