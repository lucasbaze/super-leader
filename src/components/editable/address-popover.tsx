import { useState } from 'react';

import { Building2, MapPin, Save, Tag } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { EditablePopover } from './editable-popover';

interface AddressPopoverProps {
  address: {
    id?: string;
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    label?: string;
    is_primary: boolean;
  };
  onSave: (data: Omit<AddressPopoverProps['address'], 'id'>) => Promise<void>;
  onDelete?: () => Promise<void>;
  className?: string;
  trigger?: React.ReactNode;
}

export function AddressPopover({
  address,
  onSave,
  onDelete,
  className,
  trigger
}: AddressPopoverProps) {
  const [formData, setFormData] = useState(address);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { id, ...data } = formData;
      await onSave(data);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to save address:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format the address for display in the trigger
  const displayAddress = [
    formData.street,
    formData.city,
    formData.state,
    formData.postal_code,
    formData.country
  ]
    .filter(Boolean)
    .join(', ');

  const defaultTrigger = (
    <div className={cn('space-y-1', className)}>
      <div className='text-sm'>{displayAddress}</div>
      {formData.label && <div className='text-xs text-muted-foreground'>{formData.label}</div>}
    </div>
  );

  return (
    <EditablePopover
      trigger={trigger || defaultTrigger}
      onDelete={onDelete}
      hideDefaultTrigger={!!trigger}
      open={isOpen}
      onOpenChange={setIsOpen}>
      <form onSubmit={handleSubmit} className='relative space-y-4 pb-14'>
        <div className='grid grid-cols-[24px,1fr] items-center gap-2'>
          <MapPin className='size-4 text-muted-foreground' />
          <Input
            value={formData.street}
            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
            placeholder='Street address'
          />
        </div>

        <div className='grid grid-cols-[24px,1fr] items-center gap-2'>
          <Building2 className='size-4 text-muted-foreground' />
          <div className='grid grid-cols-2 gap-2'>
            <Input
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder='City'
            />
            <Input
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder='State'
            />
          </div>
        </div>

        <div className='grid grid-cols-[24px,1fr] items-center gap-2'>
          <div className='size-4' /> {/* Spacer for alignment */}
          <div className='grid grid-cols-2 gap-2'>
            <Input
              value={formData.postal_code}
              onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
              placeholder='Postal code'
            />
            <Input
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              placeholder='Country'
            />
          </div>
        </div>

        <div className='grid grid-cols-[24px,1fr] items-center gap-2'>
          <Tag className='size-4 text-muted-foreground' />
          <Input
            value={formData.label || ''}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            placeholder='e.g., Home, Work'
          />
        </div>

        <div className='grid grid-cols-[24px,1fr] items-center gap-2'>
          <div className='size-4' /> {/* Spacer for alignment */}
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='is_primary'
              checked={formData.is_primary}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_primary: checked as boolean })
              }
            />
            <label htmlFor='is_primary' className='text-sm'>
              Set as primary address
            </label>
          </div>
        </div>

        <div className='absolute bottom-0 right-0 flex w-full items-center justify-end'>
          <Button
            type='submit'
            size='icon'
            variant='ghost'
            className='size-8'
            disabled={isSubmitting}>
            <Save className={cn('size-4', isSubmitting && 'animate-spin')} />
          </Button>
        </div>
      </form>
    </EditablePopover>
  );
}
