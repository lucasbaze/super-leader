import Image from 'next/image';

import { Logo as LogoIcon } from '@/components/icons/custom/logo';

export function Logo() {
  return (
    <div className='flex items-center gap-3'>
      <div className='relative size-10 sm:size-12'>
        <LogoIcon />
      </div>
      <div className='text-sm font-medium uppercase tracking-wide sm:text-base'>Superleader</div>
    </div>
  );
}
