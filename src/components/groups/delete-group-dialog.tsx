'use client';

import { useRouter } from 'next/navigation';

import { Loader } from '@/components/icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useDeleteGroup } from '@/hooks/use-groups';

interface DeleteGroupDialogProps {
  groupId: string;
  groupName: string;
  memberCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteGroupDialog({
  groupId,
  groupName,
  memberCount,
  open,
  onOpenChange
}: DeleteGroupDialogProps) {
  const router = useRouter();
  const deleteGroup = useDeleteGroup();

  const handleDelete = async () => {
    await deleteGroup.mutateAsync(groupId);
    onOpenChange(false);
    router.push('/app/groups/inner-5');
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {groupName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the group and remove all {memberCount} members from it.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteGroup.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant='destructive' onClick={handleDelete} disabled={deleteGroup.isPending}>
              {deleteGroup.isPending ? (
                <>
                  <Loader className='mr-2 size-4 animate-spin' />
                  Deleting...
                </>
              ) : (
                'Delete Group'
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
