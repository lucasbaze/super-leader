'use client';

import { Loader } from '@/components/icons';
import { CompletenessOverview } from '@/components/network/completeness-overview';
import { NetworkHeader } from '@/components/network/network-header';
import { useNetworkCompleteness } from '@/hooks/use-network-completeness';

export default function NetworkPage() {
  const { data, isLoading, error } = useNetworkCompleteness();

  return (
    <div className='absolute inset-0'>
      <NetworkHeader />
      <div className='absolute inset-0 top-[48px] mt-[1px] overflow-auto'>
        <div className='p-6'>
          {isLoading ? (
            <div className='flex h-64 items-center justify-center'>
              <Loader className='size-8 animate-spin text-muted-foreground' />
            </div>
          ) : error ? (
            <div className='text-red-500'>Error loading network completeness data</div>
          ) : data ? (
            <CompletenessOverview data={data} />
          ) : null}

          {/* Additional network content will go here */}
          <div className='mt-8'>
            <i>Additional network metrics and visualizations will go here</i>
          </div>
        </div>
      </div>
    </div>
  );
}
