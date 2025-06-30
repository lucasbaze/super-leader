import { dateHandler } from '@/lib/dates/helpers';
import { createError, errorLogger } from '@/lib/errors';
import { TASK_TRIGGERS } from '@/lib/tasks/constants';
import { getTasks } from '@/services/tasks/get-tasks';
import { DBClient, Person } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

import { InputAdapter } from '../../types';

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
    ),
    FETCHING_PEOPLE_FAILED: createError(
      'fetching_people_failed',
      ErrorType.API_ERROR,
      'Failed to fetch people',
      'Unable to fetch people at this time'
    )
  }
};

type PersonWithBirthday = Person & { birthday: string };
type PersonWithBirthdayFragment = {
  personId: string;
  personName: string;
  birthdayDate: string;
};

const getPeopleWithUpcomingBirthdays = async (
  db: DBClient,
  userId: string
): Promise<ServiceResponse<PersonWithBirthdayFragment[]>> => {
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
    const birthdaysWithoutTasks: PersonWithBirthdayFragment[] = peopleWithBirthdays.map(
      async (person: PersonWithBirthday) => {
        // Check if there's already an active birthday task
        // TODO: Only check within the next 30 days
        const existingTasksResult = await getTasks({
          db,
          userId,
          personId: person.id
        });

        const hasExistingBirthdayTask = existingTasksResult.data?.some(
          (task) => task.trigger === TASK_TRIGGERS.BIRTHDAY_REMINDER.slug
        );

        if (hasExistingBirthdayTask) {
          return null;
        }

        // Generate task content
        const birthdayDate = dateHandler(person.birthday).format('MMMM D');

        return {
          personId: person.id,
          personName: person.first_name,
          birthdayDate
        };
      }
    );

    // Wait for all task creation promises to complete
    const results = (await Promise.all(birthdaysWithoutTasks)).filter((result) => result !== null);

    return { data: results, error: null };
  } catch (error) {
    const serviceError = {
      ...ERRORS.GENERATION.BIRTHDAY_TASKS_FAILED,
      details: error
    };
    errorLogger.log(serviceError);
    return { data: null, error: serviceError };
  }
};

const BIRTHDAY_ADAPTER_ERRORS = {
  FAILED_TO_BUILD_BIRTHDAY_CONTEXT: createError(
    'failed_to_build_birthday_context',
    ErrorType.API_ERROR,
    'Failed to build birthday context',
    'Unable to build birthday context at this time'
  )
};

export const birthdayAdapter: InputAdapter<PersonWithBirthdayFragment[]> = {
  id: 'upcoming-birthdays',
  description: 'Upcoming birthdays the user has recorded for their contacts',
  tags: ['birthday', 'upcoming', 'gifts'],
  async getContextFragments({ db, userId }) {
    try {
      const { data, error } = await getPeopleWithUpcomingBirthdays(db, userId);

      if (error) {
        return { peopleIds: [], data: null };
      }

      const peopleIds = data?.map((person) => person.personId) ?? [];

      return { peopleIds, data };
    } catch (error) {
      errorLogger.log(BIRTHDAY_ADAPTER_ERRORS.FAILED_TO_BUILD_BIRTHDAY_CONTEXT, { details: error });
      return { peopleIds: [], data: null };
    }
  }
};
