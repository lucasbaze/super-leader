import { config } from 'dotenv';

import { mockHandleEventTrigger } from './utils/event-mock';

// Load test environment variables
if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' });
}

// Mock handleEvent.trigger globally
jest.mock('@/trigger/handle-event', () => ({
  handleEvent: {
    trigger: mockHandleEventTrigger
  }
}));

beforeAll(() => {
  if (process.env.NODE_ENV !== 'test') {
    return;
  }

  // Verify required environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
});
