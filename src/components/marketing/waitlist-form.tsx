'use client';

import { KeyboardEvent, useState } from 'react';

import { Loader } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleSubmit = async () => {
    if (!email) {
      setStatus({ type: 'error', message: 'Please enter your email address.' });
      return;
    }

    if (!isValidEmail(email)) {
      setStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    setIsLoading(true);
    setStatus({ type: null, message: '' });

    const supabase = createClient();

    try {
      const { error } = await supabase.from('waitlist').insert([{ email }]);

      if (error) {
        if (error.code === '23505') {
          // Unique constraint error
          setStatus({ type: 'error', message: "You're already registered!" });
        } else {
          throw error;
        }
      } else {
        setStatus({
          type: 'success',
          message: "Thank you for your interest. You're on the waitlist."
        });
        setEmail('');

        // Open Calendly in a new tab
        window.open('https://calendly.com/lucas-superleader/pre-onboarding', '_blank');
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Something went wrong. Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit();
    }
  };

  return (
    <div className='space-y-3'>
      <div className='flex flex-col gap-3 sm:flex-row sm:gap-4'>
        <input
          type='email'
          placeholder='you@email.com'
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status.type === 'error') {
              setStatus({ type: null, message: '' });
            }
          }}
          onKeyDown={handleKeyPress}
          className='flex-1 rounded-md border-0 bg-gray-100 px-4 py-3 text-sm focus:ring-2 focus:ring-gray-200 focus-visible:outline-none sm:text-base'
        />
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className='flex h-12 min-w-[100px] items-center justify-center rounded-md bg-gradient-to-r from-primary to-blue-500 px-6 text-sm text-white hover:opacity-90 disabled:opacity-50 sm:min-w-[120px] sm:px-8 sm:text-base'>
          {isLoading ? <Loader className='size-5 animate-spin' /> : 'Submit'}
        </Button>
      </div>
      {status.message && (
        <p className={`text-sm ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{status.message}</p>
      )}
    </div>
  );
}
