import React, { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { ChartCard } from '@/components/ui/ChartCard';

interface StatusDistributionChartProps {
  data: {
    labels: string[];
    values: number[];
    colors: string[];
  };
  isLoading?: boolean;
}

export const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({
  data,
  isLoading = false,
}) => {
  const chartOptions: ApexOptions = useMemo(() => ({
    chart: {
      type: 'donut',
      height: 280,
    },
    labels: data.labels,
    colors: data.colors,
    legend: {
      show: true,
      position: 'bottom',
      fontSize: '12px',
      fontFamily: 'inherit',
      itemMargin: {
        horizontal: 8,
        vertical: 4,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontFamily: 'inherit',
              color: '#373d3f',
            },
            value: {
              show: true,
              fontSize: '24px',
              fontFamily: 'inherit',
              color: '#373d3f',
              fontWeight: 600,
              formatter: (val) => val.toString(),
            },
            total: {
              show: true,
              label: 'Total',
              fontSize: '12px',
              color: '#8c98a4',
              formatter: (w) => {
                const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                return total.toString();
              },
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} applications`,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            height: 300,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  }), [data.labels, data.colors]);

  const total = useMemo(() => 
    data.values.reduce((sum, val) => sum + val, 0), 
    [data.values]
  );

  return (
    <ChartCard
      title="Status Distribution"
      subtitle={`${total} applications`}
      borderColor="success"
      icon="solar:pie-chart-2-broken"
      loading={isLoading}
    >
      {total === 0 ? (
        <div className="text-center py-5 text-muted">
          <p className="mb-0">No applications to display</p>
        </div>
      ) : (
        <ReactApexChart
          options={chartOptions}
          series={data.values}
          type="donut"
          height={280}
        />
      )}
    </ChartCard>
  );
};
