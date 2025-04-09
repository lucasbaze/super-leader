import dotenv from 'dotenv';
import path from 'path';

import { getContentSuggestionsForPerson } from '@/services/suggestions/get-content-suggestions';
import { createServiceRoleClient } from '@/utils/supabase/service-role';

// Load .env file from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Verify env variables are loaded
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Required environment variables are missing');
  process.exit(1);
}

const USER_ID = 'c86eb445-a7cd-44c1-a0e0-3dd661ebb526';

// Replace with your actual person ID
const PERSON_ID = '72c293d1-0656-4d22-96e3-b5e99a61baac';

async function main() {
  console.log('Starting content suggestions test script...');

  // Create Supabase client
  const supabase = await createServiceRoleClient();

  try {
    console.log(`Testing getContentSuggestionsForPerson with person ID: ${PERSON_ID}`);

    // Call the getContentSuggestionsForPerson function directly
    const result = await getContentSuggestionsForPerson({
      db: supabase,
      personId: PERSON_ID,
      userId: USER_ID,
      type: 'content'
    });

    if (result.error) {
      console.error('Error in getContentSuggestionsForPerson:', result.error);
    } else {
      console.log('getContentSuggestionsForPerson result:', JSON.stringify(result.data, null, 2));
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }

  console.log('Test script completed');
}

// Run the script
main().catch(console.error);
