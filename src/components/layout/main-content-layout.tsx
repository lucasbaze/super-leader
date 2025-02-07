'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

interface MainContentLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MainContentLayout({ children, className }: MainContentLayoutProps) {
  return (
    <div
      className={cn(
        'relative flex min-h-svh flex-col bg-background',
        'min-h-[calc(100svh-theme(spacing.16))] md:m-1 md:rounded-md md:border',
        className
      )}>
      {children}
    </div>
  );
}
