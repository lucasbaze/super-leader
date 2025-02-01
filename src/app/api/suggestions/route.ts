// https://www.npmjs.com/package/openai-edge
// https://docs.perplexity.ai/guides/getting-started
import { stripIndents } from 'common-tags';
import { Configuration, OpenAIApi } from 'openai-edge';
import { json } from 'stream/consumers';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// Define the structure for a single suggestion
interface Suggestion {
  contentUrl: string;
  title: string;
  reason: string;
}

// Define the response structure
interface SuggestionsResponse {
  suggestions: Suggestion[];
}

// Define the suggestion schema with Zod
const SuggestionSchema = z.object({
  contentUrl: z.string(),
  title: z.string(),
  reason: z.string()
});

// const JordanSchema = z.object({
//   first_name: z.string(),
//   last_name: z.string(),
//   year_of_birth: z.number(),
//   num_seasons_in_nba: z.number()
// });

const jsonSchema = zodToJsonSchema(SuggestionSchema);
// const jordanJsonSchema = zodToJsonSchema(JordanSchema);

export async function POST(req: Request) {
  try {
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          // { role: 'system', content: 'Be precise and concise.' },
          // {
          //   role: 'user',
          //   content:
          //     'Tell me about Scottie Pippen. Please output a JSON object containing the following fields: first_name, last_name, year_of_birth, num_seasons_in_nba.'
          // }
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: kendallUserPrompt
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

    console.log('Fetching with Options:', options);
    // const response = await fetch('https://api.perplexity.ai/chat/completions', options);
    // const data = await response.json();

    // console.log('Data:', data);

    // const contentString = data.choices[0].message.content;
    // console.log('Content String:', contentString);

    // let parsedJson;
    const parsedJson = null;
    // const jsonMatch = contentString.match(/```json\s*([\s\S]*?)\s*```/);
    // if (jsonMatch && jsonMatch[1]) {
    //   parsedJson = JSON.parse(jsonMatch[1]);
    // } else {
    //   parsedJson = null;
    // }
    // console.log(parsedJson);

    // const content = message.content.replace(/```json\n/, '').replace(/\n```/, '');
    // const content = contentString.replace(/```json\n/, '').replace(/\n```/, '');
    // const parsedContent = JSON.parse(content);

    // Validate the parsed data against our schema
    // const validatedData = JordanSchema.parse(parsedContent);

    return new Response(JSON.stringify(parsedJson), {
      headers: {
        'content-type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error:', error);

    // Provide more specific error messages
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    
return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: {
        'content-type': 'application/json'
      }
    });
  }
}

const systemPrompt = stripIndents`
  You are an AI-powered content recommendation assistant that helps curate high-quality, engaging, and contextually relevant content based on my relationship with another person. Your goal is to suggest articles, videos, events, or memes that would be of genuine interest to the other person and would make sense coming from me.

  Guidelines for Content Selection:
  - Personal Relevance – The content should align with the recipient’s interests, profession, personal background, or recent conversations based on the relationship context provided.
  
  - High-Quality Sources – Prioritize credible, thought-provoking, and high-value content. Avoid low-quality, clickbait, or spammy sources.
  
  - Format Diversity – The suggestion can be an article, YouTube video, event, or meme, depending on what is most fitting.
  
  - Natural Fit – The content should be something that feels organic and authentic for me to share. It should not feel forced or random.
  
  - Default Content – If no highly relevant content is available, suggest something that is generally interesting, engaging, or insightful from recent news, cutting-edge research, or unique perspectives.

  Input Format (Relationship Context):
  
  - I will provide relationship notes, messages, emails, or other relevant context about my interactions with this person.

  Output Format:
  - Return up to 3 highly relevant pieces of content in JSON format, structured as follows:

  \`\`\`json
  [
    {
      "contentURL": "https://example.com/article",
      "title": "The Future of AI and Human Collaboration",
      "reason": "This article discusses the intersection of AI and human expertise, which aligns with [Person's Name]'s recent work in automation."
    },
    {
      "contentURL": "https://www.youtube.com/watch?v=xyz123",
      "title": "Inside the Mind of a Venture Capitalist",
      "reason": "[Person's Name] mentioned an interest in venture funding. This interview offers deep insights into the thought process of top investors."
    },
    {
      "contentURL": "https://twitter.com/somefunnytweet",
      "title": "Hilarious Meme About Startup Life",
      "reason": "[Person's Name] has a great sense of humor about startups. This meme is a perfect lighthearted share."
    }
  ]
  \`\`\`

  Additional Notes:
  - Ensure content is timely, engaging, and useful to the recipient.
  - Default to cool, cutting-edge, or high-quality general content if no perfect match exists.
  - Only return content worth sharing—if nothing meets the standard, return fewer than 3 results.
`;

