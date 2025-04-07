'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { Activity, OneRing, ThreeRing, TwoRing } from '@/components/icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTodaysActivity } from '@/hooks/use-todays-activity';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';

type ActivityData = {
  icon: React.ReactNode;
  value: number;
  oldValue: number;
  people: { name: string }[];
};

type AnimatedActivityRendererProps = {
  router: ReturnType<typeof useRouter>;
  inner5Count: number;
  inner5People: { name: string }[];
  central50Count: number;
  central50People: { name: string }[];
  strategic100Count: number;
  strategic100People: { name: string }[];
};

export function AnimatedActivityRenderer({
  router,
  inner5Count,
  inner5People,
  central50Count,
  central50People,
  strategic100Count,
  strategic100People
}: AnimatedActivityRendererProps) {
  // Keep track of the old values for difference calculation
  const oldValues = useRef<{ [key: string]: number }>({
    inner5: inner5Count,
    central50: central50Count,
    strategic100: strategic100Count
  });

  // Track which counts are currently showing their difference
  const [showingDifference, setShowingDifference] = useState<{ [key: string]: boolean }>({
    inner5: false,
    central50: false,
    strategic100: false
  });

  // Update animations when counts change
  useEffect(() => {
    const newShowingDifference = { ...showingDifference };
    let hasChanges = false;

    // Check each count for changes
    if (inner5Count !== oldValues.current.inner5) {
      newShowingDifference.inner5 = true;
      hasChanges = true;
    }
    if (central50Count !== oldValues.current.central50) {
      newShowingDifference.central50 = true;
      hasChanges = true;
    }
    if (strategic100Count !== oldValues.current.strategic100) {
      newShowingDifference.strategic100 = true;
      hasChanges = true;
    }

    if (hasChanges) {
      // Show differences
      setShowingDifference(newShowingDifference);

      // Reset showing difference and update old values after delay
      setTimeout(() => {
        setShowingDifference({
          inner5: false,
          central50: false,
          strategic100: false
        });
        // Update old values after animation completes
        oldValues.current = {
          inner5: inner5Count,
          central50: central50Count,
          strategic100: strategic100Count
        };
      }, 5000);
    }
  }, [inner5Count, central50Count, strategic100Count]);

  const activities: ActivityData[] = [
    {
      icon: <OneRing className='size-6' />,
      value: inner5Count,
      oldValue: oldValues.current.inner5,
      people: inner5People
    },
    {
      icon: <TwoRing className='size-6' />,
      value: central50Count,
      oldValue: oldValues.current.central50,
      people: central50People
    },
    {
      icon: <ThreeRing className='size-6' />,
      value: strategic100Count,
      oldValue: oldValues.current.strategic100,
      people: strategic100People
    }
  ];

  const getActivityKey = (index: number) => {
    switch (index) {
      case 0:
        return 'inner5';
      case 1:
        return 'central50';
      case 2:
        return 'strategic100';
      default:
        return '';
    }
  };

  console.log(activities);

  return (
    <div className='flex items-center gap-2'>
      <div
        onClick={() => router.push(routes.network.root())}
        className='flex cursor-pointer items-center rounded-full border bg-background px-2 py-1.5'>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='mr-1 cursor-pointer rounded-2xl bg-muted p-1'>
                <Activity className='size-4 text-muted-foreground' />
              </div>
            </TooltipTrigger>
            <TooltipContent
              className='w-80 rounded-md border bg-popover p-4 text-popover-foreground shadow-md'
              sideOffset={10}
              align='center'
              side='bottom'>
              <div className='space-y-2'>
                <h4 className='mb-1 font-medium'>Activity Overview</h4>
                <p className='text-sm text-muted-foreground'>
                  This is pulling all interactions recorded over the time period. Emphasis on
                  engagement and activity with our core groups of individuals.
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {activities.map((activity, index) => {
          const activityKey = getActivityKey(index);
          const isShowingDifference = showingDifference[activityKey];
          const difference = activity.value - activity.oldValue;
          const isIncrease = difference > 0;

          return (
            <div key={index} className='relative'>
              <motion.div
                className={cn(
                  'flex items-center gap-1 rounded-full',
                  isShowingDifference && isIncrease && 'animate-glow-green',
                  isShowingDifference && !isIncrease && difference !== 0 && 'animate-glow-red'
                )}
                animate={{
                  scale: isShowingDifference && difference !== 0 ? [1, 1.2, 1] : 1
                }}
                transition={{ duration: 0.5 }}>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className='flex cursor-pointer items-center gap-1'>{activity.icon}</div>
                    </TooltipTrigger>
                    <TooltipContent side='bottom' className='text-sm'>
                      <div className='flex flex-col gap-1'>
                        {activity.people.length > 0 ? (
                          <>
                            <p className='text-sm font-medium'>Interactions with:</p>
                            {activity.people.map((person, index) => (
                              <div key={index}>{person.name}</div>
                            ))}
                          </>
                        ) : (
                          <p className='text-sm font-medium'>No interactions</p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className='flex items-center'>
                  <div className='w-[3ch]'>
                    <AnimatePresence mode='wait'>
                      <motion.span
                        key={isShowingDifference ? 'difference' : 'value'}
                        initial={{ opacity: 0, y: isShowingDifference ? 10 : -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: isShowingDifference ? -10 : 10 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          'inline-block text-right text-sm font-medium tabular-nums',
                          isShowingDifference && isIncrease && 'text-emerald-500',
                          isShowingDifference && !isIncrease && difference !== 0 && 'text-red-500'
                        )}>
                        {isShowingDifference && difference !== 0 ? (
                          <>
                            {isIncrease ? '+' : ''}
                            {difference}
                          </>
                        ) : (
                          activity.value
                        )}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Container component that handles data fetching
export function AnimatedActivity() {
  const router = useRouter();
  const { data } = useTodaysActivity();

  if (!data) return null;

  return (
    <AnimatedActivityRenderer
      router={router}
      inner5Count={data.inner5.count}
      inner5People={data.inner5.people}
      central50Count={data.central50.count}
      central50People={data.central50.people}
      strategic100Count={data.strategic100.count}
      strategic100People={data.strategic100.people}
    />
  );
}
