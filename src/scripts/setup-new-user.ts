import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

import { setupNewUser } from '@/services/user/setup-new-user';
import { Database } from '@/types/database';

// Load .env file from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Verify env variables are loaded
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Required environment variables are missing');
  process.exit(1);
}

async function main(userId: string) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log(`Setting up groups for user ${userId}`);

  try {
    const result = await setupNewUser({ db: supabase, userId, firstName: 'New', lastName: 'User' });

    if (result.error) {
      throw result.error;
    }

    console.log('Created groups');
    return result;
  } catch (error) {
    console.error('Error setting up user:', error);
    throw error;
  }
}

// Get command line arguments
const args = process.argv.slice(2);
const userId = args[0];

if (!userId) {
  console.error('Please provide a user ID');
  process.exit(1);
}

main(userId)
  .then(() => {
    console.log('Setup complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
