'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Home } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { routes } from '@/lib/routes';

export default function ErrorPage() {
  return (
    <div className='flex min-h-[calc(100vh)] items-center justify-center bg-card p-4'>
      <Card className='w-full max-w-md border-none shadow-none'>
        <CardHeader className='flex flex-col items-center gap-2 pb-0'>
          <div className='flex size-40 items-center justify-center'>
            <Image
              src='/images/error.png'
              alt='Error: Dropped the ball'
              width={160}
              height={160}
              priority
              className='object-contain'
            />
          </div>
          <CardTitle className='mt-2 text-center text-xl font-bold text-black'>
            Sorry, it seems we&apos;ve dropped the ball.
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4 text-center'>
          <p className='text-base text-black/80'>
            An unexpected error has occurred.
            <br />
            We&apos;re juggling a fix as fast as we can.
            <br />
            Please try again or head back home.
          </p>
        </CardContent>
        <CardFooter className='flex flex-col gap-2 border-t border-black/10 pt-4 sm:flex-row sm:justify-center'>
          <Link href={routes.app()}>
            <Button variant='outline' className='border-black text-black'>
              <Home className='size-4' />
              <span>Go Home</span>
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