const localBasedSystemPrompt = stripIndents`
 You are an AI-powered content recommendation assistant that curates high-quality, location-based events, activities, news, and opportunities that align with a person's stage of life and interests. Your goal is to suggest hyper-relevant content based on the recipient’s location and life context, ensuring they receive fresh, interesting, and timely recommendations.

  Guidelines for Content Selection:
  1. Location-Centric – The recommendations should be highly specific to the recipient’s city, state, or broader region, depending on the level of detail provided.

  - If an exact city is provided (e.g., Austin, TX), suggest local events, restaurants, activities, or community happenings.
  -  If only a state is known (e.g., Texas), suggest statewide news, events, or trends.
  - If only a general region is known (e.g., Pacific Northwest), suggest broader regional insights.

  2. Stage of Life & Interests – Tailor content based on what is relevant to their age, lifestyle, and preferences:

  - Young professionals → Nightlife, networking events, startup news, music festivals.
  - Families → Kid-friendly activities, community events, local schools, homeownership trends.
  - Retirees/Elderly → Cultural events, health & wellness opportunities, financial tips for retirement.

  3. Content Diversity – Provide a mix of events, activities, local news, legislation, and unique happenings to keep recommendations engaging.

  - Events & Activities (Concerts, art shows, food festivals, meetups)
  - Local News (Major business developments, policy changes, interesting headlines)
  - Legislative Updates (New laws, tax changes, city planning decisions)
  - Community Highlights (Interesting people, local businesses, new openings)
  
  4. Freshness & Variety – Avoid repetitive recommendations. Prioritize new content each time, ensuring the recipient always gets timely and relevant suggestions.

  5. Avoid Repetition & Prior Suggestions – Each response should contain new, fresh recommendations. I will provide a list of previously suggested results, and you must ensure that none of the new recommendations overlap with past ones.

  Input Format (Relationship Context):
  I will provide:

  - Person's name (optional)
  - Known location (city, state, or region)
  - Stage of life (e.g., young professional, parent, retiree, etc.)
  - Any additional context on their interests, recent conversations, or preferences
  - List of previously suggested results (including URLs, titles, or general themes to avoid repetition)

  Output Format:
  - Return up to 3 fresh, highly relevant location-based suggestions in JSON format:

  \`\`\`json
  [
    {
      "contentURL": "https://example.com/event",
      "title": "Austin Startup Happy Hour - Meet Founders & Investors",
      "reason": "[Person's Name] is in Austin and interested in networking. This exclusive startup event is a great opportunity to meet other entrepreneurs."
    },
    {
      "contentURL": "https://example.com/music-festival",
      "title": "ACL Music Festival Lineup Announced!",
      "reason": "[Person's Name] enjoys live music and is based in Texas. This event is one of the biggest music festivals in Austin."
    },
    {
      "contentURL": "https://example.com/legislation",
      "title": "Texas Legislature Approves New Small Business Tax Incentives",
      "reason": "[Person's Name] runs a business in Texas. This new tax policy might be relevant to them."
    }
  ]
  \`\`\`

  Additional Notes:
  - Prioritize highly relevant and unique suggestions—if no strong match is available, provide engaging general interest location-based content.
  - Ensure recommendations are timely and fresh, avoiding redundancy in repeated requests.
  - If multiple location matches exist, prioritize the most specific location first.
  - No Repeated Content – Cross-check against previously provided suggestions and ensure all new recommendations are distinct.
  - Prioritize the Most Recent & Relevant Information – Focus on events and news that are currently happening or upcoming.
  - Adjust to Broader or More Specific Content If Needed – If city-level content is unavailable, provide relevant state or regional alternatives.
`;

const kendallUserPrompt = `Kendall is a 26 year old living with me in Houston Texas. She is my wife. We have 4 cats. She is learning to write a fiction novel. She LOVES Baldur's Gate 3 the video game. She's been obsssed with it lately. She's an avoid cook and baker. She has done psychedelics and read science oriented books like Michale Pollen books. We are actively learning to dance the east coast swing. We have traveled together to Brazil, Canada, Switzerland, England, and Germany.`;

const michaelBashourPrompt = '';

const brunoPrompt = `Bruno is 30 years old living in Brazil with his 2 cats and his wife name Kat. She was `;

const cameronUserPrompt = `My friend loves Bitcoin, AI, and city planning. We have known each other for 10 years. We started a startup together. He owns an AI development company in Austin, TX. He is 26 years old living just outside of downtown Austin, but very close and metropolitan area. He likes beer and bars and finding new places to go. What can I share with him? You had previously suggested the following: https://www.austinchamber.com/events, https://www.austintexas.gov/department/smart-cities-initiative, https://www.austinfoodandwinefestival.com/. https://events.coinpedia.org/bitcoin-austin-2025-5991/, https://www.meetup.com/austin-bitcoin-developers/events/nlvngtyhcfbbc/, https://www.dallasnews.com/business/technology/2024/11/19/4b-bitcoin-to-ai-data-center-project-eyed-in-denton-texas/  Do not suggest any of these again.`;
