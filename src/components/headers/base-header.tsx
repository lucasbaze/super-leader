'use client';

import { useRouter } from 'next/navigation';

import { ChevronLeft } from '@/components/icons';
import { Button } from '@/components/ui/button';

interface BaseHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function BaseHeader({ children, className }: BaseHeaderProps) {
  const router = useRouter();

  return (
    <div className='flex h-12 items-center rounded-t-sm border-b p-1 pr-4'>
      <Button variant='ghost' size='icon' onClick={() => router.back()} className='mr-2'>
        <ChevronLeft className='size-4' />
      </Button>
      <div className={className}>{children}</div>
    </div>
  );
}
