'use client';

import { AvatarUpload } from '@/components/images/avatar-upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useState } from 'react';

export default function AccountSettingsPage() {
  const { data: profile, refetch } = useUserProfile();
  const [first, setFirst] = useState(profile?.first_name || '');
  const [last, setLast] = useState(profile?.last_name || '');

  const handleAvatarUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    await fetch('/api/user/profile/avatar', { method: 'POST', body: formData });
    refetch();
  };

  const handleSave = async () => {
    await fetch('/api/person/' + profile?.id + '/details', {
      method: 'PUT',
      body: JSON.stringify({ field: 'first_name', value: first })
    });
  };

  if (!profile) return null;
  return (
    <div className='mx-auto max-w-xl space-y-4 py-12'>
      <h1 className='text-2xl font-bold'>Account</h1>
      <div className='flex items-center gap-4'>
        <AvatarUpload
          name={profile.first_name || ''}
          imageUrl={profile.avatar_url}
          onUpload={handleAvatarUpload}
          className='size-20'
        />
        <div className='flex-1 space-y-2'>
          <Input value={first} onChange={(e) => setFirst(e.target.value)} />
          <Input value={last} onChange={(e) => setLast(e.target.value)} />
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
}
