import { useState } from 'react';

import { CheckIcon, ChevronDown, ChevronUp, Loader } from '@/components/icons';
import { ChatTools } from '@/lib/chat/chat-tools';
import { cn } from '@/lib/utils';

interface TToolCallIndicatorProps {
  toolName: string;
  state: 'call' | 'result' | 'partial-call';
  args?: Record<string, any>;
}

export function ToolCallIndicator({ toolName, state, args }: TToolCallIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get display name from tools config, fallback to toolName if not found
  const displayName = ChatTools.get(toolName)?.displayName || toolName;

  return (
    <div className='w-full max-w-[90%]'>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg border px-4 py-2',
          'hover:bg-muted/50 bg-background transition-colors'
        )}>
        <div className='flex min-w-0 flex-1 items-center gap-2'>
          {state === 'call' ? (
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
        <div className='bg-muted/30 mt-2 rounded-lg border'>
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
