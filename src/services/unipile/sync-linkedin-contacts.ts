import { SupabaseClient } from '@supabase/supabase-js';
import { F } from 'node_modules/@faker-js/faker/dist/airline-D6ksJFwG';

import { createErrorV2 as createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';
import { getAllRelationsByAccountId } from '@/vendors/unipile/client';
import { transformToPersonData } from '@/vendors/unipile/transformer';

import { createPerson } from '../person/create-person';
import { updatePersonField, updatePersonWebsite } from '../person/update-person-details';
import { searchPersonByNameAndLinkedInId } from './search-people-linkedin';

// Development mode settings
const MAX_BATCHES = process.env.NODE_ENV === 'development' ? 2 : Infinity;
const LIMIT = process.env.NODE_ENV === 'production' ? 50 : 5;
const BATCH_DELAY_MS = 1000; // 1 second delay between batches

// Helper function to create a delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Structured logging helper
interface LogContext {
  userId: string;
  accountId: string;
  batchNumber?: number;
  cursor?: string;
  linkedinPublicId?: string;
  personId?: string;
  operation?: 'search' | 'create' | 'update' | 'skip';
  duration?: number;
  error?: unknown;
  stats?: {
    processed: number;
    created: number;
    updated: number;
    skipped: number;
    errors: number;
  };
}

const logSync = (message: string, context: LogContext) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    message,
    ...context,
    environment: process.env.NODE_ENV
  };

  // In development, use console.log for readability
  if (process.env.NODE_ENV === 'development') {
    console.log(`[SYNC] ${JSON.stringify(logEntry, null, 2)}`);
  } else {
    // In production, use structured logging
    console.log(JSON.stringify(logEntry));
  }
};

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
  quickSync?: boolean;
}

