'use client';

import React from 'react';

import { BaseHeader } from '@/components/headers/base-header';
import { Users } from '@/components/icons';
import { ImportCSVButton } from '@/components/people/import-csv-button';

interface PeopleHeaderProps {
  peopleCount: number;
}

export function PeopleHeader({ peopleCount }: PeopleHeaderProps) {
  return (
    <BaseHeader className='flex flex-1 items-center justify-between'>
      <div className='flex items-center gap-3'>
        <h2 className='text-md font-semibold text-muted-foreground'>People</h2>
        <ImportCSVButton />
      </div>

      <div className='flex items-center gap-2'>
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <Users className='size-4' />
          <span>{peopleCount} people</span>
        </div>
      </div>
    </BaseHeader>
  );
}
