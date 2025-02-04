import { openai } from '@ai-sdk/openai';
import { JSONValue, Message, streamText } from 'ai';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const getDataFromMessage = (message: Message): JSONValue => {
  if (message.data) {
    return message.data;
  }
  return null;
};

export async function POST(req: Request) {
  const { messages, personId, personName } = await req.json();
  console.log('Chat Route: Messages: ', messages);

  const lastMessage = messages.slice(-1)[0];
  const messageData = getDataFromMessage(lastMessage);

  const systemPrompt = `You are an expert in relationship management and helping people connect and build deeper relationships. 
  
  ${personId ? ` The user is currently viewing the profile of ${personName} (ID: ${personId}). When creating interactions, use this person's ID and name by default unless explicitly specified otherwise.` : ''}
  
  `;

  const contextualMessages = [
    {
      role: 'system',
      content: systemPrompt
    },
    ...messages
  ];

  const result = streamText({
    model: openai('gpt-4-turbo'),
    messages: contextualMessages,
    tools: {
      createPerson: {
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
      createInteraction: {
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
      getPersonSuggestions: {
        description: 'Get Suggestions for the person suggested by the user',
        parameters: z.object({
          person_id: z.string().describe('The ID of the person the suggestions are for')
          // TODO: Add message body here & pass to the suggestions request, i.e. extend with gifts, etc..
        }),
        execute: async ({ person_id }) => {
          // TODO: Move this back to the server
          try {
            console.log('Fetching suggestions for person:', person_id);

            // TODO: Move to use-suggestions hook
            const response = await fetch(`/api/suggestions`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ personId: person_id })
            });

            if (!response.ok) {
              const errorData = await response.json();
              console.error('Suggestions API error:', errorData);
              throw new Error(errorData.error || 'Failed to fetch suggestions');
            }

            const json = await response.json();
            console.log('Suggestions API response:', json);
            return json.data;
          } catch (error) {
            console.error('Error fetching suggestions:', error);
            throw error;
          }
        }
      },
      createMessageSuggestionsFromArticleForUser: {
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
            const response = await fetch(`/api/suggestions/messages`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                personId: person_id,
                // TODO: Type these properly
                // @ts-ignore
                contentUrl: messageData?.contentUrl,
                // @ts-ignore
                contentTitle: messageData?.contentTitle
              })
            });

            if (!response.ok) {
              const errorData = await response.json();
              console.error('Suggestions API error:', errorData);
              throw new Error(errorData.error || 'Failed to fetch suggestions');
            }

            const json = await response.json();
            console.log('Message Suggestions API response:', json);
            return json.data;
          } catch (error) {
            console.error('Error fetching suggestions:', error);
            throw error;
          }
        }
      }
    }
  });

  return result.toDataStreamResponse();
}
