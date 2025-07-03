'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useTransition } from 'react';

import { Eye, EyeOff } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getPasswordRequirementsList, validatePassword } from '@/lib/auth/password-validation';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';

type CreateAccountFormProps = {
  className?: string;
  onResendConfirmation: (email: string) => Promise<{ success: boolean; error?: string }>;
};

type FormStep = 'email' | 'password' | 'verify';

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
};

export function CreateAccountForm({ className, onResendConfirmation }: CreateAccountFormProps) {
  const [step, setStep] = useState<FormStep>('email');
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const passwordRequirements = getPasswordRequirementsList();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/check-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error?.displayMessage || 'Unable to verify email access');
        return;
      }

      if (!result.data.hasAccess) {
        if (result.data.isOnWaitlist) {
          setError('Your account has not been opened for account creation yet');
        } else {
          setError('Your account has not been opened for account creation yet');
        }
        return;
      }

      setStep('password');
    } catch (error) {
      setError('Unable to verify email access. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!onResendConfirmation || !formData.email) return;

    startTransition(async () => {
      const result = await onResendConfirmation(formData.email);
      if (result.success) {
        setResendSuccess(true);
        setResendError('');
      } else {
        setResendError(result.error || 'Failed to resend confirmation email');
        setResendSuccess(false);
      }
    });
  };

  const handlePasswordChange = (password: string) => {
    setFormData((prev) => ({ ...prev, password }));
    const validation = validatePassword(password);
    setPasswordErrors(validation.errors);
  };

  const handleAccountCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    // Validate password requirements
    const validation = validatePassword(formData.password);
    if (!validation.isValid) {
      setError('Password does not meet requirements');
      return;
    }

    // Validate required fields
    if (!formData.firstName || !formData.lastName) {
      setError('First and last name are required');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error?.displayMessage || 'Unable to create account');
        return;
      }

      // Move to verification step
      setStep('verify');
    } catch (error) {
      setError('Unable to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <form onSubmit={handleEmailSubmit}>
      <div className='flex flex-col gap-6'>
        <div className='flex flex-col items-center text-center'>
          <Link href={ROUTES.HOME} className='mb-6'>
            <Image src='/images/horizontal-logo.png' alt='Superleader' width={180} height={40} className='size-auto' />
          </Link>
          <h1 className='text-2xl font-bold'>Create Your Account</h1>
          <p className='text-balance text-muted-foreground'>Let's get started with your super life</p>
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='email' className='text-sm font-medium'>
            Email
          </Label>
          <input
            id='email'
            name='email'
            type='email'
            placeholder='m@example.com'
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            required
            className='rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus-visible:outline-none'
          />
        </div>
        {error && <div className='text-center text-sm text-red-600'>{error}</div>}
        <Button
          type='submit'
          disabled={isLoading || !formData.email}
          className='flex h-12 w-full items-center justify-center rounded-md bg-gradient-to-r from-primary to-blue-500 px-6 text-sm text-white hover:opacity-90 disabled:opacity-50'>
          {isLoading ? 'Checking...' : 'Continue'}
        </Button>
        <div className='text-center text-sm'>
          Already have an account?{' '}
          <Link href={ROUTES.LOGIN} className='text-primary hover:underline'>
            Sign In
          </Link>
        </div>
      </div>
    </form>
  );

  const renderPasswordStep = () => (
    <form onSubmit={handleAccountCreation}>
      <div className='flex flex-col gap-6'>
        <div className='flex flex-col items-center text-center'>
          <h1 className='text-2xl font-bold'>Complete Your Account</h1>
          <p className='text-balance text-muted-foreground'>Creating account for {formData.email}</p>
        </div>

        {/* Name fields */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='grid gap-2'>
            <Label htmlFor='firstName' className='text-sm font-medium'>
              First Name
            </Label>
            <Input
              id='firstName'
              name='firstName'
              type='text'
              placeholder='John'
              value={formData.firstName}
              onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
              required
              className='rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus-visible:outline-none'
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='lastName' className='text-sm font-medium'>
              Last Name
            </Label>
            <Input
              id='lastName'
              name='lastName'
              type='text'
              placeholder='Doe'
              value={formData.lastName}
              onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
              required
              className='rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus-visible:outline-none'
            />
          </div>
        </div>

        {/* Password field */}
        <div className='grid gap-2'>
          <Label htmlFor='password' className='text-sm font-medium'>
            Password
          </Label>
          <div className='relative'>
            <Input
              id='password'
              name='password'
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
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
              const password = formData.password;

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
            Confirm Password
          </Label>
          <div className='relative'>
            <Input
              id='confirmPassword'
              name='confirmPassword'
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
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
          {formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <p className='text-xs text-red-600'>Passwords don't match</p>
          )}
        </div>

        {error && <div className='text-center text-sm text-red-600'>{error}</div>}

        <Button
          type='submit'
          disabled={
            isLoading ||
            passwordErrors.length > 0 ||
            formData.password !== formData.confirmPassword ||
            !formData.firstName ||
            !formData.lastName
          }
          className='flex h-12 w-full items-center justify-center rounded-md bg-gradient-to-r from-primary to-blue-500 px-6 text-sm text-white hover:opacity-90 disabled:opacity-50'>
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>

        <button
          type='button'
          onClick={() => setStep('email')}
          className='text-center text-sm text-gray-600 hover:text-gray-800'>
          ← Back to email
        </button>
      </div>
    </form>
  );

  const renderVerifyStep = () => (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col items-center text-center'>
        <div className='mb-4 flex size-16 items-center justify-center rounded-full bg-green-100'>
          <span className='text-2xl'>📧</span>
        </div>
        <h1 className='text-2xl font-bold'>Check Your Email</h1>
        <p className='text-balance text-muted-foreground'>
          We've sent a verification link to <strong>{formData.email}</strong>
        </p>
      </div>

      <div className='rounded-md bg-blue-50 p-4'>
        <div className='text-sm text-blue-800'>
          <p className='mb-2'>
            <strong>Next steps:</strong>
          </p>
          <ol className='list-decimal space-y-1 pl-4'>
            <li>Check your email inbox (and spam folder)</li>
            <li>Click the verification link in the email</li>
            <li>You'll be redirected back to sign in</li>
          </ol>
        </div>
      </div>

      <div className='text-center text-sm text-gray-600'>
        Didn't receive the email? Check your spam folder or{' '}
        <button
          type='button'
          onClick={handleResendConfirmation}
          disabled={isPending}
          className='hover:text-primary/80 text-primary underline disabled:opacity-50'>
          {isPending ? 'sending...' : 'resend confirmation email'}
        </button>
      </div>

      <div className='flex flex-col gap-2'>
        {resendSuccess && <p className='text-xs text-green-600'>Confirmation email sent! Please check your inbox.</p>}
        {resendError && <p className='text-xs text-red-600'>{resendError}</p>}
      </div>

      <Link
        href={ROUTES.LOGIN}
        className='flex h-12 w-full items-center justify-center rounded-md bg-gradient-to-r from-primary to-blue-500 px-6 text-sm text-white hover:opacity-90'>
        Go to Sign In
      </Link>
    </div>
  );

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <Card className='mx-auto w-[100%] max-w-md overflow-hidden border border-white/20 bg-white/95 shadow-xl backdrop-blur-sm'>
        <CardContent className='p-8'>
          {step === 'email' && renderEmailStep()}
          {step === 'password' && renderPasswordStep()}
          {step === 'verify' && renderVerifyStep()}
        </CardContent>
      </Card>
      <div className='mx-auto max-w-md text-balance text-center text-xs text-white/70 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-white'>
        By clicking continue, you agree to our <Link href={ROUTES.TERMS}>Terms of Service</Link> and{' '}
        <Link href={ROUTES.PRIVACY}>Privacy Policy</Link>.
      </div>
    </div>
  );
}
