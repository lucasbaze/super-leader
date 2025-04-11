import { CompletedTaskCard } from '@/components/tasks/completed-task-card';
import { SkippedTaskCard } from '@/components/tasks/skipped-task-card';
import { TaskRenderer } from '@/components/tasks/task-renderer';
import { dateHandler } from '@/lib/dates/helpers';
import { TaskGroup } from '@/lib/tasks/task-groups';
import { cn } from '@/lib/utils';

interface TaskListProps {
  groups: TaskGroup[];
}

function TaskGroupRenderer({ group, isSubGroup = false }: { group: TaskGroup; isSubGroup?: boolean }) {
  const isToday = group.title.toLowerCase().includes('today');
  const completedTasks = group.tasks.filter((task) => task.completed_at);
  const skippedTasks = group.tasks.filter((task) => task.skipped_at);
  const activeTasks = group.tasks.filter((task) => !task.completed_at && !task.skipped_at);

  return (
    <div className={cn('space-y-4', !isSubGroup && 'mb-8')}>
      <h3
        className={cn(
          'font-semibold',
          isSubGroup ? 'text-sm text-muted-foreground' : 'text-lg',
          isToday && isSubGroup && 'text-base text-foreground'
        )}>
        {isToday && isSubGroup ? `Today - ${dateHandler().format('MMM D')}` : group.title}
      </h3>
      {group.subGroups ? (
        <div className={cn('space-y-6 pl-4', isSubGroup && 'pl-4')}>
          {group.subGroups.map((subGroup) => (
            <TaskGroupRenderer key={subGroup.title} group={subGroup} isSubGroup />
          ))}
        </div>
      ) : (
        <div className='space-y-4'>
          {/* Active Tasks */}
          {activeTasks.length > 0 && (
            <div className={cn('space-y-4', isToday && 'min-h-[200px]')}>
              {activeTasks.map((task) => (
                <TaskRenderer key={task.id} task={task} />
              ))}
            </div>
          )}
          {activeTasks.length === 0 && (completedTasks.length > 0 || skippedTasks.length > 0) && isToday && (
            <div className='pl-2 text-sm text-muted-foreground'>All tasks completed for today!</div>
          )}

          {/* Completed & Skipped Tasks */}
          {(completedTasks.length > 0 || skippedTasks.length > 0) && isToday && (
            <div className='border-border/50 space-y-3 border-t pt-4'>
              <h4 className='text-xs font-medium text-muted-foreground'>Completed or Skipped</h4>
              <div className='space-y-2'>
                {completedTasks.map((task) => (
                  <CompletedTaskCard key={task.id} task={task} />
                ))}
                {skippedTasks.map((task) => (
                  <SkippedTaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function TaskList({ groups }: TaskListProps) {
  if (!groups?.length) {
    return <div className='text-sm text-muted-foreground'>No tasks available</div>;
  }

  return (
    <div className='space-y-6'>
      {groups.map((group) => (
        <TaskGroupRenderer key={group.title} group={group} />
      ))}
    </div>
  );
}
