import { redirect } from 'next/navigation';

import { OrbitalAvatars } from '@/components/animated/orbital-avatars';
import { UpdatePasswordForm } from '@/components/auth/update-password-form';
import { createClient } from '@/utils/supabase/server';

export default async function UpdatePasswordPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect('/login');
  }

  return (
    <div
      className='relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10'
      style={{ backgroundColor: '#060B15' }}>
      {/* Animated orbital background */}
      <OrbitalAvatars count={18} />

      {/* Update password form */}
      <div className='relative z-10 w-full max-w-sm'>
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
