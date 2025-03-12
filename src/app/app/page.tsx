'use client';

import { useState } from 'react';

import { HomeHeader } from '@/components/home/home-header';
// import { TaskSuggestionCard } from '@/components/home/task-suggestion-card';
import { TaskSuggestionListItem } from '@/components/home/task-suggestion-list-item';
import { useTasks } from '@/hooks/use-tasks';
import { filterAllTasks, filterTodayTasks, groupTasksByTimeframe } from '@/lib/tasks/task-groups';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const { data: tasks, isLoading, error } = useTasks();
  const [activeTab, setActiveTab] = useState('today');

  // Filter tasks based on the active tab
  const filteredTasks = tasks
    ? activeTab === 'today'
      ? filterTodayTasks(tasks)
      : filterAllTasks(tasks)
    : [];

  // Group tasks by timeframe
  const taskGroups = filteredTasks ? groupTasksByTimeframe(filteredTasks) : [];

  return (
    <div className='absolute inset-0'>
      <HomeHeader />
      <div className='absolute inset-0 top-[48px] mt-[1px] overflow-auto'>
        <div className='mb-4 border-b bg-background'>
          <div className='flex items-center px-3 py-2'>
            <button
              onClick={() => setActiveTab('today')}
              className={cn(
                'rounded-md px-2 py-1 text-sm font-medium',
                activeTab === 'today'
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              )}>
              Today
            </button>
            <div className='mx-2 h-4 w-px bg-border'></div>
            <button
              onClick={() => setActiveTab('all')}
              className={cn(
                'rounded-md px-2 py-1 text-sm font-medium',
                activeTab === 'all'
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted'
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
          ) : !filteredTasks?.length ? (
            <div className='text-sm text-muted-foreground'>
              No tasks available for {activeTab === 'today' ? 'today' : 'any date'}
            </div>
          ) : (
            <div className='space-y-6'>
              {taskGroups.map((group) => (
                <div key={group.title}>
                  <h3 className='mb-3 text-lg font-semibold'>{group.title}</h3>
                  <div className='space-y-4'>
                    {group.tasks.map((task) => (
                      <TaskSuggestionListItem key={task.id} task={task} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
