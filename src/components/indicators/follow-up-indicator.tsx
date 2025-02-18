import { useState } from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { useUpdateFollowUpScore } from '@/hooks/use-update-follow-up-score';
import { cn } from '@/lib/utils';

const getGradientColors = (value: number): string => {
  // Ensure value is between 0 and 1
  const clampedValue = Math.max(0, Math.min(1, value));

  // Define our color stops
  const colors = {
    green: 'rgb(34, 197, 94)', // tailwind green-500
    yellow: 'rgb(234, 179, 8)', // tailwind yellow-500
    red: 'rgb(239, 68, 68)' // tailwind red-500
  };

  if (clampedValue === 0) {
    // Pure green for 0
    return colors.green;
  } else if (clampedValue === 1) {
    // Pure red for 1
    return colors.red;
  } else if (clampedValue <= 0.5) {
    // Green to yellow transition (0-0.5)
    const percent = Math.pow(clampedValue / 0.25, 0.7) * 100;
    return `linear-gradient(135deg, ${colors.green} ${100 - percent}%, ${colors.yellow})`;
  } else {
    // Yellow to red transition (0.5-1)
    const percent = Math.pow((clampedValue - 0.5) / 0.25, 0.7) * 100;
    return `linear-gradient(135deg, ${colors.yellow} ${100 - percent}%, ${colors.red})`;
  }
};

const getSliderColor = (value: number): string => {
  if (value >= 0.7) return 'bg-red-500';
  if (value >= 0.4) return 'bg-yellow-500';
  return 'bg-green-500';
};

const sizeClasses = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-8'
};

type TFollowUpIndicatorProps = {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  personId?: string;
  editable?: boolean;
};

export function FollowUpIndicator({
  value,
  size = 'md',
  className,
  personId,
  editable = false
}: TFollowUpIndicatorProps) {
  const { mutate: updateScore, isPending } = useUpdateFollowUpScore();
  // Add state to track current slider value
  const [previewValue, setPreviewValue] = useState(value);

  const handleSliderChange = (newValue: number[]) => {
    if (!personId) return;
    updateScore({ personId, manualScore: newValue[0] });
  };

  // Update preview while sliding
  const handleSliderUpdate = (newValue: number[]) => {
    setPreviewValue(newValue[0]);
  };

  const indicator = (
    <div
      className={cn('rounded-full', sizeClasses[size], className)}
      style={{ background: getGradientColors(value) }}
      title={`Follow-up score: ${(value * 100).toFixed(0)}%`}
    />
  );

  if (!editable || !personId) {
    return indicator;
  }

  return (
    <Popover>
      <PopoverTrigger asChild disabled={isPending} className='cursor-pointer'>
        {indicator}
      </PopoverTrigger>
      <PopoverContent className='w-80 bg-background' sideOffset={5} style={{ zIndex: 1000 }}>
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h4 className='font-medium'>Follow-up</h4>
          </div>
          <div className='flex items-center gap-4'>
            <div className='flex-1'>
              <div
                style={{ background: getGradientColors(previewValue) }}
                className='h-2 rounded-full'>
                <Slider
                  defaultValue={[value]}
                  max={1}
                  min={0}
                  step={0.01}
                  onValueChange={handleSliderUpdate}
                  onValueCommit={handleSliderChange}
                  disabled={isPending}
                  className={cn(
                    'relative',
                    '[&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:bg-white',
                    '[&_[role=slider]]:border-2 [&_[role=slider]]:border-primary'
                  )}
                />
              </div>
            </div>
            <div
              className={cn('size-6 rounded-full')}
              style={{ background: getGradientColors(previewValue) }}
            />
          </div>
          <p className='text-sm text-muted-foreground'>
            Manually set the follow up indicator for now. Superleader will auto update this over
            time.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
