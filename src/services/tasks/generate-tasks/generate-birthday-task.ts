import { z } from 'zod';

import { dateHandler } from '@/lib/dates/helpers';
import { createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { SUGGESTED_ACTION_TYPES, TASK_TRIGGERS } from '@/lib/tasks/constants';
import { DBClient, Person } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';
import { generateObject } from '@/vendors/ai';
import { generateSearchObject } from '@/vendors/openai/generate-search-object';

import { createTask } from '../create-task';
import { getTasks } from '../get-tasks';
import {
  buyGiftActionSchema,
  sendMessageActionSchema,
  TaskContext,
  taskContextSchema
} from '../types';

// Service params interface
export interface GenerateTasksParams {
  db: DBClient;
  userId: string;
}

// Define errors
export const ERRORS = {
  GENERATION: {
    FETCHING_BIRTHDAYS_FAILED: createError(
      'fetching_birthdays_failed',
      ErrorType.API_ERROR,
      'Failed to fetch birthdays',
      'Unable to fetch birthdays at this time'
    ),
    BIRTHDAY_TASKS_FAILED: createError(
      'birthday_tasks_failed',
      ErrorType.API_ERROR,
      'Failed to generate birthday tasks',
      'Unable to generate birthday tasks at this time'
    )
  }
};

const getCurrentYearBirthday = (birthday: string) => {
  const currentYear = dateHandler().year();
  const birthdayDate = dateHandler(birthday);
  return birthdayDate.year(currentYear).toISOString();
};

const createBirthdayReminderDate = (birthday: string) => {
  const currentYearBirthday = getCurrentYearBirthday(birthday);
  const reminderDate = dateHandler(currentYearBirthday).subtract(7, 'days');
  const now = dateHandler();

  // If the reminder date would be in the past, use today instead
  if (reminderDate.isBefore(now)) {
    return now.endOf('day').toISOString();
  }

  return reminderDate.toISOString();
};

type PersonWithBirthday = Person & { birthday: string };

export async function generateBirthdayTasks(
  db: DBClient,
  userId: string
): Promise<ServiceResponse<number>> {
  try {
    // Get people with birthdays in next 30 days
    const thirtyDaysFromNow = dateHandler().add(30, 'days').format('MM-DD');
    const today = dateHandler().format('MM-DD');

    const { data: peopleWithBirthdays, error: fetchBirthdayError } = await db.rpc(
      'get_people_with_upcoming_birthdays',
      {
        p_user_id: userId,
        p_start_date: today,
        p_end_date: thirtyDaysFromNow
      }
    );

    if (fetchBirthdayError) {
      return {
        data: null,
        error: { ...ERRORS.GENERATION.FETCHING_BIRTHDAYS_FAILED, details: fetchBirthdayError }
      };
    }

    // Create an array of promises for task creation
    const taskPromises = peopleWithBirthdays.map(async (person: PersonWithBirthday) => {
      // Check if there's already an active birthday task
      const existingTasksResult = await getTasks({
        db,
        userId,
        personId: person.id
      });

      const hasExistingBirthdayTask = existingTasksResult.data?.some(
        (task) => task.trigger === TASK_TRIGGERS.BIRTHDAY_REMINDER
      );

      if (hasExistingBirthdayTask) {
        return null;
      }

      // Generate task content
      const birthdayDate = dateHandler(person.birthday).format('MMMM D');

      // This is where I want to replace the action with an AI generated action
      // It's able to get the person's details, determine the action to take, such as send a message, get a gift, suggest an event, or something else...
      // Generate the requisite task output based on the AI's response

      const taskContext = await generateObject({
        schema: taskContextSchema.extend({
          actionType: z
            .enum(Object.values(SUGGESTED_ACTION_TYPES) as [string, ...string[]])
            .describe('The type of action to suggest')
        }),
        prompt: `Based on the context of the person, determine the type of suggested action to take for ${person.first_name}'s birthday.

        actionType: This will be one of the following: ${Object.values(SUGGESTED_ACTION_TYPES).join(', ')} depending on the type of relationship between the person and the user.

        If the relationship is closer, we may want to suggest a more personal action such as getting a gift, or finding & suggesting an event.
       
        If the relationship is more distant, we may want to suggest a more generic action such as sending a message.
        
        Context: This will simply be something like ${person.first_name}'s birthday is coming up on ${birthdayDate}.

        Call to Action: This will be a brief sentence or two that explains the action to take related to the actionType.

        Examples: 
        actionType: buy-gift
        context: ${person.first_name}'s birthday is coming up on ${birthdayDate}.
        callToAction: I found some gift ideas for you to consider for ${person.first_name}.

        actionType: send-message
        context: It's ${person.first_name}'s birthday on ${birthdayDate}.
        callToAction: Here are some message ideas you can use to wish ${person.first_name} a happy birthday.

        actionType: share-content
        context: It's time to celebrate ${person.first_name}'s birthday on ${birthdayDate}!
        callToAction: I found some content that could be fun to share with ${person.first_name} on their birthday.

        Relationship Notes / Context:
        Assume we're not close and just need to send a generic message.
        `
      });

      console.log('AI::GenerateObject::TaskContext', taskContext);

      let suggestedAction: any;

      if (taskContext.actionType === SUGGESTED_ACTION_TYPES.SEND_MESSAGE) {
        suggestedAction = await generateObject({
          schema: sendMessageActionSchema,
          prompt: `
          Generate the suggested content and message variants based on the context.
          
          Create at least 4 message variants with different tones and styles. Include a mix of casual, formal, and friendly tones. Include at least one ridiculous or funny message such as a poem, joke, or something generally lighthearted.

          Context: ${JSON.stringify(taskContext, null, 2)}
        `
        });
      }

      if (taskContext.actionType === SUGGESTED_ACTION_TYPES.BUY_GIFT) {
        suggestedAction = await generateSearchObject({
          schema: buyGiftActionSchema,
          schemaName: 'suggested_gifts',
          messages: [
            {
              role: 'system',
              content: `
              `
            },
            {
              role: 'user',
              content: `
              `
            }
          ]
        });
      }

      console.log('AI::GenerateObject::SuggestedActionObject', suggestedAction);

      // Step 1: Determine the action to take and the call to action comment / reason
      // Step 2: Generation the suggested action object

      // const taskContent: TaskContext = {
      //   context: `${person.first_name}'s birthday is coming up on ${birthdayDate}`,
      //   callToAction: `Take some time to plan something special for their birthday`
      // };

      // Create the task
      return createTask({
        db,
        task: {
          userId,
          personId: person.id,
          trigger: TASK_TRIGGERS.BIRTHDAY_REMINDER,
          context: {
            context: taskContext.context,
            callToAction: taskContext.callToAction
          },
          suggestedActionType: taskContext.actionType,
          suggestedAction: suggestedAction,
          endAt: createBirthdayReminderDate(person.birthday)
        }
      });
    });

    // Wait for all task creation promises to complete
    const results = await Promise.all(taskPromises);

    // Count successful task creations
    const tasksCreated = results.filter((result) => result?.data).length;

    return { data: tasksCreated, error: null };
  } catch (error) {
    const serviceError = {
      ...ERRORS.GENERATION.BIRTHDAY_TASKS_FAILED,
      details: error
    };
    errorLogger.log(serviceError);
    return { data: null, error: serviceError };
  }
}
