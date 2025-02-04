'use client';

import { useState } from 'react';

import { CheckIcon, CopyIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

type TMessageCardProps = {
  message: string;
  tone?: string;
  url?: string;
  className?: string;
};

export function MessageCard({ message, tone, url, className }: TMessageCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const textToCopy = url ? `${message}\n${url}` : message;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className={cn('rounded-lg border bg-card p-4', className)}>
      <div className='space-y-2'>
        {tone && (
          <div className='text-sm text-muted-foreground'>
            Tone: <span className='font-medium'>{tone}</span>
          </div>
        )}
        <p className='text-sm'>{message}</p>
        {url && <p className='break-all text-sm text-muted-foreground'>{url}</p>}
      </div>
      <button
        onClick={handleCopy}
        className='mt-4 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground'>
        {copied ? (
          <>
            <CheckIcon className='size-4' />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <CopyIcon className='size-4' />
            <span>Copy to clipboard</span>
          </>
        )}
      </button>
    </div>
  );
}
