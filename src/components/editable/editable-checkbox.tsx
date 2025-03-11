import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface EditableCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => Promise<void>;
  label?: string;
  className?: string;
}

export function EditableCheckbox({ checked, onChange, label, className }: EditableCheckboxProps) {
  const handleChange = async (value: boolean) => {
    try {
      await onChange(value);
    } catch (err) {
      console.error('Failed to update checkbox:', err);
    }
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Checkbox checked={checked} onCheckedChange={handleChange} />
      {label && <label className='text-sm'>{label}</label>}
    </div>
  );
}
