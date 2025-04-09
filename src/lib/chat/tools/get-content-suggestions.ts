import { stripIndents } from 'common-tags';
import { z } from 'zod';

import { getContentSuggestionsForPerson } from '@/services/suggestions/get-content-suggestions';

import { ChatTool } from '../chat-tool-registry';
import { handleToolError, ToolError } from '../utils';
import { CHAT_TOOLS } from './constants';

export const getContentSuggestionsTool: ChatTool<
  {
    personId: string;
    type?: 'content' | 'gift';
    requestedContent?: string;
  },
  Awaited<ReturnType<typeof getContentSuggestionsForPerson>>['data'] | ToolError
> = {
  name: CHAT_TOOLS.GET_CONTENT_SUGGESTIONS,
  displayName: 'Get Content Suggestions',
  description:
    'Get personalized content suggestions for a person that can be shared with the person based on their interests and personalized to them',
  rulesForAI: stripIndents`\
    ## getContentSuggestions Guidelines
    - Use getContentSuggestions to get personalized content suggestions for a person that
    - You can specify either 'content' or 'gift' as the type of suggestions
    - Only call this tool once per user message. Calling it multiple times will result in too many suggestions being generated.
    - You can tell the user that if they don't like the suggestion, they can share more details about the person and then we can generate new suggestions.
  `,
  parameters: z.object({
    personId: z.string().describe('The ID of the person to get suggestions for'),
    type: z.enum(['content', 'gift']).optional().describe('The type of suggestions to get'),
    requestedContent: z
      .string()
      .optional()
      .describe(
        'If the user specifcally asks for a topic or type of content to find, use this field, otherwise leave it empty'
      )
  }),
  execute: async (db, { personId, type, requestedContent }, { userId }) => {
    console.log('Getting content suggestions for person:', personId, type, requestedContent);

    try {
      const result = await getContentSuggestionsForPerson({
        db,
        personId,
        userId,
        type,
        requestedContent
      });

      if (result.error) {
        throw result.error;
      }

      return result.data;
    } catch (error) {
      console.error('Getting content suggestions error:', error);
      return handleToolError(error, 'get content suggestions');
    }
  },
  onSuccessEach: true,
  onSuccess: ({ queryClient, args }) => {
    if (args?.personId) {
      queryClient.invalidateQueries({
        queryKey: ['person', args.personId, 'suggestions']
      });
    }
  }
};
