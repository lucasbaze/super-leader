'use client';

import { BaseHeader } from '@/components/headers/base-header';
import { useUserProfile } from '@/hooks/use-user-profile';

export function ContextHeader() {
  const { data: userProfile } = useUserProfile();

  return (
    <BaseHeader>
      {userProfile?.first_name && (
        <h1 className='text-md font-semibold text-muted-foreground'>
          {userProfile.first_name}'s Goals
        </h1>
      )}
    </BaseHeader>
  );
}
