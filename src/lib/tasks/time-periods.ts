import { dateHandler } from '@/lib/dates/helpers';

export type TimePeriod = 'today' | 'this-week' | 'this-month' | 'all' | 'overdue';

export interface DateRange {
  after: string;
  before: string;
}

/**
 * Get the date range for a specific time period
 */
export function getDateRangeForTimePeriod(timePeriod: TimePeriod): DateRange {
  const now = dateHandler();

  switch (timePeriod) {
    case 'today':
      return {
        after: now.startOf('day').toISOString(),
        before: now.endOf('day').toISOString()
      };

    case 'this-week':
      return {
        after: now.startOf('day').toISOString(),
        before: now.add(7, 'day').endOf('day').toISOString()
      };

    case 'this-month':
      return {
        after: now.startOf('day').toISOString(),
        before: now.add(30, 'day').endOf('day').toISOString()
      };

    case 'overdue':
      return {
        after: now.subtract(1, 'year').startOf('day').toISOString(),
        before: now.startOf('day').toISOString()
      };

    case 'all':
    default:
      return {
        after: now.startOf('day').toISOString(),
        before: now.add(10, 'year').endOf('day').toISOString() // Far future
      };
  }
}

/**
 * Get the date range for a specific day
 */
export function getDateRangeForDay(date: string): DateRange {
  const day = dateHandler(date);
  return {
    after: day.startOf('day').toISOString(),
    before: day.endOf('day').toISOString()
  };
}

/**
 * Get the date range for a specific week
 */
export function getDateRangeForWeek(weekStart: string): DateRange {
  const start = dateHandler(weekStart).startOf('week');
  const end = start.clone().endOf('week');
  return {
    after: start.toISOString(),
    before: end.toISOString()
  };
}

/**
 * Get the date range for a specific month
 */
export function getDateRangeForMonth(year: number, month: number): DateRange {
  const start = dateHandler()
    .year(year)
    .month(month - 1)
    .startOf('month');
  const end = start.clone().endOf('month');
  return {
    after: start.toISOString(),
    before: end.toISOString()
  };
}