export async function syncLinkedInContacts({
  db,
  userId,
  accountId,
  cursor,
  quickSync = false
}: SyncContactsParams): Promise<ServiceResponse<SyncContactsResult>> {
  const startTime = Date.now();
  logSync('Starting LinkedIn contacts sync', { userId, accountId, cursor });

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
      const batchStartTime = Date.now();

      // Check if we've reached the maximum number of batches in development
      if (batchCount >= MAX_BATCHES) {
        logSync('Reached maximum batch limit', { userId, accountId, batchNumber: batchCount });
        break;
      }

      logSync('Fetching relations batch', { userId, accountId, batchNumber: batchCount, cursor: currentCursor });

      const response = await getAllRelationsByAccountId({
        accountId,
        limit: LIMIT,
        cursor: currentCursor
      });

      if (!response) {
        logSync('No more relations to process', { userId, accountId, batchNumber: batchCount });
        break;
      }

      batchCount++;
      logSync('Processing relations batch', {
        userId,
        accountId,
        batchNumber: batchCount,
        cursor: currentCursor,
        duration: Date.now() - batchStartTime
      });

      // Process current batch of relations
      for (const relation of response.relations) {
        const relationStartTime = Date.now();
        result.processed.count++;

        const personData = transformToPersonData(relation, userId);

        try {
          logSync('Searching for existing person', {
            userId,
            accountId,
            batchNumber: batchCount,
            linkedinPublicId: personData.person.linkedin_public_id,
            operation: 'search'
          });

          const existingPerson = await searchPersonByNameAndLinkedInId({
            db,
            userId,
            firstName: personData.person.first_name || '',
            lastName: personData.person.last_name || '',
            linkedinPublicId: personData.person.linkedin_public_id || ''
          });

          if (existingPerson.data) {
            let updatedPerson = false;

            if (existingPerson.data.person.title !== personData.person.title) {
              logSync('Updating person title', {
                userId,
                accountId,
                batchNumber: batchCount,
                linkedinPublicId: personData.person.linkedin_public_id,
                personId: existingPerson.data.person.id,
                operation: 'update'
              });

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
                logSync('Failed to update person title', {
                  userId,
                  accountId,
                  batchNumber: batchCount,
                  linkedinPublicId: personData.person.linkedin_public_id,
                  personId: existingPerson.data.person.id,
                  operation: 'update',
                  error: updateTitleResult.error
                });
              }
              updatedPerson = true;
            }

            // Update linkedIn Public IF if not the same.
            if (existingPerson.data.person.linkedin_public_id !== personData.person.linkedin_public_id) {
              logSync('Updating linkedin_public_id', {
                userId,
                accountId,
                batchNumber: batchCount,
                linkedinPublicId: personData.person.linkedin_public_id,
                personId: existingPerson.data.person.id,
                operation: 'update'
              });
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
                logSync('Failed to update linkedin_public_id', {
                  userId,
                  accountId,
                  batchNumber: batchCount,
                  linkedinPublicId: personData.person.linkedin_public_id,
                  personId: existingPerson.data.person.id,
                  operation: 'update',
                  error: updateLinkedinPublicIdResult.error
                });
              }
              updatedPerson = true;
            }

            // Add website if not already in the list.
            if (existingPerson.data.websites?.every((website) => website.url !== personData.websites?.[0]?.url)) {
              logSync('Adding website', {
                userId,
                accountId,
                batchNumber: batchCount,
                linkedinPublicId: personData.person.linkedin_public_id,
                personId: existingPerson.data.person.id,
                operation: 'update'
              });
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
                logSync('Failed to update website', {
                  userId,
                  accountId,
                  batchNumber: batchCount,
                  linkedinPublicId: personData.person.linkedin_public_id,
                  personId: existingPerson.data.person.id,
                  operation: 'update',
                  error: updateWebsiteResult.error
                });
              }
              updatedPerson = true;
            }

            if (updatedPerson) {
              result.updated.count++;
              result.updated.record.push({
                ...existingPerson.data
              });
              logSync('Person updated successfully', {
                userId,
                accountId,
                batchNumber: batchCount,
                linkedinPublicId: personData.person.linkedin_public_id,
                personId: existingPerson.data.person.id,
                operation: 'update',
                duration: Date.now() - relationStartTime
              });
            } else {
              result.skipped.count++;
              result.skipped.record.push({
                ...existingPerson.data
              });
              logSync('Person skipped - no updates needed', {
                userId,
                accountId,
                batchNumber: batchCount,
                linkedinPublicId: personData.person.linkedin_public_id,
                personId: existingPerson.data.person.id,
                operation: 'skip',
                duration: Date.now() - relationStartTime
              });
            }
          } else {
            logSync('Creating new person', {
              userId,
              accountId,
              batchNumber: batchCount,
              linkedinPublicId: personData.person.linkedin_public_id,
              operation: 'create'
            });

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
              logSync('Failed to create person', {
                userId,
                accountId,
                batchNumber: batchCount,
                linkedinPublicId: personData.person.linkedin_public_id,
                operation: 'create',
                error: createResult.error
              });
            } else {
              result.created.count++;
              result.created.record.push(createResult.data);
              logSync('Person created successfully', {
                userId,
                accountId,
                batchNumber: batchCount,
                linkedinPublicId: personData.person.linkedin_public_id,
                personId: createResult.data?.person.id,
                operation: 'create',
                duration: Date.now() - relationStartTime
              });
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
          logSync('Failed to process relation', {
            userId,
            accountId,
            batchNumber: batchCount,
            linkedinPublicId: personData.person.linkedin_public_id,
            operation: 'skip',
            error,
            duration: Date.now() - relationStartTime
          });
        }
      }

      // Check if we should continue to the next page
      if (!response.has_more || !response.next_cursor) {
        logSync('No more pages to process', { userId, accountId, batchNumber: batchCount });
        break;
      }

      if (quickSync && result.skipped.count == LIMIT) {
        logSync('Skipped everyone in this batch, stopping sync', { userId, accountId, batchNumber: batchCount });
        break;
      }

      // Add delay before processing next batch
      logSync('Waiting before next batch', {
        userId,
        accountId,
        batchNumber: batchCount,
        duration: BATCH_DELAY_MS
      });
      await delay(BATCH_DELAY_MS);

      currentCursor = response.next_cursor;
    }

    const totalDuration = Date.now() - startTime;
    logSync('Sync completed', {
      userId,
      accountId,
      duration: totalDuration,
      stats: {
        processed: result.processed.count,
        created: result.created.count,
        updated: result.updated.count,
        skipped: result.skipped.count,
        errors: result.errors.length
      }
    });

    return { data: result, error: null };
  } catch (error) {
    const serviceError = {
      ...ERRORS.SYNC.FAILED,
      details: error
    };
    errorLogger.log(serviceError);
    logSync('Sync failed', {
      userId,
      accountId,
      error,
      duration: Date.now() - startTime
    });
    return { data: result, error: serviceError };
  }
}
