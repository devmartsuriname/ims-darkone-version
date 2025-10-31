import React, { useMemo } from 'react';
import { ApexOptions } from 'apexcharts';
import ReactApexChart from 'react-apexcharts';
import { Card } from 'react-bootstrap';
import { LoadingSpinner } from '@/components/ui/LoadingStates';

interface ResponseTimeTrendChartProps {
  data: {
    timestamps: string[];
    authTimes: number[];
    storageTimes: number[];
    databaseTimes: number[];
  };
  isLoading?: boolean;
}

export const ResponseTimeTrendChart: React.FC<ResponseTimeTrendChartProps> = ({ data, isLoading }) => {
  const chartOptions: ApexOptions = useMemo(() => ({
    chart: {
      type: 'line',
      height: 320,
      toolbar: {
        show: true,
        tools: {
          download: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: false,
          reset: true
        }
      },
      zoom: {
        enabled: true
      }
    },
    stroke: {
      width: [3, 3, 3],
      curve: 'smooth'
    },
    colors: ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--info))'],
    series: [
      {
        name: 'Auth Service',
        data: data.authTimes
      },
      {
        name: 'Storage Service',
        data: data.storageTimes
      },
      {
        name: 'Database',
        data: data.databaseTimes
      }
    ],
    xaxis: {
      categories: data.timestamps,
      type: 'category',
      labels: {
        rotate: -45,
        rotateAlways: false
      }
    },
    yaxis: {
      title: {
        text: 'Response Time (ms)'
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
        formatter: (value) => `${value.toFixed(2)} ms`
      }
    },
    annotations: {
      yaxis: [
        {
          y: 500,
          borderColor: 'hsl(var(--warning))',
          strokeDashArray: 4,
          label: {
            text: 'Warning Threshold',
            style: {
              color: '#fff',
              background: 'hsl(var(--warning))'
            }
          }
        },
        {
          y: 1000,
          borderColor: 'hsl(var(--danger))',
          strokeDashArray: 4,
          label: {
            text: 'Critical Threshold',
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
        <h6 className="mb-0">Response Time Trends</h6>
      </Card.Header>
      <Card.Body>
        <ReactApexChart
          options={chartOptions}
          series={chartOptions.series}
          type="line"
          height={320}
        />
      </Card.Body>
    </Card>
  );
};
