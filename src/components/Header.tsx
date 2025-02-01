'use client';


import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { createClient } from '@/utils/supabase/client';

export default function Header() {
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      setEmail(user?.email ?? null);
    };

    getUser();

    // Set up auth state change listener
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <header className='fixed inset-x-0 top-0 z-10 bg-white shadow'>
      <div className='mx-auto flex max-w-7xl items-center justify-between p-4 sm:px-6 lg:px-8'>
        <Link href='/' className='text-xl font-bold text-gray-900'>
          Super Leader
        </Link>
        <div className='flex items-center gap-4'>
          {email ? (
            <>
              <span className='text-sm text-gray-600'>{email}</span>
              <Link
                href='/app'
                className='rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500'>
                Go to Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className='rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500'>
                Sign out
              </button>
            </>
          ) : (
            <Link
              href='/login'
              className='rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500'>
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
