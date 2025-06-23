import { createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { formatAiSummaryOfPersonToDisplay } from '@/services/summary/format-ai-summary';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

import { getPerson } from '../person/get-person';

// Service params interface
export interface BuildContextForPersonParams {
  db: DBClient;
  userId: string;
  personId: string;
}

// Define errors
export const ERRORS = {
  CONTEXT: {
    BUILD_FAILED: createError(
      'build_context_failed',
      ErrorType.API_ERROR,
      'Failed to build person context',
      'Unable to build person profile at this time'
    ),
    MISSING_USER_ID: createError(
      'missing_user_id',
      ErrorType.VALIDATION_ERROR,
      'User ID is required',
      'User identifier is missing'
    ),
    MISSING_PERSON_ID: createError(
      'missing_person_id',
      ErrorType.VALIDATION_ERROR,
      'Person ID is required',
      'Person identifier is missing'
    ),
    PERSON_NOT_FOUND: createError(
      'person_not_found',
      ErrorType.NOT_FOUND,
      'Person not found',
      'Unable to find the specified person'
    )
  }
};

// Service response type
export type BuildContextForPersonResult = ServiceResponse<string>;

function validateBuildContextParams({ userId, personId }: Pick<BuildContextForPersonParams, 'userId' | 'personId'>) {
  if (!userId) {
    return { data: null, error: ERRORS.CONTEXT.MISSING_USER_ID };
  }

  if (!personId) {
    return { data: null, error: ERRORS.CONTEXT.MISSING_PERSON_ID };
  }

  return { data: null, error: null };
}

function formatContactMethods(contactMethods: any[]): string {
  if (!contactMethods || contactMethods.length === 0) {
    return 'No contact methods available';
  }

  const primary = contactMethods.find((cm) => cm.is_primary);
  const others = contactMethods.filter((cm) => !cm.is_primary);

  let output = '';
  if (primary) {
    output += `Primary: ${primary.type} - ${primary.value}`;
    if (primary.label) output += ` (${primary.label})`;
    output += '\n';
  }

  if (others.length > 0) {
    output += 'Other contact methods:\n';
    others.forEach((cm) => {
      output += `• ${cm.type} - ${cm.value}`;
      if (cm.label) output += ` (${cm.label})`;
      output += '\n';
    });
  }

  return output.trim();
}

function formatAddresses(addresses: any[]): string {
  if (!addresses || addresses.length === 0) {
    return 'No addresses available';
  }

  const primary = addresses.find((addr) => addr.is_primary);
  const others = addresses.filter((addr) => !addr.is_primary);

  let output = '';
  if (primary) {
    output += `Primary Address:\n${primary.street}\n`;
    if (primary.city) output += `${primary.city}`;
    if (primary.state) output += `, ${primary.state}`;
    if (primary.postal_code) output += ` ${primary.postal_code}`;
    if (primary.country) output += `\n${primary.country}`;
    output += '\n';
  }

  if (others.length > 0) {
    output += 'Other addresses:\n';
    others.forEach((addr) => {
      output += `• ${addr.street}`;
      if (addr.city) output += `, ${addr.city}`;
      if (addr.state) output += `, ${addr.state}`;
      if (addr.postal_code) output += ` ${addr.postal_code}`;
      if (addr.country) output += `, ${addr.country}`;
      output += '\n';
    });
  }

  return output.trim();
}

function formatWebsites(websites: any[]): string {
  if (!websites || websites.length === 0) {
    return 'No websites available';
  }

  return websites
    .map((website) => {
      let output = `• ${website.url}`;
      if (website.label) output += ` (${website.label})`;
      return output;
    })
    .join('\n');
}

function formatGroups(groups: any[]): string {
  if (!groups || groups.length === 0) {
    return 'No groups assigned';
  }

  return groups.map((group) => `• ${group.name}`).join('\n');
}

function formatOrganizations(organizations: any[]): string {
  if (!organizations || organizations.length === 0) {
    return 'No organizations associated';
  }

  return organizations.map((org) => `• ${org.name}`).join('\n');
}

function formatPersonRelations(relations: any[]): string {
  if (!relations || relations.length === 0) {
    return 'No person relationships';
  }

  return relations
    .map((rel) => {
      let output = `• ${rel.name}`;
      if (rel.relation) output += ` (${rel.relation})`;
      if (rel.note) output += ` - ${rel.note}`;
      return output;
    })
    .join('\n');
}

function formatTasks(tasks: any[]): string {
  if (!tasks || tasks.length === 0) {
    return 'No active tasks';
  }

  return tasks
    .slice(0, 5)
    .map((task) => {
      const endDate = new Date(task.end_at).toLocaleDateString();
      return `• ${JSON.stringify(task.context)} (Due: ${endDate})`;
    })
    .join('\n');
}

function formatInteractions(interactions: any[]): string {
  if (!interactions || interactions.length === 0) {
    return 'No recent interactions';
  }

  const recent = interactions.slice(0, 3);
  return recent
    .map((interaction) => {
      const date = new Date(interaction.created_at).toLocaleDateString();
      return `• ${date}: ${interaction.type} - ${interaction.note || 'No note'}`;
    })
    .join('\n');
}

export async function buildContextForPerson({
  db,
  userId,
  personId
}: BuildContextForPersonParams): Promise<BuildContextForPersonResult> {
  try {
    console.log('Person::BuildContext::Starting', { personId, userId });

    const validationResult = validateBuildContextParams({ userId, personId });

    if (validationResult.error) {
      return { data: null, error: validationResult.error };
    }

    // Get all person data with all related information
    const { data: personData, error: personError } = await getPerson({
      db,
      personId,
      withContactMethods: true,
      withAddresses: true,
      withWebsites: true,
      withInteractions: true,
      withGroups: true,
      withTasks: true,
      withOrganizations: true,
      withPersonPersonRelations: true
    });

    if (personError || !personData?.person) {
      return { data: null, error: ERRORS.CONTEXT.PERSON_NOT_FOUND };
    }

    const { person } = personData;

    // Build the human-readable profile
    let profile = `# ${person.first_name}${person.last_name ? ` ${person.last_name}` : ''}\n\n`;

    // Basic information
    if (person.title) {
      profile += `**Title:** ${person.title}\n`;
    }
    if (person.bio) {
      profile += `**Bio:** ${person.bio}\n`;
    }
    if (person.birthday) {
      profile += `**Birthday:** ${new Date(person.birthday).toLocaleDateString()}\n`;
    }
    if (person.date_met) {
      profile += `**Date Met:** ${new Date(person.date_met).toLocaleDateString()}\n`;
    }
    if (person.completeness_score !== null) {
      profile += `**Profile Completeness:** ${person.completeness_score}%\n`;
    }
    if (person.follow_up_score !== null) {
      profile += `**Follow-up Score:** ${person.follow_up_score}\n`;
    }

    profile += '\n';

    // Contact information
    profile += `## Contact Information\n\n`;
    profile += formatContactMethods(personData.contactMethods || []);
    profile += '\n\n';

    // Addresses
    profile += `## Addresses\n\n`;
    profile += formatAddresses(personData.addresses || []);
    profile += '\n\n';

    // Websites
    profile += `## Websites\n\n`;
    profile += formatWebsites(personData.websites || []);
    profile += '\n\n';

    // Groups
    profile += `## Groups\n\n`;
    profile += formatGroups(personData.groups || []);
    profile += '\n\n';

    // Organizations
    profile += `## Organizations\n\n`;
    profile += formatOrganizations(personData.organizations || []);
    profile += '\n\n';

    // Person relationships
    profile += `## Person Relationships\n\n`;
    profile += formatPersonRelations(personData.personPersonRelations || []);
    profile += '\n\n';

    // Recent interactions
    profile += `## Recent Interactions\n\n`;
    profile += formatInteractions(personData.interactions || []);
    profile += '\n\n';

    // Active tasks
    profile += `## Active Tasks\n\n`;
    profile += formatTasks(personData.tasks || []);
    profile += '\n\n';

    // AI Summary (if available)
    if (person.ai_summary) {
      profile += `## AI Summary\n\n`;
      profile += formatAiSummaryOfPersonToDisplay(person.ai_summary);
      profile += '\n\n';
    }

    // Log the actual profile content for debugging
    console.log(profile);

    return {
      data: profile,
      error: null
    };
  } catch (error) {
    const serviceError = {
      ...ERRORS.CONTEXT.BUILD_FAILED,
      details: error
    };
    errorLogger.log(serviceError);
    return { data: null, error: serviceError };
  }
}
