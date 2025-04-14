import { stripIndents } from 'common-tags';
import { z } from 'zod';

import { createError } from '@/lib/errors';
import { UserContext, UserProfile } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';
import { generateObject } from '@/vendors/ai';

import { ContextSummarySchema } from '../context/schemas';

export type UserProfileSummary = z.infer<typeof ContextSummarySchema>;

// Define errors
export const ERRORS = {
  GENERATION: {
    FAILED: createError(
      'user_profile_summary_generation_failed',
      ErrorType.API_ERROR,
      'Failed to generate user profile summary',
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

type TGenerateUserProfileSummaryParams = {
  userContexts: UserContext[];
  userProfile: UserProfile;
};

export async function generateUserProfileSummary({
  userContexts,
  userProfile
}: TGenerateUserProfileSummaryParams): Promise<ServiceResponse<UserProfileSummary>> {
  try {
    const response = await generateObject({
      schema: ContextSummarySchema,
      prompt: buildPrompt({ userContexts, userProfile })
    });

    if (!response) {
      return { data: null, error: ERRORS.GENERATION.FAILED };
    }

    const parsedContent = ContextSummarySchema.safeParse(response);

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

const buildPrompt = ({ userContexts, userProfile }: TGenerateUserProfileSummaryParams) => {
  // Format contexts for the prompt
  const formattedContexts = userContexts
    .map((c) => {
      return `
      ${c.reason}:
      ${c.content}
      `;
    })
    .join('\n');

  return stripIndents`
    You are a Power Connector Relationship Analyst that specializes in evaluating relationship completeness based on Judy Robinett's methodology.

  Your task is to analyze available information about a user and:
  1. Calculate a precise completeness score (0-100)
  2. Organize available information into relevant sections
  3. Provide a list of follow up questions to ask the user to improve the summary

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
  Organize & Summarize the information into high level section groups (use only what has sufficient information. If there is not enough information, do not include the section):

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

  ## FORMAT REQUIREMENTS
  1. Keep all content concise and specific
  2. Use markdown formatting in all content fields
  3. Structure response exactly according to the required schema
  
  Be focused and return only the exact schema requested. 

  USER CONTEXT:

  ${userProfile.first_name || 'the user'} ${userProfile.last_name || ''}. 

  NEW USER CONTEXT / MEMORY NOTES:
  ${formattedContexts}

  CURRENT USER PROFILE SUMMARY:
  ${userProfile.context_summary ? formatUserSummary(userProfile.context_summary) : 'No existing summary available'}
  `;
};

const formatUserSummary = (userProfileSummary: UserProfileSummary) => {
  return stripIndents`
  Profile Completeness: ${userProfileSummary.completeness}%

  ${userProfileSummary.groupedSections
    .map((group) => {
      return `## ${group.title}\n${group.sections
        .map((section) => {
          return `${section.icon} **${section.title}**\n${section.content}`;
        })
        .join('\n\n')}`;
    })
    .join('\n\n')}

  ${
    userProfileSummary.followUpQuestions.length > 0
      ? `## Follow-up Questions\n${userProfileSummary.followUpQuestions
          .map((question, index) => `${index + 1}. ${question}`)
          .join('\n')}`
      : ''
  }
  `;
};
