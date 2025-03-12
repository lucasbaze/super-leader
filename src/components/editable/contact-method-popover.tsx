import { useState } from 'react';

import { ListFilter, Save, Send, Tag } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
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
    label: string | undefined;
    is_primary: boolean;
  };
  onSave: (data: Omit<ContactMethodPopoverProps['contactMethod'], 'id'>) => Promise<void>;
  onDelete?: () => Promise<void>;
  className?: string;
  trigger?: React.ReactNode;
}

export function ContactMethodPopover({
  contactMethod,
  onSave,
  onDelete,
  className,
  trigger
}: ContactMethodPopoverProps) {
  const [formData, setFormData] = useState(contactMethod);
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
      console.error('Failed to save contact method:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultTrigger = (
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
          <ListFilter className='size-4 text-muted-foreground' />
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

        <div className='grid grid-cols-[24px,1fr] items-center gap-2'>
          <Send className='size-4 text-muted-foreground' />
          <Input
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            placeholder={`Enter ${formData.type}`}
          />
        </div>

        <div className='grid grid-cols-[24px,1fr] items-center gap-2'>
          <Tag className='size-4 text-muted-foreground' />
          <Input
            value={formData.label || ''}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            placeholder='e.g., Work, Personal'
          />
        </div>

        <div className='grid grid-cols-[24px,1fr] items-center gap-2'>
          <div className='size-4' /> {/* Spacer for alignment */}
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='is_primary'
              checked={formData.is_primary || false}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_primary: checked as boolean })
              }
            />
            <label htmlFor='is_primary' className='text-sm'>
              Set as primary contact
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
