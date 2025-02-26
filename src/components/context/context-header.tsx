'use client';

import { useRouter } from 'next/navigation';

import { ChevronLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useUserProfile } from '@/hooks/use-user-profile';

export function ContextHeader() {
  const router = useRouter();
  const { data: userProfile } = useUserProfile();
  console.log(userProfile);

  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center'>
        <Button variant='ghost' size='icon' onClick={() => router.back()} className='mr-2'>
          <ChevronLeft className='size-4' />
        </Button>
        {userProfile?.first_name && (
          <h1 className='font-semibold'>{userProfile.first_name}'s Context</h1>
        )}
      </div>
    </div>
  );
}
