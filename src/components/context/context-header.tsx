'use client';

import { BaseHeader } from '@/components/headers/base-header';
import { Loader, Sparkles } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useUpdateUserProfileSummary } from '@/hooks/use-update-user-profile-summary';
import { useUserProfile } from '@/hooks/use-user-profile';

export function ContextHeader() {
  const { data: userProfile } = useUserProfile();
  const updateUserProfileSummary = useUpdateUserProfileSummary();

  return (
    <BaseHeader>
      <div className='flex w-full items-center justify-between'>
        {userProfile?.first_name && (
          <h1 className='text-md font-semibold text-muted-foreground'>{userProfile.first_name}'s Goals</h1>
        )}
        <Button
          variant='outline'
          size='sm'
          onClick={() => updateUserProfileSummary.mutate()}
          disabled={updateUserProfileSummary.isPending}>
          {updateUserProfileSummary.isPending ? (
            <>
              <Loader className='mr-2 size-4 animate-spin' />
              Updating...
            </>
          ) : (
            <>
              <Sparkles className='mr-2 size-4' />
              Update Summary
            </>
          )}
        </Button>
      </div>
    </BaseHeader>
  );
}
