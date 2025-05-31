import { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

import { createErrorV2 as createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { PersonCreateFormData, personCreateSchema } from '@/lib/schemas/person-create';
import { Address, ContactMethod, Interaction, Person, Website } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

import { updatePersonAddress, updatePersonContactMethod, updatePersonWebsite } from './update-person-details';

export const ERRORS = {
  VALIDATION_ERROR: createError({
    name: 'validation_error',
    type: ErrorType.VALIDATION_ERROR,
    message: 'First name and user ID are required',
    displayMessage: 'Please provide a first name and user ID'
  }),
  CREATE_FAILED: createError({
    name: 'create_person_failed',
    type: ErrorType.DATABASE_ERROR,
    message: 'Failed to create person',
    displayMessage: 'Unable to create person at this time'
  }),
  CREATE_RELATED_FAILED: createError({
    name: 'create_related_failed',
    type: ErrorType.DATABASE_ERROR,
    message: 'Failed to create related record',
    displayMessage: 'Unable to create related record at this time'
  })
};

export type CreatePersonServiceResult = ServiceResponse<{
  person: Person;
  contactMethods?: ContactMethod[];
  addresses?: Address[];
  websites?: Website[];
  interaction?: Interaction;
}>;

export async function createPerson({
  db,
  data
}: {
  db: SupabaseClient;
  data: PersonCreateFormData;
}): Promise<CreatePersonServiceResult> {
  try {
    const validationResult = personCreateSchema.safeParse(data);
    if (!validationResult.success) {
      errorLogger.log(ERRORS.VALIDATION_ERROR, {
        details: { validationError: validationResult.error }
      });
      return { data: null, error: ERRORS.VALIDATION_ERROR };
    }
    const { person, contactMethods, addresses, websites, note } = validationResult.data;

    // Create the person
    const { data: personRecord, error: personError } = await db.from('person').insert(person).select().single();

    if (personError || !personRecord) {
      errorLogger.log(ERRORS.CREATE_FAILED, {
        details: { ...personError, userId: person.user_id }
      });
      return { data: null, error: ERRORS.CREATE_FAILED };
    }

    const personId = personRecord.id;
    const userId = person.user_id;

    // Optionally create initial interaction
    let createdInteraction = null;
    if (note) {
      const { data: interaction, error: interactionError } = await db
        .from('interactions')
        .insert({
          person_id: personId,
          note,
          type: 'note',
          user_id: userId
        })
        .select()
        .single();
      if (interactionError) {
        errorLogger.log(ERRORS.CREATE_RELATED_FAILED, { details: interactionError });
        return { data: null, error: ERRORS.CREATE_RELATED_FAILED };
      }
      createdInteraction = interaction;
    }

    // Use granular service methods for related records
    const createdContactMethods = [];
    if (contactMethods && contactMethods.length > 0) {
      for (const method of contactMethods) {
        const result = await updatePersonContactMethod({
          db,
          personId,
          data: method
        });
        if (result.error) {
          errorLogger.log(ERRORS.CREATE_RELATED_FAILED, { details: result.error });
          return { data: null, error: ERRORS.CREATE_RELATED_FAILED };
        }
        if (result.data) createdContactMethods.push(result.data);
      }
    }

    const createdAddresses = [];
    if (addresses && addresses.length > 0) {
      for (const address of addresses) {
        const result = await updatePersonAddress({
          db,
          personId,
          data: address
        });
        if (result.error) {
          errorLogger.log(ERRORS.CREATE_RELATED_FAILED, { details: result.error });
          return { data: null, error: ERRORS.CREATE_RELATED_FAILED };
        }
        if (result.data) createdAddresses.push(result.data);
      }
    }

    const createdWebsites = [];
    if (websites && websites.length > 0) {
      for (const website of websites) {
        const result = await updatePersonWebsite({
          db,
          personId,
          data: website
        });
        if (result.error) {
          errorLogger.log(ERRORS.CREATE_RELATED_FAILED, { details: result.error });
          return { data: null, error: ERRORS.CREATE_RELATED_FAILED };
        }
        if (result.data) createdWebsites.push(result.data);
      }
    }

    return {
      data: {
        person: personRecord,
        contactMethods: createdContactMethods,
        addresses: createdAddresses,
        websites: createdWebsites,
        interaction: createdInteraction
      },
      error: null
    };
  } catch (error) {
    errorLogger.log(ERRORS.CREATE_FAILED, {
      details: { ...(error as Error), userId: data.person?.user_id }
    });
    return { data: null, error: ERRORS.CREATE_FAILED };
  }
}
