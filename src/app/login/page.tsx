import { OrbitalAvatars } from '@/components/animated/orbital-avatars';
import { LoginForm } from '@/components/auth/login-form';

import { login, resendConfirmationEmail } from './actions';

type LoginPageProps = {
  searchParams: Promise<{ error?: string; email?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const showConfirmationError = params.error === 'email_not_confirmed';
  const showUserNotFoundError = params.error === 'user_not_found';
  const showUnknownError = params.error === 'unknown_error';
  const emailForConfirmation = params.email || '';

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

      {/* Login form */}
      <div className='relative z-10 w-full max-w-sm'>
        <LoginForm
          onSubmit={login}
          onResendConfirmation={handleResendConfirmation}
          showConfirmationError={showConfirmationError}
          showUserNotFoundError={showUserNotFoundError}
          emailForConfirmation={emailForConfirmation}
          showUnknownError={showUnknownError}
        />
      </div>
    </div>
  );
}
