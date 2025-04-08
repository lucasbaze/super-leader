'use client';

import { BaseHeader } from '@/components/headers/base-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function PersonLayoutSkeleton() {
  return (
    <div className='absolute inset-0'>
      {/* Fixed Header Section */}
      <BaseHeader className='flex flex-1 items-center justify-between'>
        <div className='flex items-center gap-2 pr-2 text-sm font-semibold text-muted-foreground'>
          <Skeleton className='h-5 w-32' />
        </div>
        <div className='flex items-center gap-2 pr-4'>
          <Button variant='outline' size='sm' disabled>
            <Skeleton className='mr-2 size-4' />
            Update Summary
          </Button>
        </div>
      </BaseHeader>

      {/* Main Content with Sidebar */}
      <div className='absolute inset-0 top-[48px]'>
        <div className='grid h-full grid-cols-3 overflow-hidden'>
          {/* Main Content Area */}
          <div className='col-span-2 h-full overflow-hidden'>
            {/* Person Header Skeleton */}
            <div className='border-b bg-background px-6 py-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  {/* Avatar */}
                  <Skeleton className='size-10 rounded-full' />
                  <div className='space-y-2'>
                    {/* <Skeleton className='h-8 w-48 bg-gray-200' /> */}
                    {/* Tag Pills */}
                    <div className='flex gap-2'>
                      <Skeleton className='h-6 w-16 rounded-full' />
                    </div>
                  </div>
                </div>
                {/* <div className='flex gap-2'>
                  <Skeleton className='h-9 w-24 rounded-md bg-gray-200' />
                  <Skeleton className='h-9 w-24 rounded-md bg-gray-200' />
                </div> */}
              </div>
              {/* Navigation Tabs */}
              <div className='mt-2 flex gap-4'>
                <Skeleton className='rounded-t-l h-6 w-24' />
              </div>
            </div>

            {/* Content Area Skeleton */}
            <div className='flex h-full flex-col overflow-hidden'></div>
          </div>

          {/* Sidebar Skeleton */}
          <div className='flex h-full flex-col overflow-hidden border-l bg-gray-100'>
            <div className='no-scrollbar flex-1 overflow-y-auto px-4 py-6'></div>
          </div>
        </div>
      </div>
    </div>
  );
}
