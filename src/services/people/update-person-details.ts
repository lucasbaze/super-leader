import { createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { TPersonEditFormData } from '@/lib/schemas/person-edit';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

export type TUpdatePersonDetailsParams = {
  db: DBClient;
  personId: string;
  data: TPersonEditFormData;
};

export const ERRORS = {
  PERSON: {
    UPDATE_ERROR: createError(
      'person_update_error',
      ErrorType.DATABASE_ERROR,
      'Failed to update person details',
      'Unable to save person information'
    ),
    TRANSACTION_ERROR: createError(
      'transaction_error',
      ErrorType.DATABASE_ERROR,
      'Transaction failed',
      'Unable to complete the update operation'
    )
  }
};

export async function updatePersonDetails({
  db,
  personId,
  data
}: TUpdatePersonDetailsParams): Promise<ServiceResponse<null>> {
  try {
    const { error } = await db.rpc('update_person_details', {
      p_person_id: personId,
      p_bio: data.bio,
      p_contact_methods: data.contactMethods,
      p_addresses: data.addresses,
      p_websites: data.websites
    });

    if (error) {
      const serviceError = {
        ...ERRORS.PERSON.UPDATE_ERROR,
        details: error
      };
      errorLogger.log(serviceError);
      return { data: null, error: serviceError };
    }

    return { data: null, error: null };
  } catch (error) {
    const serviceError = {
      ...ERRORS.PERSON.TRANSACTION_ERROR,
      details: error
    };
    errorLogger.log(serviceError);
    return { data: null, error: serviceError };
  }
}
