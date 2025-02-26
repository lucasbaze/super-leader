import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ToolErrorCardProps {
  message: string;
  errorDetails: string;
  toolName: string;
}

export function ToolErrorCard({ message, errorDetails, toolName }: ToolErrorCardProps) {
  return (
    <div className='flex flex-col gap-2'>
      <div className='max-w-[90%] break-words rounded-lg bg-muted px-3 py-2 text-sm'>
        {message}
        <div className='mt-2'>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                className='flex items-center gap-2 text-destructive hover:text-destructive'>
                <AlertCircle className='size-4' />
                <span>View error details</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-80'>
              <div className='space-y-2'>
                <h4 className='font-medium'>Error Details: {toolName}</h4>
                <p className='text-sm text-muted-foreground'>{errorDetails}</p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
