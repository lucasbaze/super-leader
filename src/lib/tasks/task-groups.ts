import { dateHandler } from '@/lib/dates/helpers';
import { GetTaskSuggestionResult } from '@/services/tasks/types';

export interface TaskGroup {
  title: string;
  tasks: GetTaskSuggestionResult[];
  subGroups?: TaskGroup[];
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
  tasks.forEach((task) => {
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

export function groupTasksByDay(tasks: GetTaskSuggestionResult[]): TaskGroup[] {
  const today = dateHandler();
  const result: TaskGroup[] = [];

  // Create an array of the next 7 days
  const nextSevenDays = Array.from({ length: 7 }, (_, i) => today.add(i, 'day'));

  // Split days into this week and next week
  const thisWeekDays = nextSevenDays.filter((day) => day.isSame(today, 'week'));
  const nextWeekDays = nextSevenDays.filter((day) => !day.isSame(today, 'week'));

  // Create groups for this week and next week
  const thisWeekGroup: TaskGroup = {
    title: 'This Week',
    tasks: [],
    subGroups: thisWeekDays.map((day) => {
      const dayTasks = tasks.filter((task) => {
        if (!task.end_at) return false;
        return dateHandler(task.end_at).isSame(day, 'day');
      });

      const isToday = day.isSame(today, 'day');
      let title: string;

      if (isToday) {
        title = 'Today';
      } else if (day.isSame(today.add(1, 'day'), 'day')) {
        title = 'Tomorrow';
      } else {
        title = day.format('dddd, MMM D');
      }

      return {
        title,
        tasks: dayTasks
      };
    })
  };

  const nextWeekGroup: TaskGroup = {
    title: 'Next Week',
    tasks: [],
    subGroups: nextWeekDays.map((day) => {
      const dayTasks = tasks.filter((task) => {
        if (!task.end_at) return false;
        return dateHandler(task.end_at).isSame(day, 'day');
      });

      return {
        title: day.format('dddd, MMM D'),
        tasks: dayTasks
      };
    })
  };

  // Only add groups if they have days
  if (thisWeekGroup.subGroups?.length) {
    result.push(thisWeekGroup);
  }

  if (nextWeekGroup.subGroups?.length) {
    result.push(nextWeekGroup);
  }

  return result;
}

export function groupTasksByWeek(tasks: GetTaskSuggestionResult[]): TaskGroup[] {
  const today = dateHandler();
  const result: TaskGroup[] = [];

  // Start from the beginning of the current week
  const startDate = today.startOf('week');
  const endDate = today.add(30, 'days');

  // Create an array of weeks from current week until we cover 30 days
  const weeks: { start: ReturnType<typeof dateHandler>; end: ReturnType<typeof dateHandler> }[] = [];
  let currentWeekStart = startDate;

  while (currentWeekStart.isBefore(endDate)) {
    weeks.push({
      start: currentWeekStart.clone(),
      end: currentWeekStart.clone().endOf('week')
    });
    currentWeekStart = currentWeekStart.add(1, 'week');
  }

  // Group weeks by month
  const weeksByMonth = new Map<string, typeof weeks>();

  weeks.forEach((week) => {
    const monthKey = week.start.format('MMMM YYYY');
    if (!weeksByMonth.has(monthKey)) {
      weeksByMonth.set(monthKey, []);
    }
    weeksByMonth.get(monthKey)!.push(week);
  });

  // Create month groups
  weeksByMonth.forEach((monthWeeks, monthName) => {
    const monthGroup: TaskGroup = {
      title: monthName,
      tasks: [],
      subGroups: monthWeeks.map(({ start: weekStart, end: weekEnd }) => {
        const weekTasks = tasks.filter((task) => {
          if (!task.end_at) return false;
          const taskDate = dateHandler(task.end_at);
          return (
            (taskDate.isAfter(weekStart.subtract(1, 'day'), 'day') || taskDate.isSame(weekStart, 'day')) &&
            (taskDate.isBefore(weekEnd.add(1, 'day'), 'day') || taskDate.isSame(weekEnd, 'day'))
          );
        });

        const weekStartStr = weekStart.format('MMM D');
        const weekEndStr = weekEnd.format('MMM D');

        return {
          title: `Week of ${weekStartStr} to ${weekEndStr}`,
          tasks: weekTasks
        };
      })
    };

    result.push(monthGroup);
  });

  return result;
}

export function filterTodayTasks(tasks: GetTaskSuggestionResult[]): GetTaskSuggestionResult[] {
  return tasks.filter((task) => {
    if (!task.end_at) return true;
    return getTaskTimeframe(task.end_at) === 'today';
  });
}

export function filterAllTasks(tasks: GetTaskSuggestionResult[]): GetTaskSuggestionResult[] {
  return tasks;
}
