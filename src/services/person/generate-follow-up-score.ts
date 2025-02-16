import { stripIndents } from 'common-tags';
import { z } from 'zod';

import { createError } from '@/lib/errors';
import { $system, $user } from '@/lib/llm/messages';
import { TPersonGroup } from '@/types/custom';
import { Interaction, Person } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';
import { generateObject } from '@/vendors/ai';

// Response schema
export const FollowUpScoreSchema = z.object({
  score: z.number().describe('A floating point 2 decimal place number between 0 and 1'),
  reason: z.string().describe('A brief explanation for the score')
});

export type TFollowUpScore = z.infer<typeof FollowUpScoreSchema>;

// Define errors
export const ERRORS = {
  GENERATION: {
    FAILED: createError(
      'follow_up_generation_failed',
      ErrorType.API_ERROR,
      'Failed to generate follow-up score',
      'Unable to generate follow-up score at this time'
    ),
    INVALID_RESPONSE: createError(
      'invalid_response',
      ErrorType.API_ERROR,
      'Invalid response format from AI service',
      'Unable to process follow-up score at this time'
    )
  }
};

type TGenerateFollowUpScoreParams = {
  person: Person;
  interactions: Interaction[];
  groups: TPersonGroup[];
};

export async function generateFollowUpScore({
  person,
  interactions,
  groups
}: TGenerateFollowUpScoreParams): Promise<TServiceResponse<TFollowUpScore>> {
  try {
    const messages = [
      $system(buildSystemPrompt().prompt),
      $user(buildUserPrompt({ person, interactions, groups }).prompt)
    ];

    const response = await generateObject({
      messages,
      schema: FollowUpScoreSchema
    });

    if (!response) {
      return { data: null, error: ERRORS.GENERATION.FAILED };
    }

    const parsedContent = FollowUpScoreSchema.safeParse(response);

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
    You are an AI assistant that analyzes relationship data and provides follow-up recommendations.
    Calculate a follow-up score between 0 and 1, where:
    - 0 means no immediate follow-up needed
    - 1 means urgent follow-up needed today
    
    Previous Follow-Up Score:
    - Use the current follow-up score as a starting point. Imagine this score has "interia" and doesn't change much on a day to day basis, unless one of the below guidelines suggest a change. 

    Group based guidelines:
    - If the person is in the inner 5 groups, then follow up should happen every couple of weeks.
    - If the person is in the Critical 50 group, then follow up should happen roughly every month.
    - If the person is in the Strategic 100 group, then follow up should happen roughly every 3 months.
    - For other groups, follow up should happen on a quarterly basis unless specific interactions suggest otherwise.

    Individual based guidelines:
    - If I've recently connected with the person, then follow up can be lower or even 0 so that I know that "I'm on top of things" and that I'm good with that person for right now. 
    - If the person is a close friend, then follow up should happen every couple of weeks.
    - If the person is a new contact, then follow up should be higher weighted to today to build relationsihp momentum.
    - If I've known the person for a long time, then follow up should be lower weighted to today to build relationsihp momentum.

    
    Personal Preferences:
    - If the person is a strategic contact that matches my goals, then I want to prioritize building a relationship with them and follow up more frequently.

    Event based guidelines:
    - If there is an event that is suggested to be happening soon, then follow up should be higher weighted to today to build relationsihp momentum. This could include things such as children's birthdays, anniversaries, concerts, etc... anything that is temporal or time sensitive.

    Interactions:
    - Make sure to read the contents of the recent interactions and look for notes that suggest communication took place and the interaction isn't just a note.
    - If the interaction is just a note, even if it was a recent note, then that specific interaction does not affect the score.
    - If the interactions suggest a recent follow up took place, then the score can lower. 
    - If the interaction was very recent, such as today, then the score can basically be 0.

    Return your response as a JSON object with:
    - score: number between 0-1
    - reason: brief explanation for the score
  `
});

const buildUserPrompt = ({ person, interactions, groups }: TGenerateFollowUpScoreParams) => ({
  prompt: stripIndents`
    Person Information:
    - Name: ${person.first_name} ${person.last_name}
    - Current Follow-Up Score: ${person.follow_up_score || 'No score available'}
    - Groups: ${groups.map((g) => g.name).join(', ')}
    - Today's Date: ${new Date().toISOString()}
    - Last Interaction: ${interactions[0]?.created_at || 'Never'}
    - AI Summary: ${person.ai_summary || 'No summary available'}
    
    Recent Interactions:
    ${interactions.map((i) => `- ${i.created_at}: ${i.type} - ${i.note}`).join('\n')}
  `
});
