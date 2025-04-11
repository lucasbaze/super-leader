import { StatusTaskCard } from '@/components/tasks/status-task-card';
import { TaskRenderer } from '@/components/tasks/task-renderer';
import { dateHandler } from '@/lib/dates/helpers';
import type { TaskGroup as TaskGroupType } from '@/lib/tasks/task-groups';
import { cn } from '@/lib/utils';

interface TaskListProps {
  groups: TaskGroupType[];
}

interface TaskGroupProps {
  group: TaskGroupType;
}

function TaskGroup({ group }: TaskGroupProps) {
  const isToday = group.title.toLowerCase().includes('today');
  const completedTasks = group.tasks.filter((task) => task.completed_at);
  const skippedTasks = group.tasks.filter((task) => task.skipped_at);
  const activeTasks = group.tasks.filter((task) => !task.completed_at && !task.skipped_at);

  return (
    <div className='space-y-4'>
      <h3 className={cn('font-semibold', 'text-sm text-muted-foreground', isToday && 'text-base text-foreground')}>
        {isToday ? `Today - ${dateHandler().format('MMM D')}` : group.title}
      </h3>

      <div className='space-y-4'>
        {/* Active Tasks */}
        {activeTasks.length > 0 && (
          <div className='space-y-4'>
            {activeTasks.map((task) => (
              <TaskRenderer key={task.id} task={task} />
            ))}
          </div>
        )}

        {activeTasks.length === 0 && (completedTasks.length > 0 || skippedTasks.length > 0) && isToday && (
          <div className='pl-2 text-sm text-muted-foreground'>All tasks completed for today!</div>
        )}

        {/* Completed & Skipped Tasks */}
        {isToday && (completedTasks.length > 0 || skippedTasks.length > 0) && (
          <div className='space-y-3 pt-4'>
            <h4 className='text-xs font-medium text-muted-foreground'>Completed today</h4>
            <div className='space-y-2'>
              {completedTasks.map((task) => (
                <StatusTaskCard key={task.id} task={task} status='completed' />
              ))}
              {skippedTasks.map((task) => (
                <StatusTaskCard key={task.id} task={task} status='skipped' />
              ))}
            </div>
          </div>
        )}

        {activeTasks.length === 0 && completedTasks.length === 0 && skippedTasks.length === 0 && (
          <div className='pl-2 text-sm text-muted-foreground'>No tasks scheduled for this period</div>
        )}
      </div>
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
        <div key={group.title} className='mb-24 space-y-4'>
          {/* Main group title */}
          <h2 className='text-lg font-semibold'>{group.title}</h2>

          {/* Subgroups */}
          {group.subGroups && (
            <div className='space-y-6 pl-4'>
              {group.subGroups.map((subGroup) => (
                <TaskGroup key={subGroup.title} group={subGroup} />
              ))}
            </div>
          )}

          {/* Direct tasks (if any) */}
          {!group.subGroups && group.tasks.length > 0 && (
            <div className='space-y-4 pl-4'>
              {group.tasks.map((task) => (
                <TaskRenderer key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
