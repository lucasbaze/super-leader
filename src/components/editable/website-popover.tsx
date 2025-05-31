import { useEffect, useState } from 'react';

import { Link, Save, Tag } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

import { EditablePopover } from './editable-popover';

interface WebsitePopoverProps {
  website: {
    id?: string;
    url: string;
    label?: string;
  };
  onSave: (data: Omit<WebsitePopoverProps['website'], 'id'>) => Promise<void>;
  onDelete?: () => Promise<void>;
  className?: string;
  trigger?: React.ReactNode;
}

export function WebsitePopover({ website, onSave, onDelete, className, trigger }: WebsitePopoverProps) {
  const [formData, setFormData] = useState(website);
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
      console.error('Failed to save website:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (website) {
      setFormData(website);
    }
  }, [website]);

  const defaultTrigger = (
    <div className={cn('space-y-1', className)}>
      <div className='text-sm'>{website.url}</div>
      {website.label && <div className='text-xs text-muted-foreground'>{website.label}</div>}
    </div>
  );

  return (
    <EditablePopover
      trigger={trigger || defaultTrigger}
      hideDefaultTrigger={!!trigger}
      onDelete={onDelete}
      open={isOpen}
      onOpenChange={setIsOpen}>
      <form onSubmit={handleSubmit} className='relative space-y-4 pb-14'>
        <div className='grid grid-cols-[24px,1fr] items-center gap-2'>
          <Link className='size-4 text-muted-foreground' />
          <Input
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder='https://'
          />
        </div>

        <div className='grid grid-cols-[24px,1fr] items-center gap-2'>
          <Tag className='size-4 text-muted-foreground' />
          <Input
            value={formData.label || ''}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            placeholder='e.g., Personal Website, Blog'
          />
        </div>

        <div className='absolute bottom-0 right-0 flex w-full items-center justify-end'>
          <Button type='submit' size='icon' variant='ghost' className='size-8' disabled={isSubmitting}>
            <Save className={cn('size-4', isSubmitting && 'animate-spin')} />
          </Button>
        </div>
      </form>
    </EditablePopover>
  );
}
