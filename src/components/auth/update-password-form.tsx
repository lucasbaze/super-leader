'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Eye, EyeOff } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getPasswordRequirementsList, validatePassword } from '@/lib/auth/password-validation';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';

type UpdatePasswordFormProps = {
  className?: string;
};

type FormStep = 'password' | 'success';

export function UpdatePasswordForm({ className }: UpdatePasswordFormProps) {
  const [step, setStep] = useState<FormStep>('password');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const passwordRequirements = getPasswordRequirementsList();

  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword);
    const validation = validatePassword(newPassword);
    setPasswordErrors(validation.errors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    // Validate password requirements
    const validation = validatePassword(password);
    if (!validation.isValid) {
      setError('Password does not meet requirements');
      return;
    }

    try {
      const supabase = createClient();
      const response = await supabase.auth.updateUser({
        password
      });

      if (!response.data.user) {
        setError(response.error?.message || 'Unable to update password');
        return;
      }

      setStep('success');
    } catch (error) {
      setError('Unable to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPasswordStep = () => (
    <form onSubmit={handleSubmit}>
      <div className='flex flex-col gap-6'>
        <div className='flex flex-col items-center text-center'>
          <h1 className='text-2xl font-bold'>Create New Password</h1>
          <p className='text-balance text-muted-foreground'>Enter your new password below</p>
        </div>

        {/* Password field */}
        <div className='grid gap-2'>
          <Label htmlFor='password' className='text-sm font-medium'>
            New Password
          </Label>
          <div className='relative'>
            <Input
              id='password'
              name='password'
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              required
              className='w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus-visible:outline-none'
            />
            <button
              type='button'
              className='absolute right-0 top-0 flex h-full items-center px-3 py-2 hover:bg-transparent'
              onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff className='size-4 text-gray-500' /> : <Eye className='size-4 text-gray-500' />}
              <span className='sr-only'>{showPassword ? 'Hide password' : 'Show password'}</span>
            </button>
          </div>
        </div>

        {/* Password requirements */}
        <div className='text-xs text-gray-600'>
          <p className='mb-1 font-medium'>Password requirements:</p>
          <ul className='space-y-1'>
            {passwordRequirements.map((requirement, index) => {
              let isValid = true;

              if (index === 0) isValid = password.length >= 8;
              else if (index === 1) isValid = /[A-Z]/.test(password);
              else if (index === 2) isValid = /[a-z]/.test(password);
              else if (index === 3) isValid = /[0-9]/.test(password);
              else if (index === 4) isValid = /[^A-Za-z0-9]/.test(password);

              return (
                <li key={index} className={cn('flex items-center gap-2', isValid ? 'text-green-600' : 'text-red-600')}>
                  <span className='text-xs'>{isValid ? '✅' : '❌'}</span>
                  {requirement}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Confirm password field */}
        <div className='grid gap-2'>
          <Label htmlFor='confirmPassword' className='text-sm font-medium'>
            Confirm New Password
          </Label>
          <div className='relative'>
            <Input
              id='confirmPassword'
              name='confirmPassword'
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className='w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus-visible:outline-none'
            />
            <button
              type='button'
              className='absolute right-0 top-0 flex h-full items-center px-3 py-2 hover:bg-transparent'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? (
                <EyeOff className='size-4 text-gray-500' />
              ) : (
                <Eye className='size-4 text-gray-500' />
              )}
              <span className='sr-only'>{showConfirmPassword ? 'Hide password' : 'Show password'}</span>
            </button>
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className='text-xs text-red-600'>Passwords don't match</p>
          )}
        </div>

        {error && <div className='text-center text-sm text-red-600'>{error}</div>}

        <Button
          type='submit'
          disabled={
            isLoading || passwordErrors.length > 0 || password !== confirmPassword || !password || !confirmPassword
          }
          className='flex h-12 w-full items-center justify-center rounded-md bg-gradient-to-r from-primary to-blue-500 px-6 text-sm text-white hover:opacity-90 disabled:opacity-50'>
          {isLoading ? 'Updating Password...' : 'Update Password'}
        </Button>
      </div>
    </form>
  );

  const renderSuccessStep = () => (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col items-center text-center'>
        <div className='mb-4 flex size-16 items-center justify-center rounded-full bg-green-100'>
          <span className='text-2xl'>✅</span>
        </div>
        <h1 className='text-2xl font-bold'>Password Updated!</h1>
        <p className='text-balance text-muted-foreground'>
          Your password has been successfully updated. You can now sign in with your new password.
        </p>
      </div>

      <div className='rounded-md bg-green-50 p-4'>
        <div className='text-sm text-green-800'>
          <p className='mb-2'>
            <strong>What's next:</strong>
          </p>
          <ul className='list-disc space-y-1 pl-4'>
            <li>Use your new password to sign in</li>
            <li>Consider updating your password manager</li>
            <li>Your account is now secure with the new password</li>
          </ul>
        </div>
      </div>

      <Link
        href={ROUTES.LOGIN}
        className='flex h-12 w-full items-center justify-center rounded-md bg-gradient-to-r from-primary to-blue-500 px-6 text-sm text-white hover:opacity-90'>
        Sign In
      </Link>
    </div>
  );

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <Card className='mx-auto w-[100%] max-w-md overflow-hidden border border-white/20 bg-white/95 shadow-xl backdrop-blur-sm'>
        <CardContent className='p-8'>
          {step === 'password' && renderPasswordStep()}
          {step === 'success' && renderSuccessStep()}
        </CardContent>
      </Card>
      <div className='mx-auto max-w-md text-balance text-center text-xs text-white/70 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-white'>
        By clicking continue, you agree to our <Link href={ROUTES.TERMS}>Terms of Service</Link> and{' '}
        <Link href={ROUTES.PRIVACY}>Privacy Policy</Link>.
      </div>
    </div>
  );
}
