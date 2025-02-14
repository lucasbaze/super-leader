import { NextRequest } from 'next/server';

import { openai } from '@ai-sdk/openai';
import { Message, streamText } from 'ai';
import { z } from 'zod';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { MESSAGE_TYPE } from '@/lib/messages/constants';
import { CHAT_TOOLS } from '@/lib/tools/chat-tools';
import { createMessage } from '@/services/messages/create-message';
import { createClient } from '@/utils/supabase/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Define the request body interface
interface ChatRequestBody {
  messages: Message[];
  personId?: string;
  personName?: string;
  groupId?: string;
  type?: (typeof MESSAGE_TYPE)[keyof typeof MESSAGE_TYPE];
}

// Define possible message data types
type ChatMessageData = {
  personId: string | null;
  personName?: string;
  contentUrl?: string;
  contentTitle?: string;
};

const getDataFromMessage = (message: Message): ChatMessageData | null => {
  if (message.data && typeof message.data === 'object') {
    return message.data as ChatMessageData;
  }
  return null;
};

// Helper function to handle tool errors
function handleToolError(error: unknown, context: string) {
  // Return a user-friendly message that the AI can use
  console.error('handleToolError:', error);
  return {
    error: true,
    message: `Hmm... I encountered an issue while trying to ${context}. You can try again or contact support if the issue persists.`,
    details: JSON.stringify(error)
  };
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const authResult = await validateAuthentication(supabase);

  if (authResult.error || !authResult.data) {
    return apiResponse.unauthorized(toError(authResult.error));
  }

  const { messages, personId, personName, groupId, type } = (await req.json()) as ChatRequestBody;

  const lastMessage = messages.slice(-1)[0];
  const messageData = getDataFromMessage(lastMessage);

  const systemPrompt = `You are an expert in relationship management and helping people connect and build deeper relationships. 
  
  ${personId || messageData?.personId ? ` The user is currently viewing the profile of ${personName || messageData?.personName} (ID: ${personId || messageData?.personId}). When creating interactions, use this person's ID and name by default unless explicitly specified otherwise. When asked to create suggestions default to making a tool call unless specified otherwise.` : ''}
  
  If an error occurs or a tool returns an error, acknowledge the error to the user and suggest alternative actions or ways to proceed.
  `;

  await createMessage({
    db: supabase,
    data: {
      message: lastMessage,
      type: type || MESSAGE_TYPE.PERSON,
      user_id: authResult.data.id,
      person_id: personId,
      group_id: groupId
    }
  });

  const contextualMessages: Message[] = [
    {
      id: 'system',
      role: 'system',
      content: systemPrompt
    },
    ...messages
  ];
  const result = streamText({
    model: openai('gpt-4-turbo'),
    messages: contextualMessages,
    onFinish: async (result) => {
      console.log('Chat Route: onFinish Messages:', result.response.messages);

      const lastMessage = result.response.messages[result.response.messages.length - 1];
      if (!lastMessage || lastMessage.role !== 'assistant') {
        return;
      }

      try {
        if (!authResult.data) {
          throw new Error('Failed to save message: User not found');
        }
        // Save the assistant's response
        await createMessage({
          db: supabase,
          data: {
            message: result.response.messages[result.response.messages.length - 1],
            type: type || MESSAGE_TYPE.PERSON, // TODO: Update to use the correct type
            user_id: authResult.data.id,
            person_id: personId,
            group_id: groupId
          }
        });
      } catch (error) {
        console.error('Chat Route: onFinish Error:', error);
      }
    },
    tools: {
      [CHAT_TOOLS.CREATE_PERSON]: {
        description: 'Create a new person record with an associated interaction note',
        parameters: z.object({
          first_name: z.string().describe("The person's first name"),
          last_name: z.string().optional().describe("The person's last name"),
          note: z.string().describe('Details about the person, the interaction or meeting'),
          date_met: z
            .string()
            .optional()
            .describe('Date when the person was met (ISO format) otherwise the current date today')
        })
      },
      [CHAT_TOOLS.CREATE_INTERACTION]: {
        description: 'Create a new interaction record for a person',
        parameters: z.object({
          person_id: z.string().describe('The ID of the person the interaction is for'),
          type: z
            .string()
            .describe('The type of interaction such as phone call, email, meeting, etc.'),
          note: z.string().describe('Details about the interaction'),
          person_name: z.string().describe('The name of the person for display purposes')
        })
      },
      // TODO: Update to getPersonContentSuggestions
      [CHAT_TOOLS.GET_PERSON_SUGGESTIONS]: {
        description: 'Get content suggestions for the person suggested by the user',
        parameters: z.object({
          person_id: z.string().describe('The ID of the person the suggestions are for'),
          type: z.string().describe('Either "content" or "gift"')
        }),
        execute: async ({ type }) => {
          // TODO: Move this back to the server
          try {
            console.log('Fetching suggestions for person:', messageData?.personId);
            console.log('Generated Suggestion Type:', type);

            // TODO: Move to use-suggestions hook
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
            const response = await fetch(`${baseUrl}/api/suggestions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                personId: personId || messageData?.personId,
                type: type || 'content'
              })
            });

            if (!response.ok) {
              const errorData = await response.json();
              console.error('Suggestions API error:', errorData);
              return handleToolError(errorData, 'fetch content suggestions');
            }

            const json = await response.json();
            console.log('Suggestions API response:', json);
            return json.data;
          } catch (error) {
            console.error('Suggestions API error: Error catcher:', error);
            return handleToolError(error, 'fetch content suggestions');
          }
        }
      },
      [CHAT_TOOLS.CREATE_MESSAGE_SUGGESTIONS]: {
        description:
          "Create suggested messages for the person selected based on the article and the user's relationship with the person",
        parameters: z.object({
          content: z.string().describe('The article to get suggestions for'),
          person_id: z.string().describe('The ID of the person the suggestions are for')
        }),
        execute: async ({ content, person_id }) => {
          console.log('Creating message suggestions from article for user:', content, person_id);
          console.log('Message Data:', messageData);
          try {
            console.log('Fetching suggestions for person:', person_id);

            // TODO: Move to use-suggestions hook
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
            const response = await fetch(`${baseUrl}/api/suggestions/messages`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                personId: person_id,
                // TODO: Type these properly
                contentUrl: messageData?.contentUrl,
                contentTitle: messageData?.contentTitle
              })
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to fetch message suggestions');
            }

            const json = await response.json();
            console.log('Message Suggestions API response:', json);
            return json.data;
          } catch (error) {
            return handleToolError(error, 'create message suggestions');
          }
        }
      }
    }
  });

  return result.toDataStreamResponse();
}
