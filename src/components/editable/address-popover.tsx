import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
}

export function AddressPopover({ address, onSave, onDelete, className }: AddressPopoverProps) {
  const [formData, setFormData] = useState(address);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { id, ...data } = formData;
      await onSave(data);
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

  return (
    <EditablePopover
      trigger={
        <div className={cn('space-y-1', className)}>
          <div className='text-sm'>{displayAddress}</div>
          {formData.label && <div className='text-xs text-muted-foreground'>{formData.label}</div>}
        </div>
      }
      onDelete={onDelete}>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='street'>Street</Label>
          <Input
            id='street'
            value={formData.street}
            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
          />
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <div className='space-y-2'>
            <Label htmlFor='city'>City</Label>
            <Input
              id='city'
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='state'>State</Label>
            <Input
              id='state'
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
          </div>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <div className='space-y-2'>
            <Label htmlFor='postal_code'>Postal Code</Label>
            <Input
              id='postal_code'
              value={formData.postal_code}
              onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='country'>Country</Label>
            <Input
              id='country'
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='label'>Label (optional)</Label>
          <Input
            id='label'
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            placeholder='e.g., Home, Work'
          />
        </div>

        <div className='flex items-center space-x-2'>
          <Checkbox
            id='is_primary'
            checked={formData.is_primary}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, is_primary: checked as boolean })
            }
          />
          <Label htmlFor='is_primary'>Set as primary address</Label>
        </div>

        <Button type='submit' className='w-full' disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Address'}
        </Button>
      </form>
    </EditablePopover>
  );
}
