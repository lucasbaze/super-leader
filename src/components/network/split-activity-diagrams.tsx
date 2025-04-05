import { useEffect, useRef, useState } from 'react';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { PulseLoader } from '@/components/animated/pulse-loader';
import { MoveRight, TrendingDown, TrendingUp } from '@/components/icons';
import { Card, CardContent } from '@/components/ui/card';
import { ChartConfig, ChartTooltipContent } from '@/components/ui/chart';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip as LucideTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useNetworkActivity } from '@/hooks/use-network-activity';
import { IconMap } from '@/lib/ui/icon-map';
import { cn } from '@/lib/utils';
import { NetworkActivityData } from '@/services/network/get-network-activity';

type SparkChartProps = {
  data: { date: string; value: number; previous?: number }[];
  color: string;
  isLoading?: boolean;
  showPrevious?: boolean;
  title: string;
  subtitle: string;
  icon?: string;
  className?: string;
  variant?: 'default' | 'horizontal';
};

function calculateTrendPercentage(current: number[], previous: number[]): number {
  const currentTotal = current.reduce((sum, val) => sum + val, 0);
  const previousTotal = previous.reduce((sum, val) => sum + val, 0);

  if (previousTotal === 0) return 0;
  return ((currentTotal - previousTotal) / previousTotal) * 100;
}

