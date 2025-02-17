import Link from 'next/link';

import {
  ArrowRight,
  CalendarClock,
  CheckCircle,
  Phone,
  ThumbsDown,
  XCircle
} from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const mockData = [
  {
    type: 'call',
    person: { id: '1', name: 'John Doe', avatar: '/placeholder.svg?height=40&width=40' },
    action: 'Schedule a call',
    context: 'Discuss project proposal for Q3',
    suggestion:
      "Hi John, I'd like to schedule a call to discuss the project proposal you mentioned last week. Are you available this Thursday at 2 PM?",
    icon: <Phone className='size-4' />,
    date: 'Today',
    accentColor: 'bg-purple-500'
  }
];

export const TaskSuggestionCard = ({ action }: { action: (typeof mockData)[0] }) => {
  return (
    <Card className='group relative mb-4 overflow-hidden transition-all hover:shadow-lg'>
      {/* Accent Bar */}
      <div className={`absolute left-0 top-0 h-full w-1 ${action.accentColor}`} />

      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Avatar className='size-10 ring-2 ring-purple-100 ring-offset-2 ring-offset-background'>
              <AvatarImage src={action.person.avatar} alt={action.person.name} />
              <AvatarFallback>{action.person.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <Link
                href={`/network/${action.person.id}`}
                className='group/link inline-flex items-center gap-2'>
                <CardTitle className='text-lg transition-colors group-hover/link:text-purple-600'>
                  {action.person.name}
                </CardTitle>
                <ArrowRight className='size-4 -translate-x-2 text-purple-600 opacity-0 transition-all group-hover/link:translate-x-0 group-hover/link:opacity-100' />
              </Link>
              <p className='flex items-center gap-2 text-sm text-muted-foreground'>
                {action.icon}
                {action.action}
              </p>
            </div>
          </div>
          <Badge
            variant='secondary'
            className='bg-purple-50 text-xs font-medium text-purple-700 dark:bg-purple-900 dark:text-purple-100'>
            {action.date}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className='space-y-3 pb-2'>
        <div className='rounded-lg bg-purple-50/50 p-3 dark:bg-purple-900/20'>
          <p className='mb-1 text-sm font-medium text-purple-700 dark:text-purple-300'>
            {action.context}
          </p>
          <p className='text-sm text-muted-foreground'>{action.suggestion}</p>
        </div>
      </CardContent>

      <CardFooter className='flex justify-between gap-2 pt-2'>
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
        <div>
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
          <Button size='sm' className='bg-primary text-white hover:bg-blue-600'>
            <CheckCircle className='mr-2 size-4' /> Complete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
