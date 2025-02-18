'use client';

import { ListFilter } from '@/components/icons';
import { Button } from '@/components/ui/button';

export function NetworkHeader() {
  return (
    <div className='flex items-center justify-between px-5 py-2'>
      <div className='flex items-center gap-3'>
        <h2 className='text-lg font-semibold'>Network</h2>
      </div>

      <div className='flex items-center gap-2'>
        <Button variant='outline' size='sm'>
          <ListFilter className='mr-2 size-4' />
          Filter
        </Button>
      </div>
    </div>
  );
}
