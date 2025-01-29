// https://www.npmjs.com/package/openai-edge
// https://docs.perplexity.ai/guides/getting-started
import { Configuration, OpenAIApi } from 'openai-edge';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// Define the structure for a single suggestion
interface Suggestion {
  imageUrl: string;
  citationUrl: string;
  title: string;
  reason: string;
}

// Define the response structure
interface SuggestionsResponse {
  suggestions: Suggestion[];
}

// Define the suggestion schema with Zod
const SuggestionSchema = z.object({
  imageUrl: z.string(),
  citationUrl: z.string(),
  title: z.string(),
  reason: z.string()
});

const jsonSchema = zodToJsonSchema(SuggestionSchema);

export async function POST(req: Request) {
  try {
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert at match making and know exactly what to share with a person that would interest them. Each suggestion should include an image URL, citation URL, title, and reason for the suggestion.'
          },
          {
            role: 'user',
            content:
              'My friend loves Bitcoin, AI, and city planning. We have known each other for 10 years. We started a startup together. He owns an AI development company in Austin, TX. What can I share with them?'
          }
        ],
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
    };

    const response = await fetch('https://api.perplexity.ai/chat/completions', options);
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: {
        'content-type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'content-type': 'application/json'
      }
    });
  }
}
