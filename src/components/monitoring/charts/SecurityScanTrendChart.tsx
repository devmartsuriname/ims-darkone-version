import React from 'react';
import { ApexOptions } from 'apexcharts';
import ReactApexChart from 'react-apexcharts';
import { Card } from 'react-bootstrap';
import { LoadingSpinner } from '@/components/ui/LoadingStates';

interface SecurityScanTrendChartProps {
  data: {
    timestamps: string[];
    criticalIssues: number[];
    highIssues: number[];
    mediumIssues: number[];
    lowIssues: number[];
  };
  isLoading?: boolean;
}

export const SecurityScanTrendChart: React.FC<SecurityScanTrendChartProps> = ({ data, isLoading }) => {
  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 320,
      stacked: true,
      toolbar: {
        show: true
      }
    },
    colors: ['hsl(var(--danger))', 'hsl(var(--warning))', 'hsl(var(--info))', 'hsl(var(--secondary))'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 3
      }
    },
    series: [
      {
        name: 'Critical',
        data: data.criticalIssues
      },
      {
        name: 'High',
        data: data.highIssues
      },
      {
        name: 'Medium',
        data: data.mediumIssues
      },
      {
        name: 'Low',
        data: data.lowIssues
      }
    ],
    xaxis: {
      categories: data.timestamps,
      type: 'datetime',
      labels: {
        datetimeUTC: false,
        format: 'dd MMM'
      }
    },
    yaxis: {
      title: {
        text: 'Number of Issues'
      },
      labels: {
        formatter: (value) => Math.floor(value).toString()
      }
    },
    grid: {
      borderColor: '#e7eef7',
      strokeDashArray: 4
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
        formatter: (value) => `${value} issues`
      }
    },
    dataLabels: {
      enabled: false
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
        <h6 className="mb-0">Security Scan Trends</h6>
      </Card.Header>
      <Card.Body>
        <ReactApexChart
          options={chartOptions}
          series={chartOptions.series}
          type="bar"
          height={320}
        />
      </Card.Body>
    </Card>
  );
};
