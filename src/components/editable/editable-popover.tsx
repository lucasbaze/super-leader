import { ReactNode } from 'react';

import { Pencil, Trash } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface EditablePopoverProps {
  children: ReactNode;
  trigger: ReactNode;
  onDelete?: () => Promise<void>;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

export function EditablePopover({
  children,
  trigger,
  onDelete,
  className,
  side = 'right',
  align = 'start'
}: EditablePopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className='group relative cursor-pointer'>
          {trigger}
          <Button
            variant='ghost'
            size='sm'
            className='invisible absolute right-4 top-0 size-6 translate-x-full p-0 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100'>
            <Pencil className='size-3' />
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent side={side} align={align} className={cn('w-80', className)}>
        <div className='relative'>
          {children}
          {onDelete && (
            <div className='absolute -bottom-1 left-0'>
              <Button
                variant='ghost'
                size='icon'
                className='size-8 text-destructive hover:text-destructive'
                onClick={onDelete}>
                <Trash className='size-4' />
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
