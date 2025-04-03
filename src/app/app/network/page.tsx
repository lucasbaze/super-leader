'use client';

import { Loader } from '@/components/icons';
import { ActivityChart } from '@/components/network/activity-chart';
import { CompletenessOverview } from '@/components/network/completeness-overview';
import { NetworkHeader } from '@/components/network/network-header';
import { useNetworkActivity } from '@/hooks/use-network-activity';
import { useNetworkCompleteness } from '@/hooks/use-network-completeness';

// TOOD: Move the queries into the components
export default function NetworkPage() {
  const {
    data: completenessData,
    isLoading: isLoadingCompleteness,
    error: completenessError
  } = useNetworkCompleteness();
  const {
    data: activityData,
    isLoading: isLoadingActivity,
    error: activityError
  } = useNetworkActivity();

  return (
    <div className='absolute inset-0'>
      <NetworkHeader />
      <div className='absolute inset-0 top-[48px] mt-[1px] overflow-auto'>
        <div className='space-y-8 p-6'>
          {isLoadingCompleteness ? (
            <div className='flex h-64 items-center justify-center'>
              <Loader className='size-8 animate-spin text-muted-foreground' />
            </div>
          ) : completenessError ? (
            <div className='text-red-500'>Error loading network completeness data</div>
          ) : completenessData ? (
            <CompletenessOverview data={completenessData} />
          ) : null}

          <ActivityChart data={activityData} isLoading={isLoadingActivity} />

          {/* Additional network content will go here */}
          <div className='mt-8'>
            <i>Additional network metrics and visualizations will go here</i>
          </div>
        </div>
      </div>
    </div>
  );
}
