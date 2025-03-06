import { stripIndents } from 'common-tags';
import { z } from 'zod';

import { createError } from '@/lib/errors';
import { $system, $user } from '@/lib/llm/messages';
import { TPersonGroup } from '@/types/custom';
import { Address, ContactMethod, Interaction, Person } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';
import { generateObject } from '@/vendors/ai';

import { SinglePersonSummarySchema } from './schemas';

export type SinglePersonSummary = z.infer<typeof SinglePersonSummarySchema>;

// Define errors
export const ERRORS = {
  GENERATION: {
    FAILED: createError(
      'ai_summary_generation_failed',
      ErrorType.API_ERROR,
      'Failed to generate AI summary',
      'Unable to generate summary at this time'
    ),
    INVALID_RESPONSE: createError(
      'invalid_response',
      ErrorType.API_ERROR,
      'Invalid response format from AI service',
      'Unable to process summary at this time'
    )
  }
};

type TGenerateAISummaryParams = {
  person: Person;
  interactions: Interaction[];
  groups: TPersonGroup[];
  contactMethods?: ContactMethod[];
  addresses?: Address[];
};

export async function generateSummaryContent({
  person,
  interactions,
  groups,
  contactMethods = [],
  addresses = []
}: TGenerateAISummaryParams): Promise<ServiceResponse<SinglePersonSummary>> {
  try {
    const messages = [
      $system(buildSystemPrompt().prompt),
      $user(buildUserPrompt({ person, interactions, groups, contactMethods, addresses }).prompt)
    ];

    const response = await generateObject({
      messages,
      schema: SinglePersonSummarySchema,
      model: 'openai/gpt-4'
    });

    if (!response) {
      return { data: null, error: ERRORS.GENERATION.FAILED };
    }

    const parsedContent = SinglePersonSummarySchema.safeParse(response);

    if (!parsedContent.success) {
      return {
        data: null,
        error: { ...ERRORS.GENERATION.INVALID_RESPONSE, details: parsedContent.error }
      };
    }

    return { data: parsedContent.data, error: null };
  } catch (error) {
    return {
      data: null,
      error: { ...ERRORS.GENERATION.FAILED, details: error }
    };
  }
}

const buildSystemPrompt = () => ({
  prompt: stripIndents`
    You are an AI assistant that analyzes relationship data and provides comprehensive personal dossiers.
    Your task is to create a detailed summary of an individual based on available information.

    Guidelines for Summary Generation:

    1. Completeness Score (0-100):
    - 0-25: Minimal information, basic facts only
    - 26-49: Some information but lacking depth
    - 50-79: Good understanding with room for growth
    - 80-100: Deep, comprehensive knowledge

    2. Key Highlights:
    - Provide 2-3 most important insights
    - Focus on actionable information
    - Keep language concise and scannable
    
    3. Section Organization:
    - Group related information together
    - Only create sections with available information
    - Order sections by relevance and importance
    - Keep titles concise and descriptive
    
    4. Content Style:
    - Use clear, professional language
    - Include specific details when available
    - Avoid speculation or assumptions
    - Format longer content in bullet points
    
    5. Suggestions:
    - Make them actionable and specific
    - Base them on available information
    - Include clear reasoning
    - Focus on relationship building

    Return your response following the exact schema provided, ensuring all sections are properly formatted and organized.
  `
});

const buildUserPrompt = ({
  person,
  interactions,
  groups,
  contactMethods = [],
  addresses = []
}: TGenerateAISummaryParams) => {
  // Helper to get primary or first item
  const getPrimaryOrFirst = <T extends { is_primary?: boolean | null }>(
    items: T[]
  ): T | undefined => {
    return items.find((i) => i.is_primary) || items[0];
  };

  const primaryEmail = getPrimaryOrFirst(contactMethods.filter((c) => c.type === 'email'));
  const primaryPhone = getPrimaryOrFirst(contactMethods.filter((c) => c.type === 'phone'));
  const primaryAddress = getPrimaryOrFirst(addresses);

  return {
    prompt: stripIndents`
      Person Information:
      Name: ${person.first_name} ${person.last_name || ''}
      Groups: ${groups.map((g) => g.name).join(', ')}
      Birthday: ${person.birthday || 'Unknown'}
      Previous Summary: 
      
      ${person.ai_summary || 'None available'}
      
      Recent Interactions (Last 20):
      ${interactions
        .slice(0, 20)
        .map((i) => `- ${i.created_at}: ${i.type} - ${i.note}`)
        .join('\n')}

      Contact Information:
      Email: ${primaryEmail ? primaryEmail.value : 'Unknown'}
      Phone: ${primaryPhone ? primaryPhone.value : 'Unknown'}
      Address: ${
        primaryAddress
          ? `${primaryAddress.street}, ${primaryAddress.city}, ${primaryAddress.state} ${primaryAddress.postal_code}`
          : 'Unknown'
      }
      
      Additional Contact Methods:
      ${contactMethods
        .filter((c) => !c.is_primary)
        .map((c) => `- ${c.type}: ${c.value}${c.label ? ` (${c.label})` : ''}`)
        .join('\n')}
      
      Additional Addresses:
      ${addresses
        .filter((a) => !a.is_primary)
        .map((a) => `- ${a.label || 'Other'}: ${a.street}, ${a.city}, ${a.state} ${a.postal_code}`)
        .join('\n')}
      
      Additional Context:
      Created: ${person.created_at}
      Updated: ${person.updated_at}
      Bio: ${person.bio || 'None'}
    `
  };
};
