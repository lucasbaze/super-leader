import { NextRequest } from 'next/server';

import { z } from 'zod';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { createInteraction, getPersonActivity } from '@/services/person/person-activity';
import { ErrorType } from '@/types/errors';
import { createClient } from '@/utils/supabase/server';

// Validation schema for the request body
const createInteractionSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  note: z.string().optional()
});

export type TCreateInteractionRequest = z.infer<typeof createInteractionSchema>;

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();

    const authResult = await validateAuthentication(supabase);
    if (authResult.error) {
      return apiResponse.unauthorized(authResult.error);
    }

    const { id } = await Promise.resolve(params);

    const result = await getPersonActivity({
      db: supabase,
      personId: id
    });

    if (result.error) {
      return apiResponse.error(result.error);
    }

    return apiResponse.success(result.data);
  } catch (error) {
    return apiResponse.error({
      name: 'fetch_activity_error',
      type: ErrorType.DATABASE_ERROR,
      message: 'Failed to fetch person activity',
      displayMessage: 'Unable to load activity information'
    });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();

    // Validate authentication
    const authResult = await validateAuthentication(supabase);
    if (authResult.error) {
      return apiResponse.unauthorized(authResult.error);
    }

    if (!authResult.data) {
      return apiResponse.unauthorized(toError(authResult.error));
    }

    // Get and validate person ID from params
    const { id: personId } = await Promise.resolve(params);

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createInteractionSchema.safeParse(body);

    if (!validationResult.success) {
      return apiResponse.validationError(toError(validationResult.error));
    }

    // Create the interaction
    const result = await createInteraction({
      db: supabase,
      data: {
        person_id: personId,
        user_id: authResult?.data?.id,
        type: validationResult.data.type,
        note: validationResult.data.note
      }
    });

    if (result.error) {
      return apiResponse.error(result.error);
    }

    return apiResponse.success(result.data);
  } catch (error) {
    return apiResponse.error({
      name: 'create_interaction_error',
      type: ErrorType.DATABASE_ERROR,
      message: 'Failed to create interaction',
      displayMessage: 'Unable to save interaction'
    });
  }
}
