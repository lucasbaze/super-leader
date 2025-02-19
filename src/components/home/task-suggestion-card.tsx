import Link from 'next/link';

import { ArrowRight, CalendarClock, CheckCircle, ThumbsDown, XCircle } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getTaskDateDisplay } from '@/lib/dates/task-dates';
import { routes } from '@/lib/routes';
import { TASK_METADATA } from '@/lib/tasks/task-meta';
import type { GetTaskSuggestionResult } from '@/services/tasks/types';

export const TaskSuggestionCard = ({ task }: { task: GetTaskSuggestionResult }) => {
  const metadata = TASK_METADATA[task.type];
  const TaskIcon = metadata.icon;

  return (
    <Card className='group relative overflow-hidden shadow-none transition-all hover:shadow-md'>
      {/* Accent Bar */}
      <div className={`absolute left-0 top-0 h-full w-1 ${metadata.accentColor}`} />

      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Avatar className='size-10 ring-2 ring-purple-100 ring-offset-2 ring-offset-background'>
              <AvatarImage
                src={`https://i.pravatar.cc/150?u=${task.person.id}`}
                alt={`${task.person.first_name} ${task.person.last_name}`}
              />
              <AvatarFallback>{task.person.first_name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <Link
                href={routes.person.byId({ id: task.person.id })}
                className='group/link inline-flex items-center gap-2'>
                <CardTitle className='text-lg transition-colors group-hover/link:text-purple-600'>
                  {`${task.person.first_name} ${task.person.last_name}`}
                </CardTitle>
                <ArrowRight className='size-4 -translate-x-2 text-purple-600 opacity-0 transition-all group-hover/link:translate-x-0 group-hover/link:opacity-100' />
              </Link>
              <p className='flex items-center gap-2 text-sm text-muted-foreground'>
                <TaskIcon className='size-4' />
                {task.content.action}
              </p>
            </div>
          </div>
          <Badge
            variant='secondary'
            className='bg-purple-50 text-xs font-medium text-purple-700 dark:bg-purple-900 dark:text-purple-100'>
            {getTaskDateDisplay(task.end_at)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className='space-y-3 pb-2'>
        <div className='rounded-lg bg-purple-50/50 p-3 dark:bg-purple-900/20'>
          <p className='mb-1 text-sm font-medium text-purple-700 dark:text-purple-300'>
            {task.content.context}
          </p>
          <p className='text-sm text-muted-foreground'>{task.content.suggestion}</p>
        </div>
      </CardContent>

      <CardFooter className='flex justify-between gap-2 pt-2'>
        <div>
          <Button size='sm' className='bg-primary text-white hover:bg-blue-600'>
            <CheckCircle className='mr-2 size-4' /> Complete
          </Button>
          <Button
            size='sm'
            variant='ghost'
            className='hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20'>
            <XCircle className='mr-2 size-4' /> Skip
          </Button>
          <Button
            size='sm'
            variant='ghost'
            className='hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20'>
            <CalendarClock className='mr-2 size-4' /> Snooze
          </Button>
        </div>
        <div className='flex items-center gap-2'>
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  size='sm'
                  variant='ghost'
                  className='hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20'>
                  <ThumbsDown className='size-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Bad suggestion</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  );
};
