'use client';

import { Users } from '@/components/icons';
import { IconMap } from '@/lib/ui/icon-map';
import { cn } from '@/lib/utils';

type CompletionCardProps = {
  title: string;
  subtitle: string;
  percentage: number;
  icon: string;
  className?: string;
  variant?: 'default' | 'horizontal';
};

export function CompletionCard({
  title,
  subtitle,
  percentage,
  icon,
  className,
  variant = 'default'
}: CompletionCardProps) {
  // Calculate color based on percentage
  const getColor = (value: number) => {
    if (value >= 66) return 'text-green-500';
    if (value >= 33) return 'text-amber-500';
    return 'text-red-500';
  };

  // Calculate stroke color for the circle
  const getStrokeColor = (value: number) => {
    if (value >= 66) return 'stroke-green-500';
    if (value >= 33) return 'stroke-amber-500';
    return 'stroke-red-500';
  };

  // Calculate the circle path
  const isHorizontal = variant === 'horizontal';
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  if (isHorizontal) {
    return (
      <div
        className={cn(
          'flex min-w-48 items-center justify-between rounded-lg border p-3',
          className
        )}>
        <div className='flex flex-col'>
          <div className='mb-1 flex items-center gap-2'>
            <div className='text-lg font-bold'>{title}</div>
            {icon && IconMap[icon] ? IconMap[icon]({ size: 4 }) : <Users className='size-4' />}
          </div>
          <div className='text-xs text-muted-foreground'>{subtitle}</div>
        </div>

        <div className='relative flex h-16 w-16 flex-shrink-0 items-center justify-center'>
          {/* Background circle */}
          <svg className='absolute h-full w-full' viewBox='0 0 100 100'>
            <circle
              cx='50'
              cy='50'
              r={radius}
              fill='transparent'
              stroke='currentColor'
              strokeWidth='7'
              className='text-gray-200'
            />
          </svg>

          {/* Foreground circle */}
          <svg className='absolute h-full w-full -rotate-90' viewBox='0 0 100 100'>
            <circle
              cx='50'
              cy='50'
              r={radius}
              fill='transparent'
              stroke='currentColor'
              strokeWidth='7'
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap='round'
              className={getStrokeColor(percentage)}
            />
          </svg>

          {/* Percentage text */}
          <div className={cn('text-sm font-bold', getColor(percentage))}>{percentage}%</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex min-w-48 flex-col rounded-lg border p-3', className)}>
      <div className='mb-1 flex items-center justify-between gap-2'>
        <div className='text-lg font-bold'>{title}</div>
        {icon && IconMap[icon] ? IconMap[icon]({ size: 5 }) : <Users className='size-5' />}
      </div>
      <div className='mb-4 text-xs text-muted-foreground'>{subtitle}</div>

      <div className='relative mx-auto flex h-24 w-24 items-center justify-center'>
        {/* Background circle */}
        <svg className='absolute h-full w-full' viewBox='0 0 100 100'>
          <circle
            cx='50'
            cy='50'
            r={radius}
            fill='transparent'
            stroke='currentColor'
            strokeWidth='7'
            className='text-gray-200'
          />
        </svg>

        {/* Foreground circle */}
        <svg className='absolute h-full w-full -rotate-90' viewBox='0 0 100 100'>
          <circle
            cx='50'
            cy='50'
            r={radius}
            fill='transparent'
            stroke='currentColor'
            strokeWidth='7'
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap='round'
            className={getStrokeColor(percentage)}
          />
        </svg>

        {/* Percentage text */}
        <div className={cn('text-xl font-bold', getColor(percentage))}>{percentage}%</div>
      </div>
    </div>
  );
}
