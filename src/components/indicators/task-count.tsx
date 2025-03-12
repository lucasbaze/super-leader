import { cn } from '@/lib/utils';

interface TaskCountProps {
  count: number;
  size?: 'sm' | 'md';
}

export function TaskCount({ count, size = 'sm' }: TaskCountProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-medium',
        size === 'sm' ? 'size-4 text-xs' : 'size-5 text-sm',
        count > 0 ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'
      )}>
      {count}
    </div>
  );
}
