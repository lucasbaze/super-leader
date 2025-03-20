import { useState } from 'react';

import { Brain, CheckIcon, ChevronDown, ChevronUp, Loader } from '@/components/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CHAT_TOOLS } from '@/lib/chat/tools/constants';
import { cn } from '@/lib/utils';

interface ToolCallIndicatorProps {
  displayName: string;
  toolName: string;
  state: 'call' | 'result' | 'partial-call';
  args?: Record<string, any>;
}

export function ToolCallIndicator({ displayName, toolName, state, args }: ToolCallIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (toolName === CHAT_TOOLS.CREATE_USER_CONTEXT) {
    // Option 1: Using Tooltip with custom styling
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className='flex w-fit cursor-pointer items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground'>
              {state === 'call' || state === 'partial-call' ? (
                <Loader className='size-3.5 shrink-0 animate-spin text-muted-foreground' />
              ) : (
                <Brain className='size-3.5' />
              )}
              <span>Update Memory</span>
            </div>
          </TooltipTrigger>
          {args && (
            <TooltipContent
              className='max-h-24 w-80 overflow-y-auto rounded-md border bg-popover p-4 text-popover-foreground shadow-md'
              sideOffset={10}>
              <div className='space-y-2'>
                <h4 className='mb-1 font-medium'>Memory Update Details</h4>
                {args.content}
                {/* <pre className='whitespace-pre text-xs text-muted-foreground'>
                  <code>{JSON.stringify(args.content, null, 2)}</code>
                </pre> */}
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );

    // Option 2: Using Popover with hover trigger
    /*
    return (
      <Popover>
        <PopoverTrigger asChild>
          <div 
            className='flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground'
            onMouseEnter={(e) => {
              const target = e.currentTarget;
              const popoverTrigger = target.closest('[data-radix-popper-trigger]');
              if (popoverTrigger) {
                popoverTrigger.click();
              }
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget;
              const popoverTrigger = target.closest('[data-radix-popper-trigger]');
              if (popoverTrigger) {
                popoverTrigger.click();
              }
            }}
          >
            {state === 'call' || state === 'partial-call' ? (
              <Loader className='size-3.5 shrink-0 animate-spin text-muted-foreground' />
            ) : (
              <Brain className='size-3.5' />
            )}
            <span>Update Memory</span>
          </div>
        </PopoverTrigger>
        {args && (
          <PopoverContent className='w-80'>
            <div className='space-y-2'>
              <h4 className='font-medium'>Memory Update Details</h4>
              <pre className='whitespace-pre text-xs text-muted-foreground'>
                <code>{JSON.stringify(args, null, 2)}</code>
              </pre>
            </div>
          </PopoverContent>
        )}
      </Popover>
    );
    */
  }

  return (
    <div className='w-full max-w-[90%]'>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'flex w-full items-center gap-3 border px-4 py-2',
          'hover:bg-muted/50 bg-background transition-colors',
          isExpanded ? 'rounded-t-lg border-b-0' : 'rounded-lg'
        )}>
        <div className='flex min-w-0 flex-1 items-center gap-2'>
          {state === 'call' || state === 'partial-call' ? (
            <Loader className='size-4 shrink-0 animate-spin text-muted-foreground' />
          ) : (
            <CheckIcon className='size-4 shrink-0 text-green-500' />
          )}
          <span className='truncate text-sm font-medium'>{displayName}</span>
        </div>

        {args && (
          <div className='ml-auto shrink-0'>
            {isExpanded ? (
              <ChevronUp className='size-4 text-muted-foreground' />
            ) : (
              <ChevronDown className='size-4 text-muted-foreground' />
            )}
          </div>
        )}
      </button>

      {isExpanded && args && (
        <div className='bg-muted/30 rounded-b-lg border'>
          <div className='overflow-x-auto p-3'>
            <pre className='whitespace-pre text-xs'>
              <code>{JSON.stringify(args, null, 2)}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
