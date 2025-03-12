import { ReactNode, useState } from 'react';

import { Pencil, SquareX, Trash } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface EditablePopoverProps {
  children: ReactNode;
  trigger: ReactNode;
  hideDefaultTrigger?: boolean;
  onDelete?: () => Promise<void>;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EditablePopover({
  children,
  trigger,
  hideDefaultTrigger,
  onDelete,
  className,
  side = 'right',
  align = 'start',
  open,
  onOpenChange
}: EditablePopoverProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  const handleDeleteClick = () => {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      // Reset confirm state after 3 seconds if not clicked
      setTimeout(() => setIsConfirmingDelete(false), 3000);
      return;
    }

    if (onDelete) {
      setIsDeleting(true);
      onDelete()
        .finally(() => {
          setIsDeleting(false);
          setIsConfirmingDelete(false);
          handleOpenChange(false);
        })
        .catch((error) => {
          console.error('Failed to delete:', error);
          setIsDeleting(false);
          setIsConfirmingDelete(false);
        });
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div className='group relative cursor-pointer'>
          {trigger}
          {!hideDefaultTrigger && (
            <Button
              variant='ghost'
              size='sm'
              className='invisible absolute right-4 top-0 size-6 translate-x-full p-0 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100'>
              <Pencil className='size-3' />
            </Button>
          )}
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
                className={cn(
                  'size-8',
                  isConfirmingDelete
                    ? 'animate-pulse text-destructive hover:text-destructive'
                    : 'text-destructive hover:text-destructive'
                )}
                onClick={handleDeleteClick}
                disabled={isDeleting}>
                {isConfirmingDelete ? (
                  <SquareX className={cn('size-4', isDeleting && 'animate-spin')} />
                ) : (
                  <Trash className='size-4' />
                )}
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
