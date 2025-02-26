'use client';

import { NetworkHeader } from '@/components/network/network-header';

export default function NetworkPage() {
  return (
    <div className='absolute inset-0'>
      <NetworkHeader />
      <div className='absolute inset-0 top-[48px] mt-[1px]'>
        {/* Content will go here */}
        <div className='p-4'>
          <i>Network page content will go here</i>
        </div>
      </div>
    </div>
  );
}
