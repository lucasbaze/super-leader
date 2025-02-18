import { dateHandler, getCurrentUtcTime } from '@/lib/dates/helpers';
import { TASK_TYPES } from '@/lib/tasks/task-types';
import { buildTaskSuggestion } from '@/services/tasks/build-task-suggestion';
import type { TTaskContent } from '@/services/tasks/types';

import { SeedContext } from './types';

type TPerson = {
  id: string;
  first_name: string;
  last_name: string | null;
  birthday: string | null;
};

const getRandomEndDate = () => {
  const daysToAdd = Math.floor(Math.random() * 7);
  return dateHandler().add(daysToAdd, 'd').endOf('day').utc();
};

const generateBirthdayContent = (person: { first_name: string }): TTaskContent => ({
  action: 'Send birthday wishes',
  context: `${person.first_name}'s birthday is coming up!`,
  suggestion: `Don't forget to wish ${person.first_name} a happy birthday! Consider sending a thoughtful message or gift to strengthen your relationship.`
});

const generateProfileUpdateContent = (person: { first_name: string }): TTaskContent => ({
  action: 'Update contact details',
  context: 'Missing key information for potential investor',
  suggestion: `${person.first_name}'s profile needs updating. Add their current role, company, and preferred contact method to better maintain the relationship.`
});

const generateSuggestedReminderContent = (person: { first_name: string }): TTaskContent => ({
  action: 'Send follow-up message',
  context: 'Recent interaction follow-up',
  suggestion: `It's been a while since you last caught up with ${person.first_name}. Consider scheduling a coffee chat to discuss their recent projects and maintain the connection.`
});

export async function seedTaskSuggestions({ supabase, userId }: SeedContext) {
  // Get existing people from the database
  const { data: people, error: peopleError } = await supabase
    .from('person')
    .select('id, first_name, last_name, birthday')
    .eq('user_id', userId)
    .limit(5); // Let's create tasks for the first 5 people

  if (peopleError) throw peopleError;
  if (!people?.length) throw new Error('No people found to create tasks for');

  // Filter people with birthdays for birthday reminders
  const peopleWithBirthdays = people.filter(
    (person): person is TPerson => person.birthday !== null
  );

  const taskSuggestions = [
    // Birthday reminders - only for people with birthdays
    ...peopleWithBirthdays.map((person) => {
      const task = buildTaskSuggestion({
        userId,
        personId: person.id,
        type: TASK_TYPES.BIRTHDAY_REMINDER,
        content: generateBirthdayContent(person),
        endAt: dateHandler().add(6, 'hours').toISOString() // For birthday reminders, we'll set it to now
      });
      if (!task.valid || !task.data) throw new Error('Invalid birthday task data');
      return task.data;
    }),

    // Profile updates
    ...people.slice(0, 3).map((person) => {
      const task = buildTaskSuggestion({
        userId,
        personId: person.id,
        type: TASK_TYPES.PROFILE_UPDATE,
        content: generateProfileUpdateContent(person),
        endAt: getRandomEndDate().toISOString()
      });
      if (!task.valid || !task.data) throw new Error('Invalid profile update task data');
      return task.data;
    }),

    // Suggested reminders
    ...people.map((person) => {
      const task = buildTaskSuggestion({
        userId,
        personId: person.id,
        type: TASK_TYPES.SUGGESTED_REMINDER,
        content: generateSuggestedReminderContent(person),
        endAt: getRandomEndDate().toISOString()
      });
      if (!task.valid || !task.data) throw new Error('Invalid reminder task data');
      return task.data;
    })
  ];

  const { error: insertError } = await supabase.from('task_suggestion').insert(taskSuggestions);
  if (insertError) throw insertError;
}
