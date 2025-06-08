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
import { updatePersonField, updatePersonWebsite } from '../person/update-person-details';

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
  processed: {
    count: number;
  };
  created: {
    count: number;
    record: any;
  };
  updated: {
    count: number;
    record: any;
  };
  skipped: {
    count: number;
    record: any;
  };
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
    processed: {
      count: 0
    },
    created: {
      count: 0,
      record: []
    },
    updated: {
      count: 0,
      record: []
    },
    skipped: {
      count: 0,
      record: []
    },
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
        result.processed.count++;

        try {
          const personData = transformToPersonData(relation, userId);
          const existingPerson = await searchPerson({
            db,
            userId,
            firstName: personData.person.first_name || '',
            lastName: personData.person.last_name || '',
            linkedinPublicId: personData.person.linkedin_public_id || ''
          });

          // TODO: Add better logic here to handle if the title has changed.
          // Clean this up to update the records accordingly.
          // Update Title if not the same.
          if (existingPerson.data) {
            if (existingPerson.data.person.title !== personData.person.title) {
              const updateTitleResult = await updatePersonField({
                db,
                personId: existingPerson.data.person.id,
                field: 'title',
                value: personData.person.title
              });
              if (updateTitleResult.error) {
                const error = {
                  ...ERRORS.SYNC.PERSON_UPDATE_FAILED,
                  details: updateTitleResult.error
                };
                errorLogger.log(error);
                result.errors.push({
                  error: error.message,
                  details: error
                });
              }
            }

            // Update linkedIn Public IF if not the same.
            if (existingPerson.data.person.linkedin_public_id !== personData.person.linkedin_public_id) {
              const updateLinkedinPublicIdResult = await updatePersonField({
                db,
                personId: existingPerson.data.person.id,
                field: 'linkedin_public_id',
                value: personData.person.linkedin_public_id
              });
              if (updateLinkedinPublicIdResult.error) {
                const error = {
                  ...ERRORS.SYNC.PERSON_UPDATE_FAILED,
                  details: updateLinkedinPublicIdResult.error
                };
                errorLogger.log(error);
                result.errors.push({
                  error: error.message,
                  details: error
                });
              }
            }

            // Add website if not already in the list.
            if (existingPerson.data.websites?.every((website) => website.url !== personData.websites?.[0]?.url)) {
              const updateWebsiteResult = await updatePersonWebsite({
                db,
                personId: existingPerson.data.person.id,
                data: {
                  url: personData.websites?.[0]?.url,
                  label: personData.websites?.[0]?.label
                }
              });
              if (updateWebsiteResult.error) {
                const error = {
                  ...ERRORS.SYNC.PERSON_UPDATE_FAILED,
                  details: updateWebsiteResult.error
                };
                errorLogger.log(error);
                result.errors.push({
                  error: error.message,
                  details: error
                });
              }
            }

            result.updated.count++;
            result.updated.record.push({
              ...existingPerson.data
            });
          } else {
            // Create new person
            // TODO: Need to run an extraction to get the profile picture from the profile page.
            const createResult = await createPerson({
              db,
              data: {
                ...personData,
                note: 'Imported via LinkedIn'
              }
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
              result.created.count++;
              result.created.record.push(createResult.data);
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
          result.skipped.count++;
          result.skipped.record.push(relation);
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
