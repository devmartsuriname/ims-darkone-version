import { ApexOptions } from 'apexcharts'
import ReactApexChart from 'react-apexcharts'
import { Card, CardBody, CardHeader, Col } from 'react-bootstrap'
import { useChartData } from '@/hooks/useChartData'
import Spinner from '@/components/Spinner'

const Chart = () => {
  const { chartData, isLoading, error } = useChartData()

  if (isLoading) {
    return (
      <Col lg={12}>
        <Card className="card-height-100">
          <CardBody className="d-flex align-items-center justify-content-center">
            <Spinner />
          </CardBody>
        </Card>
      </Col>
    )
  }

  if (error) {
    return (
      <Col lg={12}>
        <Card className="card-height-100">
          <CardBody className="d-flex align-items-center justify-content-center">
            <div className="text-muted">Error loading chart data: {error}</div>
          </CardBody>
        </Card>
      </Col>
    )
  }

  const salesChart: ApexOptions = {
    series: [
      {
        name: 'Applications Submitted',
        type: 'bar',
        data: chartData.map(item => item.submitted),
      },
      {
        name: 'Applications Processed',
        type: 'area',
        data: chartData.map(item => item.processed),
      },
      {
        name: 'Applications Approved',
        type: 'area',
        data: chartData.map(item => item.approved),
      },
    ],
    chart: {
      height: 330,
      type: 'line',
      toolbar: {
        show: false,
      },
    },
    stroke: {
      dashArray: [0, 0, 2],
      width: [0, 2, 2],
      curve: 'smooth',
    },
    fill: {
      opacity: [1, 0.8, 0.6],
      type: ['solid', 'gradient', 'gradient'],
      gradient: {
        type: 'vertical',
        inverseColors: false,
        opacityFrom: 0.5,
        opacityTo: 0,
        stops: [0, 90],
      },
    },
    markers: {
      size: [0, 4, 4],
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    xaxis: {
      categories: chartData.map(item => item.month),
      axisTicks: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
    },
    yaxis: {
      min: 0,
      axisBorder: {
        show: false,
      },
    },
    grid: {
      show: true,
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
      padding: {
        top: 0,
        right: -2,
        bottom: 10,
        left: 10,
      },
    },
    legend: {
      show: true,
      horizontalAlign: 'center',
      offsetX: 0,
      offsetY: 5,
      itemMargin: {
        horizontal: 10,
        vertical: 0,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: '30%',
        barHeight: '70%',
        borderRadius: 3,
      },
    },
    colors: ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--info))'],
    tooltip: {
      shared: true,
      y: [
        {
          formatter: function (y) {
            if (typeof y !== 'undefined') {
              return y.toString() + ' applications'
            }
            return y
          },
        },
        {
          formatter: function (y) {
            if (typeof y !== 'undefined') {
              return y.toString() + ' applications'
            }
            return y
          },
        },
        {
          formatter: function (y) {
            if (typeof y !== 'undefined') {
              return y.toString() + ' applications'
            }
            return y
          },
        },
      ],
    },
  }

  return (
    <Col lg={12}>
      <Card className="card-height-100">
        <CardHeader className="d-flex align-items-center justify-content-between gap-2">
          <h4 className="mb-0 flex-grow-1">Subsidy Application Analytics</h4>
          <div>
            <button type="button" className="btn btn-sm btn-outline-light">
              ALL
            </button>
            <button type="button" className="btn btn-sm btn-outline-light">
              3M
            </button>
            <button type="button" className="btn btn-sm btn-outline-light">
              6M
            </button>
            <button type="button" className="btn btn-sm btn-outline-light active">
              1Y
            </button>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div dir="ltr">
            <div id="dash-performance-chart" className="apex-charts">
              <ReactApexChart 
                options={salesChart} 
                series={salesChart.series} 
                height={313} 
                type="area" 
                className="apex-charts" 
              />
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
  )
}

export default Chart
