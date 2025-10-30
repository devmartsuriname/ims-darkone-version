import React, { useMemo } from 'react';
import { Card } from 'react-bootstrap';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { LoadingSpinner } from '@/components/ui/LoadingStates';

interface PerformanceMetricsChartProps {
  data: {
    categories: string[];
    submitted: number[];
    processed: number[];
    approved: number[];
  };
  isLoading?: boolean;
  timeRange: '7d' | '14d' | '30d';
  onTimeRangeChange: (range: '7d' | '14d' | '30d') => void;
}

export const PerformanceMetricsChart: React.FC<PerformanceMetricsChartProps> = ({
  data,
  isLoading = false,
  timeRange,
  onTimeRangeChange,
}) => {
  const chartOptions: ApexOptions = useMemo(() => ({
    chart: {
      height: 280,
      type: 'area',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: [
      'hsl(var(--primary))',
      'hsl(var(--success))',
      'hsl(var(--warning))',
    ],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      type: 'gradient',
      gradient: {
        type: 'vertical',
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    grid: {
      borderColor: '#e7eef7',
      strokeDashArray: 4,
      xaxis: {
        lines: { show: false },
      },
      yaxis: {
        lines: { show: true },
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 10,
      },
    },
    xaxis: {
      categories: data.categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: '#8c98a4',
          fontSize: '11px',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#8c98a4',
          fontSize: '11px',
        },
        formatter: (val) => Math.round(val).toString(),
      },
      min: 0,
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'center',
      fontSize: '12px',
      fontFamily: 'inherit',
      itemMargin: {
        horizontal: 10,
        vertical: 0,
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val) => `${Math.round(val)} applications`,
      },
    },
  }), [data.categories]);

  const series = useMemo(() => [
    {
      name: 'Submitted',
      data: data.submitted,
    },
    {
      name: 'Processed',
      data: data.processed,
    },
    {
      name: 'Approved',
      data: data.approved,
    },
  ], [data.submitted, data.processed, data.approved]);

  return (
    <Card>
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Application Trends</h6>
          <div className="btn-group btn-group-sm" role="group">
            <button
              type="button"
              className={`btn ${timeRange === '7d' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => onTimeRangeChange('7d')}
            >
              7D
            </button>
            <button
              type="button"
              className={`btn ${timeRange === '14d' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => onTimeRangeChange('14d')}
            >
              14D
            </button>
            <button
              type="button"
              className={`btn ${timeRange === '30d' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => onTimeRangeChange('30d')}
            >
              30D
            </button>
          </div>
        </div>
      </Card.Header>
      <Card.Body>
        {isLoading ? (
          <div className="text-center py-5">
            <LoadingSpinner />
          </div>
        ) : (
          <ReactApexChart
            options={chartOptions}
            series={series}
            type="area"
            height={280}
          />
        )}
      </Card.Body>
    </Card>
  );
};
