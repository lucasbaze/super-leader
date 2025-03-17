import { NextRequest } from 'next/server';

import { openai } from '@ai-sdk/openai';
import { streamObject, streamText } from 'ai';
import { stripIndent } from 'common-tags';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { ChatTools, getAllRulesForAI } from '@/lib/chat/onboarding-chat-tools';
import { createUserContextTool } from '@/lib/chat/tools/create-user-context';
import { toError } from '@/lib/errors';
import { $system, $user } from '@/lib/llm/messages';
import { onboardingStepsQuestionsAndCriteria } from '@/lib/onboarding/onboarding-steps';
import { ErrorType } from '@/types/errors';
import { createClient } from '@/utils/supabase/server';
import { chat } from '@/vendors/open-router';

// System prompt for onboarding chat
const systemPrompt = stripIndent`You are a relationship-building expert guiding a new user through the onboarding process. Your goal is to help ask the user questions to build out their profile. The onboarding flow will culminate in creating a "Share Value Ask", a "Relationship Map", and a "Superleader Playbook". 

You are not responsible for creating any of the above, but you are responsible for asking the user questions to build out their profile that will eventually lead to the creation of the "Share Value Ask", "Relationship Map", and "Superleader Playbook".

## Current User Memory
{user_context}

## Current Onboarding Status
{onboarding_status}

Rules: 
- Be warm, encouraging, and personable throughout the conversation
- Ask one question at a time
- Wait for the user's response before asking the next question
- Acknowledge their answers positively before moving to the next question as if you are a human assistant genuinely interested in getting to know them.
- Use the createUserContext tool to save important information
- If the user is not sure about their answers, ask follow up questions to help them clarify their thoughts.
- If the user is giving brief answers, encourage them to open up and share more themselves, as it'll help you build a more complete profile and subsequently help them connect with their network on deeper levels.
- Be respectful of their time; keep the process focused and efficient

##Onboarding Steps, Questions, and Criteria**

You job is not to ask the questions verbatim, but be a conversationalist and in a natural way ask the user questions to build out their profile, determine what steps they have sufficiently addressed from their messages, and then ask follow up questions until all steps are completed.

${Object.entries(onboardingStepsQuestionsAndCriteria)
  .map(
    ([
      step,
      { label, generalOrder, conversationalQuestions, directQuestions, sufficientCriteria }
    ]) => `
  ### ${label}
    
  This section is generally ${generalOrder}th in the onboarding flow.

  You can use these conversational questions directly, but be creative and ask questions in a natural way that feels conversational.
  ${conversationalQuestions.map((question) => `- ${question}`).join('\n')}

  Use these direct questions as inspiration, but be creative and ask questions in a natural way that feels conversational and contextually appropriate.
  ${directQuestions.map((question) => `- ${question}`).join('\n')}

  Use the criteria below to determine if the user has sufficiently addressed the step.
  ${sufficientCriteria}

`
  )
  .join('\n')}


## Upon completion of all the steps

**Available Tools & Guidelines**
  ${getAllRulesForAI()}
`;

const simpleSystemPrompt = stripIndent`
  You are a relationship-building expert guiding a new user through the onboarding process. Your goal is to help ask the user questions to build out their profile. The onboarding flow will culminate in creating a "Share Value Ask", a "Relationship Map", and a "Superleader Playbook". 

  You are not responsible for creating any of the above, but you are responsible for asking the user questions to build out their profile that will eventually lead to the creation of the "Share Value Ask", "Relationship Map", and "Superleader Playbook".
`;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const authResult = await validateAuthentication(supabase);

  if (authResult.error || !authResult.data) {
    return apiResponse.unauthorized(toError(authResult.error));
  }

  // Fetch the user's onboarding status & context so far
  // Build the system prompt with the onboarding status & provided context so far?
  // Call the tools accordingly
  // Determine what step was completed or answered from the user.
  // Return the completedSteps and the next question to ask.

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

  // Create full message array with system prompt
  const fullMessages = [$system(systemPrompt), ...messages];

  console.log('fullMessages', fullMessages);

  // Call the AI service
  try {
    const result = streamText({
      model: openai('gpt-4o'),
      messages: fullMessages,
      maxSteps: 10,
      onError: ({ error }) => {
        console.error(error);
      },
      tools: ChatTools.list().reduce<
        Record<
          string,
          {
            description: string;
            parameters: unknown;
            execute?: (params: any) => Promise<unknown>;
          }
        >
      >((acc, toolName) => {
        const tool = ChatTools.get(toolName);
        if (tool) {
          acc[toolName] = {
            description: tool.description,
            parameters: tool.parameters,
            ...(tool.execute && {
              execute: async (params: any) => {
                console.log(`Executing tool: ${toolName} with params:`, params);
                try {
                  const response = await tool.execute?.(supabase, params, {
                    userId: authResult.data!.id
                  });
                  console.log(`Tool execution success: ${toolName} ->`, response);
                  return response;
                } catch (toolError) {
                  console.error(`Error executing tool: ${toolName}`, toolError);
                  throw toolError;
                }
              }
            })
          };
        }
        return acc;
      }, {})
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
