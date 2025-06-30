'use client';

import React from 'react';

import { BaseHeader } from '@/components/headers/base-header';
import { ListFilter, MoreHorizontal, Upload, Users } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface PeopleHeaderProps {
  peopleCount: number;
}

export function PeopleHeader({ peopleCount }: PeopleHeaderProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    await fetch('/api/files', { method: 'POST', body: formData });
  };

  return (
    <BaseHeader className='flex flex-1 items-center justify-between'>
      <div className='flex items-center gap-3'>
        <h2 className='text-md font-semibold text-muted-foreground'>People</h2>
        <Button variant='outline' size='sm'>
          <ListFilter className='mr-2 size-4' />
          Filter
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='sm'>
              <MoreHorizontal className='size-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem>
              <ListFilter className='mr-2 size-4' />
              Sort
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant='outline' size='sm' onClick={() => fileInputRef.current?.click()}>
          <Upload className='mr-2 size-4' /> Import CSV
        </Button>
        <input
          ref={fileInputRef}
          type='file'
          accept='.csv'
          onChange={handleFileChange}
          className='hidden'
        />
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
