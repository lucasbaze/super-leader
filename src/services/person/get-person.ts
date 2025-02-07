import { createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { TPersonGroup } from '@/types/custom';
import { Address, ContactMethod, DBClient, Group, Person, Website } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';

import { TInteraction } from './person-activity';

export interface GetPersonResult {
  person: Person;
  contactMethods?: ContactMethod[];
  addresses?: Address[];
  websites?: Website[];
  interactions?: TInteraction[];
  groups?: TPersonGroup[];
}

export interface GetPersonParams {
  db: DBClient;
  personId: string;
  withContactMethods?: boolean;
  withAddresses?: boolean;
  withWebsites?: boolean;
  withInteractions?: boolean;
  withGroups?: boolean;
}

interface GroupMemberWithGroup {
  group: TPersonGroup;
}

export const ERRORS = {
  PERSON: {
    NOT_FOUND: createError(
      'person_not_found',
      ErrorType.NOT_FOUND,
      'Person not found',
      "We couldn't find the requested person"
    ),
    FETCH_ERROR: createError(
      'person_fetch_error',
      ErrorType.DATABASE_ERROR,
      'Failed to fetch person',
      'Unable to load person information'
    ),
    CONTACT_METHODS_ERROR: createError(
      'contact_methods_error',
      ErrorType.DATABASE_ERROR,
      'Failed to fetch contact methods',
      'Unable to load contact information'
    ),
    ADDRESSES_ERROR: createError(
      'addresses_error',
      ErrorType.DATABASE_ERROR,
      'Failed to fetch addresses',
      'Unable to load address information'
    ),
    WEBSITES_ERROR: createError(
      'websites_error',
      ErrorType.DATABASE_ERROR,
      'Failed to fetch websites',
      'Unable to load website information'
    ),
    INTERACTIONS_ERROR: createError(
      'interactions_error',
      ErrorType.DATABASE_ERROR,
      'Failed to fetch interactions',
      'Unable to load interaction history'
    ),
    GROUPS_ERROR: createError(
      'groups_error',
      ErrorType.DATABASE_ERROR,
      'Failed to fetch groups',
      'Unable to load group information'
    )
  }
};

export async function getPerson({
  db,
  personId,
  withContactMethods = false,
  withAddresses = false,
  withWebsites = false,
  withInteractions = false,
  withGroups = false
}: GetPersonParams): Promise<TServiceResponse<GetPersonResult>> {
  try {
    // Get person
    const { data: person, error: personError } = await db
      .from('person')
      .select('*')
      .eq('id', personId)
      .single();

    if (!person || personError) {
      const error = { ...ERRORS.PERSON.NOT_FOUND, details: personError };
      errorLogger.log(error);

      return { data: null, error };
    }

    const result: GetPersonResult = { person };

    // Get contact methods if requested
    if (withContactMethods) {
      const { data: contactMethods, error: contactError } = await db
        .from('contact_methods')
        .select('*')
        .eq('person_id', personId);

      if (contactError) {
        const error = { ...ERRORS.PERSON.CONTACT_METHODS_ERROR, details: contactError };
        errorLogger.log(error);

        return { data: null, error };
      }

      result.contactMethods = contactMethods;
    }

    // Get addresses if requested
    if (withAddresses) {
      const { data: addresses, error: addressError } = await db
        .from('addresses')
        .select('*')
        .eq('person_id', personId);

      if (addressError) {
        const error = { ...ERRORS.PERSON.ADDRESSES_ERROR, details: addressError };
        errorLogger.log(error);

        return { data: null, error };
      }

      result.addresses = addresses;
    }

    // Get websites if requested
    if (withWebsites) {
      const { data: websites, error: websiteError } = await db
        .from('websites')
        .select('*')
        .eq('person_id', personId);

      if (websiteError) {
        const error = { ...ERRORS.PERSON.WEBSITES_ERROR, details: websiteError };
        errorLogger.log(error);

        return { data: null, error };
      }

      result.websites = websites;
    }

    // Add interactions fetch
    if (withInteractions) {
      const { data: interactions, error: interactionsError } = await db
        .from('interactions')
        .select('*')
        .eq('person_id', personId)
        .order('created_at', { ascending: false });

      if (interactionsError) {
        const error = { ...ERRORS.PERSON.INTERACTIONS_ERROR, details: interactionsError };
        errorLogger.log(error);

        return { data: null, error };
      }

      result.interactions = interactions;
    }

    if (withGroups) {
      const { data: groupMembers, error: groupsError } = await db
        .from('group_member')
        .select<string, GroupMemberWithGroup>(
          `
          group:group (
            id,
            name,
            slug,
            icon
          )
        `
        )
        .eq('person_id', personId);

      if (groupsError) {
        const error = { ...ERRORS.PERSON.GROUPS_ERROR, details: groupsError };
        errorLogger.log(error);

        return { data: null, error };
      }

      // Transform the nested group data
      result.groups = groupMembers?.map((gm) => gm.group) || [];
    }

    return { data: result, error: null };
  } catch (error) {
    const serviceError = {
      ...ERRORS.PERSON.FETCH_ERROR,
      details: error
    };
    errorLogger.log(serviceError);

    return { data: null, error: serviceError };
  }
}
