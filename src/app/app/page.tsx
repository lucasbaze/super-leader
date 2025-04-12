'use client';

import { useState } from 'react';

import { HomeHeader } from '@/components/home/home-header';
import { TaskList } from '@/components/tasks/task-list';
import { useTasks } from '@/hooks/use-tasks';
import { filterAllTasks, groupTasksByDay, groupTasksByTimeframe, groupTasksByWeek } from '@/lib/tasks/task-groups';
import { TimePeriod } from '@/lib/tasks/time-periods';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TimePeriod>('this-week');
  const { data: tasks, isLoading, error } = useTasks(undefined, activeTab);

  // Group tasks based on the active tab
  const taskGroups = tasks
    ? activeTab === 'this-week'
      ? groupTasksByDay(tasks)
      : activeTab === 'this-month'
        ? groupTasksByWeek(tasks)
        : groupTasksByTimeframe(filterAllTasks(tasks))
    : [];

  return (
    <div className='absolute inset-0'>
      <HomeHeader />
      <div className='absolute inset-0 top-[48px] mt-[1px] overflow-auto'>
        <div className='mb-4 border-b bg-background'>
          <div className='flex items-center px-3 py-2'>
            <button
              onClick={() => setActiveTab('this-week')}
              className={cn(
                'rounded-md px-2 py-1 text-sm font-medium',
                activeTab === 'this-week' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'
              )}>
              This Week
            </button>
            <div className='mx-2 h-4 w-px bg-border'></div>
            <button
              onClick={() => setActiveTab('this-month')}
              className={cn(
                'rounded-md px-2 py-1 text-sm font-medium',
                activeTab === 'this-month' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'
              )}>
              This Month
            </button>
            <div className='mx-2 h-4 w-px bg-border'></div>
            <button
              onClick={() => setActiveTab('all')}
              className={cn(
                'rounded-md px-2 py-1 text-sm font-medium',
                activeTab === 'all' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'
              )}>
              All Tasks
            </button>
          </div>
        </div>
        <div className='p-4'>
          {isLoading ? (
            <div className='text-sm text-muted-foreground'>Loading tasks...</div>
          ) : error ? (
            <div className='text-sm text-red-500'>Failed to load tasks</div>
          ) : !taskGroups?.length ? (
            <div className='text-sm text-muted-foreground'>
              No tasks available for{' '}
              {activeTab === 'this-week' ? 'this week' : activeTab === 'this-month' ? 'this month' : 'any date'}
            </div>
          ) : (
            <TaskList groups={taskGroups} />
          )}
        </div>
      </div>
    </div>
  );
}
