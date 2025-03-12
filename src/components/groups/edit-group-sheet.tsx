'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

import { EmojiPicker } from '@/components/emoji-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useUpdateGroup } from '@/hooks/use-groups';
import { Group } from '@/types/database';

interface EditGroupSheetProps {
  group: Group;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditGroupSheet({ group, open, onOpenChange }: EditGroupSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(group.name);
  const [icon, setIcon] = useState(group.icon);
  const updateGroup = useUpdateGroup();
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const result = await updateGroup.mutateAsync({
        groupId: group.id,
        name: name !== group.name ? name : undefined,
        icon: icon !== group.icon ? icon : undefined
      });
      console.log('Updated group', result);
      onOpenChange(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Group</SheetTitle>
          <SheetDescription>Update the group name or icon.</SheetDescription>
        </SheetHeader>

        <div className='mt-8 space-y-8'>
          <div className='flex items-end gap-4'>
            <div className='flex flex-col gap-2'>
              <Label>Icon</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant='outline' className='w-[42px] p-0' disabled={isSubmitting}>
                    {icon}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-full p-0' align='start'>
                  <EmojiPicker
                    onEmojiSelect={(emoji: { native: string }) => {
                      setIcon(emoji.native);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className='flex flex-1 flex-col gap-2'>
              <Label>Name</Label>
              <Input
                placeholder='Enter group name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <Separator />
          
          <div className='space-y-2'>
            <h3 className='text-sm font-medium'>Custom Fields</h3>
            <p className='text-sm text-muted-foreground'>
              Manage group-specific custom fields to track additional information
            </p>
            <div>
              <Button 
                variant='outline' 
                size='sm'
                asChild
                className='mt-2'
                onClick={() => onOpenChange(false)}
              >
                <Link href={`/app/groups/${group.id}/custom-fields`}>
                  Manage Custom Fields
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className='index-x-0 absolute bottom-0 flex justify-end gap-4 border-t bg-background p-4'>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || (!name && !icon)}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
