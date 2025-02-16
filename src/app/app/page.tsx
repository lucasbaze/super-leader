'use client';

import { HomeHeader } from '@/components/home/home-header';

export default function HomePage() {
  return (
    <div className='absolute inset-0'>
      <div className='mb-4 flex flex-col rounded-t-md border-b bg-background'>
        <HomeHeader />
      </div>
      <div className='absolute inset-0 top-[48px] mt-[1px]'>
        {/* Content will go here */}
        <div className='p-4'>
          <i>Home page content will go here</i>
        </div>
      </div>
    </div>
  );
}
