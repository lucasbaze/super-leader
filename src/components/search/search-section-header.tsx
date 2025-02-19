'use client';

import { X } from '@/components/icons';
import { Button } from '@/components/ui/button';

type TSearchSectionHeaderProps = {
  label: string;
  onClear?: () => void;
};

export function SearchSectionHeader({ label, onClear }: TSearchSectionHeaderProps) {
  return (
    <div className='flex items-center justify-between px-4 py-1'>
      <span className='text-xs text-muted-foreground'>{label}</span>
      {onClear && (
        <Button
          variant='ghost'
          size='sm'
          className='h-6 px-2'
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClear();
          }}>
          <X className='size-3' />
        </Button>
      )}
    </div>
  );
}
