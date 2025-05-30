import { omit } from 'lodash';

import { createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { addressCreateSchema, contactMethodCreateSchema, websiteCreateSchema } from '@/lib/schemas/person-create';
import { PersonEditFormData } from '@/lib/schemas/person-edit';
import { Address, ContactMethod, DBClient, Person, Website } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

export type UpdatePersonDetailsParams = {
  db: DBClient;
  personId: string;
  data: PersonEditFormData;
};

// New interfaces for granular updates
export type UpdatePersonFieldParams = {
  db: DBClient;
  personId: string;
  field: string;
  value: any;
};

export type UpdatePersonContactMethodParams = {
  db: DBClient;
  personId: string;
  methodId?: string;
  data: {
    type?: string;
    value?: string;
    is_primary?: boolean;
    label?: string;
    _delete?: boolean;
  };
};

export type UpdatePersonAddressParams = {
  db: DBClient;
  personId: string;
  addressId?: string;
  data: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    label?: string;
    is_primary?: boolean;
    _delete?: boolean;
  };
};

export type UpdatePersonWebsiteParams = {
  db: DBClient;
  personId: string;
  websiteId?: string;
  data: {
    url?: string;
    label?: string;
    _delete?: boolean;
  };
};

// TODO: Update the error types and messages to be more specific to the field that is being updated.
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
    ),
    INVALID_FIELD: createError(
      'invalid_field',
      ErrorType.VALIDATION_ERROR,
      'Invalid field update',
      'Unable to update this field'
    )
  }
};

// New function for updating a single field
export async function updatePersonField({
  db,
  personId,
  field,
  value
}: UpdatePersonFieldParams): Promise<ServiceResponse<Person>> {
  try {
    let newValue = value;
    if (typeof value === 'string' && value.length === 0) {
      newValue = null;
    }

    const { data: person, error: updateError } = await db
      .from('person')
      .update({ [field]: newValue })
      .eq('id', personId)
      .select('*')
      .single();

    if (updateError) {
      const error = {
        ...ERRORS.PERSON.UPDATE_ERROR,
        details: updateError
      };
      errorLogger.log(error);
      return { data: null, error };
    }

    return { data: person, error: null };
  } catch (error) {
    const serviceError = {
      ...ERRORS.PERSON.TRANSACTION_ERROR,
      details: error
    };
    errorLogger.log(serviceError);
    return { data: null, error: serviceError };
  }
}

// New function for updating a contact method
export async function updatePersonContactMethod({
  db,
  personId,
  methodId,
  data
}: UpdatePersonContactMethodParams): Promise<ServiceResponse<ContactMethod>> {
  try {
    // NOTE: This probably won't work when there are "accounts" with multiple accounts
    const { data: person } = await db.from('person').select('user_id').eq('id', personId).single();

    if (!person) {
      return { data: null, error: ERRORS.PERSON.UPDATE_ERROR };
    }

    let contactMethod: ContactMethod | null = null;

    if (methodId && data._delete) {
      const { error: deleteError } = await db.from('contact_methods').delete().eq('id', methodId);

      if (deleteError) {
        const error = {
          ...ERRORS.PERSON.UPDATE_ERROR,
          details: deleteError
        };
        errorLogger.log(error);
        return { data: null, error };
      }
    } else if (methodId) {
      const { data: updatedContactMethod, error: updateError } = await db
        .from('contact_methods')
        .update(omit(data, '_delete'))
        .eq('id', methodId)
        .eq('person_id', personId)
        .select('*')
        .single();

      if (updateError) {
        const error = {
          ...ERRORS.PERSON.UPDATE_ERROR,
          details: updateError
        };
        errorLogger.log(error);
        return { data: null, error };
      }
      contactMethod = updatedContactMethod;
    } else {
      const validationResult = contactMethodCreateSchema.safeParse(data);
      if (!validationResult.success) {
        return { data: null, error: ERRORS.PERSON.INVALID_FIELD };
      }

      const { data: newContactMethod, error: insertError } = await db
        .from('contact_methods')
        .insert({
          ...omit(data, '_delete'),
          person_id: personId,
          user_id: person.user_id
        })
        .select('*')
        .single();

      if (insertError) {
        const error = {
          ...ERRORS.PERSON.UPDATE_ERROR,
          details: insertError
        };
        errorLogger.log(error);
        return { data: null, error };
      }
      contactMethod = newContactMethod;
    }

    return { data: contactMethod, error: null };
  } catch (error) {
    const serviceError = {
      ...ERRORS.PERSON.TRANSACTION_ERROR,
      details: error
    };
    errorLogger.log(serviceError);
    return { data: null, error: serviceError };
  }
}

