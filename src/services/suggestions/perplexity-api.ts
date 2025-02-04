import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// Define the suggestion schema with Zod
const SuggestionSchema = z.object({
  contentUrl: z.string(),
  title: z.string(),
  reason: z.string()
});

const jsonSchema = zodToJsonSchema(SuggestionSchema);

interface PerplexityMessage {
  role: 'system' | 'user';
  content: string;
}

export async function callPerplexityAPI(messages: PerplexityMessage[]) {
  console.log('Calling Perplexity API with messages:', messages);
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'sonar',
      messages,
      response_format: {
        type: 'json_schema',
        json_schema: {
          schema: jsonSchema
        }
      },
      temperature: 0.2,
      top_p: 0.9,
      max_tokens: 1000,
      stream: false
    })
  });

  return response;
}
