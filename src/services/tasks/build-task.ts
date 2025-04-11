import { createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { TaskTrigger } from '@/lib/tasks/constants';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';

import { getPerson } from '../person/get-person';
import { formatAiSummaryOfPersonToDisplay } from '../summary/format-ai-summary';
import { createTask } from './create-task';
import { generateContextAndActionType } from './generate-tasks/generate-context-and-action-type';
import { generateTaskAction } from './generate-tasks/generate-task-action';
import { BuildTaskServiceResult } from './types';
import { isValidEndAt } from './validate-task-suggestion';
import { isValidTaskTrigger } from './validate-task-suggestion';

// Define errors
export const ERRORS = {
  GENERATION: {
    FAILED: createError(
      'generate_tasks_failed',
      ErrorType.API_ERROR,
      'Failed to generate tasks',
      'Unable to generate tasks at this time'
    ),
    MISSING_USER_ID: createError(
      'missing_user_id',
      ErrorType.VALIDATION_ERROR,
      'User ID is required',
      'User identifier is missing'
    ),
    MISSING_PERSON_ID: createError(
      'missing_person_id',
      ErrorType.VALIDATION_ERROR,
      'Person ID is required',
      'Person identifier is missing'
    ),
    INVALID_TRIGGER: createError(
      'invalid_trigger',
      ErrorType.VALIDATION_ERROR,
      'Trigger is invalid',
      'Trigger is invalid'
    ),
    INVALID_END_AT: createError('invalid_end_at', ErrorType.VALIDATION_ERROR, 'End at is invalid', 'End at is invalid')
  }
};

// Service params interface
export interface BuildTaskParams {
  db: DBClient;
  userId: string;
  trigger: TaskTrigger; // This is additional context...
  endAt: string;
  personId?: string;
  context?: string; // This could literally just be a string that be passed to the task context LLM call
}

function validateBuildTaskParams({ trigger, endAt, userId }: Pick<BuildTaskParams, 'trigger' | 'endAt' | 'userId'>) {
  // We should validate the inputs here before we even call the LLM
  const validTrigger = isValidTaskTrigger(trigger);
  const validEndAt = isValidEndAt(endAt);

  if (!validTrigger) {
    return { data: null, error: ERRORS.GENERATION.INVALID_TRIGGER };
  }

  if (!validEndAt) {
    return { data: null, error: ERRORS.GENERATION.INVALID_END_AT };
  }

  if (!userId) {
    return { data: null, error: ERRORS.GENERATION.MISSING_USER_ID };
  }

  return { data: null, error: null };
}

export async function buildTask({
  db,
  userId,
  personId,
  trigger,
  endAt,
  context
}: BuildTaskParams): Promise<BuildTaskServiceResult> {
  try {
    const validationResult = validateBuildTaskParams({ trigger, endAt, userId });

    if (validationResult.error) {
      return { data: null, error: validationResult.error };
    }

    // TODO: Get the user
    if (!personId) {
      // Assume the task is for the user
      return { data: null, error: ERRORS.GENERATION.MISSING_PERSON_ID };
    }

    const { data: person, error: personError } = await getPerson({ db, personId });

    if (personError || !person) {
      return { data: null, error: personError };
    }

    // Select the context and action type
    const taskContextAndActionType = await generateContextAndActionType({
      person: person.person,
      trigger,
      taskContext: context,
      personContext: formatAiSummaryOfPersonToDisplay(person.person.ai_summary)
    });

    console.log('AI::GenerateObject::TaskContextAndActionType', taskContextAndActionType);

    // generate the suggested action
    // validate the suggested action
    const suggestedAction = await generateTaskAction({
      db,
      taskContext: taskContextAndActionType
    });

    console.log('AI::GenerateObject::SuggestedAction', suggestedAction);

    // create the task and insert into the database
    const { data: task, error: taskError } = await createTask({
      db,
      task: {
        userId,
        personId,
        trigger,
        context: taskContextAndActionType,
        suggestedActionType: taskContextAndActionType.actionType,
        suggestedAction: suggestedAction.data,
        // TODO: Generate the endAt date from the generateContextAndActionType
        endAt
      }
    });

    if (taskError) {
      return { data: null, error: taskError };
    }

    console.log('AI::CreateTask::Task', task);

    return {
      data: task,
      error: null
    };
  } catch (error) {
    const serviceError = {
      ...ERRORS.GENERATION.FAILED,
      details: error
    };
    errorLogger.log(serviceError);
    return { data: null, error: serviceError };
  }
}

// chat -> build task -> generate suggested action -> validate suggested action -> create task -> insert into database

// system -> get upcoming birthdays -> build task(trigger: birthday)

// system -> get follow ups -> build task(trigger: follow up, & context: )

/*
* Birthday tasks
* const thirtyDaysFromNow = dateHandler().add(30, 'days').format('MM-DD');
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
      // TODO: Only check within the next 30 days
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

      // HERE IS WHERE WE BUILD THE TASK NOW

      const task = await buildTask({ ... })

              const taskContext = await generateTaskContext(person, birthdayDate);

              console.log('AI::GenerateObject::TaskContext', taskContext);

              let suggestedAction: any;

              if (taskContext.actionType === SUGGESTED_ACTION_TYPES.SEND_MESSAGE) {
                suggestedAction = await generateSendMessageSuggestedAction(taskContext);
              }
* 
* 
* 
* 
* 
*/
