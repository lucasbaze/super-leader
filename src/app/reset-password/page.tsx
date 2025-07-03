import { OrbitalAvatars } from '@/components/animated/orbital-avatars';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export default function ResetPasswordPage() {
  return (
    <div
      className='relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10'
      style={{ backgroundColor: '#060B15' }}>
      {/* Animated orbital background */}
      <OrbitalAvatars count={18} />

      {/* Reset password form */}
      <div className='relative z-10 w-full max-w-sm'>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
