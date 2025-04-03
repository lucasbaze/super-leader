'use client';

import { useState } from 'react';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import { PulseLoader } from '@/components/animated/pulse-loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Switch } from '@/components/ui/switch';
import { NetworkActivityData } from '@/services/network/get-network-activity';

type ActivityChartProps = {
  data?: NetworkActivityData;
  isLoading?: boolean;
  className?: string;
};

const chartConfig = {
  inner5: {
    label: 'Inner 5',
    color: 'hsl(var(--chart-1))'
  },
  central50: {
    label: 'Central 50',
    color: 'hsl(var(--chart-2))'
  },
  strategic100: {
    label: 'Strategic 100',
    color: 'hsl(var(--chart-3))'
  },
  everyone: {
    label: 'Everyone Else',
    color: 'hsl(var(--chart-4))'
  }
} satisfies ChartConfig;

// Generate mock data for the placeholder visualization
const generateMockData = () => {
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  });

  return dates.map((date) => ({
    date,
    inner5: Math.floor(Math.random() * 10),
    central50: Math.floor(Math.random() * 10),
    strategic100: Math.floor(Math.random() * 10),
    everyone: Math.floor(Math.random() * 10)
  }));
};

export function ActivityChart({ data, isLoading, className }: ActivityChartProps) {
  const [showPreviousPeriod, setShowPreviousPeriod] = useState(false);
  const [visibleSeries, setVisibleSeries] = useState<Set<string>>(
    new Set(['inner5', 'central50', 'strategic100', 'everyone'])
  );

  const toggleSeries = (series: string) => {
    const newVisible = new Set(visibleSeries);
    if (newVisible.has(series)) {
      newVisible.delete(series);
    } else {
      newVisible.add(series);
    }
    setVisibleSeries(newVisible);
  };

  const mockData = generateMockData();
  const hasRealData = data && data.totalActivities > 0;
  const chartData = hasRealData
    ? data.currentPeriod.dates.map((date, index) => ({
        date,
        inner5: visibleSeries.has('inner5') ? data.currentPeriod.inner5[index] : 0,
        central50: visibleSeries.has('central50') ? data.currentPeriod.central50[index] : 0,
        strategic100: visibleSeries.has('strategic100')
          ? data.currentPeriod.strategic100[index]
          : 0,
        everyone: visibleSeries.has('everyone') ? data.currentPeriod.everyone[index] : 0
      }))
    : mockData;

  console.log('Network::ActivityChart::ChartData', chartData);

  return (
    <div className={className}>
      <div className='mb-6'>
        <h2 className='text-lg font-semibold'>Activity Overview</h2>
        <p className='text-sm text-muted-foreground'>
          This is pulling all interactions across your network
        </p>
      </div>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle className='text-base'>Activity over last 7 days</CardTitle>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>Compare to last period</span>
            <Switch
              checked={showPreviousPeriod}
              onCheckedChange={setShowPreviousPeriod}
              disabled={!hasRealData}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className='h-[300px] w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0
                }}>
                <defs>
                  {Object.entries(chartConfig).map(([key, { color }]) => (
                    <linearGradient key={key} id={`gradient-${key}`} x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor={color} stopOpacity={0.8} />
                      <stop offset='95%' stopColor={color} stopOpacity={0.1} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid
                  strokeDasharray='3 3'
                  vertical={false}
                  className='text-muted-foreground/20'
                />
                <XAxis
                  dataKey='date'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className='text-muted-foreground/50'
                  fontSize={12}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className='text-muted-foreground/50'
                  fontSize={12}
                />
                <Tooltip content={<ChartTooltipContent config={chartConfig} />} cursor={false} />
                {Object.entries(chartConfig).map(([key, { color }]) => (
                  <Area
                    key={key}
                    type='natural'
                    dataKey={key}
                    stackId='1'
                    stroke={color}
                    fill={`url(#gradient-${key})`}
                    fillOpacity={0.4}
                    strokeWidth={1.5}
                    className={!hasRealData ? 'opacity-30' : ''}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className='mt-6 flex flex-wrap gap-4'>
            {Object.entries(chartConfig).map(([key, { label, color }]) => (
              <button
                key={key}
                onClick={() => hasRealData && toggleSeries(key)}
                disabled={!hasRealData}
                className={`flex items-center gap-2 text-sm transition-opacity ${
                  !hasRealData
                    ? 'text-muted-foreground'
                    : visibleSeries.has(key)
                      ? 'opacity-100'
                      : 'opacity-40'
                }`}>
                <div
                  className={`h-3 w-3 rounded-full ${!hasRealData ? 'opacity-30' : ''}`}
                  style={{ backgroundColor: color }}
                />
                {label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
