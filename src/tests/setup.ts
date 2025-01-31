import { config } from 'dotenv';

// Load test environment variables
if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' });
}

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
