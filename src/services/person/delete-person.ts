import { z } from 'zod';

import { createErrorV2 as createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

export const deletePersonSchema = z.object({
  person_id: z.string().min(1, 'Person ID is required'),
  user_id: z.string().min(1, 'User ID is required')
});

type DeletePersonParams = z.infer<typeof deletePersonSchema>;

export const ERRORS = {
  VALIDATION_ERROR: createError({
    name: 'validation_error',
    type: ErrorType.VALIDATION_ERROR,
    message: 'Person ID and User ID are required',
    displayMessage: 'Please provide both person and user IDs'
  }),
  DELETE_FAILED: createError({
    name: 'delete_person_failed',
    type: ErrorType.DATABASE_ERROR,
    message: 'Failed to delete person',
    displayMessage: 'Unable to delete person at this time'
  }),
  NOT_FOUND: createError({
    name: 'person_not_found',
    type: ErrorType.NOT_FOUND,
    message: 'Person not found',
    displayMessage: 'The person you are trying to delete does not exist'
  })
};

export type DeletePersonServiceResult = ServiceResponse<{
  id: string;
  first_name: string;
  last_name: string | null;
  user_id: string;
}>;

export async function deletePerson({
  db,
  data
}: {
  db: DBClient;
  data: DeletePersonParams;
}): Promise<DeletePersonServiceResult> {
  try {
    const validationResult = deletePersonSchema.safeParse(data);

    if (!validationResult.success) {
      errorLogger.log(ERRORS.VALIDATION_ERROR, {
        details: { validationError: validationResult.error }
      });
      return { data: null, error: ERRORS.VALIDATION_ERROR };
    }

    const { person_id, user_id } = validationResult.data;

    // First check if the person exists
    const { data: existingPerson, error: fetchError } = await db
      .from('person')
      .select('*')
      .eq('id', person_id)
      .eq('user_id', user_id)
      .single();

    // Handle the case where no record is found
    if (fetchError?.code === 'PGRST116') {
      errorLogger.log(ERRORS.NOT_FOUND, {
        details: { userId: user_id, personId: person_id }
      });
      return { data: null, error: ERRORS.NOT_FOUND };
    }

    // Handle other database errors
    if (fetchError) {
      errorLogger.log(ERRORS.DELETE_FAILED, {
        details: { ...fetchError, userId: user_id, personId: person_id }
      });
      return { data: null, error: ERRORS.DELETE_FAILED };
    }

    if (!existingPerson) {
      errorLogger.log(ERRORS.NOT_FOUND, {
        details: { userId: user_id, personId: person_id }
      });
      return { data: null, error: ERRORS.NOT_FOUND };
    }

    // Delete the person (this will cascade delete all related records due to ON DELETE CASCADE)
    const { data: deletedPerson, error: deleteError } = await db
      .from('person')
      .delete()
      .eq('id', person_id)
      .eq('user_id', user_id)
      .select()
      .single();

    if (deleteError) {
      errorLogger.log(ERRORS.DELETE_FAILED, {
        details: { ...deleteError, userId: user_id, personId: person_id }
      });
      return { data: null, error: ERRORS.DELETE_FAILED };
    }

    return { data: deletedPerson, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.DELETE_FAILED, {
      details: {
        ...(error as Error),
        userId: data.user_id,
        personId: data.person_id
      }
    });
    return { data: null, error: ERRORS.DELETE_FAILED };
  }
}
