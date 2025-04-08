import { stripIndent } from 'common-tags';

import { dateHandler } from '@/lib/dates/helpers';
import { createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

import { formatSummaryForDisplay } from '../summary/format-ai-summary';
import { getPerson, GetPersonResult } from './get-person';

export const ERRORS = {
  FORMAT: {
    FAILED: createError(
      'format_failed',
      ErrorType.INTERNAL_ERROR,
      'Failed to format person summary',
      'Unable to generate person summary at this time'
    ),
    PERSON_NOT_FOUND: createError(
      'person_not_found',
      ErrorType.NOT_FOUND,
      'Person not found',
      'Unable to find the requested person'
    )
  }
};

export interface FormatPersonSummaryParams {
  db: DBClient;
  personId: string;
}

export type FormatPersonSummaryResult = ServiceResponse<string>;

function formatPersonalInformation(person: GetPersonResult['person']) {
  return stripIndent`
    PERSONAL INFORMATION: 
    - Name: ${person.first_name} ${person.last_name ? ` ${person.last_name}` : ''}
    - Met on: ${person.date_met ? dateHandler(person.date_met).format('MMM D, YYYY') : 'Not set'}
    - Birthday: ${person.birthday ? dateHandler(person.birthday).format('MMM D, YYYY') : 'Not set'}
  `;
}

function formatContactMethods(contactMethods?: GetPersonResult['contactMethods']) {
  if (!contactMethods?.length) return 'No contact methods saved.';

  return `Contact Information:
  
    ${contactMethods
      .map((cm) => `- ${cm.type}: ${cm.value}${cm.label ? ` (${cm.label})` : ''}`)
      .join('\n')}`;
}

function formatAddresses(addresses?: GetPersonResult['addresses']) {
  if (!addresses?.length) return 'No addresses saved.';

  return `Addresses:
  
    ${addresses
      .map(
        (addr) =>
          `- ${addr.label || 'Address'}: ${addr.street}, ${addr.city}, ${addr.state} ${addr.postal_code}, ${addr.country}`
      )
      .join('\n')}`;
}

function formatWebsites(websites?: GetPersonResult['websites']) {
  if (!websites?.length) return 'No websites saved.';

  return `Websites:
  
    ${websites
      .map((web) => `- ${web.label || 'Website'}: ${web.url}${web.icon ? ` (${web.icon})` : ''}`)
      .join('\n')}`;
}

function formatGroups(groups?: GetPersonResult['groups']) {
  if (!groups?.length) return 'No groups saved.';

  return `Groups:
  
    ${groups.map((g) => `- ${g.name}`).join('\n')}`;
}

function formatInteractions(interactions?: GetPersonResult['interactions']) {
  if (!interactions?.length) return 'No interactions saved.';

  const sortedInteractions = [...interactions].sort((a, b) =>
    dateHandler(b.created_at).diff(dateHandler(a.created_at))
  );

  return `Recent Interactions:
  
    ${sortedInteractions
      .slice(0, 5)
      .map((int) => `- ${dateHandler(int.created_at).format('MMM D, YYYY')}: ${int.note}`)
      .join('\n')}`;
}

// TODO: Figure out how much info to pass to the AI, vs. just telling the AI that it's available or the "type" of information that's available, such as an email address or phone number.
export async function formatPersonSummary({
  db,
  personId
}: FormatPersonSummaryParams): Promise<FormatPersonSummaryResult> {
  try {
    // Get all person data using existing service
    const { data, error } = await getPerson({
      db,
      personId,
      withContactMethods: true,
      withAddresses: true,
      withInteractions: true,
      withGroups: true,
      withWebsites: true
    });

    if (error || !data?.person) {
      return { data: null, error: ERRORS.FORMAT.PERSON_NOT_FOUND };
    }

    const { person } = data;

    // Build sections
    const summary = stripIndent`
      This is a summary of information about ${person.first_name} ${person.last_name} based on the information available in the system: 
    
      First is an AI generated summary of all the unstructured information I have collected. (Little to no data means that this person is new and I have not collected any information about them yet):
      ${formatSummaryForDisplay(person.ai_summary)}
      
      The summary above is also composed of structured information that I have. This includes the following: 
      
      # Personal Information
      ${formatPersonalInformation(person)}
      
      It's important to note that I have organized ${person.first_name} into the following groups for better organization.: 
      ${formatGroups(data.groups)}

      The following is contact information for ${person.first_name} that can be
      # Contact Information 
      ${formatContactMethods(data.contactMethods)}

      ### Addresses 
      ${formatAddresses(data.addresses)}

      ### Websites 
      ${formatWebsites(data.websites)}

      We have had the following recent interactions: 
      ${formatInteractions(data.interactions)}
    `;

    return { data: summary, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.FORMAT.FAILED, { details: error });
    return { data: null, error: ERRORS.FORMAT.FAILED };
  }
}
