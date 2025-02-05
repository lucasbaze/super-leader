'use client';

import * as React from 'react';

import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

import { EmojiPicker } from '@/components/emoji-picker';
import { Plus, Search, Users } from '@/components/icons';
import { PeopleTable } from '@/components/tables/people-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface CreateGroupSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGroupSheet({ open, onOpenChange }: CreateGroupSheetProps) {
  const [groupName, setGroupName] = React.useState('');
  const [groupIcon, setGroupIcon] = React.useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleEmojiSelect = (emoji: any) => {
    setGroupIcon(emoji.native);
    setIsEmojiPickerOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='left' className='w-[400px] sm:w-[540px]'>
        <div className='flex h-full flex-col'>
          {/* Header Section */}
          <div className='space-y-4 border-b pb-4'>
            <h2 className='text-lg font-semibold'>Create New Group</h2>
            <div className='flex items-center gap-4'>
              <div className='flex-1'>
                <Input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder='Enter group name'
                />
              </div>
              <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className='w-[60px] text-center text-lg'
                    onClick={() => setIsEmojiPickerOpen(true)}>
                    {groupIcon || '😀'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align='end' className='size-full p-0'>
                  <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Search Section */}
          <div className='border-b py-4'>
            <div className='relative'>
              <Search className='absolute left-2 top-2.5 size-4 text-muted-foreground' />
              <Input
                placeholder='Search people...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-8'
              />
            </div>
          </div>

          {/* People List Section */}
          {/* <div className='flex-1 overflow-auto py-4'>
            <PeopleTable
              people={[]} // We'll add the filtered people data here
              emptyMessage='No people found'
            />
          </div> */}

          {/* Footer Actions */}
          <div className='flex items-center justify-end gap-2 border-t py-4'>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button>Create Group</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
