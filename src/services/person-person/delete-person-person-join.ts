import { z } from 'zod';

import { createErrorV2 as createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

export const deletePersonPersonJoinSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  edgePersonId: z.string().min(1, 'Edge person ID is required'),
  nodePersonId: z.string().min(1, 'Node person ID is required')
});

type DeletePersonPersonJoinParams = z.infer<typeof deletePersonPersonJoinSchema>;

export const ERRORS = {
  VALIDATION_ERROR: createError({
    name: 'validation_error',
    type: ErrorType.VALIDATION_ERROR,
    message: 'User ID, Edge Person ID, and Node Person ID are required',
    displayMessage: 'Please provide all required IDs'
  }),
  DELETE_FAILED: createError({
    name: 'delete_person_person_join_failed',
    type: ErrorType.DATABASE_ERROR,
    message: 'Failed to delete person-person relationship',
    displayMessage: 'Unable to delete relationship at this time'
  }),
  NOT_FOUND: createError({
    name: 'person_person_join_not_found',
    type: ErrorType.NOT_FOUND,
    message: 'Person-person relationship not found',
    displayMessage: 'The relationship you are trying to delete does not exist'
  })
};

export type DeletePersonPersonJoinServiceResult = ServiceResponse<{
  id: string;
  edge_person_id: string;
  node_person_id: string;
  user_id: string;
  relation: string | null;
  note: string | null;
}>;

async function tryDeleteRelationship(
  db: DBClient,
  userId: string,
  edgePersonId: string,
  nodePersonId: string
): Promise<{ data: any; error: any }> {
  const { data: existingRelationship, error: fetchError } = await db
    .from('person_person_relation')
    .select('*')
    .eq('edge_person_id', edgePersonId)
    .eq('node_person_id', nodePersonId)
    .eq('user_id', userId)
    .single();

  if (fetchError?.code === 'PGRST116') {
    return { data: null, error: 'NOT_FOUND' };
  }

  if (fetchError) {
    return { data: null, error: 'DATABASE_ERROR' };
  }

  if (!existingRelationship) {
    return { data: null, error: 'NOT_FOUND' };
  }

  const { data: deletedRelationship, error: deleteError } = await db
    .from('person_person_relation')
    .delete()
    .eq('edge_person_id', edgePersonId)
    .eq('node_person_id', nodePersonId)
    .eq('user_id', userId)
    .select()
    .single();

  if (deleteError) {
    return { data: null, error: 'DATABASE_ERROR' };
  }

  return { data: deletedRelationship, error: null };
}

export async function deletePersonPersonJoin({
  db,
  data
}: {
  db: DBClient;
  data: DeletePersonPersonJoinParams;
}): Promise<DeletePersonPersonJoinServiceResult> {
  try {
    const validationResult = deletePersonPersonJoinSchema.safeParse(data);

    if (!validationResult.success) {
      errorLogger.log(ERRORS.VALIDATION_ERROR, {
        details: { validationError: validationResult.error }
      });
      return { data: null, error: ERRORS.VALIDATION_ERROR };
    }

    const { userId, edgePersonId, nodePersonId } = validationResult.data;

    // Try both combinations of edge and node person IDs
    const [forwardResult, reverseResult] = await Promise.all([
      tryDeleteRelationship(db, userId, edgePersonId, nodePersonId),
      tryDeleteRelationship(db, userId, nodePersonId, edgePersonId)
    ]);

    // If either deletion was successful, return that result
    if (forwardResult.data) {
      return { data: forwardResult.data, error: null };
    }
    if (reverseResult.data) {
      return { data: reverseResult.data, error: null };
    }

    // If both attempts failed with NOT_FOUND, return NOT_FOUND error
    if (forwardResult.error === 'NOT_FOUND' && reverseResult.error === 'NOT_FOUND') {
      errorLogger.log(ERRORS.NOT_FOUND, {
        details: { userId, edgePersonId, nodePersonId }
      });
      return { data: null, error: ERRORS.NOT_FOUND };
    }

    // If either attempt failed with a database error, return DELETE_FAILED
    errorLogger.log(ERRORS.DELETE_FAILED, {
      details: { userId, edgePersonId, nodePersonId }
    });
    return { data: null, error: ERRORS.DELETE_FAILED };
  } catch (error) {
    errorLogger.log(ERRORS.DELETE_FAILED, {
      details: {
        ...(error as Error),
        userId: data.userId,
        edgePersonId: data.edgePersonId,
        nodePersonId: data.nodePersonId
      }
    });
    return { data: null, error: ERRORS.DELETE_FAILED };
  }
}
