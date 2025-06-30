'use client';

import { TaskList } from '@/components/tasks/task-list';
import { useTasks } from '@/hooks/use-tasks';
import {
  filterAllTasks,
  groupTasksByDay,
  groupTasksByReverseTimeframe,
  groupTasksByTimeframe,
  groupTasksByWeek,
  TaskGroup
} from '@/lib/tasks/task-groups';
import { TimePeriod } from '@/lib/tasks/time-periods';

interface TasksTabProps {
  activeTab: TimePeriod;
}

export function TasksTab({ activeTab }: TasksTabProps) {
  const { data: tasks, isLoading, error } = useTasks(undefined, activeTab);

  let taskGroups: TaskGroup[] = [];
  if (tasks) {
    switch (activeTab) {
      case 'this-week':
        taskGroups = groupTasksByDay(tasks);
        break;
      case 'this-month':
        taskGroups = groupTasksByWeek(tasks);
        break;
      case 'overdue':
        taskGroups = groupTasksByReverseTimeframe(tasks);
        break;
      case 'all':
      default:
        taskGroups = groupTasksByTimeframe(filterAllTasks(tasks));
        break;
    }
  }

  if (isLoading) {
    return <div className='text-sm text-muted-foreground'>Loading tasks...</div>;
  }

  if (error) {
    return <div className='text-sm text-red-500'>Failed to load tasks</div>;
  }

  if (!taskGroups?.length) {
    return (
      <div className='text-sm text-muted-foreground'>
        No tasks available for{' '}
        {activeTab === 'this-week'
          ? 'this week'
          : activeTab === 'this-month'
            ? 'this month'
            : activeTab === 'overdue'
              ? 'overdue tasks'
              : 'any date'}
      </div>
    );
  }

  return <TaskList groups={taskGroups} />;
}
