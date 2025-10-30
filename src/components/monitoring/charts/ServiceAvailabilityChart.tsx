import React from 'react';
import { ApexOptions } from 'apexcharts';
import ReactApexChart from 'react-apexcharts';
import { Card } from 'react-bootstrap';
import { LoadingSpinner } from '@/components/ui/LoadingStates';

interface ServiceAvailabilityChartProps {
  data: {
    timestamps: string[];
    authUptime: number[];
    storageUptime: number[];
    databaseUptime: number[];
  };
  isLoading?: boolean;
}

export const ServiceAvailabilityChart: React.FC<ServiceAvailabilityChartProps> = ({ data, isLoading }) => {
  const chartOptions: ApexOptions = {
    chart: {
      type: 'area',
      height: 320,
      stacked: false,
      toolbar: {
        show: true
      }
    },
    colors: ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--info))'],
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
        name: 'Auth Service',
        data: data.authUptime
      },
      {
        name: 'Storage Service',
        data: data.storageUptime
      },
      {
        name: 'Database',
        data: data.databaseUptime
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
      min: 90,
      max: 100,
      title: {
        text: 'Availability (%)'
      },
      labels: {
        formatter: (value) => `${value.toFixed(1)}%`
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
        formatter: (value) => `${value.toFixed(2)}%`
      }
    },
    annotations: {
      yaxis: [
        {
          y: 99,
          borderColor: 'hsl(var(--success))',
          strokeDashArray: 4,
          label: {
            text: 'Target: 99%',
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
        <h6 className="mb-0">Service Availability</h6>
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
