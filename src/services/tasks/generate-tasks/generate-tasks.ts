import { createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

import { generateBirthdayTasks } from './generate-birthday-task';

// Service params interface
export interface GenerateTasksParams {
  db: DBClient;
  userId: string;
}

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
    )
  }
};

interface GenerateTasksResult {
  generatedTasks: number;
  errors: string[];
}

export async function generateTasks({
  db,
  userId
}: GenerateTasksParams): Promise<ServiceResponse<GenerateTasksResult>> {
  try {
    if (!userId) {
      return { data: null, error: ERRORS.GENERATION.MISSING_USER_ID };
    }

    const errors: string[] = [];
    let totalTasksGenerated = 0;

    // Generate birthday tasks
    const birthdayTasksResult = await generateBirthdayTasks(db, userId);
    if (birthdayTasksResult.error) {
      errors.push(birthdayTasksResult.error.message);
    } else if (birthdayTasksResult.data) {
      totalTasksGenerated += birthdayTasksResult.data;
    }

    // Future: Add other task generation methods here

    return {
      data: {
        generatedTasks: totalTasksGenerated,
        errors
      },
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
