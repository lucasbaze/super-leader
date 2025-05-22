import { z } from 'zod';

import { createErrorV2 as createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

export const createPersonOrgSchema = z.object({
  person_id: z.string().min(1, 'Person ID is required'),
  organization_id: z.string().min(1, 'Organization ID is required'),
  user_id: z.string().min(1, 'User ID is required')
});

type CreatePersonOrgParams = z.infer<typeof createPersonOrgSchema>;

export const ERRORS = {
  VALIDATION_ERROR: createError({
    name: 'validation_error',
    type: ErrorType.VALIDATION_ERROR,
    message: 'Person ID and Organization ID are required',
    displayMessage: 'Please provide both person and organization IDs'
  }),
  CREATE_FAILED: createError({
    name: 'create_person_org_failed',
    type: ErrorType.DATABASE_ERROR,
    message: 'Failed to create person-organization relationship',
    displayMessage: 'Unable to create relationship at this time'
  })
};

export type CreatePersonOrgServiceResult = ServiceResponse<{
  id: string;
  person_id: string;
  organization_id: string;
  user_id: string;
}>;

export async function createPersonOrg({
  db,
  data
}: {
  db: DBClient;
  data: CreatePersonOrgParams;
}): Promise<CreatePersonOrgServiceResult> {
  try {
    console.log('person_id', data.person_id, data.organization_id, data.user_id);
    const validationResult = createPersonOrgSchema.safeParse(data);

    if (!validationResult.success) {
      errorLogger.log(ERRORS.VALIDATION_ERROR, {
        details: { validationError: validationResult.error }
      });
      return { data: null, error: ERRORS.VALIDATION_ERROR };
    }

    const { person_id, organization_id, user_id } = validationResult.data;

    // Create the person-organization relationship
    const { data: personOrg, error: personOrgError } = await db
      .from('person_organization')
      .insert({
        person_id,
        organization_id,
        user_id
      })
      .select()
      .single();

    if (personOrgError) {
      errorLogger.log(ERRORS.CREATE_FAILED, {
        details: { ...personOrgError, userId: user_id, personId: person_id, organizationId: organization_id }
      });
      return { data: null, error: ERRORS.CREATE_FAILED };
    }

    return { data: personOrg, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.CREATE_FAILED, {
      details: {
        ...(error as Error),
        userId: data.user_id,
        personId: data.person_id,
        organizationId: data.organization_id
      }
    });
    return { data: null, error: ERRORS.CREATE_FAILED };
  }
}
