import { Check, X } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { dateHandler } from '@/lib/dates/helpers';
import { cn } from '@/lib/utils';
import type { GetTaskSuggestionResult } from '@/services/tasks/types';

type TaskStatus = 'completed' | 'skipped';

interface StatusTaskCardProps {
  task: Omit<GetTaskSuggestionResult, 'suggested_action_type' | 'suggested_action'>;
  status: TaskStatus;
}

export function StatusTaskCard({ task, status }: StatusTaskCardProps) {
  const isCompleted = status === 'completed';

  return (
    <Card
      className={cn(
        'relative w-full min-w-[500px] overflow-hidden shadow-sm',
        isCompleted ? 'bg-muted/20' : 'bg-red-50/20'
      )}>
      <div className='p-3'>
        <div className='flex items-start'>
          <Avatar className='mr-3 size-8 flex-shrink-0'>
            <AvatarImage
              src={`https://i.pravatar.cc/150?u=${task.person.id}`}
              alt={`${task.person.first_name} ${task.person.last_name}`}
            />
            <AvatarFallback>{task.person.first_name[0]}</AvatarFallback>
          </Avatar>

          <div className='min-w-0 flex-1'>
            <div className='flex items-start justify-between'>
              <div className='flex items-center gap-2'>
                <h3 className='text-sm font-medium text-muted-foreground'>
                  {task.person.first_name} {task.person.last_name}
                </h3>
                {isCompleted ? <Check className='size-3.5 text-green-500' /> : <X className='size-3.5 text-red-500' />}
              </div>
              <span className='text-xs text-muted-foreground'>
                {dateHandler(isCompleted ? task.completed_at : task.skipped_at || task.end_at).format('h:mm A')}
              </span>
            </div>

            <p className='mt-0.5 text-xs text-muted-foreground'>{task.context.context}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
