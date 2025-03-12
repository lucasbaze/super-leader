import { useEffect, useRef, useState } from 'react';

import { Copy } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';

interface EditableFieldProps {
  value: string;
  onChange: (value: string) => Promise<void>;
  onCancel?: () => void;
  className?: string;
  placeholder?: string;
  validate?: (value: string) => boolean | string;
  showCopy?: boolean;
}

export function EditableField({
  value: initialValue,
  onChange,
  onCancel,
  className,
  placeholder,
  validate,
  showCopy = true
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedValue = useDebounce(value, 500);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (!isEditing) return;

    const handleValidationAndUpdate = async () => {
      if (value === initialValue) return;

      if (validate) {
        const validationResult = validate(value);
        if (typeof validationResult === 'string') {
          setError(validationResult);
          return;
        }
        if (!validationResult) {
          setError('Invalid value');
          return;
        }
      }

      setError(null);
      try {
        await onChange(value);
      } catch (err) {
        setError('Failed to update');
        setValue(initialValue);
      }
    };

    handleValidationAndUpdate();
  }, [debouncedValue, validate, onChange, initialValue, isEditing, value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setValue(initialValue);
      onCancel?.();
    }
    if (e.key === 'Enter') {
      setIsEditing(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (isEditing) {
    return (
      <div className='relative'>
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => setIsEditing(false)}
          className={cn('w-full pr-8', className)}
          placeholder={placeholder}
          autoFocus
        />
        {error && <p className='text-xs text-destructive'>{error}</p>}
      </div>
    );
  }

  return (
    <div className='group relative flex items-center gap-2'>
      <div
        onClick={() => setIsEditing(true)}
        className={cn(
          'cursor-text rounded px-2 py-1 hover:bg-accent',
          !value && 'italic text-muted-foreground',
          className
        )}>
        {value || placeholder || 'Click to edit'}
      </div>
      {showCopy && value && (
        <Button
          variant='ghost'
          size='sm'
          className='invisible size-6 p-0 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100'
          onClick={handleCopy}>
          <Copy className='size-3' />
        </Button>
      )}
    </div>
  );
}
