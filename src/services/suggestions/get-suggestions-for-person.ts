// https://www.npmjs.com/package/openai-edge
// https://docs.perplexity.ai/guides/getting-started
import { stripIndents } from 'common-tags';

import { createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { getPerson, GetPersonResult } from '@/services/people/get-person';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';

import { callPerplexityAPI } from './perplexity-api';

// Define the types
export interface TSuggestion {
  contentUrl: string;
  title: string;
  reason: string;
}

// Service params interface
export interface TGetSuggestionsForPersonParams {
  db: DBClient;
  personId: string;
}

// Define errors
export const ERRORS = {
  SUGGESTIONS: {
    FETCH_ERROR: createError(
      'suggestions_fetch_error',
      ErrorType.API_ERROR,
      'Failed to fetch suggestions',
      'Unable to generate suggestions at this time'
    ),
    PERSON_REQUIRED: createError(
      'person_required',
      ErrorType.VALIDATION_ERROR,
      'Person ID is required',
      'Please provide a person to get suggestions for'
    ),
    AI_SERVICE_ERROR: createError(
      'ai_service_error',
      ErrorType.API_ERROR,
      'AI service failed to generate suggestions',
      'Unable to generate suggestions at this time'
    )
  }
};

export async function getSuggestionsForPerson({
  db,
  personId
}: TGetSuggestionsForPersonParams): Promise<TServiceResponse<TSuggestion[]>> {
  try {
    if (!personId) {
      return { data: null, error: ERRORS.SUGGESTIONS.PERSON_REQUIRED };
    }

    // Get person data
    const personResult = await getPerson({
      db,
      personId,
      withInteractions: true
    });

    if (personResult.error) {
      return { data: null, error: personResult.error };
    }

    const userPersonPrompt = createUserPersonPrompt({ person: personResult.data });

    // Call AI service with prompts
    const response = await callPerplexityAPI([
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userPersonPrompt
      }
    ]);

    if (!response.ok) {
      const error = { ...ERRORS.SUGGESTIONS.AI_SERVICE_ERROR, details: await response.json() };
      errorLogger.log(error);
      return { data: null, error };
    }

    const data = await response.json();
    const contentString = data.choices[0].message.content;
    let suggestions: TSuggestion[] = [];

    try {
      const jsonMatch = contentString.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        suggestions = JSON.parse(jsonMatch[1]);
      }
      return { data: suggestions, error: null };
    } catch (error) {
      const serviceError = {
        ...ERRORS.SUGGESTIONS.FETCH_ERROR,
        details: error
      };
      errorLogger.log(serviceError);
      return { data: null, error: serviceError };
    }
  } catch (error) {
    const serviceError = {
      ...ERRORS.SUGGESTIONS.FETCH_ERROR,
      details: error
    };
    errorLogger.log(serviceError);
    return { data: null, error: serviceError };
  }
}

// Helper function to create the prompt
interface UserPersonPrompt {
  person: GetPersonResult | null;
}

const createUserPersonPrompt = ({ person }: UserPersonPrompt) =>
  person
    ? stripIndents`
    Person: ${person.person.first_name}
    Interactions: ${person.interactions?.map((interaction) => interaction.note).join(', ')}
  `
    : defaultUserPersonPrompt;

// Constants moved to bottom of file
const defaultUserPersonPrompt = `I do not know much about this person, so provide general content that is interesting to a wide audience.`;

const systemPrompt = stripIndents`
  You are an AI-powered content recommendation assistant that helps curate high-quality, engaging, and contextually relevant content based on my relationship with another person. Your goal is to suggest articles, videos, events, or memes that would be of genuine interest to the other person and would make sense coming from me.

  ALWAYS RETURN JSON CONTENT AS DEFINED IN THE OUTPUT FORMAT. NEVER RETURN AN EMPTY ARRAY.

  Guidelines for Content Selection:
  - Personal Relevance – The content should align with the recipient's interests, profession, personal background, or recent conversations based on the relationship context provided.
  
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
 You are an AI-powered content recommendation assistant that curates high-quality, location-based events, activities, news, and opportunities that align with a person's stage of life and interests. Your goal is to suggest hyper-relevant content based on the recipient's location and life context, ensuring they receive fresh, interesting, and timely recommendations.

  Guidelines for Content Selection:
  1. Location-Centric – The recommendations should be highly specific to the recipient's city, state, or broader region, depending on the level of detail provided.

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
