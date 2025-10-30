import React from 'react';
import { ApexOptions } from 'apexcharts';
import ReactApexChart from 'react-apexcharts';
import { Card } from 'react-bootstrap';
import { LoadingSpinner } from '@/components/ui/LoadingStates';

interface AlertFrequencyChartProps {
  data: {
    timestamps: string[];
    criticalAlerts: number[];
    warningAlerts: number[];
    infoAlerts: number[];
  };
  isLoading?: boolean;
}

export const AlertFrequencyChart: React.FC<AlertFrequencyChartProps> = ({ data, isLoading }) => {
  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 320,
      stacked: true,
      toolbar: {
        show: true
      }
    },
    colors: ['hsl(var(--danger))', 'hsl(var(--warning))', 'hsl(var(--info))'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        borderRadius: 3
      }
    },
    series: [
      {
        name: 'Critical',
        data: data.criticalAlerts
      },
      {
        name: 'Warning',
        data: data.warningAlerts
      },
      {
        name: 'Info',
        data: data.infoAlerts
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
        text: 'Number of Alerts'
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
        formatter: (value) => `${value} alerts`
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
        <h6 className="mb-0">Alert Frequency by Severity</h6>
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
