'use client';

import { TooltipProps } from 'recharts';

export type ChartConfig = {
  [key: string]: {
    label: string;
    color: string;
    icon?: string;
  };
};

type ChartContainerProps = {
  children: React.ReactNode;
  config: ChartConfig;
  className?: string;
};

export function ChartContainer({ children, config, className }: ChartContainerProps) {
  return (
    <div className={className}>
      {children}
      <style jsx global>{`
        :root {
          ${Object.entries(config)
            .map(([key, { color }]) => `--color-${key}: ${color};`)
            .join('\n')}
        }
      `}</style>
    </div>
  );
}

type ChartTooltipContentProps = {
  active?: boolean;
  payload?: any[];
  config?: ChartConfig;
};

export function ChartTooltipContent({ active, payload, config: chartConfig }: ChartTooltipContentProps) {
  if (!active || !payload || !chartConfig) return null;

  return (
    <div className='relative z-50 rounded-lg border bg-background p-2 shadow-sm'>
      <div className='grid gap-2'>
        {payload.map((entry: any) => {
          const configKey = entry.dataKey.replace('Previous', '');
          const seriesConfig = chartConfig[configKey];
          if (!seriesConfig) return null;

          return (
            <div key={entry.dataKey} className='flex items-center gap-2'>
              <div className='size-2 rounded-full' style={{ backgroundColor: seriesConfig.color }} />
              <span className='text-sm font-medium'>
                {seriesConfig.label}
                {entry.dataKey.endsWith('Previous') ? ' (Previous)' : ''}
              </span>
              <span className='text-sm text-muted-foreground'>{entry.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ChartTooltip({ content, ...props }: TooltipProps<any, any>) {
  return content;
}
