import { SupabaseClient } from '@supabase/supabase-js';

import { createErrorV2 as createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';
import { getAllRelationsByAccountId } from '@/vendors/unipile/client';
import { transformToPersonData } from '@/vendors/unipile/transformer';

import { searchPerson } from '../people/search-people-linkedin';
import { createPerson } from '../person/create-person';
import { getPerson } from '../person/get-person';
import { updatePersonField } from '../person/update-person-details';

// Development mode settings
const MAX_BATCHES = process.env.NODE_ENV === 'development' ? 2 : Infinity;

export const ERRORS = {
  SYNC: {
    FAILED: createError({
      name: 'unipile_sync_failed',
      type: ErrorType.API_ERROR,
      message: 'Failed to sync Unipile contacts',
      displayMessage: 'Unable to sync contacts at this time'
    }),
    PERSON_UPDATE_FAILED: createError({
      name: 'unipile_person_update_failed',
      type: ErrorType.API_ERROR,
      message: 'Failed to update person from Unipile',
      displayMessage: 'Unable to update contact information'
    }),
    PERSON_CREATE_FAILED: createError({
      name: 'unipile_person_create_failed',
      type: ErrorType.API_ERROR,
      message: 'Failed to create person from Unipile',
      displayMessage: 'Unable to create contact'
    }),
    RELATION_PROCESS_FAILED: createError({
      name: 'unipile_relation_process_failed',
      type: ErrorType.API_ERROR,
      message: 'Failed to process relation',
      displayMessage: 'Unable to process contact information'
    })
  }
};

export interface SyncContactsResult {
  processed: number;
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{
    error: string;
    details?: unknown;
  }>;
}

export interface SyncContactsParams {
  db: SupabaseClient;
  userId: string;
  accountId: string;
  cursor?: string;
}

export async function syncLinkedInContacts({
  db,
  userId,
  accountId,
  cursor
}: SyncContactsParams): Promise<ServiceResponse<SyncContactsResult>> {
  const result: SyncContactsResult = {
    processed: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: []
  };

  let currentCursor = cursor;
  let batchCount = 0;

  try {
    while (true) {
      // Check if we've reached the maximum number of batches in development
      if (batchCount >= MAX_BATCHES) {
        console.log(`[DEV] Reached maximum batch limit of ${MAX_BATCHES}`);
        break;
      }

      const response = await getAllRelationsByAccountId({
        accountId,
        limit: 10,
        cursor: currentCursor
      });

      if (!response) {
        console.log(`[DEV] No more relations to process`);
        break;
      }

      batchCount++;
      console.log(`[DEV] Processing batch ${batchCount} of ${MAX_BATCHES}`);

      // Process current batch of relations
      for (const relation of response.relations) {
        result.processed++;

        try {
          const personData = transformToPersonData(relation, userId);
          const existingPerson = await searchPerson({
            db,
            userId,
            firstName: personData.person.first_name || '',
            lastName: personData.person.last_name || '',
            linkedinPublicId: personData.person.linkedin_public_id || ''
          });

          if (existingPerson.data) {
            if (existingPerson.data.title === personData.person.title) {
              result.skipped++;
              continue;
            }

            // Update existing person
            const updateResult = await updatePersonField({
              db,
              personId: existingPerson.data.id,
              field: 'title',
              value: personData.person.title
            });

            if (updateResult.error) {
              const error = {
                ...ERRORS.SYNC.PERSON_UPDATE_FAILED,
                details: updateResult.error
              };
              errorLogger.log(error);
              result.errors.push({
                error: error.message,
                details: error
              });
            } else {
              result.updated++;
            }
          } else {
            // Create new person
            const createResult = await createPerson({
              db,
              data: personData
            });

            if (createResult.error) {
              const error = {
                ...ERRORS.SYNC.PERSON_CREATE_FAILED,
                details: createResult.error
              };
              errorLogger.log(error);
              result.errors.push({
                error: error.message,
                details: error
              });
            } else {
              result.created++;
            }
          }
        } catch (error) {
          const serviceError = {
            ...ERRORS.SYNC.RELATION_PROCESS_FAILED,
            details: error
          };
          errorLogger.log(serviceError);
          result.errors.push({
            error: serviceError.message,
            details: serviceError
          });
          result.skipped++;
        }
      }

      // Check if we should continue to the next page
      if (!response.has_more || !response.next_cursor) {
        break;
      }

      currentCursor = response.next_cursor;
    }

    return { data: result, error: null };
  } catch (error) {
    const serviceError = {
      ...ERRORS.SYNC.FAILED,
      details: error
    };
    errorLogger.log(serviceError);
    return { data: result, error: serviceError };
  }
}
