import React, { useMemo } from 'react';
import { ApexOptions } from 'apexcharts';
import ReactApexChart from 'react-apexcharts';
import { Card } from 'react-bootstrap';
import { LoadingSpinner } from '@/components/ui/LoadingStates';

interface ResourceUsageTrendChartProps {
  data: {
    timestamps: string[];
    cpuUsage: number[];
    memoryUsage: number[];
    diskUsage: number[];
  };
  isLoading?: boolean;
}

export const ResourceUsageTrendChart: React.FC<ResourceUsageTrendChartProps> = ({ data, isLoading }) => {
  const chartOptions: ApexOptions = useMemo(() => ({
    chart: {
      type: 'area',
      height: 320,
      toolbar: {
        show: true
      },
      zoom: {
        enabled: true
      }
    },
    stroke: {
      width: [2, 2, 2],
      curve: 'smooth'
    },
    colors: ['hsl(var(--primary))', 'hsl(var(--warning))', 'hsl(var(--danger))'],
    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.4,
        opacityTo: 0.1
      }
    },
    series: [
      {
        name: 'CPU Usage',
        data: data.cpuUsage
      },
      {
        name: 'Memory Usage',
        data: data.memoryUsage
      },
      {
        name: 'Disk Usage',
        data: data.diskUsage
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
      min: 0,
      max: 100,
      title: {
        text: 'Usage %'
      },
      labels: {
        formatter: (value) => `${value.toFixed(0)}%`
      }
    },
    grid: {
      borderColor: '#e7eef7',
      strokeDashArray: 4
    },
    markers: {
      size: 0,
      hover: {
        size: 5
      }
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
        formatter: (value) => `${value.toFixed(1)}%`
      }
    },
    annotations: {
      yaxis: [
        {
          y: 80,
          borderColor: 'hsl(var(--warning))',
          strokeDashArray: 4,
          label: {
            text: 'Warning: 80%',
            style: {
              color: '#fff',
              background: 'hsl(var(--warning))'
            }
          }
        },
        {
          y: 90,
          borderColor: 'hsl(var(--danger))',
          strokeDashArray: 4,
          label: {
            text: 'Critical: 90%',
            style: {
              color: '#fff',
              background: 'hsl(var(--danger))'
            }
          }
        }
      ]
    }
  }), [data]);

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
        <h6 className="mb-0">Resource Usage Trends</h6>
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
