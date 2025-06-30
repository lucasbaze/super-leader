'use client';

import { useState } from 'react';

import { Loader2, Trash } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useDeletePerson } from '@/hooks/use-person';
import type { Person } from '@/types/database';

interface DeletePersonModalProps {
  person: Person;
}

export function DeletePersonModal({ person }: DeletePersonModalProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deletePerson = useDeletePerson();

  const handleDelete = async () => {
    try {
      await deletePerson.mutateAsync(person.id);
    } catch (error) {
      console.error('Failed to delete person:', error);
    }
  };

  return (
    <>
      <Button variant='outline' size='sm' onClick={() => setIsDeleteDialogOpen(true)} disabled={deletePerson.isPending}>
        <Trash className='size-4 text-red-500' />
      </Button>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Warning ⚠️</DialogTitle>
            <DialogTitle>
              Are you sure you want to delete this {person.first_name} {person.last_name}?
            </DialogTitle>
          </DialogHeader>

          <DialogDescription>
            Deleting this person will remove all associated data including contacts, addresses, and interactions. This
            action cannot be undone.
          </DialogDescription>

          <DialogFooter>
            <Button variant='outline' onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleDelete} disabled={deletePerson.isPending}>
              {deletePerson.isPending ? <Loader2 className='mr-2 size-4 animate-spin' /> : 'Delete Person'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
