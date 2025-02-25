'use client';

import { ContextHeader } from '@/components/context/context-header';

export default function ContextPage() {
  return (
    <div className='absolute inset-0'>
      <div className='mb-4 flex flex-col rounded-t-md border-b bg-background'>
        <ContextHeader />
      </div>
      <div className='absolute inset-0 top-[48px] mt-[1px]'>
        {/* Content will go here */}
        <div className='p-4'>
          <i>Context page content will go here</i>
        </div>
      </div>
    </div>
  );
}
