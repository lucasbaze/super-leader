import { dateHandler } from '@/lib/dates/helpers';
import { SUGGESTED_ACTION_TYPES, TASK_TRIGGERS } from '@/lib/tasks/constants';
import { validateTaskSuggestion } from '@/services/tasks/validate-task-suggestion';

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

const generateBirthdayTask = (person: { first_name: string }) => ({
  trigger: TASK_TRIGGERS.BIRTHDAY_REMINDER.slug,
  context: {
    context: `${person.first_name}'s birthday is coming up!`,
    callToAction: `Send birthday wishes to ${person.first_name}`
  },
  suggestedActionType: SUGGESTED_ACTION_TYPES.SEND_MESSAGE.slug,
  suggestedAction: {
    messageVariants: [
      {
        tone: 'friendly',
        message: `Happy birthday ${person.first_name}! 🎉 Hope you have a fantastic day filled with joy and celebration!`
      },
      {
        tone: 'professional',
        message: `Happy birthday ${person.first_name}! Wishing you a wonderful day and a great year ahead.`
      }
    ]
  }
});

const generateProfileUpdateTask = (person: { first_name: string }) => ({
  trigger: TASK_TRIGGERS.CONTEXT_GATHER.slug,
  context: {
    context: 'Missing key information for potential investor',
    callToAction: `Gather more information about ${person.first_name}'s current role and interests`
  },
  suggestedActionType: SUGGESTED_ACTION_TYPES.ADD_NOTE.slug,
  suggestedAction: {
    questionVariants: [
      {
        type: 'professional',
        question: 'What is your current role and company?'
      },
      {
        type: 'contact',
        question: 'What is your preferred method of contact?'
      }
    ]
  }
});

const generateFollowUpTask = (person: { first_name: string }) => ({
  trigger: TASK_TRIGGERS.FOLLOW_UP.slug,
  context: {
    context: `It's been a while since your last interaction with ${person.first_name}`,
    callToAction: 'Schedule a catch-up meeting to maintain the connection'
  },
  suggestedActionType: SUGGESTED_ACTION_TYPES.SEND_MESSAGE.slug,
  suggestedAction: {
    messageVariants: [
      {
        tone: 'friendly',
        message: `Hi ${person.first_name}! It's been a while since we caught up. Would you be interested in grabbing coffee sometime soon?`
      },
      {
        tone: 'professional',
        message: `Hi ${person.first_name}, I hope you're doing well. I'd love to schedule some time to catch up and hear about your recent projects.`
      }
    ]
  }
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
  const peopleWithBirthdays = people.filter((person): person is TPerson => person.birthday !== null);

  const taskSuggestions = [
    // Birthday reminders - only for people with birthdays
    ...peopleWithBirthdays.map((person) => {
      const birthdayTask = generateBirthdayTask(person);
      const task = validateTaskSuggestion({
        userId,
        personId: person.id,
        trigger: birthdayTask.trigger,
        context: birthdayTask.context,
        suggestedActionType: birthdayTask.suggestedActionType,
        suggestedAction: birthdayTask.suggestedAction,
        endAt: dateHandler().add(6, 'hours').toISOString() // For birthday reminders, we'll set it to now
      });
      if (!task.valid || !task.data) throw new Error('Invalid birthday task data');
      return task.data;
    }),

    // Profile updates
    ...people.slice(0, 3).map((person) => {
      const profileTask = generateProfileUpdateTask(person);
      const task = validateTaskSuggestion({
        userId,
        personId: person.id,
        trigger: profileTask.trigger,
        context: profileTask.context,
        suggestedActionType: profileTask.suggestedActionType,
        suggestedAction: profileTask.suggestedAction,
        endAt: getRandomEndDate().toISOString()
      });
      if (!task.valid || !task.data) throw new Error('Invalid profile update task data');
      return task.data;
    }),

    // Follow-up reminders
    ...people.map((person) => {
      const followUpTask = generateFollowUpTask(person);
      const task = validateTaskSuggestion({
        userId,
        personId: person.id,
        trigger: followUpTask.trigger,
        context: followUpTask.context,
        suggestedActionType: followUpTask.suggestedActionType,
        suggestedAction: followUpTask.suggestedAction,
        endAt: getRandomEndDate().toISOString()
      });
      if (!task.valid || !task.data) throw new Error('Invalid reminder task data');
      return task.data;
    })
  ];

  const { error: insertError } = await supabase.from('task_suggestion').insert(taskSuggestions);
  if (insertError) throw insertError;
}
