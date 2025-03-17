import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

import { buildNewOnboardingObject } from '@/services/user/build-new-onboarding';
import { Database } from '@/types/database';

// Load .env file from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required environment variables:');
  if (!SUPABASE_URL) console.error('- NEXT_PUBLIC_SUPABASE_URL');
  if (!SUPABASE_SERVICE_KEY) console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function resetOnboarding() {
  try {
    const userId = process.argv[2];

    if (!userId) {
      console.error('Please provide a user ID as a command-line argument');
      console.log(
        'Usage: npx ts-node -P tsconfig.scripts.json src/scripts/reset-onboarding.ts <user_id>'
      );
      process.exit(1);
    }

    console.log(`Resetting onboarding status for user ${userId}...`);

    // Check if user exists
    const { data: userData, error: userError } = await supabase
      .from('user_profile')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (userError || !userData) {
      console.error(`User with ID ${userId} not found!`);
      process.exit(1);
    }

    // Reset onboarding status
    const { error: updateError } = await supabase
      .from('user_profile')
      .update({
        onboarding: buildNewOnboardingObject()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error resetting onboarding status:', updateError);
      process.exit(1);
    }

    const { data: updatedConversations, error: updatedConversationsError } = await supabase
      .from('conversations')
      .delete()
      .eq('user_id', userId);

    if (updatedConversationsError) {
      console.error('Error deleting conversations:', updatedConversationsError);
      process.exit(1);
    }

    console.log('Onboarding status reset successfully!');
    console.log('User can now access the onboarding flow again.');
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    process.exit(1);
  }
}

// Run the script
resetOnboarding();
