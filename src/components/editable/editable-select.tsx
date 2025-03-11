import { useState } from 'react';

import { Check, ChevronsUpDown } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

interface EditableSelectProps {
  value: string | string[];
  options: SelectOption[];
  onChange: (value: string | string[]) => Promise<void>;
  placeholder?: string;
  className?: string;
  multiple?: boolean;
}

export function EditableSelect({
  value,
  options,
  onChange,
  placeholder = 'Select...',
  className,
  multiple = false
}: EditableSelectProps) {
  const [open, setOpen] = useState(false);
  console.log(value);

  const selectedValues = multiple ? (value as string[]) : [value as string];
  const selectedOptions = options.filter((option) => selectedValues.includes(option.value));

  const handleSelect = async (currentValue: string) => {
    let newValue: string | string[];

    if (multiple) {
      const currentValues = value as string[];
      newValue = currentValues.includes(currentValue)
        ? currentValues.filter((v) => v !== currentValue)
        : [...currentValues, currentValue];
    } else {
      newValue = currentValue;
      setOpen(false);
    }

    await onChange(newValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={cn(
            'w-full justify-between',
            !selectedOptions.length && 'text-muted-foreground',
            className
          )}>
          <div className='flex flex-wrap gap-1'>
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant='secondary'
                  className='rounded-sm px-1 font-normal'>
                  {option.label}
                </Badge>
              ))
            ) : (
              <span>{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className='ml-2 size-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full p-0'>
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
          <CommandEmpty>No option found.</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => handleSelect(option.value)}>
                <Check
                  className={cn(
                    'mr-2 size-4',
                    selectedValues.includes(option.value) ? 'opacity-100' : 'opacity-0'
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
