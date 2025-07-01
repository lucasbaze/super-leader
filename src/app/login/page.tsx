import { OrbitalAvatars } from '@/components/animated/orbital-avatars';
import { LoginForm } from '@/components/login-form';

import { login } from './actions';

export default function LoginPage() {
  return (
    <div
      className='relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10'
      style={{ backgroundColor: '#060B15' }}>
      {/* Animated orbital background */}
      <OrbitalAvatars count={18} />

      {/* Login form */}
      <div className='relative z-10 w-full max-w-sm'>
        <LoginForm onSubmit={login} />
      </div>
    </div>
  );
}