// New function for updating an address
export async function updatePersonAddress({
  db,
  personId,
  addressId,
  data
}: UpdatePersonAddressParams): Promise<ServiceResponse<Address>> {
  try {
    const { data: person } = await db.from('person').select('user_id').eq('id', personId).single();

    if (!person) {
      return { data: null, error: ERRORS.PERSON.UPDATE_ERROR };
    }

    let address: Address | null = null;

    if (addressId && data._delete) {
      const { error: deleteError } = await db.from('addresses').delete().eq('id', addressId);

      if (deleteError) {
        const error = {
          ...ERRORS.PERSON.UPDATE_ERROR,
          details: deleteError
        };
        errorLogger.log(error);
        return { data: null, error };
      }
    } else if (addressId) {
      const { data: updatedAddress, error: updateError } = await db
        .from('addresses')
        .update(omit(data, '_delete'))
        .eq('id', addressId)
        .eq('person_id', personId)
        .select('*')
        .single();

      if (updateError) {
        const error = {
          ...ERRORS.PERSON.UPDATE_ERROR,
          details: updateError
        };
        errorLogger.log(error);
        return { data: null, error };
      }
      address = updatedAddress;
    } else {
      const validationResult = addressCreateSchema.safeParse(data);
      if (!validationResult.success) {
        return { data: null, error: ERRORS.PERSON.INVALID_FIELD };
      }

      const { data: newAddress, error: insertError } = await db
        .from('addresses')
        .insert({
          ...omit(data, '_delete'),
          person_id: personId,
          user_id: person.user_id
        })
        .select('*')
        .single();

      if (insertError) {
        const error = {
          ...ERRORS.PERSON.UPDATE_ERROR,
          details: insertError
        };
        errorLogger.log(error);
        return { data: null, error };
      }
      address = newAddress;
    }

    return { data: address, error: null };
  } catch (error) {
    const serviceError = {
      ...ERRORS.PERSON.TRANSACTION_ERROR,
      details: error
    };
    errorLogger.log(serviceError);
    return { data: null, error: serviceError };
  }
}

// New function for updating a website
export async function updatePersonWebsite({
  db,
  personId,
  websiteId,
  data
}: UpdatePersonWebsiteParams): Promise<ServiceResponse<Website>> {
  try {
    const { data: person } = await db.from('person').select('user_id').eq('id', personId).single();

    if (!person) {
      return { data: null, error: ERRORS.PERSON.UPDATE_ERROR };
    }

    let website: Website | null = null;

    if (websiteId && data._delete) {
      const { error: deleteError } = await db.from('websites').delete().eq('id', websiteId);

      if (deleteError) {
        const error = {
          ...ERRORS.PERSON.UPDATE_ERROR,
          details: deleteError
        };
        errorLogger.log(error);
        return { data: null, error };
      }
    } else if (websiteId) {
      const { data: updatedWebsite, error: updateError } = await db
        .from('websites')
        .update(omit(data, '_delete'))
        .eq('id', websiteId)
        .eq('person_id', personId)
        .select('*')
        .single();

      if (updateError) {
        const error = {
          ...ERRORS.PERSON.UPDATE_ERROR,
          details: updateError
        };
        errorLogger.log(error);
        return { data: null, error };
      }
      website = updatedWebsite;
    } else {
      const validationResult = websiteCreateSchema.safeParse(data);
      if (!validationResult.success) {
        return { data: null, error: ERRORS.PERSON.INVALID_FIELD };
      }

      const { data: newWebsite, error: insertError } = await db
        .from('websites')
        .insert({
          ...omit(data, '_delete'),
          person_id: personId,
          user_id: person.user_id
        })
        .select('*')
        .single();

      if (insertError) {
        const error = {
          ...ERRORS.PERSON.UPDATE_ERROR,
          details: insertError
        };
        errorLogger.log(error);
        return { data: null, error };
      }
      website = newWebsite;
    }

    return { data: website, error: null };
  } catch (error) {
    const serviceError = {
      ...ERRORS.PERSON.TRANSACTION_ERROR,
      details: error
    };
    errorLogger.log(serviceError);
    return { data: null, error: serviceError };
  }
}
