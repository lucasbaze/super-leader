import { useState } from 'react';

import { format } from 'date-fns';

import { Edit, Save } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
  const [editValue, setEditValue] = useState(value || '');

  const handleSave = async () => {
    await onChange(editValue);
    setIsEditing(false);
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
    const date = new Date(value);
    return (
      <div className='group flex items-center gap-2'>
        <span className='text-sm'>{format(date, 'PP')}</span>
        <Button
          size='icon'
          variant='ghost'
          className='invisible size-4 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100'
          onClick={() => setIsEditing(true)}>
          <Edit className='size-4' />
        </Button>
      </div>
    );
  } catch (e) {
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
