import { z } from 'zod';

import { createErrorV2 as createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { DBClient, PersonPersonRelation } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

export const createPersonPersonJoinSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  edgePersonId: z.string().min(1, 'Edge person ID is required'),
  nodePersonId: z.string().min(1, 'Node person ID is required'),
  note: z.string().optional().nullable(),
  relation: z.string().optional().nullable()
});

export type CreatePersonPersonJoinParams = z.infer<typeof createPersonPersonJoinSchema>;

export const ERRORS = {
  VALIDATION_ERROR: createError({
    name: 'validation_error',
    type: ErrorType.VALIDATION_ERROR,
    message: 'Both person IDs are required',
    displayMessage: 'Please provide both person IDs.'
  }),
  PERSON_NOT_FOUND: createError({
    name: 'person_not_found',
    type: ErrorType.NOT_FOUND,
    message: 'One or both people do not exist',
    displayMessage: 'Could not find one or both people.'
  }),
  CREATE_FAILED: createError({
    name: 'create_person_person_join_failed',
    type: ErrorType.DATABASE_ERROR,
    message: 'Failed to create person-person relationship',
    displayMessage: 'Unable to create relationship at this time.'
  })
};

export type CreatePersonPersonJoinServiceResult = ServiceResponse<PersonPersonRelation>;

export async function createPersonPersonJoin({
  db,
  data
}: {
  db: DBClient;
  data: CreatePersonPersonJoinParams;
}): Promise<CreatePersonPersonJoinServiceResult> {
  try {
    const validationResult = createPersonPersonJoinSchema.safeParse(data);
    if (!validationResult.success) {
      errorLogger.log(ERRORS.VALIDATION_ERROR, {
        details: { validationError: validationResult.error }
      });
      return { data: null, error: ERRORS.VALIDATION_ERROR };
    }
    const { userId, edgePersonId, nodePersonId, note, relation } = validationResult.data;

    // Verify both people exist
    const { data: nodePerson } = await db.from('person').select('id').eq('id', nodePersonId).single();

    const { data: edgePerson } = await db.from('person').select('id').eq('id', edgePersonId).single();
    if (!edgePerson || !nodePerson) {
      errorLogger.log(ERRORS.PERSON_NOT_FOUND, {
        details: { edgePersonId, nodePersonId }
      });
      return { data: null, error: ERRORS.PERSON_NOT_FOUND };
    }

    // Create the join
    const { data: join, error: joinError } = await db
      .from('person_person_relation')
      .insert({
        user_id: userId,
        edge_person_id: edgePersonId,
        node_person_id: nodePersonId,
        note: note ?? null,
        relation: relation ?? null
      })
      .select()
      .single();

    if (joinError) {
      errorLogger.log(ERRORS.CREATE_FAILED, {
        details: { ...joinError, edgePersonId, nodePersonId }
      });
      return { data: null, error: ERRORS.CREATE_FAILED };
    }

    return { data: join, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.CREATE_FAILED, {
      details: {
        ...(error as Error),
        edgePersonId: data.edgePersonId,
        nodePersonId: data.nodePersonId
      }
    });
    return { data: null, error: ERRORS.CREATE_FAILED };
  }
}
