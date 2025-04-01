'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { Info, OneRing, ThreeRing, TwoRing } from '@/components/icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNetworkCompleteness } from '@/hooks/use-network-completeness';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';

type RingData = {
  icon: React.ReactNode;
  value: number;
  oldValue: number;
  peopleCount: number;
};

type AnimatedRingsProps = {
  router: ReturnType<typeof useRouter>;
  inner5Score: number;
  central50Score: number;
  strategic100Score: number;
};

export function AnimatedRings({
  router,
  inner5Score,
  central50Score,
  strategic100Score
}: AnimatedRingsProps) {
  // Keep track of the old values for difference calculation
  const oldValues = useRef<{ [key: string]: number }>({
    inner5: inner5Score,
    central50: central50Score,
    strategic100: strategic100Score
  });

  // Track which rings are currently showing their difference
  const [showingDifference, setShowingDifference] = useState<{ [key: string]: boolean }>({
    inner5: false,
    central50: false,
    strategic100: false
  });

  // Update animations when scores change
  useEffect(() => {
    const newShowingDifference = { ...showingDifference };
    let hasChanges = false;

    // Check each ring for changes
    if (inner5Score !== oldValues.current.inner5) {
      newShowingDifference.inner5 = true;
      hasChanges = true;
    }
    if (central50Score !== oldValues.current.central50) {
      newShowingDifference.central50 = true;
      hasChanges = true;
    }
    if (strategic100Score !== oldValues.current.strategic100) {
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
          inner5: inner5Score,
          central50: central50Score,
          strategic100: strategic100Score
        };
      }, 5000);
    }
  }, [inner5Score, central50Score, strategic100Score]);

  const rings: RingData[] = [
    {
      icon: <OneRing className='size-6' />,
      value: inner5Score,
      oldValue: oldValues.current.inner5,
      peopleCount: 5
    },
    {
      icon: <TwoRing className='size-6' />,
      value: central50Score,
      oldValue: oldValues.current.central50,
      peopleCount: 50
    },
    {
      icon: <ThreeRing className='size-6' />,
      value: strategic100Score,
      oldValue: oldValues.current.strategic100,
      peopleCount: 100
    }
  ];

  const getRingKey = (index: number) => {
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

  return (
    <div className='flex items-center gap-2'>
      <div
        onClick={() => router.push(routes.network.root())}
        className='flex cursor-pointer items-center gap-2 rounded-full border bg-background px-3 py-1.5'>
        {rings.map((ring, index) => {
          const ringKey = getRingKey(index);
          const isShowingDifference = showingDifference[ringKey];
          const difference = ring.value - ring.oldValue;
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
                      <div className='flex cursor-pointer items-center gap-1'>{ring.icon}</div>
                    </TooltipTrigger>
                    <TooltipContent side='bottom' className='text-sm'>
                      Average of {ring.peopleCount} people
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className='flex items-center'>
                  <div className='w-[4ch]'>
                    <AnimatePresence mode='wait'>
                      <motion.span
                        key={isShowingDifference ? 'difference' : 'value'}
                        initial={{ opacity: 0, y: isShowingDifference ? 10 : -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: isShowingDifference ? -10 : 10 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          'inline-block text-right text-sm font-medium tabular-nums',
                          isShowingDifference && isIncrease && 'text-green-500',
                          isShowingDifference && !isIncrease && difference !== 0 && 'text-red-500'
                        )}>
                        {isShowingDifference && difference !== 0 ? (
                          <>
                            {isIncrease ? '+' : ''}
                            {difference}
                          </>
                        ) : (
                          ring.value
                        )}
                      </motion.span>
                    </AnimatePresence>
                    <span className='text-sm font-medium'> %</span>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className='size-4 cursor-pointer text-muted-foreground' />
          </TooltipTrigger>
          <TooltipContent
            className='w-80 rounded-md border bg-popover p-4 text-popover-foreground shadow-md'
            sideOffset={10}
            align='center'
            side='bottom'>
            <div className='space-y-2'>
              <h4 className='mb-1 font-medium'>Key Groups Overview</h4>
              <p className='text-sm text-muted-foreground'>
                This is the average profile completeness for folks in your Key Groups. This is
                calculated by Superleader AI based on the saved notes and interactions.
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

// Container component that handles data fetching
export function NetworkRings() {
  const router = useRouter();
  const { data } = useNetworkCompleteness();

  if (!data) return null;

  return (
    <AnimatedRings
      router={router}
      inner5Score={data.inner5.completeness_score}
      central50Score={data.central50.completeness_score}
      strategic100Score={data.strategic100.completeness_score}
    />
  );
}
