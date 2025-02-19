'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';

export default function Web() {
  return (
    <div className='flex h-[calc(100vh-64px)] flex-col items-center justify-center gap-4'>
      <h1 className='text-4xl font-bold text-gray-900'>Welcome to Super Leader!</h1>
      <Button asChild>
        <Link href={ROUTES.HOME}>Go to App</Link>
      </Button>
    </div>
  );
}
