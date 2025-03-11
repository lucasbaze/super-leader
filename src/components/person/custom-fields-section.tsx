'use client';

import { useState } from 'react';

import { format } from 'date-fns';

import { EditableSelect } from '@/components/editable/editable-select';
import { Edit, Save } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
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
import { useCustomFieldValues } from '@/hooks/use-custom-fields';

interface CustomFieldsSectionProps {
  sectionType: 'person' | 'group';
  personId: string;
  groupId?: string;
  groupName?: string;
}

export function CustomFieldsSection({
  personId,
  groupId,
  sectionType,
  groupName
}: CustomFieldsSectionProps) {
  const { fields, values, isLoading, setValue, getValueByFieldId } = useCustomFieldValues(
    groupId || personId!,
    sectionType
  );
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string | null>(null);

  if (isLoading || !fields || fields.length === 0) {
    return null;
  }

  const handleEdit = (fieldId: string) => {
    const value = getValueByFieldId(fieldId);
    setEditingField(fieldId);
    setEditValue(value ? value.value : null);
  };

  const handleSave = (fieldId: string) => {
    const field = fields.find((f: any) => f.id === fieldId);
    if (!field) return;

    const value = getValueByFieldId(fieldId);

    if (value) {
      setValue.mutate(
        {
          customFieldId: fieldId,
          value: editValue
        },
        {
          onSuccess: () => {
            setEditingField(null);
          }
        }
      );
    } else {
      setValue.mutate(
        {
          customFieldId: fieldId,
          value: editValue
        },
        {
          onSuccess: () => {
            setEditingField(null);
          }
        }
      );
    }
  };

  const renderFieldValue = (field: any) => {
    const value = getValueByFieldId(field.id);
    const fieldValue = value?.value;

    if (editingField === field.id) {
      // Field is being edited
      switch (field.fieldType) {
        case 'text':
          return (
            <div className='flex items-center gap-2'>
              <Input
                value={editValue || ''}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder='Enter value'
                className='flex-1'
              />
              <Button size='icon' variant='ghost' onClick={() => handleSave(field.id)}>
                <Save className='size-4' />
              </Button>
            </div>
          );

        case 'number':
          return (
            <div className='flex items-center gap-2'>
              <Input
                type='number'
                value={editValue || ''}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder='Enter number'
                className='flex-1'
              />
              <Button size='icon' variant='ghost' onClick={() => handleSave(field.id)}>
                <Save className='size-4' />
              </Button>
            </div>
          );

        case 'date':
          return (
            <div className='flex items-center gap-2'>
              <Input
                type='date'
                value={editValue || ''}
                onChange={(e) => setEditValue(e.target.value)}
                className='flex-1'
              />
              <Button size='icon' variant='ghost' onClick={() => handleSave(field.id)}>
                <Save className='size-4' />
              </Button>
            </div>
          );

        case 'dropdown':
          return (
            <div className='flex items-center gap-2'>
              <Select value={editValue || ''} onValueChange={(value) => setEditValue(value)}>
                <SelectTrigger className='flex-1'>
                  <SelectValue placeholder='Select option' />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option: any) => (
                    <SelectItem key={option.id} value={option.value}>
                      {option.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size='icon' variant='ghost' onClick={() => handleSave(field.id)}>
                <Save className='size-4' />
              </Button>
            </div>
          );

        case 'checkbox':
          return (
            <div className='flex items-center gap-2'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  checked={editValue === 'true'}
                  onCheckedChange={(checked) => setEditValue(checked ? 'true' : 'false')}
                  id={`checkbox-${field.id}`}
                />
                <Label htmlFor={`checkbox-${field.id}`}>
                  {editValue === 'true' ? 'Yes' : 'No'}
                </Label>
              </div>
              <Button size='icon' variant='ghost' onClick={() => handleSave(field.id)}>
                <Save className='size-4' />
              </Button>
            </div>
          );

        case 'multi-select':
          return (
            <div className='flex items-center gap-2'>
              <EditableSelect
                value={editValue ? JSON.parse(editValue) : []}
                options={
                  field.options?.map((option: any) => ({
                    value: option.value,
                    label: option.value
                  })) || []
                }
                onChange={async (value) => {
                  setEditValue(JSON.stringify(value));
                  return Promise.resolve();
                }}
                placeholder='Select options'
                className='flex-1'
                multiple={true}
              />
              <Button size='icon' variant='ghost' onClick={() => handleSave(field.id)}>
                <Save className='size-4' />
              </Button>
            </div>
          );

        default:
          return (
            <div className='flex items-center gap-2'>
              <Input
                value={editValue || ''}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder='Enter value'
                className='flex-1'
              />
              <Button size='icon' variant='ghost' onClick={() => handleSave(field.id)}>
                <Save className='size-4' />
              </Button>
            </div>
          );
      }
    } else {
      // Display mode
      if (!fieldValue) {
        return (
          <div className='group flex items-center gap-2'>
            <span className='text-sm italic text-muted-foreground'>Not set</span>
            <Button
              size='icon'
              variant='ghost'
              className='invisible size-4 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100'
              onClick={() => handleEdit(field.id)}>
              <Edit className='size-4' />
            </Button>
          </div>
        );
      }

      switch (field.fieldType) {
        case 'date':
          try {
            const date = new Date(fieldValue);
            return (
              <div className='group flex items-center gap-2'>
                <span className='text-sm'>{format(date, 'PP')}</span>
                <Button
                  size='icon'
                  variant='ghost'
                  className='invisible size-4 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100'
                  onClick={() => handleEdit(field.id)}>
                  <Edit className='size-4' />
                </Button>
              </div>
            );
          } catch (e) {
            return (
              <div className='group flex items-center gap-2'>
                <span className='text-sm'>{fieldValue}</span>
                <Button
                  size='icon'
                  variant='ghost'
                  className='invisible size-4 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100'
                  onClick={() => handleEdit(field.id)}>
                  <Edit className='size-4' />
                </Button>
              </div>
            );
          }

        case 'checkbox':
          return (
            <div className='group flex items-center gap-2'>
              <span className='text-sm'>{fieldValue === 'true' ? 'Yes' : 'No'}</span>
              <Button
                size='icon'
                variant='ghost'
                className='invisible size-4 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100'
                onClick={() => handleEdit(field.id)}>
                <Edit className='size-4' />
              </Button>
            </div>
          );

        case 'dropdown':
          return (
            <div className='group flex items-center gap-2'>
              <Badge key={value} variant='outline' className='rounded-full px-2 font-normal'>
                {fieldValue}
              </Badge>
              <Button
                size='icon'
                variant='ghost'
                className='invisible size-4 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100'
                onClick={() => handleEdit(field.id)}>
                <Edit className='size-4' />
              </Button>
            </div>
          );

        case 'multi-select':
          return (
            <div className='group flex items-center gap-2'>
              {JSON.parse(fieldValue || '[]').map((value: any) => (
                <Badge key={value} variant='outline' className='rounded-full px-2 font-normal'>
                  {value}
                </Badge>
              ))}
              <Button
                size='icon'
                variant='ghost'
                className='invisible size-4 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100'
                onClick={() => handleEdit(field.id)}>
                <Edit className='size-4' />
              </Button>
            </div>
          );

        default:
          return (
            <div className='group flex items-center gap-2'>
              <span className='text-sm'>{fieldValue}</span>
              <Button
                size='icon'
                variant='ghost'
                className='invisible size-4 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100'
                onClick={() => handleEdit(field.id)}>
                <Edit className='size-4' />
              </Button>
            </div>
          );
      }
    }
  };

  return (
    <section className='mt-5 space-y-3'>
      <h3 className='flex items-center text-sm font-semibold text-muted-foreground'>
        {sectionType === 'person' ? (
          'Custom Person Fields'
        ) : (
          <div className='flex items-center gap-2'>
            <span>{groupName || 'Group'} Fields</span>
            <Badge variant='outline' className='text-[10px]'>
              Group
            </Badge>
          </div>
        )}
      </h3>

      <div className='space-y-4'>
        {fields.map((field: any) => (
          <div key={field.id} className='group space-y-1'>
            <Label className='text-xs'>{field.name}</Label>
            {renderFieldValue(field)}
          </div>
        ))}
      </div>
    </section>
  );
}
