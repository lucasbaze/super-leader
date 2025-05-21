import { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

import { createErrorV2 as createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

export const createOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  url: z.string().url('Must be a valid URL').optional().nullable(),
  user_id: z.string().min(1, 'User ID is required')
});

type CreateOrganizationParams = z.infer<typeof createOrganizationSchema>;

export const ERRORS = {
  VALIDATION_ERROR: createError({
    name: 'validation_error',
    type: ErrorType.VALIDATION_ERROR,
    message: 'Organization name is required',
    displayMessage: 'Please provide an organization name'
  }),
  CREATE_FAILED: createError({
    name: 'create_organization_failed',
    type: ErrorType.DATABASE_ERROR,
    message: 'Failed to create organization',
    displayMessage: 'Unable to create organization at this time'
  })
};

export type CreateOrganizationServiceResult = ServiceResponse<{
  id: number;
  name: string;
  url: string | null;
  user_id: string;
}>;

export async function createOrganization({
  db,
  data
}: {
  db: SupabaseClient;
  data: CreateOrganizationParams;
}): Promise<CreateOrganizationServiceResult> {
  try {
    const validationResult = createOrganizationSchema.safeParse(data);

    if (!validationResult.success) {
      errorLogger.log(ERRORS.VALIDATION_ERROR, {
        details: { validationError: validationResult.error }
      });
      return { data: null, error: ERRORS.VALIDATION_ERROR };
    }

    const { name, url, user_id } = validationResult.data;

    // Create the organization
    const { data: organization, error: organizationError } = await db
      .from('organization')
      .insert({
        name,
        url,
        user_id
      })
      .select()
      .single();

    if (organizationError) {
      errorLogger.log(ERRORS.CREATE_FAILED, {
        details: { ...organizationError, userId: user_id }
      });
      return { data: null, error: ERRORS.CREATE_FAILED };
    }

    return { data: organization, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.CREATE_FAILED, {
      details: { ...(error as Error), userId: data.user_id }
    });
    return { data: null, error: ERRORS.CREATE_FAILED };
  }
}
