'use client';

import { useState } from 'react';

import { ActionPlanTab } from '@/components/home/action-plan-tab';
import { HomeHeader } from '@/components/home/home-header';
import { TasksTab } from '@/components/home/tasks-tab';
import { TimePeriod } from '@/lib/tasks/time-periods';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TimePeriod>('action-plan');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'action-plan':
        return <ActionPlanTab />;
      case 'today':
      case 'this-week':
      case 'this-month':
      case 'overdue':
      case 'all':
        return <TasksTab activeTab={activeTab} />;
      default:
        return <ActionPlanTab />;
    }
  };

  return (
    <div className='absolute inset-0 flex flex-col'>
      <HomeHeader />
      <div className='flex-shrink-0 border-b bg-background'>
        <div className='flex items-center justify-between px-3 py-2'>
          <button
            onClick={() => setActiveTab('action-plan')}
            className={cn(
              'rounded-md px-2 py-1 text-sm font-medium',
              activeTab === 'action-plan' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'
            )}>
            Action Plan
          </button>
          <div className='flex items-center'>
            <button
              onClick={() => setActiveTab('overdue')}
              className={cn(
                'rounded-md px-2 py-1 text-sm font-medium',
                activeTab === 'overdue' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'
              )}>
              Overdue
            </button>
            <div className='mx-2 h-4 w-px bg-border'></div>
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
      </div>
      <div className='flex-1 overflow-auto'>
        <div className='p-4'>{renderTabContent()}</div>
      </div>
    </div>
  );
}
