import React from 'react';
import { ApexOptions } from 'apexcharts';
import ReactApexChart from 'react-apexcharts';
import { Card } from 'react-bootstrap';
import { LoadingSpinner } from '@/components/ui/LoadingStates';

interface DatabasePerformanceChartProps {
  data: {
    timestamps: string[];
    simpleQueries: number[];
    complexQueries: number[];
    insertOperations: number[];
  };
  isLoading?: boolean;
}

export const DatabasePerformanceChart: React.FC<DatabasePerformanceChartProps> = ({ data, isLoading }) => {
  const chartOptions: ApexOptions = {
    chart: {
      type: 'area',
      height: 320,
      stacked: false,
      toolbar: {
        show: true
      }
    },
    colors: ['hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--danger))'],
    stroke: {
      width: [2, 2, 2],
      curve: 'smooth'
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0.1,
        stops: [0, 90, 100]
      }
    },
    series: [
      {
        name: 'Simple Select',
        data: data.simpleQueries
      },
      {
        name: 'Complex Query',
        data: data.complexQueries
      },
      {
        name: 'Insert Operation',
        data: data.insertOperations
      }
    ],
    xaxis: {
      categories: data.timestamps,
      type: 'datetime',
      labels: {
        datetimeUTC: false,
        format: 'HH:mm'
      }
    },
    yaxis: {
      title: {
        text: 'Query Time (ms)'
      },
      labels: {
        formatter: (value) => `${value.toFixed(0)}ms`
      }
    },
    grid: {
      borderColor: '#e7eef7',
      strokeDashArray: 4
    },
    markers: {
      size: 0
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right'
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value) => `${value.toFixed(2)} ms`
      }
    },
    annotations: {
      yaxis: [
        {
          y: 100,
          borderColor: 'hsl(var(--success))',
          strokeDashArray: 4,
          label: {
            text: 'Excellent: <100ms',
            style: {
              color: '#fff',
              background: 'hsl(var(--success))'
            }
          }
        }
      ]
    }
  };

  if (isLoading) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <LoadingSpinner />
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <h6 className="mb-0">Database Query Performance</h6>
      </Card.Header>
      <Card.Body>
        <ReactApexChart
          options={chartOptions}
          series={chartOptions.series}
          type="area"
          height={320}
        />
      </Card.Body>
    </Card>
  );
};
