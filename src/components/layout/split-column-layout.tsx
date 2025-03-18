'use client';

import { ReactNode } from 'react';

interface SplitLayoutProps {
  leftContent: ReactNode;
  children: ReactNode;
}

export function SplitLayout({ leftContent, children }: SplitLayoutProps) {
  return (
    <div className='flex min-h-screen'>
      {/* Left column - Fixed */}
      <div className='bg-primary-900 fixed inset-y-0 left-0 flex w-1/3 flex-col justify-center p-10'>
        {leftContent}
      </div>

      {/* Right column - Scrollable */}
      <div className='ml-[33.333%] min-h-screen w-2/3 overflow-y-auto bg-background p-12'>
        {children}
      </div>
    </div>
  );
}
