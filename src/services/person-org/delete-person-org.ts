import { z } from 'zod';

import { createErrorV2 as createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

export const deletePersonOrgSchema = z.object({
  person_id: z.string().min(1, 'Person ID is required'),
  organization_id: z.string().min(1, 'Organization ID is required'),
  user_id: z.string().min(1, 'User ID is required')
});

type DeletePersonOrgParams = z.infer<typeof deletePersonOrgSchema>;

export const ERRORS = {
  VALIDATION_ERROR: createError({
    name: 'validation_error',
    type: ErrorType.VALIDATION_ERROR,
    message: 'Person ID and Organization ID are required',
    displayMessage: 'Please provide both person and organization IDs'
  }),
  DELETE_FAILED: createError({
    name: 'delete_person_org_failed',
    type: ErrorType.DATABASE_ERROR,
    message: 'Failed to delete person-organization relationship',
    displayMessage: 'Unable to delete relationship at this time'
  }),
  NOT_FOUND: createError({
    name: 'person_org_not_found',
    type: ErrorType.NOT_FOUND,
    message: 'Person-organization relationship not found',
    displayMessage: 'The relationship you are trying to delete does not exist'
  })
};

export type DeletePersonOrgServiceResult = ServiceResponse<{
  id: string;
  person_id: string;
  organization_id: string;
  user_id: string;
}>;

export async function deletePersonOrg({
  db,
  data
}: {
  db: DBClient;
  data: DeletePersonOrgParams;
}): Promise<DeletePersonOrgServiceResult> {
  try {
    const validationResult = deletePersonOrgSchema.safeParse(data);

    if (!validationResult.success) {
      errorLogger.log(ERRORS.VALIDATION_ERROR, {
        details: { validationError: validationResult.error }
      });
      return { data: null, error: ERRORS.VALIDATION_ERROR };
    }

    const { person_id, organization_id, user_id } = validationResult.data;

    // First check if the relationship exists
    const { data: existingRelationship, error: fetchError } = await db
      .from('person_organization')
      .select('*')
      .eq('person_id', person_id)
      .eq('organization_id', organization_id)
      .eq('user_id', user_id)
      .single();

    // Handle the case where no record is found
    if (fetchError?.code === 'PGRST116') {
      errorLogger.log(ERRORS.NOT_FOUND, {
        details: { userId: user_id, personId: person_id, organizationId: organization_id }
      });
      return { data: null, error: ERRORS.NOT_FOUND };
    }

    // Handle other database errors
    if (fetchError) {
      errorLogger.log(ERRORS.DELETE_FAILED, {
        details: { ...fetchError, userId: user_id, personId: person_id, organizationId: organization_id }
      });
      return { data: null, error: ERRORS.DELETE_FAILED };
    }

    if (!existingRelationship) {
      errorLogger.log(ERRORS.NOT_FOUND, {
        details: { userId: user_id, personId: person_id, organizationId: organization_id }
      });
      return { data: null, error: ERRORS.NOT_FOUND };
    }

    // Delete the relationship
    const { data: deletedRelationship, error: deleteError } = await db
      .from('person_organization')
      .delete()
      .eq('person_id', person_id)
      .eq('organization_id', organization_id)
      .eq('user_id', user_id)
      .select()
      .single();

    if (deleteError) {
      errorLogger.log(ERRORS.DELETE_FAILED, {
        details: { ...deleteError, userId: user_id, personId: person_id, organizationId: organization_id }
      });
      return { data: null, error: ERRORS.DELETE_FAILED };
    }

    return { data: deletedRelationship, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.DELETE_FAILED, {
      details: {
        ...(error as Error),
        userId: data.user_id,
        personId: data.person_id,
        organizationId: data.organization_id
      }
    });
    return { data: null, error: ERRORS.DELETE_FAILED };
  }
}
