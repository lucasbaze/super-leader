'use client';

import { useState } from 'react';

import { toast } from 'sonner';

import { SearchPersonItem } from '@/components/groups/search-person-item';
import { Loader, Search } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { useAddGroupMembers } from '@/hooks/use-groups';
import { useSimpleSearchPeople } from '@/hooks/use-simple-search-people';

interface AddPeopleSheetProps {
  groupId: string;
  groupSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddPeopleSheet({ groupId, groupSlug, open, onOpenChange }: AddPeopleSheetProps) {
  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>([]);
  const { setSearchTerm, people, isLoading } = useSimpleSearchPeople();
  const addMembers = useAddGroupMembers();

  const handlePersonSelect = (personId: string) => {
    setSelectedPersonIds((current) =>
      current.includes(personId) ? current.filter((id) => id !== personId) : [...current, personId]
    );
  };

  const handleSubmit = async () => {
    try {
      await addMembers.mutateAsync({
        groupId,
        groupSlug,
        personIds: selectedPersonIds
      });

      toast.success('People added to group successfully');
      onOpenChange(false);
      setSelectedPersonIds([]); // Reset selection
    } catch (error) {
      toast.error('Failed to add people to group');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <VisuallyHidden>
        <SheetTitle>Add People to Group</SheetTitle>
      </VisuallyHidden>
      <SheetContent side='right' className='w-[400px] sm:w-[540px]'>
        <div className='flex h-full flex-col'>
          {/* Header Section */}
          <div className='space-y-4 border-b pb-4'>
            <SheetHeader>
              <h2 className='text-lg font-semibold'>Add People to Group</h2>
            </SheetHeader>
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

          {/* Footer with Action Button */}
          <div className='border-t pt-4'>
            <Button
              onClick={handleSubmit}
              disabled={selectedPersonIds.length === 0 || addMembers.isPending}
              className='w-full'>
              {addMembers.isPending ? (
                <Loader className='size-4 animate-spin' />
              ) : (
                `Add ${selectedPersonIds.length} ${
                  selectedPersonIds.length === 1 ? 'Person' : 'People'
                }`
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
