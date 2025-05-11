import Image from 'next/image';
import Link from 'next/link';

import { AvatarGroup } from '@/components/marketing/avatar-group';
import { Logo } from '@/components/marketing/logo';
import { WaitlistForm } from '@/components/marketing/waitlist-form';

export default function Home() {
  return (
    <div className='flex min-h-screen flex-col bg-black'>
      <div className='flex min-h-screen flex-col overflow-y-visible md:flex-row'>
        {/* Left Content */}
        <div className='flex w-full flex-col justify-between bg-white p-6 sm:p-8 md:w-1/2 md:p-12 lg:p-16'>
          <div>
            <div className='mb-8 md:mb-12'>
              <Logo />
            </div>

            <div className='max-w-xl space-y-4 md:space-y-6'>
              <h1 className='text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl'>You, but Super</h1>

              <h2 className='text-xl font-medium text-gray-700 sm:text-2xl md:text-3xl'>
                An AI first, Personal CRM to help you nurture and scale your relationships for life.
              </h2>

              <p className='text-lg font-bold sm:text-xl'>Join the Superleader waitlist.</p>
              <WaitlistForm />

              <div className='flex items-center gap-2'>
                <AvatarGroup />
                <span className='text-xs text-gray-500 sm:text-sm'>100+ people ahead of you.</span>
              </div>
              <div>
                <Link href='/app' className='text-xs text-gray-500 sm:text-sm'>
                  Already got access?
                </Link>
              </div>
            </div>
          </div>

          <div className='mt-6 md:mt-8'>
            <div className='mt-6 text-xs text-gray-400 sm:text-sm md:mt-8'>
              <div className='flex flex-col gap-2 sm:flex-row sm:gap-6'>
                <span>© 2025 Superleader AI, Inc.</span>
                <div className='flex gap-4'>
                  <Link href='/legal/terms' className='hover:text-gray-600'>
                    Terms of Use
                  </Link>
                  <Link href='/legal/privacy' className='hover:text-gray-600'>
                    Privacy Policy
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div
          className='flex w-full items-center justify-center p-6 sm:p-8 md:w-1/2 md:p-0'
          style={{ backgroundColor: '#060B15' }}>
          <div className='relative w-full'>
            <Image
              src='/images/hero-suggestions.png'
              alt='Superleader App Interface'
              width={600}
              height={900}
              className='mx-auto'
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
