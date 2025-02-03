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
    // Start a transaction
    const { data: person, error: personError } = await db
      .from('person')
      .select('user_id')
      .eq('id', personId)
      .single();

    if (personError || !person) {
      const error = {
        ...ERRORS.PERSON.UPDATE_ERROR,
        details: personError
      };
      errorLogger.log(error);
      return { data: null, error };
    }

    const userId = person.user_id;

    // Update person bio
    const { error: bioError } = await db
      .from('person')
      .update({ bio: data.bio })
      .eq('id', personId);

    if (bioError) {
      const error = {
        ...ERRORS.PERSON.UPDATE_ERROR,
        details: bioError
      };
      errorLogger.log(error);
      return { data: null, error };
    }

    // Handle contact methods
    if (data.contactMethods) {
      // Get existing contact methods
      const { data: existingContacts } = await db
        .from('contact_methods')
        .select('id')
        .eq('person_id', personId);

      const existingIds = new Set(existingContacts?.map((c) => c.id) || []);
      const newIds = new Set(data.contactMethods.map((c) => c.id).filter(Boolean));

      // Delete removed contacts
      const idsToDelete = [...existingIds].filter((id) => !newIds.has(id));
      if (idsToDelete.length > 0) {
        const { error: deleteError } = await db
          .from('contact_methods')
          .delete()
          .in('id', idsToDelete);

        if (deleteError) {
          const error = {
            ...ERRORS.PERSON.UPDATE_ERROR,
            details: deleteError
          };
          errorLogger.log(error);
          return { data: null, error };
        }
      }

      // Update or insert contacts
      for (const contact of data.contactMethods) {
        if (contact.id) {
          // Update existing
          const { error: updateError } = await db
            .from('contact_methods')
            .update({
              type: contact.type,
              value: contact.value,
              label: contact.label,
              is_primary: contact.is_primary
            })
            .eq('id', contact.id);

          if (updateError) {
            const error = {
              ...ERRORS.PERSON.UPDATE_ERROR,
              details: updateError
            };
            errorLogger.log(error);
            return { data: null, error };
          }
        } else {
          // Insert new
          const { error: insertError } = await db.from('contact_methods').insert({
            person_id: personId,
            user_id: userId,
            type: contact.type,
            value: contact.value,
            label: contact.label,
            is_primary: contact.is_primary
          });

          if (insertError) {
            const error = {
              ...ERRORS.PERSON.UPDATE_ERROR,
              details: insertError
            };
            errorLogger.log(error);
            return { data: null, error };
          }
        }
      }
    }

    // Handle addresses
    if (data.addresses) {
      // Get existing addresses
      const { data: existingAddresses } = await db
        .from('addresses')
        .select('id')
        .eq('person_id', personId);

      const existingIds = new Set(existingAddresses?.map((a) => a.id) || []);
      const newIds = new Set(data.addresses.map((a) => a.id).filter(Boolean));

      // Delete removed addresses
      const idsToDelete = [...existingIds].filter((id) => !newIds.has(id));
      if (idsToDelete.length > 0) {
        const { error: deleteError } = await db.from('addresses').delete().in('id', idsToDelete);

        if (deleteError) {
          const error = {
            ...ERRORS.PERSON.UPDATE_ERROR,
            details: deleteError
          };
          errorLogger.log(error);
          return { data: null, error };
        }
      }

      // Update or insert addresses
      for (const address of data.addresses) {
        if (address.id) {
          // Update existing
          const { error: updateError } = await db
            .from('addresses')
            .update({
              street: address.street,
              city: address.city,
              state: address.state,
              country: address.country,
              label: address.label,
              is_primary: address.is_primary
            })
            .eq('id', address.id);

          if (updateError) {
            const error = {
              ...ERRORS.PERSON.UPDATE_ERROR,
              details: updateError
            };
            errorLogger.log(error);
            return { data: null, error };
          }
        } else {
          // Insert new
          const { error: insertError } = await db.from('addresses').insert({
            person_id: personId,
            user_id: userId,
            street: address.street,
            city: address.city,
            state: address.state,
            country: address.country,
            label: address.label,
            is_primary: address.is_primary
          });

          if (insertError) {
            const error = {
              ...ERRORS.PERSON.UPDATE_ERROR,
              details: insertError
            };
            errorLogger.log(error);
            return { data: null, error };
          }
        }
      }
    }

    // Handle websites
    if (data.websites) {
      // Get existing websites
      const { data: existingWebsites } = await db
        .from('websites')
        .select('id')
        .eq('person_id', personId);

      const existingIds = new Set(existingWebsites?.map((w) => w.id) || []);
      const newIds = new Set(data.websites.map((w) => w.id).filter(Boolean));

      // Delete removed websites
      const idsToDelete = [...existingIds].filter((id) => !newIds.has(id));
      if (idsToDelete.length > 0) {
        const { error: deleteError } = await db.from('websites').delete().in('id', idsToDelete);

        if (deleteError) {
          const error = {
            ...ERRORS.PERSON.UPDATE_ERROR,
            details: deleteError
          };
          errorLogger.log(error);
          return { data: null, error };
        }
      }

      // Update or insert websites
      for (const website of data.websites) {
        if (website.id) {
          // Update existing
          const { error: updateError } = await db
            .from('websites')
            .update({
              url: website.url,
              label: website.label
            })
            .eq('id', website.id);

          if (updateError) {
            const error = {
              ...ERRORS.PERSON.UPDATE_ERROR,
              details: updateError
            };
            errorLogger.log(error);
            return { data: null, error };
          }
        } else {
          // Insert new
          const { error: insertError } = await db.from('websites').insert({
            person_id: personId,
            user_id: userId,
            url: website.url,
            label: website.label
          });

          if (insertError) {
            const error = {
              ...ERRORS.PERSON.UPDATE_ERROR,
              details: insertError
            };
            errorLogger.log(error);
            return { data: null, error };
          }
        }
      }
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
