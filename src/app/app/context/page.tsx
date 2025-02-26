'use client';

import { useEffect, useState } from 'react';

import { ContextHeader } from '@/components/context/context-header';
import { ContextTabs } from '@/components/context/context-tabs';
import { useUserProfile } from '@/hooks/use-user-profile';
import { ContextSummary } from '@/services/context/schemas';

export default function ContextPage() {
  const { data: userProfile, isLoading } = useUserProfile();
  const [contextSummary, setContextSummary] = useState<ContextSummary | null>(null);

  useEffect(() => {
    if (userProfile?.context_summary) {
      setContextSummary(userProfile.context_summary as unknown as ContextSummary);
    }
  }, [userProfile]);

  return (
    <div className='absolute inset-0 flex flex-col'>
      <div className='border-b bg-background p-1'>
        <ContextHeader />
      </div>
      <div className='flex-1 overflow-hidden'>
        {isLoading ? (
          <div className='flex h-full items-center justify-center'>
            <p>Loading context...</p>
          </div>
        ) : (
          <ContextTabs contextSummary={contextSummary} />
        )}
      </div>
    </div>
  );
}
