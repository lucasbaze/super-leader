import Link from 'next/link';
import { useState } from 'react';

import { CalendarClock, CheckCircle, Loader, ThumbsDown, XCircle } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTaskActions } from '@/hooks/use-task-actions';
import { getTaskDateDisplay } from '@/lib/dates/task-dates';
import { routes } from '@/lib/routes';
import { TASK_METADATA } from '@/lib/tasks/task-meta';
import type { GetTaskSuggestionResult } from '@/services/tasks/types';

export const TaskSuggestionListItem = ({ task }: { task: GetTaskSuggestionResult }) => {
  const metadata = TASK_METADATA[task.type];
  const TaskIcon = metadata.icon;
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

  return (
    <Link
      href={routes.person.byId({ id: task.person.id })}
      className='group flex items-center justify-between border-b px-4 py-3 hover:bg-purple-50/50'>
      {/* Left section with avatar and details */}
      <div className='flex items-center gap-3'>
        <Avatar className='size-8'>
          <AvatarImage
            src={`https://i.pravatar.cc/150?u=${task.person.id}`}
            alt={`${task.person.first_name} ${task.person.last_name}`}
          />
          <AvatarFallback>{task.person.first_name[0]}</AvatarFallback>
        </Avatar>
        <div className='flex items-center gap-2'>
          <span className='font-medium'>
            {task.person.first_name} {task.person.last_name}
          </span>
          <span className='text-muted-foreground'>·</span>
          <span className='flex items-center gap-1 text-sm text-muted-foreground'>
            <TaskIcon className='size-4' />
            {task.content.action}
          </span>
        </div>
      </div>

      {/* Right section with date and actions */}
      <div className='flex items-center gap-2'>
        {/* Actions (visible on hover) */}
        <div className='flex translate-x-4 items-center gap-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100'>
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  size='sm'
                  variant='ghost'
                  className='h-8 hover:bg-green-50 hover:text-green-600'
                  onClick={() => handleAction(() => completeTask(task.id), 'complete')}
                  disabled={isLoading || actionInProgress !== null}>
                  {isLoading ? (
                    <Loader className='size-4 animate-spin' />
                  ) : (
                    <CheckCircle className='size-4' />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Complete task</TooltipContent>
            </Tooltip>

            {/* <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  size='sm'
                  variant='ghost'
                  className='h-8 hover:bg-blue-50 hover:text-blue-600'>
                  <CalendarClock className='size-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Snooze task</TooltipContent>
            </Tooltip> */}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size='sm'
                  variant='ghost'
                  className='h-8 hover:bg-red-50 hover:text-red-600'
                  onClick={() => handleAction(() => skipTask(task.id), 'skip')}
                  disabled={isLoading || actionInProgress !== null}>
                  {isLoading ? (
                    <Loader className='size-4 animate-spin' />
                  ) : (
                    <XCircle className='size-4' />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Skip task</TooltipContent>
            </Tooltip>

            {/* <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size='sm'
                  variant='ghost'
                  className='h-8 hover:bg-red-50 hover:text-red-600'>
                  <ThumbsDown className='size-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bad suggestion</TooltipContent>
            </Tooltip> */}
          </TooltipProvider>
        </div>

        {/* Date */}
        <span
          className={`text-sm ${
            getTaskDateDisplay(task.end_at) === 'Today'
              ? 'font-medium text-red-600'
              : 'text-muted-foreground'
          }`}>
          {getTaskDateDisplay(task.end_at)}
        </span>
      </div>
    </Link>
  );
};
