import { dateHandler } from '@/lib/dates/helpers';
import { createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { SUGGESTED_ACTION_TYPES, TASK_TRIGGERS } from '@/lib/tasks/constants';
import { DBClient, Person } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

import { createTask } from '../create-task';
import { getTasks } from '../get-tasks';

// import { generateSendMessageSuggestedAction, generateTaskContext } from './generate-context-and-action-type';

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

export async function generateBirthdayTasks(db: DBClient, userId: string): Promise<ServiceResponse<number>> {
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
    // const taskPromises = peopleWithBirthdays.map(async (person: PersonWithBirthday) => {
    //   // Check if there's already an active birthday task
    //   // TODO: Only check within the next 30 days
    //   const existingTasksResult = await getTasks({
    //     db,
    //     userId,
    //     personId: person.id
    //   });

    //   const hasExistingBirthdayTask = existingTasksResult.data?.some(
    //     (task) => task.trigger === TASK_TRIGGERS.BIRTHDAY_REMINDER.slug
    //   );

    //   if (hasExistingBirthdayTask) {
    //     return null;
    //   }

    //   // Generate task content
    //   const birthdayDate = dateHandler(person.birthday).format('MMMM D');
    // }
    // const taskContext = await generateTaskContext(person, birthdayDate);

    // console.log('AI::GenerateObject::TaskContext', taskContext);

    // let suggestedAction: any;

    // if (taskContext.actionType === SUGGESTED_ACTION_TYPES.SEND_MESSAGE) {
    //   suggestedAction = await generateSendMessageSuggestedAction(taskContext);
    //}

    // if (taskContext.actionType === SUGGESTED_ACTION_TYPES.BUY_GIFT) {
    //   suggestedAction = await generateSearchObject({
    //     schema: buyGiftActionSchema,
    //     schemaName: 'suggested_gifts',
    //     messages: [
    //       {
    //         role: 'system',
    //         content: `
    //         `
    //       },
    //       {
    //         role: 'user',
    //         content: `
    //         `
    //       }
    //     ]
    //   });
    // }

    // console.log('AI::GenerateObject::SuggestedActionObject', suggestedAction);

    // // Create the task
    // return createTask({
    //   db,
    //   task: {
    //     userId,
    //     personId: person.id,
    //     trigger: TASK_TRIGGERS.BIRTHDAY_REMINDER,
    //     context: {
    //       context: taskContext.context,
    //       callToAction: taskContext.callToAction
    //     },
    //     suggestedActionType: taskContext.actionType,
    //     suggestedAction: suggestedAction,
    //     endAt: createBirthdayReminderDate(person.birthday)
    //   }
    // });
    // });

    // // Wait for all task creation promises to complete
    // const results = await Promise.all(taskPromises);

    // // Count successful task creations
    // const tasksCreated = results.filter((result) => result?.data).length;

    return { data: 0, error: null };
  } catch (error) {
    const serviceError = {
      ...ERRORS.GENERATION.BIRTHDAY_TASKS_FAILED,
      details: error
    };
    errorLogger.log(serviceError);
    return { data: null, error: serviceError };
  }
}
