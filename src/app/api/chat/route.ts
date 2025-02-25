import { NextRequest } from 'next/server';

import { openai } from '@ai-sdk/openai';
import { Message, streamText } from 'ai';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { ChatTools, getAllRulesForAI } from '@/lib/chat/chat-tools';
import { toError } from '@/lib/errors';
import { MESSAGE_TYPE } from '@/lib/messages/constants';
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

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const authResult = await validateAuthentication(supabase);

  if (authResult.error || !authResult.data) {
    return apiResponse.unauthorized(toError(authResult.error));
  }

  const { messages, personId, personName } = (await req.json()) as ChatRequestBody;

  const lastMessage = messages.slice(-1)[0];
  // This will need to update to include the context that may be passed in on a message by message basis...
  const messageData = getDataFromMessage(lastMessage);

  const systemPrompt = `You are an expert in relationship management and helping people connect and build deeper relationships. You are also a friendly contact manager asisstant with  responsibilities revolving around general contact management, such as, but not limited to, creating new contacts, updating existing contacts, and searching for contacts.
  
  **Available Tools & Guidelines**
  ${getAllRulesForAI()}
  
  ${personId || messageData?.personId ? ` The user is currently viewing the profile of ${personName || messageData?.personName} (ID: ${personId || messageData?.personId}). When creating interactions, use this person's ID and name by default unless explicitly specified otherwise. When asked to create suggestions default to making a tool call unless specified otherwise.` : ''}
  
  If an error occurs or a tool returns an error, acknowledge the error to the user and suggest alternative actions or ways to proceed.

   ** General Rules
  - If you are given a person's ID, you do not need to search for a person, just use that ID to perform the action.
  `;

  console.log('System Prompt:', systemPrompt);

  const contextualMessages: Message[] = [
    {
      id: 'system',
      role: 'system',
      content: systemPrompt
    },
    ...messages
  ];
  const result = streamText({
    model: openai('gpt-4o'),
    messages: contextualMessages,
    maxSteps: 10,
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
            execute: async (params: any) =>
              tool.execute?.(supabase, params, { userId: authResult.data!.id })
          })
        };
      }
      return acc;
    }, {}),
    onStepFinish: (step) => {
      console.log('Step:', JSON.stringify(step, null, 2));
    },
    onFinish: (result) => {
      console.log('Result:', JSON.stringify(result, null, 2));
    },
    // TODO: test this out... can I "stream" the tool call results?
    toolCallStreaming: true
  });

  return result.toDataStreamResponse();
}
