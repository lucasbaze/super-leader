'use client';

import { useState } from 'react';

import { AlarmClock, Check, ChevronDown, Gift, Info, Loader, User, X } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTaskActions } from '@/hooks/use-task-actions';
import { TASK_TRIGGERS } from '@/lib/tasks/constants';
import { cn } from '@/lib/utils';
import type { GetTaskSuggestionResult } from '@/services/tasks/types';

type BaseTaskCardProps = {
  task: Omit<GetTaskSuggestionResult, 'suggested_action_type' | 'suggested_action'>;
  actionBody: React.ReactNode;
};

export function BaseTaskCard({ task, actionBody }: BaseTaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const { completeTask, skipTask, isLoading } = useTaskActions();

  const handleAction = async (action: () => Promise<any>, actionName: string) => {
    try {
      setActionInProgress(actionName);
      await action();
    } finally {
      setActionInProgress(null);
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case TASK_TRIGGERS.BIRTHDAY_REMINDER.slug:
        return <Gift className='size-4' />;
      case TASK_TRIGGERS.CONTEXT_GATHER.slug:
        return <User className='size-4' />;
      case TASK_TRIGGERS.FOLLOW_UP.slug:
        return <AlarmClock className='size-4' />;
      default:
        return <Info className='size-4' />;
    }
  };

  return (
    <Card className='relative w-full min-w-[500px] overflow-hidden shadow-sm'>
      {/* Card Header - Always visible */}
      <div className='group p-4'>
        <div className='flex items-start'>
          <Avatar className='mr-4 size-10 flex-shrink-0'>
            <AvatarImage
              src={`https://i.pravatar.cc/150?u=${task.person.id}`}
              alt={`${task.person.first_name} ${task.person.last_name}`}
            />
            <AvatarFallback>{task.person.first_name[0]}</AvatarFallback>
          </Avatar>

          <div className='min-w-0 flex-1'>
            <div className='flex items-start justify-between'>
              <h3 className='font-medium'>
                {task.person.first_name} {task.person.last_name}
              </h3>
              <span className='text-sm text-muted-foreground'>Today</span>
            </div>

            <div className='mt-1 flex items-center justify-between'>
              <div className='flex items-center text-sm text-muted-foreground'>
                {getActionIcon(task.trigger)}
                <span className='ml-1'>{task.context.context}</span>
              </div>

              <div className='flex items-center gap-2'>
                {/* Actions (visible on hover) */}
                <div className='flex translate-x-4 items-center gap-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100'>
                  <TooltipProvider>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='size-7 rounded-full p-0'
                          title='Complete'
                          onClick={(e) => {
                            e.preventDefault();
                            handleAction(() => completeTask(task.id), 'complete');
                          }}
                          disabled={isLoading || actionInProgress !== null}>
                          {isLoading ? (
                            <Loader className='size-4 animate-spin' />
                          ) : (
                            <Check className='size-3.5 text-green-500' />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Complete task</TooltipContent>
                    </Tooltip>
                    {/* <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-7 w-7 rounded-full p-0'
                          onClick={() => onTaskAction('snooze')}
                          title='Snooze'>
                          <Clock className='h-3.5 w-3.5 text-amber-500' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Snooze task</TooltipContent>
                    </Tooltip> */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='size-7 rounded-full p-0'
                          onClick={(e) => {
                            e.preventDefault();
                            handleAction(() => skipTask(task.id), 'skip');
                          }}
                          title='Skip'
                          disabled={isLoading || actionInProgress !== null}>
                          {isLoading ? (
                            <Loader className='size-4 animate-spin' />
                          ) : (
                            <X className='size-3.5 text-red-500' />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Skip task</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion Header - Context with expand/collapse control */}
      <div
        className='border-border/50 hover:bg-muted/50 flex cursor-pointer items-center border-t px-4 py-2 transition-colors'
        onClick={() => setIsExpanded(!isExpanded)}>
        <Button
          variant='ghost'
          size='sm'
          className={cn('mr-2 size-6 p-0 transition-transform duration-200', isExpanded && 'rotate-180')}>
          <ChevronDown className='size-4' />
        </Button>
        <p className='flex-1 text-sm'>{task.context.callToAction}</p>
      </div>

      {/* Expandable Content with Animation */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        )}>
        <div className='border-border/50 bg-muted/20 border-t px-4 py-3'>
          <div className='space-y-4'>{actionBody}</div>
        </div>
      </div>
    </Card>
  );
}
