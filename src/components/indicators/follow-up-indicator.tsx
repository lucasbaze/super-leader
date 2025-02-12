import { cn } from '@/lib/utils';

type TFollowUpIndicatorProps = {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

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

const sizeClasses = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-8'
};

export function FollowUpIndicator({ value, size = 'md', className }: TFollowUpIndicatorProps) {
  return (
    <div
      className={cn('rounded-full', sizeClasses[size], className)}
      style={{
        background: getGradientColors(value)
      }}
      title={`Follow-up score: ${Math.round(value * 100)}%`}
    />
  );
}