function SparkChart({
  data,
  color,
  isLoading,
  showPrevious,
  title,
  subtitle,
  icon,
  className,
  variant = 'default'
}: SparkChartProps) {
  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.value, showPrevious && d.previous ? d.previous : 0))
  );

  // Calculate trend percentage
  const currentValues = data.map((d) => d.value);
  const previousValues = data.map((d) => d.previous || 0);
  const trendPercentage = calculateTrendPercentage(currentValues, previousValues);
  const hasTrend = showPrevious && data.length > 0;
  const totalInteractions = currentValues.reduce((sum, val) => sum + val, 0);

  // Create a safe ID for the gradient by removing spaces and special characters
  const gradientId = `gradient-${title.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

  return (
    <Card className={cn(className, 'relative shadow-none')}>
      <CardContent className={variant === 'horizontal' ? 'flex items-center gap-4 p-4' : 'p-4'}>
        <div
          className={
            variant === 'horizontal' ? 'flex-1' : 'mb-2 flex items-center justify-between'
          }>
          <div>
            <div className='flex items-center gap-1'>
              <h3 className='text-sm font-medium'>{title}</h3>
              {icon && IconMap[icon]({ size: 4 })}
              {variant === 'horizontal' && (
                <TooltipProvider delayDuration={0}>
                  <LucideTooltip>
                    <TooltipTrigger asChild>
                      <div className='ml-12 text-sm font-medium'>{totalInteractions}</div>
                    </TooltipTrigger>
                    <TooltipContent className='max-w-xs'>
                      <p>Total interactions for the period</p>
                    </TooltipContent>
                  </LucideTooltip>
                </TooltipProvider>
              )}
            </div>
            <p className='text-xs text-muted-foreground'>{subtitle}</p>
          </div>
          {variant === 'default' && (
            <TooltipProvider delayDuration={0}>
              <LucideTooltip>
                <TooltipTrigger asChild>
                  <div className='absolute right-4 top-4 text-sm font-medium'>
                    {totalInteractions}
                  </div>
                </TooltipTrigger>
                <TooltipContent className='max-w-xs'>
                  <p>Total interactions for the period</p>
                </TooltipContent>
              </LucideTooltip>
            </TooltipProvider>
          )}
        </div>
        <div
          className={cn(
            'relative w-full',
            variant === 'horizontal' ? 'h-[80px] flex-1' : 'h-[100px]'
          )}>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart
              data={data}
              margin={{ top: 5, right: 5, left: -20, bottom: hasTrend ? 20 : 0 }}>
              <defs>
                <linearGradient id={gradientId} x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='0%' stopColor={color} stopOpacity={0.2} />
                  <stop offset='100%' stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey='date'
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
                interval={'preserveStartEnd'}
                className='text-muted-foreground/50'
              />
              <YAxis type='number' domain={[0, maxValue > 0 ? 'auto' : 1]} hide />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const data = payload[0].payload;
                  if (!data) return null;

                  return (
                    <div className='rounded-lg border bg-background p-2 shadow-md'>
                      <p className='mb-1 text-xs font-medium'>{data.date}</p>
                      <div className='space-y-0.5'>
                        <p className='text-xs'>
                          Current: <span className='font-medium'>{data.value}</span>
                        </p>
                        {showPrevious && typeof data.previous === 'number' && (
                          <p className='text-xs text-muted-foreground'>
                            Previous: <span className='font-medium'>{data.previous}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  );
                }}
                cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              {showPrevious && (
                <Area
                  type='monotone'
                  dataKey='previous'
                  stroke={color}
                  strokeOpacity={0.3}
                  fill='none'
                  strokeDasharray='3 3'
                />
              )}
              <Area type='monotone' dataKey='value' stroke={color} fill={`url(#${gradientId})`} />
            </AreaChart>
          </ResponsiveContainer>
          {hasTrend && (
            <div className='absolute bottom-0 left-0 flex items-center gap-1 text-xs text-muted-foreground'>
              <span className='flex items-center gap-1'>
                {trendPercentage === 0 ? (
                  <MoveRight className='size-3' />
                ) : trendPercentage > 0 ? (
                  <TrendingUp className='size-3 text-emerald-500' />
                ) : (
                  <TrendingDown className='size-3 text-red-500' />
                )}
                <span>
                  <span
                    className={cn(
                      'font-medium',
                      trendPercentage > 0 && 'text-emerald-500',
                      trendPercentage < 0 && 'text-red-500'
                    )}>
                    {Math.abs(trendPercentage).toFixed(1)}%
                  </span>{' '}
                  vs. last period
                </span>
              </span>
            </div>
          )}
          {isLoading && (
            <div className='bg-background/50 absolute inset-0 flex items-center justify-center'>
              <PulseLoader className='size-8 text-muted-foreground' />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

type SplitActivityDiagramsRendererProps = {
  data?: NetworkActivityData;
  isLoading?: boolean;
  className?: string;
  onTimeFrameChange?: (days: number) => void;
};

const chartConfig = {
  inner5: {
    title: 'Inner 5',
    subtitle: 'Your Closest family',
    color: 'var(--chart-1)',
    icon: '5'
  },
  central50: {
    title: 'Central 50',
    subtitle: 'Your strongest allies',
    color: 'var(--chart-2)',
    icon: '50'
  },
  strategic100: {
    title: 'Strategic 100',
    subtitle: 'Your long term partnerships',
    color: 'var(--chart-3)',
    icon: '100'
  },
  everyone: {
    title: 'Everyone Else',
    subtitle: 'Your extended network',
    color: 'var(--chart-4)',
    icon: ''
  }
} as const;

export function SplitActivityDiagramsRenderer({
  data,
  isLoading,
  className,
  onTimeFrameChange
}: SplitActivityDiagramsRendererProps) {
  const [showPreviousPeriod, setShowPreviousPeriod] = useState(true);
  const [timeFrame, setTimeFrame] = useState<string>('7');
  const containerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<'full' | 'medium' | 'small'>('full');

  // Function to determine layout based on container width
  const updateLayout = () => {
    if (!containerRef.current) return;

    const width = containerRef.current.offsetWidth;

    if (width < 550) {
      setLayout('small');
    } else if (width < 800) {
      setLayout('medium');
    } else {
      setLayout('full');
    }
  };

  // Set up resize observer to watch container size changes
  useEffect(() => {
    if (!containerRef.current) return;

    updateLayout();

    const resizeObserver = new ResizeObserver(() => {
      updateLayout();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const hasRealData = data && data.totalActivities > 0;

  const processedData = {
    inner5:
      data?.currentPeriod.dates.map((date, i) => ({
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        value: data.currentPeriod.inner5[i],
        previous: data.previousPeriod.inner5[i]
      })) || [],
    central50:
      data?.currentPeriod.dates.map((date, i) => ({
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        value: data.currentPeriod.central50[i],
        previous: data.previousPeriod.central50[i]
      })) || [],
    strategic100:
      data?.currentPeriod.dates.map((date, i) => ({
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        value: data.currentPeriod.strategic100[i],
        previous: data.previousPeriod.strategic100[i]
      })) || [],
    everyone:
      data?.currentPeriod.dates.map((date, i) => ({
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        value: data.currentPeriod.everyone[i],
        previous: data.previousPeriod.everyone[i]
      })) || []
  };

  return (
    <div ref={containerRef} className={className}>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h2 className='text-lg font-semibold'>Activity Overview</h2>
          <p className='text-sm text-muted-foreground'>
            This is pulling all interactions across your network
          </p>
        </div>
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
      </div>

      {layout === 'full' && (
        <div className='space-y-3'>
          <div className='grid grid-cols-3 gap-3'>
            <SparkChart
              data={processedData.inner5}
              title={chartConfig.inner5.title}
              subtitle={chartConfig.inner5.subtitle}
              color={chartConfig.inner5.color}
              icon={chartConfig.inner5.icon}
              showPrevious={showPreviousPeriod}
              isLoading={isLoading}
            />
            <SparkChart
              data={processedData.central50}
              title={chartConfig.central50.title}
              subtitle={chartConfig.central50.subtitle}
              color={chartConfig.central50.color}
              icon={chartConfig.central50.icon}
              showPrevious={showPreviousPeriod}
              isLoading={isLoading}
            />
            <SparkChart
              data={processedData.strategic100}
              title={chartConfig.strategic100.title}
              subtitle={chartConfig.strategic100.subtitle}
              color={chartConfig.strategic100.color}
              icon={chartConfig.strategic100.icon}
              showPrevious={showPreviousPeriod}
              isLoading={isLoading}
            />
          </div>
          <SparkChart
            data={processedData.everyone}
            title={chartConfig.everyone.title}
            subtitle={chartConfig.everyone.subtitle}
            color={chartConfig.everyone.color}
            icon={chartConfig.everyone.icon}
            showPrevious={showPreviousPeriod}
            isLoading={isLoading}
            variant='horizontal'
            className='w-full'
          />
        </div>
      )}

      {layout === 'medium' && (
        <div className='grid grid-cols-2 gap-3'>
          <SparkChart
            data={processedData.inner5}
            title={chartConfig.inner5.title}
            subtitle={chartConfig.inner5.subtitle}
            color={chartConfig.inner5.color}
            icon={chartConfig.inner5.icon}
            showPrevious={showPreviousPeriod}
            isLoading={isLoading}
          />
          <SparkChart
            data={processedData.central50}
            title={chartConfig.central50.title}
            subtitle={chartConfig.central50.subtitle}
            color={chartConfig.central50.color}
            icon={chartConfig.central50.icon}
            showPrevious={showPreviousPeriod}
            isLoading={isLoading}
          />
          <SparkChart
            data={processedData.strategic100}
            title={chartConfig.strategic100.title}
            subtitle={chartConfig.strategic100.subtitle}
            color={chartConfig.strategic100.color}
            icon={chartConfig.strategic100.icon}
            showPrevious={showPreviousPeriod}
            isLoading={isLoading}
          />
          <SparkChart
            data={processedData.everyone}
            title={chartConfig.everyone.title}
            subtitle={chartConfig.everyone.subtitle}
            color={chartConfig.everyone.color}
            icon={chartConfig.everyone.icon}
            showPrevious={showPreviousPeriod}
            isLoading={isLoading}
          />
        </div>
      )}

      {layout === 'small' && (
        <div className='flex flex-col gap-3'>
          <SparkChart
            data={processedData.inner5}
            title={chartConfig.inner5.title}
            subtitle={chartConfig.inner5.subtitle}
            color={chartConfig.inner5.color}
            icon={chartConfig.inner5.icon}
            showPrevious={showPreviousPeriod}
            isLoading={isLoading}
          />
          <SparkChart
            data={processedData.central50}
            title={chartConfig.central50.title}
            subtitle={chartConfig.central50.subtitle}
            color={chartConfig.central50.color}
            icon={chartConfig.central50.icon}
            showPrevious={showPreviousPeriod}
            isLoading={isLoading}
          />
          <SparkChart
            data={processedData.strategic100}
            title={chartConfig.strategic100.title}
            subtitle={chartConfig.strategic100.subtitle}
            color={chartConfig.strategic100.color}
            icon={chartConfig.strategic100.icon}
            showPrevious={showPreviousPeriod}
            isLoading={isLoading}
          />
          <SparkChart
            data={processedData.everyone}
            title={chartConfig.everyone.title}
            subtitle={chartConfig.everyone.subtitle}
            color={chartConfig.everyone.color}
            icon={chartConfig.everyone.icon}
            showPrevious={showPreviousPeriod}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
}

export function SplitActivityDiagrams() {
  const [timeFrame, setTimeFrame] = useState(7);
  const {
    data: activityData,
    isLoading: isLoadingActivity,
    error: activityError
  } = useNetworkActivity(timeFrame);

  return (
    <SplitActivityDiagramsRenderer
      data={activityData}
      isLoading={isLoadingActivity}
      onTimeFrameChange={setTimeFrame}
    />
  );
}
