import { NextRequest } from 'next/server';

import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { stripIndent } from 'common-tags';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { $system } from '@/lib/llm/messages';
import { ErrorType } from '@/types/errors';
import { createClient } from '@/utils/supabase/server';

// System prompt for onboarding chat
const buildSystemPrompt = (
  userContext: string
) => stripIndent`YCreating a "Share, Value-Add, & Ask" Statement

When provided with a summary of a person's personal and professional background, goals, values or beliefs, strengths and successes, challenges, and ecosystems they participate in, generate a "Share, Value-Add, & Ask" statement tailored specifically to build genuine connections and meaningful relationships.

Your response must have three clearly structured parts:

1. Share

Begin with a warm and genuine introduction about the person, capturing their personal essence, passions, and human side. This should go beyond professional accomplishments and include insights into their family, hobbies, interests, or community involvement.

Include an intriguing, authentic, and concise summary of what they do professionally, illustrating passion or a noteworthy element of their work or mission. The tone should educate and intrigue, never self-promote overtly.

Example:

"I love spending weekends hiking with my family, exploring national parks, and volunteering at local shelters for animals. Professionally, I'm passionate about helping startups in clean tech—recently, our team supported a project that provided solar energy solutions to off-grid communities in Sub-Saharan Africa."

2. Value-Add

Clearly articulate a specific, practical way this person could immediately add value to others based on their unique strengths, experience, network, or knowledge. The value-add must reflect an understanding of the recipient's professional or personal interests and needs, positioning the giver as thoughtful, helpful, and genuinely interested in building relationships.

Example:

"I'd be glad to introduce you to a network of impact investors I work with, who are actively looking to support clean energy initiatives like yours."

"I love discussing XYZ, and given your unique challenges, I would be glad to introduce you to someone in my network who specializes in this area."

3. Ask

Craft a thoughtful, clear, and appropriate "ask" that matches the person's current goals and the nature of their relationship with the other person. The ask should be specific enough that the recipient knows precisely how to help, relevant to the ecosystem or context they're in, and calibrated to the level of the current relationship (e.g., a request for advice, an introduction, or insight—not a direct transaction).

Example:

"As I continue to expand our training business internationally, particularly in Southeast Asia, I'd greatly appreciate any insights or connections with experts familiar with regulatory environments in the education sector there. Do you know anyone who might have experience or could offer advice on this?"

Output Structure:

Provide your response strictly using the following clear structure:

Share: (A concise, authentic personal & professional introduction)

Value-Add: (What specific value they can immediately offer, tailored to the recipient)

Ask: (A clear, appropriate, and specific request tailored to the recipient’s expertise, context, and level of relationship)

Ensure each element aligns with the provided background and the principles outlined above.

## Current Context / Memory About the User
${JSON.stringify(userContext, null, 2)}

`;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const authResult = await validateAuthentication(supabase);

  if (authResult.error || !authResult.data) {
    return apiResponse.unauthorized(toError(authResult.error));
  }

  // Parse request body
  let body;
  try {
    body = await req.json();
  } catch (error) {
    return apiResponse.badRequest('Invalid request body');
  }

  const { messages } = body;

  if (!Array.isArray(messages)) {
    return apiResponse.badRequest('Messages must be an array');
  }

  const { data: memory } = await supabase
    .from('user_context')
    .select('content')
    .eq('user_id', authResult.data!.id);

  const systemPrompt = buildSystemPrompt(
    memory?.reduce((acc, curr) => `${acc}\n${curr.content}`, '') || ''
  );

  // Create full message array with system prompt
  const fullMessages = [$system(systemPrompt), ...messages];

  // Call the AI service
  try {
    const result = streamText({
      model: openai('gpt-4o'),
      messages: fullMessages,
      onError: ({ error }) => {
        console.error(error);
      }
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error calling AI service:', error);
    return apiResponse.error({
      name: 'AIServiceError',
      type: ErrorType.API_ERROR,
      message: 'Failed to process the chat request',
      displayMessage: 'Sorry, we encountered an issue with our AI service. Please try again.'
    });
  }
}
