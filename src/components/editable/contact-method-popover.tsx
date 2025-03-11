import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { EditablePopover } from './editable-popover';

const CONTACT_TYPES = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'signal', label: 'Signal' },
  { value: 'other', label: 'Other' }
] as const;

interface ContactMethodPopoverProps {
  contactMethod: {
    id?: string;
    type: string;
    value: string;
    label?: string;
    is_primary: boolean;
  };
  onSave: (data: Omit<ContactMethodPopoverProps['contactMethod'], 'id'>) => Promise<void>;
  onDelete?: () => Promise<void>;
  className?: string;
}

export function ContactMethodPopover({
  contactMethod,
  onSave,
  onDelete,
  className
}: ContactMethodPopoverProps) {
  const [formData, setFormData] = useState(contactMethod);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { id, ...data } = formData;
      await onSave(data);
    } catch (error) {
      console.error('Failed to save contact method:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <EditablePopover
      trigger={
        <div className={cn('space-y-1', className)}>
          <div className='text-sm'>{formData.value}</div>
          <div className='flex items-center gap-2'>
            <span className='text-xs text-muted-foreground'>
              {CONTACT_TYPES.find((t) => t.value === formData.type)?.label}
            </span>
            {formData.label && (
              <span className='text-xs text-muted-foreground'>({formData.label})</span>
            )}
          </div>
        </div>
      }
      onDelete={onDelete}>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='type'>Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue placeholder='Select type' />
            </SelectTrigger>
            <SelectContent>
              {CONTACT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='value'>Value</Label>
          <Input
            id='value'
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            placeholder={`Enter ${formData.type}`}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='label'>Label (optional)</Label>
          <Input
            id='label'
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            placeholder='e.g., Work, Personal'
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
          <Label htmlFor='is_primary'>Set as primary contact</Label>
        </div>

        <Button type='submit' className='w-full' disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Contact'}
        </Button>
      </form>
    </EditablePopover>
  );
}
