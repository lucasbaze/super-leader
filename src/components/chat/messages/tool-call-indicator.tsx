import { useState } from 'react';

import { Brain, CheckIcon, ChevronDown, ChevronUp, Loader } from '@/components/icons';
import { CHAT_TOOLS, ChatTools } from '@/lib/chat/chat-tools';
import { cn } from '@/lib/utils';

interface ToolCallIndicatorProps {
  displayName: string;
  toolName: string;
  state: 'call' | 'result' | 'partial-call';
  args?: Record<string, any>;
}

export function ToolCallIndicator({ displayName, toolName, state, args }: ToolCallIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  console.log('toolName', toolName);

  if (toolName === CHAT_TOOLS.CREATE_USER_CONTEXT) {
    return (
      <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
        {state === 'call' || state === 'partial-call' ? (
          <Loader className='size-3.5 shrink-0 animate-spin text-muted-foreground' />
        ) : (
          <Brain className='size-3.5' />
        )}
        <span>Update Memory</span>
      </div>
    );
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
