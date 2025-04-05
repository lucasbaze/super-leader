'use client';

import { useState } from 'react';

import { Loader } from '@/components/icons';
import { ActivityChart } from '@/components/network/activity-chart';
import { CompletenessOverview } from '@/components/network/completeness-overview';
import { NetworkHeader } from '@/components/network/network-header';
import { SplitActivityDiagrams } from '@/components/network/split-activity-diagrams';
import { useNetworkCompleteness } from '@/hooks/use-network-completeness';

// TOOD: Move the queries into the components
export default function NetworkPage() {
  const {
    data: completenessData,
    isLoading: isLoadingCompleteness,
    error: completenessError
  } = useNetworkCompleteness();

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

          <div className='pt-8'>
            <SplitActivityDiagrams />
          </div>
          {/* <div className='mt-8'>
            <i>Additional network metrics and visualizations will go here</i>
          </div> */}
        </div>
      </div>
    </div>
  );
}
