import { NextRequest } from 'next/server';

import { z } from 'zod';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { ErrorType } from '@/types/errors';
import { createClient } from '@/utils/supabase/server';

const createPersonSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().optional(),
  note: z.string().optional(),
  date_met: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const authResult = await validateAuthentication(supabase);

    if (authResult.error || !authResult.data) {
      return apiResponse.unauthorized(toError(authResult.error));
    }

    const body = await request.json();
    const validationResult = createPersonSchema.safeParse(body);

    if (!validationResult.success) {
      return apiResponse.validationError(toError(validationResult.error));
    }

    const { first_name, last_name, note, date_met } = validationResult.data;

    // Start a transaction to create both person and interaction
    const { data: person, error: personError } = await supabase
      .from('person')
      .insert({
        first_name,
        last_name,
        date_met,
        user_id: authResult.data.id
      })
      .select()
      .single();

    if (personError) {
      return apiResponse.error({
        name: 'create_person_error',
        type: ErrorType.DATABASE_ERROR,
        message: 'Failed to create person',
        displayMessage: 'Unable to create person at this time',
        details: personError
      });
    }

    if (note) {
      const { error: interactionError } = await supabase.from('interactions').insert({
        person_id: person.id,
        note,
        type: 'meeting',
        user_id: authResult.data.id
      });

      if (interactionError) {
        return apiResponse.error({
          name: 'create_interaction_error',
          type: ErrorType.DATABASE_ERROR,
          message: 'Failed to create interaction',
          displayMessage: 'Person was created but unable to save the note',
          details: interactionError
        });
      }
    }

    return apiResponse.success(person);
  } catch (error) {
    return apiResponse.error({
      name: 'create_person_error',
      type: ErrorType.INTERNAL_ERROR,
      message: 'Failed to create person',
      displayMessage: 'Unable to create person at this time',
      details: error
    });
  }
}
