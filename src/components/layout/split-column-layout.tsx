'use client';

import { ReactNode } from 'react';

interface SplitLayoutProps {
  leftContent: ReactNode;
  children: ReactNode;
}

export function SplitLayout({ leftContent, children }: SplitLayoutProps) {
  return (
    <div className='flex min-h-screen'>
      {/* Left column */}
      <div className='bg-primary-900 flex w-1/3 flex-col justify-center p-10'>{leftContent}</div>

      {/* Right column */}
      <div className='w-2/3 bg-background p-12'>{children}</div>
    </div>
  );
}
