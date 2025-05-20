import { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

import { createErrorV2 as createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

export const createPersonSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().optional(),
  note: z.string().optional(),
  date_met: z.string().optional(),
  user_id: z.string().min(1, 'User ID is required')
});

type CreatePersonParams = z.infer<typeof createPersonSchema>;

export const ERRORS = {
  VALIDATION_ERROR: createError({
    name: 'validation_error',
    type: ErrorType.VALIDATION_ERROR,
    message: 'First name is required',
    displayMessage: 'Please provide a first name'
  }),
  CREATE_FAILED: createError({
    name: 'create_person_failed',
    type: ErrorType.DATABASE_ERROR,
    message: 'Failed to create person',
    displayMessage: 'Unable to create person at this time'
  }),
  CREATE_INTERACTION_FAILED: createError({
    name: 'create_interaction_failed',
    type: ErrorType.DATABASE_ERROR,
    message: 'Failed to create interaction',
    displayMessage: 'Person was created but unable to save the note'
  })
};

export type CreatePersonServiceResult = ServiceResponse<{
  id: string;
  first_name: string;
  last_name: string | null;
  date_met: string | null;
  user_id: string;
}>;

export async function createPerson({
  db,
  data
}: {
  db: SupabaseClient;
  data: CreatePersonParams;
}): Promise<CreatePersonServiceResult> {
  try {
    const validationResult = createPersonSchema.safeParse(data);

    if (!validationResult.success) {
      errorLogger.log(ERRORS.VALIDATION_ERROR, {
        details: { validationError: validationResult.error }
      });
      return { data: null, error: ERRORS.VALIDATION_ERROR };
    }

    const { first_name, last_name, date_met, user_id, note } = validationResult.data;

    // Create the person
    const { data: person, error: personError } = await db
      .from('person')
      .insert({
        first_name,
        last_name,
        date_met,
        user_id
      })
      .select()
      .single();

    if (personError) {
      errorLogger.log(ERRORS.CREATE_FAILED, {
        details: { ...personError, userId: user_id }
      });
      return { data: null, error: ERRORS.CREATE_FAILED };
    }

    // If there's a note, create an interaction
    if (note) {
      const { error: interactionError } = await db.from('interactions').insert({
        person_id: person.id,
        note,
        type: 'note',
        user_id
      });

      if (interactionError) {
        errorLogger.log(ERRORS.CREATE_INTERACTION_FAILED, {
          details: { ...interactionError, userId: user_id, personId: person.id }
        });
        return { data: null, error: ERRORS.CREATE_INTERACTION_FAILED };
      }
    }

    return { data: person, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.CREATE_FAILED, {
      details: { ...(error as Error), userId: data.user_id }
    });
    return { data: null, error: ERRORS.CREATE_FAILED };
  }
}
