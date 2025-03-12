'use client';

import { useState } from 'react';

import { HomeHeader } from '@/components/home/home-header';
// import { TaskSuggestionCard } from '@/components/home/task-suggestion-card';
import { TaskSuggestionListItem } from '@/components/home/task-suggestion-list-item';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTasks } from '@/hooks/use-tasks';
import { filterAllTasks, filterTodayTasks, groupTasksByTimeframe } from '@/lib/tasks/task-groups';

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
        <div className='p-4'>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)} className='mb-4'>
            <TabsList className='grid w-full max-w-[400px] grid-cols-2'>
              <TabsTrigger value='today'>Today</TabsTrigger>
              <TabsTrigger value='all'>All Tasks</TabsTrigger>
            </TabsList>
          </Tabs>

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
