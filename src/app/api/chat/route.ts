import { openai } from '@ai-sdk/openai';
import { createClient } from '@supabase/supabase-js';

import { streamText } from 'ai';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4-turbo'),
    messages,
    tools: {
      createPerson: {
        description: 'Create a new person record with an associated interaction note',
        parameters: z.object({
          first_name: z.string(),
          last_name: z.string().optional(),
          note: z.string(),
          date_met: z.string().optional()
        })
      }
    }
  });

  return result.toDataStreamResponse();
}
