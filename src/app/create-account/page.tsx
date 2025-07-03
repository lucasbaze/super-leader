import { OrbitalAvatars } from '@/components/animated/orbital-avatars';
import { CreateAccountForm } from '@/components/auth/create-account-form';

import { resendConfirmationEmail } from './actions';

export default function CreateAccountPage() {
  // Client action wrapper for resend confirmation
  const handleResendConfirmation = async (email: string) => {
    'use server';
    return await resendConfirmationEmail(email);
  };

  return (
    <div
      className='relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10'
      style={{ backgroundColor: '#060B15' }}>
      {/* Animated orbital background */}
      <OrbitalAvatars count={18} />

      {/* Create account form */}
      <div className='relative z-10 w-full max-w-sm'>
        <CreateAccountForm onResendConfirmation={handleResendConfirmation} />
      </div>
    </div>
  );
}
