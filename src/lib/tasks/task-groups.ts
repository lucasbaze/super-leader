import { dateHandler } from '@/lib/dates/helpers';
import { GetTaskSuggestionResult } from '@/services/tasks/types';

export interface TaskGroup {
  title: string;
  tasks: GetTaskSuggestionResult[];
}

export type TaskTimeframe = 'today' | 'tomorrow' | 'week' | 'future';

export function getTaskTimeframe(taskDate: string): TaskTimeframe {
  const today = dateHandler();
  const tomorrow = dateHandler().add(1, 'day');
  const nextWeek = dateHandler().add(1, 'week');
  
  const taskDateTime = dateHandler(taskDate);
  
  if (taskDateTime.isSame(today, 'day')) {
    return 'today';
  }
  
  if (taskDateTime.isSame(tomorrow, 'day')) {
    return 'tomorrow';
  }
  
  if (taskDateTime.isBefore(nextWeek)) {
    return 'week';
  }
  
  return 'future';
}

export function groupTasksByTimeframe(tasks: GetTaskSuggestionResult[]): TaskGroup[] {
  const groups: Record<TaskTimeframe, GetTaskSuggestionResult[]> = {
    today: [],
    tomorrow: [],
    week: [],
    future: []
  };
  
  // Group tasks by timeframe
  tasks.forEach(task => {
    if (task.end_at) {
      const timeframe = getTaskTimeframe(task.end_at);
      groups[timeframe].push(task);
    } else {
      // If no end_at, put in today
      groups.today.push(task);
    }
  });
  
  // Format groups into the result structure
  const result: TaskGroup[] = [];
  
  if (groups.today.length > 0) {
    result.push({ title: 'Today', tasks: groups.today });
  }
  
  if (groups.tomorrow.length > 0) {
    result.push({ title: 'Tomorrow', tasks: groups.tomorrow });
  }
  
  if (groups.week.length > 0) {
    result.push({ title: 'This Week', tasks: groups.week });
  }
  
  if (groups.future.length > 0) {
    result.push({ title: 'Future', tasks: groups.future });
  }
  
  return result;
}

export function filterTodayTasks(tasks: GetTaskSuggestionResult[]): GetTaskSuggestionResult[] {
  return tasks.filter(task => {
    if (!task.end_at) return true;
    return getTaskTimeframe(task.end_at) === 'today';
  });
}

export function filterAllTasks(tasks: GetTaskSuggestionResult[]): GetTaskSuggestionResult[] {
  return tasks;
}