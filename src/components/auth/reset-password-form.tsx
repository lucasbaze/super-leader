'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';

type ResetPasswordFormProps = {
  className?: string;
};

type FormStep = 'email' | 'success';

export function ResetPasswordForm({ className }: ResetPasswordFormProps) {
  const [step, setStep] = useState<FormStep>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error?.displayMessage || 'Unable to send reset email');
        return;
      }

      setStep('success');
    } catch (error) {
      setError('Unable to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <form onSubmit={handleSubmit}>
      <div className='flex flex-col gap-6'>
        <div className='flex flex-col items-center text-center'>
          <h1 className='text-2xl font-bold'>Reset Your Password</h1>
          <p className='text-balance text-muted-foreground'>
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <div className='grid gap-2'>
          <Label htmlFor='email' className='text-sm font-medium'>
            Email
          </Label>
          <Input
            id='email'
            name='email'
            type='email'
            placeholder='m@example.com'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus-visible:outline-none'
          />
        </div>

        {error && <div className='text-center text-sm text-red-600'>{error}</div>}

        <Button
          type='submit'
          disabled={isLoading || !email}
          className='flex h-12 w-full items-center justify-center rounded-md bg-gradient-to-r from-primary to-blue-500 px-6 text-sm text-white hover:opacity-90 disabled:opacity-50'>
          {isLoading ? 'Sending...' : 'Send Reset Email'}
        </Button>

        <div className='text-center text-sm'>
          Remember your password?{' '}
          <Link href={ROUTES.LOGIN} className='text-primary hover:underline'>
            Back to Sign In
          </Link>
        </div>
      </div>
    </form>
  );

  const renderSuccessStep = () => (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col items-center text-center'>
        <div className='mb-4 flex size-16 items-center justify-center rounded-full bg-green-100'>
          <span className='text-2xl'>📧</span>
        </div>
        <h1 className='text-2xl font-bold'>Check Your Email</h1>
        <p className='text-balance text-muted-foreground'>
          We've sent a password reset link to <strong>{email}</strong>
        </p>
      </div>

      <div className='rounded-md bg-blue-50 p-4'>
        <div className='text-sm text-blue-800'>
          <p className='mb-2'>
            <strong>Next steps:</strong>
          </p>
          <ol className='list-decimal space-y-1 pl-4'>
            <li>Check your email inbox (and spam folder)</li>
            <li>Click the password reset link in the email</li>
            <li>Create your new password</li>
          </ol>
        </div>
      </div>

      <div className='text-center text-sm text-gray-600'>
        Didn't receive the email? Check your spam folder or try again.
      </div>

      <div className='flex flex-col gap-3'>
        <Link
          href={ROUTES.LOGIN}
          className='flex h-12 w-full items-center justify-center rounded-md bg-gradient-to-r from-primary to-blue-500 px-6 text-sm text-white hover:opacity-90'>
          Back to Sign In
        </Link>

        <button
          type='button'
          onClick={() => setStep('email')}
          className='text-center text-sm text-gray-600 hover:text-gray-800'>
          Try a different email
        </button>
      </div>
    </div>
  );

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <Card className='mx-auto w-[100%] max-w-md overflow-hidden border border-white/20 bg-white/95 shadow-xl backdrop-blur-sm'>
        <CardContent className='p-8'>
          {step === 'email' && renderEmailStep()}
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
