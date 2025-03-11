'use client';

import { useState } from 'react';

import { format } from 'date-fns';

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
import { Skeleton } from '@/components/ui/skeleton';
import { useCustomFieldValues } from '@/hooks/use-custom-fields';

interface CustomFieldsSectionProps {
  personId: string;
  groupId?: string;
  sectionType: 'person' | 'group';
  groupName?: string;
}

export function CustomFieldsSection({
  personId,
  groupId,
  sectionType,
  groupName
}: CustomFieldsSectionProps) {
  const { fields, values, isLoading, setValue, getValueByFieldId } = useCustomFieldValues(personId);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string | null>(null);
  console.log('fields', fields);

  // Filter fields based on section type and groupId
  const filteredFields = fields;
  // const filteredFields = fields.filter((field: any) => {
  //   if (sectionType === 'person') {
  //     return field.groupId === null && field.entityType === 'person';
  //   } else {
  //     return field.groupId === groupId && field.entityType === 'person';
  //   }
  // });

  if (isLoading) {
    return (
      <div className='mt-5 space-y-3'>
        <h3 className='flex items-center text-sm font-semibold text-muted-foreground'>
          {sectionType === 'person' ? 'All People Fields' : `${groupName || 'Group'} Fields`}
        </h3>
        <div className='space-y-3'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='space-y-1'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-8 w-full' />
            </div>
          ))}
        </div>
      </div>
    );
  }
  console.log('filteredFields', filteredFields);

  // if (filteredFields.length === 0) {
  //   return null;
  // }

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
          // For simplicity, we're handling multi-select similar to dropdown in this example
          // In a real implementation, you might want to use a more appropriate component
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
          <div className='flex items-center justify-between'>
            <span className='text-sm italic text-muted-foreground'>Not set</span>
            <Button size='icon' variant='ghost' onClick={() => handleEdit(field.id)}>
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
              <div className='flex items-center justify-between'>
                <span className='text-sm'>{format(date, 'PP')}</span>
                <Button size='icon' variant='ghost' onClick={() => handleEdit(field.id)}>
                  <Edit className='size-4' />
                </Button>
              </div>
            );
          } catch (e) {
            return (
              <div className='flex items-center justify-between'>
                <span className='text-sm'>{fieldValue}</span>
                <Button size='icon' variant='ghost' onClick={() => handleEdit(field.id)}>
                  <Edit className='size-4' />
                </Button>
              </div>
            );
          }

        case 'checkbox':
          return (
            <div className='flex items-center justify-between'>
              <span className='text-sm'>{fieldValue === 'true' ? 'Yes' : 'No'}</span>
              <Button size='icon' variant='ghost' onClick={() => handleEdit(field.id)}>
                <Edit className='size-4' />
              </Button>
            </div>
          );

        case 'dropdown':
        case 'multi-select':
          return (
            <div className='flex items-center justify-between'>
              <span className='text-sm'>{fieldValue}</span>
              <Button size='icon' variant='ghost' onClick={() => handleEdit(field.id)}>
                <Edit className='size-4' />
              </Button>
            </div>
          );

        default:
          return (
            <div className='flex items-center justify-between'>
              <span className='text-sm'>{fieldValue}</span>
              <Button size='icon' variant='ghost' onClick={() => handleEdit(field.id)}>
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
          'Person Fields'
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
        {filteredFields.map((field: any) => (
          <div key={field.id} className='space-y-1'>
            <Label className='text-xs'>{field.name}</Label>
            {renderFieldValue(field)}
          </div>
        ))}
      </div>
    </section>
  );
}
