import { useState } from 'react';

import { Edit, Save } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { convertToUTC, dateHandler, getUserTimeZone } from '@/lib/dates/helpers';

interface EditableDateProps {
  value: string | null;
  onChange: (value: string) => Promise<void>;
  placeholder?: string;
  className?: string;
}

export function EditableDate({
  value,
  onChange,
  placeholder = 'Select date',
  className
}: EditableDateProps) {
  const [isEditing, setIsEditing] = useState(false);
  // When editing, we want to show the local date in the input
  const [editValue, setEditValue] = useState(value ? dateHandler(value).format('YYYY-MM-DD') : '');

  const handleSave = async () => {
    if (editValue) {
      // Convert to UTC before saving
      const utcDate = convertToUTC(editValue);
      await onChange(utcDate);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className='flex items-center gap-2'>
        <Input
          type='date'
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className='flex-1'
        />
        <Button size='icon' variant='ghost' onClick={handleSave}>
          <Save className='size-4' />
        </Button>
      </div>
    );
  }

  if (!value) {
    return (
      <div className='group flex items-center gap-2'>
        <span className='text-sm italic text-muted-foreground'>{placeholder}</span>
        <Button
          size='icon'
          variant='ghost'
          className='invisible size-4 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100'
          onClick={() => setIsEditing(true)}>
          <Edit className='size-4' />
        </Button>
      </div>
    );
  }

  try {
    // Display in user's timezone
    const userTimezone = getUserTimeZone();
    const localDate = dateHandler(value).tz(userTimezone);

    return (
      <div className='group flex items-center gap-2'>
        <span className='text-sm'>{localDate.format('MMM D, YYYY')}</span>
        <Button
          size='icon'
          variant='ghost'
          className='invisible size-4 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100'
          onClick={() => {
            // When starting to edit, set the edit value to the local date
            setEditValue(localDate.format('YYYY-MM-DD'));
            setIsEditing(true);
          }}>
          <Edit className='size-4' />
        </Button>
      </div>
    );
  } catch (e) {
    console.error('Error formatting date:', e);
    return (
      <div className='group flex items-center gap-2'>
        <span className='text-sm'>{value}</span>
        <Button
          size='icon'
          variant='ghost'
          className='invisible size-4 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100'
          onClick={() => setIsEditing(true)}>
          <Edit className='size-4' />
        </Button>
      </div>
    );
  }
}
