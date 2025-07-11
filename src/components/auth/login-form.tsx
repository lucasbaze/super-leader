'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { Eye, EyeOff } from '@/components/icons';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';

type LoginFormProps = {
  className?: string;
  onSubmit: (formData: FormData) => Promise<void>;
  showUserNotFoundError?: boolean;
  showUnknownError?: boolean;
  emailForConfirmation?: string;
};

export function LoginForm({
  className,
  onSubmit,
  showUserNotFoundError = false,
  showUnknownError = false,
  emailForConfirmation = ''
}: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      // Reset loading state after submission
      // Note: This will only run if there's an error or if the submission doesn't redirect
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <Card className='mx-auto w-[100%] max-w-md overflow-hidden border border-white/20 bg-white/95 shadow-xl backdrop-blur-sm'>
        <CardContent className='p-8'>
          <form action={handleSubmit}>
            <div className='flex flex-col gap-6'>
              <div className='flex flex-col items-center text-center'>
                <Link href={ROUTES.HOME} className='mb-6'>
                  <Image
                    src='/images/horizontal-logo.png'
                    alt='Superleader'
                    width={180}
                    height={40}
                    className='size-auto'
                  />
                </Link>
                <h1 className='text-2xl font-bold'>Welcome Superleader</h1>
                <p className='text-balance text-muted-foreground'>Let's login to your super life</p>
              </div>

              {showUnknownError && (
                <div className='rounded-md border border-amber-200 bg-amber-50 p-4'>
                  <div className='flex flex-col gap-3'>
                    <div className='text-sm text-amber-800'>
                      <strong>Unknown Error</strong>
                      <p>Please check your email and password and try again.</p>
                    </div>
                  </div>
                </div>
              )}

              {showUserNotFoundError && (
                <div className='rounded-md border border-amber-200 bg-amber-50 p-4'>
                  <div className='flex flex-col gap-3'>
                    <div className='text-sm text-amber-800'>
                      <strong>User Not Found</strong>
                      <p>Please check your email and password and try again.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className='grid gap-2'>
                <Label htmlFor='email' className='text-sm font-medium'>
                  Email
                </Label>
                <input
                  id='email'
                  name='email'
                  type='email'
                  placeholder='m@example.com'
                  required
                  defaultValue={emailForConfirmation}
                  className='rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus-visible:outline-none'
                />
              </div>
              <div className='grid gap-2'>
                <div className='flex items-center'>
                  <Label htmlFor='password' className='text-sm font-medium'>
                    Password
                  </Label>
                </div>
                <div className='relative'>
                  <input
                    id='password'
                    name='password'
                    type={showPassword ? 'text' : 'password'}
                    required
                    className='w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus-visible:outline-none'
                  />
                  <button
                    type='button'
                    className='absolute right-0 top-0 flex h-full items-center px-3 py-2 hover:bg-transparent'
                    onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeOff className='size-4 text-gray-500' />
                    ) : (
                      <Eye className='size-4 text-gray-500' />
                    )}
                    <span className='sr-only'>{showPassword ? 'Hide password' : 'Show password'}</span>
                  </button>
                </div>
              </div>
              <button
                type='submit'
                disabled={isLoading}
                className='flex h-12 w-full items-center justify-center rounded-md bg-gradient-to-r from-primary to-blue-500 px-6 text-sm text-white hover:opacity-90 disabled:opacity-50'>
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
              <Link href={ROUTES.RESET_PASSWORD} className='text-center text-sm underline-offset-2 hover:underline'>
                Forgot your password?
              </Link>
              <div className='text-center text-sm'>
                Need an account?{' '}
                <Link href={ROUTES.CREATE_ACCOUNT} className='text-primary hover:underline'>
                  Create Account
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className='mx-auto max-w-md text-balance text-center text-xs text-white/70 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-white'>
        By clicking continue, you agree to our <Link href={ROUTES.TERMS}>Terms of Service</Link> and{' '}
        <Link href={ROUTES.PRIVACY}>Privacy Policy</Link>.
      </div>
    </div>
  );
}
