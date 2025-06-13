'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Home } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className='flex min-h-[calc(100vh)] items-center justify-center bg-white p-4'>
      <Card className='w-full max-w-md border-none bg-white shadow-none'>
        <CardHeader className='flex flex-col items-center gap-2 pb-0'>
          <div className='flex size-40 items-center justify-center'>
            <Image
              src='/images/404.png'
              alt='404: Page not found'
              width={160}
              height={160}
              priority
              className='object-contain'
            />
          </div>
          <CardTitle className='mt-2 text-center text-xl font-bold text-black'>
            Uh oh, we got lost in the network.
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4 text-center'>
          <p className='text-base text-black/80'>
            Looks like the page you are looking for does not exist.
            <br />
            Please try again or head back home.
          </p>
        </CardContent>
        <CardFooter className='flex flex-col gap-2 border-t border-black/10 pt-4 sm:flex-row sm:justify-center'>
          <Button variant='outline' className='border-black text-black' onClick={() => router.back()}>
            <Home className='size-4' />
            <span>Go Back</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
