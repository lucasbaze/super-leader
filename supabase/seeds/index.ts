import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

import { randomString } from '@/lib/utils';
import { buildNewOnboardingObject } from '@/services/user/build-new-onboarding';

import { seedGroups } from './groups';
import { seedPeople } from './people';
import { seedTaskSuggestions } from './task-suggestions';

// Load environment variables
config({ path: resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  try {
    // Clean existing data
    // await supabase.from('messages').delete().neq('id', '');
    // await supabase.from('group_member').delete().neq('id', '');
    // await supabase.from('group').delete().neq('id', '');
    // await supabase.from('task_suggestion').delete().neq('id', '');
    // await supabase.from('person').delete().neq('id', '');
    // await supabase.from('addresses').delete().neq('id', '');
    // await supabase.from('contact_methods').delete().neq('id', '');
    // await supabase.from('websites').delete().neq('id', '');

    // Create a test user
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
      email: `test-${randomString()}@example.com`,
      password: 'password123',
      email_confirm: true
    });

    if (userError) throw userError;
    if (!user.user) throw new Error('Failed to create user');

    const userId = user.user.id;
    console.log('Created test user with ID:', userId);

    // Create user profile
    const { error: profileError } = await supabase.from('user_profile').insert({
      user_id: userId,
      first_name: 'Test',
      last_name: 'User',
      onboarding: buildNewOnboardingObject()
    });

    if (profileError) throw profileError;
    console.log('Created user profile');

    // Seed people and their related data
    await seedPeople({ supabase, userId });

    // Seed groups and group memberships
    await seedGroups({ supabase, userId });

    // Seed task suggestions
    await seedTaskSuggestions({ supabase, userId });

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

main();
