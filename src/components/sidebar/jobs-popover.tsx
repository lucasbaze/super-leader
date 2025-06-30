'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useRealtimeRunsWithTag } from '@trigger.dev/react-hooks';
import { toast } from 'sonner';

import { BrainCog, Loader } from '@/components/icons';
import { ActionPlanNotifier } from '@/components/notifiers/jobs/action-plan-notifier';
import { SyncLinkedInConnectionsJobNotifier } from '@/components/notifiers/jobs/sync-linkedin-connections-notifier';
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

// Define the error type from the hook
type TriggerError = {
  status?: number;
  message?: string;
};

export function JobsPopover({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [tokenError, setTokenError] = useState<boolean>(false);
  const [isLoadingToken, setIsLoadingToken] = useState<boolean>(true);
  const executingRuns = useRef(new Set<string>());
  const router = useRouter();

  // Function to fetch the token
  const fetchToken = async () => {
    setIsLoadingToken(true);
    setTokenError(false);

    try {
      const response = await fetch('/api/trigger/token');

      if (!response.ok) {
        throw new Error(`Failed to fetch token: ${response.status}`);
      }

      const data = await response.json();

      if (data.data?.token) {
        setToken(data.data.token);
        setTokenError(false);
      } else {
        throw new Error('Token not found in response');
      }
    } catch (error) {
      console.error('Failed to fetch trigger token:', error);
      setTokenError(true);
    } finally {
      setIsLoadingToken(false);
    }
  };

  // Initial token fetch
  useEffect(() => {
    fetchToken();
  }, []);

  // Set up token refresh interval (every 10 minutes)
  useEffect(() => {
    const refreshInterval = setInterval(
      () => {
        fetchToken();
      },
      10 * 60 * 1000
    ); // 10 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  const { runs, error: runsError } = useRealtimeRunsWithTag(`user:${userId}`, {
    accessToken: token,
    enabled: !!token
  });

  // Handle token errors from the hook
  useEffect(() => {
    if (runsError) {
      console.error('Error with runs subscription:', runsError);
      // If we get a 409 error (likely token expired), refresh the token
      const triggerError = runsError as TriggerError;
      if (triggerError.status === 409) {
        fetchToken();
      }
    }
  }, [runsError]);

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
        queryClient.invalidateQueries({
          queryKey: [
            'person',
            run.payload.personId,
            'about',
            { withContactMethods: true, withAddresses: true, withWebsites: true, withGroups: true }
          ]
        });
        queryClient.invalidateQueries({
          queryKey: ['network-completeness']
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
          {hasExecutingJobs ? <Loader className='size-5 animate-spin' /> : <BrainCog className='size-5' />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[24rem] p-0' align='end' side='bottom'>
        <div className='border-b px-4 py-3'>
          <h4 className='font-medium'>Background AI Tasks</h4>
        </div>
        <div className='max-h-[28rem] overflow-y-auto'>
          {isLoadingToken ? (
            <div className='p-4 text-center text-sm text-muted-foreground'>
              <Loader className='mx-auto size-5 animate-spin' />
              <p className='mt-2'>Connecting to background jobs...</p>
            </div>
          ) : tokenError ? (
            <div className='p-4 text-center text-sm text-muted-foreground'>
              <p>Failed to connect to background jobs.</p>
              <Button variant='outline' size='sm' className='mt-2' onClick={() => fetchToken()}>
                Retry
              </Button>
            </div>
          ) : runs?.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).length ? (
            runs.map((run) => {
              if (run.taskIdentifier === JOBS.UPDATE_AI_SUMMARY) {
                return <UpdateAISummaryJobNotifier key={run.id} run={run} onClick={() => handleRunClick(run)} />;
              }
              if (run.taskIdentifier === JOBS.SYNC_LINKEDIN_CONTACTS) {
                return <SyncLinkedInConnectionsJobNotifier key={run.id} run={run} />;
              }
              if (run.taskIdentifier === JOBS.GENERATE_ACTION_PLAN) {
                return <ActionPlanNotifier key={run.id} run={run} onClick={() => setIsOpen(false)} />;
              }
              return null;
            })
          ) : (
            <div className='p-4 text-center text-sm text-muted-foreground'>No background AI tasks run this session</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
