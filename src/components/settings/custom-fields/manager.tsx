'use client';

import { useState } from 'react';

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import {
  Calendar,
  CheckSquare,
  GripVertical,
  Hash,
  ListFilter,
  Pencil,
  Plus,
  Tags,
  TextCursorInput,
  Trash,
  X
} from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useCustomFields } from '@/hooks/use-custom-fields';
import { VALID_FIELD_TYPES } from '@/lib/custom-fields/constants';

const FIELD_TYPE_ICONS = {
  [VALID_FIELD_TYPES.TEXT]: TextCursorInput,
  [VALID_FIELD_TYPES.NUMBER]: Hash,
  [VALID_FIELD_TYPES.DATE]: Calendar,
  [VALID_FIELD_TYPES.DROPDOWN]: ListFilter,
  [VALID_FIELD_TYPES.CHECKBOX]: CheckSquare,
  [VALID_FIELD_TYPES.MULTI_SELECT]: Tags
} as const;

interface CustomFieldsManagerProps {
  entityType: 'person' | 'group';
  groupId?: string;
  title?: string;
}

interface SortableItemProps {
  id: string;
  name: string;
  fieldType: string;
  options?: { id: string; value: string }[];
  onEdit: () => void;
  onDelete: () => void;
}

function SortableItem({ id, name, fieldType, options, onEdit, onDelete }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const FieldIcon = FIELD_TYPE_ICONS[fieldType as keyof typeof FIELD_TYPE_ICONS];

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const isSelectType =
    fieldType === VALID_FIELD_TYPES.DROPDOWN || fieldType === VALID_FIELD_TYPES.MULTI_SELECT;

  return (
    <div ref={setNodeRef} style={style} className='mb-2'>
      <Card className='flex flex-col p-2'>
        <div className='flex items-center justify-between'>
          <div className='flex flex-1 items-center gap-2'>
            <div className='cursor-grab' {...attributes} {...listeners}>
              <GripVertical className='size-4 text-muted-foreground' />
            </div>
            <div className='flex items-center gap-2'>
              <FieldIcon className='size-4 text-muted-foreground' />
              <span className='font-medium'>{name}</span>
            </div>
          </div>
          <div className='flex items-center space-x-1'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='ghost' size='icon' onClick={onEdit}>
                  <Pencil className='size-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit Field</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='ghost' size='icon' onClick={onDelete}>
                  <Trash className='size-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Field</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        {isSelectType && options && options.length > 0 && (
          <div className='ml-12 mt-1 flex flex-wrap gap-1'>
            {options.map((option) => (
              <Badge key={option.id} variant='outline' className='text-xs'>
                {option.value}
              </Badge>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export function CustomFieldsManager({ entityType, groupId, title }: CustomFieldsManagerProps) {
  const { fields, isLoading, createField, updateField, deleteField, reorderFields } =
    useCustomFields(entityType, groupId);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentField, setCurrentField] = useState<any>(null);
  const [newFieldData, setNewFieldData] = useState({
    name: '',
    fieldType: 'text',
    fieldDescription: '',
    options: ['']
  });

  // DnD setup
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // TODO: Type these
      const oldIndex = fields.findIndex((field: any) => field.id === active.id);
      const newIndex = fields.findIndex((field: any) => field.id === over.id);

      const newFieldsOrder = [...fields];
      const movedItem = newFieldsOrder.splice(oldIndex, 1)[0];
      newFieldsOrder.splice(newIndex, 0, movedItem);

      reorderFields.mutate(newFieldsOrder.map((field) => field.id));
    }
  };

  const handleAddClick = () => {
    setNewFieldData({
      name: '',
      fieldType: 'text',
      fieldDescription: '',
      options: ['']
    });
    setIsAddDialogOpen(true);
  };

  const handleEditClick = (field: any) => {
    setCurrentField(field);
    setNewFieldData({
      name: field.name,
      fieldType: field.fieldType,
      fieldDescription: field.fieldDescription,
      options: field.options?.map((opt: any) => opt.value) || ['']
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (field: any) => {
    setCurrentField(field);
    setIsDeleteDialogOpen(true);
  };

  const handleAddOptionClick = () => {
    setNewFieldData((prev) => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...newFieldData.options];
    newOptions[index] = value;
    setNewFieldData((prev) => ({
      ...prev,
      options: newOptions
    }));
  };

  const handleRemoveOption = (index: number) => {
    setNewFieldData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleAddField = () => {
    const { name, fieldType, fieldDescription } = newFieldData;
    let { options } = newFieldData;

    // Filter out empty options
    if (fieldType === VALID_FIELD_TYPES.DROPDOWN || fieldType === VALID_FIELD_TYPES.MULTI_SELECT) {
      options = options.filter((o) => o.trim() !== '');
      if (options.length === 0) {
        options = ['Option 1']; // Default option if all are empty
      }
    }

    createField.mutate(
      {
        name,
        fieldType,
        fieldDescription,
        options:
          fieldType === VALID_FIELD_TYPES.DROPDOWN || fieldType === VALID_FIELD_TYPES.MULTI_SELECT
            ? options
            : undefined
      },
      {
        onSuccess: () => {
          setIsAddDialogOpen(false);
        }
      }
    );
  };

  const handleUpdateField = () => {
    if (!currentField) return;

    const { name, fieldDescription } = newFieldData;
    let { options } = newFieldData;

    // Only include options for dropdown and multi-select fields
    if (
      currentField.fieldType === VALID_FIELD_TYPES.DROPDOWN ||
      currentField.fieldType === VALID_FIELD_TYPES.MULTI_SELECT
    ) {
      options = options.filter((o) => o.trim() !== '');
      if (options.length === 0) {
        options = ['Option 1']; // Default option if all are empty
      }
    }

    updateField.mutate(
      {
        id: currentField.id,
        name,
        fieldDescription,
        options:
          currentField.fieldType === VALID_FIELD_TYPES.DROPDOWN ||
          currentField.fieldType === VALID_FIELD_TYPES.MULTI_SELECT
            ? options
            : undefined
      },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
        }
      }
    );
  };

  const handleDeleteField = () => {
    if (!currentField) return;

    deleteField.mutate(currentField.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
      }
    });
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>{title || 'Custom Fields'}</h2>
        <Button onClick={handleAddClick}>
          <Plus className='mr-2 size-4' />
          Add Field
        </Button>
      </div>

      {isLoading ? (
        <div className='py-8 text-center'>Loading fields...</div>
      ) : fields.length === 0 ? (
        <div className='py-8 text-center text-muted-foreground'>
          No custom fields yet. Click the "Add Field" button to create one.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          {/* TODO: Type these */}
          <SortableContext
            items={fields.map((f: any) => f.id)}
            strategy={verticalListSortingStrategy}>
            <div className='mt-4 space-y-1'>
              {fields.map((field: any) => (
                <SortableItem
                  key={field.id}
                  id={field.id}
                  name={field.name}
                  fieldType={field.fieldType}
                  options={field.options}
                  onEdit={() => handleEditClick(field)}
                  onDelete={() => handleDeleteClick(field)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add Field Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Add Custom Field</DialogTitle>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='field-name'>Field Name</Label>
              <Input
                id='field-name'
                placeholder='Enter field name'
                value={newFieldData.name}
                onChange={(e) => setNewFieldData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='field-description'>Field Description</Label>
              <Input
                id='field-description'
                placeholder='Enter field description'
                value={newFieldData.fieldDescription}
                onChange={(e) =>
                  setNewFieldData((prev) => ({ ...prev, fieldDescription: e.target.value }))
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='field-type'>Field Type</Label>
              <Select
                value={newFieldData.fieldType}
                onValueChange={(value) =>
                  setNewFieldData((prev) => ({ ...prev, fieldType: value }))
                }>
                <SelectTrigger>
                  <SelectValue placeholder='Select field type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='text'>Text</SelectItem>
                  <SelectItem value='number'>Number</SelectItem>
                  <SelectItem value='date'>Date</SelectItem>
                  <SelectItem value='dropdown'>Dropdown (Select One)</SelectItem>
                  <SelectItem value='multi-select'>Multi-Select</SelectItem>
                  <SelectItem value='checkbox'>Checkbox</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(newFieldData.fieldType === VALID_FIELD_TYPES.DROPDOWN ||
              newFieldData.fieldType === VALID_FIELD_TYPES.MULTI_SELECT) && (
              <div className='space-y-2'>
                <Label>Options</Label>
                <ScrollArea className='max-h-[200px]'>
                  <div className='space-y-2'>
                    {newFieldData.options.map((option, index) => (
                      <div key={index} className='flex items-center gap-2'>
                        <Input
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                        />
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => handleRemoveOption(index)}>
                          <X className='size-4' />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <Button variant='outline' size='sm' className='mt-2' onClick={handleAddOptionClick}>
                  <Plus className='mr-1 size-3' />
                  Add Option
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddField} disabled={!newFieldData.name || createField.isPending}>
              {createField.isPending ? 'Creating...' : 'Create Field'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Field Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Edit Custom Field</DialogTitle>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='edit-field-name'>Field Name</Label>
              <Input
                id='edit-field-name'
                placeholder='Enter field name'
                value={newFieldData.name}
                onChange={(e) => setNewFieldData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='edit-field-description'>Field Description</Label>
              <Input
                id='edit-field-description'
                placeholder='Enter field description'
                value={newFieldData.fieldDescription}
                onChange={(e) =>
                  setNewFieldData((prev) => ({ ...prev, fieldDescription: e.target.value }))
                }
              />
            </div>

            <div className='space-y-2'>
              <Label>Field Type</Label>
              <div className='flex items-center gap-2 text-sm'>
                <Badge variant='outline' className='capitalize'>
                  {currentField?.fieldType || ''}
                </Badge>
                <span className='text-muted-foreground'>(Field type cannot be changed)</span>
              </div>
            </div>

            {(currentField?.fieldType === 'dropdown' ||
              currentField?.fieldType === 'multi-select') && (
              <div className='space-y-2'>
                <Label>Options</Label>
                <ScrollArea className='max-h-[200px]'>
                  <div className='space-y-2'>
                    {newFieldData.options.map((option, index) => (
                      <div key={index} className='flex items-center gap-2'>
                        <Input
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                        />
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => handleRemoveOption(index)}
                          disabled={newFieldData.options.length <= 1}>
                          <X className='size-4' />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <Button variant='outline' size='sm' className='mt-2' onClick={handleAddOptionClick}>
                  <Plus className='mr-1 size-3' />
                  Add Option
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateField}
              disabled={!newFieldData.name || updateField.isPending}>
              {updateField.isPending ? 'Updating...' : 'Update Field'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Delete Custom Field</DialogTitle>
          </DialogHeader>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Deleting this field will remove it and all associated values from all records. This
              action cannot be undone.
            </AlertDescription>
          </Alert>

          <div className='py-4'>
            <p className='mb-2'>Are you sure you want to delete the field:</p>
            <p className='font-bold'>{currentField?.name}</p>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleDeleteField}
              disabled={deleteField.isPending}>
              {deleteField.isPending ? 'Deleting...' : 'Delete Field'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
