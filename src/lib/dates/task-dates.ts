import { dateHandler } from './helpers';

export function getTaskDateDisplay(date: string | null): string {
  if (!date) return '';

  const taskDate = dateHandler(date);
  const today = dateHandler();
  const tomorrow = dateHandler().add(1, 'day');

  if (taskDate.isSame(today, 'day')) {
    return 'Today';
  }

  if (taskDate.isSame(tomorrow, 'day')) {
    return 'Tomorrow';
  }

  return taskDate.format('dddd'); // Returns day name like "Monday"
}
