'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { useRealtimeRunsWithTag } from '@trigger.dev/react-hooks';
import { toast } from 'sonner';

import { BrainCog, Loader } from '@/components/icons';
import { UpdateAISummaryJobNotifier } from '@/components/notifiers/jobs/update-ai-summary-notifier';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { JOBS } from '@/lib/jobs/constants';
import { routes } from '@/lib/routes';

type Run = {
  id: string;
  status: string;
  taskIdentifier: string;
  payload: any;
  createdAt: Date;
  updatedAt: Date;
};

export function JobsPopover({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);
  const executingRuns = useRef(new Set<string>());
  const router = useRouter();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch('/api/trigger/token');
        const data = await response.json();
        if (data.data?.token) {
          setToken(data.data.token);
        }
      } catch (error) {
        console.error('Failed to fetch trigger token:', error);
      }
    };

    fetchToken();
  }, []);

  const { runs } = useRealtimeRunsWithTag(`user:${userId}`, {
    accessToken: token,
    enabled: !!token
  });

  const hasExecutingJobs = runs?.some((run) => run.status === 'EXECUTING');

  const handleRunClick = (run: Run) => {
    if (run.taskIdentifier === JOBS.UPDATE_AI_SUMMARY) {
      router.push(routes.person.summary({ id: run.payload.personId }));
    }
  };

  // Track executing runs and show notifications only for completed transitions
  useEffect(() => {
    if (!runs) return;

    runs.forEach((run) => {
      // Track new executing runs
      if (run.status === 'EXECUTING') {
        executingRuns.current.add(run.id);
      }
      // Check for completed runs that were previously executing
      else if (
        run.status === 'COMPLETED' &&
        executingRuns.current.has(run.id) &&
        run.taskIdentifier === JOBS.UPDATE_AI_SUMMARY
      ) {
        executingRuns.current.delete(run.id);
        toast('Summary Update Complete', {
          description: `Updated ${run.payload.personName}'s Summary`,
          position: 'top-right',
          duration: Infinity,
          closeButton: true,
          action: {
            label: 'View Update',
            onClick: () => handleRunClick(run)
          }
        });
      }
      // Clean up failed or other status runs
      else {
        executingRuns.current.delete(run.id);
      }
    });
  }, [runs, router]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon' className='relative'>
          {hasExecutingJobs ? (
            <Loader className='size-5 animate-spin' />
          ) : (
            <BrainCog className='size-5' />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[24rem] p-0' align='end' side='bottom'>
        <div className='border-b px-4 py-3'>
          <h4 className='font-medium'>Background AI Tasks</h4>
        </div>
        <div className='max-h-[28rem] overflow-y-auto'>
          {token ? (
            runs?.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).length ? (
              runs.map((run) => {
                if (run.taskIdentifier === JOBS.UPDATE_AI_SUMMARY) {
                  return (
                    <UpdateAISummaryJobNotifier
                      key={run.id}
                      run={run}
                      onClick={() => handleRunClick(run)}
                    />
                  );
                }
                return null;
              })
            ) : (
              <div className='p-4 text-center text-sm text-muted-foreground'>
                No background AI tasks run this session
              </div>
            )
          ) : (
            <div className='p-4 text-center text-sm text-muted-foreground'>
              Uh oh... failed to connect to background jobs. Please refresh the page.
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// function UnreadBadge({
//   userId,
//   seenRuns,
//   token
// }: {
//   userId: string;
//   seenRuns: Set<string>;
//   token: string;
// }) {
//   const { runs } = useRealtimeRunsWithTag(`user:${userId}`, {
//     accessToken: token
//   });

//   const unreadCount = runs?.filter((run) => !seenRuns.has(run.id)).length ?? 0;

//   if (unreadCount === 0) return null;

//   return (
//     <span className='absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground'>
//       {unreadCount}
//     </span>
//   );
// }
