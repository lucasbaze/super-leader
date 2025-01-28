// import { OpenAIStream, StreamingTextResponse } from 'ai';
// import { Configuration, OpenAIApi } from 'openai-edge';
// const config = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY
// });
// const openai = new OpenAIApi(config);
// export async function POST(req: Request) {
//   const { messages } = await req.json();
//   const response = await openai.createChatCompletion({
//     model: 'gpt-4',
//     stream: true,
//     messages
//   });
//   const stream = OpenAIStream(response);
//   return new StreamingTextResponse(stream);
// }
import { openai } from '@ai-sdk/openai';

import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4-turbo'),
    system: 'You are a helpful assistant.',
    messages
  });

  return result.toDataStreamResponse();
}
