'use client';

import { useState } from 'react';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { PulseLoader } from '@/components/animated/pulse-loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartTooltipContent } from '@/components/ui/chart';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNetworkActivity } from '@/hooks/use-network-activity';
import { IconMap } from '@/lib/ui/icon-map';
import { NetworkActivityData } from '@/services/network/get-network-activity';

type ActivityBarChartRendererProps = {
  data?: NetworkActivityData;
  isLoading?: boolean;
  className?: string;
  onTimeFrameChange?: (days: number) => void;
};

const chartConfig = {
  inner5: {
    label: 'Inner 5',
    color: 'var(--chart-1)',
    icon: '5'
  },
  central50: {
    label: 'Central 50',
    color: 'var(--chart-2)',
    icon: '50'
  },
  strategic100: {
    label: 'Strategic 100',
    color: 'var(--chart-3)',
    icon: '100'
  },
  everyone: {
    label: 'Everyone Else',
    color: 'var(--chart-4)',
    icon: ''
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

export function ActivityBarChartRenderer({
  data,
  isLoading,
  className,
  onTimeFrameChange
}: ActivityBarChartRendererProps) {
  const [showPreviousPeriod, setShowPreviousPeriod] = useState(false);
  const [timeFrame, setTimeFrame] = useState<string>('7');
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
        everyone: visibleSeries.has('everyone') ? data.currentPeriod.everyone[index] : 0,
        ...(showPreviousPeriod && {
          inner5Previous: data.previousPeriod.inner5[index],
          central50Previous: data.previousPeriod.central50[index],
          strategic100Previous: data.previousPeriod.strategic100[index],
          everyonePrevious: data.previousPeriod.everyone[index]
        })
      }))
    : mockData;

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
          <CardTitle className='text-base'>Activity over last {timeFrame} days</CardTitle>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-muted-foreground'>Compare to last period</span>
              <Switch
                checked={showPreviousPeriod}
                onCheckedChange={setShowPreviousPeriod}
                disabled={!hasRealData}
              />
            </div>
            <div className='border-l pl-4'>
              <Tabs
                value={timeFrame}
                onValueChange={(value) => {
                  setTimeFrame(value);
                  onTimeFrameChange?.(parseInt(value, 10));
                }}
                className='w-[200px]'>
                <TabsList className='grid w-full grid-cols-2'>
                  <TabsTrigger value='7'>7 Days</TabsTrigger>
                  <TabsTrigger value='30'>30 Days</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='relative h-[300px] w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0
                }}>
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
                {hasRealData && (
                  <Tooltip
                    content={<ChartTooltipContent config={chartConfig} />}
                    cursor={false}
                    wrapperStyle={{ zIndex: 100 }}
                  />
                )}
                {Object.entries(chartConfig).map(([key, { color }]) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    stackId='current'
                    fill={color}
                    className={
                      !visibleSeries.has(key) ? 'opacity-0' : !hasRealData ? 'opacity-30' : ''
                    }
                  />
                ))}
                {showPreviousPeriod &&
                  hasRealData &&
                  Object.entries(chartConfig).map(([key, { color }]) => (
                    <Bar
                      key={`${key}Previous`}
                      dataKey={`${key}Previous`}
                      stackId='previous'
                      fill={color}
                      fillOpacity={0.3}
                      className={!visibleSeries.has(key) ? 'opacity-0' : ''}
                    />
                  ))}
              </BarChart>
            </ResponsiveContainer>
            {!hasRealData && (
              <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
                {isLoading ? (
                  <div className='flex flex-col items-center gap-2'>
                    <PulseLoader className='size-12 text-muted-foreground' />
                    <p className='text-lg font-medium text-muted-foreground'>Loading data...</p>
                  </div>
                ) : (
                  <p className='text-lg font-medium text-muted-foreground'>Awaiting Activity</p>
                )}
              </div>
            )}
          </div>

          <div className='mt-6 flex flex-wrap gap-4'>
            {Object.entries(chartConfig).map(([key, { label, color, icon }]) => (
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
                  className={`size-3 rounded-full ${!hasRealData ? 'opacity-30' : ''}`}
                  style={{ backgroundColor: color }}
                />
                <span className='flex items-center gap-1'>
                  {label}
                  {icon && IconMap[icon]({ size: 4 })}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ActivityBarChart() {
  const [timeFrame, setTimeFrame] = useState(7);
  const {
    data: activityData,
    isLoading: isLoadingActivity,
    error: activityError
  } = useNetworkActivity(timeFrame);

  return (
    <ActivityBarChartRenderer
      data={activityData}
      isLoading={isLoadingActivity}
      onTimeFrameChange={setTimeFrame}
    />
  );
}
