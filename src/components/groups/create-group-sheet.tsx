'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { toast } from 'sonner';

import { EmojiPicker } from '@/components/emoji-picker';
import { SearchPersonItem } from '@/components/groups/search-person-item';
import { Loader, Plus, Search, Users } from '@/components/icons';
import { PeopleTable } from '@/components/tables/people-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { useCreateGroup } from '@/hooks/use-groups';
import { useSimpleSearchPeople } from '@/hooks/use-simple-search-people';
import { routes } from '@/lib/routes';

interface CreateGroupSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGroupSheet({ open, onOpenChange }: CreateGroupSheetProps) {
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [groupIcon, setGroupIcon] = useState('😀'); // Default emoji
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>([]);

  const { setSearchTerm, people, isLoading } = useSimpleSearchPeople();

  useEffect(() => {
    console.log('Search Results:', { people, isLoading });
  }, [people, isLoading]);

  const createGroup = useCreateGroup();

  const handleEmojiSelect = (emoji: any) => {
    setGroupIcon(emoji.native);
    setIsEmojiPickerOpen(false);
  };

  const handleSubmit = async () => {
    try {
      const group = await createGroup.mutateAsync({
        name: groupName,
        icon: groupIcon,
        person_ids: selectedPersonIds.length > 0 ? selectedPersonIds : undefined
      });

      toast.success('Group created successfully');
      onOpenChange(false);
      // Reset form
      setGroupName('');
      setGroupIcon('😀');
      setSelectedPersonIds([]);

      // Navigate to the new group
      router.push(routes.groups.byId({ id: group.id }));
    } catch (error) {
      toast.error('Failed to create group');
    }
  };

  const isValid = groupName.trim().length > 0;

  const handlePersonSelect = (personId: string) => {
    setSelectedPersonIds((current) =>
      current.includes(personId) ? current.filter((id) => id !== personId) : [...current, personId]
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <VisuallyHidden>
        <SheetTitle>Create New Group</SheetTitle>
      </VisuallyHidden>
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
                    {groupIcon}
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-8'
              />
            </div>
          </div>

          {/* People List Section */}
          <div className='no-scrollbar flex-1 space-y-2 overflow-auto py-4'>
            {isLoading ? (
              <div className='flex items-center justify-center py-8'>
                <Loader className='size-6 animate-spin text-muted-foreground' />
              </div>
            ) : people.length === 0 ? (
              <div className='flex items-center justify-center py-8 text-muted-foreground'>
                No people found
              </div>
            ) : (
              <div className='space-y-2'>
                {people.map((person) => (
                  <SearchPersonItem
                    key={person.id}
                    person={person}
                    isSelected={selectedPersonIds.includes(person.id)}
                    onClick={() => handlePersonSelect(person.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className='flex items-center justify-end gap-2 border-t pt-4'>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!isValid || createGroup.isPending}>
              {createGroup.isPending ? (
                <Loader className='mr-2 size-4 animate-spin' />
              ) : (
                'Create Group'
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
