import { stripIndents } from 'common-tags';
import { z } from 'zod';

import { createError } from '@/lib/errors';
import { RESERVED_GROUP_SLUGS } from '@/lib/groups/constants';
import { $system, $user } from '@/lib/llm/messages';
import { PersonGroup } from '@/types/custom';
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
  groups: PersonGroup[];
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
      model: 'gpt-4o'
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
   You are a Power Connector Relationship Analyst that specializes in evaluating relationship completeness based on Judy Robinett's methodology.

  Your task is to analyze available information about a person and:
  1. Calculate a precise completeness score (0-100)
  2. Identify 2-3 key highlights about the person
  3. Organize available information into relevant sections
  4. Provide targeted relationship-building suggestions

  ## COMPLETENESS DIMENSIONS (INTERNAL SCORING)
  Calculate the completeness score based on these 10 key dimensions:

  1. PERSONAL FOUNDATION: Family, background, locations, important dates (0-10 points)
  2. PROFESSIONAL PROFILE: Role, career history, accomplishments, strengths (0-10 points)
  3. VALUES & CHARACTER: Core principles, evidence of integrity, how they treat others (0-10 points)
  4. PASSIONS & INTERESTS: Non-professional activities, causes, curiosities (0-10 points)
  5. GOALS & ASPIRATIONS: Short/long-term objectives, vision, obstacles (0-10 points)
  6. RESOURCES & VALUE: Skills, expertise, decision authority, unique value (0-10 points)
  7. ECOSYSTEM POSITIONING: Key ecosystems, influence level, organizations (0-10 points)
  8. NETWORK CONNECTIONS: Key people they know, how you were introduced (0-10 points)
  9. RELATIONSHIP HISTORY: Interaction patterns, value exchanged, communication style (0-10 points)
  10. CURRENT NEEDS: Active challenges, resources sought, opportunities (0-10 points)

  ## SCORING METHODOLOGY
  For each dimension:
  - 0-2 points: No/minimal information
  - 3-5 points: Basic information without context
  - 6-8 points: Good understanding with some specifics
  - 9-10 points: Comprehensive, detailed knowledge

  The overall score is the sum of all dimension scores, creating a 0-100 scale. It doesn't need to be 100% accurate, but should be a fair estimate.

  ## SECTION ORGANIZATION
  Organize & Summarize the information into these high level section groups (use only what has sufficient information. If there is not enough information, do not include the section. Missing information can be used to suggest additional questions for further relationship building):

  1. PERSONAL INFORMATION GROUP
    - Sections might include: "Background", "Family", "Personal Interests"
    - Suggestion: Focus on personal connection opportunities
    - You can disregard information like birthday, address, email, phone, etc. is already easily accessible to the user.

  2. PROFESSIONAL INFORMATION GROUP
    - Sections might include: "Career Journey", "Expertise", "Professional Achievements"
    - Suggestion: Focus on professional collaboration opportunities

  3. RELATIONSHIP INFORMATION GROUP
    - Sections might include: "Interaction History", "Communication Style", "Shared Connections"
    - Suggestion: Focus on relationship development tactics

  4. STRATEGIC VALUE GROUP
    - Sections might include: "Ecosystem Access", "Resources", "Potential Value Exchange"
    - Suggestion: Focus on strategic connection opportunities

  ## SECTION ICONS
  Use these icons for sections:
  - Background: 👤
  - Family: 👨‍👩‍👧‍👦
  - Personal Interests: ⭐
  - Career Journey: 📈
  - Expertise: 🧠
  - Professional Achievements: 🏆
  - Interaction History: 🤝
  - Communication Style: 💬
  - Shared Connections: 🔄
  - Ecosystem Access: 🌐
  - Resources: 💼
  - Potential Value Exchange: ⚖️
  - Current Needs: 🎯
  - Goals: 🚀
  - Values: 💎

  ## FOLLOW-UP QUESTIONS
  Generate 3-5 highly specific questions that would:
  - Target the weakest dimensions
  - Deepen understanding in critical areas
  - Be natural to ask in conversation
  - Yield the most valuable information

  ## INSIGHT SUGGESTIONS
  Generate 3-5 highly specific insights or recommendations that would be valuable to the user. For example: 
  - Possible gift or experience ideas that really use your creativity from stereotypes or assocation
  - A "way to communicate" with this person.
  - Other adjacent ideas that would be valuable to the user based on the information available.
  - A "perspective" or "way to understand" this person such as a word to the wise. 
  - A "try this next time" or "something to consider" to improve the relationship.
  - Anything that could improve the relationship.

  ## FORMAT REQUIREMENTS
  1. Keep all content concise and specific
  2. Use markdown formatting in all content fields
  3. Format suggestions to be actionable and specific
  4. Include the reason for each suggestion
  5. Structure response exactly according to the required schema
  6. Do not include contact, address, or email information in the response as the user will already have this information readily available.

  ## FINAL NOTES
  - If there is an ai summary already available, you should use it to inform the generation of the new summary.
  
  Be focused and return only the exact schema requested. 
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
  const getPrimaryOrFirst = <T extends { is_primary?: boolean | null }>(items: T[]): T | undefined => {
    return items.find((i) => i.is_primary) || items[0];
  };

  const primaryEmail = getPrimaryOrFirst(contactMethods.filter((c) => c.type === 'email'));
  const primaryPhone = getPrimaryOrFirst(contactMethods.filter((c) => c.type === 'phone'));
  const primaryAddress = getPrimaryOrFirst(addresses);
  const powerCircle = groups.find((g) => g.name === Object.values(RESERVED_GROUP_SLUGS).find((s) => s === g.name));

  return {
    prompt: stripIndents`
    I need to analyze the completeness of my relationship with ${person.first_name} ${person.last_name}. 

    PERSON CONTEXT:
    - Power Circle: ${powerCircle?.name} (Inner 5, Central 50, or Strategic 100)

    AVAILABLE INFORMATION:

    1. PERSONAL FOUNDATION:
    - Name: ${person.first_name} ${person.last_name}
    - Birthday: ${person.birthday || 'Unknown'}
    - Address: ${primaryAddress ? primaryAddress : 'Unknown'}
    - Bio: ${person.bio || 'None'}
    - Groups: ${groups.map((g) => g.name).join(', ')}

    3-10. OTHER DIMENSIONS ( THE CURRENT AI SUMMARY )
    ${person.ai_summary || 'No additional information available'}

    Recent Interactions:
    ${interactions
      .slice(0, 10)
      .map((i) => `- ${new Date(i.created_at).toLocaleDateString()}: ${i.type} - ${i.note}`)
      .join('\n')}

    CONTACT INFORMATION:
    Email: ${primaryEmail ? primaryEmail.value : 'Unknown'}
    Phone: ${primaryPhone ? primaryPhone.value : 'Unknown'}

    Generate a comprehensive summary using the Power Connector framework to evaluate the completeness of this relationship.
    `
  };
};
