import { X } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { dateHandler } from '@/lib/dates/helpers';
import { TASK_TRIGGERS } from '@/lib/tasks/constants';
import type { GetTaskSuggestionResult } from '@/services/tasks/types';

type SkippedTaskCardProps = {
  task: Omit<GetTaskSuggestionResult, 'suggested_action_type' | 'suggested_action'>;
};

export function SkippedTaskCard({ task }: SkippedTaskCardProps) {
  const getActionIcon = (type: string) => {
    switch (type) {
      case TASK_TRIGGERS.BIRTHDAY_REMINDER.slug:
        return 'Skipped birthday wish';
      case TASK_TRIGGERS.CONTEXT_GATHER.slug:
        return 'Skipped context update';
      case TASK_TRIGGERS.FOLLOW_UP.slug:
        return 'Skipped follow-up';
      default:
        return 'Skipped task';
    }
  };

  return (
    <Card className='relative w-full min-w-[500px] overflow-hidden bg-red-50/20 shadow-sm'>
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
                <X className='size-3.5 text-red-500' />
              </div>
              <span className='text-xs text-muted-foreground'>
                {dateHandler(task.skipped_at || task.end_at).format('h:mm A')}
              </span>
            </div>

            <p className='mt-0.5 text-xs text-muted-foreground'>{getActionIcon(task.trigger)}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
