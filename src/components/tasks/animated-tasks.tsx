'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { ListTodo } from '@/components/icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTasks } from '@/hooks/use-tasks';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';

type AnimatedTasksRendererProps = {
  router: ReturnType<typeof useRouter>;
  completedCount: number;
};

export function AnimatedTasksRenderer({ router, completedCount }: AnimatedTasksRendererProps) {
  // Keep track of the old value for difference calculation
  const oldValue = useRef<number>(completedCount);
  const [showingDifference, setShowingDifference] = useState(false);

  // Update animations when count changes
  useEffect(() => {
    if (completedCount !== oldValue.current) {
      // Show difference
      setShowingDifference(true);

      // Reset showing difference and update old value after delay
      setTimeout(() => {
        setShowingDifference(false);
        oldValue.current = completedCount;
      }, 5000);
    }
  }, [completedCount]);

  const difference = completedCount - oldValue.current;
  const isIncrease = difference > 0;

  return (
    <div className='flex items-center gap-2'>
      <div
        onClick={() => router.push(routes.home())}
        className='flex cursor-pointer items-center rounded-full border bg-background px-2 py-1.5'>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='mr-1 cursor-pointer rounded-2xl bg-muted p-1'>
                <ListTodo className='size-4 text-muted-foreground' />
              </div>
            </TooltipTrigger>
            <TooltipContent
              className='w-80 rounded-md border bg-popover p-4 text-popover-foreground shadow-md'
              sideOffset={10}
              align='center'
              side='bottom'>
              <div className='space-y-2'>
                <h4 className='mb-1 font-medium'>Tasks Completed Today</h4>
                <p className='text-sm text-muted-foreground'>The number of tasks you've completed for today.</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className='relative'>
          <motion.div
            className={cn(
              'flex items-center gap-1 rounded-full',
              showingDifference && isIncrease && 'animate-glow-green',
              showingDifference && !isIncrease && difference !== 0 && 'animate-glow-red'
            )}
            animate={{
              scale: showingDifference && difference !== 0 ? [1, 1.2, 1] : 1
            }}
            transition={{ duration: 0.5 }}>
            <div className='flex items-center'>
              <div className='w-[2ch]'>
                <AnimatePresence mode='wait'>
                  <motion.span
                    key={showingDifference ? 'difference' : 'value'}
                    initial={{ opacity: 0, y: showingDifference ? 10 : -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: showingDifference ? -10 : 10 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      'inline-block text-right text-sm font-medium tabular-nums',
                      showingDifference && isIncrease && 'text-emerald-500',
                      showingDifference && !isIncrease && difference !== 0 && 'text-red-500'
                    )}>
                    {showingDifference && difference !== 0 ? (
                      <>
                        {isIncrease ? '+' : ''}
                        {difference}
                      </>
                    ) : (
                      completedCount
                    )}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Container component that handles data fetching
export function AnimatedTasks() {
  const router = useRouter();
  const { data: tasks } = useTasks(undefined, 'this-week');

  if (!tasks) return null;

  // Filter to get only completed tasks for today
  const todayCompletedCount = tasks.filter(
    (task) => task.completedAt && task.completedAt.startsWith(new Date().toISOString().split('T')[0])
  ).length;

  return <AnimatedTasksRenderer router={router} completedCount={todayCompletedCount} />;
}
